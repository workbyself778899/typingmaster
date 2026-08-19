import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, createToken, setAuthCookie, updateStreak } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    await dbConnect();

    // Find user (include passwordHash for verification)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update streak
    await updateStreak(user._id.toString());

    // Create JWT
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    // Reload user to get updated streak
    const updatedUser = await User.findById(user._id).select('-passwordHash -resetToken -resetTokenExpiry');

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser!._id.toString(),
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        preferences: updatedUser!.preferences,
        xp: updatedUser!.xp,
        level: updatedUser!.level,
        streak: updatedUser!.streak,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
