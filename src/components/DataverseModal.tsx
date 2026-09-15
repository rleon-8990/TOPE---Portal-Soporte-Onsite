import React, { useState } from 'react';
import {
  Database,
  X,
  Copy,
  Check,
  Code,
  Table,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Terminal,
  Zap,
  Download,
  Key,
  Layers,
  Globe
} from 'lucide-react';
import { Store } from '../types';
import {
  DATAVERSE_CODE_SNIPPETS,
  DATAVERSE_STORE_SCHEMA,
  DATAVERSE_TABLES,
  DEFAULT_DATAVERSE_CONFIG,
  DataverseConfig,
  queryDataverseLive
} from '../services/dataverseService';

interface DataverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncStores?: (syncedStores: Partial<Store>[]) => void;
  currentStoresCount: number;
}

export const DataverseModal: React.FC<DataverseModalProps> = ({
  isOpen,
  onClose,
  onSyncStores,
  currentStoresCount
}) => {
  const [activeTab, setActiveTab] = useState<'snippets' | 'schema' | 'live'>('snippets');
  const [activeSnippetTab, setActiveSnippetTab] = useState<'nodejs' | 'curl' | 'powerautomate'>('nodejs');
  const [selectedTableId, setSelectedTableId] = useState<string>('cr_cmms_tiendas');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live connection state
  const [config, setConfig] = useState<DataverseConfig>({ ...DEFAULT_DATAVERSE_CONFIG });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success?: boolean;
    message?: string;
    count?: number;
  } | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    const result = await queryDataverseLive(config);
    setTestingConnection(false);

    if (result.success) {
      setConnectionResult({
        success: true,
        message: `Conexión exitosa. Se detectaron ${result.count || 0} registros en la tabla ${config.entityPluralName}.`,
        count: result.count
      });
      if (onSyncStores && result.stores && result.stores.length > 0) {
        onSyncStores(result.stores);
      }
    } else {
      setConnectionResult({
        success: false,
        message: result.error || 'Error al conectar con la Web API de Dataverse.'
      });
    }
  };

  const exportSchemaAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(DATAVERSE_STORE_SCHEMA, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'dataverse_tottus_cmms_schema.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-[#dce9ff]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00236f] text-white flex items-center justify-center shadow-md shrink-0">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                Integración con Microsoft Dataverse
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-300">
                  OData v9.2
                </span>
              </h3>
              <p className="text-xs text-[#757682]">
                Líneas de código establecidas, autenticación con Microsoft Entra ID (Azure AD) y mapeo de tablas existentes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#757682] p-1.5 rounded-lg hover:bg-slate-100 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5eeff] gap-2">
          <button
            onClick={() => setActiveTab('snippets')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'snippets'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#00236f]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Líneas con Códigos Establecidos</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'schema'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#00236f]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Esquema de Columnas Existentes</span>
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
              {DATAVERSE_STORE_SCHEMA.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'live'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#757682] hover:text-[#00236f]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Conectar y Sincronizar en Vivo</span>
          </button>
        </div>

        {/* TAB 1: CODE SNIPPETS */}
        {activeTab === 'snippets' && (
          <div className="space-y-4">
            {/* Sub-tab selection for snippet language */}
            <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded-xl text-xs font-medium">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveSnippetTab('nodejs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSnippetTab === 'nodejs'
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Node.js / Express (MSAL + OData)</span>
                </button>

                <button
                  onClick={() => setActiveSnippetTab('curl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSnippetTab === 'curl'
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>cURL / Postman / REST</span>
                </button>

                <button
                  onClick={() => setActiveSnippetTab('powerautomate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSnippetTab === 'powerautomate'
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Power Automate Webhook (No-Code)</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const text =
                    activeSnippetTab === 'nodejs'
                      ? DATAVERSE_CODE_SNIPPETS.nodeJsBackend
                      : activeSnippetTab === 'curl'
                      ? DATAVERSE_CODE_SNIPPETS.curlTest
                      : DATAVERSE_CODE_SNIPPETS.powerAutomateWebhook;
                  copyToClipboard(text, activeSnippetTab);
                }}
                className="px-3 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copiedKey === activeSnippetTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Snippet display box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-inner overflow-hidden">
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-h-[50vh]">
                {activeSnippetTab === 'nodejs' && DATAVERSE_CODE_SNIPPETS.nodeJsBackend}
                {activeSnippetTab === 'curl' && DATAVERSE_CODE_SNIPPETS.curlTest}
                {activeSnippetTab === 'powerautomate' && DATAVERSE_CODE_SNIPPETS.powerAutomateWebhook}
              </pre>
            </div>

            {/* Quick guide steps */}
            <div className="bg-[#f0f4ff] p-3.5 rounded-xl border border-[#dce9ff] text-xs space-y-2">
              <h4 className="font-bold text-[#00236f] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00873d]" />
                Pasos para activar la conexión en Microsoft Entra ID (Azure AD):
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-[#00236f]/80 pl-1 text-[11.5px]">
                <li>
                  Registrar una App en <strong>portal.azure.com</strong> &rarr; Azure Active Directory &rarr; App registrations.
                </li>
                <li>
                  En <strong>API Permissions</strong>, añadir permiso delegado o de aplicación para <strong>Dynamics CRM / Dataverse</strong> (permiso <code className="bg-white px-1 py-0.5 rounded text-[#00236f] font-mono">user_impersonation</code> o permiso de Servicio).
                </li>
                <li>
                  En <strong>Certificates & secrets</strong>, crear un <em>Client Secret</em> y guardarlo en el archivo <code className="bg-white px-1 py-0.5 rounded text-[#00236f] font-mono">.env</code> de su servidor.
                </li>
                <li>
                  En el Centro de Administración de Power Platform, registrar el Application User con el rol de seguridad <strong>System Customizer</strong> o de acceso a la tabla <code className="bg-white px-1 py-0.5 rounded text-[#00236f] font-mono">cr_cmms_tiendas</code>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEMA MAPPING */}
        {activeTab === 'schema' && (() => {
          const currentTable = DATAVERSE_TABLES.find(t => t.id === selectedTableId) || DATAVERSE_TABLES[0];
          const activeSchema = currentTable.schema;

          return (
            <div className="space-y-3">
              {/* Table Selector Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DATAVERSE_TABLES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTableId(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedTableId === t.id
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t.name}</span>
                    <code className="text-[10px] opacity-80">({t.id})</code>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <h4 className="font-bold text-xs text-[#00236f]">
                    Tabla Seleccionada: <code className="bg-[#eff4ff] text-[#00236f] px-1.5 py-0.5 rounded font-mono">{currentTable.id}</code>
                  </h4>
                  <p className="text-[11px] text-[#757682]">
                    {currentTable.description} &bull; {activeSchema.length} columnas mapeadas con Dataverse OData v9.2
                  </p>
                </div>

                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeSchema, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `${currentTable.id}_schema.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#00236f] font-bold text-xs rounded-lg flex items-center gap-1.5 border border-[#c5c5d3] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar JSON ({currentTable.id})</span>
                </button>
              </div>

              <div className="border border-[#e2edff] rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                      <th className="py-2.5 px-3">Columna en Dataverse</th>
                      <th className="py-2.5 px-3">Nombre Lógico / Display</th>
                      <th className="py-2.5 px-3">Tipo de Dato</th>
                      <th className="py-2.5 px-3">Campo en la App</th>
                      <th className="py-2.5 px-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4ff]">
                    {activeSchema.map(col => (
                      <tr
                        key={col.dataverseColumn}
                        className={`hover:bg-[#fbfdff] ${col.isCoordinate ? 'bg-emerald-50/50 font-medium' : ''}`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00236f]">
                          <span className="flex items-center gap-1.5">
                            {col.dataverseColumn}
                            {col.isCoordinate && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">
                                GPS
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">{col.displayName}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {col.dataType}
                          {col.precision && ` (${col.precision}, ${col.scale})`}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                          {String(col.appField)}
                        </td>
                        <td className="py-2.5 px-3 text-[#757682] text-[11px]">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: LIVE CONNECTION & SYNC */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="bg-[#f8faff] p-4 rounded-xl border border-[#e2edff] space-y-3">
              <h4 className="font-bold text-xs text-[#00236f] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#00873d]" />
                Parámetros de Entorno de Microsoft Dataverse (Dynamics 365)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    URL de la Organización (Dynamics/Dataverse)
                  </label>
                  <input
                    type="text"
                    value={config.environmentUrl}
                    onChange={e => setConfig({ ...config, environmentUrl: e.target.value })}
                    placeholder="https://tottus-corp.crm.dynamics.com"
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Nombre Plural de la Entidad / Tabla
                  </label>
                  <input
                    type="text"
                    value={config.entityPluralName}
                    onChange={e => setConfig({ ...config, entityPluralName: e.target.value })}
                    placeholder="cr_cmms_tiendas"
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono font-bold text-[#00236f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 flex justify-between items-center">
                  <span>Token Bearer de Acceso (OAuth 2.0)</span>
                  <span className="text-[10px] text-[#757682] font-normal">
                    Obtenido desde Azure AD con el scope https://tottus-corp.crm.dynamics.com/.default
                  </span>
                </label>
                <textarea
                  value={config.accessToken || ''}
                  onChange={e => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="Pegue aquí el token Bearer generado por su script de backend o cURL..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#00236f]/30"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Conectando...' : 'Probar Conexión OData'}</span>
                </button>
              </div>
            </div>

            {/* Connection result notice */}
            {connectionResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                  connectionResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {connectionResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold">{connectionResult.success ? 'Conexión Exitosa' : 'Aviso de Conexión'}</p>
                  <p className="text-[11.5px] mt-0.5">{connectionResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#e5eeff]">
          <span className="text-xs text-[#757682]">
            Tiendas activas en el sistema: <strong className="text-[#00236f]">{currentStoresCount} sucursales oficiales</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
