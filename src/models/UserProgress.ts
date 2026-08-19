import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  attempts: number;
  bestWpm: number;
  bestAccuracy: number;
  completion: number; // 0-100 percentage
  isCompleted: boolean;
  lastAttempt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    attempts: { type: Number, default: 0 },
    bestWpm: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAttempt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, isCompleted: 1 });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;
