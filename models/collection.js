// models/Spectacle.js

const mongoose = require('mongoose');

const spectacleSchema = new mongoose.Schema({
  name: { type: String, },
  gender: { type: String, enum: ['male', 'female', 'kids'], required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['sunglasses', 'eyeglasses', 'contactlenses'], required: true },
  image: { type: String, required: true }, // URL or path to the image
  description: { type: String },
  stock: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Spectacle = mongoose.model('Spectacle', spectacleSchema);

module.exports = Spectacle;
