import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Package,
  Layers,
  Save,
  Building,
  CheckCircle,
  Tag,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Ticket, Store, Equipment, AppUser, TicketStatus } from '../types';

interface TicketEditModalProps {
  isOpen?: boolean;
  ticket: Ticket | null;
  stores: Store[];
  equipments: Equipment[];
  currentUser: AppUser;
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
}

export const TicketEditModal: React.FC<TicketEditModalProps> = ({
  isOpen = true,
  ticket,
  stores,
  equipments,
  currentUser,
  onClose,
  onSave
}) => {
  if (!isOpen || !ticket) return null;

  const [formTicketJR, setFormTicketJR] = useState(ticket.ticketJR || ticket.code || ticket.ticketNumber || '');
  const [formStoreId, setFormStoreId] = useState(ticket.storeId || '');
  const [formProveedor, setFormProveedor] = useState(ticket.proveedorServicio || 'DMS PERU S.A.C');
  const [formTicketProveedor, setFormTicketProveedor] = useState(ticket.ticketProveedor || '');
  const [formFechaInicio, setFormFechaInicio] = useState(ticket.fechaInicio || ticket.createdAt || '');
  const [formFechaCierre, setFormFechaCierre] = useState(ticket.fechaCierre || '');

  // Equipo
  const [formTipoEquipo, setFormTipoEquipo] = useState(ticket.tipoEquipo || ticket.equipmentName || 'Terminal Móvil');
  const [formMarca, setFormMarca] = useState(ticket.marca || 'ZEBRA');
  const [formModelo, setFormModelo] = useState(ticket.modelo || '');
  const [formSerie, setFormSerie] = useState(ticket.numeroSerie || '');
  const [formCecoSap, setFormCecoSap] = useState(ticket.cecoSap || 'P009100101');
  const [formIpAddress, setFormIpAddress] = useState(ticket.ipAddress || '');
  const [formDireccionFiscal, setFormDireccionFiscal] = useState(ticket.direccionFiscal || '');

  // Detalle & Contacto
  const [formDetalle, setFormDetalle] = useState(ticket.detalleTicket || ticket.title || '');
  const [formContacto, setFormContacto] = useState(ticket.contacto || ticket.reportedBy || '');
  const [formCelular, setFormCelular] = useState(ticket.celular || '');
  const [formEstado, setFormEstado] = useState(ticket.estadoTicket || ticket.status || 'Atendido');
  const [formObservaciones, setFormObservaciones] = useState(ticket.observaciones || ticket.description || '');
  const [formAsignado, setFormAsignado] = useState(ticket.creadoPor || ticket.assignedTo || currentUser.name);

  // Repuestos & SAP
  const [formPartNumber, setFormPartNumber] = useState(ticket.partNumberRepuesto || '');
  const [formDescPartNumber, setFormDescPartNumber] = useState(ticket.descripcionPartNumber || '');
  const [formCotizacion, setFormCotizacion] = useState(ticket.cotizacion || '');
  const [formPrecio, setFormPrecio] = useState<string>(ticket.precio !== undefined ? String(ticket.precio) : '');
  const [formSolped, setFormSolped] = useState(ticket.solped || '');
  const [formOC, setFormOC] = useState(ticket.ordenCompra || '');
  const [formHES, setFormHES] = useState(ticket.hes || '');
  const [formPresupuestoMes, setFormPresupuestoMes] = useState(ticket.presupuestoMes || 'Enero 2026');

  // Sync state if ticket changes
  useEffect(() => {
    if (ticket) {
      setFormTicketJR(ticket.ticketJR || ticket.code || ticket.ticketNumber || '');
      setFormStoreId(ticket.storeId || '');
      setFormProveedor(ticket.proveedorServicio || 'DMS PERU S.A.C');
      setFormTicketProveedor(ticket.ticketProveedor || '');
      setFormFechaInicio(ticket.fechaInicio || ticket.createdAt || '');
      setFormFechaCierre(ticket.fechaCierre || '');

      setFormTipoEquipo(ticket.tipoEquipo || ticket.equipmentName || 'Terminal Móvil');
      setFormMarca(ticket.marca || 'ZEBRA');
      setFormModelo(ticket.modelo || '');
      setFormSerie(ticket.numeroSerie || '');
      setFormCecoSap(ticket.cecoSap || 'P009100101');
      setFormIpAddress(ticket.ipAddress || '');
      setFormDireccionFiscal(ticket.direccionFiscal || '');

      setFormDetalle(ticket.detalleTicket || ticket.title || '');
      setFormContacto(ticket.contacto || ticket.reportedBy || '');
      setFormCelular(ticket.celular || '');
      setFormEstado(ticket.estadoTicket || ticket.status || 'Atendido');
      setFormObservaciones(ticket.observaciones || ticket.description || '');
      setFormAsignado(ticket.creadoPor || ticket.assignedTo || currentUser.name);

      setFormPartNumber(ticket.partNumberRepuesto || '');
      setFormDescPartNumber(ticket.descripcionPartNumber || '');
      setFormCotizacion(ticket.cotizacion || '');
      setFormPrecio(ticket.precio !== undefined ? String(ticket.precio) : '');
      setFormSolped(ticket.solped || '');
      setFormOC(ticket.ordenCompra || '');
      setFormHES(ticket.hes || '');
      setFormPresupuestoMes(ticket.presupuestoMes || 'Enero 2026');
    }
  }, [ticket, currentUser.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === formStoreId) || stores.find(s => s.name === ticket.tiendaNombre) || stores[0];

    // Determine normalized status
    const isAtendido = formEstado.toLowerCase().includes('atendido') || formEstado.toLowerCase().includes('resuelto') || formEstado.toLowerCase().includes('cerrado');
    const normalizedAppStatus: TicketStatus = isAtendido ? 'Resuelto' : 'En Progreso';

    const updatedTicket: Ticket = {
      ...ticket,
      ticketNumber: formTicketJR || ticket.ticketNumber,
      code: formTicketJR || ticket.code,
      ticketJR: formTicketJR,
      proveedorServicio: formProveedor,
      ticketProveedor: formTicketProveedor,
      fechaInicio: formFechaInicio,
      fechaCierre: formFechaCierre,

      storeId: st?.id || ticket.storeId,
      storeName: st?.name || ticket.storeName,
      storeCode: st?.code || ticket.storeCode,
      tiendaNombre: st?.name || ticket.tiendaNombre,
      codTiendaNum: st?.code?.replace(/\D/g, '') || ticket.codTiendaNum,
      region: st?.region || ticket.region,

      cecoSap: formCecoSap,
      ipAddress: formIpAddress,
      tipoEquipo: formTipoEquipo,
      marca: formMarca,
      modelo: formModelo,
      numeroSerie: formSerie,
      direccionFiscal: formDireccionFiscal,

      detalleTicket: formDetalle,
      title: `${formTipoEquipo} ${formModelo} - ${formDetalle}`,
      description: formDetalle,
      contacto: formContacto,
      reportedBy: formContacto,
      celular: formCelular,
      estadoTicket: formEstado,
      status: normalizedAppStatus,
      observaciones: formObservaciones,
      creadoPor: formAsignado,
      assignedTo: formAsignado,

      partNumberRepuesto: formPartNumber,
      descripcionPartNumber: formDescPartNumber,
      cotizacion: formCotizacion,
      precio: formPrecio ? Number(formPrecio) : undefined,
      solped: formSolped,
      ordenCompra: formOC,
      hes: formHES,
      presupuestoMes: formPresupuestoMes
    };

    onSave(updatedTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#e5eeff] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5eeff] flex justify-between items-center bg-[#f8f9ff] rounded-t-2xl">
          <div>
            <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#00236f]" />
              Editar Registro de Ticket Helpdesk ({ticket.ticketJR || ticket.code})
            </h3>
            <p className="text-xs text-[#757682]">
              Modifique los datos técnicos, administrativos, presupuestos y trazabilidad SAP.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#757682] hover:text-[#0b1c30] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Portal Falabella AI-Monitoring Info Banner */}
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#007a33] text-white font-bold flex items-center justify-center text-xs shrink-0">
                F
              </span>
              <div>
                <div className="font-bold text-xs text-[#004f21]">
                  Portal de Gestión de Incidencias Falabella AI-Monitoring
                </div>
                <div className="text-[11px] text-[#444651]">
                  Gestión oficial de incidentes y garantías con proveedores de hardware (Zebra, NCR) y soporte local.
                </div>
              </div>
            </div>
            <a
              href="https://ai-monitoring.falabella.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#007a33] hover:bg-[#005c26] text-white font-bold text-[11px] rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Abrir Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Bloque 1: Ticket & Tienda */}
          <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] space-y-3">
            <span className="font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              1. Identificación del Ticket & Tienda Tottus
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#444651] block mb-1">TICKET JR / CÓDIGO</label>
                <input
                  type="text"
                  required
                  value={formTicketJR}
                  onChange={e => setFormTicketJR(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono font-bold text-[#00236f]"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">TIENDA / SEDE</label>
                <select
                  value={formStoreId}
                  onChange={e => {
                    setFormStoreId(e.target.value);
                    const selected = stores.find(s => s.id === e.target.value);
                    if (selected && selected.address) {
                      setFormDireccionFiscal(selected.address);
                    }
                  }}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-semibold"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">PROVEEDOR DE SERVICIO</label>
                <input
                  type="text"
                  value={formProveedor}
                  onChange={e => setFormProveedor(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">TICKET PROVEEDOR</label>
                <input
                  type="text"
                  value={formTicketProveedor}
                  onChange={e => setFormTicketProveedor(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">FECHA INICIO</label>
                <input
                  type="text"
                  value={formFechaInicio}
                  onChange={e => setFormFechaInicio(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">FECHA CIERRE</label>
                <input
                  type="text"
                  value={formFechaCierre}
                  onChange={e => setFormFechaCierre(e.target.value)}
                  placeholder="DD/MM/AAAA (o vacío si abierto)"
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Hardware & Activo Onsite */}
          <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] space-y-3">
            <span className="font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              2. Datos del Activo & Hardware Onsite
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-[#444651] block mb-1">TIPO DE EQUIPO</label>
                <input
                  type="text"
                  value={formTipoEquipo}
                  onChange={e => setFormTipoEquipo(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">MARCA</label>
                <input
                  type="text"
                  value={formMarca}
                  onChange={e => setFormMarca(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">MODELO</label>
                <input
                  type="text"
                  value={formModelo}
                  onChange={e => setFormModelo(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">N° DE SERIE</label>
                <input
                  type="text"
                  value={formSerie}
                  onChange={e => setFormSerie(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono text-[#00236f] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">CECO SAP</label>
                <input
                  type="text"
                  value={formCecoSap}
                  onChange={e => setFormCecoSap(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">IP / RED</label>
                <input
                  type="text"
                  value={formIpAddress}
                  onChange={e => setFormIpAddress(e.target.value)}
                  placeholder="Ej. 10.120.45.10"
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#444651] block mb-1">DIRECCIÓN FISCAL / SEDE</label>
                <input
                  type="text"
                  value={formDireccionFiscal}
                  onChange={e => setFormDireccionFiscal(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Detalle del Ticket & Estado */}
          <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] space-y-3">
            <span className="font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              3. Detalle de Falla, Contacto & Estado
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#444651] block mb-1">DETALLE DE TICKET / SÍNTOMA</label>
                <input
                  type="text"
                  required
                  value={formDetalle}
                  onChange={e => setFormDetalle(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">ESTADO DEL TICKET</label>
                <select
                  value={formEstado}
                  onChange={e => setFormEstado(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-bold text-[#00236f]"
                >
                  <option value="Atendido">Atendido</option>
                  <option value="Pendiente Reparación">Pendiente Reparación</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="En Espera de Repuesto">En Espera de Repuesto</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">CONTACTO EN TIENDA</label>
                <input
                  type="text"
                  value={formContacto}
                  onChange={e => setFormContacto(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">CELULAR DE CONTACTO</label>
                <input
                  type="text"
                  value={formCelular}
                  onChange={e => setFormCelular(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#444651] block mb-1">TÉCNICO / ASIGNADO</label>
                <input
                  type="text"
                  value={formAsignado}
                  onChange={e => setFormAsignado(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-semibold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-[#444651] block mb-1">OBSERVACIONES / DIAGNÓSTICO</label>
                <textarea
                  rows={2}
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bloque 4: Repuestos & Presupuesto SAP */}
          <div className="bg-[#fffbeb] p-3.5 rounded-xl border border-[#fef08a] space-y-3">
            <span className="font-bold text-[#854d0e] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#b45309]" />
              4. Repuestos, Cotización, Precios & Flujo SAP
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-[#854d0e] block mb-1">PART NUMBER</label>
                <input
                  type="text"
                  value={formPartNumber}
                  onChange={e => setFormPartNumber(e.target.value)}
                  placeholder="Ej. BRKT-TC2X-01"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono font-bold text-[#00236f]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#854d0e] block mb-1">DESCRIPCIÓN PART NUMBER</label>
                <input
                  type="text"
                  value={formDescPartNumber}
                  onChange={e => setFormDescPartNumber(e.target.value)}
                  placeholder="Ej. MAIN BOARD TC26 / CABEZAL TÉRMICO"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-[#854d0e] block mb-1">COTIZACIÓN N°</label>
                <input
                  type="text"
                  value={formCotizacion}
                  onChange={e => setFormCotizacion(e.target.value)}
                  placeholder="Ej. COT-2026-092"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#854d0e] block mb-1">PRECIO ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrecio}
                  onChange={e => setFormPrecio(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono font-bold text-[#007a33]"
                />
              </div>

              <div>
                <label className="font-bold text-[#854d0e] block mb-1">SOLPED SAP</label>
                <input
                  type="text"
                  value={formSolped}
                  onChange={e => setFormSolped(e.target.value)}
                  placeholder="Ej. 1000984521"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#854d0e] block mb-1">ORDEN DE COMPRA (O/C)</label>
                <input
                  type="text"
                  value={formOC}
                  onChange={e => setFormOC(e.target.value)}
                  placeholder="Ej. 4500129845"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#854d0e] block mb-1">HES SAP</label>
                <input
                  type="text"
                  value={formHES}
                  onChange={e => setFormHES(e.target.value)}
                  placeholder="Ej. 100234891"
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-bold text-[#854d0e] block mb-1">PRESUPUESTO MES</label>
                <select
                  value={formPresupuestoMes}
                  onChange={e => setFormPresupuestoMes(e.target.value)}
                  className="w-full p-2 bg-white border border-[#fde047] rounded-lg font-bold"
                >
                  <option value="Enero 2026">Enero 2026</option>
                  <option value="Febrero 2026">Febrero 2026</option>
                  <option value="Marzo 2026">Marzo 2026</option>
                  <option value="Abril 2026">Abril 2026</option>
                  <option value="Mayo 2026">Mayo 2026</option>
                  <option value="Junio 2026">Junio 2026</option>
                  <option value="Julio 2026">Julio 2026</option>
                  <option value="Agosto 2026">Agosto 2026</option>
                  <option value="Setiembre 2026">Setiembre 2026</option>
                  <option value="Octubre 2026">Octubre 2026</option>
                  <option value="Noviembre 2026">Noviembre 2026</option>
                  <option value="Diciembre 2026">Diciembre 2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f4ff] text-[#444651] font-bold rounded-xl hover:bg-[#e2ecfe] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00236f] text-white font-bold rounded-xl shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
