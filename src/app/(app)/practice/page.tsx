'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  AlertTriangle,
  Timer,
  Keyboard,
  ArrowRight,
  Flame,
  Trophy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const practiceModesData = [
  {
    id: 'speed',
    title: 'Speed Focus',
    description: 'Push your typing speed to the limit. Focus on raw WPM with common words and sentences.',
    icon: Zap,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-[hsl(var(--primary)/0.06)]',
    href: '/typing?mode=speed',
    tips: ['Use familiar word patterns', 'Keep your rhythm steady', 'Minimize pauses between words'],
  },
  {
    id: 'accuracy',
    title: 'Accuracy Focus',
    description: 'Achieve perfect accuracy. Every mistake matters — slow down and get every character right.',
    icon: Target,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-[hsl(var(--success)/0.06)]',
    href: '/typing?mode=accuracy',
    tips: ['Slow down if needed', 'Focus on each character', 'Avoid using backspace'],
  },
  {
    id: 'weakness',
    title: 'Weak Keys Practice',
    description: 'Target your most-missed keys and character combinations to strengthen weak areas.',
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'from-[hsl(var(--warning)/0.06)]',
    href: '/typing?mode=weakness',
    tips: ['Focus on problem keys', 'Practice finger positioning', 'Repeat until comfortable'],
  },
  {
    id: 'sprint',
    title: 'Sprint Mode',
    description: 'Short 15-second bursts of intense typing. Great for warming up or quick practice.',
    icon: Timer,
    gradient: 'from-red-500 to-pink-600',
    bg: 'from-[hsl(var(--destructive)/0.06)]',
    href: '/typing?duration=15',
    tips: ['Maximum speed for 15 seconds', 'Great warm-up exercise', 'Compare sprint scores'],
  },
  {
    id: 'endurance',
    title: 'Endurance Mode',
    description: 'A longer 2-minute test to build sustained typing stamina and consistency.',
    icon: Flame,
    gradient: 'from-purple-500 to-violet-600',
    bg: 'from-[hsl(var(--chart-1)/0.06)]',
    href: '/typing?duration=120',
    tips: ['Maintain consistent speed', 'Dont rush at the start', 'Build stamina over time'],
  },
  {
    id: 'challenge',
    title: 'Expert Challenge',
    description: 'Advanced vocabulary and complex sentences. Test your skills at the highest difficulty.',
    icon: Trophy,
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'from-[hsl(var(--chart-3)/0.06)]',
    href: '/typing?difficulty=expert',
    tips: ['Advanced vocabulary', 'Technical terminology', 'Complex word patterns'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Keyboard className="h-8 w-8 text-[hsl(var(--primary))]" />
          Practice Modes
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Choose a practice mode that fits your goals
        </p>
      </motion.div>

      {/* Practice Mode Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {practiceModesData.map((mode, i) => (
          <motion.div
            key={mode.id}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <Card className={`group h-full border-[hsl(var(--border))] bg-gradient-to-br ${mode.bg} to-transparent transition-all hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)]`}>
              <CardContent className="flex h-full flex-col p-6">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mode.gradient} text-white shadow-lg`}
                >
                  <mode.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold">{mode.title}</h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{mode.description}</p>

                {/* Tips */}
                <ul className="mt-4 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {mode.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--primary)/0.4)]" />
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <Link href={mode.href}>
                    <Button className="w-full gap-2 group-hover:shadow-md transition-shadow">
                      Start Practice
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
