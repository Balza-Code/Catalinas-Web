import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  metaSemanal: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
