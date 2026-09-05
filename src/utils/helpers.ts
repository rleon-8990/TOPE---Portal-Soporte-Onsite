import { jsPDF } from 'jspdf';
import { TechnicalReport } from '../types';

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function playNotificationChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // Audio Context handled gracefully
  }
}

export function generatePdfFromReport(report: TechnicalReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Primary Header Banner
  doc.setFillColor(0, 35, 111); // #00236f
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HIPERMERCADOS TOTTUS S.A. - PORTAL SOPORTE ONSITE', 14, 15);
  doc.setFontSize(9.5);
  doc.text('Sistemas de la Información | Informe Técnico de Mantenimiento', 14, 21);

  const repDate = report.date || report.dateGenerated || new Date().toISOString().split('T')[0];
  const techName = report.technician || report.technicianName || 'Ing. Especialista CMMS';
  const supName = report.supervisor || report.storeRepresentativeName || 'Ing. Supervisor Nacional';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° INFORME: ${report.reportNumber} | FECHA: ${repDate} | TIENDA: ${report.storeCode || report.storeId}`, 14, 25);
  doc.text(`ESTADO: ${report.outcome || report.status || 'APROBADO'} | SEDE: ${report.storeName} (${report.region})`, 14, 31);

  // Store Information Box
  doc.setFillColor(243, 244, 254);
  doc.roundedRect(14, 42, 182, 28, 2, 2, 'F');
  doc.setDrawColor(200, 210, 240);
  doc.roundedRect(14, 42, 182, 28, 2, 2, 'S');

  doc.setTextColor(0, 35, 111);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA SUCURSAL Y UBICACIÓN', 18, 48);

  doc.setTextColor(50, 50, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tienda: ${report.storeName} (${report.storeCode || report.storeId})`, 18, 54);
  doc.text(`Dirección: ${report.storeAddress || 'Av. Principal #100 - Retail Sede'}`, 18, 60);
  doc.text(`Región: ${report.region}`, 18, 66);
  doc.text(`Técnico Responsable: ${techName}`, 110, 54);
  doc.text(`Supervisor / Visto Bueno: ${supName}`, 110, 60);
  doc.text(`Resultado: ${report.outcome || 'Aprobado'}`, 110, 66);

  let currentY = 78;

  // Equipment List Section
  doc.setTextColor(0, 35, 111);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPO(S) INSPECCIONADO(S) Y PARÁMETROS TÉCNICOS', 14, currentY);

  currentY += 5;

  // Table header
  doc.setFillColor(30, 58, 138);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO', 16, currentY + 4.8);
  doc.text('EQUIPO / MARCA / MODELO', 44, currentY + 4.8);
  doc.text('N° SERIE', 110, currentY + 4.8);
  doc.text('ESTADO ANTERIOR', 142, currentY + 4.8);
  doc.text('RESULTADO', 176, currentY + 4.8);

  currentY += 7;

  if (report.equipmentItems && report.equipmentItems.length > 0) {
    report.equipmentItems.forEach((eq, index) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 255);
      doc.rect(14, currentY, 182, 8, 'F');
      doc.setDrawColor(230, 230, 240);
      doc.line(14, currentY + 8, 196, currentY + 8);

      doc.setTextColor(20, 30, 50);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(eq.code, 16, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(`${eq.name.substring(0, 32)} (${eq.brand})`, 44, currentY + 5);
      doc.text(eq.serial || 'S/N-001', 110, currentY + 5);
      doc.text(eq.statusBefore || 'Operativo', 142, currentY + 5);

      doc.setTextColor(16, 120, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(eq.result || 'APROBADO', 176, currentY + 5);

      currentY += 8;
    });
  } else {
    // Single equipment report
    doc.setFillColor(255, 255, 255);
    doc.rect(14, currentY, 182, 8, 'F');
    doc.setDrawColor(230, 230, 240);
    doc.line(14, currentY + 8, 196, currentY + 8);

    doc.setTextColor(20, 30, 50);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(report.equipmentCode || 'EQ-001', 16, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(`${(report.equipmentName || 'Equipo Industrial').substring(0, 32)} (${report.brand || 'Marca'})`, 44, currentY + 5);
    doc.text(report.serialNumber || 'N/A', 110, currentY + 5);
    doc.text('En Revisión', 142, currentY + 5);

    doc.setTextColor(16, 120, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(report.outcome || 'APROBADO', 176, currentY + 5);

    currentY += 8;
  }

  currentY += 6;

  // Parameters block if present
  if (report.parameters) {
    doc.setFillColor(243, 244, 254);
    doc.roundedRect(14, currentY, 182, 22, 2, 2, 'F');
    doc.setDrawColor(200, 210, 240);
    doc.roundedRect(14, currentY, 182, 22, 2, 2, 'S');

    doc.setTextColor(0, 35, 111);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICIONES INSTRUMENTALES Y CALIBRACIÓN', 18, currentY + 5.5);

    doc.setTextColor(50, 50, 60);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    
    const paramsList = Object.entries(report.parameters).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('  |  ');
    const paramLines = doc.splitTextToSize(paramsList, 174);
    doc.text(paramLines, 18, currentY + 12);

    currentY += 28;
  }

  // Technical Observations & Recommendations
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(250, 250, 252);
  doc.roundedRect(14, currentY, 182, 38, 2, 2, 'F');
  doc.setDrawColor(220, 220, 230);
  doc.roundedRect(14, currentY, 182, 38, 2, 2, 'S');

  doc.setTextColor(0, 35, 111);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('HALLAZGOS TÉCNICOS Y RECOMENDACIONES DE INGENIERÍA', 18, currentY + 7);

  doc.setTextColor(60, 60, 70);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const obsText = doc.splitTextToSize(report.findings || report.generalObservations || 'Se completaron los protocolos de inspección, limpieza y calibración de acuerdo con los estándares del fabricante.', 174);
  doc.text(obsText, 18, currentY + 14);

  const recText = doc.splitTextToSize(`Recomendación: ${report.recommendations || 'Continuar con el cronograma trimestral de mantenimiento preventivo y monitoreo continuo.'}`, 174);
  doc.text(recText, 18, currentY + 28);

  currentY += 46;

  // Signatures
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(0, 35, 111);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFORMIDAD Y FIRMAS DE RESPONSABILIDAD TÉCNICA', 14, currentY);

  currentY += 12;

  // Left signature (Technician)
  doc.setDrawColor(120, 130, 150);
  doc.line(24, currentY + 18, 90, currentY + 18);
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(techName, 57, currentY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 100);
  doc.text('Técnico Especialista Responsable', 57, currentY + 26, { align: 'center' });
  doc.text('Reg. Profesional: CIP-CMMS-2026', 57, currentY + 30, { align: 'center' });

  // Right signature (Store Manager)
  doc.line(120, currentY + 18, 186, currentY + 18);
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(supName, 153, currentY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 100);
  doc.text('Supervisor de Zona / Gerencia', 153, currentY + 26, { align: 'center' });
  doc.text('Sello y Visto Bueno de Conformidad', 153, currentY + 30, { align: 'center' });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(140, 140, 150);
    doc.setFontSize(7.5);
    doc.text(`Portal Soporte Onsite - Hipermercados Tottus S.A. | Sistemas de la Información | Página ${i} de ${pageCount}`, 14, 288);
    doc.text(`Generado el ${new Date().toLocaleString('es-PE')}`, 155, 288);
  }

  doc.save(`Informe_Tecnico_${report.reportNumber}_${report.storeCode || report.storeId}.pdf`);
}
