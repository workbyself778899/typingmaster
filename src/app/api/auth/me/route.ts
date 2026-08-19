import { NextResponse } from 'next/server';
import { getCurrentUser, xpToNextLevel } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        xpToNextLevel: xpToNextLevel(user.xp, user.level),
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
