import React, { useState, useMemo, useRef } from 'react';
import {
  TableProperties,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cloud,
  Database,
  Copy,
  Check,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Trash2,
  HelpCircle,
  X,
  Layers,
  Settings2,
  Sparkles,
  Link,
  FileText,
  AlertTriangle,
  Zap,
  Clock
} from 'lucide-react';
import { Store, Region } from '../types';
import { MicrosoftDataService, SharePointStoreFieldMap, AutoSyncConfig } from '../services/microsoftDataService';

interface SharePointStoreSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStores: Store[];
  onApplyStores: (newStores: Store[], sourceInfo: string) => void;
  onResetToDefaultStores?: () => void;
}

export const SharePointStoreSyncModal: React.FC<SharePointStoreSyncModalProps> = ({
  isOpen,
  onClose,
  currentStores,
  onApplyStores,
  onResetToDefaultStores,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'live' | 'powerautomate' | 'autosync' | 'current'>('autosync');
  
  // AutoSync configuration state
  const [autoSyncConfig, setAutoSyncConfig] = useState<AutoSyncConfig>(() => MicrosoftDataService.getAutoSyncConfig());
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);

  // File Upload & Parsing States
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [parsedStores, setParsedStores] = useState<Store[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [syncMode, setSyncMode] = useState<'replace' | 'merge'>('replace');

  // Live SharePoint Connection States
  const [siteUrl, setSiteUrl] = useState<string>('https://tottus.sharepoint.com/sites/MantenimientoIndustrial');
  const [listName, setListName] = useState<string>('Tiendas');
  const [authToken, setAuthToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectResult, setConnectResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Power Automate States
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isCallingWebhook, setIsCallingWebhook] = useState<boolean>(false);
  const [webhookResult, setWebhookResult] = useState<{ success: boolean; message: string } | null>(null);

  // Utility state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchPreviewQuery, setSearchPreviewQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse raw text or file content
  const handleProcessContent = (content: string, name = 'sharepoint_export.csv') => {
    setParsingError(null);
    try {
      const result = MicrosoftDataService.parseSharePointStoreExport(content);
      if (result.stores.length === 0) {
        setParsingError('No se encontraron registros de tiendas válidos en el archivo. Verifica que contenga encabezados como "Cod", "Tienda", "CentroCosto", etc.');
        return;
      }
      setParsedStores(result.stores);
      setDetectedHeaders(result.detectedHeaders);
      setFieldMappings(result.fieldMappings);
      setFileName(name);
    } catch (e: any) {
      setParsingError(`Error al procesar el archivo: ${e.message || e}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleProcessContent(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Test live connection to SharePoint REST or Microsoft Graph
  const handleTestLiveConnection = async () => {
    setIsConnecting(true);
    setConnectResult(null);

    try {
      const res = await MicrosoftDataService.fetchSharePointListItems(siteUrl, listName, authToken);
      setIsConnecting(false);
      setConnectResult(res);

      if (res.success && res.stores && res.stores.length > 0) {
        setParsedStores(res.stores);
        setActiveTab('upload');
      }
    } catch (err: any) {
      setIsConnecting(false);
      setConnectResult({
        success: false,
        message: `Fallo al consultar SharePoint: ${err.message || err}`
      });
    }
  };

  // Test Power Automate Webhook
  const handleTestPowerAutomate = async () => {
    if (!webhookUrl.trim()) {
      alert('Por favor introduce la URL del webhook de Power Automate');
      return;
    }

    setIsCallingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await MicrosoftDataService.fetchPowerAutomateStores(webhookUrl);
      setIsCallingWebhook(false);
      setWebhookResult(res);

      if (res.success && res.stores && res.stores.length > 0) {
        setParsedStores(res.stores);
        setActiveTab('upload');
      }
    } catch (err: any) {
      setIsCallingWebhook(false);
      setWebhookResult({
        success: false,
        message: `Error al conectar con Power Automate: ${err.message || err}`
      });
    }
  };

  // Apply parsed stores to inventory
  const handleConfirmSync = () => {
    if (parsedStores.length === 0) {
      alert('No hay tiendas para sincronizar.');
      return;
    }

    let finalStores: Store[] = [];
    if (syncMode === 'replace') {
      finalStores = parsedStores;
    } else {
      // Merge mode: update existing by code or ID, keep rest, add new
      const currentMap = new Map<string, Store>();
      currentStores.forEach(s => {
        const key = String(s.codTienda || s.code).trim().toLowerCase();
        currentMap.set(key, s);
      });

      parsedStores.forEach(s => {
        const key = String(s.codTienda || s.code).trim().toLowerCase();
        currentMap.set(key, { ...(currentMap.get(key) || {}), ...s });
      });

      finalStores = Array.from(currentMap.values());
    }

    const sourceLabel = fileName
      ? `Archivo de SharePoint: ${fileName}`
      : `Lista de SharePoint Online: ${listName}`;

    onApplyStores(finalStores, sourceLabel);
    alert(`¡Sincronización exitosa! Se han actualizado ${finalStores.length} tiendas en el inventario desde SharePoint.`);
    onClose();
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter preview stores
  const filteredPreview = useMemo(() => {
    if (!searchPreviewQuery.trim()) return parsedStores.slice(0, 10);
    const q = searchPreviewQuery.toLowerCase();
    return parsedStores
      .filter(s =>
        s.name.toLowerCase().includes(q) ||
        String(s.codTienda || '').includes(q) ||
        (s.centroCostoSap || '').toLowerCase().includes(q) ||
        (s.gerenteTienda || '').toLowerCase().includes(q) ||
        (s.itOperator || '').toLowerCase().includes(q) ||
        (s.distrito || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [parsedStores, searchPreviewQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#dce9ff] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-300/30 flex items-center justify-center text-teal-300">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-teal-400/20 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-300/30 uppercase tracking-wider">
                  MICROSOFT SHAREPOINT ONLINE
                </span>
                <span className="text-xs text-white/70">Módulo de Sucursales</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Conectar con Lista de Tiendas en SharePoint
              </h2>
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
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Cargar Archivo de SharePoint</span>
            {parsedStores.length > 0 && (
              <span className="bg-[#10b981] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {parsedStores.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'live'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>2. Conexión Directa REST / Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('powerautomate')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'powerautomate'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Power Automate (Recomendado)</span>
          </button>
          <button
            onClick={() => setActiveTab('autosync')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'autosync'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Zap className={`w-4 h-4 ${autoSyncConfig.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>4. Auto-Sincronización Permanente</span>
            {autoSyncConfig.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'current'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#0b1c30]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Tiendas Actuales ({currentStores.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: UPLOAD / PASTE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Instructions banner */}
              <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00236f] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#444651]">
                  <strong className="text-[#00236f] block">¿Cómo exportar desde tu lista de SharePoint?</strong>
                  Abre tu lista de tiendas en SharePoint Online (ej. <em>Tiendas Tottus</em>), pulsa el botón superior{' '}
                  <span className="font-semibold bg-white px-1.5 py-0.5 rounded border border-[#dce9ff]">
                    Exportar → Exportar a Excel / CSV
                  </span>{' '}
                  y arrastra el archivo aquí. El sistema detecta automáticamente todas las columnas corporativas (Código, CECO SAP, Cluster, Formato, G Zonal, IT Operator, etc.).
                </div>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#00236f] bg-[#eff4ff]'
                    : 'border-[#c4c6d0] hover:border-[#00236f] hover:bg-[#f8f9ff]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,.json,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-[#eff4ff] text-[#00236f] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#0b1c30]">
                  {fileName ? `Archivo cargado: ${fileName}` : 'Arrastra aquí tu archivo exportado de SharePoint (.CSV, .TSV o .JSON)'}
                </div>
                <p className="text-xs text-[#757682] mt-1">
                  o haz clic para examinar tus archivos en tu computadora
                </p>
              </div>

              {/* Or Paste Raw Text */}
              <div>
                <button
                  type="button"
                  onClick={() => setRawText(rawText ? '' : 'Cod\tTienda\tCentro_Costo_SAP\tCluster\tFORMATO\tG_Zonal\tGerente_Tienda\tIT_Operator\tDireccion\tDistrito\tProvincia\tRegion\tSITUACION')}
                  className="text-xs text-[#00236f] hover:underline font-semibold flex items-center gap-1 mb-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>O pega directamente texto/filas copiadas de SharePoint</span>
                </button>

                {rawText !== '' && (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Pega aquí el contenido con encabezados (separado por comas o tabuladores)..."
                      className="w-full text-xs font-mono p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleProcessContent(rawText, 'datos_pegados.txt')}
                        className="px-4 py-1.5 bg-[#00236f] text-white text-xs font-bold rounded-lg hover:bg-[#1e3a8a]"
                      >
                        Procesar Texto Pegado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {parsingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{parsingError}</span>
                </div>
              )}

              {/* Parsed Preview Section */}
              {parsedStores.length > 0 && (
                <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] space-y-3 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dce9ff] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <h4 className="text-sm font-bold text-[#0b1c30]">
                          {parsedStores.length} Tiendas Detectadas y Mapeadas Correctamente
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#757682] mt-0.5">
                        Columnas reconocidas de SharePoint: {detectedHeaders.slice(0, 6).join(', ')}...
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#444651]">
                        <label className="text-[11px] font-semibold">Modo de sincronización:</label>
                        <select
                          value={syncMode}
                          onChange={(e) => setSyncMode(e.target.value as any)}
                          className="h-8 px-2 text-xs bg-white rounded-lg border border-[#dce9ff] focus:outline-none"
                        >
                          <option value="replace">Reemplazar planilla completa ({parsedStores.length} tiendas)</option>
                          <option value="merge">Combinar / Actualizar existentes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Search inside preview */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                    <input
                      type="text"
                      placeholder="Buscar en vista previa (ej. Megaplaza, 103, Lima, Adrian)..."
                      value={searchPreviewQuery}
                      onChange={(e) => setSearchPreviewQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs bg-white rounded-lg border border-[#dce9ff] focus:outline-none"
                    />
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto border border-[#dce9ff] rounded-xl bg-white max-h-56">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead className="bg-[#f0f4ff] text-[#00236f] font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-3 text-center">CÓDIGO</th>
                          <th className="py-2 px-3">TIENDA</th>
                          <th className="py-2 px-3">SAP (CECO)</th>
                          <th className="py-2 px-3 text-center">CLUSTER</th>
                          <th className="py-2 px-3">FORMATO</th>
                          <th className="py-2 px-3">GERENTE</th>
                          <th className="py-2 px-3">IT OPERATOR</th>
                          <th className="py-2 px-3">CIUDAD / DISTRITO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f4ff]">
                        {filteredPreview.map((s, i) => (
                          <tr key={i} className="hover:bg-[#f8f9ff]">
                            <td className="py-2 px-3 text-center font-mono font-bold text-[#00236f]">
                              {s.codTienda || s.code.replace('T-', '')}
                            </td>
                            <td className="py-2 px-3 font-semibold text-[#0b1c30]">
                              {s.name}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-[#444651]">
                              {s.centroCostoSap || s.cecoSap || '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                                {s.cluster || 'GLP'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#444651]">
                              {s.formato || 'Hiper'}
                            </td>
                            <td className="py-2 px-3 text-[#444651]">
                              {s.gerenteTienda || s.manager}
                            </td>
                            <td className="py-2 px-3 text-[#00236f] font-medium">
                              {s.itOperator || '-'}
                            </td>
                            <td className="py-2 px-3 text-[#757682]">
                              {s.distrito || s.city}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-[#757682]">
                      Mostrando {filteredPreview.length} de {parsedStores.length} tiendas procesadas.
                    </span>

                    <button
                      type="button"
                      onClick={handleConfirmSync}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sincronizar e Integrar a Inventario ({parsedStores.length} Tiendas)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE REST / GRAPH API */}
          {activeTab === 'live' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-start gap-3">
                <Cloud className="w-5 h-5 text-[#00236f] shrink-0 mt-0.5" />
                <div className="text-[#444651]">
                  <strong className="text-[#00236f] block">Conexión en Vivo mediante Microsoft Graph API / SharePoint REST</strong>
                  Permite consultar en tiempo real los registros de la lista de SharePoint sin exportar archivos manualmente.
                  Requiere que proporciones la URL de tu sitio de SharePoint y el nombre exacto de la lista.
                </div>
              </div>

              <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] space-y-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    URL del Sitio de SharePoint <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://tottus.sharepoint.com/sites/MantenimientoIndustrial"
                    className="w-full h-9 px-3 bg-white rounded-lg border border-[#c4c6d0] text-xs focus:outline-none focus:border-[#00236f]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#0b1c30] mb-1">
                      Nombre de la Lista en SharePoint <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="Tiendas"
                      className="w-full h-9 px-3 bg-white rounded-lg border border-[#c4c6d0] text-xs focus:outline-none focus:border-[#00236f]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0b1c30] mb-1">
                      Protocolo API
                    </label>
                    <select className="w-full h-9 px-3 bg-white rounded-lg border border-[#c4c6d0] text-xs focus:outline-none">
                      <option>SharePoint Online REST API v2 (_api/web/lists)</option>
                      <option>Microsoft Graph API v1.0 (/sites/.../lists)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Token de Acceso Bearer / App-Only (Opcional si usas sesión de navegador)
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Bearer eyJ0eXAiOiJKV1QiLC..."
                    className="w-full h-9 px-3 bg-white rounded-lg border border-[#c4c6d0] text-xs font-mono focus:outline-none focus:border-[#00236f]"
                  />
                  <span className="text-[10px] text-[#757682] mt-0.5 block">
                    Puedes generar un token temporal en Microsoft Graph Explorer o registrar una App en Azure AD (Entra ID) con permiso <code>Sites.Read.All</code>.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestLiveConnection}
                    disabled={isConnecting}
                    className="w-full py-2.5 bg-[#00236f] text-white font-bold rounded-xl hover:bg-[#1e3a8a] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>{isConnecting ? 'Consultando Lista en SharePoint...' : 'Conectar y Obtener Tiendas en Vivo'}</span>
                  </button>
                </div>
              </div>

              {connectResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    connectResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {connectResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <div>
                    <strong className="block">{connectResult.message}</strong>
                    {connectResult.count && (
                      <span className="text-[11px] mt-0.5 block">
                        Se cargaron {connectResult.count} tiendas en la pestaña de vista previa. Puedes revisarlas y pulsar &quot;Sincronizar e Integrar a Inventario&quot;.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POWER AUTOMATE FLOW */}
          {activeTab === 'powerautomate' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950">El Método Más Fácil y Aprobado por IT en Tottus / Falabella</strong>
                  En lugar de requerir que el equipo de ciberseguridad apruebe una aplicación en Azure Entra ID, puedes crear un flujo en{' '}
                  <a href="https://make.powerautomate.com" target="_blank" rel="noreferrer" className="underline font-bold text-amber-950">
                    make.powerautomate.com
                  </a>{' '}
                  con tu cuenta institucional (<code>@tottus.com.pe</code>). El flujo lee la lista de SharePoint y envía los datos de forma instantánea.
                </div>
              </div>

              <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] space-y-3">
                <h4 className="font-bold text-[#00236f]">Configura el Webhook de tu Flujo:</h4>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    URL HTTP POST del Flujo de Power Automate
                  </label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://prod-XX.westus.logic.azure.com:443/workflows/..."
                    className="w-full h-9 px-3 bg-white rounded-lg border border-[#c4c6d0] text-xs font-mono focus:outline-none focus:border-[#00236f]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestPowerAutomate}
                  disabled={isCallingWebhook}
                  className="w-full py-2.5 bg-[#00236f] text-white font-bold rounded-xl hover:bg-[#1e3a8a] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCallingWebhook ? 'animate-spin' : ''}`} />
                  <span>{isCallingWebhook ? 'Consultando Flujo de Power Automate...' : 'Disparar Flujo y Traer Tiendas'}</span>
                </button>
              </div>

              {webhookResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    webhookResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {webhookResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{webhookResult.message}</span>
                </div>
              )}

              {/* Step by step guide */}
              <div className="p-4 bg-white rounded-2xl border border-[#dce9ff] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-[#0b1c30]">Cómo crear el flujo en 2 minutos:</h5>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(
                      `// Flujo de Power Automate para Tiendas Tottus\n1. Desencadenador: "Cuando se recibe una solicitud HTTP" (Method: POST)\n2. Acción: "Obtener elementos" de SharePoint (Sitio: tu sitio, Lista: Tiendas)\n3. Acción: "Respuesta" (Body: value de Obtener elementos)`,
                      'flow-guide'
                    )}
                    className="text-xs text-[#00236f] hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'flow-guide' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'flow-guide' ? 'Copiado' : 'Copiar Pasos'}</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#444651] text-[11px] leading-relaxed">
                  <li>Ingresa a <strong>make.powerautomate.com</strong> con tu usuario corporativo.</li>
                  <li>Crea un <strong>Flujo de nube instantáneo</strong> con el desencadenador <em>&quot;Cuando se recibe una solicitud HTTP&quot;</em>.</li>
                  <li>Agrega el paso <strong>SharePoint → Obtener elementos</strong>, seleccionando tu sitio y la lista <em>&quot;Tiendas&quot;</em>.</li>
                  <li>Agrega el paso <strong>Respuesta</strong> y pon en el cuerpo la salida de los elementos de SharePoint (<code>body(&apos;Obtener_elementos&apos;)?['value']</code>).</li>
                  <li>Copia la URL HTTP POST generada y pégala arriba. ¡Listo!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: AUTO-SINCRONIZACIÓN PERMANENTE */}
          {activeTab === 'autosync' && (
            <div className="space-y-4 text-xs">
              {/* Status banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#00236f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30 uppercase tracking-wider">
                        MODO PERMANENTE ACTIVO
                      </span>
                      <span className="text-[11px] text-white/80">LocalStorage + Background Worker</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Auto-Sincronización en Segundo Plano
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Los datos se mantienen de forma indefinida en tu equipo. No requieres volver a conectar cada vez que entras.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsManualSyncing(true);
                      setManualSyncMsg(null);
                      const res = await MicrosoftDataService.runBackgroundSync(currentStores, []);
                      setIsManualSyncing(false);
                      setAutoSyncConfig(MicrosoftDataService.getAutoSyncConfig());
                      setManualSyncMsg(res.message);
                    }}
                    disabled={isManualSyncing}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-sm transition-all text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    <span>{isManualSyncing ? 'Verificando...' : 'Comprobar Ahora'}</span>
                  </button>
                </div>
              </div>

              {manualSyncMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{manualSyncMsg}</span>
                </div>
              )}

              {/* Configuration Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AutoSync Master Switch */}
                <div className="p-4 bg-white rounded-xl border border-[#dce9ff] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#00236f] text-sm">Estado del Servicio</h4>
                      <p className="text-[11px] text-[#757682]">Monitoreo automático periódico</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoSyncConfig.enabled}
                        onChange={(e) => {
                          const updated = MicrosoftDataService.saveAutoSyncConfig({ enabled: e.target.checked });
                          setAutoSyncConfig(updated);
                        }}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#f0f4ff]">
                    <label className="block text-[11px] font-semibold text-[#444651] mb-2">
                      Frecuencia de sincronización continua:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[5, 10, 15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            const updated = MicrosoftDataService.saveAutoSyncConfig({ intervalMinutes: mins });
                            setAutoSyncConfig(updated);
                          }}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            autoSyncConfig.intervalMinutes === mins
                              ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                              : 'bg-white text-[#444651] border-[#e5eeff] hover:bg-[#eff4ff]'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Behavioral Toggles */}
                <div className="p-4 bg-white rounded-xl border border-[#dce9ff] space-y-3">
                  <h4 className="font-bold text-[#00236f] text-sm">Comportamiento Automatizado</h4>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncConfig.syncOnStartup}
                      onChange={(e) => {
                        const updated = MicrosoftDataService.saveAutoSyncConfig({ syncOnStartup: e.target.checked });
                        setAutoSyncConfig(updated);
                      }}
                      className="mt-0.5 rounded text-[#00236f] focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-[#00236f]">Sincronizar al iniciar sesión</div>
                      <div className="text-[10px] text-[#757682]">
                        Comprueba automáticamente si hay cambios en SharePoint al abrir la web.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncConfig.syncUsersAgenda}
                      onChange={(e) => {
                        const updated = MicrosoftDataService.saveAutoSyncConfig({ syncUsersAgenda: e.target.checked });
                        setAutoSyncConfig(updated);
                      }}
                      className="mt-0.5 rounded text-[#00236f] focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-[#00236f]">Auto-incorporar personal a la Agenda</div>
                      <div className="text-[10px] text-[#757682]">
                        Extrae a los Gerentes e IT Operators de las tiendas y los agrega a Directorio.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* FAQ / Persistence Explainer */}
              <div className="p-4 bg-[#eff4ff] rounded-2xl border border-[#dce9ff] space-y-2.5">
                <h5 className="font-bold text-[#00236f] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ¿Cómo funciona la permanencia de datos en Tottus CMMS?
                </h5>
                <ul className="space-y-1.5 text-[11px] text-[#444651] leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Persistencia permanente en el navegador:</strong> Los 90 locales de Tottus con sus datos (código, CECO, dirección, gerente, IT operator, celular) quedan guardados en la memoria persistente del navegador (HTML5 LocalStorage).
                  </li>
                  <li>
                    <strong>Sin reconexión manual obligatoria:</strong> Puedes cerrar el navegador o reiniciar tu equipo; al regresar, todo el inventario, órdenes de trabajo y agenda seguirán cargados.
                  </li>
                  <li>
                    <strong>Actualización sin esfuerzo:</strong> Si tu organización añade tiendas o actualiza encargados en SharePoint, el sistema los detecta y actualiza sin que pierdas tu trabajo.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: CURRENT STORES */}
          {activeTab === 'current' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff]">
                <div>
                  <h4 className="font-bold text-[#0b1c30] text-sm">
                    Tiendas actualmente cargadas en Reliant CMMS ({currentStores.length})
                  </h4>
                  <p className="text-[11px] text-[#757682] mt-0.5">
                    Estas son las sucursales registradas activas en los módulos de Inventario, Helpdesk, OTs e Informes.
                  </p>
                </div>

                {onResetToDefaultStores && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Deseas restablecer la lista de tiendas a la planilla oficial predeterminada de 90 tiendas Tottus?')) {
                        onResetToDefaultStores();
                        alert('Tiendas restablecidas a la planilla corporativa predeterminada.');
                      }
                    }}
                    className="px-3 py-1.5 bg-white text-[#ba1a1a] border border-[#ffdad6] rounded-lg font-semibold hover:bg-red-50 transition-colors self-start sm:self-auto"
                  >
                    Restablecer Planilla Predeterminada
                  </button>
                )}
              </div>

              {/* List */}
              <div className="border border-[#dce9ff] rounded-xl bg-white max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4ff] text-[#00236f] font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 text-center">CÓD</th>
                      <th className="py-2.5 px-3">TIENDA</th>
                      <th className="py-2.5 px-3">SAP (CECO)</th>
                      <th className="py-2.5 px-3 text-center">CLUSTER</th>
                      <th className="py-2.5 px-3">FORMATO</th>
                      <th className="py-2.5 px-3">GERENTE</th>
                      <th className="py-2.5 px-3">IT OPERATOR</th>
                      <th className="py-2.5 px-3">REGIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4ff]">
                    {currentStores.slice(0, 50).map((st, i) => (
                      <tr key={i} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3 text-center font-mono font-bold text-[#00236f]">
                          {st.codTienda || st.code.replace('T-', '')}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#0b1c30]">
                          {st.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#444651]">
                          {st.centroCostoSap || st.cecoSap || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                            {st.cluster || 'GLP'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#444651]">
                          {st.formato || 'Hiper'}
                        </td>
                        <td className="py-2 px-3 text-[#444651]">
                          {st.gerenteTienda || st.manager}
                        </td>
                        <td className="py-2 px-3 text-[#00236f] font-medium">
                          {st.itOperator || '-'}
                        </td>
                        <td className="py-2 px-3 text-[#757682]">
                          {st.region}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center justify-between">
          <div className="text-[11px] text-[#757682]">
            Mercados Tottus S.A. · Integración con Microsoft 365 SharePoint Online
          </div>
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
