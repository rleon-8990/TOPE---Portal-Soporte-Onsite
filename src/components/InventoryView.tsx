import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Wrench,
  FileSpreadsheet
} from 'lucide-react';
import { Equipment, Store } from '../types';
import { EQUIPMENT_CATEGORIES } from '../data/mockData';

interface InventoryViewProps {
  equipments: Equipment[];
  stores: Store[];
  onSelectEquipment: (equipment: Equipment) => void;
  onOpenNewEquipment: () => void;
  onOpenQRScanner: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  equipments,
  stores,
  onSelectEquipment,
  onOpenNewEquipment,
  onOpenQRScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [onlyCalibrationAlerts, setOnlyCalibrationAlerts] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof Equipment>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const itemsPerPage = 12;

  // Filter logic
  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => {
      // Search text
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === '' ||
        eq.name.toLowerCase().includes(query) ||
        eq.code.toLowerCase().includes(query) ||
        eq.brand.toLowerCase().includes(query) ||
        eq.model.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        eq.storeName.toLowerCase().includes(query) ||
        eq.locationInStore.toLowerCase().includes(query);

      // Category
      const matchesCategory =
        selectedCategory === 'todos' || eq.categoryId === selectedCategory;

      // Store
      const matchesStore =
        selectedStoreId === '' || eq.storeId === selectedStoreId;

      // Region
      const storeObj = stores.find(s => s.id === eq.storeId);
      const matchesRegion =
        selectedRegion === 'todas' || (storeObj && storeObj.region === selectedRegion);

      // Status
      const matchesStatus =
        selectedStatus === 'todos' || eq.status === selectedStatus;

      // Calibration alerts
      const matchesCalibration =
        !onlyCalibrationAlerts || eq.calibrationAlert === true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStore &&
        matchesRegion &&
        matchesStatus &&
        matchesCalibration
      );
    }).sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [
    equipments,
    stores,
    searchQuery,
    selectedCategory,
    selectedStoreId,
    selectedRegion,
    selectedStatus,
    onlyCalibrationAlerts,
    sortField,
    sortAsc
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage) || 1;
  const paginatedEquipments = filteredEquipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Código,Nombre,Categoría,Tienda,Ubicación,Marca,Modelo,Serie,Estado,Próximo Mantenimiento\n';
    const rows = filteredEquipments
      .map(
        e =>
          `"${e.code}","${e.name}","${e.categoryName}","${e.storeName}","${e.locationInStore}","${e.brand}","${e.model}","${e.serialNumber}","${e.status}","${e.nextMaintenance}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventario_Equipos_Tottus_Soporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Listado General de Inventario
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Registro tabular de activos electromecánicos y tecnológicos de las 90 tiendas. {filteredEquipments.length} equipos filtrados.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenNewEquipment}
            className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Activo</span>
          </button>

          <button
            onClick={onOpenQRScanner}
            className="bg-[#eff4ff] text-[#00236f] px-3 py-2 rounded-lg text-xs font-semibold border border-[#dce9ff] hover:bg-[#dce9ff] transition-all flex items-center gap-1.5"
            title="Escanear Código QR"
          >
            <QrCode className="w-4 h-4" />
            <span>Escanear QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white text-[#444651] px-3 py-2 rounded-lg text-xs font-semibold border border-[#c5c5d3] hover:bg-[#f8f9ff] transition-all flex items-center gap-1.5"
            title="Descargar tabla en CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por código, nombre, serie, marca o tienda..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-7 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#757682] hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todas las Categorías (20)</option>
              {EQUIPMENT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortCode} - {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Store / Sede Dropdown */}
          <div>
            <select
              value={selectedStoreId}
              onChange={e => {
                setSelectedStoreId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="">Todas las Tiendas (90)</option>
              {stores.map(st => (
                <option key={st.id} value={st.id}>
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operational Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="operativo">Operativo (Normal)</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="falla_critica">Falla Crítica</option>
              <option value="fuera_servicio">Fuera de Servicio</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f0f4ff] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#757682] text-[11px] font-semibold">Región:</span>
            {['todas', 'Lima y Callao', 'Zona Norte', 'Zona Sur', 'Zona Centro', 'Zona Oriente'].map(r => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRegion(r);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  selectedRegion === r
                    ? 'bg-[#00236f] text-white'
                    : 'bg-[#f0f4ff] text-[#444651] hover:bg-[#e2ebfc]'
                }`}
              >
                {r === 'todas' ? 'Todas' : r}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-[#ba1a1a]">
            <input
              type="checkbox"
              checked={onlyCalibrationAlerts}
              onChange={e => {
                setOnlyCalibrationAlerts(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded text-[#ba1a1a] focus:ring-[#ba1a1a]"
            />
            <span>Solo Alertas de Calibración Vencida</span>
          </label>
        </div>
      </div>

      {/* Main Tabular / List View */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>CÓDIGO</span>
                    {sortField === 'code' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>EQUIPO / DESCRIPCIÓN</span>
                    {sortField === 'name' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('categoryName')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CATEGORÍA</span>
                    {sortField === 'categoryName' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storeName')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SUCURSAL / UBICACIÓN</span>
                    {sortField === 'storeName' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3 px-3.5">MARCA & MODELO</th>
                <th className="py-3 px-3.5">N° SERIE</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ESTADO</span>
                    {sortField === 'status' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nextMaintenance')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>PRÓXIMO MTTO</span>
                    {sortField === 'nextMaintenance' && (sortAsc ? '▲' : '▼')}
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center w-24">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedEquipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#757682]">
                    No se encontraron activos que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedEquipments.map((eq, index) => {
                  const isCritical = eq.status === 'falla_critica';
                  const isWarning = eq.status === 'mantenimiento';
                  const isOffline = eq.status === 'fuera_servicio';

                  return (
                    <tr
                      key={eq.id}
                      onClick={() => onSelectEquipment(eq)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                            {eq.code}
                          </span>
                          {eq.calibrationAlert && (
                            <span title="Alerta de Calibración Vencida" className="text-[#ba1a1a]">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0b1c30] line-clamp-1">{eq.name}</div>
                        <div className="text-[11px] text-[#757682]">{eq.statusDetail || 'Calibrado y operativo'}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-block bg-[#f0f4ff] text-[#00236f] font-medium px-2 py-0.5 rounded text-[11px]">
                          {eq.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#0b1c30] whitespace-nowrap">{eq.storeName}</div>
                        <div className="text-[11px] text-[#757682]">{eq.locationInStore}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30]">{eq.brand}</div>
                        <div className="text-[11px] text-[#757682]">{eq.model}</div>
                      </td>

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#444651] whitespace-nowrap">
                        {eq.serialNumber}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : isWarning
                              ? 'bg-[#fff3e0] text-[#fd761a]'
                              : isOffline
                              ? 'bg-[#f1f1f1] text-[#757682]'
                              : 'bg-[#e8f5e9] text-[#10b981]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical
                                ? 'bg-[#ba1a1a]'
                                : isWarning
                                ? 'bg-[#fd761a]'
                                : isOffline
                                ? 'bg-[#757682]'
                                : 'bg-[#10b981]'
                            }`}
                          />
                          {eq.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#444651] whitespace-nowrap">
                        {eq.nextMaintenance}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectEquipment(eq)}
                            className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors"
                            title="Ver Ficha y QR"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
            Mostrando <strong>{paginatedEquipments.length}</strong> de <strong>{filteredEquipments.length}</strong> equipos registrados
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
    </div>
  );
};
