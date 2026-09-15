import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  UserCheck,
  Filter,
  Download,
  FileText,
  MapPin,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ClipboardPaste,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  GeoVictoriaDailyReportRow,
  GeoVictoriaPunchRow,
  GeoVictoriaReconciliationItem,
  AppUser,
  Store,
  ActivePersonnelPresence,
  PreventiveVisit
} from '../types';
import {
  getStoredDailyReports,
  saveStoredDailyReports,
  getStoredPunches,
  saveStoredPunches,
  parseGeoVictoriaPastedText,
  generateGeoVictoriaReconciliation,
  INITIAL_GEOVICTORIA_DAILY_REPORTS,
  INITIAL_GEOVICTORIA_PUNCHES
} from '../services/geoVictoriaReconciliationService';

interface GeoVictoriaReconciliationPanelProps {
  users: AppUser[];
  stores: Store[];
  activePresences?: ActivePersonnelPresence[];
  preventiveVisits?: PreventiveVisit[];
}

export const GeoVictoriaReconciliationPanel: React.FC<GeoVictoriaReconciliationPanelProps> = ({
  users,
  stores,
  activePresences = [],
  preventiveVisits = []
}) => {
  // State for loaded data
  const [dailyReports, setDailyReports] = useState<GeoVictoriaDailyReportRow[]>(() => getStoredDailyReports());
  const [punches, setPunches] = useState<GeoVictoriaPunchRow[]>(() => getStoredPunches());

  // Active view tab
  const [viewTab, setViewTab] = useState<'reconciliation' | 'daily' | 'punches'>('reconciliation');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [storeFilter, setStoreFilter] = useState<string>('todas');

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Generate real-time reconciliation items
  const reconciliationItems = useMemo(() => {
    return generateGeoVictoriaReconciliation(
      dailyReports,
      punches,
      users,
      stores,
      activePresences,
      preventiveVisits
    );
  }, [dailyReports, punches, users, stores, activePresences, preventiveVisits]);

  // Filtered reconciliation items
  const filteredReconciled = useMemo(() => {
    return reconciliationItems.filter(item => {
      const matchSearch =
        !searchQuery ||
        item.specialistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dni.includes(searchQuery) ||
        (item.onsiteStoreName && item.onsiteStoreName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.geoVictoriaRelojTienda && item.geoVictoriaRelojTienda.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || item.status === statusFilter;
      const matchStore =
        storeFilter === 'todas' ||
        (item.onsiteStoreName && item.onsiteStoreName.toLowerCase().includes(storeFilter.toLowerCase())) ||
        (item.geoVictoriaRelojTienda && item.geoVictoriaRelojTienda.toLowerCase().includes(storeFilter.toLowerCase()));

      return matchSearch && matchStatus && matchStore;
    });
  }, [reconciliationItems, searchQuery, statusFilter, storeFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = reconciliationItems.length;
    const conforme = reconciliationItems.filter(i => i.status === 'conforme').length;
    const atrasos = reconciliationItems.filter(i => i.status === 'atraso').length;
    const desvios = reconciliationItems.filter(i => i.status === 'desvio_tienda').length;
    const sinMarca = reconciliationItems.filter(i => i.status === 'sin_marcacion_geovictoria').length;

    return {
      total,
      conforme,
      atrasos,
      desvios,
      sinMarca,
      conformeRate: total > 0 ? Math.round((conforme / total) * 100) : 100
    };
  }, [reconciliationItems]);

  // Handle parsing and importing pasted text
  const handleProcessImport = () => {
    if (!pastedText.trim()) {
      setImportNotice('Pegue el contenido copiado desde la planilla de GeoVictoria.');
      return;
    }

    const { dailyRows, punchRows, detectedType } = parseGeoVictoriaPastedText(pastedText);

    if (detectedType === 'punch' && punchRows.length > 0) {
      const updated = [...punchRows, ...punches];
      setPunches(updated);
      saveStoredPunches(updated);
      setImportNotice(`✓ Se importaron exitosamente ${punchRows.length} marcaciones de reloj biométrico.`);
      setTimeout(() => {
        setShowImportModal(false);
        setPastedText('');
        setImportNotice(null);
        setViewTab('punches');
      }, 1200);
    } else if (dailyRows.length > 0) {
      const updated = [...dailyRows, ...dailyReports];
      setDailyReports(updated);
      saveStoredDailyReports(updated);
      setImportNotice(`✓ Se importaron exitosamente ${dailyRows.length} registros del reporte consolidado de turnos.`);
      setTimeout(() => {
        setShowImportModal(false);
        setPastedText('');
        setImportNotice(null);
        setViewTab('daily');
      }, 1200);
    } else {
      setImportNotice('No se pudieron detectar columnas válidas. Verifique el formato de GeoVictoria.');
    }
  };

  // Reset to initial benchmark data
  const handleResetToBenchmark = () => {
    if (window.confirm('¿Restablecer datos de GeoVictoria a los reportes de las planillas oficiales descargadas?')) {
      setDailyReports(INITIAL_GEOVICTORIA_DAILY_REPORTS);
      saveStoredDailyReports(INITIAL_GEOVICTORIA_DAILY_REPORTS);
      setPunches(INITIAL_GEOVICTORIA_PUNCHES);
      saveStoredPunches(INITIAL_GEOVICTORIA_PUNCHES);
    }
  };

  // Export reconciliation report to CSV
  const handleExportCsv = () => {
    const headers = [
      'DNI',
      'Especialista',
      'Cargo',
      'Fecha',
      'Tienda OnSite',
      'Actividad OnSite',
      'Turno Planificado',
      'Hora Ingreso',
      'Hora Salida',
      'Atraso',
      'Horas Trabajadas',
      'Reloj Marcacion',
      'Metodo',
      'Estado Cruce',
      'Diagnostico'
    ];

    const rows = filteredReconciled.map(item => [
      `"${item.dni}"`,
      `"${item.specialistName}"`,
      `"${item.cargo}"`,
      `"${item.fecha}"`,
      `"${item.onsiteStoreName || ''}"`,
      `"${item.onsiteActivity || ''}"`,
      `"${item.geoVictoriaTurno || ''}"`,
      `"${item.geoVictoriaIngreso || ''}"`,
      `"${item.geoVictoriaSalida || ''}"`,
      `"${item.geoVictoriaAtraso || '00:00'}"`,
      `"${item.geoVictoriaHorasTrabajadas || ''}"`,
      `"${item.geoVictoriaRelojTienda || ''}"`,
      `"${item.geoVictoriaMetodo || ''}"`,
      `"${item.status}"`,
      `"${item.diagnostico}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cruce_GeoVictoria_OnSite_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Offline Secure Header Card */}
      <div className="p-4 bg-[#f8faff] rounded-xl border border-[#dce9ff] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#007a33] text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#00236f]">
                Cruce de Información GeoVictoria vs Portal OnSite
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#007a33] border border-[#c8e6c9]">
                ✓ Sin llamada API externa · Carga por Planilla
              </span>
            </div>
            <p className="text-xs text-[#757682] mt-0.5">
              Cruza los turnos, atrasos y marcaciones de relojes biométricos descargados de GeoVictoria con las visitas y actividades que registra el especialista in-situ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 md:flex-none px-3.5 py-2 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Cargar Planilla GeoVictoria</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white text-[#00236f] border border-[#dce9ff] rounded-lg text-xs font-semibold hover:bg-[#eff4ff] transition-all flex items-center gap-1.5"
            title="Exportar Cruce a Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleResetToBenchmark}
            className="px-2.5 py-2 bg-white text-[#757682] border border-[#e5eeff] rounded-lg text-xs font-medium hover:bg-slate-50 transition-all flex items-center gap-1"
            title="Restablecer a planillas originales de Tottus"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-[#757682]">Total Registros</span>
            <UserCheck className="w-4 h-4 text-[#00236f]" />
          </div>
          <p className="text-2xl font-black text-[#0b1c30]">{stats.total}</p>
          <span className="text-[11px] text-[#757682]">Marcaciones cruzadas</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#c8e6c9] bg-gradient-to-br from-white to-[#f1f8e9] shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-[#007a33]">Conforme en Tienda</span>
            <CheckCircle2 className="w-4 h-4 text-[#007a33]" />
          </div>
          <p className="text-2xl font-black text-[#007a33]">{stats.conforme}</p>
          <span className="text-[11px] text-[#007a33] font-semibold">{stats.conformeRate}% de cumplimiento</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#ffe082] bg-gradient-to-br from-white to-[#fffde7] shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-[#b78103]">Atrasos Detectados</span>
            <Clock className="w-4 h-4 text-[#b78103]" />
          </div>
          <p className="text-2xl font-black text-[#b78103]">{stats.atrasos}</p>
          <span className="text-[11px] text-[#b78103]">Minutos de retardo en turno</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-[#1e3a8a]">Desvío / Web</span>
            <Building2 className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <p className="text-2xl font-black text-[#1e3a8a]">{stats.desvios}</p>
          <span className="text-[11px] text-[#757682]">Reloj fuera de tienda base</span>
        </div>
      </div>

      {/* Sub-tabs for switching between Reconciliation, Daily Turnos (Foto 1), and Biometric Punches (Foto 2) */}
      <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('reconciliation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewTab === 'reconciliation'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-[#757682] hover:bg-[#eff4ff] border border-[#e5eeff]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Matriz de Cruce Especialista vs Reloj ({reconciliationItems.length})</span>
          </button>

          <button
            onClick={() => setViewTab('daily')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewTab === 'daily'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-[#757682] hover:bg-[#eff4ff] border border-[#e5eeff]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Turnos & Atrasos [Foto 1] ({dailyReports.length})</span>
          </button>

          <button
            onClick={() => setViewTab('punches')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewTab === 'punches'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-[#757682] hover:bg-[#eff4ff] border border-[#e5eeff]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Relojes Biométricos [Foto 2] ({punches.length})</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#757682] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por DNI o Especialista..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            />
          </div>

          {viewTab === 'reconciliation' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-medium text-[#0b1c30]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="conforme">✓ Conforme</option>
              <option value="atraso">⚠️ Con Atraso</option>
              <option value="desvio_tienda">🔵 Desvío de Tienda</option>
              <option value="sin_marcacion_geovictoria">❌ Sin Marcación</option>
            </select>
          )}
        </div>
      </div>

      {/* VIEW 1: RECONCILIATION MATRIX */}
      {viewTab === 'reconciliation' && (
        <div className="bg-white rounded-xl border border-[#e5eeff] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8faff] text-[#00236f] border-b border-[#e5eeff] uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3.5">Especialista & DNI</th>
                  <th className="py-3 px-3.5">Registro Portal OnSite</th>
                  <th className="py-3 px-3.5">Reporte GeoVictoria (Descargado)</th>
                  <th className="py-3 px-3.5">Reloj Biométrico Físico</th>
                  <th className="py-3 px-3.5 text-center">Estado del Cruce</th>
                  <th className="py-3 px-3.5">Diagnóstico Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f3f9]">
                {filteredReconciled.map(item => (
                  <tr key={item.id} className="hover:bg-[#f8faff] transition-colors">
                    {/* Especialista & DNI */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#00236f]">{item.specialistName}</div>
                      <div className="text-[11px] font-mono text-[#757682] flex items-center gap-1.5">
                        <span>DNI: {item.dni}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-sans">
                          {item.cargo}
                        </span>
                      </div>
                    </td>

                    {/* Registro OnSite */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#0b1c30] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#007a33]" />
                        <span>{item.onsiteStoreName}</span>
                      </div>
                      <div className="text-[11px] text-[#757682]">
                        {item.onsiteActivity}
                      </div>
                    </td>

                    {/* GeoVictoria */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-xs text-[#00236f]">
                        {item.geoVictoriaIngreso && <span>Ent: <strong>{item.geoVictoriaIngreso}</strong></span>}
                        {item.geoVictoriaSalida && <span className="ml-2">Sal: <strong>{item.geoVictoriaSalida}</strong></span>}
                      </div>
                      <div className="text-[10px] text-[#757682] flex items-center gap-2 mt-0.5">
                        <span>Turno: {item.geoVictoriaTurno || '08:00 - 17:00'}</span>
                        {item.geoVictoriaHorasTrabajadas && (
                          <span className="font-bold text-slate-700">HT: {item.geoVictoriaHorasTrabajadas}h</span>
                        )}
                        {item.geoVictoriaAtraso && item.geoVictoriaAtraso !== '00:00' && (
                          <span className="text-[#ba1a1a] font-bold">Atraso: +{item.geoVictoriaAtraso}</span>
                        )}
                      </div>
                    </td>

                    {/* Reloj Biométrico */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-xs text-slate-800 truncate max-w-[200px]" title={item.geoVictoriaRelojTienda}>
                        {item.geoVictoriaRelojTienda || 'Planilla General'}
                      </div>
                      <span className="text-[10px] text-[#757682]">
                        Método: {item.geoVictoriaMetodo || 'Biometría'}
                      </span>
                    </td>

                    {/* Estado Cruce */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {item.status === 'conforme' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e8f5e9] text-[#007a33] border border-[#c8e6c9]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Conforme</span>
                        </span>
                      )}
                      {item.status === 'atraso' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fff8e1] text-[#b78103] border border-[#ffe082]">
                          <Clock className="w-3 h-3" />
                          <span>Atraso (+{item.geoVictoriaAtraso || 'min'})</span>
                        </span>
                      )}
                      {item.status === 'desvio_tienda' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#1e3a8a] border border-[#dce9ff]">
                          <Building2 className="w-3 h-3" />
                          <span>Desvío / Web</span>
                        </span>
                      )}
                      {item.status === 'sin_marcacion_geovictoria' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffebee] text-[#ba1a1a] border border-[#ffcdd2]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Sin Marcación</span>
                        </span>
                      )}
                    </td>

                    {/* Diagnóstico */}
                    <td className="py-3 px-3.5 text-[11px] text-[#757682] max-w-xs">
                      {item.diagnostico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FOTO 1 - REPORTE CONSOLIDADO DIARIO (TURNOS Y ATRASOS) */}
      {viewTab === 'daily' && (
        <div className="bg-white rounded-xl border border-[#e5eeff] overflow-hidden shadow-xs">
          <div className="p-3 bg-[#f8faff] border-b border-[#e5eeff] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#00236f]">Planilla Consolidada de Turnos (GeoVictoria)</span>
              <span className="text-[10px] text-[#757682]">Formato correspondiente a Foto 1</span>
            </div>
            <span className="text-[11px] font-mono text-[#757682]">{dailyReports.length} filas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold uppercase">
                  <th className="py-2.5 px-3">Apellidos</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Identificado (DNI)</th>
                  <th className="py-2.5 px-3">Grupo</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3 text-center">Entró</th>
                  <th className="py-2.5 px-3 text-center">Atraso</th>
                  <th className="py-2.5 px-3 text-center">Salió</th>
                  <th className="py-2.5 px-3 text-center">HT (Horas)</th>
                  <th className="py-2.5 px-3">Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {dailyReports.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/40">
                    <td className="py-2 px-3 font-sans font-bold text-slate-800">{r.apellidos}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{r.nombre}</td>
                    <td className="py-2 px-3 text-slate-600">{r.identificado}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{r.grupo}</td>
                    <td className="py-2 px-3 font-sans text-slate-700">{r.fecha}</td>
                    <td className="py-2 px-3 text-slate-600">{r.turno}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{r.entro || '-'}</td>
                    <td className={`py-2 px-3 text-center font-bold ${r.atraso && r.atraso !== '00:00' ? 'text-red-600' : 'text-slate-500'}`}>
                      {r.atraso || '00:00'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{r.salio || '-'}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{r.ht || '00:00'}</td>
                    <td className="py-2 px-3 font-sans text-[10px] text-slate-600 truncate max-w-[180px]">{r.cargo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: FOTO 2 - MARCACIONES DETALLADAS EN RELOJES BIOMÉTRICOS */}
      {viewTab === 'punches' && (
        <div className="bg-white rounded-xl border border-[#e5eeff] overflow-hidden shadow-xs">
          <div className="p-3 bg-[#f8faff] border-b border-[#e5eeff] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#00236f]">Libro de Asistencia & Relojes Biométricos</span>
              <span className="text-[10px] text-[#757682]">Formato correspondiente a Foto 2</span>
            </div>
            <span className="text-[11px] font-mono text-[#757682]">{punches.length} marcaciones</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold uppercase">
                  <th className="py-2.5 px-3">Apellidos & Nombre</th>
                  <th className="py-2.5 px-3">Rut (DNI)</th>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                  <th className="py-2.5 px-3">Método de Marca</th>
                  <th className="py-2.5 px-3">Nombre Reloj Biométrico</th>
                  <th className="py-2.5 px-3">ID Reloj Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {punches.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/40">
                    <td className="py-2 px-3 font-sans font-bold text-slate-800">
                      {p.apellidos}, {p.nombre}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{p.rut}</td>
                    <td className="py-2 px-3 text-slate-800">{p.fecha}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.tipo}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-700">{p.metodoMarca}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">{p.nombreReloj || '-'}</td>
                    <td className="py-2 px-3 text-slate-500">{p.relojControl || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR PLANILLA O PEGAR TABLA GEOVICTORIA */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e5eeff] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center">
                  <ClipboardPaste className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#00236f]">Cargar Planilla de GeoVictoria</h3>
                  <p className="text-xs text-[#757682]">
                    Copia las filas desde el Excel de GeoVictoria y pégalas aquí directamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#eff4ff] rounded-xl text-xs text-[#00236f] border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <strong>Formatos compatibles automáticos:</strong>
                  <ul className="list-disc pl-4 mt-1 text-[11px] text-[#757682]">
                    <li>Foto 1: Reporte Diario Consolidado (Apellidos, Nombre, DNI, Turno, Entró, Atraso, Salió, HT)</li>
                    <li>Foto 2: Libro de Marcaciones Biométricas (Apellidos, Nombre, Rut, Fecha, Tipo, Nombre Reloj)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Pegar datos desde Excel (Control+V):
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Apellidos	Nombre	Identificado	Grupo	Fecha	Permiso	Turno	Entró	Tip	Atraso	Justificado	Salió..."
                  className="w-full p-3 text-xs font-mono bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                />
              </div>

              {importNotice && (
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  importNotice.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{importNotice}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg hover:bg-[#1e3a8a] shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Procesar e Incorporar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
