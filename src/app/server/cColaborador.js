'use server'

import { connectDB } from "@/lib/db";
import { Colaborador } from "@/models/Colaborador";

export async function getColaboradores() {
    try {
        await connectDB();
        const colaboradores = await Colaborador.find();
        return JSON.parse(JSON.stringify(colaboradores));
    } catch (error) {
        console.error("Error al obtener colaboradores:", error);
        throw error;
    }
}

export async function registrarColaborador(data) {
    try {
        await connectDB();
        const existe = await Colaborador.findOne({ documento: data.documento });
        if (existe) {
            throw new Error('Ya existe un colaborador con este documento.');
        }
        const nuevo = await Colaborador.create(data);
        return JSON.parse(JSON.stringify(nuevo));
    } catch (error) {
        console.error("Error al registrar colaborador:", error);
        throw error;
    }
}

export async function buscarColaboradorPorDocumento(documento) {
    try {
        await connectDB();
        const colaborador = await Colaborador.findOne({ documento });
        return JSON.parse(JSON.stringify(colaborador));
    } catch (error) {
        console.error("Error al buscar colaborador por documento:", error);
        throw error;
    }
}