import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Cloud,
  FileSpreadsheet,
  Key,
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  X,
  Code,
  Download,
  Share2,
  Workflow
} from 'lucide-react';
import { 
  MicrosoftDataService, 
  MicrosoftConnectorConfig, 
  IntegrationMode 
} from '../services/microsoftDataService';
import { Store, Equipment, Ticket, WorkOrder, TechnicalReport, AppUser, RegionalAlert } from '../types';

interface SharePointDataverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  equipments: Equipment[];
  tickets: Ticket[];
  workOrders: WorkOrder[];
  reports: TechnicalReport[];
  users: AppUser[];
  regionalAlerts: RegionalAlert[];
}

export const SharePointDataverseModal: React.FC<SharePointDataverseModalProps> = ({
  isOpen,
  onClose,
  stores,
  equipments,
  tickets,
  workOrders,
  reports,
  users,
  regionalAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'schemas' | 'guide'>('status');
  const [config, setConfig] = useState<MicrosoftConnectorConfig>(MicrosoftDataService.getConfig());
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; targetName?: string } | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: ''
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = MicrosoftDataService.getConfig();
      setConfig(current);
      checkStatus(current);
    }
  }, [isOpen]);

  const checkStatus = async (cfg: MicrosoftConnectorConfig) => {
    setTesting(true);
    const res = await MicrosoftDataService.testConnection(cfg);
    setTesting(false);
    setIsConnected(res.success);
    setTestResult(res);
    if (res.latencyMs) setLatency(res.latencyMs);
  };

  const handleSaveConfig = () => {
    MicrosoftDataService.saveConfig(config);
    checkStatus(config);
    alert('Configuración de Microsoft 365 guardada exitosamente.');
    setActiveTab('status');
  };

  const handleResetConfig = () => {
    if (window.confirm('¿Desea restablecer los valores de conexión de Microsoft Dataverse / SharePoint a los predeterminados?')) {
      MicrosoftDataService.clearConfig();
      const def = MicrosoftDataService.getConfig();
      setConfig(def);
      checkStatus(def);
    }
  };

  const handleBulkSync = async () => {
    if (!window.confirm(`¿Iniciar sincronización de registros hacia ${config.mode.toUpperCase()} (${stores.length} Tiendas, ${equipments.length} Equipos, ${tickets.length} Tickets, ${workOrders.length} OTs)?`)) {
      return;
    }

    setIsSyncing(true);
    const res = await MicrosoftDataService.bulkSyncAll(
      { stores, equipments, tickets, workOrders, reports, users, regionalAlerts },
      (current, total, message) => {
        setSyncProgress({ current, total, message });
      }
    );
    setIsSyncing(false);

    if (res.success) {
      alert(`¡Sincronización con ${config.mode.toUpperCase()} completada exitosamente! ${res.totalUploaded} registros procesados.`);
    } else {
      alert(`Error al sincronizar: ${res.error}`);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadSchemaJson = () => {
    const schemas = MicrosoftDataService.generateTableSchemas(config.mode, config.mode === 'dataverse' ? config.customPrefix : config.sharepointListPrefix);
    const blob = new Blob([JSON.stringify(schemas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${config.mode}_cmms.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEquipmentCsvTemplate = () => {
    const headers = ['CodigoActivo', 'Nombre', 'Categoria', 'TiendaCodigo', 'Marca', 'Modelo', 'Serie', 'EstadoOperativo', 'Criticidad', 'ProximoMto'];
    const rows = equipments.map(e => [
      `"${e.code}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${stores.find(s => s.id === e.storeId)?.code || ''}"`,
      `"${e.brand}"`,
      `"${e.model}"`,
      `"${e.serialNumber}"`,
      `"${e.status}"`,
      `"${e.criticality}"`,
      `"${e.nextMaintenanceDate}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_sharepoint_dataverse_activos.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadStoresSharePointCsvTemplate = () => {
    const headers = ['Cod', 'Tienda', 'Cluster', 'Centro_Costo_SAP', 'G_Zonal', 'Gerente_Tienda', 'Direccion', 'FORMATO', 'IT_Operator', 'Ubigeo', 'Region', 'Provincia', 'Distrito', 'SITUACION', 'Latitud', 'Longitud'];
    const rows = stores.map(s => [
      `"${s.codTienda || s.code.replace('T-', '')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.cluster || ''}"`,
      `"${s.centroCostoSap || s.cecoSap || ''}"`,
      `"${s.gZonal || ''}"`,
      `"${s.gerenteTienda || s.manager || ''}"`,
      `"${(s.direccion || s.address || '').replace(/"/g, '""')}"`,
      `"${s.formato || 'Hiper'}"`,
      `"${s.itOperator || ''}"`,
      `"${s.ubigeo !== undefined ? s.ubigeo : ''}"`,
      `"${s.region}"`,
      `"${s.provincia || ''}"`,
      `"${s.distrito || s.city || ''}"`,
      `"${s.situacion || 'Propia'}"`,
      `"${s.latitud || ''}"`,
      `"${s.longitud || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_sharepoint_tiendas_tottus.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#dce9ff] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <TableProperties className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Conector Microsoft SharePoint & Dataverse (Power Platform)
              </h2>
              <p className="text-xs text-white/80">Integración corporativa con tablas de Microsoft Lists, Dataverse CDS y Power Automate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e5eeff] px-6 bg-[#f8f9ff] overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Server className="w-4 h-4" />
            Estado & Sincronización
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Key className="w-4 h-4" />
            Configuración de Conexión
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'schemas'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Code className="w-4 h-4" />
            Esquemas & Tablas
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Guía de Integración
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'status' && (
            <>
              {/* Connection Status Banner */}
              <div className="p-4 rounded-xl border bg-[#ecfdf5] border-[#a7f3d0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#10b981] text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0b1c30]">
                        Conector Activo: {config.mode === 'dataverse' ? 'Microsoft Dataverse (CDS)' : config.mode === 'sharepoint' ? 'SharePoint Online Lists' : 'Power Automate Webhook'}
                      </h4>
                      {latency && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {latency} ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#444651] mt-0.5">
                      {config.mode === 'dataverse' && `Entorno: ${config.dataverseUrl} | Prefijo: ${config.customPrefix}`}
                      {config.mode === 'sharepoint' && `Sitio: ${config.sharepointSiteUrl} | Prefijo de Lista: ${config.sharepointListPrefix}`}
                      {config.mode === 'powerautomate' && 'Flujo instantáneo listo para recibir cargas en segundo plano.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => checkStatus(config)}
                  disabled={testing}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Probando...' : 'Verificar'}
                </button>
              </div>

              {testResult && (
                <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Mapped Entities Cards */}
              <div>
                <h4 className="text-xs font-bold text-[#757682] uppercase tracking-wider mb-2.5">
                  Mapeo de Tablas para Sincronización
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Activos & Equipos</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{equipments.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `${config.customPrefix}activos` : `${config.sharepointListPrefix}Activos_Equipos`}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1">20 Categorías de equipos</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Tiendas / Sucursales</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{stores.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `${config.customPrefix}sucursales` : `${config.sharepointListPrefix}Tiendas_Cadena`}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1">90 Locales Tottus</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Tickets Helpdesk</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{tickets.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `${config.customPrefix}incidencias` : `${config.sharepointListPrefix}Tickets_Helpdesk`}
                    </div>
                    <div className="text-[10px] text-amber-600 mt-1">Con SLA y criticidad</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Órdenes de Trabajo (OT)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{workOrders.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `${config.customPrefix}ordenes_trabajo` : `${config.sharepointListPrefix}Ordenes_Trabajo`}
                    </div>
                    <div className="text-[10px] text-purple-600 mt-1">Checklists interactivos</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Informes Técnicos</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{reports.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `${config.customPrefix}informes_tecnicos` : `${config.sharepointListPrefix}Informes_Tecnicos`}
                    </div>
                    <div className="text-[10px] text-[#757682] mt-1">Dictámenes & Firmas</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#00236f]">Personal Técnico</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{users.length}</span>
                    </div>
                    <div className="text-[11px] text-[#444651] font-mono">
                      {config.mode === 'dataverse' ? `systemusers / ${config.customPrefix}tecnicos` : `${config.sharepointListPrefix}Directorio_Tecnicos`}
                    </div>
                    <div className="text-[10px] text-[#757682] mt-1">Especialistas asignados</div>
                  </div>
                </div>
              </div>

              {/* Bulk Synchronize Action */}
              <div className="p-4 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Sincronización en Lote hacia {config.mode === 'dataverse' ? 'Dataverse' : config.mode === 'sharepoint' ? 'SharePoint Online' : 'Power Automate'}
                    </h4>
                    <p className="text-xs text-[#444651] mt-1">
                      Envía y valida las tablas completas de inventario, sucursales y órdenes de trabajo en el repositorio corporativo de Microsoft.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={downloadStoresSharePointCsvTemplate}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                      title="Descargar lista de tiendas en formato compatible con SharePoint Lists"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      Plantilla Tiendas
                    </button>
                    <button
                      onClick={downloadEquipmentCsvTemplate}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                      title="Descargar Plantilla CSV para importación masiva en SharePoint o Dataverse"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Plantilla Activos
                    </button>
                  </div>
                </div>

                {isSyncing && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#444651]">
                      <span>{syncProgress.message}</span>
                      <span className="font-bold">{syncProgress.current} / {syncProgress.total}</span>
                    </div>
                    <div className="w-full bg-[#e5eeff] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00236f] h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${syncProgress.total ? (syncProgress.current / syncProgress.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBulkSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00236f] text-white font-semibold text-xs hover:bg-[#1e3a8a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Cloud className="w-4 h-4" />
                  {isSyncing ? 'Sincronizando con Microsoft 365...' : `Sincronizar Todo hacia ${config.mode.toUpperCase()}`}
                </button>
              </div>
            </>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-2">
                  Tipo de Repositorio de Datos Microsoft:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, mode: 'dataverse' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.mode === 'dataverse'
                        ? 'border-[#00236f] bg-[#eff4ff] ring-1 ring-[#00236f]'
                        : 'border-[#c4c6d0] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#00236f]">
                      <TableProperties className="w-4 h-4" />
                      Microsoft Dataverse
                    </div>
                    <p className="text-[11px] text-[#444651] mt-1">
                      Power Apps, Dynamics 365, Common Data Service (CDS)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, mode: 'sharepoint' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.mode === 'sharepoint'
                        ? 'border-[#00236f] bg-[#eff4ff] ring-1 ring-[#00236f]'
                        : 'border-[#c4c6d0] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#00236f]">
                      <FileSpreadsheet className="w-4 h-4" />
                      SharePoint Lists
                    </div>
                    <p className="text-[11px] text-[#444651] mt-1">
                      Listas de SharePoint Online / Microsoft Graph API
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, mode: 'powerautomate' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.mode === 'powerautomate'
                        ? 'border-[#00236f] bg-[#eff4ff] ring-1 ring-[#00236f]'
                        : 'border-[#c4c6d0] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#00236f]">
                      <Workflow className="w-4 h-4" />
                      Power Automate Flow
                    </div>
                    <p className="text-[11px] text-[#444651] mt-1">
                      Webhook HTTP Trigger para sincronización bidireccional
                    </p>
                  </button>
                </div>
              </div>

              {/* Dynamic Fields per Mode */}
              {config.mode === 'dataverse' && (
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3">
                  <h4 className="text-xs font-bold text-[#00236f]">Parámetros de Microsoft Dataverse (Power Apps)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        URL del Entorno Dataverse (Web API v9.2) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={config.dataverseUrl}
                        onChange={(e) => setConfig({ ...config, dataverseUrl: e.target.value })}
                        placeholder="https://tottus-corp.crm.dynamics.com/api/data/v9.2/"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Prefijo de Tablas Personalizadas (Publisher Prefix)
                      </label>
                      <input
                        type="text"
                        value={config.customPrefix}
                        onChange={(e) => setConfig({ ...config, customPrefix: e.target.value })}
                        placeholder="cr_cmms_"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Azure AD (Entra ID) Tenant ID
                      </label>
                      <input
                        type="text"
                        value={config.tenantId}
                        onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                        placeholder="72f988bf-86f1-41af-91ab-..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        API Key / Bearer Token o Client Secret
                      </label>
                      <input
                        type="password"
                        value={config.dataverseApiKeyOrToken}
                        onChange={(e) => setConfig({ ...config, dataverseApiKeyOrToken: e.target.value })}
                        placeholder="Bearer token o secreto de aplicación de Azure AD"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.mode === 'sharepoint' && (
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3">
                  <h4 className="text-xs font-bold text-[#00236f]">Parámetros de SharePoint Online (Microsoft 365)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        URL del Sitio de SharePoint <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={config.sharepointSiteUrl}
                        onChange={(e) => setConfig({ ...config, sharepointSiteUrl: e.target.value })}
                        placeholder="https://tottus.sharepoint.com/sites/MantenimientoIndustrial"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Prefijo de Listas en SharePoint
                      </label>
                      <input
                        type="text"
                        value={config.sharepointListPrefix}
                        onChange={(e) => setConfig({ ...config, sharepointListPrefix: e.target.value })}
                        placeholder="CMMS_"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Azure AD Tenant ID
                      </label>
                      <input
                        type="text"
                        value={config.tenantId}
                        onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                        placeholder="72f988bf-86f1-41af-..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Token de Acceso Microsoft Graph / SharePoint App-Only
                      </label>
                      <input
                        type="password"
                        value={config.sharepointAuthToken}
                        onChange={(e) => setConfig({ ...config, sharepointAuthToken: e.target.value })}
                        placeholder="Token de Graph API con alcance Sites.ReadWrite.All"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.mode === 'powerautomate' && (
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3">
                  <h4 className="text-xs font-bold text-[#00236f]">Flujo Instantáneo de Power Automate / Logic Apps</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        URL del Desencadenador HTTP POST (Trigger) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={config.webhookEndpointUrl}
                        onChange={(e) => setConfig({ ...config, webhookEndpointUrl: e.target.value })}
                        placeholder="https://prod-XX.westus.logic.azure.com:443/workflows/..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Secreto o Token de Validación (Opcional)
                      </label>
                      <input
                        type="password"
                        value={config.webhookSecret}
                        onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                        placeholder="clave-secreta-webhook"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#c4c6d0] focus:border-[#00236f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="p-3 bg-white rounded-xl border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">Sincronización Automática en Segundo Plano</div>
                  <div className="text-[11px] text-[#757682]">Enviar cambios (tickets, OTs, nuevos activos) automáticamente al registrarse</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSyncOnChanges}
                  onChange={(e) => setConfig({ ...config, autoSyncOnChanges: e.target.checked })}
                  className="w-4 h-4 text-[#00236f] rounded focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Save & Reset */}
              <div className="flex items-center justify-between pt-3 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-xs font-semibold text-[#ba1a1a] hover:underline"
                >
                  Restablecer Predeterminados
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 bg-[#00236f] text-white text-xs font-bold rounded-xl hover:bg-[#1e3a8a] shadow-sm transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar y Aplicar Conexión
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0b1c30]">
                    Esquemas de Columnas y Tipos de Datos para {config.mode === 'dataverse' ? 'Dataverse CDS' : 'SharePoint Lists'}
                  </h4>
                  <p className="text-[11px] text-[#757682]">
                    Estructura normalizada lista para crear las tablas en Microsoft 365.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSchemaJson}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar JSON
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(MicrosoftDataService.generateTableSchemas(config.mode, config.mode === 'dataverse' ? config.customPrefix : config.sharepointListPrefix), null, 2), 'schema')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#00236f] text-white hover:bg-[#1e3a8a] flex items-center gap-1.5"
                  >
                    {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'schema' ? 'Copiado' : 'Copiar Esquema'}
                  </button>
                </div>
              </div>

              <div className="bg-[#0b1c30] text-emerald-300 p-4 rounded-xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-[#00236f]">
                <pre>{JSON.stringify(MicrosoftDataService.generateTableSchemas(config.mode, config.mode === 'dataverse' ? config.customPrefix : config.sharepointListPrefix), null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-[#444651]">
              <h4 className="font-bold text-[#0b1c30] text-sm">Pasos para conectar con tu Tenant Corporativo de Tottus / Microsoft 365:</h4>

              <div className="p-3.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-1.5">
                <div className="font-bold text-[#00236f] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00236f] text-white flex items-center justify-center text-[10px]">A</span>
                  Opción 1: Conectar con Listas de SharePoint Online
                </div>
                <p className="pl-7 text-[11px]">
                  1. Ingresa a tu sitio de SharePoint (ej. <code>https://tottus.sharepoint.com/sites/Mantenimiento</code>).<br />
                  2. En la pestaña <strong>Esquemas & Tablas</strong> descarga la plantilla CSV o JSON y crea las listas <code>CMMS_Activos</code>, <code>CMMS_Tickets</code> y <code>CMMS_Ordenes_Trabajo</code>.<br />
                  3. Vincula el sitio colocando la URL en la pestaña de configuración.
                </p>
              </div>

              <div className="p-3.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-1.5">
                <div className="font-bold text-[#00236f] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00236f] text-white flex items-center justify-center text-[10px]">B</span>
                  Opción 2: Conectar con Microsoft Dataverse / Power Apps
                </div>
                <p className="pl-7 text-[11px]">
                  1. Ingresa a <a href="https://make.powerapps.com" target="_blank" rel="noreferrer" className="text-[#00236f] underline font-semibold">make.powerapps.com</a> y selecciona el entorno corporativo.<br />
                  2. Ve a <strong>Tablas</strong> → <strong>Importar datos</strong> o usa el esquema de la solución Dataverse provista en este modal.<br />
                  3. Proporciona la URL Web API del entorno (ej. <code>https://orgXXXXX.crm.dynamics.com/api/data/v9.2/</code>).
                </p>
              </div>

              <div className="p-3.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-1.5">
                <div className="font-bold text-[#00236f] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00236f] text-white flex items-center justify-center text-[10px]">C</span>
                  Opción 3: Conectar con Power Automate (Flujo Instantáneo)
                </div>
                <p className="pl-7 text-[11px]">
                  Crea un flujo automatizado en Power Automate con el desencadenador <strong>"Cuando se recibe una solicitud HTTP"</strong> y pega la URL generada en el conector.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#444651] hover:bg-[#e5eeff] rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
