import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  neighborhoodId: { type: String, required: true },
  address: { type: String, required: true },
  floors: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' }
});

const Building = mongoose.model('Building', buildingSchema);
export default Building; 