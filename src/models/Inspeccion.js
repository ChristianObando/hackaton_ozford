import mongoose from 'mongoose';

const InspeccionSchema = new mongoose.Schema({
  colaboradorDocumento: {
    type: String,
    required: true,
  },
  vehiculoPlaca: {
    type: String,
    required: true,
  },
  tipoVehiculo: {
    type: String,
    required: true,
  },
  checklist: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  cumple: {
    type: Boolean,
    default: true,
  },
  kilometraje: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const Inspeccion = mongoose.models.Inspeccion || mongoose.model('Inspeccion', InspeccionSchema);
