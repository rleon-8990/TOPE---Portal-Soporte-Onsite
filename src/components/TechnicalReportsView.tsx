import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Store as StoreIcon,
  Wrench,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TechnicalReport, Equipment, Store, AppUser } from '../types';
import { generatePdfFromReport } from '../utils/helpers';

interface TechnicalReportsViewProps {
  reports: TechnicalReport[];
  equipments: Equipment[];
  stores: Store[];
  currentUser: AppUser;
  onAddNewReport: (report: TechnicalReport) => void;
}

export const TechnicalReportsView: React.FC<TechnicalReportsViewProps> = ({
  reports,
  equipments,
  stores,
  currentUser,
  onAddNewReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<TechnicalReport | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states for new report
  const [formStoreId, setFormStoreId] = useState(stores[0]?.id || '');
  const [formEquipmentId, setFormEquipmentId] = useState(equipments[0]?.id || '');
  const [formTitle, setFormTitle] = useState('Informe de Mantenimiento y Calibración Periódica');
  const [formOutcome, setFormOutcome] = useState<'Aprobado' | 'Con Observaciones' | 'Reprobado'>('Aprobado');
  const [formFindings, setFormFindings] = useState('Equipo inspeccionado bajo protocolo técnico estándar. Valores de presión, voltaje y aislamiento dentro de los rangos especificados por el fabricante.');
  const [formRecommendations, setFormRecommendations] = useState('Reemplazar filtros en el próximo ciclo de 90 días. Mantener monitoreo preventivo continuo.');

  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    const repNum = r.reportNumber || r.code || '';
    const matchesSearch =
      repNum.toLowerCase().includes(query) ||
      r.equipmentName.toLowerCase().includes(query) ||
      r.storeName.toLowerCase().includes(query) ||
      r.technician.toLowerCase().includes(query);

    const matchesStore = selectedStoreFilter === '' || r.storeId === selectedStoreFilter;
    const matchesOutcome =
      selectedOutcomeFilter === 'todos' || r.outcome.toLowerCase() === selectedOutcomeFilter.toLowerCase();

    return matchesSearch && matchesStore && matchesOutcome;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadPdf = (rep: TechnicalReport) => {
    generatePdfFromReport(rep);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === formStoreId) || stores[0];
    const eq = equipments.find(e => e.id === formEquipmentId) || equipments[0];
    const repNum = `INF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRep: TechnicalReport = {
      id: `rep-${Date.now()}`,
      reportNumber: repNum,
      date: new Date().toISOString().split('T')[0],
      storeId: st.id,
      storeName: st.name,
      storeCode: st.code,
      region: st.region,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.code,
      categoryName: eq.categoryName,
      serialNumber: eq.serialNumber,
      brand: eq.brand,
      model: eq.model,
      technician: currentUser.name,
      supervisor: 'Ing. Supervisor Nacional CMMS',
      outcome: formOutcome,
      findings: formFindings,
      recommendations: formRecommendations,
      parameters: {
        voltaje: '220 V ± 2%',
        corriente: '14.8 A',
        presion: '125 PSI',
        temperatura: '4.2 °C',
        vibracion: '0.8 mm/s RMS (Excelente)',
        aislamiento: '> 500 MegaOhms',
      },
      checklist: [
        { label: 'Inspección de conexiones eléctricas', status: 'conforme' },
        { label: 'Revisión y torque de tornillos estructurales', status: 'conforme' },
        { label: 'Prueba de arranque y ciclo de carga', status: 'conforme' },
        { label: 'Limpieza e higienización de bandejas', status: 'conforme' },
        { label: 'Calibración de termostatos o transductores', status: 'conforme' },
      ],
      signatures: {
        technicianSigned: true,
        supervisorSigned: true,
        clientStoreSigned: true,
      },
    };

    onAddNewReport(newRep);
    setShowNewModal(false);
    setSelectedReport(newRep);
    alert(`📄 Informe técnico ${repNum} emitido y firmado digitalmente.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Informes Técnicos de Mantenimiento
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Registro tabular de informes técnicos oficiales, mediciones instrumentales y firmas de conformidad exportables a PDF.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Nuevo Informe</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por N° informe, equipo, tienda o técnico..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={selectedOutcomeFilter}
              onChange={e => {
                setSelectedOutcomeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Resultados</option>
              <option value="aprobado">Aprobado / Conforme</option>
              <option value="con observaciones">Con Observaciones</option>
              <option value="reprobado">Reprobado / Falla</option>
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <select
              value={selectedStoreFilter}
              onChange={e => {
                setSelectedStoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="">Todas las Sucursales (90)</option>
              {stores.map(st => (
                <option key={st.id} value={st.id}>
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabular / List View */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th className="py-3 px-3.5 w-28">N° INFORME</th>
                <th className="py-3 px-3.5">FECHA</th>
                <th className="py-3 px-3.5">EQUIPO EVALUADO</th>
                <th className="py-3 px-3.5">TIENDA / SEDE</th>
                <th className="py-3 px-3.5">ING. TÉCNICO</th>
                <th className="py-3 px-3.5">SUPERVISOR</th>
                <th className="py-3 px-3.5 text-center">DICTAMEN</th>
                <th className="py-3 px-3.5 text-center w-28">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#757682]">
                    No se encontraron informes técnicos con los filtros indicados.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((rep, idx) => {
                  const isAprobado = rep.outcome === 'Aprobado' || rep.outcome === 'aprobado';
                  const isObs = rep.outcome.includes('Observación') || rep.outcome.includes('observacion');

                  return (
                    <tr
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                          {rep.reportNumber || rep.code}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#444651] whitespace-nowrap">
                        {rep.date}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0b1c30]">{rep.equipmentName}</div>
                        <div className="text-[10px] font-mono text-[#757682]">
                          {rep.equipmentCode} • {rep.brand} {rep.model}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#00236f]">{rep.storeName}</div>
                        <div className="text-[11px] text-[#757682]">{rep.region}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#0b1c30]">
                        {rep.technician}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-[#757682]">
                        {rep.supervisor || 'Ing. Supervisor CMMS'}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAprobado
                              ? 'bg-[#e8f5e9] text-[#10b981]'
                              : isObs
                              ? 'bg-[#fff3e0] text-[#fd761a]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAprobado ? 'bg-[#10b981]' : isObs ? 'bg-[#fd761a]' : 'bg-[#ba1a1a]'
                            }`}
                          />
                          {rep.outcome}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedReport(rep)}
                            className="p-1 text-[#00236f] hover:bg-[#eff4ff] rounded font-medium text-[11px] flex items-center gap-0.5"
                            title="Ver Informe Detallado"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(rep)}
                            className="p-1 text-[#10b981] hover:bg-[#e8f5e9] rounded font-medium text-[11px] flex items-center gap-0.5"
                            title="Descargar PDF con Formato Oficial"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex items-center justify-between text-xs text-[#757682]">
          <div>
            Mostrando <strong>{paginatedReports.length}</strong> de <strong>{filteredReports.length}</strong> informes emitidos
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#00236f]" />
            </button>
            <span className="font-semibold text-[#0b1c30]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#00236f]" />
            </button>
          </div>
        </div>
      </div>

      {/* Technical Report Detail / Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2.5 py-0.5 rounded">
                    {selectedReport.reportNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedReport.outcome === 'Aprobado'
                        ? 'bg-[#e8f5e9] text-[#10b981]'
                        : 'bg-[#fff3e0] text-[#fd761a]'
                    }`}
                  >
                    Dictamen: {selectedReport.outcome}
                  </span>
                  <span className="text-xs text-[#757682] font-mono">{selectedReport.date}</span>
                </div>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1.5">
                  Informe Técnico de Intervención: {selectedReport.equipmentName}
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedReport.storeName} ({selectedReport.region}) • Código Activo: {selectedReport.equipmentCode}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-[#757682] p-1 font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Instrumental Measurements Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682]">
                Parámetros e Instrumentación Registrada:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Voltaje de Alimentación</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.voltaje}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Consumo de Corriente</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.corriente}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Presión de Trabajo</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.presion}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Temperatura de Operación</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.temperatura}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Nivel de Vibración</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.vibracion}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Resistencia de Aislamiento</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.aislamiento}</strong>
                </div>
              </div>
            </div>

            {/* Findings & Conclusions */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <h5 className="font-bold text-[#00236f] uppercase text-[11px] mb-1">Conclusiones y Hallazgos:</h5>
                <p className="text-[#444651]">{selectedReport.findings}</p>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <h5 className="font-bold text-[#00236f] uppercase text-[11px] mb-1">Recomendaciones del Especialista:</h5>
                <p className="text-[#444651]">{selectedReport.recommendations}</p>
              </div>
            </div>

            {/* Signatures verification */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#757682] block">Técnico Certificado</span>
                <strong className="text-[#00236f]">{selectedReport.technician}</strong>
                <div className="text-[10px] text-[#10b981] font-semibold mt-0.5">✓ Firma Digital Validada</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#757682] block">Supervisor de Mantenimiento</span>
                <strong className="text-[#00236f]">{selectedReport.supervisor}</strong>
                <div className="text-[10px] text-[#10b981] font-semibold mt-0.5">✓ Aprobación Central Validada</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#dce9ff]"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedReport)}
                className="px-4 py-2 bg-[#10b981] text-white font-bold text-xs rounded-lg hover:bg-[#059669] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Emitir Nuevo Informe Técnico
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tienda / Sucursal (90)
                  </label>
                  <select
                    value={formStoreId}
                    onChange={e => setFormStoreId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Equipo Auditado
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={e => setFormEquipmentId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Dictamen Final
                </label>
                <select
                  value={formOutcome}
                  onChange={e => setFormOutcome(e.target.value as 'Aprobado' | 'Con Observaciones' | 'Reprobado')}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-bold"
                >
                  <option value="Aprobado">Aprobado / Conforme (100% Operativo)</option>
                  <option value="Con Observaciones">Con Observaciones (Requiere Ajuste Menor)</option>
                  <option value="Reprobado">Reprobado (Falla Crítica / No Cumple Norma)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Conclusiones de Ingeniería
                </label>
                <textarea
                  rows={3}
                  required
                  value={formFindings}
                  onChange={e => setFormFindings(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Recomendaciones Técnicas
                </label>
                <textarea
                  rows={2}
                  required
                  value={formRecommendations}
                  onChange={e => setFormRecommendations(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a]"
                >
                  Guardar & Emitir PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
