import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { forgotPasswordSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    await dbConnect();

    // Check if user exists (but always return success for security)
    const user = await User.findOne({ email });

    if (user) {
      // TODO: Generate reset token, save to user, and send email
      // For now, email sending is not configured.
      // When SMTP is set up, uncomment the email config in .env.local
      // and implement the actual email sending logic here.
      console.log(`Password reset requested for: ${email}`);
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
