'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose, label = "Capturar Imagen" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Iniciar cámara y obtener ubicación al montar
  useEffect(() => {
    startCamera();
    getGeolocation();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment', // Usar cámara trasera por defecto
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accediendo a la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
        },
        (err) => {
          console.warn("Error obteniendo ubicación:", err);
          setLocation({ lat: "N/A", lng: "N/A" });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Ajustar dimensiones del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame del video
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Añadir marca de agua
    const now = new Date();
    const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    const locStr = location ? `GPS: ${location.lat}, ${location.lng}` : "Obteniendo GPS...";
    
    // Configuración de estilo para la marca de agua
    const padding = 20;
    const rectHeight = 60;
    const fontSize = Math.max(14, canvas.width / 40);
    
    // Rectángulo de fondo (negro semitransparente)
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, canvas.height - rectHeight, canvas.width, rectHeight);

    // Texto de marca de agua
    context.fillStyle = "white";
    context.font = `bold ${fontSize}px sans-serif`;
    context.textBaseline = "middle";
    
    context.fillText(dateStr, padding, canvas.height - rectHeight / 2 - fontSize / 1.5);
    context.fillText(locStr, padding, canvas.height - rectHeight / 2 + fontSize / 1.5);

    // Convertir a base64 para vista previa
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    setIsLoading(false);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Convertir dataURL a Blob para el envío
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          onCapture(blob); // Enviamos el blob
          onClose();
        });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        
        {/* Cabecera */}
        <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-10">
          <h3 className="text-white font-bold text-sm tracking-widest uppercase bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            {label}
          </h3>
          <button 
            onClick={onClose}
            className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all backdrop-blur-md border border-red-500/30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Visor / Vista Previa */}
        <div className="relative aspect-[3/4] bg-black flex items-center justify-center">
          {!capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                  <p className="text-red-400 font-medium bg-black/60 p-4 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                    {error}
                  </p>
                </div>
              )}
            </>
          ) : (
            <img 
              src={capturedImage} 
              alt="Capturada" 
              className="w-full h-full object-cover"
            />
          )}

          {/* Canvas oculto para procesamiento */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controles Inferiores */}
        <div className="p-8 bg-slate-900/90 backdrop-blur-xl border-t border-white/5">
          {!capturedImage ? (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={capturePhoto}
                disabled={!!error || isLoading}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-slate-900/10"></div>
                </div>
              </button>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                {isLoading ? "Procesando..." : "Presione para Capturar"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleRetake}
                className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all active:scale-95"
              >
                <RefreshCw size={18} />
                REPETIR
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center justify-center gap-3 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                <Check size={18} />
                USAR FOTO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
