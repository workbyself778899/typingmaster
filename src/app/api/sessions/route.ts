import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import TypingSession from '@/models/TypingSession';
import { getCurrentUser, addXp, updateStreak } from '@/lib/auth';
import { createSessionSchema } from '@/lib/validation/schemas';

// POST — Save a typing session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to save sessions' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = createSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const session = await TypingSession.create({
      userId: user._id,
      ...result.data,
    });

    // Award XP based on performance
    const xpEarned = calculateXp(result.data.netWpm, result.data.accuracy, result.data.duration);
    await addXp(user._id.toString(), xpEarned);
    await updateStreak(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        data: {
          id: session._id.toString(),
          xpEarned,
        },
        message: `Session saved! +${xpEarned} XP`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

// GET — List user sessions with pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const skip = (page - 1) * limit;

    await dbConnect();

    const [sessions, total] = await Promise.all([
      TypingSession.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-keystrokeData')
        .lean(),
      TypingSession.countDocuments({ userId: user._id }),
    ]);

    return NextResponse.json({
      success: true,
      data: sessions.map((s) => ({
        id: s._id.toString(),
        language: s.language,
        keyboardLayout: s.keyboardLayout,
        mode: s.mode,
        duration: s.duration,
        grossWpm: s.grossWpm,
        netWpm: s.netWpm,
        accuracy: s.accuracy,
        correctCharacters: s.correctCharacters,
        incorrectCharacters: s.incorrectCharacters,
        errors: s.errors,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('List sessions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve sessions' },
      { status: 500 }
    );
  }
}

// ===== XP Calculation =====
function calculateXp(wpm: number, accuracy: number, duration: number): number {
  let xp = 10; // base XP for completing a test
  xp += Math.floor(wpm / 10) * 5; // 5 XP per 10 WPM
  if (accuracy >= 95) xp += 15;
  else if (accuracy >= 90) xp += 10;
  else if (accuracy >= 80) xp += 5;
  if (duration >= 60) xp += 5; // bonus for longer tests
  if (duration >= 120) xp += 5;
  return xp;
}
