import mongoose from 'mongoose';

const VehiculoSchema = new mongoose.Schema({
  placa: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  marca: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    required: true,
  },
  fechaSoat: {
    type: Date,
  },
  fechaTecno: {
    type: Date,
  },
  fechaImpuesto: {
    type: Date,
  },
  enlace_foto: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Vehiculo = mongoose.models.Vehiculo || mongoose.model('Vehiculo', VehiculoSchema);
