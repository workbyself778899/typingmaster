import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  language: string;
  keyboardLayout: string;
  difficulty: string;
  category: string;
  content: string[];
  targetKeys: string[];
  targetCombinations: string[];
  minimumAccuracy: number;
  minimumWpm: number;
  order: number;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Lesson description is required'],
      trim: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['english', 'nepali-unicode', 'nepali-preeti', 'nepali-kantipur'],
    },
    keyboardLayout: {
      type: String,
      required: true,
      enum: ['qwerty', 'nepali-unicode', 'preeti', 'kantipur'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'easy', 'medium', 'hard', 'expert'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'home-row',
        'top-row',
        'bottom-row',
        'capitals',
        'numbers',
        'punctuation',
        'common-words',
        'sentences',
        'speed-drill',
        'accuracy-drill',
        'finger-training',
        'combinations',
      ],
    },
    content: [{ type: String }],
    targetKeys: [{ type: String }],
    targetCombinations: [{ type: String }],
    minimumAccuracy: { type: Number, default: 90 },
    minimumWpm: { type: Number, default: 20 },
    order: { type: Number, required: true },
    estimatedMinutes: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

LessonSchema.index({ language: 1, keyboardLayout: 1, order: 1 });
LessonSchema.index({ language: 1, difficulty: 1 });
LessonSchema.index({ category: 1 });

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
