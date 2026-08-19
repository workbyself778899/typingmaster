'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Timer,
  Flame,
  Trophy,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDuration } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface StatsData {
  totalSessions: number;
  totalTypingTime: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalCharacters: number;
  totalErrors: number;
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

export default function StatisticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
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

  const hasData = data && data.totalSessions > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <BarChart3 className="h-8 w-8 text-[hsl(var(--primary))]" />
          Statistics
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Your detailed typing performance analytics
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Zap, label: 'Best WPM', value: data?.bestWpm || 0, color: 'text-[hsl(var(--primary))]' },
          { icon: Target, label: 'Avg Accuracy', value: `${data?.averageAccuracy || 0}%`, color: 'text-[hsl(var(--success))]' },
          { icon: Timer, label: 'Total Time', value: formatDuration(data?.totalTypingTime || 0), color: 'text-[hsl(var(--info))]' },
          { icon: Flame, label: 'Streak', value: `${data?.currentStreak || 0} days`, color: 'text-[hsl(var(--warning))]' },
          { icon: Trophy, label: 'Avg WPM', value: data?.averageWpm || 0, color: 'text-[hsl(var(--chart-3))]' },
          { icon: Calendar, label: 'Total Tests', value: data?.totalSessions || 0, color: 'text-[hsl(var(--chart-4))]' },
          { icon: TrendingUp, label: 'Characters', value: (data?.totalCharacters || 0).toLocaleString(), color: 'text-[hsl(var(--chart-1))]' },
          { icon: Target, label: 'Best Accuracy', value: `${data?.bestAccuracy || 0}%`, color: 'text-[hsl(var(--success))]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label + i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="wpm" className="mt-8">
        <TabsList>
          <TabsTrigger value="wpm">WPM Trend</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy Trend</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="wpm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
                Words Per Minute — Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="averageWpm"
                      stroke="hsl(var(--primary))"
                      fill="url(#wpmGradient)"
                      strokeWidth={2}
                      name="Avg WPM"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-[hsl(var(--success))]" />
                Accuracy — Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis domain={[0, 100]} fontSize={12} stroke="hsl(var(--muted-foreground))" />
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
                      dataKey="averageAccuracy"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--success))' }}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-[hsl(var(--info))]" />
                Sessions Per Day — Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.chartData}>
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
                    <Bar
                      dataKey="sessions"
                      fill="hsl(var(--info))"
                      radius={[4, 4, 0, 0]}
                      name="Sessions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Sessions Table */}
      {hasData && data.recentSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="px-3 py-2 text-left font-medium text-[hsl(var(--muted-foreground))]">Date</th>
                      <th className="px-3 py-2 text-right font-medium text-[hsl(var(--muted-foreground))]">Net WPM</th>
                      <th className="px-3 py-2 text-right font-medium text-[hsl(var(--muted-foreground))]">Gross WPM</th>
                      <th className="px-3 py-2 text-right font-medium text-[hsl(var(--muted-foreground))]">Accuracy</th>
                      <th className="px-3 py-2 text-right font-medium text-[hsl(var(--muted-foreground))]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSessions.map((session) => (
                      <tr key={session.id} className="border-b border-[hsl(var(--border))] last:border-0">
                        <td className="px-3 py-2.5">
                          {new Date(session.createdAt).toLocaleDateString('en', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">{session.netWpm}</td>
                        <td className="px-3 py-2.5 text-right text-[hsl(var(--muted-foreground))]">{session.grossWpm}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={session.accuracy >= 95 ? 'text-[hsl(var(--success))]' : session.accuracy >= 85 ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--destructive))]'}>
                            {session.accuracy}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-[hsl(var(--muted-foreground))]">{session.duration}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[350px] items-center justify-center text-[hsl(var(--muted-foreground))]">
      <div className="text-center">
        <BarChart3 className="mx-auto mb-3 h-12 w-12 opacity-30" />
        <p className="font-medium">No data yet</p>
        <p className="mt-1 text-sm">Complete typing tests to see your progress here</p>
      </div>
    </div>
  );
}
