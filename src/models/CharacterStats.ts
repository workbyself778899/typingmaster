import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICharacterStats extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  character: string;
  language: string;
  keyboardLayout: string;
  attempts: number;
  correct: number;
  incorrect: number;
  averageLatency: number;
  accuracy: number;
  weaknessScore: number; // 0-100, higher = weaker
  lastUpdated: Date;
}

const CharacterStatsSchema = new Schema<ICharacterStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    character: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    keyboardLayout: {
      type: String,
      required: true,
    },
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    averageLatency: { type: Number, default: 0 },
    accuracy: { type: Number, default: 100 },
    weaknessScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique character stats per user/language/layout
CharacterStatsSchema.index(
  { userId: 1, character: 1, language: 1, keyboardLayout: 1 },
  { unique: true }
);
CharacterStatsSchema.index({ userId: 1, weaknessScore: -1 });
CharacterStatsSchema.index({ userId: 1, language: 1, accuracy: 1 });

const CharacterStats: Model<ICharacterStats> =
  mongoose.models.CharacterStats || mongoose.model<ICharacterStats>('CharacterStats', CharacterStatsSchema);

export default CharacterStats;
