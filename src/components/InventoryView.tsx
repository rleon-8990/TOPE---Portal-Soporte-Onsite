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
  FileSpreadsheet,
  Network,
  Router,
  Radio,
  Server,
  Activity,
  Laptop,
  RefreshCw,
  Check,
  Copy,
  Cpu,
  Layers,
  ArrowUpDown,
  Edit2,
  Trash2,
  Save,
  ShieldCheck
} from 'lucide-react';
import { Equipment, Store, AppUser } from '../types';
import { EQUIPMENT_CATEGORIES } from '../data/mockData';
import { PortalAccessMatrixTab } from './PortalAccessMatrixTab';

interface InventoryViewProps {
  equipments: Equipment[];
  stores: Store[];
  users?: AppUser[];
  currentUser?: AppUser;
  onSelectEquipment: (equipment: Equipment) => void;
  onOpenNewEquipment: () => void;
  onOpenQRScanner: () => void;
  onUpdateEquipment?: (updatedEq: Equipment) => void;
  onDeleteEquipment?: (equipmentId: string) => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
  onNavigateToUsers?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  equipments,
  stores,
  users = [],
  currentUser,
  onSelectEquipment,
  onOpenNewEquipment,
  onOpenQRScanner,
  onUpdateEquipment,
  onDeleteEquipment,
  onUpdateUser,
  onNavigateToUsers,
}) => {
  // Mode toggle: 'general' vs 'enlaces_comunicacion' vs 'matriz_accesos'
  const [activeTab, setActiveTab] = useState<'general' | 'enlaces_comunicacion' | 'matriz_accesos'>('general');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedSwitchFilter, setSelectedSwitchFilter] = useState<string>('todos');
  const [onlyCalibrationAlerts, setOnlyCalibrationAlerts] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof Equipment>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [pingTestingId, setPingTestingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { ms: number; status: 'ok' | 'fail' }>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Extract unique switches for filter
  const uniqueSwitches = useMemo(() => {
    const set = new Set<string>();
    equipments.forEach(e => {
      if (e.switchName && e.switchName !== 'No aplica' && !e.switchName.includes('No aplica')) {
        set.add(e.switchName);
      }
    });
    return Array.from(set).sort();
  }, [equipments]);

  // Network stats
  const networkStats = useMemo(() => {
    const withSwitch = equipments.filter(e => e.switchName && e.switchName !== 'No aplica' && !e.switchName.includes('No aplica'));
    const onlineCount = withSwitch.filter(e => e.linkStatus !== 'down').length;
    const switchesCount = uniqueSwitches.length;
    const posCpuCount = equipments.filter(e => e.hostName || e.sistemaAsociado === 'PUNTO DE VENTAS').length;
    return { withSwitch: withSwitch.length, onlineCount, switchesCount, posCpuCount };
  }, [equipments, uniqueSwitches]);

  // Filter logic
  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => {
      // In network links view, prioritize devices with switch/IP/hostname or network connection
      if (activeTab === 'enlaces_comunicacion') {
        if (selectedSwitchFilter !== 'todos') {
          if (eq.switchName !== selectedSwitchFilter) return false;
        }
      }

      // Search text across standard and TOPE network fields
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === '' ||
        eq.name.toLowerCase().includes(query) ||
        eq.code.toLowerCase().includes(query) ||
        eq.brand.toLowerCase().includes(query) ||
        eq.model.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        eq.storeName.toLowerCase().includes(query) ||
        eq.locationInStore.toLowerCase().includes(query) ||
        (eq.hostName && eq.hostName.toLowerCase().includes(query)) ||
        (eq.ipAddress && eq.ipAddress.toLowerCase().includes(query)) ||
        (eq.switchName && eq.switchName.toLowerCase().includes(query)) ||
        (eq.puertoSwitch && eq.puertoSwitch.toLowerCase().includes(query)) ||
        (eq.macAddress && eq.macAddress.toLowerCase().includes(query)) ||
        (eq.storeCodeNumber && eq.storeCodeNumber.toLowerCase().includes(query)) ||
        (eq.centroCostos && eq.centroCostos.toLowerCase().includes(query)) ||
        (eq.partNumber && eq.partNumber.toLowerCase().includes(query));

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
      let valA: string = '';
      let valB: string = '';

      if (sortField === 'brand') {
        valA = `${a.brand || ''} ${a.model || ''}`.trim().toLowerCase();
        valB = `${b.brand || ''} ${b.model || ''}`.trim().toLowerCase();
      } else if (sortField === 'code') {
        valA = `${a.code || ''} ${a.hostName || ''}`.trim().toLowerCase();
        valB = `${b.code || ''} ${b.hostName || ''}`.trim().toLowerCase();
      } else if (sortField === 'storeName') {
        valA = `${a.storeName || ''} ${a.locationInStore || ''}`.trim().toLowerCase();
        valB = `${b.storeName || ''} ${b.locationInStore || ''}`.trim().toLowerCase();
      } else if (sortField === 'ipAddress') {
        valA = (a.ipAddress || a.macAddress || '').toLowerCase();
        valB = (b.ipAddress || b.macAddress || '').toLowerCase();
      } else if (sortField === 'gateway') {
        valA = (a.gateway || a.mascara || '').toLowerCase();
        valB = (b.gateway || b.mascara || '').toLowerCase();
      } else {
        valA = (a[sortField] ?? '').toString().toLowerCase();
        valB = (b[sortField] ?? '').toString().toLowerCase();
      }

      const cmp = valA.localeCompare(valB, 'es', { numeric: true, sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
  }, [
    equipments,
    stores,
    activeTab,
    selectedSwitchFilter,
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

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleSimulatePing = (eqId: string, ip?: string) => {
    if (!ip || ip.includes('No aplica')) return;
    setPingTestingId(eqId);
    setTimeout(() => {
      const latency = Math.floor(1 + Math.random() * 8); // 1-9 ms in local store LAN
      setPingResults(prev => ({ ...prev, [eqId]: { ms: latency, status: 'ok' } }));
      setPingTestingId(null);
    }, 450);
  };

  const handleExportCSV = () => {
    if (activeTab === 'enlaces_comunicacion') {
      // Specialized Network & Switch Links Export
      const headers = 'País,Negocio,COD_Tienda,Tienda,Centro_Costos,HostName,Equipo,Sistema_Asociado,Marca,Modelo,PartNumber,Serie,IP,MAC_Address,Mascara,Gateway,Switch,Puerto_Switch,VLAN,Estado_Enlace,Procesador,SO,RAM,Disco,Ubicacion,Proveedor,Formato,Direccion_Fiscal\n';
      const rows = filteredEquipments
        .map(e =>
          `"Perú","MERCADOS TOTTUS","${e.storeCodeNumber || e.storeCode || ''}","${e.storeName}","${e.centroCostos || ''}","${e.hostName || ''}","${e.name}","${e.sistemaAsociado || 'PUNTO DE VENTAS'}","${e.brand}","${e.model}","${e.partNumber || ''}","${e.serialNumber}","${e.ipAddress || ''}","${e.macAddress || ''}","${e.mascara || '255.255.255.0'}","${e.gateway || ''}","${e.switchName || ''}","${e.puertoSwitch || ''}","${e.vlan || ''}","${e.linkStatus === 'down' ? 'DOWN' : 'LINK UP'}","${e.procesador || ''}","${e.sistemaOperativo || ''}","${e.memoriaRam || ''}","${e.discoDuro || ''}","${e.locationInStore}","${e.proveedor || 'NCR COMMERCE DEL PERU S.A.C.'}","${e.formato || ''}","${e.direccionFiscal || ''}"`
        )
        .join('\n');

      const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Inventario_Enlaces_Switches_Puertos_Tottus_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // General Equipment Export with full TOPE columns
      const headers = 'Código,HostName,Nombre,Categoría,Tienda,COD_Tienda,Centro_Costos,Ubicación,Marca,Modelo,PartNumber,Serie,Switch,Puerto,IP,MAC_Address,Estado,Próximo_Mantenimiento,Proveedor,Costo_Servicio\n';
      const rows = filteredEquipments
        .map(e =>
          `"${e.code}","${e.hostName || ''}","${e.name}","${e.categoryName}","${e.storeName}","${e.storeCodeNumber || ''}","${e.centroCostos || ''}","${e.locationInStore}","${e.brand}","${e.model}","${e.partNumber || ''}","${e.serialNumber}","${e.switchName || ''}","${e.puertoSwitch || ''}","${e.ipAddress || ''}","${e.macAddress || ''}","${e.status}","${e.nextMaintenance}","${e.proveedor || ''}","${e.costoServicio || ''}"`
        )
        .join('\n');

      const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Inventario_Equipos_Tottus_Soporte_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (eq: Equipment) => {
    const confirm = window.confirm(`¿Está seguro de eliminar el equipo "${eq.name}" (${eq.code}) de la sucursal ${eq.storeName}? Esta acción no se puede deshacer.`);
    if (confirm) {
      if (onDeleteEquipment) {
        onDeleteEquipment(eq.id);
      }
      alert(`Equipo ${eq.code} eliminado correctamente.`);
    }
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingEquipment(JSON.parse(JSON.stringify(eq)));
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    if (onUpdateEquipment) {
      onUpdateEquipment(editingEquipment);
    }
    setShowEditModal(false);
    setEditingEquipment(null);
    alert(`Equipo ${editingEquipment.code} actualizado correctamente.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#eff4ff] text-[#00236f] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#dce9ff]">
              TOPE · MERCADOS TOTTUS
            </span>
            <span className="text-xs text-[#757682]">Infraestructura & Soporte Onsite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
            {activeTab === 'general' ? 'Inventario de Activos y Equipamiento' : 'Inventario de Enlace a Equipos de Comunicación'}
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-3xl mt-0.5">
            {activeTab === 'general'
              ? `Registro integral de activos tecnológicos, puntos de venta y electromecánicos en 90 tiendas. ${filteredEquipments.length} equipos filtrados.`
              : `Mapeo físico de conexiones a switches de red, puertos asignados, VLAN, IP y direccionamiento en tiendas TOPE. ${filteredEquipments.length} activos visualizados.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenNewEquipment}
            className="bg-[#00236f] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 active:scale-95"
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
            title={activeTab === 'enlaces_comunicacion' ? 'Descargar Enlaces de Switches en CSV' : 'Descargar Inventario en CSV'}
          >
            <Download className="w-4 h-4" />
            <span>{activeTab === 'enlaces_comunicacion' ? 'Exportar Enlaces CSV' : 'Exportar CSV'}</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Tabs (General vs Enlace a Switches de Comunicación) */}
      <div className="flex border-b border-[#dce9ff] bg-white rounded-t-xl px-2 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => {
            setActiveTab('general');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'general'
              ? 'border-[#00236f] text-[#00236f] bg-[#eff4ff]/60 rounded-t-lg'
              : 'border-transparent text-[#757682] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-t-lg'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vista General de Activos</span>
          <span className="ml-1 text-[11px] bg-[#dce9ff] text-[#00236f] px-1.5 py-0.2 rounded-full font-mono">
            {equipments.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('enlaces_comunicacion');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'enlaces_comunicacion'
              ? 'border-[#00236f] text-[#00236f] bg-[#eff4ff]/60 rounded-t-lg'
              : 'border-transparent text-[#757682] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-t-lg'
          }`}
        >
          <Network className="w-4 h-4 text-[#00236f]" />
          <span>Enlace a Equipos de Comunicación (Switches & Puertos)</span>
          <span className="ml-1 text-[11px] bg-[#00236f] text-white px-2 py-0.2 rounded-full font-mono font-bold">
            {networkStats.withSwitch}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('matriz_accesos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'matriz_accesos'
              ? 'border-[#00236f] text-[#00236f] bg-[#eff4ff]/60 rounded-t-lg'
              : 'border-transparent text-[#757682] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-t-lg'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Matriz de Accesos al Portal & Privilegios (RBAC)</span>
          <span className="ml-1 text-[11px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-mono font-bold">
            {users.length}
          </span>
        </button>
      </div>

      {activeTab === 'matriz_accesos' ? (
        <PortalAccessMatrixTab
          users={users}
          stores={stores}
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onNavigateToUsers={onNavigateToUsers}
        />
      ) : (
        <>
          {/* Summary Banner for Network Links View */}
      {activeTab === 'enlaces_comunicacion' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00236f] shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#757682]">Switches Registrados</div>
              <div className="text-base font-extrabold text-[#0b1c30]">{networkStats.switchesCount} Switches</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[#10b981] shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#757682]">Enlaces Activos (Link UP)</div>
              <div className="text-base font-extrabold text-[#10b981]">{networkStats.onlineCount} Puertos</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00236f] shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#757682]">Terminales POS / HostNames</div>
              <div className="text-base font-extrabold text-[#00236f]">{networkStats.posCpuCount} Equipos</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#fff3e0] flex items-center justify-center text-[#fd761a] shrink-0">
              <Router className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#757682]">VLAN Predeterminada</div>
              <div className="text-base font-extrabold text-[#0b1c30]">VLAN 101 (POS)</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder={
                activeTab === 'enlaces_comunicacion'
                  ? 'Buscar por HostName (ej. PS316001), IP, Switch, Puerto o MAC...'
                  : 'Buscar por código, nombre, serie, marca o tienda...'
              }
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

          {/* Switch Filter (if activeTab is enlaces_comunicacion) OR Category Dropdown */}
          {activeTab === 'enlaces_comunicacion' ? (
            <div>
              <select
                value={selectedSwitchFilter}
                onChange={e => {
                  setSelectedSwitchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
              >
                <option value="todos">Todos los Switches de Red</option>
                {uniqueSwitches.map(sw => (
                  <option key={sw} value={sw}>
                    {sw}
                  </option>
                ))}
              </select>
            </div>
          ) : (
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
          )}

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
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* Main Tabular View: Based on activeTab */}
      {activeTab === 'enlaces_comunicacion' ? (
        /* VISTA DE ENLACE A EQUIPOS DE COMUNICACIÓN (SWITCHES & PUERTOS) */
        <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                  <th
                    onClick={() => handleSort('hostName')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors w-32 group ${
                      sortField === 'hostName' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por HostName (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>HOSTNAME</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'hostName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'name' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Nombre de Equipo (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>EQUIPO / SERVICIO</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'name' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('storeName')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'storeName' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Tienda y Código (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>TIENDA & COD</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'storeName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('locationInStore')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'locationInStore' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Ubicación en Tienda (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>UBICACIÓN</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'locationInStore' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('switchName')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors bg-[#e8efff]/60 group ${
                      sortField === 'switchName' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Switch de Red (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1 text-[#00236f]">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5" />
                        <span>SWITCH DE RED</span>
                      </div>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'switchName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('puertoSwitch')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors bg-[#e8efff]/60 w-28 text-center group ${
                      sortField === 'puertoSwitch' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Puerto de Switch (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-center gap-1 text-[#00236f]">
                      <Network className="w-3.5 h-3.5" />
                      <span>PUERTO</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'puertoSwitch' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ipAddress')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'ipAddress' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Dirección IP (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>DIRECCIÓN IP / MAC</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'ipAddress' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('gateway')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'gateway' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Gateway / Máscara (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>GATEWAY / MÁSCARA</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'gateway' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('linkStatus')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors text-center group ${
                      sortField === 'linkStatus' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Estado de Enlace (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ESTADO ENLACE</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'linkStatus' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-center w-28">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ff]">
                {paginatedEquipments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#757682]">
                      No se encontraron activos con información de enlaces de red que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  paginatedEquipments.map((eq, index) => {
                    const hasSwitch = eq.switchName && eq.switchName !== 'No aplica' && !eq.switchName.includes('No aplica');
                    const isPortValid = eq.puertoSwitch && eq.puertoSwitch !== 'No aplica';
                    const pingResult = pingResults[eq.id];
                    const isTesting = pingTestingId === eq.id;

                    return (
                      <tr
                        key={eq.id}
                        onClick={() => onSelectEquipment(eq)}
                        className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                        }`}
                      >
                        {/* HostName */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {eq.hostName ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded border border-[#dce9ff]">
                                {eq.hostName}
                              </span>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleCopy(eq.hostName!);
                                }}
                                title="Copiar HostName"
                                className="text-[#757682] hover:text-[#00236f] p-0.5"
                              >
                                {copiedText === eq.hostName ? (
                                  <Check className="w-3 h-3 text-[#10b981]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-[#757682] bg-gray-100 px-1.5 py-0.5 rounded">
                              {eq.code}
                            </span>
                          )}
                        </td>

                        {/* Equipo / Servicio */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-[#0b1c30] line-clamp-1">{eq.name}</div>
                          <div className="text-[11px] text-[#757682]">
                            {eq.brand} {eq.model} {eq.partNumber ? `· PN: ${eq.partNumber}` : ''}
                          </div>
                        </td>

                        {/* Tienda & COD */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                            {eq.storeCodeNumber && (
                              <span className="text-[10px] font-bold bg-[#eff4ff] text-[#00236f] px-1.5 py-0.2 rounded">
                                COD {eq.storeCodeNumber}
                              </span>
                            )}
                            <span>{eq.storeName}</span>
                          </div>
                          <div className="text-[10px] text-[#757682]">{eq.formato || 'Sede'}</div>
                        </td>

                        {/* Ubicación */}
                        <td className="py-3 px-3.5">
                          <span className="inline-block bg-[#f0f4ff] text-[#0b1c30] font-medium px-2 py-0.5 rounded text-[11px]">
                            {eq.locationInStore}
                          </span>
                        </td>

                        {/* Switch de Comunicación */}
                        <td className="py-3 px-3.5 whitespace-nowrap bg-[#f9fbff]">
                          {hasSwitch ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                              <span className="font-mono font-bold text-xs text-[#00236f]">
                                {eq.switchName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#757682] italic">
                              {eq.switchName || 'No aplica (Periférico)'}
                            </span>
                          )}
                        </td>

                        {/* Puerto Switch */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap bg-[#f9fbff]">
                          {isPortValid ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#00236f] text-white px-2.5 py-1 rounded-md shadow-xs">
                              <Network className="w-3 h-3" />
                              {eq.puertoSwitch}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#757682] bg-gray-100 px-2 py-0.5 rounded">
                              {eq.puertoSwitch || 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* IP & MAC */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {eq.ipAddress ? (
                            <div>
                              <div className="font-mono font-bold text-xs text-[#0b1c30]">{eq.ipAddress}</div>
                              {eq.macAddress && (
                                <div className="font-mono text-[10px] text-[#757682]">{eq.macAddress}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#757682] italic">Sin IP directa</span>
                          )}
                        </td>

                        {/* Gateway / Máscara */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {eq.gateway ? (
                            <div>
                              <div className="font-mono text-xs text-[#0b1c30]">GW: {eq.gateway}</div>
                              <div className="font-mono text-[10px] text-[#757682]">{eq.mascara || '255.255.255.0'}</div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#757682]">-</span>
                          )}
                        </td>

                        {/* Estado Enlace / Link Status */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          {hasSwitch && isPortValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#10b981]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                              LINK UP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#757682]">
                              PERIFÉRICO
                            </span>
                          )}
                        </td>

                        {/* Acciones / Test Ping */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {eq.ipAddress && (
                              <button
                                onClick={() => handleSimulatePing(eq.id, eq.ipAddress)}
                                disabled={isTesting}
                                className="px-2 py-1 text-[10px] font-bold bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded border border-[#dce9ff] transition-all flex items-center gap-1"
                                title="Probar conectividad de red / Ping"
                              >
                                {isTesting ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-[#00236f]" />
                                ) : pingResult ? (
                                  <span className="text-[#10b981]">{pingResult.ms}ms OK</span>
                                ) : (
                                  <span>Ping</span>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => onSelectEquipment(eq)}
                              className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors"
                              title="Ver Ficha Técnica Completa"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(eq)}
                              className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors"
                              title="Modificar Datos del Equipo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(eq)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar Equipo del Inventario"
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
          <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex items-center justify-between text-xs text-[#757682]">
            <div>
              Mostrando <strong>{paginatedEquipments.length}</strong> de <strong>{filteredEquipments.length}</strong> enlaces a switch registrados
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
      ) : (
        /* VISTA GENERAL DE INVENTARIO Y ACTIVOS */
        <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                  <th
                    onClick={() => handleSort('code')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors w-32 group ${
                      sortField === 'code' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Código / Host (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>CÓDIGO / HOST</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'code' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'name' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Equipo / Descripción (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>EQUIPO / DESCRIPCIÓN</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'name' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('categoryName')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'categoryName' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Categoría (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>CATEGORÍA</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'categoryName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('storeName')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'storeName' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Sucursal / Ubicación (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>SUCURSAL / UBICACIÓN</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'storeName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('brand')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'brand' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Marca & Modelo (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>MARCA & MODELO</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'brand' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('serialNumber')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'serialNumber' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por N° de Serie (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>N° SERIE</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'serialNumber' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'status' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Estado Operativo (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>ESTADO</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'status' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nextMaintenance')}
                    className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                      sortField === 'nextMaintenance' ? 'bg-[#e2edff]' : ''
                    }`}
                    title="Ordenar por Fecha de Próximo Mantenimiento (A-Z / Z-A)"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>PRÓXIMO MTTO</span>
                      <span className="text-xs font-bold shrink-0">
                        {sortField === 'nextMaintenance' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                      </span>
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
                            {eq.hostName && (
                              <span
                                title={`HostName: ${eq.hostName}`}
                                className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200"
                              >
                                {eq.hostName}
                              </span>
                            )}
                            {eq.calibrationAlert && (
                              <span title="Alerta de Calibración Vencida" className="text-[#ba1a1a]">
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="font-bold text-[#0b1c30] line-clamp-1">{eq.name}</div>
                          <div className="text-[11px] text-[#757682]">
                            {eq.statusDetail || (eq.partNumber ? `PN: ${eq.partNumber}` : 'Calibrado y operativo')}
                          </div>
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="inline-block bg-[#f0f4ff] text-[#00236f] font-medium px-2 py-0.5 rounded text-[11px]">
                            {eq.categoryName}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-[#0b1c30] whitespace-nowrap flex items-center gap-1">
                            {eq.storeCodeNumber && (
                              <span className="text-[10px] font-bold text-[#00236f] bg-[#e5eeff] px-1 rounded">
                                {eq.storeCodeNumber}
                              </span>
                            )}
                            <span>{eq.storeName}</span>
                          </div>
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
                            <button
                              onClick={() => handleOpenEdit(eq)}
                              className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors"
                              title="Modificar Datos del Equipo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(eq)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar Equipo del Inventario"
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
      )}
        </>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Modificar Equipo / Activo {editingEquipment.code}
                </h3>
                <p className="text-xs text-[#757682]">
                  Actualice los datos técnicos, red, switch o estado del activo.
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[#757682] p-1 font-bold hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Nombre del Equipo / Servicio
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.name}
                    onChange={e => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    HostName de Red (DNS)
                  </label>
                  <input
                    type="text"
                    value={editingEquipment.hostName || ''}
                    onChange={e => setEditingEquipment({ ...editingEquipment, hostName: e.target.value })}
                    placeholder="ej. T103-POS01"
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Categoría
                  </label>
                  <select
                    value={editingEquipment.categoryId}
                    onChange={e => {
                      const cat = EQUIPMENT_CATEGORIES.find(c => c.id === e.target.value);
                      setEditingEquipment({
                        ...editingEquipment,
                        categoryId: e.target.value,
                        categoryName: cat?.name || editingEquipment.categoryName
                      });
                    }}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {EQUIPMENT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={editingEquipment.brand}
                    onChange={e => setEditingEquipment({ ...editingEquipment, brand: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={editingEquipment.model}
                    onChange={e => setEditingEquipment({ ...editingEquipment, model: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={editingEquipment.serialNumber}
                    onChange={e => setEditingEquipment({ ...editingEquipment, serialNumber: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tienda / Sucursal Asignada
                  </label>
                  <select
                    value={editingEquipment.storeId}
                    onChange={e => {
                      const st = stores.find(s => s.id === e.target.value);
                      if (st) {
                        setEditingEquipment({
                          ...editingEquipment,
                          storeId: st.id,
                          storeName: st.name
                        });
                      }
                    }}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Ubicación en Tienda (Sector)
                  </label>
                  <input
                    type="text"
                    value={editingEquipment.locationInStore}
                    onChange={e => setEditingEquipment({ ...editingEquipment, locationInStore: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Estado Operativo
                  </label>
                  <select
                    value={editingEquipment.status}
                    onChange={e => setEditingEquipment({ ...editingEquipment, status: e.target.value as any })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="operativo">Operativo (Normal)</option>
                    <option value="mantenimiento">En Mantenimiento</option>
                    <option value="falla_critica">Falla Crítica</option>
                    <option value="fuera_servicio">Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              {/* Red & Switches */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-3">
                <span className="text-xs font-bold text-[#00236f] uppercase block">
                  Configuración de Enlace & Red
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#757682] block mb-1">Dirección IP</label>
                    <input
                      type="text"
                      value={editingEquipment.ipAddress || ''}
                      onChange={e => setEditingEquipment({ ...editingEquipment, ipAddress: e.target.value })}
                      placeholder="10.x.x.x"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#757682] block mb-1">Switch de Red</label>
                    <input
                      type="text"
                      value={editingEquipment.switchName || ''}
                      onChange={e => setEditingEquipment({ ...editingEquipment, switchName: e.target.value })}
                      placeholder="ej. SW-CORE-01"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#757682] block mb-1">Puerto de Switch</label>
                    <input
                      type="text"
                      value={editingEquipment.puertoSwitch || ''}
                      onChange={e => setEditingEquipment({ ...editingEquipment, puertoSwitch: e.target.value })}
                      placeholder="ej. Gi0/12"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#757682] block mb-1">Próximo Mantenimiento</label>
                    <input
                      type="date"
                      value={editingEquipment.nextMaintenance || ''}
                      onChange={e => setEditingEquipment({ ...editingEquipment, nextMaintenance: e.target.value })}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>
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
