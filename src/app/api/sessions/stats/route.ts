import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import TypingSession from '@/models/TypingSession';
import { getCurrentUser } from '@/lib/auth';

// GET — Aggregate stats for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = user._id;

    // Aggregate pipeline
    const [stats] = await TypingSession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalTypingTime: { $sum: '$duration' },
          averageWpm: { $avg: '$netWpm' },
          bestWpm: { $max: '$netWpm' },
          averageAccuracy: { $avg: '$accuracy' },
          bestAccuracy: { $max: '$accuracy' },
          totalCharacters: { $sum: { $add: ['$correctCharacters', '$incorrectCharacters'] } },
          totalErrors: { $sum: '$errors' },
        },
      },
    ]);

    // Recent sessions for chart data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await TypingSession.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: 1 })
      .select('netWpm grossWpm accuracy createdAt duration')
      .lean();

    // Daily aggregated chart data
    const dailyData = new Map<string, { wpm: number[]; accuracy: number[] }>();
    recentSessions.forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      if (!dailyData.has(day)) {
        dailyData.set(day, { wpm: [], accuracy: [] });
      }
      const entry = dailyData.get(day)!;
      entry.wpm.push(s.netWpm);
      entry.accuracy.push(s.accuracy);
    });

    const chartData = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      averageWpm: Math.round(data.wpm.reduce((a, b) => a + b, 0) / data.wpm.length),
      averageAccuracy: Math.round((data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length) * 100) / 100,
      sessions: data.wpm.length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSessions: stats?.totalSessions || 0,
        totalTypingTime: stats?.totalTypingTime || 0,
        averageWpm: Math.round(stats?.averageWpm || 0),
        bestWpm: stats?.bestWpm || 0,
        averageAccuracy: Math.round((stats?.averageAccuracy || 0) * 100) / 100,
        bestAccuracy: stats?.bestAccuracy || 0,
        totalCharacters: stats?.totalCharacters || 0,
        totalErrors: stats?.totalErrors || 0,
        currentStreak: user.streak,
        level: user.level,
        xp: user.xp,
        chartData,
        recentSessions: recentSessions.slice(-5).reverse().map((s) => ({
          id: s._id.toString(),
          netWpm: s.netWpm,
          grossWpm: s.grossWpm,
          accuracy: s.accuracy,
          duration: s.duration,
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}
