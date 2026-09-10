import React, { useState, useMemo } from 'react';
import {
  Send,
  Mail,
  CheckCircle2,
  Calendar,
  Clock,
  FileSpreadsheet,
  Users,
  Search,
  CheckSquare,
  Square,
  Eye,
  Rocket,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Upload,
  Filter,
  History,
  AlertCircle,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  Undo,
  Redo,
  Store,
  Tag,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppUser, EmailRecipient, EmailTemplate, EmailDispatchRecord } from '../types';
import { INITIAL_EMAIL_TEMPLATES, INITIAL_RECIPIENTS, INITIAL_DISPATCH_HISTORY } from '../data/emailDispatcherData';

interface QuickEmailDispatcherProps {
  currentUser: AppUser;
  onBackToDashboard?: () => void;
}

export const QuickEmailDispatcher: React.FC<QuickEmailDispatcherProps> = ({
  currentUser,
  onBackToDashboard
}) => {
  // Templates state
  const [templates] = useState<EmailTemplate[]>(INITIAL_EMAIL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('aviso_mantenimiento');
  const [subject, setSubject] = useState<string>('Aviso de Mantenimiento Programado');
  const [bodyText, setBodyText] = useState<string>(INITIAL_EMAIL_TEMPLATES[0].body);

  // Active Category / Group Filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('tiendas');
  const [registeredGroupFilter, setRegisteredGroupFilter] = useState<string>('vip');
  const [searchRecipientQuery, setSearchRecipientQuery] = useState<string>('');

  // Recipients state
  const [recipients, setRecipients] = useState<EmailRecipient[]>(INITIAL_RECIPIENTS);

  // Scheduling State
  const [sendMode, setSendMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-05-10');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [frequency, setFrequency] = useState<string>('Una vez');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewRecipientIndex, setPreviewRecipientIndex] = useState<number>(0);

  // Dispatch Progress / History
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [dispatchHistory, setDispatchHistory] = useState<EmailDispatchRecord[]>(INITIAL_DISPATCH_HISTORY);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [dispatchSuccessNotice, setDispatchSuccessNotice] = useState<string | null>(null);

  // Change Template Handler
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBodyText(tmpl.body);
    }
  };

  // Toggle Single Recipient
  const handleToggleRecipient = (id: string) => {
    setRecipients(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  // Filtered Recipients for Display
  const filteredRecipients = useMemo(() => {
    return recipients.filter(r => {
      // Category filter matching preset buttons
      if (activeCategoryFilter !== 'all') {
        if (activeCategoryFilter === 'tiendas' && r.category !== 'tiendas') return false;
        if (activeCategoryFilter === 'cajas' && r.category !== 'cajas') return false;
        if (activeCategoryFilter === 'prevencion' && r.category !== 'prevencion') return false;
        if (activeCategoryFilter === 'zonales' && r.category !== 'zonales') return false;
        if (activeCategoryFilter === 'gerentes' && r.category !== 'gerentes') return false;
        if (activeCategoryFilter === 'complementaria' && r.category !== 'complementaria') return false;
        if (activeCategoryFilter === 'vip' && r.category !== 'vip') return false;
      }

      // Search query
      if (searchRecipientQuery.trim() !== '') {
        const q = searchRecipientQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesEmail = r.email.toLowerCase().includes(q);
        const matchesStore = (r.storeName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesStore) return false;
      }

      return true;
    });
  }, [recipients, activeCategoryFilter, searchRecipientQuery]);

  // Selected Count
  const selectedCount = useMemo(() => {
    return recipients.filter(r => r.selected).length;
  }, [recipients]);

  const areAllFilteredSelected = useMemo(() => {
    if (filteredRecipients.length === 0) return false;
    return filteredRecipients.every(r => r.selected);
  }, [filteredRecipients]);

  // Toggle All Filtered
  const handleToggleSelectAllFiltered = () => {
    const newState = !areAllFilteredSelected;
    const filteredIds = new Set(filteredRecipients.map(r => r.id));
    setRecipients(prev =>
      prev.map(r => (filteredIds.has(r.id) ? { ...r, selected: newState } : r))
    );
  };

  // Handle Preset Filter Click
  const handlePresetCategoryClick = (cat: string) => {
    setActiveCategoryFilter(cat);
    // When clicking a preset button, automatically select items of that category
    setRecipients(prev =>
      prev.map(r => (r.category === cat ? { ...r, selected: true } : r))
    );
  };

  // Insert Tag into Body
  const handleInsertTag = (tag: string) => {
    setBodyText(prev => prev + ` ${tag}`);
  };

  // Send Automation Process
  const handleStartDispatch = () => {
    if (selectedCount === 0) {
      alert('Por favor selecciona al menos un destinatario para iniciar el envío.');
      return;
    }

    setIsSending(true);
    setSendProgress(5);

    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSending(false);

          // Save to dispatch history
          const selectedTmpl = templates.find(t => t.id === selectedTemplateId);
          const newRecord: EmailDispatchRecord = {
            id: `disp_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            templateName: selectedTmpl ? selectedTmpl.name : 'Personalizado',
            subject: subject,
            totalRecipients: selectedCount,
            successfulSends: selectedCount,
            failedSends: 0,
            scheduledFor: sendMode === 'scheduled' ? `${scheduledDate} ${scheduledTime}` : undefined,
            frequency: frequency === 'Una vez' ? 'una_vez' : (frequency.toLowerCase() as any),
            status: sendMode === 'scheduled' ? 'programado' : 'completado',
            senderEmail: currentUser.email || 'rleon@tottus.com.pe',
            senderName: currentUser.name || 'Ricardo León',
            recipientsSummary: `${selectedCount} destinatarios corporativos (${activeCategoryFilter})`
          };

          setDispatchHistory(h => [newRecord, ...h]);
          setDispatchSuccessNotice(
            sendMode === 'now'
              ? `¡Envío masivo completado exitosamente! Se despacharon ${selectedCount} correos mediante Exchange Online.`
              : `¡Campaña programada exitosamente para el ${scheduledDate} a las ${scheduledTime}!`
          );

          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch (e) {
            // ignore
          }

          setTimeout(() => {
            setDispatchSuccessNotice(null);
          }, 6000);

          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, 280);
  };

  // Get preview data with variables replaced
  const activeSelectedRecipients = useMemo(() => {
    return recipients.filter(r => r.selected);
  }, [recipients]);

  const currentPreviewRecipient = useMemo(() => {
    if (activeSelectedRecipients.length === 0) {
      return recipients[0] || { name: 'Colaborador Tottus', email: 'usuario@tottus.com.pe', storeName: 'Hiper Tottus San Isidro' };
    }
    return activeSelectedRecipients[previewRecipientIndex % activeSelectedRecipients.length];
  }, [activeSelectedRecipients, recipients, previewRecipientIndex]);

  const previewBodyContent = useMemo(() => {
    const rec = currentPreviewRecipient;
    return bodyText
      .replace(/\[NOMBRE\]/g, rec.name)
      .replace(/\[TIENDA\]/g, rec.storeName || 'Sede Central')
      .replace(/\[FECHA\]/g, scheduledDate)
      .replace(/\[HORA\]/g, scheduledTime)
      .replace(/\[CODIGO\]/g, 'OT-2026-MNT')
      .replace(/\[EQUIPO\]/g, 'POS IBM SurePOS / Switch Core')
      .replace(/\[TECNICO\]/g, 'Cuadrilla Onsite Lima');
  }, [bodyText, currentPreviewRecipient, scheduledDate, scheduledTime]);

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Application Window Bar matching image.png */}
      <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00236f] to-[#0052cc] text-white flex items-center justify-center shadow-sm shrink-0">
            {/* Plane + Mail Icon */}
            <div className="relative">
              <Send className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
              <Mail className="w-3.5 h-3.5 absolute -bottom-1.5 -right-1.5 text-amber-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight flex items-center gap-2">
              <span>Despachador Rápido de Correos</span>
            </h1>
            <p className="text-xs text-[#757682]">
              Notificaciones masivas, avisos de mantenimiento y circulares operativas · Microsoft 365 Exchange
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#f0f4ff] hover:bg-[#e0ecff] text-[#00236f] border border-[#dce9ff] flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
            title="Ver envíos anteriores"
          >
            <History className="w-4 h-4 text-[#00236f]" />
            <span>Historial ({dispatchHistory.length})</span>
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#757682] hover:bg-slate-100 transition-all cursor-pointer"
            >
              Volver
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {dispatchSuccessNotice && (
        <div className="bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500 text-white rounded-xl shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-black">{dispatchSuccessNotice}</p>
              <p className="text-[11px] text-emerald-800">
                Identificador de lote: <code>DISP-{Date.now().toString().slice(-6)}</code> · Servidor: <code>smtp.office365.com:587 (TLS)</code>
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchSuccessNotice(null)}
            className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/50 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Work Surface matching the screenshot layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 1. CONFIGURACIÓN DEL MENSAJE (5 or 6 cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-5 flex flex-col justify-between min-h-[580px]">
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-[#f0f4ff] pb-3">
                <h2 className="text-sm font-black text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00236f] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>CONFIGURACIÓN DEL MENSAJE</span>
                </h2>
                <span className="text-[11px] text-[#757682] font-semibold">Plantillas Corporativas</span>
              </div>

              {/* Plantilla Dropdown */}
              <div>
                <label className="text-xs font-bold text-[#444651] mb-1.5 block">
                  Plantilla
                </label>
                <div className="relative">
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleSelectTemplate(e.target.value)}
                    className="w-full h-10 px-3.5 pr-8 bg-white border border-[#c5c5d3] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] appearance-none cursor-pointer"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#757682] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Asunto Input */}
              <div>
                <label className="text-xs font-bold text-[#444651] mb-1.5 block">
                  Asunto
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Escriba el asunto del correo..."
                  className="w-full h-10 px-3.5 bg-white border border-[#c5c5d3] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] transition-all"
                />
              </div>

              {/* Cuerpo del Mensaje */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#444651] block">
                    Cuerpo del Mensaje
                  </label>
                  <span className="text-[10px] text-[#757682]">Variables dinámicas [TAG] soportadas</span>
                </div>

                {/* Rich Text Toolbar matching screenshot */}
                <div className="p-1.5 bg-[#f8faff] rounded-t-xl border border-[#dce9ff] flex flex-wrap items-center gap-1 text-[#444651]">
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs font-bold hover:text-[#00236f] transition-all"
                    title="Negrita"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs italic hover:text-[#00236f] transition-all"
                    title="Cursiva"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs underline hover:text-[#00236f] transition-all"
                    title="Subrayado"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs line-through hover:text-[#00236f] transition-all"
                    title="Tachado"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Color de texto / Resaltado"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <div className="h-4 w-px bg-[#dce9ff] mx-1" />

                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Lista con viñetas"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Lista numerada"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Alineación"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-[#dce9ff] mx-1" />

                  <button
                    type="button"
                    onClick={() => {
                      const tmpl = templates.find(t => t.id === selectedTemplateId);
                      if (tmpl) setBodyText(tmpl.body);
                    }}
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Deshacer"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-xs hover:text-[#00236f] transition-all"
                    title="Rehacer"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-[#dce9ff] mx-1" />

                  {/* Insert Tag Chips */}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] text-[#757682] hidden sm:inline">Insertar:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('[NOMBRE]')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                      title="Insertar nombre del colaborador"
                    >
                      [NOMBRE]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('[TIENDA]')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                      title="Insertar sede o tienda"
                    >
                      [TIENDA]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('[FECHA]')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                      title="Insertar fecha programada"
                    >
                      [FECHA]
                    </button>
                  </div>
                </div>

                {/* Textarea Editor with rich style */}
                <div className="relative">
                  <textarea
                    rows={11}
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    placeholder="Escriba el cuerpo del mensaje..."
                    className="w-full p-4 bg-white border border-[#c5c5d3] rounded-b-xl text-xs font-mono text-[#0b1c30] leading-relaxed focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] transition-all resize-y"
                  />
                  {/* Subtle watermarked hint */}
                  <div className="absolute right-3 bottom-3 text-[10px] text-[#a0a5b5] bg-white/90 px-1.5 py-0.5 rounded pointer-events-none">
                    {bodyText.length} caracteres
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Indicator matching screenshot */}
            <div className="pt-4 mt-4 border-t border-[#f0f4ff]">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span>Sistema Seguro</span>
                  <span className="hidden sm:inline text-emerald-400">·</span>
                  <span className="text-[11px] font-medium text-emerald-800">
                    Configuración SMTP Correcta (Exchange Online @tottus.com.pe)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 2, 3, 4 SECTIONS (6 or 7 cols)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          {/* ========================================================= */}
          {/* 2. DESTINATARIOS                                          */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-5 space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-[#f0f4ff] pb-3">
              <h2 className="text-sm font-black text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00236f] text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>DESTINATARIOS</span>
              </h2>
              <span className="text-xs font-bold text-[#00236f] bg-[#eef4ff] px-2.5 py-1 rounded-full border border-[#dce9ff]">
                {selectedCount} seleccionados
              </span>
            </div>

            {/* Importar Lista CSV/Excel o agrupado */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#444651]">
                Importar Lista CSV/Excel aru agrupado
              </div>

              {/* 6 Preset Buttons matching screenshot 3x2 grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('tiendas')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'tiendas'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#f0f4ff] hover:bg-[#e0ecff] text-[#00236f] border border-[#dce9ff]'
                  }`}
                >
                  Lista de tiendas (CSV)
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('cajas')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'cajas'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                  }`}
                >
                  Lista de cajas
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('prevencion')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'prevencion'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                  }`}
                >
                  Lista de Prevención
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('zonales')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'zonales'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                  }`}
                >
                  Lista de Gtes Zonales
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('gerentes')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'gerentes'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                  }`}
                >
                  Lista de Gtes de tienda
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetCategoryClick('complementaria')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs ${
                    activeCategoryFilter === 'complementaria'
                      ? 'bg-[#0052cc] text-white ring-2 ring-[#0052cc]/30 font-black'
                      : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                  }`}
                >
                  Lista Complementaria
                </button>
              </div>
            </div>

            {/* Seleccionar Grupo/Plantilla Registrada */}
            <div>
              <label className="text-xs font-bold text-[#444651] mb-1.5 block">
                Seleccionar Grupo/Plantilla Registrada
              </label>
              <div className="relative">
                <select
                  value={registeredGroupFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setRegisteredGroupFilter(val);
                    if (val === 'vip') {
                      setActiveCategoryFilter('vip');
                    } else if (val === 'tiendas') {
                      setActiveCategoryFilter('tiendas');
                    } else if (val === 'zonales') {
                      setActiveCategoryFilter('zonales');
                    } else if (val === 'cajas') {
                      setActiveCategoryFilter('cajas');
                    } else if (val === 'all') {
                      setActiveCategoryFilter('all');
                    }
                  }}
                  className="w-full h-10 px-3.5 pr-8 bg-white border border-[#c5c5d3] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] appearance-none cursor-pointer"
                >
                  <option value="vip">Grupo Clientes VIP</option>
                  <option value="tiendas">Grupo Gerencias de Tienda (Nacional)</option>
                  <option value="zonales">Grupo Gerentes Zonales & Jefaturas</option>
                  <option value="cajas">Grupo Línea de Cajas & POS</option>
                  <option value="all">Todos los Contactos del Directorio</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#757682] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Recipients Table with search filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, correo o tienda..."
                    value={searchRecipientQuery}
                    onChange={e => setSearchRecipientQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-[#f8faff] rounded-lg border border-[#dce9ff] text-[#0b1c30] focus:outline-none focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#00236f] hover:bg-[#eef4ff] rounded-lg transition-colors shrink-0"
                >
                  {areAllFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar visibles'}
                </button>
              </div>

              {/* Table Container matching screenshot */}
              <div className="border border-[#dce9ff] rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-[#f0f4ff] text-[#00236f] font-bold text-[11px] border-b border-[#dce9ff] z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-24">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={areAllFilteredSelected}
                              onChange={handleToggleSelectAllFiltered}
                              className="rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]"
                            />
                            <span>Seleccionar</span>
                          </label>
                        </th>
                        <th className="py-2.5 px-3">Nombre</th>
                        <th className="py-2.5 px-3">Correo Electrónico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f4ff]">
                      {filteredRecipients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-[#757682]">
                            No hay destinatarios que coincidan con el filtro actual.
                          </td>
                        </tr>
                      ) : (
                        filteredRecipients.map(r => (
                          <tr
                            key={r.id}
                            className={`hover:bg-[#f8faff] transition-colors ${
                              r.selected ? 'bg-[#f0f7ff]/40' : ''
                            }`}
                          >
                            <td className="py-2 px-3">
                              <input
                                type="checkbox"
                                checked={r.selected}
                                onChange={() => handleToggleRecipient(r.id)}
                                className="w-4 h-4 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-3 font-semibold text-[#0b1c30]">
                              <div>{r.name}</div>
                              {r.storeName && (
                                <div className="text-[10px] text-[#757682] font-normal">{r.storeName}</div>
                              )}
                            </td>
                            <td className="py-2 px-3 text-[#00236f] font-mono text-[11px]">
                              {r.email}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3 & 4 SECTIONS: AUTOMATIZACIÓN & RESUMEN (Bottom Grid)    */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3. AUTOMATIZACIÓN Y PROGRAMACIÓN */}
            <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#f0f4ff] pb-2 mb-3">
                  <h2 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#00236f] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>AUTOMATIZACIÓN Y PROGRAMACIÓN</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Radio 1: Enviar ahora */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0b1c30]">
                    <input
                      type="radio"
                      name="sendMode"
                      checked={sendMode === 'now'}
                      onChange={() => setSendMode('now')}
                      className="w-4 h-4 text-[#00236f] focus:ring-[#00236f]"
                    />
                    <span>Enviar ahora</span>
                  </label>

                  {/* Radio 2: Programar envío */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0b1c30]">
                      <input
                        type="radio"
                        name="sendMode"
                        checked={sendMode === 'scheduled'}
                        onChange={() => setSendMode('scheduled')}
                        className="w-4 h-4 text-[#00236f] focus:ring-[#00236f]"
                      />
                      <span>Programar envío</span>
                    </label>

                    {/* Date & Time Pickers */}
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      <div className="relative">
                        <input
                          type="date"
                          value={scheduledDate}
                          disabled={sendMode !== 'scheduled'}
                          onChange={e => setScheduledDate(e.target.value)}
                          className={`w-full h-8 px-2 text-xs rounded-lg border font-mono transition-all ${
                            sendMode === 'scheduled'
                              ? 'bg-white border-[#c5c5d3] text-[#0b1c30]'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="time"
                          value={scheduledTime}
                          disabled={sendMode !== 'scheduled'}
                          onChange={e => setScheduledTime(e.target.value)}
                          className={`w-full h-8 px-2 text-xs rounded-lg border font-mono transition-all ${
                            sendMode === 'scheduled'
                              ? 'bg-white border-[#c5c5d3] text-[#0b1c30]'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frecuencia */}
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-[#444651] mb-1 block">
                      Frecuencia
                    </label>
                    <div className="relative">
                      <select
                        value={frequency}
                        onChange={e => setFrequency(e.target.value)}
                        className="w-full h-8 px-3 pr-7 bg-white border border-[#c5c5d3] rounded-lg text-xs font-semibold text-[#0b1c30] appearance-none cursor-pointer focus:ring-1 focus:ring-[#00236f]"
                      >
                        <option value="Una vez">Una vez</option>
                        <option value="Diario">Diario</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Mensual">Mensual</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#757682] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. RESUMEN Y ENVÍO */}
            <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#f0f4ff] pb-2 mb-3">
                  <h2 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#00236f] text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>RESUMEN Y ENVÍO</span>
                  </h2>
                </div>

                {/* Summary Details matching screenshot */}
                <div className="space-y-1.5 text-xs text-[#444651]">
                  <div>
                    <span className="text-[#757682]">Total destinatarios:</span>{' '}
                    <strong className="text-[#0b1c30] text-sm">{selectedCount}</strong>
                  </div>
                  <div>
                    <span className="text-[#757682]">Plantilla:</span>{' '}
                    <strong className="text-[#0b1c30]">
                      {templates.find(t => t.id === selectedTemplateId)?.name || 'Personalizado'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#757682]">Envío:</span>{' '}
                    <strong className="text-[#0b1c30]">
                      {sendMode === 'now'
                        ? 'Inmediato'
                        : `Programado para ${scheduledDate}, ${scheduledTime}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="space-y-2 pt-2 border-t border-[#f0f4ff]">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-[#0052cc] text-[#0052cc] hover:bg-[#f0f7ff] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                >
                  VISTA PREVIA
                </button>

                <button
                  type="button"
                  disabled={isSending || selectedCount === 0}
                  onClick={handleStartDispatch}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isSending || selectedCount === 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-[#0052cc] hover:bg-[#003da5] active:scale-[0.99]'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>
                    {isSending
                      ? `ENVIANDO... (${sendProgress}%)`
                      : '🚀 INICIAR ENVÍO AUTOMATIZADO'}
                  </span>
                </button>

                {/* Progress bar when sending */}
                {isSending && (
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${sendProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VISTA PREVIA DEL CORREO (Outlook 365 Client View)  */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Outlook Header Bar */}
            <div className="p-4 bg-[#00236f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-200" />
                <div>
                  <h3 className="text-sm font-bold">Vista Previa del Correo · Microsoft Outlook 365</h3>
                  <p className="text-[10px] text-blue-200">
                    Así lo visualizará el colaborador en su bandeja corporativa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata Card */}
            <div className="p-4 bg-[#f8faff] border-b border-[#dce9ff] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#757682] font-semibold">De:</span>{' '}
                  <strong className="text-[#0b1c30]">
                    {currentUser.name} &lt;{currentUser.email || 'rleon@tottus.com.pe'}&gt;
                  </strong>
                </div>
                {activeSelectedRecipients.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#757682]">
                      Destinatario {previewRecipientIndex + 1} de {activeSelectedRecipients.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewRecipientIndex(i => (i + 1) % activeSelectedRecipients.length)}
                      className="px-2 py-0.5 rounded bg-white border border-[#dce9ff] text-[#00236f] font-bold text-[10px] hover:bg-blue-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
              <div>
                <span className="text-[#757682] font-semibold">Para:</span>{' '}
                <strong className="text-[#00236f]">
                  {currentPreviewRecipient.name} &lt;{currentPreviewRecipient.email}&gt;
                </strong>
                {currentPreviewRecipient.storeName && (
                  <span className="ml-2 px-2 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {currentPreviewRecipient.storeName}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#757682] font-semibold">Asunto:</span>{' '}
                <span className="font-bold text-[#0b1c30]">{subject}</span>
              </div>
            </div>

            {/* Email Body Canvas */}
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-5 bg-white">
              {/* Corporate Tottus Header Banner */}
              <div className="bg-[#007a33] text-white p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#007a33] font-black flex items-center justify-center text-sm">
                    T
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">Hipermercados Tottus S.A.</h4>
                    <p className="text-[10px] text-emerald-100">División de Infraestructura & Soporte Onsite</p>
                  </div>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white font-mono">
                  COMUNICADO OFICIAL
                </span>
              </div>

              {/* Formatted Text Content with variables substituted */}
              <div className="text-xs text-[#1e293b] leading-relaxed whitespace-pre-line font-sans border-l-2 border-[#00236f] pl-4">
                {previewBodyContent}
              </div>

              {/* Institutional Footer */}
              <div className="pt-4 border-t border-slate-100 text-[10px] text-[#757682] space-y-1">
                <p>
                  Este es un mensaje institucional enviado mediante la plataforma de mantenimiento y operaciones <strong>CMMS Onsite Tottus</strong>.
                </p>
                <p className="text-[#a0a5b5]">
                  Servidor: Microsoft 365 Exchange Online · Certificado SSL/TLS Corporativo
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#f8faff] border-t border-[#dce9ff] flex items-center justify-between">
              <span className="text-xs text-[#757682]">
                Variables dinámicas reemplazadas automáticamente
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#444651] hover:bg-slate-200 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleStartDispatch();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052cc] text-white hover:bg-[#003da5] transition-colors flex items-center gap-1.5"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Enviar Ahora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: HISTORIAL DE ENVÍOS (Audit & Records)               */}
      {/* ========================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-4 bg-[#00236f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-blue-200" />
                <div>
                  <h3 className="text-sm font-bold">Historial de Envíos Automatizados</h3>
                  <p className="text-[10px] text-blue-200">
                    Registro de circulares y avisos despachados por correo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              {dispatchHistory.length === 0 ? (
                <div className="py-12 text-center text-[#757682]">
                  No se registran envíos históricos en la sesión.
                </div>
              ) : (
                dispatchHistory.map(d => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-[#dce9ff] bg-[#f8faff] hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eef4ff] text-[#00236f] border border-[#dce9ff]">
                          {d.templateName}
                        </span>
                        <span className="text-xs font-mono text-[#757682]">{d.timestamp}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{d.status === 'programado' ? 'Programado' : 'Despachado'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">{d.subject}</h4>
                      <p className="text-[11px] text-[#757682] mt-0.5">
                        Remitente: <strong>{d.senderName}</strong> ({d.senderEmail}) · {d.recipientsSummary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#757682] pt-1 border-t border-[#e5eeff]">
                      <div>
                        Total destinatarios: <strong>{d.totalRecipients}</strong> ({d.successfulSends} exitosos)
                      </div>
                      <div className="font-mono text-[10px] text-emerald-700">
                        {d.scheduledFor ? `Programado: ${d.scheduledFor}` : 'Envío Inmediato'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#f8faff] border-t border-[#dce9ff] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00236f] text-white hover:bg-[#00174a] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
