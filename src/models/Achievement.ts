import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'streak' | 'practice' | 'milestone' | 'language';
  requirement: {
    type: string;
    value: number;
    language?: string;
  };
  xpReward: number;
  createdAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['speed', 'accuracy', 'streak', 'practice', 'milestone', 'language'],
    },
    requirement: {
      type: { type: String, required: true },
      value: { type: Number, required: true },
      language: { type: String },
    },
    xpReward: { type: Number, default: 50 },
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ category: 1 });

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default Achievement;
