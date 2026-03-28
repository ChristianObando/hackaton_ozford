import mongoose from 'mongoose';

const ColaboradorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  documento: {
    type: String,
    required: true,
    unique: true,
  },
  area: {
    type: String,
  },
  licencias: [{
    tipo: String,
    vigencia: String, // String para simplificar el manejo de fechas desde el frontend
  }],
}, {
  timestamps: true,
});

export const Colaborador = mongoose.models.Colaborador || mongoose.model('Colaborador', ColaboradorSchema);
