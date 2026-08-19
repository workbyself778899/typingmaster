import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser, verifyPassword, hashPassword, xpToNextLevel } from '@/lib/auth';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validation/schemas';

// GET — Get full profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
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
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT — Update profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if it's a password change
    if (body.currentPassword) {
      const pwResult = changePasswordSchema.safeParse(body);
      if (!pwResult.success) {
        return NextResponse.json(
          { success: false, error: pwResult.error.errors[0].message },
          { status: 400 }
        );
      }

      await dbConnect();
      const fullUser = await User.findById(user._id);
      if (!fullUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const isValid = await verifyPassword(pwResult.data.currentPassword, fullUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      fullUser.passwordHash = await hashPassword(pwResult.data.newPassword);
      await fullUser.save();

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    }

    // Profile update
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    await dbConnect();
    const updateData: Record<string, unknown> = {};
    if (result.data.name) updateData.name = result.data.name;
    if (result.data.avatar !== undefined) updateData.avatar = result.data.avatar;
    if (result.data.preferences) {
      for (const [key, value] of Object.entries(result.data.preferences)) {
        if (value !== undefined) {
          updateData[`preferences.${key}`] = value;
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash -resetToken -resetTokenExpiry');

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser!._id.toString(),
        name: updatedUser!.name,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        preferences: updatedUser!.preferences,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
