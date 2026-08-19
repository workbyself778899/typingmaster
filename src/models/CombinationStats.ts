import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICombinationStats extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  combination: string; // e.g. 'th', 'he', 'ing'
  language: string;
  keyboardLayout: string;
  attempts: number;
  correct: number;
  incorrect: number;
  averageLatency: number;
  accuracy: number;
  weaknessScore: number;
  lastUpdated: Date;
}

const CombinationStatsSchema = new Schema<ICombinationStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    combination: { type: String, required: true },
    language: { type: String, required: true },
    keyboardLayout: { type: String, required: true },
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

CombinationStatsSchema.index(
  { userId: 1, combination: 1, language: 1, keyboardLayout: 1 },
  { unique: true }
);
CombinationStatsSchema.index({ userId: 1, weaknessScore: -1 });

const CombinationStats: Model<ICombinationStats> =
  mongoose.models.CombinationStats || mongoose.model<ICombinationStats>('CombinationStats', CombinationStatsSchema);

export default CombinationStats;
