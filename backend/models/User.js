const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  // Strict requirement from Auth Wireframe:
  loginId: { type: String, required: true, unique: true, minlength: 6, maxlength: 12 },
  role: { type: String, enum: ['MANAGER', 'STAFF'], default: 'STAFF' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);