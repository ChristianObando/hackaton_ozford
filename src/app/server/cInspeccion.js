'use server'

import { connectDB } from "@/lib/db";
import { Inspeccion } from "@/models/Inspeccion";

export async function registrarResultadoInspeccion(data) {
    try {
        await connectDB();
        
        // Calcular si cumple (al menos uno en false indica no cumple?) 
        // Normalmente es si TODOS están OK o una lógica específica.
        // Aquí asumimos data.checklist es un objeto { item: boolean }
        const listaValores = Object.values(data.checklist);
        // Se considera que NO cumple si alguno tiene "no-pasa" en su status
        const cumpleTodo = !listaValores.some(v => 
          (typeof v === 'string' ? v : v.status) === "no-pasa"
        );

        const nueva = await Inspeccion.create({
            ...data,
            cumple: cumpleTodo
        });
        
        return JSON.parse(JSON.stringify(nueva));
    } catch (error) {
        console.error("Error al registrar reporte de inspección:", error);
        throw error;
    }
}

export async function getHistorialInspecciones(vehiculoPlaca) {
    try {
        await connectDB();
        const historial = await Inspeccion.find({ vehiculoPlaca }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(historial));
    } catch (error) {
        console.error("Error al obtener historial:", error);
        throw error;
    }
}
