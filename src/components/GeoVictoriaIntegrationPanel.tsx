import React, { useState } from 'react';
import {
  Fingerprint,
  ScanFace,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link,
  ShieldCheck,
  Zap,
  Clock,
  Building2,
  UserCheck,
  Radio,
  Copy,
  Check,
  Send,
  Sliders,
  Sparkles,
  Search,
  ExternalLink,
  Terminal
} from 'lucide-react';
import {
  GeoVictoriaConfig,
  GeoVictoriaPunchRecord,
  AppUser,
  Store,
  AttendanceLog
} from '../types';
import {
  saveGeoVictoriaConfig,
  saveGeoVictoriaPunches,
  convertPunchToAttendanceLog
} from '../services/geoVictoriaService';

interface GeoVictoriaIntegrationPanelProps {
  config: GeoVictoriaConfig;
  punches: GeoVictoriaPunchRecord[];
  users: AppUser[];
  stores: Store[];
  onUpdateConfig: (newConfig: GeoVictoriaConfig) => void;
  onReceivePunch: (punch: GeoVictoriaPunchRecord) => void;
  onBulkSyncPunches: (newPunches: GeoVictoriaPunchRecord[]) => void;
}

export const GeoVictoriaIntegrationPanel: React.FC<GeoVictoriaIntegrationPanelProps> = ({
  config,
  punches,
  users,
  stores,
  onUpdateConfig,
  onReceivePunch,
  onBulkSyncPunches,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Simulation form state
  const [simUserDni, setSimUserDni] = useState(users[0]?.dni || '44892110');
  const [simStoreCod, setSimStoreCod] = useState<number | string>(stores[0]?.codTienda || 103);
  const [simTipo, setSimTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [simMetodo, setSimMetodo] = useState<'reconocimiento_facial' | 'huella_dactilar' | 'app_geocerca'>('reconocimiento_facial');
  const [simDeviceName, setSimDeviceName] = useState('Reloj Biométrico ZKTeco ProFace Tottus');

  // Config form state
  const [formConfig, setFormConfig] = useState<GeoVictoriaConfig>({ ...config });

  const notify = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(config.webhookEndpoint);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    notify('URL de Webhook copiada al portapapeles');
  };

  const handleSaveConfig = () => {
    onUpdateConfig(formConfig);
    saveGeoVictoriaConfig(formConfig);
    setShowConfigModal(false);
    notify('Configuración de GeoVictoria guardada exitosamente');
  };

  const handleManualSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simular sincronización con GeoVictoria API
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const isoTime = now.toISOString();

      const newConfig: GeoVictoriaConfig = {
        ...config,
        lastSyncTimestamp: isoTime,
        lastSyncStatus: 'connected',
        lastSyncMessage: `Sincronización manual completada a las ${timeFormatted} - 5 registros actualizados`,
        syncedTodayCount: config.syncedTodayCount + 1
      };

      onUpdateConfig(newConfig);
      saveGeoVictoriaConfig(newConfig);
      setIsSyncing(false);
      notify('Sincronización con GeoVictoria exitosa: marcaciones actualizadas');
    }, 1200);
  };

  const handleSimulatePunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = users.find(u => (u.dni && u.dni === simUserDni) || u.id === simUserDni) || users[0];
    const matchedStore = stores.find(s => String(s.codTienda) === String(simStoreCod) || s.id === String(simStoreCod)) || stores[0];

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const isoTime = now.toISOString();

    const newPunch: GeoVictoriaPunchRecord = {
      id: `gv-punch-${Date.now()}`,
      rutDni: matchedUser.dni || simUserDni,
      colaboradorNombre: matchedUser.name,
      colaboradorId: matchedUser.id,
      fechaHora: isoTime,
      horaFormato: timeFormatted,
      tipo: simTipo,
      dispositivo: simDeviceName || (simMetodo === 'reconocimiento_facial' ? `Bio Facial Tottus ${matchedStore.name}` : `Reloj Huella ${matchedStore.name}`),
      metodo: simMetodo,
      codTienda: matchedStore.codTienda || 103,
      nombreTienda: matchedStore.name,
      latitud: matchedStore.latitud,
      longitud: matchedStore.longitud,
      estado: 'sincronizado'
    };

    onReceivePunch(newPunch);
    setShowSimulateModal(false);
    notify(`Marcación [${simTipo}] de ${matchedUser.name} en ${matchedStore.name} recibida desde GeoVictoria`);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.dni && u.dni.includes(searchUserQuery)) ||
    (u.tiendaNombre && u.tiendaNombre.toLowerCase().includes(searchUserQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {feedbackNotice && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{feedbackNotice}</span>
          </div>
        </div>
      )}

      {/* Hero Card: GeoVictoria Integration Status */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-xl p-6 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 -skew-x-12 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Conector GeoVictoria Cloud Activo
              </span>
              <span className="text-xs text-emerald-200/80">Tottus Perú Operaciones</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sincronización Automática con GeoVictoria
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              El personal técnico y operadores onsite registran su asistencia directamente en los relojes biométricos (huella dactilar, reconocimiento facial ZKTeco) o en la app GeoVictoria de sus celulares. <strong>No requieren cargar registros manuales</strong>: cada marcación se procesa en tiempo real vía Webhook y actualiza la ubicación y estado en tienda de inmediato.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleManualSyncNow}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Consultando API...' : 'Sincronizar Marcaciones'}
            </button>
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-sm border border-white/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Simular Marcación en Vivo
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/15 text-emerald-200 font-medium rounded-lg text-sm border border-emerald-500/30 transition flex items-center gap-2"
              title="Configuración de Endpoints y Secretos"
            >
              <Sliders className="w-4 h-4" />
              Ajustes
            </button>
          </div>
        </div>

        {/* Integration Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-emerald-700/40">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-emerald-200/70 block">Estado del Servicio</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-emerald-300">Conectado (200 OK)</span>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-emerald-200/70 block">Marcaciones Hoy</span>
            <div className="text-lg font-bold text-white mt-0.5">{config.syncedTodayCount} eventos</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-emerald-200/70 block">Última Sincronización</span>
            <div className="text-sm font-semibold text-emerald-200 mt-1">
              {config.lastSyncTimestamp ? new Date(config.lastSyncTimestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-emerald-200/70 block">Modo de Ingesta</span>
            <div className="text-sm font-semibold text-emerald-200 mt-1">Webhook Push + Polling 5m</div>
          </div>
        </div>
      </div>

      {/* Webhook URL quick copy bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Webhook HTTPS para GeoVictoria
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra este endpoint en el portal administrativo de GeoVictoria (portal.geovictoria.com) para recibir las marcaciones al instante.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 select-all max-w-xs md:max-w-md truncate">
            {config.webhookEndpoint}
          </code>
          <button
            onClick={handleCopyWebhook}
            className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 transition flex items-center gap-1 text-xs font-medium"
            title="Copiar URL de Webhook"
          >
            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedWebhook ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Enrolled Technicians & Recent Live Punches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Enrolled Collaborators (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Enrolamiento de Técnicos en GeoVictoria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vinculación de DNI / RUT para conciliación de huellas y rostros en los 90 locales Tottus
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Buscar por DNI o nombre..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Colaborador</th>
                  <th className="px-3 py-2.5">DNI / RUT</th>
                  <th className="px-3 py-2.5">Biometría GeoVictoria</th>
                  <th className="px-3 py-2.5">Tienda Base</th>
                  <th className="px-3 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredUsers.slice(0, 8).map((user, idx) => {
                  const dniDisplay = user.dni || `44${892000 + idx}`;
                  const methodDisplay = idx % 2 === 0 ? 'facial' : 'huella';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-white block">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {user.cargo || user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                        {dniDisplay}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {methodDisplay === 'facial' ? (
                            <ScanFace className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Fingerprint className="w-3 h-3 text-teal-600" />
                          )}
                          {methodDisplay === 'facial' ? 'Facial ZKTeco' : 'Huella Dactilar'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {user.tiendaNombre ? (
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            T-{user.codTienda} {user.tiendaNombre}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Itinerante / Volante</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => {
                            setSimUserDni(dniDisplay);
                            setSimStoreCod(user.codTienda || stores[0]?.codTienda || 103);
                            setShowSimulateModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Simular Marca
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: Recent Punches Log from GeoVictoria (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-600" />
                  Marcaciones Recibidas (En Vivo)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Eventos entrantes procesados automáticamente
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                {punches.length} hoy
              </span>
            </div>

            <div className="space-y-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
              {punches.map((punch) => (
                <div
                  key={punch.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          punch.tipo === 'ENTRADA'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {punch.tipo}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {punch.colaboradorNombre}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {punch.horaFormato}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      T-{punch.codTienda} {punch.nombreTienda}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      DNI: {punch.rutDni}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[200px]" title={punch.dispositivo}>
                      {punch.dispositivo}
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Auto Check-in OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <span>Sincronización continua de marcas</span>
            <button
              onClick={handleManualSyncNow}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refrescar lista
            </button>
          </div>
        </div>
      </div>

      {/* Integration Technical Specifications (For IT & Operations) */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Especificación de Integración para TI Tottus & GeoVictoria
          </h3>
          <span className="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
            API REST v1.2 / Webhook JSON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-300">Método 1: Webhook Push en Tiempo Real (Recomendado)</h4>
            <p className="text-slate-400 leading-relaxed">
              GeoVictoria despacha un HTTP POST cada vez que un técnico marca su huella o rostro en cualquiera de los relojes de las 90 tiendas o en la app móvil. El CMMS lo procesa inmediatamente en menos de 200ms sin intervención humana.
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-emerald-200 overflow-x-auto">
              {`POST /api/webhooks/geovictoria/punch HTTP/1.1
Content-Type: application/json
X-GeoVictoria-Signature: sha256=...

{
  "rut_dni": "44892110",
  "fecha_hora": "2026-09-09T08:15:00",
  "tipo": "ENTRADA",
  "id_sucursal": "103",
  "nombre_sucursal": "Megaplaza Angamas",
  "metodo": "reconocimiento_facial",
  "dispositivo": "ZKTeco ProFace Tottus 01"
}`}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-300">Método 2: Polling Periódico API REST GeoVictoria</h4>
            <p className="text-slate-400 leading-relaxed">
              El CMMS consulta automáticamente cada 5 o 10 minutos el endpoint oficial <code className="text-emerald-300 font-mono">GET /api/v1/punches</code> autenticado con la API Key corporativa de Tottus Perú para importar las marcaciones consolidadas del día.
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-slate-300 overflow-x-auto">
              {`curl -X GET "https://api.geovictoria.com/v1/punches?company=TOTTUS_PE&date=2026-09-09" \\
  -H "Authorization: Bearer gv_live_tottus_pe_99812x84" \\
  -H "Accept: application/json"`}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Simulate Punch from GeoVictoria */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Simular Marcación en Vivo de GeoVictoria
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Genera una marcación idéntica a la que emite un reloj control biométrico o la app GeoVictoria para comprobar cómo el CMMS actualiza la tienda y presencia del técnico automáticamente.
            </p>

            <form onSubmit={handleSimulatePunchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Colaborador Técnico
                </label>
                <select
                  value={simUserDni}
                  onChange={(e) => setSimUserDni(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {users.map((u, i) => (
                    <option key={u.id} value={u.dni || u.id}>
                      {u.name} (DNI: {u.dni || `448920${i}`}) - {u.cargo || u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tienda Tottus
                  </label>
                  <select
                    value={simStoreCod}
                    onChange={(e) => setSimStoreCod(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.codTienda}>
                        T-{s.codTienda} {s.name} ({s.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Marcación
                  </label>
                  <select
                    value={simTipo}
                    onChange={(e) => setSimTipo(e.target.value as 'ENTRADA' | 'SALIDA')}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-700 dark:text-emerald-400"
                  >
                    <option value="ENTRADA">ENTRADA (Ingreso a Tienda)</option>
                    <option value="SALIDA">SALIDA (Cierre de Jornada)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Método Biométrico
                  </label>
                  <select
                    value={simMetodo}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setSimMetodo(val);
                      if (val === 'reconocimiento_facial') setSimDeviceName('Bio Facial ZKTeco ProFace Tottus');
                      else if (val === 'huella_dactilar') setSimDeviceName('Reloj Biométrico Huella Digital Tottus');
                      else setSimDeviceName('App GeoVictoria Móvil GPS');
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="reconocimiento_facial">Reconocimiento Facial (ZKTeco ProFace)</option>
                    <option value="huella_dactilar">Huella Dactilar (Reloj Control)</option>
                    <option value="app_geocerca">App GeoVictoria Móvil (Geocerca)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Identificador de Dispositivo
                  </label>
                  <input
                    type="text"
                    value={simDeviceName}
                    onChange={(e) => setSimDeviceName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Al pulsar emitir, el CMMS simula el webhook entrante, registra el check-in automático y traslada al técnico al radar de la tienda seleccionada.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Emitir Marcación de Prueba
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Config GeoVictoria */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Parámetros de Integración GeoVictoria
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL de la API GeoVictoria
                </label>
                <input
                  type="text"
                  value={formConfig.apiUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, apiUrl: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key / Token de Autenticación
                </label>
                <input
                  type="password"
                  value={formConfig.apiKey}
                  onChange={(e) => setFormConfig({ ...formConfig, apiKey: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Empresa
                  </label>
                  <input
                    type="text"
                    value={formConfig.companyCode}
                    onChange={(e) => setFormConfig({ ...formConfig, companyCode: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intervalo de Polling (minutos)
                  </label>
                  <select
                    value={formConfig.autoSyncIntervalMinutes}
                    onChange={(e) => setFormConfig({ ...formConfig, autoSyncIntervalMinutes: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={2}>Cada 2 minutos</option>
                    <option value={5}>Cada 5 minutos</option>
                    <option value={10}>Cada 10 minutos</option>
                    <option value={15}>Cada 15 minutos</option>
                    <option value={30}>Cada 30 minutos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook Endpoint de Recepción
                </label>
                <input
                  type="text"
                  value={formConfig.webhookEndpoint}
                  onChange={(e) => setFormConfig({ ...formConfig, webhookEndpoint: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoCheckInOnPunch"
                  checked={formConfig.autoCheckInOnPunch}
                  onChange={(e) => setFormConfig({ ...formConfig, autoCheckInOnPunch: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="autoCheckInOnPunch" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Crear automáticamente Check-in en radar cuando GeoVictoria reporte ingreso
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
