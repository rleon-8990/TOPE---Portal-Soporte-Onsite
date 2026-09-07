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
  const [brand, setBrand] = useState('NCR');
  const [model, setModel] = useState('RealPOS XR7 Plus');
  const [serialNumber, setSerialNumber] = useState(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [status, setStatus] = useState<Equipment['status']>('operativo');

  // Network & Switch link state
  const [showNetworkFields, setShowNetworkFields] = useState(false);
  const [hostName, setHostName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [switchName, setSwitchName] = useState('SW-DATA-01-FL2');
  const [puertoSwitch, setPuertoSwitch] = useState('Gi1/0/12');
  const [vlan, setVlan] = useState('VLAN 100 - POS');
  const [macAddress, setMacAddress] = useState('');
  const [gateway, setGateway] = useState('10.24.10.1');
  const [centroCostos, setCentroCostos] = useState('T-014-SISTEMAS');
  const [partNumber, setPartNumber] = useState('7702-MC-1000');
  const [procesador, setProcesador] = useState('Intel Core i5-7500T 2.70GHz');
  const [memoriaRam, setMemoriaRam] = useState('8 GB DDR4');
  const [discoDuro, setDiscoDuro] = useState('256 GB SSD');
  const [sistemaOperativo, setSistemaOperativo] = useState('Windows 10 IoT Enterprise 64-bit');
  const [costoServicio, setCostoServicio] = useState(9.86);

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
      storeCodeNumber: st.code.replace(/\D/g, ''),
      locationInStore,
      brand,
      model,
      serialNumber,
      status,
      statusDetail: status === 'operativo' ? 'Calibrado y operativo' : 'En configuración',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: '2026-11-30',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80',
      // Network & Infrastructure
      hostName: hostName || (name.includes('POS') ? `PE-T014-POS${Math.floor(10+Math.random()*90)}` : undefined),
      ipAddress: ipAddress || (switchName ? `10.24.10.${Math.floor(10+Math.random()*200)}` : undefined),
      switchName: switchName || undefined,
      puertoSwitch: puertoSwitch || undefined,
      vlan: vlan || undefined,
      macAddress: macAddress || '00:E0:4C:68:02:11',
      gateway: gateway || '10.24.10.1',
      linkStatus: 'up',
      centroCostos: centroCostos || 'T-014-SISTEMAS',
      partNumber: partNumber || '7702-MC-1000',
      procesador,
      memoriaRam,
      discoDuro,
      sistemaOperativo,
      costoServicio,
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'instalacion',
          technician: 'Ing. Soporte Onsite',
          description: 'Registro de alta en inventario e interconexión a switch de tienda.',
          cost: 0,
        }
      ]
    };

    onAddEquipment(newEq);
    onClose();
    alert(`✅ Equipo ${code} - ${name} registrado con éxito con enlace al switch ${switchName}.`);
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

          {/* Toggle Network & Infrastructure Fields */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowNetworkFields(!showNetworkFields)}
              className="w-full py-2 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-bold rounded-lg flex items-center justify-between transition-colors"
            >
              <span>⚙️ {showNetworkFields ? 'Ocultar' : 'Agregar'} Enlace a Switch & Datos TOPE (Opcional)</span>
              <span>{showNetworkFields ? '▲' : '▼'}</span>
            </button>

            {showNetworkFields && (
              <div className="mt-3 p-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-3 animate-fadeIn text-xs">
                <div className="font-bold text-[#00236f] text-[11px] uppercase tracking-wide">
                  Enlace de Red / Switch
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#757682] block">HostName</label>
                    <input
                      type="text"
                      placeholder="Ej. PE-T014-POS01"
                      value={hostName}
                      onChange={e => setHostName(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">Dirección IP</label>
                    <input
                      type="text"
                      placeholder="Ej. 10.24.10.15"
                      value={ipAddress}
                      onChange={e => setIpAddress(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">Switch de Comunicaciones</label>
                    <input
                      type="text"
                      placeholder="Ej. SW-DATA-01-FL2"
                      value={switchName}
                      onChange={e => setSwitchName(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">Puerto Switch & VLAN</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Gi1/0/12"
                        value={puertoSwitch}
                        onChange={e => setPuertoSwitch(e.target.value)}
                        className="w-1/2 p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                      />
                      <input
                        type="text"
                        placeholder="VLAN 100"
                        value={vlan}
                        onChange={e => setVlan(e.target.value)}
                        className="w-1/2 p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="font-bold text-[#00236f] text-[11px] uppercase tracking-wide pt-1 border-t border-[#e5eeff]">
                  Datos Corporativos de Infraestructura (TOPE)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#757682] block">Centro de Costos</label>
                    <input
                      type="text"
                      value={centroCostos}
                      onChange={e => setCentroCostos(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">Part Number (PN)</label>
                    <input
                      type="text"
                      value={partNumber}
                      onChange={e => setPartNumber(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">Procesador</label>
                    <input
                      type="text"
                      value={procesador}
                      onChange={e => setProcesador(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-[#c5c5d3] rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#757682] block">RAM / Disco</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={memoriaRam}
                        onChange={e => setMemoriaRam(e.target.value)}
                        className="w-1/2 p-1.5 text-xs bg-white border border-[#c5c5d3] rounded"
                      />
                      <input
                        type="text"
                        value={discoDuro}
                        onChange={e => setDiscoDuro(e.target.value)}
                        className="w-1/2 p-1.5 text-xs bg-white border border-[#c5c5d3] rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
