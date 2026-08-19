import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeystrokeData {
  character: string;
  expected: string;
  timestamp: number;
  isCorrect: boolean;
  latency: number;
}

export interface ITypingSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  language: string;
  keyboardLayout: string;
  mode: string;
  difficulty: string;
  duration: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  errors: number;
  backspaces: number;
  totalKeystrokes: number;
  textContent: string;
  textId?: string;
  lessonId?: mongoose.Types.ObjectId;
  keystrokeData: IKeystrokeData[];
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

const KeystrokeDataSchema = new Schema<IKeystrokeData>(
  {
    character: { type: String, required: true },
    expected: { type: String, required: true },
    timestamp: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    latency: { type: Number, required: true },
  },
  { _id: false }
);

const TypingSessionSchema = new Schema<ITypingSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    mode: {
      type: String,
      required: true,
      enum: ['free', 'speed', 'accuracy', 'weakness', 'lesson', 'daily', 'sprint', 'endurance'],
    },
    difficulty: {
      type: String,
      default: 'medium',
      enum: ['beginner', 'easy', 'medium', 'hard', 'expert'],
    },
    duration: { type: Number, required: true },
    grossWpm: { type: Number, required: true },
    netWpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    correctCharacters: { type: Number, required: true },
    incorrectCharacters: { type: Number, required: true },
    errors: { type: Number, default: 0 },
    backspaces: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    textContent: { type: String, required: true },
    textId: { type: String },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    keystrokeData: [KeystrokeDataSchema],
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying
TypingSessionSchema.index({ userId: 1, createdAt: -1 });
TypingSessionSchema.index({ userId: 1, language: 1 });
TypingSessionSchema.index({ userId: 1, keyboardLayout: 1 });
TypingSessionSchema.index({ userId: 1, mode: 1 });
TypingSessionSchema.index({ completedAt: -1 });

const TypingSession: Model<ITypingSession> =
  mongoose.models.TypingSession || mongoose.model<ITypingSession>('TypingSession', TypingSessionSchema);

export default TypingSession;
