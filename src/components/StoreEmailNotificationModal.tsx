import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Users,
  Store as StoreIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Wrench,
  AlertCircle,
  FileText,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Building,
  Phone,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store, AppUser, WorkOrder } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface StoreEmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  users?: AppUser[];
  currentUser?: AppUser;
  initialStoreId?: string;
  initialWorkOrder?: WorkOrder | null;
}

export const StoreEmailNotificationModal: React.FC<StoreEmailNotificationModalProps> = ({
  isOpen,
  onClose,
  stores,
  users = INITIAL_USERS,
  currentUser,
  initialStoreId,
  initialWorkOrder
}) => {
  if (!isOpen) return null;

  // Selected Store
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (initialStoreId) return initialStoreId;
    if (initialWorkOrder) return initialWorkOrder.storeId;
    return stores[0]?.id || '';
  });

  const selectedStore = useMemo(() => {
    return stores.find(s => s.id === selectedStoreId) || stores[0];
  }, [stores, selectedStoreId]);

  // Search filter for users inside directory
  const [recipientSearch, setRecipientSearch] = useState('');

  // Selected recipient email addresses
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Email template & fields
  const [emailSubject, setEmailSubject] = useState('');
  const [emailScheduleDate, setEmailScheduleDate] = useState(
    initialWorkOrder?.date || initialWorkOrder?.scheduledDate || new Date().toISOString().split('T')[0]
  );
  const [emailScheduleTime, setEmailScheduleTime] = useState('22:00 hrs (Ventana Nocturna)');
  const [emailTechnician, setEmailTechnician] = useState(initialWorkOrder?.technician || 'Cuadrilla Especializada Onsite');
  const [emailType, setEmailType] = useState('Mantenimiento Preventivo Programado');
  const [emailNotes, setEmailNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Filter Directory Users for this Store & Region
  const storeDirectoryUsers = useMemo(() => {
    if (!selectedStore) return [];

    const storeCod = String(selectedStore.codTienda || '');
    const storeNameLower = selectedStore.name.toLowerCase();

    // 1. Direct matches from users
    const matched = users.filter(u => {
      // By store cod
      if (u.codTienda && String(u.codTienda) === storeCod) return true;
      // By store id
      if (u.storeId && (u.storeId === selectedStore.id || u.storeId === `store-${storeCod}`)) return true;
      // By store name match
      if (u.tiendaNombre && (storeNameLower.includes(u.tiendaNombre.toLowerCase()) || u.tiendaNombre.toLowerCase().includes(storeNameLower))) return true;
      // By region (for regional supervisors)
      if ((u.role.includes('Supervisor') || u.role.includes('Zonal')) && u.assignedRegion === selectedStore.region) return true;
      return false;
    });

    // 2. Ensure Store Manager exists as recipient option if present on store object
    const hasManager = matched.some(u => u.role.includes('Gerente') || u.role.includes('Jefe de Tienda'));
    if (!hasManager && selectedStore.gerenteTienda) {
      const email = selectedStore.managerEmail || `${selectedStore.gerenteTienda.toLowerCase().replace(/\s+/g, '.')}@tottus.com.pe`;
      matched.push({
        id: `synth-mgr-${selectedStore.id}`,
        name: selectedStore.gerenteTienda,
        email,
        role: 'Gerente de Tienda',
        cargo: 'Gerente de Tienda',
        phone: selectedStore.phone || '+51 980 000 000',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    // 3. Ensure IT Operator exists as recipient option if present on store object
    const hasItOp = matched.some(u => u.role.includes('IT Operator') || u.cargo?.includes('IT'));
    if (!hasItOp && selectedStore.itOperator) {
      const email = `${selectedStore.itOperator.toLowerCase().replace(/\s+/g, '.')}@tottus.com.pe`;
      matched.push({
        id: `synth-it-${selectedStore.id}`,
        name: selectedStore.itOperator,
        email,
        role: 'IT Operator',
        cargo: 'IT Operator Onsite',
        phone: '+51 950 000 000',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    // 4. Regional Supervisor / Zonal Supervisor
    const hasSupervisor = matched.some(u => u.role.includes('Supervisor') || u.role.includes('Zonal'));
    if (!hasSupervisor) {
      const zonalName = selectedStore.gZonal || 'Supervisor Regional ' + selectedStore.region;
      const email = `zonal.${selectedStore.region.toLowerCase().replace(/\s+/g, '')}@tottus.com.pe`;
      matched.push({
        id: `synth-zonal-${selectedStore.region}`,
        name: zonalName,
        email,
        role: 'Supervisor Regional',
        cargo: 'Gerencia Zonal',
        phone: '+51 990 123 456',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    // 5. Jefe de Mantenimiento Institucional
    const hasMaint = matched.some(u => u.role.includes('Mantenimiento') || u.cargo?.includes('Mantenimiento'));
    if (!hasMaint) {
      matched.push({
        id: `synth-maint-zonal`,
        name: 'Ing. Marco Gonzales',
        email: 'mgonzales.mant@tottus.com.pe',
        role: 'Jefe de Mantenimiento',
        cargo: 'Jefatura de Mantenimiento e Infraestructura',
        phone: '+51 984 551 202',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    return matched;
  }, [selectedStore, users]);

  // Update default subject and default selected recipients when store changes
  useEffect(() => {
    if (selectedStore) {
      setEmailSubject(`[Tottus Onsite] Aviso de Mantenimiento Preventivo - ${selectedStore.name} (${selectedStore.code || selectedStore.codTienda})`);
      
      // Auto-select Gerente and IT Operator by default
      const defaultRecipients = storeDirectoryUsers
        .filter(u => u.role.includes('Gerente') || u.role.includes('IT Operator') || u.cargo?.includes('IT'))
        .map(u => u.email);
      
      if (defaultRecipients.length > 0) {
        setSelectedEmails(defaultRecipients);
      } else if (storeDirectoryUsers.length > 0) {
        setSelectedEmails([storeDirectoryUsers[0].email]);
      }
    }
  }, [selectedStore, storeDirectoryUsers]);

  // BUTTON GROUP ACTIONS FOR DIRECTORY RECIPIENTS (EXPLICIT USER REQUIREMENT)
  const handleSelectAllStoreRecipients = () => {
    setSelectedEmails(storeDirectoryUsers.map(u => u.email));
  };

  const handleSelectManagersOnly = () => {
    const managers = storeDirectoryUsers.filter(u => 
      u.role.includes('Gerente') || u.role.includes('Jefe de Tienda') || u.cargo?.includes('Gerente')
    ).map(u => u.email);
    setSelectedEmails(managers);
  };

  const handleSelectItOperatorsOnly = () => {
    const itOps = storeDirectoryUsers.filter(u => 
      u.role.includes('IT Operator') || u.cargo?.includes('IT') || u.role.includes('Informática')
    ).map(u => u.email);
    setSelectedEmails(itOps);
  };

  const handleSelectMaintenanceOnly = () => {
    const maints = storeDirectoryUsers.filter(u => 
      u.role.includes('Mantenimiento') || u.cargo?.includes('Mantenimiento') || u.role.includes('Técnico')
    ).map(u => u.email);
    setSelectedEmails(maints);
  };

  const handleSelectSupervisorsOnly = () => {
    const supervisors = storeDirectoryUsers.filter(u => 
      u.role.includes('Supervisor') || u.role.includes('Zonal') || u.cargo?.includes('Zonal')
    ).map(u => u.email);
    setSelectedEmails(supervisors);
  };

  const handleClearRecipients = () => {
    setSelectedEmails([]);
  };

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  // Filtered recipients by user search query
  const filteredDirectoryUsers = useMemo(() => {
    if (!recipientSearch.trim()) return storeDirectoryUsers;
    const q = recipientSearch.toLowerCase();
    return storeDirectoryUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.cargo && u.cargo.toLowerCase().includes(q))
    );
  }, [storeDirectoryUsers, recipientSearch]);

  // Dispatch Email Handler
  const handleSendEmail = () => {
    if (selectedEmails.length === 0) {
      alert('⚠️ Por favor seleccione al menos un destinatario del directorio de la tienda.');
      return;
    }

    setIsSending(true);

    // Simulate Microsoft 365 Exchange Dispatch
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dce9ff] overflow-hidden animate-slideUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Mail className="w-5 h-5 text-[#fd761a]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight flex items-center gap-2">
                <span>Notificación Oficial de Mantenimiento por Correo</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Directorio M365
                </span>
              </h3>
              <p className="text-xs text-white/80">
                Selección de tienda y destinatarios registrados en el Directorio Corporativo de Tottus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#0b1c30]">
          
          {/* Store Selector */}
          <div className="bg-[#f8faff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
            <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
              <StoreIcon className="w-4 h-4 text-[#00236f]" />
              <span>Tienda Destino a Notificar</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedStoreId}
                  onChange={e => setSelectedStoreId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                >
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>
                      T-{st.codTienda || st.code} — {st.name} ({st.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Quick Badge */}
              <div className="bg-white p-2.5 rounded-lg border border-[#e5eeff] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00236f]">{selectedStore?.name}</span>
                  <span className="text-[10px] bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-full font-bold">
                    {selectedStore?.region}
                  </span>
                </div>
                <div className="text-[11px] text-[#525e75] flex items-center gap-2 truncate">
                  <span>👤 Gerente: <strong className="text-[#0b1c30]">{selectedStore?.gerenteTienda || selectedStore?.manager || 'Asignado'}</strong></span>
                  <span>•</span>
                  <span>💻 IT: <strong className="text-[#0b1c30]">{selectedStore?.itOperator || 'En Sede'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* GROUP OF BUTTONS: RECIPIENTS FILTER FROM DIRECTORY */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                  <Users className="w-4 h-4 text-[#00236f]" />
                  <span>Destinatarios del Directorio ({selectedEmails.length} Seleccionados)</span>
                </label>
                <p className="text-[11px] text-[#525e75]">
                  Utiliza los botones de filtrado rápido para seleccionar el personal registrado en el Directorio:
                </p>
              </div>

              {/* Recipient Search Input */}
              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#757682]" />
                <input
                  type="text"
                  placeholder="Buscar en directorio..."
                  value={recipientSearch}
                  onChange={e => setRecipientSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#f8f9ff] border border-[#dce9ff] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>
            </div>

            {/* THE BUTTON GROUP (GRUPO DE BOTONES SOLICITADO) */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#f0f4ff] rounded-xl border border-[#c4dcff]">
              <span className="text-[11px] font-bold text-[#00236f] px-1 mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#fd761a]" />
                <span>Grupos:</span>
              </span>

              <button
                type="button"
                onClick={handleSelectAllStoreRecipients}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                title="Seleccionar todo el personal del directorio para esta tienda"
              >
                <span>👥 Todos en Tienda</span>
                <span className="text-[10px] bg-[#eff4ff] text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                  {storeDirectoryUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectManagersOnly}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                title="Seleccionar solo Gerentes de Tienda"
              >
                <span>👤 Gerente Tienda</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                  {storeDirectoryUsers.filter(u => u.role.includes('Gerente') || u.role.includes('Jefe de Tienda')).length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectItOperatorsOnly}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                title="Seleccionar solo IT Operators de Tienda"
              >
                <span>💻 IT Operator</span>
                <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.2 rounded-full font-bold">
                  {storeDirectoryUsers.filter(u => u.role.includes('IT Operator') || u.cargo?.includes('IT')).length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectMaintenanceOnly}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                title="Seleccionar Jefes de Mantenimiento e Infraestructura"
              >
                <span>🔧 Mantenimiento</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-full font-bold">
                  {storeDirectoryUsers.filter(u => u.role.includes('Mantenimiento') || u.cargo?.includes('Mantenimiento')).length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectSupervisorsOnly}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                title="Seleccionar Supervisor Zonal / Regional"
              >
                <span>🏢 Supervisor Zonal</span>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">
                  {storeDirectoryUsers.filter(u => u.role.includes('Supervisor') || u.role.includes('Zonal')).length}
                </span>
              </button>

              <button
                type="button"
                onClick={handleClearRecipients}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/60 border border-red-200 text-red-600 hover:bg-red-50 transition-all ml-auto"
                title="Deseleccionar todos"
              >
                <span>Limpiar</span>
              </button>
            </div>

            {/* List of Directory Users Cards with Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {filteredDirectoryUsers.map(user => {
                const isSelected = selectedEmails.includes(user.email);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleEmail(user.email)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 select-none ${
                      isSelected
                        ? 'bg-[#eff4ff] border-[#00236f] shadow-xs'
                        : 'bg-white border-[#e5eeff] hover:border-[#b4c8f0] hover:bg-[#f8faff]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by container
                      className="w-4 h-4 text-[#00236f] rounded border-gray-300 focus:ring-[#00236f] pointer-events-none"
                    />

                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#00236f] truncate">{user.name}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white border border-[#dce9ff] text-[#525e75] shrink-0">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#525e75] truncate font-mono">{user.email}</div>
                    </div>
                  </div>
                );
              })}

              {filteredDirectoryUsers.length === 0 && (
                <div className="col-span-2 p-4 text-center text-xs text-[#757682] bg-white rounded-xl border border-dashed border-[#dce9ff]">
                  No se encontraron destinatarios en el directorio con el filtro actual.
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Details to Include in the Email */}
          <div className="bg-[#f8faff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
            <h4 className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
              <Calendar className="w-4 h-4 text-[#00236f]" />
              <span>Contenido del Aviso Preventivo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                  Tipo de Notificación
                </label>
                <select
                  value={emailType}
                  onChange={e => setEmailType(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                >
                  <option value="Mantenimiento Preventivo Programado">Mantenimiento Preventivo Programado</option>
                  <option value="Ventana de Calibración de Balanzas">Ventana de Calibración de Balanzas</option>
                  <option value="Inspección y Limpieza de Cajas POS">Inspección y Limpieza de Cajas POS</option>
                  <option value="Parada Técnica de Central de Frío">Parada Técnica de Central de Frío</option>
                  <option value="Actualización de Switches y Redes">Actualización de Switches y Redes</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                  Fecha de Ejecución
                </label>
                <input
                  type="date"
                  value={emailScheduleDate}
                  onChange={e => setEmailScheduleDate(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                  Ventana Horaria
                </label>
                <input
                  type="text"
                  value={emailScheduleTime}
                  onChange={e => setEmailScheduleTime(e.target.value)}
                  placeholder="ej. 22:00 hrs a 06:00 hrs"
                  className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                  Técnico o Cuadrilla Asignada
                </label>
                <input
                  type="text"
                  value={emailTechnician}
                  onChange={e => setEmailTechnician(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                Asunto del Correo
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                Indicaciones Especiales o Medidas de Seguridad para la Tienda (Opcional)
              </label>
              <textarea
                rows={2}
                value={emailNotes}
                onChange={e => setEmailNotes(e.target.value)}
                placeholder="ej. Se solicita brindar acceso al personal técnico acreditado con SCTR vigente y coordinar con el Supervisor de Cajas."
                className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs text-[#0b1c30]"
              />
            </div>
          </div>

          {/* Email Preview Snippet (Outlook Style) */}
          <div className="border border-[#c4dcff] rounded-xl p-3.5 bg-white text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#00236f]">Vista Previa del Mensaje</span>
                <span className="text-[10px] bg-blue-50 text-[#00236f] px-2 py-0.5 rounded font-bold border border-blue-200">
                  Microsoft 365 Exchange
                </span>
              </div>
              <span className="text-[10px] text-[#757682]">
                Remitente: {currentUser?.email || 'rleon@tottus.com.pe'}
              </span>
            </div>

            <div className="bg-[#f8faff] p-3 rounded-lg border border-[#e5eeff] space-y-1.5 font-sans">
              <p className="font-bold text-[#00236f]">
                Estimado equipo de {selectedStore?.name},
              </p>
              <p className="text-[#444651]">
                Por medio del presente se notifica la programación del <strong>{emailType}</strong> en su sede para el día <strong>{emailScheduleDate}</strong> en el horario de <strong>{emailScheduleTime}</strong>.
              </p>
              <p className="text-[#444651]">
                <strong>Responsable en sitio:</strong> {emailTechnician}
              </p>
              {emailNotes && (
                <p className="text-[#007a33] bg-emerald-50 p-2 rounded border border-emerald-200 text-[11px]">
                  <strong>Nota operativa:</strong> {emailNotes}
                </p>
              )}
              <p className="text-[11px] text-[#757682] pt-1">
                Agradecemos las facilidades de acceso y coordinación correspondiente.
                <br />
                <em>Jefatura de Soporte Onsite & Infraestructura — Hipermercados Tottus S.A.</em>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#525e75]">
            Destinatarios seleccionados: <strong className="text-[#00236f]">{selectedEmails.length}</strong> de la tienda <strong className="text-[#00236f]">{selectedStore?.name}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-[#c5c5d3] text-[#444651] font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending || selectedEmails.length === 0}
              className={`flex-1 sm:flex-none px-5 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-white ${
                sendSuccess
                  ? 'bg-emerald-600'
                  : selectedEmails.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#00236f] hover:bg-[#1e3a8a] active:scale-95'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Despachando por Exchange...</span>
                </>
              ) : sendSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Notificación Enviada con Éxito!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#fd761a]" />
                  <span>Enviar Correo a Destinatarios ({selectedEmails.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
