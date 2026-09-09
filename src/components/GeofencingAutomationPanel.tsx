import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Smartphone,
  MapPin,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Zap,
  ArrowRight,
  Download,
  Share2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  BellRing,
  LocateFixed
} from 'lucide-react';
import { Store, AppUser, AttendanceLog, GeofencingConfig } from '../types';
import {
  findNearestTottusStore,
  calculateDistanceMeters,
  DEFAULT_GEOFENCING_CONFIG
} from '../services/geofenceService';

interface GeofencingAutomationPanelProps {
  stores: Store[];
  currentUser: AppUser;
  onAutoCheckIn: (store: Store, distanceMeters: number, coords: { lat: number; lng: number }) => void;
  onAutoCheckOut?: (store: Store) => void;
}

export const GeofencingAutomationPanel: React.FC<GeofencingAutomationPanelProps> = ({
  stores,
  currentUser,
  onAutoCheckIn,
  onAutoCheckOut,
}) => {
  const [config, setConfig] = useState<GeofencingConfig>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_geofencing_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_GEOFENCING_CONFIG;
  });

  const [isTracking, setIsTracking] = useState(false);
  const [currentLat, setCurrentLat] = useState<number | null>(-11.99360537); // Default near Megaplaza Angamas
  const [currentLng, setCurrentLng] = useState<number | null>(-77.0620619);
  const [accuracy, setAccuracy] = useState<number | null>(8);
  const [lastCheckInStoreId, setLastCheckInStoreId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [simSelectedStoreId, setSimSelectedStoreId] = useState<string>(stores[0]?.id || 'store-103');

  const watchIdRef = useRef<number | null>(null);

  const notify = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const saveConfig = (newCfg: GeofencingConfig) => {
    setConfig(newCfg);
    try {
      localStorage.setItem('reliant_cmms_geofencing_config', JSON.stringify(newCfg));
    } catch (e) {}
  };

  // Calculate nearest store
  const nearestResult = React.useMemo(() => {
    if (currentLat === null || currentLng === null) return null;
    return findNearestTottusStore(currentLat, currentLng, stores, config.radiusMeters);
  }, [currentLat, currentLng, stores, config.radiusMeters]);

  // Handle GPS tracking toggling
  const startRealGpsTracking = () => {
    if (!('geolocation' in navigator)) {
      notify('Geolocalización no soportada en este navegador');
      return;
    }

    setIsTracking(true);
    notify('Buscando señal GPS de alta precisión en su dispositivo...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setCurrentLat(lat);
        setCurrentLng(lng);
        setAccuracy(acc);

        // Check geofence
        const res = findNearestTottusStore(lat, lng, stores, config.radiusMeters);
        if (res && res.isInsideGeofence) {
          if (config.autoCheckIn && lastCheckInStoreId !== res.store.id) {
            setLastCheckInStoreId(res.store.id);
            onAutoCheckIn(res.store, res.distanceMeters, { lat, lng });
            notify(`¡Geocerca Activada! Check-In automático registrado en ${res.store.name} (${res.distanceMeters}m)`);
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        notify('Aviso: Activa los permisos de ubicación o usa el simulador para probar');
      },
      {
        enableHighAccuracy: config.highAccuracy,
        maximumAge: 10000,
        timeout: 15000
      }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    notify('Monitoreo GPS en vivo pausado');
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Simulator handler: jump near a store
  const handleSimulateStoreLocation = (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    if (!target || typeof target.latitud !== 'number' || typeof target.longitud !== 'number') return;

    // Simulate location 45 meters offset from store coordinates
    const simulatedLat = target.latitud + 0.0002;
    const simulatedLng = target.longitud + 0.0002;
    const simulatedAccuracy = 5;

    setCurrentLat(simulatedLat);
    setCurrentLng(simulatedLng);
    setAccuracy(simulatedAccuracy);

    const dist = calculateDistanceMeters(simulatedLat, simulatedLng, target.latitud, target.longitud);

    if (config.autoCheckIn) {
      setLastCheckInStoreId(target.id);
      onAutoCheckIn(target, dist, { lat: simulatedLat, lng: simulatedLng });
      notify(`Check-In Automático por Geocerca: Has ingresado a T-${target.codTienda} ${target.name} (Distancia: ${dist}m)`);
    } else {
      notify(`Ubicación simulada a ${dist}m de T-${target.codTienda} ${target.name}`);
    }
  };

  // Simulate leaving store / in transit
  const handleSimulateLeaving = () => {
    // Offset by ~3 kilometers into a transit avenue
    if (currentLat && currentLng) {
      setCurrentLat(currentLat + 0.025);
      setCurrentLng(currentLng + 0.025);
      setAccuracy(15);
      setLastCheckInStoreId(null);
      notify('Ubicación actualizada: Personal en traslado fuera del perímetro de tiendas (> 2.8 km)');
    }
  };

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg border border-blue-700/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-blue-400 animate-pulse" />
                Geocercas GPS & Detección en Celular
              </span>
              <span className="text-xs text-blue-200/80">90 Tiendas Georreferenciadas</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Detección Automática de Presencia Onsite
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Al instalar el sistema como aplicación en el celular de los técnicos (PWA), el dispositivo monitorea su ubicación en segundo plano. Cuando el colaborador ingresa al radio de <strong>{config.radiusMeters} metros</strong> de cualquier tienda Tottus, <strong>el check-in se registra automáticamente</strong> con coordenadas certificadas sin necesidad de interacción manual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isTracking ? (
              <button
                onClick={startRealGpsTracking}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center gap-2 shadow-sm"
              >
                <LocateFixed className="w-4 h-4" />
                Activar Sensor GPS en este Dispositivo
              </button>
            ) : (
              <button
                onClick={stopGpsTracking}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-sm transition flex items-center gap-2 shadow-sm animate-pulse"
              >
                <Radio className="w-4 h-4 text-rose-200" />
                Detener Sensor GPS
              </button>
            )}
          </div>
        </div>

        {/* Live Tracking Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-blue-700/40">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-blue-200/70 block">Estado del Receptor GPS</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
              <span className="text-sm font-semibold text-white">
                {isTracking ? 'Monitoreando en Vivo' : 'En Espera / Listo'}
              </span>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-blue-200/70 block">Precisión Satelital</span>
            <div className="text-sm font-semibold text-blue-100 mt-1">
              {accuracy ? `± ${accuracy} metros` : 'Calibrando...'}
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-blue-200/70 block">Radio de Geocerca</span>
            <div className="text-sm font-semibold text-blue-100 mt-1">{config.radiusMeters} metros</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
            <span className="text-xs text-blue-200/70 block">Auto Check-In</span>
            <div className="text-sm font-semibold text-emerald-300 mt-1">
              {config.autoCheckIn ? 'Habilitado (Automático)' : 'Solo Notificar'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Nearest Store Radar & How to Install Service */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Live Radar / Position Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Detección de Tienda Más Cercana
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cálculo geodésico Haversine comparado contra las 90 tiendas de la cadena
              </p>
            </div>
            {nearestResult?.isInsideGeofence ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                DENTRO DE LA TIENDA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                Fuera de Tienda / En Traslado
              </span>
            )}
          </div>

          {nearestResult && (
            <div className="p-5 rounded-xl border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Sucursal Detectada
                  </span>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    T-{nearestResult.store.codTienda} {nearestResult.store.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {nearestResult.store.direccion || nearestResult.store.address} - {nearestResult.store.region}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-right sm:text-center min-w-[130px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Distancia GPS</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">
                    {nearestResult.distanceMeters}
                    <span className="text-xs font-normal text-slate-500 ml-1">metros</span>
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-500">
                    Límite: {config.radiusMeters}m
                  </span>
                </div>
              </div>

              {/* Progress Bar Distance vs Radius */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>Proximidad a la Tienda</span>
                  <span>
                    {nearestResult.distanceMeters <= config.radiusMeters
                      ? '✓ En rango de geocerca'
                      : `A ${nearestResult.distanceMeters - config.radiusMeters}m de ingresar al perímetro`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      nearestResult.isInsideGeofence
                        ? 'bg-emerald-500'
                        : nearestResult.distanceMeters < 500
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.max(
                        10,
                        Math.min(
                          100,
                          Math.round((config.radiusMeters / Math.max(nearestResult.distanceMeters, 1)) * 100)
                        )
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* GPS Coordinates readout */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Latitud Actual</span>
                  <span>{currentLat?.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Longitud Actual</span>
                  <span>{currentLng?.toFixed(6)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Simulator Bar */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Simulador de Presencia Onsite (Pruebas)
              </h4>
              <span className="text-[11px] text-blue-700 dark:text-blue-300">
                Prueba cómo el sistema detecta la llegada
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={simSelectedStoreId}
                onChange={(e) => setSimSelectedStoreId(e.target.value)}
                className="flex-1 text-xs p-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    T-{s.codTienda} {s.name} ({s.region})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleSimulateStoreLocation(simSelectedStoreId)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5" />
                Simular Llegada a esta Tienda
              </button>

              <button
                onClick={handleSimulateLeaving}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg transition whitespace-nowrap"
              >
                Simular Traslado
              </button>
            </div>
          </div>
        </div>

        {/* Col 2: Setup Instructions on Technician's Phone (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                Instalación del Servicio en el Celular
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paso a paso para enrolar los teléfonos de la cuadrilla técnica
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-slate-800 dark:text-white block">Instalar la App (PWA)</strong>
                <span>El técnico abre el enlace del CMMS en Google Chrome (Android) o Safari (iPhone) y selecciona <em>"Agregar a la pantalla de inicio"</em> o <em>"Instalar Aplicación"</em>.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-slate-800 dark:text-white block">Permisos de Ubicación</strong>
                <span>Al abrir la app por primera vez, seleccionar <strong>"Permitir siempre"</strong> en los permisos de GPS para que el servicio de geocerca opere en segundo plano.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-slate-800 dark:text-white block">Auto Check-In Sin Fricción</strong>
                <span>Al cruzar la puerta de la tienda Tottus, el teléfono calcula la geocerca satelital y confirma su ingreso en el radar de supervisión sin que el técnico deba pulsar botones.</span>
              </div>
            </div>
          </div>

          {/* Geofence Parameters Settings */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Parámetros de Geocerca
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Radio de Geocerca (Metros)
                </label>
                <select
                  value={config.radiusMeters}
                  onChange={(e) => saveConfig({ ...config, radiusMeters: Number(e.target.value) })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={80}>80 metros (Muy Estricto)</option>
                  <option value={150}>150 metros (Recomendado)</option>
                  <option value={250}>250 metros (Amplio)</option>
                  <option value={400}>400 metros (Centro Comercial)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Modo de Operación
                </label>
                <select
                  value={config.autoCheckIn ? 'auto' : 'notify'}
                  onChange={(e) => saveConfig({ ...config, autoCheckIn: e.target.value === 'auto' })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="auto">Auto Check-In Inmediato</option>
                  <option value="notify">Solo Solicitar Confirmación</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="highAccuracyCheck"
                checked={config.highAccuracy}
                onChange={(e) => saveConfig({ ...config, highAccuracy: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="highAccuracyCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Alta Precisión GPS (Recomendado para centros comerciales y subterráneos)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
