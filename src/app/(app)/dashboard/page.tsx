'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  Timer,
  Flame,
  Keyboard,
  GraduationCap,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { formatDuration, formatDate, xpForLevel } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalSessions: number;
  totalTypingTime: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  currentStreak: number;
  level: number;
  xp: number;
  chartData: { date: string; averageWpm: number; averageAccuracy: number; sessions: number }[];
  recentSessions: {
    id: string;
    netWpm: number;
    grossWpm: number;
    accuracy: number;
    duration: number;
    createdAt: string;
  }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/sessions/stats');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  const xpNeeded = user ? xpForLevel(user.level + 1) : 100;
  const xpCurrent = user ? user.xp : 0;
  // Calculate XP progress within current level
  let totalXpForLevel = 0;
  for (let i = 1; i <= (user?.level || 1); i++) totalXpForLevel += xpForLevel(i);
  const xpInLevel = xpCurrent - (totalXpForLevel - xpForLevel(user?.level || 1));
  const xpProgress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name?.split(' ')[0] || 'Typist'} 👋
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Here&apos;s your typing performance overview
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Zap,
            label: 'Best WPM',
            value: data?.bestWpm || 0,
            sub: `Avg: ${data?.averageWpm || 0}`,
            color: 'text-[hsl(var(--primary))]',
            bg: 'from-[hsl(var(--primary)/0.08)]',
          },
          {
            icon: Target,
            label: 'Best Accuracy',
            value: `${data?.bestAccuracy || 0}%`,
            sub: `Avg: ${data?.averageAccuracy || 0}%`,
            color: 'text-[hsl(var(--success))]',
            bg: 'from-[hsl(var(--success)/0.08)]',
          },
          {
            icon: Flame,
            label: 'Current Streak',
            value: `${data?.currentStreak || 0}`,
            sub: 'days in a row',
            color: 'text-[hsl(var(--warning))]',
            bg: 'from-[hsl(var(--warning)/0.08)]',
          },
          {
            icon: Timer,
            label: 'Total Practice',
            value: formatDuration(data?.totalTypingTime || 0),
            sub: `${data?.totalSessions || 0} sessions`,
            color: 'text-[hsl(var(--info))]',
            bg: 'from-[hsl(var(--info)/0.08)]',
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
            <Card className={`border-transparent bg-gradient-to-br ${stat.bg} to-transparent`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--card))] shadow-sm ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* XP Bar */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <Card className="mt-6">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-sm">
              {user?.level || 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Level {user?.level || 1}</span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {xpInLevel} / {xpNeeded} XP
                </span>
              </div>
              <Progress value={xpProgress} className="mt-1.5 h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid: Chart + Recent Sessions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* WPM Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
                WPM Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageWpm"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                      name="Avg WPM"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="text-sm">Complete your first test to see your progress</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentSessions && data.recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {data.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                    >
                      <div>
                        <p className="font-medium">{session.netWpm} WPM</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[hsl(var(--success))]">{session.accuracy}%</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{session.duration}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                  No sessions yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7} className="mt-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <h3 className="mr-auto font-semibold">Quick Start</h3>
            <Link href="/typing">
              <Button className="gap-2">
                <Keyboard className="h-4 w-4" />
                Speed Test
              </Button>
            </Link>
            <Link href="/lessons">
              <Button variant="outline" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Lessons
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Practice
              </Button>
            </Link>
            <Link href="/statistics">
              <Button variant="ghost" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Full Stats
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
