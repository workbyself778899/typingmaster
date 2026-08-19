import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Lesson from '@/models/Lesson';

// GET — List lessons with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'english';
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    await dbConnect();

    const filter: Record<string, unknown> = {
      isActive: true,
      language,
    };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const lessons = await Lesson.find(filter)
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: lessons.map((l) => ({
        id: l._id.toString(),
        title: l.title,
        description: l.description,
        language: l.language,
        keyboardLayout: l.keyboardLayout,
        difficulty: l.difficulty,
        category: l.category,
        targetKeys: l.targetKeys,
        minimumAccuracy: l.minimumAccuracy,
        minimumWpm: l.minimumWpm,
        order: l.order,
        estimatedMinutes: l.estimatedMinutes,
      })),
    });
  } catch (error) {
    console.error('List lessons error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve lessons' },
      { status: 500 }
    );
  }
}
