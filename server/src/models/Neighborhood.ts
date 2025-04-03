import mongoose from 'mongoose';

const neighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
});

export default mongoose.model('Neighborhood', neighborhoodSchema); 