'use client'
import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Camera, X, CheckCircle } from 'lucide-react';
import CameraCapture from './CameraCapture';

export default function InspectionItem({ label, value, onChange, observacion, onObservacionChange, foto, onFotoChange }) {
  const [showCamera, setShowCamera] = useState(false);

  // Opciones del semáforo con los colores de Oszford
  const options = [
    { 
      id: 'pasa', 
      icon: <CheckCircle2 size={20} />, 
      color: 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-600', 
      label: 'Pasa' 
    },
    { 
      id: 'novedad', 
      icon: <AlertCircle size={20} />, 
      color: 'peer-checked:bg-yellow-500 peer-checked:text-white peer-checked:border-yellow-600', 
      label: 'Novedad' 
    },
    { 
      id: 'no-pasa', 
      icon: <XCircle size={20} />, 
      color: 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-600', 
      label: 'No Pasa' 
    },
  ];

  const handleCapture = (blob) => {
    if (blob) {
      const file = new File([blob], `evidencia_${label}.jpg`, { type: 'image/jpeg' });
      onFotoChange(file);
    }
  };

  const previewSource = React.useMemo(() => {
    if (foto instanceof File) return URL.createObjectURL(foto);
    return foto;
  }, [foto]);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
      
      {/* Etiqueta del Ítem */}
      <span className="font-bold text-ozford-title dark:text-white text-base tracking-tight ml-1">
        {label}
      </span>
      
      {/* Selector de Semáforo */}
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <label key={opt.id} className="cursor-pointer">
            <input
              type="radio"
              name={label}
              value={opt.id}
              className="peer hidden"
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800 text-gray-400 transition-all duration-200 ${opt.color}`}>
              {opt.icon}
              <span className="text-[10px] uppercase font-black tracking-widest">
                {opt.label}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* --- SECCIÓN DE EVIDENCIA (Visible si hay algo seleccionado) --- */}
      {value && (
        <div className="mt-2 p-4 bg-ozford-bg dark:bg-slate-950 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 space-y-4">
          
          {(value === 'novedad' || value === 'no-pasa') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-ozford-text/60 ml-1">Observaciones / Causa</label>
              <textarea
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm outline-none focus:border-ozford-accent transition-all resize-none"
                rows={2}
                placeholder="Explique la causa de la novedad o falla..."
                value={observacion || ""}
                onChange={(e) => onObservacionChange(e.target.value)}
              />
            </div>
          )}

          {showCamera && (
            <CameraCapture 
              onCapture={handleCapture} 
              onClose={() => setShowCamera(false)} 
              label={`Evidencia: ${label}`}
            />
          )}

          {!foto ? (
            <button 
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center justify-center gap-3 w-full py-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-black text-ozford-accent shadow-sm active:scale-95 transition-all"
            >
              <Camera size={20} />
              TOMAR EVIDENCIA FOTOGRÁFICA
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-ozford-accent shadow-md">
                <img src={previewSource} alt="Evidencia" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => onFotoChange(null)}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-xl"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> FOTO CAPTURADA EN VIVO
                </p>
                <p className="text-[10px] text-ozford-text/50 mt-1 italic">
                  La imagen incluye marca de agua con Fecha y GPS.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}