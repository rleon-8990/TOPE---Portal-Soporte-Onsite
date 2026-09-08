import React, { useState, useMemo } from 'react';
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
  Mail,
  Download,
  Building2,
  SlidersHorizontal,
  Layers,
  Map,
  Check,
  Copy,
  TableProperties,
  ArrowUpDown,
  Edit2,
  Trash2,
  Save
} from 'lucide-react';
import { Store, Equipment, Region } from '../types';

interface StoresViewProps {
  stores: Store[];
  equipments: Equipment[];
  onSelectStore: (store: Store) => void;
  onGenerateReportForStore: (store: Store) => void;
  onOpenRegionalAlerts: () => void;
  onOpenSharePointSync?: () => void;
  onUpdateStore?: (updatedStore: Store) => void;
  onDeleteStore?: (storeId: string) => void;
}

export const StoresView: React.FC<StoresViewProps> = ({
  stores,
  equipments,
  onSelectStore,
  onGenerateReportForStore,
  onOpenRegionalAlerts,
  onOpenSharePointSync,
  onUpdateStore,
  onDeleteStore,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [selectedFormat, setSelectedFormat] = useState<string>('todos');
  const [selectedCluster, setSelectedCluster] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<Store | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Store | 'sapCeco'>('codTienda');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const itemsPerPage = 15;

  const handleSort = (field: keyof Store | 'sapCeco') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const regions: { id: string; name: string; count: number }[] = useMemo(() => [
    { id: 'todas', name: 'Todas las Tiendas', count: stores.length },
    { id: 'Lima y Callao', name: 'Lima y Callao', count: stores.filter(s => s.region === 'Lima y Callao').length },
    { id: 'Zona Norte', name: 'Zona Norte', count: stores.filter(s => s.region === 'Zona Norte').length },
    { id: 'Zona Sur', name: 'Zona Sur', count: stores.filter(s => s.region === 'Zona Sur').length },
    { id: 'Zona Centro', name: 'Zona Centro', count: stores.filter(s => s.region === 'Zona Centro').length },
    { id: 'Zona Oriente', name: 'Zona Oriente', count: stores.filter(s => s.region === 'Zona Oriente').length },
  ], [stores]);

  const uniqueFormats = useMemo(() => {
    const set = new Set<string>();
    stores.forEach(s => {
      if (s.formato) set.add(s.formato);
    });
    return Array.from(set).sort();
  }, [stores]);

  const uniqueClusters = useMemo(() => {
    const set = new Set<string>();
    stores.forEach(s => {
      if (s.cluster) set.add(s.cluster);
    });
    return Array.from(set).sort();
  }, [stores]);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesRegion = selectedRegion === 'todas' || store.region === selectedRegion;
      const matchesFormat = selectedFormat === 'todos' || store.formato === selectedFormat;
      const matchesCluster = selectedCluster === 'todos' || store.cluster === selectedCluster;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesRegion && matchesFormat && matchesCluster;

      const codeStr = String(store.codTienda || store.code || '').toLowerCase();
      const nameStr = (store.name || '').toLowerCase();
      const sapStr = (store.centroCostoSap || store.cecoSap || '').toLowerCase();
      const managerStr = (store.gerenteTienda || store.manager || '').toLowerCase();
      const operatorStr = (store.itOperator || '').toLowerCase();
      const addressStr = (store.direccion || store.address || '').toLowerCase();
      const districtStr = (store.distrito || store.city || '').toLowerCase();
      const clusterStr = (store.cluster || '').toLowerCase();
      const zonalStr = (store.gZonal || '').toLowerCase();

      const matchesSearch =
        codeStr.includes(query) ||
        nameStr.includes(query) ||
        sapStr.includes(query) ||
        managerStr.includes(query) ||
        operatorStr.includes(query) ||
        addressStr.includes(query) ||
        districtStr.includes(query) ||
        clusterStr.includes(query) ||
        zonalStr.includes(query);

      return matchesRegion && matchesFormat && matchesCluster && matchesSearch;
    }).sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      if (sortField === 'sapCeco') {
        valA = (a.centroCostoSap || a.cecoSap || '').toLowerCase();
        valB = (b.centroCostoSap || b.cecoSap || '').toLowerCase();
      } else if (sortField === 'gerenteTienda') {
        valA = (a.gerenteTienda || a.manager || '').toLowerCase();
        valB = (b.gerenteTienda || b.manager || '').toLowerCase();
      } else if (sortField === 'direccion') {
        valA = (a.direccion || a.address || '').toLowerCase();
        valB = (b.direccion || b.address || '').toLowerCase();
      } else if (sortField === 'distrito') {
        valA = (a.distrito || a.city || '').toLowerCase();
        valB = (b.distrito || b.city || '').toLowerCase();
      } else if (sortField === 'totalEquipments') {
        const numA = Number(a.totalEquipments) || 0;
        const numB = Number(b.totalEquipments) || 0;
        return sortAsc ? numA - numB : numB - numA;
      } else if (sortField === 'operationalRate') {
        const numA = Number(a.operationalRate) || 0;
        const numB = Number(b.operationalRate) || 0;
        return sortAsc ? numA - numB : numB - numA;
      } else {
        valA = (a[sortField as keyof Store] ?? '').toString().toLowerCase();
        valB = (b[sortField as keyof Store] ?? '').toString().toLowerCase();
      }

      const cmp = valA.localeCompare(valB, 'es', { numeric: true, sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
  }, [stores, selectedRegion, selectedFormat, selectedCluster, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const paginatedStores = useMemo(() => {
    return filteredStores.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredStores, currentPage, itemsPerPage]);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleExportCSV = () => {
    const headers = 'Cod,Tienda,Cluster,Centro_Costo_SAP,G_Zonal,Gerente_Tienda,Direccion,FORMATO,IT_Operator,Ubigeo,Region,Provincia,Distrito,SITUACION,Latitud,Longitud,Total_Activos,Disponibilidad_Operativa\n';
    const rows = filteredStores
      .map(s =>
        `"${s.codTienda || s.code.replace('T-', '')}","${s.name}","${s.cluster || ''}","${s.centroCostoSap || s.cecoSap || ''}","${s.gZonal || ''}","${s.gerenteTienda || s.manager || ''}","${s.direccion || s.address}","${s.formato || 'Hiper'}","${s.itOperator || ''}","${s.ubigeo !== undefined ? s.ubigeo : ''}","${s.region}","${s.provincia || ''}","${s.distrito || s.city}","${s.situacion || 'Propia'}","${s.latitud || ''}","${s.longitud || ''}","${s.totalEquipments}","${s.operationalRate}%"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventario_Tiendas_Tottus_Oficial_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStore = (st: Store) => {
    const confirm = window.confirm(`¿Está seguro de eliminar la sucursal "${st.name}" (${st.code})? Esta acción afectará el inventario asociado.`);
    if (confirm) {
      if (onDeleteStore) {
        onDeleteStore(st.id);
      }
      if (selectedStoreDetail?.id === st.id) {
        setSelectedStoreDetail(null);
      }
      alert(`Sucursal ${st.name} eliminada.`);
    }
  };

  const handleOpenEditStore = (st: Store) => {
    setEditingStore(JSON.parse(JSON.stringify(st)));
    setShowEditModal(true);
  };

  const handleSaveEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    if (onUpdateStore) {
      onUpdateStore(editingStore);
    }
    if (selectedStoreDetail?.id === editingStore.id) {
      setSelectedStoreDetail(editingStore);
    }
    setShowEditModal(false);
    setEditingStore(null);
    alert(`Sucursal ${editingStore.name} actualizada correctamente.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#eff4ff] text-[#00236f] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#dce9ff]">
              PLANILLA MAESTRA DE SUCURSALES
            </span>
            <span className="text-xs text-[#757682]">MERCADOS TOTTUS S.A.</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
            Inventario de Tiendas y Sucursales ({stores.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-3xl mt-0.5">
            Registro corporativo con Código de Identificación, Nombre de Tienda, Código SAP (Centro de Costos), Cluster, Gerencia Zonal, IT Operator y Ubicación Georreferenciada.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSharePointSync && (
            <button
              onClick={onOpenSharePointSync}
              className="bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 shrink-0 active:scale-95"
              title="Conectar y sincronizar lista de tiendas con repositorio de SharePoint Online"
            >
              <TableProperties className="w-4 h-4 text-emerald-100" />
              <span>Conectar con SharePoint (Lista)</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-white text-[#00236f] px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#dce9ff] hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
            title="Exportar planilla de tiendas a CSV"
          >
            <Download className="w-4 h-4 text-[#00236f]" />
            <span>Exportar Planilla CSV</span>
          </button>

          <button
            onClick={onOpenRegionalAlerts}
            className="bg-[#ba1a1a] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#ba1a1a]/20 hover:bg-[#93000a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emitir Alerta a Tienda</span>
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          {/* Main search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por código (ej. 103), nombre (ej. Megaplaza), código SAP (P009100101), gerente, operador IT o dirección..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Formato filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedFormat}
              onChange={e => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white"
            >
              <option value="todos">Todos los Formatos ({uniqueFormats.length})</option>
              {uniqueFormats.map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>

            {/* Cluster filter */}
            <select
              value={selectedCluster}
              onChange={e => {
                setSelectedCluster(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white"
            >
              <option value="todos">Todos los Clusters</option>
              {uniqueClusters.map(cl => (
                <option key={cl} value={cl}>Cluster: {cl}</option>
              ))}
            </select>

            {(searchQuery || selectedFormat !== 'todos' || selectedCluster !== 'todos' || selectedRegion !== 'todas') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFormat('todos');
                  setSelectedCluster('todos');
                  setSelectedRegion('todas');
                  setCurrentPage(1);
                }}
                className="text-xs text-[#ba1a1a] hover:underline px-2 whitespace-nowrap font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#757682] pt-1 border-t border-[#f0f4ff]">
          <div>
            Mostrando <strong>{filteredStores.length}</strong> de <strong>{stores.length}</strong> tiendas totales registradas
          </div>
          {copiedText && (
            <div className="text-[#10b981] font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Copiado al portapapeles: {copiedText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabular View: 16 Columns mirroring official Tottus spreadsheet */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1700px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                <th
                  onClick={() => handleSort('codTienda')}
                  className={`py-3 px-3 w-20 text-center sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'codTienda' ? 'bg-[#e2edff]' : 'bg-[#f0f4ff]'
                  }`}
                  title="Ordenar por Código ID (0-9 / 9-0)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>CÓDIGO ID</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'codTienda' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className={`py-3 px-3.5 min-w-[180px] sticky left-20 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'name' ? 'bg-[#e2edff]' : 'bg-[#f0f4ff]'
                  }`}
                  title="Ordenar por Nombre de Tienda (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>NOMBRE DE TIENDA</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'name' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sapCeco')}
                  className={`py-3 px-3 min-w-[130px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'sapCeco' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Código SAP / CECO (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>CÓDIGO SAP (CECO)</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'sapCeco' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cluster')}
                  className={`py-3 px-2.5 text-center w-20 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'cluster' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Cluster (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>CLUSTER</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'cluster' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('formato')}
                  className={`py-3 px-3 min-w-[120px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'formato' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Formato (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>FORMATO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'formato' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gZonal')}
                  className={`py-3 px-3 min-w-[110px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'gZonal' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por G Zonal (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>G ZONAL</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'gZonal' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gerenteTienda')}
                  className={`py-3 px-3.5 min-w-[160px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'gerenteTienda' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Gerente de Tienda (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>GERENTE DE TIENDA</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'gerenteTienda' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('itOperator')}
                  className={`py-3 px-3.5 min-w-[140px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'itOperator' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por IT Operator (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>IT OPERATOR</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'itOperator' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('direccion')}
                  className={`py-3 px-3.5 min-w-[220px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'direccion' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Dirección (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>DIRECCIÓN</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'direccion' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('distrito')}
                  className={`py-3 px-3 min-w-[120px] cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'distrito' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Distrito / Ciudad (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>DISTRITO / CIUDAD</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'distrito' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('situacion')}
                  className={`py-3 px-2.5 text-center w-24 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'situacion' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Situación (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SITUACIÓN</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'situacion' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[130px]">
                  COORDENADAS
                </th>
                <th
                  onClick={() => handleSort('totalEquipments')}
                  className={`py-3 px-3 text-center w-24 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'totalEquipments' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Total de Activos (0-9 / 9-0)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>TOTAL ACTIVOS</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'totalEquipments' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('operationalRate')}
                  className={`py-3 px-3 text-center w-24 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'operationalRate' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Disponibilidad Operativa (0-9 / 9-0)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>DISPONIBILIDAD</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'operationalRate' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className={`py-3 px-3 text-center w-24 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'status' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Estado (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ESTADO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'status' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-28 sticky right-0 bg-[#f0f4ff] z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-[#757682]">
                    No se encontraron tiendas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedStores.map((st, idx) => {
                  const isCritical = st.criticalIssues > 0 || st.status === 'alerta_regional';
                  const isMaintenance = st.status === 'mantenimiento_general';
                  const storeCodeDisplay = st.codTienda ? String(st.codTienda) : st.code.replace('T-', '');
                  const sapCecoDisplay = st.centroCostoSap || st.cecoSap || 'P009100101';

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStoreDetail(st)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      {/* 1. Código de Identificación (Sticky) */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#00236f] whitespace-nowrap sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <span className="inline-block bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff] text-xs">
                          {storeCodeDisplay}
                        </span>
                      </td>

                      {/* 2. Nombre de Tienda (Sticky) */}
                      <td className="py-3 px-3.5 sticky left-20 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
                          <span>{st.name}</span>
                        </div>
                        <div className="text-[10px] text-[#757682] font-mono mt-0.5">
                          {st.code} · {st.region}
                        </div>
                      </td>

                      {/* 3. Código SAP (Centro de Costos) */}
                      <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] font-bold text-[#00236f] bg-[#eef2ff] px-2 py-0.5 rounded border border-[#c7d2fe]">
                            {sapCecoDisplay}
                          </span>
                          <button
                            onClick={() => handleCopy(sapCecoDisplay)}
                            className="p-1 text-[#757682] hover:text-[#00236f] rounded hover:bg-[#eff4ff]"
                            title="Copiar Código SAP"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* 4. Cluster */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                          {st.cluster || 'GLP'}
                        </span>
                      </td>

                      {/* 5. Formato */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-[#0b1c30]">
                          {st.formato || 'Hiper'}
                        </span>
                      </td>

                      {/* 6. G Zonal */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-[#444651]">
                          {st.gZonal || 'G Luna'}
                        </span>
                      </td>

                      {/* 7. Gerente de Tienda */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30] text-[11px]">
                          {st.gerenteTienda || st.manager}
                        </div>
                        <div className="text-[10px] text-[#757682]">
                          {st.managerEmail}
                        </div>
                      </td>

                      {/* 8. IT Operator */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded">
                          <User className="w-3 h-3" />
                          <span>{st.itOperator || 'Adrian Lipa'}</span>
                        </div>
                      </td>

                      {/* 9. Dirección */}
                      <td className="py-3 px-3.5">
                        <div className="text-[11px] text-[#444651] max-w-[280px] truncate" title={st.direccion || st.address}>
                          {st.direccion || st.address}
                        </div>
                      </td>

                      {/* 10. Distrito / Ciudad */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#0b1c30] text-[11px]">
                          {st.distrito || st.city}
                        </div>
                        <div className="text-[10px] text-[#757682]">
                          {st.provincia || st.region}
                        </div>
                      </td>

                      {/* 11. Situación */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.situacion === 'Propia'
                              ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                              : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]'
                          }`}
                        >
                          {st.situacion || 'Propia'}
                        </span>
                      </td>

                      {/* 12. Coordenadas */}
                      <td className="py-3 px-3 text-center font-mono text-[10px] text-[#64748b] whitespace-nowrap">
                        {st.latitud && st.longitud ? (
                          <div className="flex items-center justify-center gap-1">
                            <span>{st.latitud.toFixed(3)}, {st.longitud.toFixed(3)}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* 13. Total Activos */}
                      <td className="py-3 px-3 text-center font-bold text-[#00236f] whitespace-nowrap">
                        {st.totalEquipments}
                      </td>

                      {/* 14. Disponibilidad */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-bold text-xs ${
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

                      {/* 15. Estado */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                          {isCritical ? 'Alerta' : isMaintenance ? 'Mantenim.' : 'Normal'}
                        </span>
                      </td>

                      {/* 16. Acciones (Sticky) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap sticky right-0 bg-inherit z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectStore(st)}
                            className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded font-medium text-[11px] flex items-center gap-0.5 border border-[#dce9ff]"
                            title="Ver Equipos de la Tienda en Inventario"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Equipos</span>
                          </button>
                          <button
                            onClick={() => onGenerateReportForStore(st)}
                            className="p-1.5 text-[#10b981] hover:bg-[#e8f5e9] rounded font-medium text-[11px] flex items-center gap-0.5 border border-[#a7f3d0]"
                            title="Emitir Informe Técnico de Tienda"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditStore(st)}
                            className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded font-medium text-[11px] border border-[#dce9ff]"
                            title="Modificar Datos de la Sucursal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStore(st)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded font-medium text-[11px] border border-red-200"
                            title="Eliminar Sucursal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757682]">
          <div>
            Mostrando <strong>{paginatedStores.length}</strong> de <strong>{filteredStores.length}</strong> sucursales (Página {currentPage} de {totalPages})
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2.5 py-0.5 rounded border border-[#dce9ff]">
                    CÓD: {selectedStoreDetail.codTienda || selectedStoreDetail.code.replace('T-', '')}
                  </span>
                  <span className="font-mono font-bold text-xs bg-[#f1f5f9] text-[#475569] px-2.5 py-0.5 rounded border border-[#e2e8f0]">
                    SAP: {selectedStoreDetail.centroCostoSap || selectedStoreDetail.cecoSap}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e]">
                    Cluster: {selectedStoreDetail.cluster || 'GLP'}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-[#0b1c30] mt-1.5">
                  {selectedStoreDetail.name} ({selectedStoreDetail.formato || 'Hiper'})
                </h3>
                <p className="text-xs text-[#757682] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  <span>{selectedStoreDetail.direccion || selectedStoreDetail.address}, {selectedStoreDetail.distrito || selectedStoreDetail.city}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedStoreDetail(null)}
                className="text-[#757682] hover:text-[#0b1c30] p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Gerencia Zonal</span>
                <strong className="text-[#00236f] text-xs">{selectedStoreDetail.gZonal || 'G Luna'}</strong>
              </div>
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">IT Operator</span>
                <strong className="text-[#00236f] text-xs">{selectedStoreDetail.itOperator || 'Adrian Lipa'}</strong>
              </div>
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Situación Legal</span>
                <strong className="text-[#0b1c30] text-xs">{selectedStoreDetail.situacion || 'Propia'}</strong>
              </div>
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Gerente de Tienda</span>
                <strong className="text-[#0b1c30] text-xs">{selectedStoreDetail.gerenteTienda || selectedStoreDetail.manager}</strong>
                <div className="text-[10px] text-[#757682] truncate">{selectedStoreDetail.managerEmail}</div>
              </div>
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Región Operativa</span>
                <strong className="text-[#00236f] text-xs">{selectedStoreDetail.region}</strong>
                <div className="text-[10px] text-[#757682]">{selectedStoreDetail.provincia || selectedStoreDetail.city}</div>
              </div>
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <span className="text-[#757682] text-[10px] uppercase font-bold block">Disponibilidad Activos</span>
                <strong className="text-[#10b981] text-xs">{selectedStoreDetail.operationalRate}% Uptime</strong>
                <div className="text-[10px] text-[#757682]">{selectedStoreDetail.totalEquipments} equipos</div>
              </div>
            </div>

            {selectedStoreDetail.latitud && selectedStoreDetail.longitud && (
              <div className="p-2.5 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#166534] block">Coordenadas GPS de Tienda</span>
                  <span className="font-mono text-[#15803d] font-bold">
                    Lat: {selectedStoreDetail.latitud} | Lon: {selectedStoreDetail.longitud}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(`${selectedStoreDetail.latitud}, ${selectedStoreDetail.longitud}`)}
                  className="px-2 py-1 bg-white text-[#166534] rounded border border-[#bbf7d0] font-semibold text-[11px] hover:bg-[#dcfce7]"
                >
                  Copiar GPS
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectStore(selectedStoreDetail);
                  setSelectedStoreDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-1.5"
              >
                <Boxes className="w-4 h-4" />
                <span>Ver Equipos en Inventario ({selectedStoreDetail.totalEquipments})</span>
              </button>
              <button
                onClick={() => {
                  onGenerateReportForStore(selectedStoreDetail);
                  setSelectedStoreDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] border border-[#dce9ff] rounded-lg text-xs font-bold hover:bg-[#dce9ff] transition-all flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Emitir Informe Técnico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Modificar Sucursal / Tienda {editingStore.name} ({editingStore.code})
                </h3>
                <p className="text-xs text-[#757682]">
                  Actualice los datos maestros de la tienda, Centro de Costos SAP o asignación IT.
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[#757682] p-1 font-bold hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditStore} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Nombre de Tienda
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.name}
                    onChange={e => setEditingStore({ ...editingStore, name: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Código de Identificación (ej. T-103)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.code}
                    onChange={e => setEditingStore({ ...editingStore, code: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    N° Tienda (Cod. Numérico)
                  </label>
                  <input
                    type="number"
                    value={editingStore.codTienda || ''}
                    onChange={e => setEditingStore({ ...editingStore, codTienda: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Centro de Costo SAP (CECO)
                  </label>
                  <input
                    type="text"
                    value={editingStore.centroCostoSap || editingStore.cecoSap || ''}
                    onChange={e => setEditingStore({ ...editingStore, centroCostoSap: e.target.value, cecoSap: e.target.value })}
                    placeholder="P009100101"
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono font-bold text-[#00236f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Cluster
                  </label>
                  <input
                    type="text"
                    value={editingStore.cluster || 'GLP'}
                    onChange={e => setEditingStore({ ...editingStore, cluster: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Formato
                  </label>
                  <select
                    value={editingStore.formato || 'Hiper'}
                    onChange={e => setEditingStore({ ...editingStore, formato: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Hiper">Hiper</option>
                    <option value="Super">Super</option>
                    <option value="Express">Express</option>
                    <option value="Vecino">Vecino</option>
                    <option value="Power Center">Power Center</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Región
                  </label>
                  <select
                    value={editingStore.region}
                    onChange={e => setEditingStore({ ...editingStore, region: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Lima y Callao">Lima y Callao</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Sur">Zona Sur</option>
                    <option value="Zona Centro">Zona Centro</option>
                    <option value="Zona Oriente">Zona Oriente</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Situación Inmueble
                  </label>
                  <select
                    value={editingStore.situacion || 'Propia'}
                    onChange={e => setEditingStore({ ...editingStore, situacion: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Propia">Propia</option>
                    <option value="Arrendada">Arrendada</option>
                    <option value="Mixta">Mixta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Gerencia Zonal (G Zonal)
                  </label>
                  <input
                    type="text"
                    value={editingStore.gZonal || ''}
                    onChange={e => setEditingStore({ ...editingStore, gZonal: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Operador / Técnico IT Responsable
                  </label>
                  <input
                    type="text"
                    value={editingStore.itOperator || ''}
                    onChange={e => setEditingStore({ ...editingStore, itOperator: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={editingStore.direccion || editingStore.address || ''}
                    onChange={e => setEditingStore({ ...editingStore, direccion: e.target.value, address: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Segmento de Red IP
                  </label>
                  <input
                    type="text"
                    value={editingStore.ipRed || ''}
                    onChange={e => setEditingStore({ ...editingStore, ipRed: e.target.value })}
                    placeholder="10.103.0.0/24"
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Modificación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

