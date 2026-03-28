import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    
    // Check if the connection is really active
    const state = mongoose.connection.readyState;
    const states = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };

    return Response.json({
      success: true,
      message: "Conexión a MongoDB establecida correctamente.",
      status: states[state] || "Unknown",
      dbName: mongoose.connection.name,
    }, { status: 200 });
  } catch (error) {
    console.error("Error connecting to database:", error);
    return Response.json({
      success: false,
      message: "No se pudo conectar a la base de datos.",
      error: error.message,
    }, { status: 500 });
  }
}
