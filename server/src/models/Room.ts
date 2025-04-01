import mongoose from 'mongoose';

const panoramaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: ''
  }
});

const roomSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  panoramas: {
    type: [panoramaSchema],
    default: [],
    validate: {
      validator: function(panoramas: any[]) {
        return panoramas.length <= 10;
      },
      message: '파노라마 이미지는 최대 10개까지만 등록할 수 있습니다.'
    }
  }
});

export default mongoose.model('Room', roomSchema); 