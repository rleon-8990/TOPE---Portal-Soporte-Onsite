import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Eye } from 'lucide-react';

interface SignaturePadProps {
  id?: string;
  label: string;
  placeholderName?: string;
  signatoryName?: string;
  onNameChange?: (name: string) => void;
  value?: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  id,
  label,
  placeholderName = 'Nombre completo del firmante',
  signatoryName,
  onNameChange,
  value,
  onChange,
  required = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isEditing, setIsEditing] = useState(!value);

  useEffect(() => {
    if (!value) {
      setIsEditing(true);
      setHasDrawn(false);
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00236f';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    if ('touches' in e) {
      e.preventDefault(); // prevent scroll on touch
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    onChange('');
    setIsEditing(true);
  };

  return (
    <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#00236f] flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-[#00236f]" />
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
        {value && !isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[11px] text-[#00236f] hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Cambiar Firma
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {onNameChange && (
        <input
          type="text"
          value={signatoryName || ''}
          onChange={e => onNameChange(e.target.value)}
          placeholder={placeholderName}
          className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-[#0b1c30] placeholder:text-[#757682] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
        />
      )}

      {value && !isEditing ? (
        <div className="bg-white border border-[#dce9ff] rounded-lg p-2 flex flex-col items-center justify-center">
          <img
            src={value}
            alt={`Firma de ${label}`}
            className="max-h-24 max-w-full object-contain"
          />
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <Check className="w-3 h-3" /> Firma digital registrada
          </span>
        </div>
      ) : (
        <div className="relative bg-white border-2 border-dashed border-[#b4c8f0] rounded-lg overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            id={id}
            width={380}
            height={110}
            className="w-full h-28 cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#757682]/60 text-xs">
              <span>Dibuje su firma aquí con el mouse o dedo</span>
              <div className="w-32 border-b border-gray-300 mt-6" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
