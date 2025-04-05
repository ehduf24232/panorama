import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  interest: {
    type: String,
    required: true,
    enum: ['아파트', '주택', '토지', '상가']
  },
  budget: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Consultation', consultationSchema); 