import React, { useState } from 'react';
import { Lock, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { AppUser } from '../types';

interface ChangePasswordModalProps {
  user: AppUser;
  onClose?: () => void;
  onPasswordChanged: (updatedUser: AppUser) => void;
  isMandatory?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  onClose,
  onPasswordChanged,
  isMandatory = false
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate current password if user had an existing password
    if (user.password && currentPassword !== user.password) {
      setError('La contraseña actual ingresada no coincide.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword === user.password) {
      setError('La nueva contraseña debe ser distinta a la contraseña temporal o actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifíquelas e intente de nuevo.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const updatedUser: AppUser = {
        ...user,
        password: newPassword,
        mustChangePassword: false
      };

      setSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => {
        setIsSubmitting(false);
        onPasswordChanged(updatedUser);
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isMandatory ? 'Cambio de Contraseña Requerido' : 'Cambiar Contraseña'}
              </h3>
              <p className="text-xs text-blue-200">
                {user.email || user.username || 'Usuario OnSite'}
              </p>
            </div>
          </div>
          {!isMandatory && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {isMandatory && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Por seguridad:</span> Se le ha asignado una clave temporal de inicio. Debe definir su propia contraseña personal para continuar.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña Actual o Temporal
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Ingrese su clave actual"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nueva Contraseña (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva clave secreta"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Vuelva a escribir la nueva clave"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00236f] hover:bg-[#1a3882] transition-colors cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
