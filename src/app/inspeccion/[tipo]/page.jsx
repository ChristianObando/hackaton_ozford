'use client'
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Gauge } from "lucide-react";

// USAMOS RUTA RELATIVA DIRECTA (Punto por punto)
// Desde src/app/inspeccion/[tipo]/page.jsx:
// .. sale de [tipo]
// .. sale de inspeccion
// .. sale de app (estamos en src)
// lib/items llega al archivo
import { itemConfiguracion } from "@/lib/items"; 
import InspectionItem from "@/components/InspeccionItem";
import { registrarResultadoInspeccion } from "@/app/server/cInspeccion";
import { useEffect } from "react";

export default function PaginaInspeccion() {
  const params = useParams();
  const router = useRouter();
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [fotos, setFotos] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colaborador, setColaborador] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);
  const [kilometraje, setKilometraje] = useState("");

  useEffect(() => {
    // Recuperar datos de la sesion actual del navegador
    const colCached = localStorage.getItem('colaborador_id');
    const vehCached = localStorage.getItem('vehiculo_placa');
    
    if (colCached) setColaborador(colCached);
    if (vehCached) setVehiculo(vehCached);
  }, []);

  const handleFinalizar = async () => {
    if (!colaborador || !vehiculo) {
      alert("Error: No se encontró información del colaborador o vehículo.");
      return;
    }

    if (!kilometraje) {
      alert("Por favor ingrese el kilometraje del vehículo.");
      return;
    }

    // Verificar que todas las preguntas han sido respondidas
    const itemsConfig = config.items;
    const respondidas = Object.keys(respuestas).length;
    
    if (respondidas < itemsConfig.length) {
       alert("Por favor responda todos los items de la inspección.");
       return;
    }

    // NUEVO: Validar que todas tengan foto
    const fotosCapturadas = Object.values(fotos).filter(f => f !== null).length;
    if (fotosCapturadas < itemsConfig.length) {
       alert("Debe adjuntar una foto de evidencia para cada ítem de la inspección.");
       return;
    }

    setIsSubmitting(true);
    try {
      // 1. Subir todas las fotos a Cloudinary
      const uploadedPhotos = {};
      
      const fotoIds = Object.keys(fotos);
      for (const itemId of fotoIds) {
        const file = fotos[itemId];
        if (file instanceof File) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/cargaImagenes", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            uploadedPhotos[itemId] = data.url;
            console.log(`Foto subida exitosamente para el item: ${itemId}`);
          } else {
             console.error(`Error al subir foto del item ${itemId}:`, await res.text());
             throw new Error(`No se pudo subir la foto del elemento: ${itemId}`);
          }
        }
      }

      // 2. Combinar estados para el payload final
      const listadoChecklist = {};
      config.items.forEach(item => {
        listadoChecklist[item.id] = {
           status: respuestas[item.id],
           observacion: observaciones[item.id] || "",
           enlace_foto: uploadedPhotos[item.id] || "" // Guardamos la URL de Cloudinary
        };
      });

      const payload = {
        colaboradorDocumento: colaborador,
        vehiculoPlaca: vehiculo,
        tipoVehiculo: vehiculoId,
        kilometraje: Number(kilometraje),
        checklist: listadoChecklist
      };

      await registrarResultadoInspeccion(payload);
      alert("Inspección guardada correctamente con evidencias fotográficas.");
      router.push("/");
    } catch (error) {
       console.error("Error al guardar:", error);
       alert("Ocurrió un error: " + error.message);
    } finally {
       setIsSubmitting(false);
    }
  };
  
  const vehiculoId = params?.tipo; 
  const config = itemConfiguracion ? itemConfiguracion[vehiculoId] : null;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-ozford-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error de carga</h1>
          <p className="text-gray-500">No se encontró configuración para: {vehiculoId}</p>
          <button onClick={() => router.push('/')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ozford-bg font-sans pb-20">
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-ozford-text mb-6 font-bold group">
          <ArrowLeft size={20} /> Volver al Selector
        </button>

        <div className="bg-ozford-white dark:border-white/5 rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ozford-primary to-ozford-accent"></div>
          <h2 className="text-3xl font-extrabold text-ozford-title flex items-center gap-3">
            <ShieldCheck className="text-ozford-accent" size={32} />
            {config.titulo}
          </h2>
        </div>

        <div className="bg-ozford-white dark:border-white/5 rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <label className="block text-ozford-title font-bold mb-3 flex items-center gap-2">
            <Gauge size={20} className="text-ozford-accent" />
            Kilometraje Actual
          </label>
          <input 
            type="number" 
            placeholder="Ingrese el kilometraje"
            value={kilometraje}
            onChange={(e) => setKilometraje(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-6 text-xl font-bold text-ozford-title dark:text-white dark:placeholder-white/30 focus:ring-2 focus:ring-ozford-accent outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          {config.items.map((item) => (
            <InspectionItem 
              key={item.id}
              label={item.nombre}
              value={respuestas[item.id]} 
              onChange={(val) => setRespuestas(prev => ({...prev, [item.id]: val}))}
              observacion={observaciones[item.id]}
              onObservacionChange={(val) => setObservaciones(prev => ({...prev, [item.id]: val}))}
              foto={fotos[item.id]}
              onFotoChange={(val) => setFotos(prev => ({...prev, [item.id]: val}))}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-10 pb-10 flex flex-col items-center">
            <button 
               onClick={handleFinalizar}
               disabled={isSubmitting}
               className="w-full bg-ozford-accent hover:bg-ozford-primary text-white font-bold py-5 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group text-xl"
            >
              {isSubmitting ? "Guardando reporte..." : "Finalizar Inspección"}
              {!isSubmitting && (
                <ShieldCheck size={24} />
              )}
            </button>
            <p className="mt-4 text-ozford-text/60 text-sm font-medium">Al finalizar el reporte, quedará registrado con su firma electrónica vinculada a su documento.</p>
        </div>
      </main>
    </div>
  );
}