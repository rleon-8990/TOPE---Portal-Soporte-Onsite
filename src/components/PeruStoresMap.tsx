import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Store as StoreIcon,
  ShoppingBag,
  Home,
  Boxes,
  Package,
  Compass,
  Phone,
  Mail,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Store } from '../types';
import {
  TOTTUS_FORMATS,
  PRECIO_UNO_FORMATS,
  STORE_FORMAT_CONFIG,
  normalizeStoreFormat,
  getStoreEmpresa
} from '../utils/storeFormats';

interface PeruStoresMapProps {
  stores: Store[];
  onSelectStore?: (store: Store) => void;
  onOpenReportModal?: (store: Store) => void;
  selectedStoreId?: string;
  className?: string;
}

// Coordenadas fijas para macro-regiones peruanas
const REGION_BOUNDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'all': { lat: -9.189967, lng: -75.015152, zoom: 6 },
  'Lima y Callao': { lat: -12.046374, lng: -77.042793, zoom: 11 },
  'Zona Norte': { lat: -6.5, lng: -79.5, zoom: 7 },
  'Zona Sur': { lat: -15.5, lng: -71.5, zoom: 7 },
  'Zona Centro': { lat: -11.5, lng: -75.5, zoom: 7 },
  'Zona Oriente': { lat: -6.0, lng: -75.0, zoom: 6 }
};

export const PeruStoresMap: React.FC<PeruStoresMapProps> = ({
  stores,
  onSelectStore,
  onOpenReportModal,
  selectedStoreId,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filtros principales solicitados
  const [selectedEmpresa, setSelectedEmpresa] = useState<'all' | 'tottus' | 'precio_uno'>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estado de inspección de tienda
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Lista única de encargados de TI presentes en las tiendas
  const itOperators = useMemo(() => {
    const set = new Set<string>();
    stores.forEach(s => {
      if (s.itOperator) set.add(s.itOperator);
    });
    return Array.from(set).sort();
  }, [stores]);

  // Filtrado reactivo de tiendas
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const normFormat = normalizeStoreFormat(store.formato);
      const empresa = getStoreEmpresa(store.formato);

      // Filtro por Empresa matriz
      if (selectedEmpresa === 'tottus' && empresa !== 'Hipermercados Tottus S.A.') return false;
      if (selectedEmpresa === 'precio_uno' && empresa !== 'HiperBodegas Precio Uno') return false;

      // Filtro específico por Formato
      if (selectedFormat !== 'all' && normFormat !== selectedFormat) return false;

      // Filtro por Encargado de TI
      if (selectedOperator !== 'all' && store.itOperator !== selectedOperator) return false;

      // Filtro por Región
      if (selectedRegion !== 'all' && store.region !== selectedRegion) return false;

      // Búsqueda de texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = store.name.toLowerCase().includes(q);
        const matchCode = store.code.toLowerCase().includes(q);
        const matchCeco = (store.centroCostoSap || store.cecoSap || '').toLowerCase().includes(q);
        const matchDist = (store.distrito || store.city || '').toLowerCase().includes(q);
        const matchOp = (store.itOperator || '').toLowerCase().includes(q);
        const matchForm = normFormat.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCeco && !matchDist && !matchOp && !matchForm) {
          return false;
        }
      }

      // Validar coordenadas
      if (typeof store.latitud !== 'number' || typeof store.longitud !== 'number' || isNaN(store.latitud) || isNaN(store.longitud)) {
        return false;
      }

      return true;
    });
  }, [stores, selectedEmpresa, selectedFormat, selectedOperator, selectedRegion, searchQuery]);

  // Conteo de tiendas según filtros actuales
  const stats = useMemo(() => {
    let tottusCount = 0;
    let precioUnoCount = 0;
    let totalEquip = 0;
    let totalRate = 0;

    filteredStores.forEach(s => {
      const emp = getStoreEmpresa(s.formato);
      if (emp === 'Hipermercados Tottus S.A.') tottusCount++;
      else precioUnoCount++;
      totalEquip += (s.totalEquipments || 0);
      totalRate += (s.operationalRate || 95);
    });

    return {
      total: filteredStores.length,
      tottusCount,
      precioUnoCount,
      avgRate: filteredStores.length ? (totalRate / filteredStores.length).toFixed(1) : '100',
      totalEquip
    };
  }, [filteredStores]);

  // Inicialización de Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Crear mapa Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [-9.189967, -75.015152],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Añadir CartoDB Voyager tiles (estilo moderno, limpio y claro)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Controles de zoom abajo a la derecha
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group para marcadores
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar marcadores cuando cambian los filtros o tiendas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredStores.forEach(store => {
      const normFormat = normalizeStoreFormat(store.formato);
      const isSelected = activeStore?.id === store.id || selectedStoreId === store.id;
      const config = STORE_FORMAT_CONFIG[normFormat] || STORE_FORMAT_CONFIG['Hiper'];
      const pinColor = config.color;
      const isTottus = config.empresa === 'Hipermercados Tottus S.A.';

      // Crear icono SVG personalizado para el marcador
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-10'}" style="width: 38px; height: 46px;">
          ${isSelected ? `
            <div class="absolute -inset-2 rounded-full animate-ping opacity-40" style="background-color: ${pinColor}"></div>
            <div class="absolute -inset-1 rounded-full opacity-30" style="background-color: ${pinColor}"></div>
          ` : ''}
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 17 42 17 42C17 42 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${pinColor}"/>
            <circle cx="17" cy="16" r="12" fill="#FFFFFF"/>
            <circle cx="17" cy="16" r="10" fill="${isTottus ? '#f0fdf4' : '#fff7ed'}"/>
          </svg>
          <div class="absolute top-[8px] flex flex-col items-center justify-center font-bold text-[10px] ${isTottus ? 'text-emerald-800' : 'text-orange-900'} leading-none">
            <span>${store.codTienda || store.code.replace('T-', '')}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'bg-transparent border-0',
        iconSize: [38, 46],
        iconAnchor: [19, 44],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([store.latitud, store.longitud], { icon: customIcon });

      // Contenido del Popup al hacer clic
      const popupHtml = `
        <div class="p-1 font-sans min-w-[210px]">
          <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-100">
            <span class="text-[10px] font-bold uppercase tracking-wider ${isTottus ? 'text-emerald-700' : 'text-orange-700'}">
              ${config.empresa}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
              ${store.code}
            </span>
          </div>
          <h4 class="text-xs font-bold text-gray-900 mt-1 mb-0.5">${store.name}</h4>
          <p class="text-[11px] text-gray-500 mb-1.5 flex items-center gap-1">
            <span>📍</span> ${store.distrito || store.provincia || store.city}, ${store.region}
          </p>
          <div class="flex items-center justify-between text-[10px] bg-gray-50 p-1.5 rounded mb-2">
            <div>
              <span class="text-gray-400 block">Formato:</span>
              <span class="font-bold text-gray-800">${normFormat}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 block">Encargado TI:</span>
              <span class="font-bold text-blue-700">${store.itOperator || 'No asignado'}</span>
            </div>
          </div>
          <div class="text-center">
            <button id="btn-view-store-${store.id}" class="w-full text-center py-1 px-2 rounded text-[11px] font-semibold text-white transition-colors" style="background-color: ${pinColor}">
              Ver Detalle Técnico
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: L.point(0, -38)
      });

      marker.on('click', () => {
        setActiveStore(store);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-store-${store.id}`);
        if (btn) {
          btn.onclick = () => {
            setActiveStore(store);
            if (onSelectStore) onSelectStore(store);
          };
        }
      });

      markersLayer.addLayer(marker);
    });

    // Si hay un store seleccionado inicialmente, centrar en él
    if (activeStore) {
      map.panTo([activeStore.latitud, activeStore.longitud], { animate: true });
    }
  }, [filteredStores, activeStore, selectedStoreId, onSelectStore]);

  // Si cambia selectedStoreId desde fuera, activar
  useEffect(() => {
    if (selectedStoreId) {
      const match = stores.find(s => s.id === selectedStoreId);
      if (match) {
        setActiveStore(match);
        if (mapInstanceRef.current && match.latitud && match.longitud) {
          mapInstanceRef.current.setView([match.latitud, match.longitud], 14, { animate: true });
        }
      }
    }
  }, [selectedStoreId, stores]);

  // Acciones de Zoom rápido a Macro Región
  const handleFlyToRegion = (regKey: string) => {
    setSelectedRegion(regKey);
    const target = REGION_BOUNDS[regKey] || REGION_BOUNDS['all'];
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([target.lat, target.lng], target.zoom, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Copiar coordenadas al portapapeles
  const handleCopyCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Centrar en tienda
  const handleFocusStore = (store: Store) => {
    setActiveStore(store);
    if (mapInstanceRef.current && store.latitud && store.longitud) {
      mapInstanceRef.current.setView([store.latitud, store.longitud], 14, {
        animate: true,
        duration: 1.0
      });
    }
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setSelectedEmpresa('all');
    setSelectedFormat('all');
    setSelectedOperator('all');
    setSelectedRegion('all');
    setSearchQuery('');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-9.189967, -75.015152], 6, { animate: true });
    }
  };

  return (
    <div id="peru-stores-map-root" className={`flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* 1. Header y Barra Superior de Filtros */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00873d] text-white flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight">
                  Mapa Nacional de Tiendas y Sedes
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {filteredStores.length} de {stores.length} Tiendas
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Cobertura geográfica de Hipermercados Tottus S.A. e HiperBodegas Precio Uno en todo el Perú
              </p>
            </div>
          </div>

          {/* Botones de macro-zoom rápido */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg border border-gray-200 text-xs">
            <button
              id="btn-zoom-all-peru"
              onClick={() => handleFlyToRegion('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'all' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todo el Perú
            </button>
            <button
              id="btn-zoom-lima"
              onClick={() => handleFlyToRegion('Lima y Callao')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'Lima y Callao' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lima & Callao
            </button>
            <button
              id="btn-zoom-norte"
              onClick={() => handleFlyToRegion('Zona Norte')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'Zona Norte' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Norte
            </button>
            <button
              id="btn-zoom-sur"
              onClick={() => handleFlyToRegion('Zona Sur')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'Zona Sur' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sur
            </button>
            <button
              id="btn-zoom-centro"
              onClick={() => handleFlyToRegion('Zona Centro')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'Zona Centro' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Centro
            </button>
            <button
              id="btn-zoom-oriente"
              onClick={() => handleFlyToRegion('Zona Oriente')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedRegion === 'Zona Oriente' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Oriente
            </button>
          </div>
        </div>

        {/* 2. Controles de Filtro: Formato de Tienda y Encargado de TI */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2 border-t border-gray-100 items-center">
          {/* Selector de Empresa / Formato */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap flex items-center gap-1">
              <StoreIcon className="w-3.5 h-3.5 text-[#00873d]" />
              Formato:
            </span>
            <select
              id="select-store-format"
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                if (e.target.value === 'all') {
                  setSelectedEmpresa('all');
                } else if (TOTTUS_FORMATS.includes(e.target.value as any)) {
                  setSelectedEmpresa('tottus');
                } else if (PRECIO_UNO_FORMATS.includes(e.target.value as any)) {
                  setSelectedEmpresa('precio_uno');
                }
              }}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="all">🏢 Todos los Formatos de Tienda</option>
              
              <optgroup label="── Hipermercados Tottus S.A. ──">
                {TOTTUS_FORMATS.map(fmt => (
                  <option key={fmt} value={fmt}>
                    🟢 {fmt}
                  </option>
                ))}
              </optgroup>

              <optgroup label="── HiperBodegas Precio Uno ──">
                {PRECIO_UNO_FORMATS.map(fmt => (
                  <option key={fmt} value={fmt}>
                    🟠 {fmt}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Selector de Encargado de TI */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Encargado TI:
            </span>
            <select
              id="select-it-operator"
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="all">👤 Todos los Encargados de TI</option>
              {itOperators.map(op => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador de tienda */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-store-map"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tienda, código, CECO, distrito..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Botón Reset */}
          <div className="md:col-span-1 flex justify-end">
            <button
              id="btn-reset-map-filters"
              onClick={handleResetFilters}
              title="Restablecer filtros"
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Píldoras rápidas de formato con conteos */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100 text-[11px]">
          <span className="text-gray-400 font-semibold mr-1">Filtrado rápido:</span>
          
          <button
            onClick={() => { setSelectedEmpresa('all'); setSelectedFormat('all'); }}
            className={`px-2 py-0.5 rounded-full border transition-all ${
              selectedEmpresa === 'all' && selectedFormat === 'all'
                ? 'bg-slate-800 text-white border-slate-800 font-bold'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todas ({stores.length})
          </button>

          {/* Grupo Tottus */}
          {TOTTUS_FORMATS.map(fmt => {
            const count = stores.filter(s => normalizeStoreFormat(s.formato) === fmt).length;
            const isAct = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                onClick={() => {
                  setSelectedFormat(fmt);
                  setSelectedEmpresa('tottus');
                }}
                className={`px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                  isAct
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                    : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{fmt}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}

          {/* Grupo Precio Uno */}
          {PRECIO_UNO_FORMATS.map(fmt => {
            const count = stores.filter(s => normalizeStoreFormat(s.formato) === fmt).length;
            const isAct = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                onClick={() => {
                  setSelectedFormat(fmt);
                  setSelectedEmpresa('precio_uno');
                }}
                className={`px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                  isAct
                    ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-2xs'
                    : 'bg-orange-50/70 text-orange-900 border-orange-200 hover:bg-orange-100/70'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span>{fmt}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Contenedor Principal: Mapa Leaflet + Panel Lateral de Detalle */}
      <div className="relative flex-1 min-h-[500px] md:min-h-[580px] flex">
        {/* Mapa Leaflet */}
        <div
          ref={mapContainerRef}
          id="leaflet-map-canvas"
          className="w-full h-full min-h-[500px] md:min-h-[580px] bg-slate-100 z-0"
        />

        {/* Leyenda flotante en la esquina inferior izquierda del mapa */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-md border border-gray-200 text-[11px] max-w-xs pointer-events-auto">
          <div className="font-bold text-gray-800 mb-1.5 flex items-center justify-between">
            <span>Leyenda de Formatos</span>
            <span className="text-[10px] text-gray-400 font-normal">Clic para centrar</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00873d] flex-shrink-0"></span>
              <span className="text-gray-700">Hipermercados Tottus (Verde / Azul)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ea580c] flex-shrink-0"></span>
              <span className="text-gray-700">HiperBodegas Precio Uno (Naranja / Rojo)</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>Operatividad Media:</span>
            <span className="font-bold text-emerald-700">{stats.avgRate}%</span>
          </div>
        </div>

        {/* Botón para alternar Drawer de tiendas */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 z-20 bg-white shadow-md border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#00873d]" />
          <span>{isSidebarOpen ? 'Ocultar Panel' : 'Ver Tiendas y Detalle'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-[10px] text-gray-600 font-mono">
            {filteredStores.length}
          </span>
        </button>

        {/* Panel lateral derecho: Tiendas y Detalle */}
        {isSidebarOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 bg-white/95 backdrop-blur-md shadow-xl border-l border-gray-200 z-30 flex flex-col transition-all">
            {/* Si hay una tienda seleccionada: Mostrar Ficha Técnica Detallada */}
            {activeStore ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cabecera de Ficha */}
                <div className="p-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white">
                      {activeStore.code}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      CECO: {activeStore.centroCostoSap || activeStore.cecoSap || 'N/D'}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveStore(null)}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    Volver a lista
                  </button>
                </div>

                {/* Contenido de Ficha */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {/* Nombre y Formato */}
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      getStoreEmpresa(activeStore.formato) === 'Hipermercados Tottus S.A.'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-orange-100 text-orange-900'
                    }`}>
                      {getStoreEmpresa(activeStore.formato)}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      {activeStore.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {activeStore.direccion || activeStore.address}
                    </p>
                  </div>

                  {/* Badges de Formato y Macro-Región */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-[10px] text-gray-400 block font-medium">Formato Oficial</span>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                        <StoreIcon className="w-3.5 h-3.5 text-[#00873d]" />
                        {normalizeStoreFormat(activeStore.formato)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-[10px] text-gray-400 block font-medium">Macro-Región</span>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        {activeStore.region}
                      </span>
                    </div>
                  </div>

                  {/* Encargado de TI (Clave solicitada por el usuario) */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-700" />
                        Encargado de TI
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Soporte Onsite
                      </span>
                    </div>
                    <p className="text-sm font-bold text-blue-950">
                      {activeStore.itOperator || 'Sin técnico fijo asignado'}
                    </p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Responsable de mantenimiento preventivo, infraestructura y contingencias POS.
                    </p>
                  </div>

                  {/* Coordenadas GPS con Copiado */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-gray-500" />
                        Coordenadas Satelitales (WGS84)
                      </span>
                      <button
                        onClick={() => handleCopyCoordinates(activeStore.latitud, activeStore.longitud)}
                        className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        {copiedCoords ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-gray-800 bg-white p-1.5 rounded border border-gray-200 flex items-center justify-between">
                      <span>Lat: {activeStore.latitud.toFixed(6)}</span>
                      <span>Lon: {activeStore.longitud.toFixed(6)}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${activeStore.latitud},${activeStore.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir en Google Maps exterior</span>
                    </a>
                  </div>

                  {/* Gerente y Contacto */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-400">Gerente de Tienda:</span>
                      <span className="font-semibold text-gray-800">{activeStore.gerenteTienda || activeStore.manager || 'N/D'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-400">Gerente Zonal:</span>
                      <span className="font-semibold text-gray-800">{activeStore.gZonal || 'N/D'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-400">Condición Inmueble:</span>
                      <span className="font-semibold text-gray-800">{activeStore.situacion || 'Propia'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-400">Equipos Registrados:</span>
                      <span className="font-semibold text-emerald-700 font-mono">{activeStore.totalEquipments || 18} equipos</span>
                    </div>
                  </div>

                  {/* Acciones principales */}
                  <div className="pt-2 space-y-2">
                    {onSelectStore && (
                      <button
                        onClick={() => onSelectStore(activeStore)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#00873d] hover:bg-[#007033] shadow-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Ver Parque de Equipos de la Tienda</span>
                      </button>
                    )}

                    {onOpenReportModal && (
                      <button
                        onClick={() => onOpenReportModal(activeStore)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Generar Reporte Técnico Onsite</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Lista de tiendas filtradas */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800">
                      Tiendas Encontradas ({filteredStores.length})
                    </span>
                    <span className="block text-[10px] text-gray-500">
                      Selecciona una para centrar en el mapa
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {filteredStores.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-xs font-medium text-gray-600">No se encontraron tiendas con los filtros seleccionados</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
                      >
                        Restablecer todos los filtros
                      </button>
                    </div>
                  ) : (
                    filteredStores.map(store => {
                      const normFormat = normalizeStoreFormat(store.formato);
                      const isTottus = getStoreEmpresa(store.formato) === 'Hipermercados Tottus S.A.';
                      return (
                        <div
                          key={store.id}
                          onClick={() => handleFocusStore(store)}
                          className="p-3 hover:bg-emerald-50/40 cursor-pointer transition-colors flex items-start justify-between gap-2 group"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              isTottus ? 'bg-emerald-500' : 'bg-orange-500'
                            }`} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-gray-900 group-hover:text-emerald-800">
                                  {store.name}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {store.code}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500">
                                {store.distrito || store.city}, {store.region}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  isTottus ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-900'
                                }`}>
                                  {normFormat}
                                </span>
                                <span className="text-[10px] text-blue-600 font-medium">
                                  TI: {store.itOperator}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all mt-1" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Barra Inferior de Métricas Rápidas */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00873d]"></span>
            <span>Hipermercados Tottus: <strong>{stats.tottusCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
            <span>HiperBodegas Precio Uno: <strong>{stats.precioUnoCount}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Equipos Soportados: <strong className="font-mono text-gray-900">{stats.totalEquip}</strong></span>
          <span>Disponibilidad Operativa: <strong className="text-emerald-700 font-mono">{stats.avgRate}%</strong></span>
        </div>
      </div>
    </div>
  );
};
