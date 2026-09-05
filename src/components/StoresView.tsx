import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Search,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail
} from 'lucide-react';
import { Store, Equipment, Region } from '../types';

interface StoresViewProps {
  stores: Store[];
  equipments: Equipment[];
  onSelectStore: (store: Store) => void;
  onGenerateReportForStore: (store: Store) => void;
  onOpenRegionalAlerts: () => void;
}

export const StoresView: React.FC<StoresViewProps> = ({
  stores,
  equipments,
  onSelectStore,
  onGenerateReportForStore,
  onOpenRegionalAlerts,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<Store | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const regions: { id: string; name: string; count: number }[] = [
    { id: 'todas', name: 'Todas las Tiendas (90)', count: stores.length },
    { id: 'Lima y Callao', name: 'Lima y Callao', count: stores.filter(s => s.region === 'Lima y Callao').length },
    { id: 'Zona Norte', name: 'Zona Norte', count: stores.filter(s => s.region === 'Zona Norte').length },
    { id: 'Zona Sur', name: 'Zona Sur', count: stores.filter(s => s.region === 'Zona Sur').length },
    { id: 'Zona Centro', name: 'Zona Centro', count: stores.filter(s => s.region === 'Zona Centro').length },
    { id: 'Zona Oriente', name: 'Zona Oriente', count: stores.filter(s => s.region === 'Zona Oriente').length },
  ];

  const filteredStores = stores.filter(store => {
    const matchesRegion = selectedRegion === 'todas' || store.region === selectedRegion;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      store.name.toLowerCase().includes(query) ||
      store.code.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.manager.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query);
    return matchesRegion && matchesSearch;
  });

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Listado de Sucursales & Tiendas (90)
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Directorio tabular de las 90 tiendas a nivel nacional con disponibilidad operativa y control de equipamiento.
          </p>
        </div>

        <button
          onClick={onOpenRegionalAlerts}
          className="bg-[#ba1a1a] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#ba1a1a]/20 hover:bg-[#93000a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 self-start sm:self-auto"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emitir Alerta a Tienda / Región</span>
        </button>
      </div>

      {/* Regional Quick Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {regions.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedRegion(r.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedRegion === r.id
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-[#444651] border border-[#dce9ff] hover:bg-[#eff4ff]'
            }`}
          >
            {r.name} ({r.count})
          </button>
        ))}
      </div>

      {/* Search Filter Box */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
          <input
            type="text"
            placeholder="Buscar por código (ej. T-001), nombre de tienda, ciudad, dirección o jefe de tienda..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Tabular / List View */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th className="py-3 px-3.5 w-24">CÓDIGO</th>
                <th className="py-3 px-3.5">NOMBRE DE TIENDA</th>
                <th className="py-3 px-3.5">REGIÓN & CIUDAD</th>
                <th className="py-3 px-3.5">DIRECCIÓN</th>
                <th className="py-3 px-3.5">ADMINISTRADOR / JEFE</th>
                <th className="py-3 px-3.5 text-center">TOTAL ACTIVOS</th>
                <th className="py-3 px-3.5 text-center">DISPONIBILIDAD</th>
                <th className="py-3 px-3.5 text-center">ESTADO</th>
                <th className="py-3 px-3.5 text-center w-28">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#757682]">
                    No se encontraron tiendas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedStores.map((st, idx) => {
                  const isCritical = st.criticalIssues > 0 || st.status === 'alerta_regional';
                  const isMaintenance = st.status === 'mantenimiento_general';

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStoreDetail(st)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                          {st.code}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0b1c30]">{st.name}</div>
                        <div className="text-[11px] text-[#757682] font-mono">{st.phone}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#00236f]">{st.region}</div>
                        <div className="text-[11px] text-[#757682]">{st.city}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="text-[#444651] line-clamp-1">{st.address}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30]">{st.manager}</div>
                        <div className="text-[11px] text-[#757682]">{st.managerEmail}</div>
                      </td>

                      <td className="py-3 px-3.5 text-center font-bold text-[#00236f] whitespace-nowrap">
                        {st.totalEquipments}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            st.operationalRate >= 95
                              ? 'text-[#10b981]'
                              : st.operationalRate >= 90
                              ? 'text-[#fd761a]'
                              : 'text-[#ba1a1a]'
                          }`}
                        >
                          {st.operationalRate}%
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : isMaintenance
                              ? 'bg-[#fff3e0] text-[#fd761a]'
                              : 'bg-[#e8f5e9] text-[#10b981]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical
                                ? 'bg-[#ba1a1a]'
                                : isMaintenance
                                ? 'bg-[#fd761a]'
                                : 'bg-[#10b981]'
                            }`}
                          />
                          {isCritical ? 'Alerta' : isMaintenance ? 'Mantenimiento' : 'Normal'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectStore(st)}
                            className="p-1 text-[#00236f] hover:bg-[#eff4ff] rounded font-medium text-[11px] flex items-center gap-0.5"
                            title="Ver Equipos de la Tienda"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Equipos</span>
                          </button>
                          <button
                            onClick={() => onGenerateReportForStore(st)}
                            className="p-1 text-[#10b981] hover:bg-[#e8f5e9] rounded font-medium text-[11px] flex items-center gap-0.5"
                            title="Emitir Informe Técnico"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Informe</span>
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
            Mostrando <strong>{paginatedStores.length}</strong> de <strong>{filteredStores.length}</strong> sucursales
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

      {/* Store Detail Modal */}
      {selectedStoreDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded">
                  {selectedStoreDetail.code}
                </span>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1">
                  {selectedStoreDetail.name}
                </h3>
                <p className="text-xs text-[#757682]">{selectedStoreDetail.address}, {selectedStoreDetail.city}</p>
              </div>
              <button
                onClick={() => setSelectedStoreDetail(null)}
                className="text-[#757682] p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Región</span>
                <strong className="text-[#00236f]">{selectedStoreDetail.region}</strong>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Disponibilidad</span>
                <strong className="text-[#10b981]">{selectedStoreDetail.operationalRate}% Uptime</strong>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Administrador de Tienda</span>
                <strong className="text-[#0b1c30]">{selectedStoreDetail.manager}</strong>
                <div className="text-[10px] text-[#757682]">{selectedStoreDetail.managerEmail}</div>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Teléfono Directo</span>
                <strong className="font-mono text-[#0b1c30]">{selectedStoreDetail.phone}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectStore(selectedStoreDetail);
                  setSelectedStoreDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-1.5"
              >
                <Boxes className="w-4 h-4" />
                <span>Ver Equipos ({selectedStoreDetail.totalEquipments})</span>
              </button>
              <button
                onClick={() => {
                  onGenerateReportForStore(selectedStoreDetail);
                  setSelectedStoreDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] border border-[#dce9ff] rounded-lg text-xs font-bold hover:bg-[#dce9ff] transition-all flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Emitir Informe PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
