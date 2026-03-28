'use server'

import { connectDB } from "@/lib/db";
import { Vehiculo } from "@/models/Vehiculo";

export async function getVehiculos() {
    try {
        await connectDB();
        const vehiculos = await Vehiculo.find();
        return JSON.parse(JSON.stringify(vehiculos));
    } catch (error) {
        console.error("Error al obtener vehículos:", error);
        throw error;
    }
}

export async function registrarVehiculo(data) {
    try {
        await connectDB();
        const placaLimpia = data.placa.toUpperCase().trim();
        const existe = await Vehiculo.findOne({ placa: placaLimpia });
        if (existe) {
            throw new Error('Ya existe un vehículo con esta placa.');
        }
        const nuevo = await Vehiculo.create({ ...data, placa: placaLimpia });
        return JSON.parse(JSON.stringify(nuevo));
    } catch (error) {
        console.error("Error al registrar vehículo:", error);
        throw error;
    }
}

export async function buscarVehiculoPorPlaca(placa) {
    try {
        await connectDB();
        const placaLimpia = placa.toUpperCase().trim();
        const vehiculo = await Vehiculo.findOne({ placa: placaLimpia });
        return JSON.parse(JSON.stringify(vehiculo));
    } catch (error) {
        console.error("Error al buscar vehículo:", error);
        throw error;
    }
}
