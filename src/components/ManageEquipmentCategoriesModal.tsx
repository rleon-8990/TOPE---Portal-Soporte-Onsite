import React, { useState } from 'react';
import {
  X,
  Plus,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Search,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  Tag
} from 'lucide-react';
import { CategoryInfo } from '../types';
import {
  getStoredEquipmentCategories,
  addCustomEquipmentCategory,
  deleteCustomEquipmentCategory,
  resetEquipmentCategoriesToDefaults,
  DEFAULT_EQUIPMENT_CATEGORIES
} from '../utils/equipmentCategories';

interface ManageEquipmentCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated: (categories: CategoryInfo[]) => void;
  onSelectCategoryForCreation?: (category: CategoryInfo) => void;
}

export const ManageEquipmentCategoriesModal: React.FC<ManageEquipmentCategoriesModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated,
  onSelectCategoryForCreation
}) => {
  const [categories, setCategories] = useState<CategoryInfo[]>(() => getStoredEquipmentCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newShortCode, setNewShortCode] = useState('');
  const [newVidaUtil, setNewVidaUtil] = useState(5);
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('computer');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefresh = () => {
    const updated = getStoredEquipmentCategories();
    setCategories(updated);
    onCategoriesUpdated(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const result = addCustomEquipmentCategory({
      name: newEquipmentName,
      shortCode: newShortCode,
      vidaUtilDefault: Number(newVidaUtil) || 5,
      description: newDescription,
      icon: newIcon
    });

    if (!result.success) {
      setFormError(result.error || 'Error al agregar el equipo');
      return;
    }

    setSuccessMessage(`¡Equipo "${result.category?.name}" añadido con éxito al catálogo!`);
    setNewEquipmentName('');
    setNewShortCode('');
    setNewDescription('');
    setShowAddForm(false);
    handleRefresh();

    if (result.category && onSelectCategoryForCreation) {
      onSelectCategoryForCreation(result.category);
    }

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el equipo personalizado "${name}" del catálogo?`)) {
      return;
    }

    const res = deleteCustomEquipmentCategory(id);
    if (res.success) {
      setSuccessMessage(`Equipo "${name}" eliminado.`);
      handleRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setFormError(res.error || 'Error al eliminar');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer el catálogo a los 19 equipos oficiales base del Portal OnSite?')) {
      const resetList = resetEquipmentCategoriesToDefaults();
      setCategories(resetList);
      onCategoriesUpdated(resetList);
      setSuccessMessage('Catálogo restablecido a los 19 equipos oficiales.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const officialCount = categories.filter(c => !c.isCustom).length;
  const customCount = categories.filter(c => c.isCustom).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-[#e5eeff] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00236f] text-white flex items-center justify-center shadow-md">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  Catálogo de Equipos & Categorías
                </h2>
                <span className="text-[11px] font-bold bg-[#eff4ff] text-[#00236f] border border-[#dce9ff] px-2 py-0.5 rounded-full">
                  {categories.length} Equipos
                </span>
              </div>
              <p className="text-xs text-[#757682]">
                Portal OnSite • Cada categoría equivale exactamente a un tipo de equipo autorizado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#757682] hover:text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {formError && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="p-4 border-b border-[#e5eeff] bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#757682] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por equipo o código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8f9ff] border border-[#dce9ff] rounded-lg focus:outline-none focus:border-[#00236f]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                showAddForm
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-[#00236f] text-white hover:bg-[#001b57]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cerrar Formulario' : 'Añadir Nuevo Equipo'}</span>
            </button>

            {customCount > 0 && (
              <button
                onClick={handleResetDefaults}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#757682] hover:text-[#ba1a1a] hover:bg-red-50 border border-[#e5eeff] flex items-center gap-1 transition-colors"
                title="Restablecer solo los 19 equipos oficiales"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Equipment Form Collapse */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-[#f4f7ff] border-b border-[#dce9ff] animate-fadeIn space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00236f]">
              <Sparkles className="w-4 h-4" />
              <span>Registrar Nuevo Tipo de Equipo / Categoría</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#444651] mb-1">
                  Nombre del Equipo * <span className="font-normal text-[#757682]">(ej: SWITCH DE RED CISCO, UPS 1500VA, etc.)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SCANNER OMNIDIRECCIONAL"
                  value={newEquipmentName}
                  onChange={e => {
                    setNewEquipmentName(e.target.value);
                    if (!newShortCode) {
                      const words = e.target.value.split(/\s+/).filter(Boolean);
                      if (words.length > 0) {
                        setNewShortCode(words.map(w => w.substring(0, 3).toUpperCase()).join('-').substring(0, 8));
                      }
                    }
                  }}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#444651] mb-1">
                  Código Corto * <span className="font-normal text-[#757682]">(ej: SCN-OMNI)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SCN-OMN"
                  value={newShortCode}
                  onChange={e => setNewShortCode(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg font-mono focus:border-[#00236f] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#444651] mb-1">
                  Vida Útil Recomendada (Años)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newVidaUtil}
                  onChange={e => setNewVidaUtil(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#444651] mb-1">
                  Descripción Operativa
                </label>
                <input
                  type="text"
                  placeholder="Descripción de uso en tienda o cajas"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-[#757682] hover:text-[#0b1c30] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00236f] text-white text-xs font-bold rounded-lg hover:bg-[#001b57] shadow-xs transition-colors"
              >
                Guardar y Habilitar en Portal
              </button>
            </div>
          </form>
        )}

        {/* Equipment Categories List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#757682] pb-1 border-b border-[#f0f4ff]">
            <span>
              Mostrando {filteredCategories.length} de {categories.length} equipos registrados ({officialCount} base oficiales + {customCount} añadidos)
            </span>
            <span className="text-[11px] font-medium text-[#00236f] bg-blue-50 px-2 py-0.5 rounded">
              Categoría = Equipo en Portal OnSite
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredCategories.map(cat => {
              const isDefault = DEFAULT_EQUIPMENT_CATEGORIES.some(d => d.id === cat.id);

              return (
                <div
                  key={cat.id}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    cat.isCustom
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                      : 'bg-white border-[#e5eeff] hover:border-[#b8d4ff]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] font-bold text-[#00236f] bg-[#eff4ff] border border-[#dce9ff] px-1.5 py-0.5 rounded">
                        {cat.shortCode}
                      </span>
                      {cat.isCustom ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                          Añadido
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-[#f0f4ff] text-[#4059aa] border border-[#dce9ff] px-1.5 py-0.2 rounded-full">
                          Oficial
                        </span>
                      )}
                      <span className="text-[10px] text-[#757682] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#757682]" />
                        {cat.vidaUtilDefault || 5} años vida útil
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0b1c30] truncate">
                      {cat.name}
                    </h4>

                    <p className="text-[11px] text-[#757682] line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {cat.isCustom && (
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar este equipo personalizado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Boxes className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">No se encontraron equipos con esa búsqueda</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-[#00236f] hover:underline"
              >
                Limpiar filtro
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between text-xs">
          <span className="text-[#757682]">
            Todos los equipos están sincronizados con los formularios de alta y filtros de inventario.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00236f] text-white rounded-lg font-bold hover:bg-[#001b57] transition-colors"
          >
            Cerrar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
