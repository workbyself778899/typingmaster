import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: {
    preferredLanguage: string;
    preferredKeyboard: string;
    dailyGoal: number;
    soundEnabled: boolean;
    keyboardVisible: boolean;
    theme: string;
    showFingerGuide: boolean;
    fontSize: string;
  };
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      preferredLanguage: { type: String, default: 'english' },
      preferredKeyboard: { type: String, default: 'qwerty' },
      dailyGoal: { type: Number, default: 15 },
      soundEnabled: { type: Boolean, default: true },
      keyboardVisible: { type: Boolean, default: true },
      theme: { type: String, default: 'system' },
      showFingerGuide: { type: Boolean, default: true },
      fontSize: { type: String, default: 'medium' },
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Remove sensitive fields from JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  return user;
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
