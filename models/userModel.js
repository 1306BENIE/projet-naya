
import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    password: { type: String, required: true },
    adresse: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    role: { 
      type: String, 
      enum: ['client', 'manager', 'admin', 'coursier'], 
      required: true 
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
