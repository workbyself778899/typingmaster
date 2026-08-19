'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Keyboard,
  BarChart3,
  GraduationCap,
  Globe,
  Target,
  Trophy,
  ArrowRight,
  Timer,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ---------- animation helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ---------- data ---------- */
const features = [
  {
    icon: Timer,
    title: 'Real-time Speed Tracking',
    description:
      'Monitor your WPM, accuracy, and error rate in real time as you type. See instant feedback on every keystroke.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Globe,
    title: 'Multiple Languages',
    description:
      'Practice typing in English, Nepali Unicode, Preeti, and Kantipur layouts — all in one place.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: GraduationCap,
    title: 'Adaptive Lessons',
    description:
      'Structured lessons from home-row basics to advanced sentences, adapting to your skill level automatically.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description:
      'Detailed charts showing your WPM growth, accuracy trends, weak keys, and streaks over time.',
    gradient: 'from-purple-500 to-pink-600',
  },
];

const languages = [
  { name: 'English', flag: '🇺🇸', layout: 'QWERTY' },
  { name: 'Nepali Unicode', flag: '🇳🇵', layout: 'Unicode' },
  { name: 'Preeti', flag: '🇳🇵', layout: 'Preeti' },
  { name: 'Kantipur', flag: '🇳🇵', layout: 'Kantipur' },
];

const stats = [
  { label: 'Active Learners', value: '10K+', icon: Target },
  { label: 'Lessons Available', value: '200+', icon: GraduationCap },
  { label: 'Languages', value: '4', icon: Globe },
  { label: 'Achievements', value: '50+', icon: Trophy },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[hsl(var(--success)/0.06)] blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm shadow-sm"
          >
            <Flame className="h-4 w-4 text-[hsl(var(--warning))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              No login required — start typing instantly
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Master Your Typing,{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--info))] bg-clip-text text-transparent">
              One Key at a Time
            </span>
          </motion.h1>

          {/* Sub‑headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl"
          >
            Improve your typing speed and accuracy with adaptive lessons,
            real-time analytics, and support for English & Nepali typing — all
            for free.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/typing">
              <Button size="xl" className="gap-2 shadow-lg shadow-[hsl(var(--primary)/0.25)]">
                <Keyboard className="h-5 w-5" />
                Start Typing — No Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="xl" className="gap-2">
                Create Free Account
              </Button>
            </Link>
          </motion.div>

          {/* Animated keyboard illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-16 w-full max-w-3xl"
          >
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl shadow-[hsl(var(--primary)/0.08)]">
              {/* Simulated typing area */}
              <div className="rounded-xl bg-[hsl(var(--typing-bg))] p-6 font-mono text-lg leading-loose">
                <span className="text-[hsl(var(--typing-correct))]">The quick brown </span>
                <span className="border-b-2 border-[hsl(var(--typing-current))] bg-[hsl(var(--typing-current)/0.15)] px-0.5">f</span>
                <span className="text-[hsl(var(--typing-upcoming))]">ox jumps over the lazy dog</span>
              </div>
              {/* Simulated mini keyboard */}
              <div className="mt-4 flex justify-center gap-1.5">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(
                  (key, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.04, duration: 0.3 }}
                      className={`keyboard-key text-xs ${
                        key === 'F'
                          ? 'keyboard-key-active'
                          : ''
                      }`}
                    >
                      {key}
                    </motion.div>
                  )
                )}
              </div>
              <div className="mt-1.5 flex justify-center gap-1.5 pl-4">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(
                  (key, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.04, duration: 0.3 }}
                      className={`keyboard-key text-xs ${
                        key === 'F'
                          ? 'keyboard-key-active'
                          : ''
                      }`}
                    >
                      {key}
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ STATS STRIP ============ */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={i}
              className="flex flex-col items-center gap-2 text-center"
            >
              <stat.icon className="h-6 w-6 text-[hsl(var(--primary))]" />
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))]"
            >
              Features
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Everything You Need to Type Faster
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-4 max-w-2xl text-[hsl(var(--muted-foreground))]"
            >
              From beginner-friendly lessons to advanced analytics, TypingMaster
              gives you the tools to dramatically improve your typing.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i}>
                <Card className="group relative h-full overflow-hidden border-[hsl(var(--border))] transition-shadow hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.06)]">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {feature.description}
                    </p>
                  </CardContent>
                  {/* Hover shimmer */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ LANGUAGES ============ */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
                Languages
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Type in Your Language
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
                Full support for English and three Nepali keyboard layouts.
                Switch between them anytime.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {languages.map((lang, i) => (
                <motion.div key={lang.name} variants={fadeUp} custom={i + 1}>
                  <Link href={`/typing?lang=${lang.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Card className="group cursor-pointer border-[hsl(var(--border))] transition-all hover:border-[hsl(var(--primary)/0.4)] hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{lang.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {lang.layout} layout
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1 group-hover:text-[hsl(var(--primary))]" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
                How It Works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Three Simple Steps
              </h2>
            </motion.div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Start Typing',
                  desc: 'Jump right in — no account needed. Pick your language and start a speed test instantly.',
                  icon: Keyboard,
                },
                {
                  step: '02',
                  title: 'Track Progress',
                  desc: 'Create a free account to save your results, track streaks, and see your improvement over time.',
                  icon: BarChart3,
                },
                {
                  step: '03',
                  title: 'Level Up',
                  desc: 'Complete lessons, earn XP, unlock achievements, and climb the leaderboard.',
                  icon: Trophy,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  custom={i + 1}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-4 text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
                    Step {item.step}
                  </span>
                  <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--info))]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Type Faster?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
              Create a free account to save your progress, track your streaks,
              earn achievements, and unlock the full experience.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/typing">
                <Button
                  size="xl"
                  className="bg-white text-[hsl(var(--primary))] shadow-lg hover:bg-white/90 gap-2"
                >
                  <Keyboard className="h-5 w-5" />
                  Try as Guest
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
