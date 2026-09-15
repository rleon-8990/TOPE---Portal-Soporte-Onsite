import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  ExternalLink,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
  Building2,
  Copy,
  Check,
  Navigation,
  Globe
} from 'lucide-react';
import { Store } from '../types';
import { validateCoordinatesPeru } from '../services/dataverseService';

interface StoreCoordinateModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStore: Store) => void;
}

export const StoreCoordinateModal: React.FC<StoreCoordinateModalProps> = ({
  store,
  isOpen,
  onClose,
  onSave
}) => {
  const [latitud, setLatitud] = useState<string>(
    store.latitud !== undefined && store.latitud !== null ? String(store.latitud) : ''
  );
  const [longitud, setLongitud] = useState<string>(
    store.longitud !== undefined && store.longitud !== null ? String(store.longitud) : ''
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Parse numeric coordinates
  const parsedLat = parseFloat(latitud);
  const parsedLng = parseFloat(longitud);
  const validation = validateCoordinatesPeru(
    !isNaN(parsedLat) ? parsedLat : null,
    !isNaN(parsedLng) ? parsedLng : null
  );

  // Sync state when store changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setLatitud(store.latitud !== undefined && store.latitud !== null ? String(store.latitud) : '');
      setLongitud(store.longitud !== undefined && store.longitud !== null ? String(store.longitud) : '');
      setSavedSuccess(false);
    }
  }, [store, isOpen]);

  // Initialize and update Leaflet mini-map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Default center: valid parsed coordinates or Lima (-12.046374, -77.042793)
    const initialLat = !isNaN(parsedLat) && parsedLat >= -20 && parsedLat <= 0 ? parsedLat : -12.046374;
    const initialLng = !isNaN(parsedLng) && parsedLng >= -85 && parsedLng <= -65 ? parsedLng : -77.042793;
    const initialZoom = !isNaN(parsedLat) && !isNaN(parsedLng) ? 15 : 12;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([initialLat, initialLng], initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Custom high-visibility pin icon
      const customIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: #00236f;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          ">
            <div style="
              width: 14px;
              height: 14px;
              background: #00873d;
              border-radius: 50%;
              transform: rotate(45deg);
              border: 1.5px solid #ffffff;
            "></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      // Drag event updates input values
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setLatitud(pos.lat.toFixed(6));
        setLongitud(pos.lng.toFixed(6));
      });

      // Click on map moves marker and updates input values
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setLatitud(e.latlng.lat.toFixed(6));
        setLongitud(e.latlng.lng.toFixed(6));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Map already exists, update center & marker
      const map = mapInstanceRef.current;
      const marker = markerRef.current;
      if (marker && !isNaN(parsedLat) && !isNaN(parsedLng)) {
        marker.setLatLng([parsedLat, parsedLng]);
        map.setView([parsedLat, parsedLng], map.getZoom());
      }
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      // Clean up when modal unmounts
      if (mapInstanceRef.current && !isOpen) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // When latitud / longitud state changes manually, update marker position
  const handleInputChange = (newLatStr: string, newLngStr: string) => {
    setLatitud(newLatStr);
    setLongitud(newLngStr);
    const nLat = parseFloat(newLatStr);
    const nLng = parseFloat(newLngStr);
    if (!isNaN(nLat) && !isNaN(nLng) && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([nLat, nLng]);
      mapInstanceRef.current.panTo([nLat, nLng]);
    }
  };

  const handleInvertCoordinates = () => {
    const prevLat = latitud;
    const prevLng = longitud;
    handleInputChange(prevLng, prevLat);
  };

  const handleSave = () => {
    const numLat = parseFloat(latitud);
    const numLng = parseFloat(longitud);

    const updatedStore: Store = {
      ...store,
      latitud: !isNaN(numLat) ? numLat : undefined,
      longitud: !isNaN(numLng) ? numLng : undefined
    };

    onSave(updatedStore);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Pre-established Dataverse PATCH command for this specific store
  const dataversePatchSnippet = `PATCH https://tottus-corp.crm.dynamics.com/api/data/v9.2/cr_cmms_tiendas(${store.id || 'GUID'})
Authorization: Bearer <TOKEN>
Content-Type: application/json
If-Match: *

{
  "cr_cmms_latitud": ${!isNaN(parsedLat) ? parsedLat.toFixed(6) : 'null'},
  "cr_cmms_longitud": ${!isNaN(parsedLng) ? parsedLng.toFixed(6) : 'null'}
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(dataversePatchSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 max-h-[94vh] overflow-y-auto border border-[#dce9ff]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00236f] text-white flex items-center justify-center shadow-md shrink-0">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                Modificar y Validar Coordenadas GPS
                <span className="text-xs bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded font-mono font-semibold">
                  {store.code || `T-${store.codTienda}`}
                </span>
              </h3>
              <p className="text-xs text-[#757682]">
                {store.name} &bull; {store.direccion || store.address || 'Sin dirección'} &bull; {store.distrito || store.city || ''}, {store.region}
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

        {/* Validation Alert Box */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            validation.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : validation.isReversed
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-semibold">{validation.message}</p>
              <p className="text-[11px] opacity-80">
                {validation.isValid
                  ? 'La sucursal está georreferenciada correctamente dentro de la cartografía de Perú.'
                  : 'Ajuste los valores manualmente o arrastre el marcador en el mapa para ubicar la tienda.'}
              </p>
            </div>
          </div>

          {validation.isReversed && (
            <button
              onClick={handleInvertCoordinates}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] shrink-0 flex items-center gap-1 shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Invertir Lat/Lng</span>
            </button>
          )}
        </div>

        {/* Interactive Map Section */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-[#757682]">
            <span className="font-semibold flex items-center gap-1.5 text-[#00236f]">
              <Compass className="w-3.5 h-3.5 text-[#00873d]" />
              Arrastra el pin o haz clic sobre el mapa para fijar la ubicación exacta:
            </span>
            {!isNaN(parsedLat) && !isNaN(parsedLng) && (
              <a
                href={`https://www.google.com/maps?q=${parsedLat},${parsedLng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#00236f] font-semibold hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                <span>Validar en Google Maps (Satélite)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-72 rounded-xl border border-[#c5c5d3] overflow-hidden shadow-inner relative z-0"
          />
        </div>

        {/* Numeric Coordinate Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8faff] p-3.5 rounded-xl border border-[#e2edff]">
          <div>
            <label className="text-xs font-bold text-[#00236f] uppercase mb-1 flex items-center justify-between">
              <span>Latitud GPS (Decimal)</span>
              <span className="text-[10px] font-mono text-[#757682]">Rango Perú: -18.35 a -0.03</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                value={latitud}
                onChange={e => handleInputChange(e.target.value, longitud)}
                placeholder="-12.046374"
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono font-bold text-[#00236f] focus:outline-none focus:ring-2 focus:ring-[#00236f]/30"
              />
              <span className="absolute right-3 top-2.5 text-[11px] text-[#757682] font-mono font-semibold">
                °S
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#00236f] uppercase mb-1 flex items-center justify-between">
              <span>Longitud GPS (Decimal)</span>
              <span className="text-[10px] font-mono text-[#757682]">Rango Perú: -81.33 a -68.65</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                value={longitud}
                onChange={e => handleInputChange(latitud, e.target.value)}
                placeholder="-77.042793"
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono font-bold text-[#00236f] focus:outline-none focus:ring-2 focus:ring-[#00236f]/30"
              />
              <span className="absolute right-3 top-2.5 text-[11px] text-[#757682] font-mono font-semibold">
                °W
              </span>
            </div>
          </div>
        </div>

        {/* Dataverse Code Block for Synchronization */}
        <div className="bg-slate-900 rounded-xl p-3 text-white text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Línea OData establecida para sincronizar a Microsoft Dataverse:
            </span>
            <button
              onClick={handleCopyCode}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar PATCH'}</span>
            </button>
          </div>
          <pre className="font-mono text-[10.5px] text-slate-300 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded border border-slate-800">
            {dataversePatchSnippet}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e5eeff]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                ¡Coordenadas guardadas!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Coordenadas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
