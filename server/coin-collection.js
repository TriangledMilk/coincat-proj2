import mongoose from 'mongoose';

const coinEntrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  circulation_or_bullion: { type: String, required: true, enum: ['circulation', 'bullion'] },
  gold_or_silver: { type: String, required: true, enum: ['gold', 'silver'] },
  purity: { type: Number, required: true, min: 0, max: 1 },
  count: { type: Number, required: true, min: 0, validate: Number.isInteger },
  weight_g: { type: Number, required: true, min: 0 },
  weight_toz: { type: Number, required: true, min: 0 },
  AMW_toz: { type: Number, required: true, min: 0 },
  number: { type: Number, required: true, min: 0, validate: Number.isInteger },
  production_run: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 }
}, { collection: 'SDP2_coin_collection', autoIndex: false });

export const CoinEntry = mongoose.models.CoinEntry || mongoose.model('CoinEntry', coinEntrySchema);
