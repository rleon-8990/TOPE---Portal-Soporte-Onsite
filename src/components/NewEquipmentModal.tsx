import React, { useState } from 'react';
import { Plus, X, Boxes, QrCode } from 'lucide-react';
import { Equipment, Store } from '../types';
import { EQUIPMENT_CATEGORIES } from '../data/mockData';

interface NewEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onAddEquipment: (equipment: Equipment) => void;
}

export const NewEquipmentModal: React.FC<NewEquipmentModalProps> = ({
  isOpen,
  onClose,
  stores,
  onAddEquipment,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(EQUIPMENT_CATEGORIES[0].id);
  const [storeId, setStoreId] = useState(stores[0]?.id || '');
  const [locationInStore, setLocationInStore] = useState('Área de Cajas / Pasillo Principal');
  const [brand, setBrand] = useState('Carrier');
  const [model, setModel] = useState('X-Series 2026');
  const [serialNumber, setSerialNumber] = useState(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [status, setStatus] = useState<Equipment['status']>('operativo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId) || EQUIPMENT_CATEGORIES[0];
    const st = stores.find(s => s.id === storeId) || stores[0];
    const code = `${cat.shortCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      code,
      name,
      categoryId: cat.id,
      categoryName: cat.name,
      storeId: st.id,
      storeName: st.name,
      storeCode: st.code,
      locationInStore,
      brand,
      model,
      serialNumber,
      status,
      statusDetail: status === 'operativo' ? 'Calibrado y operativo' : 'En configuración',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: '2026-11-30',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'instalacion',
          technician: 'Ing. Supervisor Nacional',
          description: 'Registro de alta e inicialización en sistema CMMS.',
          cost: 0,
        }
      ]
    };

    onAddEquipment(newEq);
    onClose();
    alert(`✅ Equipo ${code} - ${name} registrado con éxito en el inventario.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
        <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
          <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            Alta de Nuevo Equipo en Inventario
          </h3>
          <button onClick={onClose} className="text-[#757682] p-1 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
              Nombre Descriptivo del Activo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sistema Chiller Enfriador Primario"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Categoría (20 Tipos)
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              >
                {EQUIPMENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Tienda Asignada (90)
              </label>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Marca
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Modelo
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Número de Serie
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                Ubicación en Tienda
              </label>
              <input
                type="text"
                required
                value={locationInStore}
                onChange={e => setLocationInStore(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a]"
            >
              Registrar en CMMS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
