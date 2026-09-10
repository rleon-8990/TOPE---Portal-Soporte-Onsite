import React, { useState } from 'react';
import {
  Store,
  Boxes,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Snowflake,
  Droplets,
  Radio,
  PlusCircle,
  QrCode,
  History,
  FileSpreadsheet,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Send
} from 'lucide-react';
import { Ticket, WorkOrder, Store as StoreType, AppUser } from '../types';
import { hasPageAccess } from '../utils/rbac';

interface DashboardViewProps {
  currentUser: AppUser;
  tickets: Ticket[];
  workOrders: WorkOrder[];
  stores: StoreType[];
  onNavigate: (view: string) => void;
  onOpenNewTicket: () => void;
  onOpenQRScanner: () => void;
  onOpenAlertsManager: () => void;
  onSelectTicket: (ticket: Ticket) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  tickets,
  workOrders,
  stores,
  onNavigate,
  onOpenNewTicket,
  onOpenQRScanner,
  onOpenAlertsManager,
  onSelectTicket,
}) => {
  const [chartPeriod, setChartPeriod] = useState<'mes' | '6meses' | 'ano'>('6meses');
  const [selectedRegionTab, setSelectedRegionTab] = useState<'norte' | 'centro' | 'sur' | 'oriente'>('norte');

  // Chart data points according to selected period
  const chartData = {
    mes: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      disponibilidad: [98.1, 98.6, 97.9, 98.9],
      fallos: [12, 8, 15, 6],
    },
    '6meses': {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      disponibilidad: [98.5, 98.2, 99.1, 98.8, 97.5, 98.9],
      fallos: [42, 45, 30, 35, 65, 32],
    },
    ano: {
      labels: ['2025-Q3', '2025-Q4', '2026-Q1', '2026-Q2'],
      disponibilidad: [97.8, 98.4, 98.9, 98.6],
      fallos: [140, 110, 95, 102],
    }
  }[chartPeriod];

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Mobile Top Welcome Header */}
      <div className="flex items-center justify-between md:hidden pt-1">
        <div>
          <span className="text-xs text-[#757682] font-medium">Hola, {currentUser.name.split(' ')[0]}</span>
          <h2 className="text-xl font-bold text-[#0b1c30] tracking-tight">Resumen General</h2>
        </div>
        <div className="relative">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00236f]/30"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#fd761a] rounded-full border-2 border-white" />
        </div>
      </div>

      {/* 4 Stats Summary Cards Grid: 2 cols on tablet for maximum readability, 4 cols on full screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Tiendas */}
        <div
          onClick={() => onNavigate('tiendas')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#e5eeff] shadow-[0_2px_10px_rgba(30,58,138,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#00236f] flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +4%
            </span>
          </div>
          <div>
            <h3 className="text-xs text-[#757682] font-semibold uppercase tracking-wider mb-0.5">
              Tiendas Activas
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">90</p>
            <span className="text-[11px] text-[#757682]">5 regiones del país</span>
          </div>
        </div>

        {/* Card 2: Equipos Monitoreados */}
        <div
          onClick={() => onNavigate('inventario')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#e5eeff] shadow-[0_2px_10px_rgba(30,58,138,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#1e3a8a] flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-xs text-[#757682] font-semibold uppercase tracking-wider mb-0.5">
              Equipos Monitoreados
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">1,240</p>
            <span className="text-[11px] text-[#757682]">20 tipos de activos</span>
          </div>
        </div>

        {/* Card 3: Mantenimientos */}
        <div
          onClick={() => onNavigate('mantenimiento')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#e5eeff] shadow-[0_2px_10px_rgba(30,58,138,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff3e0] text-[#fd761a] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-[#757682] bg-[#f8f9ff] px-2 py-0.5 rounded-full font-medium">
              Agosto 2026
            </span>
          </div>
          <div>
            <h3 className="text-xs text-[#757682] font-semibold uppercase tracking-wider mb-0.5">
              Mant. Preventivos
            </h3>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">156</p>
              <span className="text-xs text-[#757682]">este mes</span>
            </div>
          </div>
        </div>

        {/* Card 4: Tickets / Alertas Críticas */}
        <div
          onClick={() => onNavigate('helpdesk')}
          className="bg-[#ba1a1a] rounded-xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(186,26,26,0.25)] flex flex-col justify-between text-white relative overflow-hidden cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-white text-[#ba1a1a] px-2.5 py-0.5 rounded-full shadow-xs">
              Crítico
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs text-white/90 font-semibold uppercase tracking-wider mb-0.5">
              Tickets Abiertos
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold">12</p>
            <span className="text-[11px] text-white/80">3 con asignación inmediata</span>
          </div>
        </div>
      </div>

      {/* Quick Action Pills for Fast Workflow */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={onOpenNewTicket}
          className="px-4 py-2.5 rounded-xl bg-[#00236f] text-white text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-[#1e3a8a] transition-all shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-[#fd761a]" />
          <span>Nuevo Ticket Helpdesk</span>
        </button>

        <button
          onClick={onOpenQRScanner}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#e5eeff] text-[#00236f] text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-[#eff4ff] transition-all shrink-0 active:scale-95"
        >
          <QrCode className="w-4 h-4 text-[#00236f]" />
          <span>Escanear Equipo QR</span>
        </button>

        <button
          onClick={() => onNavigate('informes')}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#e5eeff] text-[#444651] text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-[#eff4ff] transition-all shrink-0 active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
          <span>Generar Informe Técnico</span>
        </button>

        {hasPageAccess(currentUser.role, 'despachador') && (
          <button
            onClick={() => onNavigate('despachador')}
            className="px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-[#c4dcff] text-[#00236f] text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-[#dce9ff] transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 text-[#00236f]" />
            <span>Despacho Rápido Correos</span>
          </button>
        )}

        <button
          onClick={onOpenAlertsManager}
          className="px-4 py-2.5 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-[#ffdad6] transition-all shrink-0 active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          <span>Alertas Regionales (Broadcast)</span>
        </button>
      </div>

      {/* Charts and Critical Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Performance Chart (2 cols on large screen) */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 border border-[#e5eeff] shadow-[0_2px_12px_rgba(30,58,138,0.04)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-bold text-base text-[#0b1c30]">Rendimiento de Equipos</h2>
              <p className="text-xs text-[#757682]">Disponibilidad operativa (%) vs. Fallos reportados</p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#eff4ff] p-1 rounded-lg">
              <button
                onClick={() => setChartPeriod('mes')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  chartPeriod === 'mes' ? 'bg-[#00236f] text-white shadow-xs' : 'text-[#757682] hover:text-[#0b1c30]'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setChartPeriod('6meses')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  chartPeriod === '6meses' ? 'bg-[#00236f] text-white shadow-xs' : 'text-[#757682] hover:text-[#0b1c30]'
                }`}
              >
                6 Meses
              </button>
              <button
                onClick={() => setChartPeriod('ano')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  chartPeriod === 'ano' ? 'bg-[#00236f] text-white shadow-xs' : 'text-[#757682] hover:text-[#0b1c30]'
                }`}
              >
                Año
              </button>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs mb-2">
            <span className="flex items-center gap-1.5 text-[#00236f] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#00236f]"></span>
              Disponibilidad (%)
            </span>
            <span className="flex items-center gap-1.5 text-[#fd761a] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#fd761a]"></span>
              Fallos Reportados
            </span>
          </div>

          {/* SVG Interactive Visualizer */}
          <div className="relative w-full h-56 bg-[#f8f9ff] rounded-xl p-3 border border-[#e5eeff] flex flex-col justify-end">
            {/* Grid lines */}
            <div className="absolute inset-x-3 top-3 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-[#757682] w-full text-[9px] text-right text-[#757682]">100%</div>
              <div className="border-b border-dashed border-[#757682] w-full text-[9px] text-right text-[#757682]">98%</div>
              <div className="border-b border-dashed border-[#757682] w-full text-[9px] text-right text-[#757682]">96%</div>
              <div className="border-b border-dashed border-[#757682] w-full text-[9px] text-right text-[#757682]">94%</div>
            </div>

            {/* SVG Lines */}
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Disponibilidad Area & Line (Blue) */}
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00236f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00236f" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 10 30 Q 120 40 200 15 T 380 60 T 490 20 L 490 150 L 10 150 Z"
                fill="url(#blueGrad)"
              />
              <path
                d="M 10 30 Q 120 40 200 15 T 380 60 T 490 20"
                fill="none"
                stroke="#00236f"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Fallos Curve (Orange dashed) */}
              <path
                d="M 10 80 Q 120 70 200 110 T 380 15 T 490 90"
                fill="none"
                stroke="#fd761a"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />

              {/* Data points */}
              {[
                { x: 10, y: 30, val: '98.5%' },
                { x: 105, y: 38, val: '98.2%' },
                { x: 200, y: 15, val: '99.1%' },
                { x: 295, y: 24, val: '98.8%' },
                { x: 380, y: 60, val: '97.5%' },
                { x: 490, y: 20, val: '98.9%' },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#00236f" stroke="#ffffff" strokeWidth="2" />
                </g>
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between items-center px-2 pt-2 text-[10px] text-[#757682] font-semibold">
              {chartData.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Alerts Widget (1 col) */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-[0_2px_12px_rgba(30,58,138,0.04)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <span>Alertas Críticas</span>
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
              </h2>
              <p className="text-xs text-[#757682]">Requieren atención o asignación</p>
            </div>
            <button
              onClick={onOpenAlertsManager}
              className="text-xs text-[#00236f] hover:underline font-semibold"
            >
              Configurar
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[310px] pr-1 divide-y divide-[#f0f4ff]">
            {/* Alert Item 1 */}
            <div className="pt-2">
              <div className="p-3 bg-[#ffdad6]/35 rounded-xl border border-[#ba1a1a]/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
                  <Snowflake className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-[#0b1c30] truncate">Fallo en Compresor A</h4>
                    <span className="text-[10px] font-bold text-[#ba1a1a]">Hace 15m</span>
                  </div>
                  <p className="text-[11px] text-[#444651] truncate mt-0.5">Sede Central - Chiller HVAC-001</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#757682] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#00236f]" />
                      Asignado: Ing. Carlos Ramos
                    </span>
                    <button
                      onClick={() => onNavigate('helpdesk')}
                      className="text-[#00236f] font-bold hover:underline"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Item 2 */}
            <div className="pt-2">
              <div className="p-3 bg-[#fff3e0] rounded-xl border border-[#fd761a]/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fd761a] text-white flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-[#0b1c30] truncate">Fuga de Refrigerante</h4>
                    <span className="text-[10px] font-bold text-[#fd761a]">Hace 2h</span>
                  </div>
                  <p className="text-[11px] text-[#444651] truncate mt-0.5">Tienda Norte - Vitrina Fría VF-12</p>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('helpdesk')}
                      className="text-xs text-[#00236f] font-bold hover:underline"
                    >
                      Asignar Técnico Especialista
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Item 3 */}
            <div className="pt-2">
              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#757682] text-white flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-[#0b1c30] truncate">Pérdida de Comunicación</h4>
                    <span className="text-[10px] text-[#757682]">Hace 4h</span>
                  </div>
                  <p className="text-[11px] text-[#444651] truncate mt-0.5">Tienda Sur - Switch Cisco 9300</p>
                  <span className="inline-block mt-1.5 text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-[#e5eeff] text-[#757682]">
                    En diagnóstico NOC
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('helpdesk')}
            className="mt-4 w-full py-2.5 rounded-lg text-xs font-bold text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors text-center"
          >
            Ver Todas las 12 Alertas
          </button>
        </div>
      </div>

      {/* Bottom Row: Regional Status & Work Orders & Maintenance Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Regional Status Interactive Map (1 col) */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-[0_2px_12px_rgba(30,58,138,0.04)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-base text-[#0b1c30]">Estado Regional (90 Tiendas)</h2>
              <p className="text-xs text-[#757682]">Disponibilidad en tiempo real</p>
            </div>
            <span className="bg-[#e8f5e9] text-[#10b981] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              En Vivo
            </span>
          </div>

          {/* Regional Health Cards */}
          <div className="space-y-2.5 mb-4">
            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#757682] uppercase">Lima y Callao (35 T)</span>
                <p className="text-lg font-bold text-[#00236f]">98.7% <span className="text-xs font-normal text-[#10b981]">Operativo</span></p>
              </div>
              <span className="text-xs font-bold text-[#10b981] bg-white px-2 py-1 rounded-lg border border-[#e5eeff]">Normal</span>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#757682] uppercase">Zona Norte (20 T)</span>
                <p className="text-lg font-bold text-[#00236f]">98.2% <span className="text-xs font-normal text-[#10b981]">Operativo</span></p>
              </div>
              <span className="text-xs font-bold text-[#10b981] bg-white px-2 py-1 rounded-lg border border-[#e5eeff]">Normal</span>
            </div>

            <div className="p-3 bg-[#ffdad6]/35 rounded-xl border border-[#ba1a1a]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#ba1a1a] uppercase">Zona Centro (10 T)</span>
                <p className="text-lg font-bold text-[#ba1a1a]">89.5% <span className="text-xs font-normal text-[#ba1a1a]">Atención req.</span></p>
              </div>
              <span className="text-xs font-bold text-[#ba1a1a] bg-white px-2 py-1 rounded-lg border border-[#ffdad6]">Alerta</span>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#757682] uppercase">Zona Sur (18 T) & Oriente (7 T)</span>
                <p className="text-lg font-bold text-[#00236f]">97.4% <span className="text-xs font-normal text-[#10b981]">Operativo</span></p>
              </div>
              <span className="text-xs font-bold text-[#10b981] bg-white px-2 py-1 rounded-lg border border-[#e5eeff]">Normal</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tiendas')}
            className="w-full py-2 bg-[#f8f9ff] text-[#00236f] text-xs font-bold rounded-lg border border-[#e5eeff] hover:bg-[#eff4ff] flex items-center justify-center gap-1.5"
          >
            <span>Ver mapa y lista completa de 90 tiendas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Maintenance Donut Breakdown (1 col) */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-[0_2px_12px_rgba(30,58,138,0.04)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-base text-[#0b1c30]">Estado de Mantenimientos</h2>
              <p className="text-xs text-[#757682]">156 órdenes programadas este mes</p>
            </div>
            <button
              onClick={() => onNavigate('mantenimiento')}
              className="text-xs text-[#00236f] font-semibold hover:underline"
            >
              Historial
            </button>
          </div>

          {/* Donut graphic */}
          <div className="flex items-center gap-6 my-auto py-2">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 36 36">
                <path
                  className="text-[#e5eeff]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                {/* 65% Completado */}
                <path
                  className="text-[#00236f]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="65, 100"
                  strokeWidth="4.2"
                />
                {/* 25% En Progreso */}
                <path
                  className="text-[#90a8ff]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-65"
                  strokeWidth="4.2"
                />
                {/* 10% Pendiente */}
                <path
                  className="text-[#fd761a]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-90"
                  strokeWidth="4.2"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-xl text-[#00236f]">156</span>
                <span className="text-[10px] text-[#757682] font-semibold">Total mes</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-[#0b1c30]">
                  <span className="w-3 h-3 rounded-full bg-[#00236f]" />
                  Completado
                </span>
                <span className="font-bold text-[#00236f]">65% (101)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-[#0b1c30]">
                  <span className="w-3 h-3 rounded-full bg-[#90a8ff]" />
                  En Progreso
                </span>
                <span className="font-bold text-[#4059aa]">25% (39)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-[#0b1c30]">
                  <span className="w-3 h-3 rounded-full bg-[#fd761a]" />
                  Pendiente
                </span>
                <span className="font-bold text-[#fd761a]">10% (16)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('informes')}
            className="w-full py-2 bg-[#eff4ff] text-[#00236f] text-xs font-bold rounded-lg hover:bg-[#dce9ff] transition-colors mt-3"
          >
            Generar Informe Preventivo Mensual
          </button>
        </div>

        {/* Recent Work Orders Table (1 col) */}
        <div className="bg-white rounded-xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(30,58,138,0.04)] flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#0b1c30]">Órdenes Recientes</h2>
            <button
              onClick={() => onNavigate('mantenimiento')}
              className="text-xs text-[#00236f] font-semibold hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="flex-1 overflow-x-auto divide-y divide-[#f0f4ff]">
            {workOrders.slice(0, 4).map(wo => (
              <div key={wo.id} className="p-3 hover:bg-[#f8f9ff] transition-colors flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#00236f] font-mono">{wo.code}</div>
                  <div className="text-[11px] text-[#0b1c30] font-medium truncate max-w-[140px]">{wo.equipmentName}</div>
                  <div className="text-[10px] text-[#757682]">{wo.storeName}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      wo.status === 'Completado'
                        ? 'bg-[#e8f5e9] text-[#10b981]'
                        : wo.status === 'En Progreso'
                        ? 'bg-[#fff3e0] text-[#fd761a]'
                        : wo.status === 'Programado'
                        ? 'bg-[#eff4ff] text-[#00236f]'
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}
                  >
                    {wo.status}
                  </span>
                  <div className="text-[10px] text-[#757682] mt-0.5">{wo.type}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#f8f9ff] border-t border-[#e5eeff] text-center">
            <button
              onClick={() => onNavigate('mantenimiento')}
              className="text-xs font-bold text-[#00236f] hover:underline inline-flex items-center gap-1"
            >
              Ver Historial de Mantenimientos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
