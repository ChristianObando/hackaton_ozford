import mongoose from 'mongoose';

const InspeccionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: [true, 'El tipo de inspección es requerido.'],
  },
  datos: {
    type: Object,
    required: [true, 'Los datos de la inspección son requeridos.'],
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  inspector: {
    type: String,
    required: [true, 'El inspector es requerido.'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Inspeccion || mongoose.model('Inspeccion', InspeccionSchema);
