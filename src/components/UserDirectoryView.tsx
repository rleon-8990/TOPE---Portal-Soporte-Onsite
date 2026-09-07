import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Shield,
  CheckCircle,
  Plus,
  UserCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  Clock,
  RefreshCw,
  Edit2,
  Trash2,
  Store as StoreIcon,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import { AppUser, Store, Region } from '../types';

interface UserDirectoryViewProps {
  users: AppUser[];
  stores?: Store[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser?: (user: AppUser) => void;
  onDeleteUser?: (userId: string) => void;
  onSelectStore?: (store: Store) => void;
}

export const UserDirectoryView: React.FC<UserDirectoryViewProps> = ({
  users,
  stores = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSelectStore
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'todos' | 'tienda' | 'especialistas'>('todos');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('todas');
  const [selectedCargoFilter, setSelectedCargoFilter] = useState<string>('todos');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Copy Feedback
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form State
  const [userType, setUserType] = useState<'tienda' | 'especialista'>('tienda');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [anexo, setAnexo] = useState('');
  const [cargo, setCargo] = useState('Gerente de Tienda');
  const [selectedStoreCode, setSelectedStoreCode] = useState<string>('');
  const [assignedRegion, setAssignedRegion] = useState<Region | 'Nacional'>('Lima y Callao');
  const [specialty, setSpecialty] = useState('');
  const [turno, setTurno] = useState('Completo');
  const [status, setStatus] = useState<'disponible' | 'en_servicio' | 'ausente'>('disponible');

  // Sync notice state
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Available unique stores from props
  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const codeA = Number(a.codTienda) || 0;
      const codeB = Number(b.codTienda) || 0;
      return codeA - codeB;
    });
  }, [stores]);

  // Unique cargos across all users
  const uniqueCargos = useMemo(() => {
    const cargos = new Set<string>();
    users.forEach(u => {
      if (u.cargo) cargos.add(u.cargo);
      if (u.role && !u.cargo) cargos.add(u.role);
    });
    return Array.from(cargos).sort();
  }, [users]);

  // Filtered Users Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Tab filter
      if (activeTab === 'tienda') {
        if (u.userType !== 'tienda' && !u.codTienda) return false;
      } else if (activeTab === 'especialistas') {
        if (u.userType === 'tienda' && u.codTienda) return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        const matchesCargo = (u.cargo || u.role || '').toLowerCase().includes(q);
        const matchesTienda = (u.tiendaNombre || '').toLowerCase().includes(q);
        const matchesCod = String(u.codTienda || '').toLowerCase().includes(q);
        const matchesRegion = (u.assignedRegion || '').toLowerCase().includes(q);
        const matchesSpecialty = (u.specialty || '').toLowerCase().includes(q);
        const matchesAnexo = (u.anexo || '').toLowerCase().includes(q);
        const matchesDistrito = (u.distrito || '').toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesCargo &&
          !matchesTienda &&
          !matchesCod &&
          !matchesRegion &&
          !matchesSpecialty &&
          !matchesAnexo &&
          !matchesDistrito
        ) {
          return false;
        }
      }

      // Store Filter
      if (selectedStoreFilter !== 'todas') {
        if (String(u.codTienda) !== selectedStoreFilter) return false;
      }

      // Cargo Filter
      if (selectedCargoFilter !== 'todos') {
        const uCargo = (u.cargo || u.role || '').toLowerCase();
        if (!uCargo.includes(selectedCargoFilter.toLowerCase())) return false;
      }

      // Region Filter
      if (selectedRegionFilter !== 'todas') {
        if (u.assignedRegion !== selectedRegionFilter && u.assignedRegion !== 'Nacional') return false;
      }

      // Status Filter
      if (selectedStatusFilter !== 'todos') {
        if (u.status !== selectedStatusFilter) return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery, selectedStoreFilter, selectedCargoFilter, selectedRegionFilter, selectedStatusFilter]);

  // Metrics Calculation
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const storeUsers = users.filter(u => u.userType === 'tienda' || Boolean(u.codTienda)).length;
    const specialistUsers = users.filter(u => u.userType === 'especialista' || (!u.codTienda && u.specialty)).length;

    const coveredStoreCodes = new Set(
      users.filter(u => u.codTienda).map(u => String(u.codTienda))
    );

    return {
      totalUsers,
      storeUsers,
      specialistUsers,
      coveredStoresCount: coveredStoreCodes.size
    };
  }, [users]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Copy Email Helper
  const handleCopyEmail = (emailStr: string, id: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmailId(id);
    setTimeout(() => {
      setCopiedEmailId(null);
    }, 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUserType('tienda');
    setName('');
    setEmail('');
    setPhone('+51 9');
    setAnexo('');
    setCargo('Gerente de Tienda');
    const firstStore = sortedStores[0];
    if (firstStore) {
      setSelectedStoreCode(String(firstStore.codTienda));
      setAssignedRegion(firstStore.region);
    } else {
      setSelectedStoreCode('');
      setAssignedRegion('Lima y Callao');
    }
    setSpecialty('');
    setTurno('Completo');
    setStatus('disponible');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setUserType(user.userType || (user.codTienda ? 'tienda' : 'especialista'));
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setAnexo(user.anexo || '');
    setCargo(user.cargo || user.role || 'Gerente de Tienda');
    setSelectedStoreCode(user.codTienda ? String(user.codTienda) : '');
    setAssignedRegion(user.assignedRegion || 'Lima y Callao');
    setSpecialty(user.specialty || '');
    setTurno(user.turno || 'Completo');
    setStatus(user.status || 'disponible');
    setShowModal(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();

    let storeObj: Store | undefined;
    if (userType === 'tienda' && selectedStoreCode) {
      storeObj = sortedStores.find(s => String(s.codTienda) === selectedStoreCode);
    }

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        anexo: anexo.trim() || undefined,
        cargo: cargo.trim(),
        role: (cargo.trim() as any),
        userType,
        codTienda: userType === 'tienda' && storeObj ? storeObj.codTienda : undefined,
        tiendaNombre: userType === 'tienda' && storeObj ? storeObj.name : undefined,
        storeId: userType === 'tienda' && storeObj ? storeObj.id : undefined,
        distrito: userType === 'tienda' && storeObj ? (storeObj.distrito || storeObj.city) : undefined,
        assignedRegion: userType === 'tienda' && storeObj ? storeObj.region : assignedRegion,
        specialty: userType === 'especialista' ? specialty.trim() : undefined,
        turno: userType === 'tienda' ? turno : undefined,
        status
      };

      if (onUpdateUser) {
        onUpdateUser(updated);
      } else {
        onAddUser(updated);
      }
      setShowModal(false);
      setSyncNotice(`Contacto ${name} actualizado correctamente.`);
      setTimeout(() => setSyncNotice(null), 3500);
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        anexo: anexo.trim() || undefined,
        cargo: cargo.trim(),
        role: (cargo.trim() as any),
        userType,
        codTienda: userType === 'tienda' && storeObj ? storeObj.codTienda : undefined,
        tiendaNombre: userType === 'tienda' && storeObj ? storeObj.name : undefined,
        storeId: userType === 'tienda' && storeObj ? storeObj.id : undefined,
        distrito: userType === 'tienda' && storeObj ? (storeObj.distrito || storeObj.city) : undefined,
        assignedRegion: userType === 'tienda' && storeObj ? storeObj.region : assignedRegion,
        specialty: userType === 'especialista' ? specialty.trim() : undefined,
        turno: userType === 'tienda' ? turno : undefined,
        status,
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
        activeTickets: 0,
        completedOrders: 0
      };

      onAddUser(newUser);
      setShowModal(false);
      setSyncNotice(`Contacto ${name} guardado exitosamente en la agenda.`);
      setTimeout(() => setSyncNotice(null), 3500);
    }
  };

  // Delete User Confirmation
  const handleDelete = (user: AppUser) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.name} (${user.cargo || user.role}) de la agenda?`)) {
      if (onDeleteUser) {
        onDeleteUser(user.id);
        setSyncNotice(`Contacto eliminado de la agenda.`);
        setTimeout(() => setSyncNotice(null), 3000);
      }
    }
  };

  // Export Agenda to CSV
  const handleExportCSV = () => {
    const headers = [
      'Cod_Tienda',
      'Tienda',
      'Colaborador',
      'Cargo',
      'Tipo_Usuario',
      'Celular',
      'Anexo',
      'Correo_Corporativo',
      'Region',
      'Distrito',
      'Turno',
      'Estado'
    ];

    const rows = filteredUsers.map(u => [
      `"${u.codTienda || ''}"`,
      `"${(u.tiendaNombre || '').replace(/"/g, '""')}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${(u.cargo || u.role || '').replace(/"/g, '""')}"`,
      `"${u.userType === 'tienda' ? 'Personal Tienda' : 'Especialista'}"`,
      `"${u.phone}"`,
      `"${u.anexo || ''}"`,
      `"${u.email}"`,
      `"${u.assignedRegion}"`,
      `"${u.distrito || ''}"`,
      `"${u.turno || 'Completo'}"`,
      `"${u.status || 'disponible'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda_usuarios_tienda_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync Store Contacts (Gerentes and IT Operators) from loaded stores catalog
  const handleSyncContactsFromStores = () => {
    if (stores.length === 0) {
      alert('No se encontraron tiendas en el catálogo para sincronizar contactos.');
      return;
    }

    let addedCount = 0;
    const existingEmails = new Set(users.map(u => u.email.toLowerCase()));

    stores.forEach((store, idx) => {
      const codeNum = store.codTienda || store.code.replace('T-', '');

      // 1. Gerente de Tienda
      if (store.gerenteTienda && store.gerenteTienda.trim() !== '') {
        const mgrEmail = store.managerEmail || `gerente.t${codeNum}@tottus.com.pe`;
        if (!existingEmails.has(mgrEmail.toLowerCase())) {
          const mgrUser: AppUser = {
            id: `usr-auto-mgr-${codeNum}-${idx}`,
            name: store.gerenteTienda,
            email: mgrEmail,
            phone: store.phone || `+51 989 ${String(100 + (idx % 800)).padStart(3, '0')} ${codeNum}`,
            cargo: 'Gerente de Tienda',
            role: 'Gerente de Tienda',
            userType: 'tienda',
            codTienda: codeNum,
            tiendaNombre: store.name,
            storeId: store.id,
            distrito: store.distrito || store.city,
            assignedRegion: store.region,
            anexo: `${codeNum}1`,
            turno: 'Completo',
            avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + ((idx * 37) % 500)}?w=150&auto=format&fit=crop&q=80`,
            status: 'disponible',
            activeTickets: 0,
            completedOrders: 0
          };
          onAddUser(mgrUser);
          existingEmails.add(mgrEmail.toLowerCase());
          addedCount++;
        }
      }

      // 2. IT Operator
      if (store.itOperator && store.itOperator.trim() !== '') {
        const itEmail = `it.t${codeNum}@tottus.com.pe`;
        if (!existingEmails.has(itEmail.toLowerCase())) {
          const itUser: AppUser = {
            id: `usr-auto-it-${codeNum}-${idx}`,
            name: store.itOperator,
            email: itEmail,
            phone: `+51 972 ${String(200 + (idx % 700)).padStart(3, '0')} ${codeNum}`,
            cargo: 'IT Operator Onsite',
            role: 'IT Operator',
            userType: 'tienda',
            codTienda: codeNum,
            tiendaNombre: store.name,
            storeId: store.id,
            distrito: store.distrito || store.city,
            assignedRegion: store.region,
            anexo: `${codeNum}8`,
            turno: 'Turno Mañana',
            avatarUrl: `https://images.unsplash.com/photo-${1507003211169 + ((idx * 43) % 500)}?w=150&auto=format&fit=crop&q=80`,
            status: idx % 3 === 0 ? 'en_servicio' : 'disponible',
            activeTickets: idx % 4 === 0 ? 1 : 0,
            completedOrders: 0
          };
          onAddUser(itUser);
          existingEmails.add(itEmail.toLowerCase());
          addedCount++;
        }
      }
    });

    setSyncNotice(
      addedCount > 0
        ? `Sincronización completa: se incorporaron ${addedCount} colaboradores asignados a tiendas.`
        : 'Todos los Gerentes de Tienda e IT Operators del catálogo ya se encuentran en la agenda.'
    );
    setTimeout(() => setSyncNotice(null), 4500);
  };

  // Helper badge style for cargo
  const getCargoBadgeStyle = (cargoStr?: string) => {
    const c = (cargoStr || '').toLowerCase();
    if (c.includes('gerente')) {
      return 'bg-[#00236f] text-white border-[#00236f]';
    }
    if (c.includes('it') || c.includes('operator') || c.includes('sistemas')) {
      return 'bg-emerald-700 text-white border-emerald-800';
    }
    if (c.includes('mantenimiento') || c.includes('electr') || c.includes('mecanic')) {
      return 'bg-amber-600 text-white border-amber-700';
    }
    if (c.includes('subgerente') || c.includes('administrador') || c.includes('jefe')) {
      return 'bg-indigo-700 text-white border-indigo-800';
    }
    if (c.includes('supervisor')) {
      return 'bg-cyan-700 text-white border-cyan-800';
    }
    return 'bg-[#eff4ff] text-[#00236f] border-[#dce9ff]';
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Sync / Success Notification Toast */}
      {syncNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fadeIn text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#e0ebff] text-[#00236f] p-2 rounded-xl">
              <Users className="w-6 h-6 text-[#00236f]" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                Agenda & Directorio de Personal
              </h2>
              <p className="text-xs sm:text-sm text-[#757682] mt-0.5">
                Agenda corporativa de usuarios asignados a tienda (Cód, Tienda, Cargo, Celular, Correo) y Especialistas Técnicos.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {stores.length > 0 && (
            <button
              onClick={handleSyncContactsFromStores}
              className="bg-white text-[#00236f] px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#dce9ff] hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
              title="Auto-incorporar a los Gerentes e IT Operators registrados en la planilla de tiendas"
            >
              <RefreshCw className="w-4 h-4 text-[#00236f]" />
              <span>Sincronizar desde Tiendas</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-white text-[#00236f] px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#dce9ff] hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
            title="Exportar agenda completa a formato CSV compatible con Excel"
          >
            <Download className="w-4 h-4 text-[#00236f]" />
            <span>Exportar Agenda CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar en Agenda</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="text-[11px] font-bold text-[#757682] uppercase tracking-wider flex items-center justify-between">
            <span>Total Agenda</span>
            <Users className="w-4 h-4 text-[#00236f]" />
          </div>
          <div className="text-2xl font-black text-[#0b1c30] mt-1">{metrics.totalUsers}</div>
          <div className="text-[11px] text-[#757682] mt-0.5">Colaboradores registrados</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Personal en Tienda</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{metrics.storeUsers}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Gerentes, IT Operators & Jefes</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs bg-gradient-to-br from-white to-indigo-50/40">
          <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center justify-between">
            <span>Especialistas Técnicos</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">{metrics.specialistUsers}</div>
          <div className="text-[11px] text-indigo-700 mt-0.5">Frío, HVAC, Eléctrico & Redes</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Tiendas con Contacto</span>
            <StoreIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {metrics.coveredStoresCount} <span className="text-xs text-[#757682] font-normal">/ {stores.length || 90}</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Sucursales con asignación directa</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#dce9ff] pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('todos');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'todos'
              ? 'bg-[#00236f] text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-[#eff4ff] border border-[#dce9ff]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Todos los Colaboradores</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('tienda');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tienda'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-emerald-50 border border-[#dce9ff]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Agenda de Usuarios en Tienda</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
            {metrics.storeUsers}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('especialistas');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'especialistas'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-indigo-50 border border-[#dce9ff]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-300" />
          <span>Especialistas & Supervisores</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
            {metrics.specialistUsers}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por Cód, Tienda, Colaborador, Cargo, Celular o Correo..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Store Filter */}
          <div>
            <select
              value={selectedStoreFilter}
              onChange={e => {
                setSelectedStoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todas">Todas las Tiendas</option>
              {sortedStores.map(st => (
                <option key={st.id} value={String(st.codTienda)}>
                  {`T-${st.codTienda} ${st.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo Filter */}
          <div>
            <select
              value={selectedCargoFilter}
              onChange={e => {
                setSelectedCargoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Cargos</option>
              <option value="Gerente">Gerente de Tienda</option>
              <option value="IT Operator">IT Operator Onsite</option>
              <option value="Mantenimiento">Jefe de Mantenimiento</option>
              <option value="Subgerente">Subgerente</option>
              <option value="Técnico Especialista">Técnico Especialista</option>
              <option value="Supervisor">Supervisor Regional</option>
              {uniqueCargos
                .filter(
                  c =>
                    !['Gerente', 'IT Operator', 'Mantenimiento', 'Subgerente', 'Técnico Especialista', 'Supervisor'].some(
                      k => c.toLowerCase().includes(k.toLowerCase())
                    )
                )
                .map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegionFilter}
              onChange={e => {
                setSelectedRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todas">Todas las Regiones</option>
              <option value="Lima y Callao">Lima y Callao</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Sur">Zona Sur</option>
              <option value="Zona Centro">Zona Centro</option>
              <option value="Zona Oriente">Zona Oriente</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Tags if active */}
        {(selectedStoreFilter !== 'todas' ||
          selectedCargoFilter !== 'todos' ||
          selectedRegionFilter !== 'todas' ||
          searchQuery.trim() !== '') && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#f0f4ff] text-[11px] text-[#757682] flex-wrap">
            <span className="font-semibold text-[#00236f]">Filtros activos:</span>
            {searchQuery && (
              <span className="bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-md flex items-center gap-1">
                Búsqueda: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500 font-bold ml-1">
                  ✕
                </button>
              </span>
            )}
            {selectedStoreFilter !== 'todas' && (
              <span className="bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-md flex items-center gap-1">
                Tienda: T-{selectedStoreFilter}
                <button onClick={() => setSelectedStoreFilter('todas')} className="hover:text-red-500 font-bold ml-1">
                  ✕
                </button>
              </span>
            )}
            {selectedCargoFilter !== 'todos' && (
              <span className="bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-md flex items-center gap-1">
                Cargo: {selectedCargoFilter}
                <button onClick={() => setSelectedCargoFilter('todos')} className="hover:text-red-500 font-bold ml-1">
                  ✕
                </button>
              </span>
            )}
            {selectedRegionFilter !== 'todas' && (
              <span className="bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-md flex items-center gap-1">
                Región: {selectedRegionFilter}
                <button onClick={() => setSelectedRegionFilter('todas')} className="hover:text-red-500 font-bold ml-1">
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStoreFilter('todas');
                setSelectedCargoFilter('todos');
                setSelectedRegionFilter('todas');
                setSelectedStatusFilter('todos');
              }}
              className="text-xs text-red-600 hover:underline font-semibold ml-auto"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Table / Agenda List */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th className="py-3 px-3.5">CÓD & TIENDA</th>
                <th className="py-3 px-3.5">COLABORADOR</th>
                <th className="py-3 px-3.5">CARGO / ROL</th>
                <th className="py-3 px-3.5">CELULAR & CONTACTO</th>
                <th className="py-3 px-3.5">CORREO CORPORATIVO</th>
                <th className="py-3 px-3.5">UBICACIÓN / REGIÓN</th>
                <th className="py-3 px-3.5 text-center">TURNO / ANEXO</th>
                <th className="py-3 px-3.5 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#757682]">
                    <div className="max-w-md mx-auto space-y-2">
                      <Users className="w-8 h-8 text-[#a3b3d1] mx-auto" />
                      <p className="font-semibold text-[#0b1c30]">
                        No se encontró personal que coincida con los criterios.
                      </p>
                      <p className="text-xs">
                        Intenta ajustar la búsqueda, limpiar los filtros o registrar un nuevo usuario para esta tienda.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-2 text-xs bg-[#00236f] text-white px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Registrar Usuario
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const cleanPhone = user.phone.replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
                  const waMsg = encodeURIComponent(
                    `Hola ${user.name}, te contacto desde la plataforma CMMS Tottus respecto a la Tienda ${user.tiendaNombre || 'T-' + user.codTienda}.`
                  );

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#f8f9ff] transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      {/* COD & TIENDA */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {user.codTienda ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-[#00236f] text-white px-2 py-0.5 rounded-md shadow-2xs">
                              {user.codTienda}
                            </span>
                            <div>
                              <div className="font-bold text-[#0b1c30] flex items-center gap-1">
                                <span>{user.tiendaNombre || `Tottus T-${user.codTienda}`}</span>
                              </div>
                              <div className="text-[10px] text-[#757682]">
                                {user.distrito || user.assignedRegion}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-[#eff4ff] text-[#00236f] font-semibold text-[11px] px-2 py-1 rounded-md border border-[#dce9ff]">
                            <Award className="w-3 h-3 text-[#00236f]" />
                            <span>Móvil / Especialista</span>
                          </div>
                        )}
                      </td>

                      {/* COLABORADOR */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover ring-1.5 ring-[#00236f]/20 shrink-0"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-bold text-[#0b1c30]">{user.name}</div>
                            <div className="text-[10px] text-[#757682] flex items-center gap-1">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'en_servicio'
                                    ? 'bg-blue-500'
                                    : user.status === 'ausente'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <span className="capitalize">
                                {user.status === 'en_servicio'
                                  ? 'En Turno'
                                  : user.status === 'ausente'
                                  ? 'Ausente'
                                  : 'Disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CARGO / ROL */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs ${getCargoBadgeStyle(
                              user.cargo || user.role
                            )}`}
                          >
                            {user.cargo || user.role}
                          </span>
                          {user.specialty && (
                            <div className="text-[10px] text-[#757682] italic">
                              {user.specialty}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CELULAR & WHATSAPP */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <a
                            href={`tel:${user.phone}`}
                            className="text-[#0b1c30] font-semibold hover:text-[#00236f] flex items-center gap-1 bg-[#f0f4ff] hover:bg-[#e0ebff] px-2 py-1 rounded transition-colors"
                            title="Llamar directamente"
                          >
                            <Phone className="w-3 h-3 text-[#00236f]" />
                            <span>{user.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/${waNumber}?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="Enviar WhatsApp corporativo"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* CORREO CORPORATIVO */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${user.email}`}
                            className="text-[11px] text-[#00236f] hover:underline font-medium flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3 text-[#757682]" />
                            <span>{user.email}</span>
                          </a>

                          <button
                            onClick={() => handleCopyEmail(user.email, user.id)}
                            className="p-1 rounded text-[#757682] hover:text-[#00236f] hover:bg-[#eff4ff] transition-colors"
                            title="Copiar correo al portapapeles"
                          >
                            {copiedEmailId === user.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* UBICACIÓN / REGIÓN */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-[#0b1c30]">
                          <MapPin className="w-3.5 h-3.5 text-[#00236f] shrink-0" />
                          <span>{user.assignedRegion}</span>
                          {user.distrito && (
                            <span className="text-[#757682]">({user.distrito})</span>
                          )}
                        </div>
                      </td>

                      {/* TURNO / ANEXO */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          {user.anexo ? (
                            <span className="font-mono text-[10px] font-bold bg-[#eef2f6] text-[#334155] px-1.5 py-0.5 rounded">
                              Ext. {user.anexo}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#a0a3bd]">—</span>
                          )}
                          <span className="text-[10px] text-[#757682]">
                            {user.turno || 'Completo'}
                          </span>
                        </div>
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] transition-colors"
                            title="Editar datos de contacto en agenda"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteUser && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar de la agenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
        <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#757682]">
          <div>
            Mostrando <strong>{paginatedUsers.length}</strong> de <strong>{filteredUsers.length}</strong> colaboradores filtrados (Total en agenda: {users.length})
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

      {/* Modal: Registrar o Editar Colaborador en Agenda */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-[#e5eeff] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#00236f]">
                    {editingUser ? 'Editar Contacto en Agenda' : 'Registrar Colaborador en Agenda'}
                  </h3>
                  <p className="text-[11px] text-[#757682]">
                    Asigna un usuario a tienda con su cargo, celular y correo corporativo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#757682] p-1 font-bold hover:text-[#0b1c30]"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUser} className="space-y-3.5">
              {/* Selector de Tipo de Usuario */}
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Tipo de Asignación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserType('tienda')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      userType === 'tienda'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-[#f8f9ff] text-[#444651] border-[#dce9ff] hover:bg-emerald-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Personal en Tienda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('especialista')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      userType === 'especialista'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-[#f8f9ff] text-[#444651] border-[#dce9ff] hover:bg-indigo-50'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Especialista Móvil</span>
                  </button>
                </div>
              </div>

              {/* Si es Personal de Tienda: Selección de Tienda */}
              {userType === 'tienda' && (
                <div className="bg-[#f0fdf4] p-3 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-900 uppercase block">
                      Tienda Asignada (Cód & Sucursal)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {sortedStores.length} tiendas disponibles
                    </span>
                  </div>

                  <select
                    required
                    value={selectedStoreCode}
                    onChange={e => {
                      const code = e.target.value;
                      setSelectedStoreCode(code);
                      const matched = sortedStores.find(s => String(s.codTienda) === code);
                      if (matched) {
                        setAssignedRegion(matched.region);
                      }
                    }}
                    className="w-full p-2.5 text-xs bg-white border border-emerald-300 rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-emerald-600 focus:outline-none font-semibold"
                  >
                    <option value="">-- Seleccionar Tienda --</option>
                    {sortedStores.map(st => (
                      <option key={st.id} value={String(st.codTienda)}>
                        {`COD ${st.codTienda} - ${st.name} (${st.distrito || st.region})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nombre Completo */}
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Nombre Completo del Colaborador
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ricardo Paz / Ing. Roberto León"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              {/* Cargo en Tienda */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#757682] uppercase block">
                    Cargo / Rol Oficial
                  </label>
                  <span className="text-[10px] text-[#757682]">Presets rápidos abajo</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Ej. Gerente de Tienda, IT Operator Onsite, Jefe de Mantenimiento..."
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#00236f]"
                />

                {/* Presets rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {[
                    'Gerente de Tienda',
                    'IT Operator Onsite',
                    'Jefe de Mantenimiento',
                    'Subgerente de Operaciones',
                    'Jefe de Prevención',
                    'Técnico Especialista'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCargo(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        cargo === preset
                          ? 'bg-[#00236f] text-white border-[#00236f]'
                          : 'bg-[#f8f9ff] text-[#444651] border-[#dce9ff] hover:bg-[#e0ebff]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Celular y Anexo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+51 989 310 103"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] font-mono focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Anexo Telefónico (Ext.)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1038"
                    value={anexo}
                    onChange={e => setAnexo(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] font-mono focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
              </div>

              {/* Correo Corporativo */}
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="nombre.apellido@tottus.com.pe"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              {/* Si es Especialista: Campo Especialidad */}
              {userType === 'especialista' && (
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Frío Industrial & HVAC / Electricidad de Potencia / Redes IT"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
              )}

              {/* Región y Turno */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Región Operativa
                  </label>
                  <select
                    value={assignedRegion}
                    onChange={e => setAssignedRegion(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30]"
                  >
                    <option value="Lima y Callao">Lima y Callao</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Sur">Zona Sur</option>
                    <option value="Zona Centro">Zona Centro</option>
                    <option value="Zona Oriente">Zona Oriente</option>
                    <option value="Nacional">Nacional</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Turno de Trabajo
                  </label>
                  <select
                    value={turno}
                    onChange={e => setTurno(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30]"
                  >
                    <option value="Completo">Jornada Completa</option>
                    <option value="Turno Mañana">Turno Mañana</option>
                    <option value="Turno Tarde">Turno Tarde</option>
                    <option value="Turno Noche / Cierre">Turno Noche / Cierre</option>
                    <option value="De Guardia">De Guardia</option>
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Estado de Disponibilidad
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg text-[#0b1c30]"
                >
                  <option value="disponible">🟢 Disponible (Activo)</option>
                  <option value="en_servicio">🔵 En Servicio / Turno Activo</option>
                  <option value="ausente">🟡 Ausente / Licencia / Descanso</option>
                </select>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-3 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#e0ebff]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Actualizar Contacto' : 'Guardar en Agenda'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
