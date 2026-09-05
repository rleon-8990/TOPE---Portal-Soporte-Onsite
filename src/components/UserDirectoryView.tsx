import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { AppUser } from '../types';

interface UserDirectoryViewProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
}

export const UserDirectoryView: React.FC<UserDirectoryViewProps> = ({
  users,
  onAddUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('todas');
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Técnico Especialista' | 'Supervisor Regional' | 'Administrador General'>('Técnico Especialista');
  const [assignedRegion, setAssignedRegion] = useState<'Lima y Callao' | 'Zona Norte' | 'Zona Sur' | 'Zona Centro' | 'Zona Oriente'>('Lima y Callao');
  const [specialty, setSpecialty] = useState('Climatización HVAC y Refrigeración');
  const [phone, setPhone] = useState('+51 987 654 321');

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.assignedRegion.toLowerCase().includes(query) ||
      (u.specialty && u.specialty.toLowerCase().includes(query));

    const matchesRole =
      selectedRoleFilter === 'todos' ||
      u.role.toLowerCase().includes(selectedRoleFilter.toLowerCase());

    const matchesRegion =
      selectedRegionFilter === 'todas' || u.assignedRegion === selectedRegionFilter;

    return matchesSearch && matchesRole && matchesRegion;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      assignedRegion,
      specialty,
      phone,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      activeTickets: 0,
      completedOrders: 0,
      status: 'disponible'
    };

    onAddUser(newUser);
    setShowNewModal(false);
    setName('');
    setEmail('');
    alert(`Personal ${name} agregado al directorio exitosamente.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Directorio de Personal & Técnicos
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Listado oficial de ingenieros de campo, supervisores zonales y técnicos especialistas para la red de 90 sucursales.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Personal</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o correo..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRoleFilter}
              onChange={e => {
                setSelectedRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Roles</option>
              <option value="técnico">Técnicos Especialistas</option>
              <option value="supervisor">Supervisores Regionales</option>
              <option value="administrador">Administradores Generales</option>
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
      </div>

      {/* Main Tabular / List View */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th className="py-3 px-3.5">PERSONAL / INGENIERO</th>
                <th className="py-3 px-3.5">ROL & CARGO</th>
                <th className="py-3 px-3.5">ESPECIALIDAD TÉCNICA</th>
                <th className="py-3 px-3.5">REGIÓN ASIGNADA</th>
                <th className="py-3 px-3.5">CONTACTO DIRECTO</th>
                <th className="py-3 px-3.5 text-center">TICKETS ACTIVOS</th>
                <th className="py-3 px-3.5 text-center">ÓRDENES COMPLETADAS</th>
                <th className="py-3 px-3.5 text-center">DISPONIBILIDAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#757682]">
                    No se encontró personal que coincida con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-[#f8f9ff] transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                    }`}
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00236f]/20 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#0b1c30]">{user.name}</div>
                          <div className="text-[11px] text-[#757682] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#00236f]" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-semibold text-[#00236f] bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#dce9ff]">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="text-[#0b1c30] font-medium">
                        {user.specialty || 'Mantenimiento General Electromecánico'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-[#0b1c30]">
                        <MapPin className="w-3.5 h-3.5 text-[#00236f]" />
                        <span>{user.assignedRegion}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1 text-[#444651]">
                        <Phone className="w-3 h-3 text-[#10b981]" />
                        <span>{user.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="font-bold text-[#fd761a] bg-[#fff3e0] px-2.5 py-0.5 rounded-full">
                        {user.activeTickets ?? user.activeTicketsCount ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="font-bold text-[#10b981] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full">
                        {user.completedOrders ?? 0} OT
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        Activo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex items-center justify-between text-xs text-[#757682]">
          <div>
            Mostrando <strong>{paginatedUsers.length}</strong> de <strong>{filteredUsers.length}</strong> colaboradores registrados
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

      {/* New User Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Registrar Técnico o Supervisor
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Roberto Mendoza"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Correo Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="nombre@reliant-cmms.pe"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Rol
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as unknown as 'Técnico Especialista' | 'Supervisor Regional' | 'Administrador General')}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Técnico Especialista">Técnico Especialista</option>
                    <option value="Supervisor Regional">Supervisor Regional</option>
                    <option value="Administrador General">Administrador General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Región
                  </label>
                  <select
                    value={assignedRegion}
                    onChange={e => setAssignedRegion(e.target.value as unknown as 'Lima y Callao' | 'Zona Norte' | 'Zona Sur' | 'Zona Centro' | 'Zona Oriente')}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Lima y Callao">Lima y Callao</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Sur">Zona Sur</option>
                    <option value="Zona Centro">Zona Centro</option>
                    <option value="Zona Oriente">Zona Oriente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Especialidad Técnica
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Teléfono Móvil
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a]"
                >
                  Guardar en Directorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
