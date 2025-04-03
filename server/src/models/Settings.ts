import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  customLinkUrl: {
    type: String,
    default: 'https://example.com'
  },
  customLinkText: {
    type: String,
    default: '회사 홈페이지'
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 