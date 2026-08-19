'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Timer,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  Keyboard,
  Save,
  LogIn,
  Globe,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { generateText, type TextDifficulty } from '@/lib/texts';
import { getRandomNepaliText } from '@/lib/nepaliTexts';
import type { TypingResult, MistypedKey, SlowestKey } from '@/types';

// ===== Constants =====
const durations = [15, 30, 60, 120] as const;
type LanguageOption = 'english' | 'nepali-unicode' | 'nepali-preeti';

export default function TypingPage() {
  const { user } = useAuth();
  
  // Prevent hydration mismatch by mounting client-side only
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Test configuration state
  const [language, setLanguage] = useState<LanguageOption>('english');
  const [duration, setDuration] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<TextDifficulty>('medium');
  
  // Typing state
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  
  // Results
  const [result, setResult] = useState<TypingResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const keystrokesRef = useRef<{ char: string; expected: string; timestamp: number; isCorrect: boolean; latency: number }[]>([]);

  // Generate text helper
  const loadText = useCallback((lang: LanguageOption, dur: number, diff: TextDifficulty) => {
    if (lang === 'english') {
      return generateText({ duration: dur, difficulty: diff });
    } else if (lang === 'nepali-unicode') {
      return getRandomNepaliText('unicode');
    } else {
      return getRandomNepaliText('preeti');
    }
  }, []);

  // Initialize text on mount / language / difficulty change
  useEffect(() => {
    setTargetText(loadText(language, duration, difficulty));
  }, [language, duration, difficulty, loadText]);

  // Timer effect
  useEffect(() => {
    if (isStarted && !isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            handleTestComplete();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isComplete, duration]);

  // Focus hidden input on click of card
  const focusInput = () => {
    if (!isComplete && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Focus on text change
  useEffect(() => {
    focusInput();
  }, [targetText]);

  // Handle typing input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isComplete) return;

    const value = e.target.value;
    const now = Date.now();

    // Start test on first character
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(now);
      lastKeystrokeTimeRef.current = now;
    }

    const currentLen = value.length;
    const prevLen = typedText.length;

    // Detect backspace
    if (currentLen < prevLen) {
      setBackspaceCount(prev => prev + 1);
    } else {
      // Record latency and keystroke data
      const latency = lastKeystrokeTimeRef.current > 0 ? now - lastKeystrokeTimeRef.current : 0;
      lastKeystrokeTimeRef.current = now;

      const typedChar = value[currentLen - 1];
      const expectedChar = targetText[currentLen - 1];
      const isCorrect = typedChar === expectedChar;

      keystrokesRef.current.push({
        char: typedChar,
        expected: expectedChar,
        timestamp: now,
        isCorrect,
        latency,
      });
    }

    setTypedText(value);

    // Auto-scroll logic to center cursor
    if (textDisplayRef.current) {
      const activeChar = textDisplayRef.current.querySelector('.typing-char-current');
      if (activeChar) {
        activeChar.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }

    // Check completion
    if (value.length >= targetText.length) {
      handleTestComplete(value);
    }
  };

  // Complete test
  const handleTestComplete = (finalValue?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsComplete(true);
    
    const value = finalValue !== undefined ? finalValue : typedText;
    const endTime = Date.now();
    const start = startTime || endTime;
    const durationSec = Math.max(1, (endTime - start) / 1000);
    const minutes = durationSec / 60;

    // Count correct characters
    let correctCount = 0;
    const minLength = Math.min(value.length, targetText.length);
    for (let i = 0; i < minLength; i++) {
      if (value[i] === targetText[i]) correctCount++;
    }
    const incorrectCount = value.length - correctCount;

    // Standard word length = 5 characters
    const grossWpm = Math.round((value.length / 5) / minutes);
    const netWpm = Math.max(0, Math.round((correctCount / 5) / minutes));
    const finalAccuracy = value.length > 0 ? Math.round((correctCount / value.length) * 10000) / 100 : 100;

    // Mistyped keys calculation
    const mistypedMap = new Map<string, { typed: string; count: number }>();
    keystrokesRef.current
      .filter((k) => !k.isCorrect)
      .forEach((k) => {
        const key = `${k.expected}->${k.char}`;
        const existing = mistypedMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          mistypedMap.set(key, { typed: k.char, count: 1 });
        }
      });
    const mistypedKeys: MistypedKey[] = Array.from(mistypedMap.entries())
      .map(([key, val]) => ({
        expected: key.split('->')[0],
        typed: val.typed,
        count: val.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Slowest keys calculation
    const latencyMap = new Map<string, { total: number; count: number }>();
    keystrokesRef.current
      .filter((k) => k.latency > 0 && k.isCorrect)
      .forEach((k) => {
        const existing = latencyMap.get(k.expected);
        if (existing) {
          existing.total += k.latency;
          existing.count++;
        } else {
          latencyMap.set(k.expected, { total: k.latency, count: 1 });
        }
      });
    const slowestKeys: SlowestKey[] = Array.from(latencyMap.entries())
      .map(([key, val]) => ({
        key,
        averageLatency: Math.round(val.total / val.count),
        count: val.count,
      }))
      .sort((a, b) => b.averageLatency - a.averageLatency)
      .slice(0, 10);

    const finalResult: TypingResult = {
      grossWpm,
      netWpm,
      accuracy: finalAccuracy,
      totalCharacters: value.length,
      correctCharacters: correctCount,
      incorrectCharacters: incorrectCount,
      errorRate: value.length > 0 ? Math.round((incorrectCount / value.length) * 10000) / 100 : 0,
      wordsTyped: Math.round(value.length / 5),
      duration: Math.round(durationSec),
      mistypedKeys,
      slowestKeys,
      slowestWords: [],
      keystrokes: keystrokesRef.current.map(k => ({
        character: k.char,
        expected: k.expected,
        timestamp: k.timestamp,
        isCorrect: k.isCorrect,
        latency: k.latency
      })),
    };

    setResult(finalResult);
    setShowResult(true);
  };

  // Reset test
  const handleNewTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Reset typing states
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setBackspaceCount(0);
    setTypedText('');
    setResult(null);
    setShowResult(false);
    setSaved(false);
    
    // Clear refs
    lastKeystrokeTimeRef.current = 0;
    keystrokesRef.current = [];

    // Load new text
    setTargetText(loadText(language, duration, difficulty));
    setTimeout(focusInput, 50);
  };

  // Handle configuration changes
  const handleLanguageChange = (lang: LanguageOption) => {
    setLanguage(lang);
    setTypedText('');
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setTargetText(loadText(lang, duration, difficulty));
    setTimeout(focusInput, 50);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    setTypedText('');
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setTargetText(loadText(language, d, difficulty));
    setTimeout(focusInput, 50);
  };

  const handleDifficultyChange = (d: TextDifficulty) => {
    setDifficulty(d);
    setTypedText('');
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setTargetText(loadText(language, duration, d));
    setTimeout(focusInput, 50);
  };

  // Save session to API
  const handleSave = async () => {
    if (!result || !user || saved) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          keyboardLayout: language === 'english' ? 'qwerty' : language === 'nepali-unicode' ? 'nepali-unicode' : 'preeti',
          mode: 'free',
          duration: result.duration,
          grossWpm: result.grossWpm,
          netWpm: result.netWpm,
          accuracy: result.accuracy,
          correctCharacters: result.correctCharacters,
          incorrectCharacters: result.incorrectCharacters,
          errors: result.incorrectCharacters,
          backspaces: backspaceCount,
          totalKeystrokes: typedText.length + backspaceCount,
          textContent: targetText.slice(0, 500),
          keystrokeData: result.keystrokes.slice(0, 200),
          startedAt: new Date(startTime || Date.now() - result.duration * 1000).toISOString(),
          completedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      console.error('Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  // Calculate live WPM/Accuracy
  const currentMinutes = elapsedSeconds / 60 || 1 / 60;
  // Calculate correct letters dynamically
  let liveCorrect = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) liveCorrect++;
  }
  const liveWpm = Math.max(0, Math.round((liveCorrect / 5) / currentMinutes));
  const liveAccuracy = typedText.length > 0 ? Math.round((liveCorrect / typedText.length) * 100) : 100;
  const timeRemaining = Math.max(0, duration - elapsedSeconds);
  const isTimeLow = timeRemaining <= 10 && isStarted && !isComplete;

  // Font family helper
  const getDisplayFontClass = () => {
    if (language === 'nepali-preeti') {
      return 'font-preeti font-normal text-3xl tracking-wider leading-[2]';
    }
    if (language === 'nepali-unicode') {
      return 'font-sans font-medium text-2xl tracking-wide leading-[2.2]';
    }
    return 'font-mono text-xl tracking-wide leading-[2.5]';
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, level: user.level } : null} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))] mx-auto" />
            <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium animate-pulse">Preparing typing test...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role, level: user.level } : null} />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* ===== Config Bar ===== */}
          {!isStarted && !showResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-wrap items-center justify-center gap-6"
            >
              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
                  {[
                    { id: 'english', label: 'English' },
                    { id: 'nepali-unicode', label: 'Nepali (Unicode)' },
                    { id: 'nepali-preeti', label: 'Nepali (Preeti)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id as LanguageOption)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        language === lang.id
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDurationChange(d)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        duration === d
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty (English only) */}
              {language === 'english' && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
                    {(['easy', 'medium', 'hard'] as TextDifficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDifficultyChange(d)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                          difficulty === d
                            ? 'bg-[hsl(var(--primary))] text-white'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== Live Stats Bar ===== */}
          {isStarted && !showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-center gap-8"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
                <span className="text-3xl font-bold tabular-nums">{liveWpm}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">WPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[hsl(var(--success))]" />
                <span className="text-3xl font-bold tabular-nums">{liveAccuracy}%</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">ACC</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className={`h-5 w-5 ${isTimeLow ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--warning))]'}`} />
                <span className={`text-3xl font-bold tabular-nums ${isTimeLow ? 'text-[hsl(var(--destructive))]' : ''}`}>
                  {timeRemaining}
                </span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">SEC</span>
              </div>
            </motion.div>
          )}

          {/* ===== Progress Bar ===== */}
          {isStarted && !showResult && (
            <div className="mb-6">
              <Progress value={Math.round((typedText.length / targetText.length) * 100)} className="h-1.5" />
            </div>
          )}

          {/* ===== Typing Area ===== */}
          {!showResult && (
            <div className="relative">
              {/* Hidden text area to capture input cleanly and trigger mobile keyboard */}
              <textarea
                ref={inputRef}
                value={typedText}
                onChange={handleInputChange}
                className="absolute inset-0 h-full w-full cursor-default select-none resize-none overflow-hidden opacity-0 outline-none"
                style={{ caretColor: 'transparent' }}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                disabled={isComplete}
              />

              <Card 
                onClick={focusInput}
                className="cursor-text border-[hsl(var(--border))] shadow-lg select-none"
              >
                <CardContent className="p-8">
                  {/* Instruction */}
                  {!isStarted && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 text-center text-sm text-[hsl(var(--muted-foreground))]"
                    >
                      <Keyboard className="mr-1 inline h-4 w-4" />
                      Click here and start typing to begin the test
                    </motion.p>
                  )}

                  {/* Text Display */}
                  <div
                    ref={textDisplayRef}
                    className={`max-h-[220px] overflow-hidden text-left ${getDisplayFontClass()}`}
                  >
                    {targetText.split('').map((char, i) => {
                      let colorClass = 'text-[hsl(var(--typing-upcoming))]';
                      const isCurrent = i === typedText.length;
                      
                      if (i < typedText.length) {
                        const isCorrect = typedText[i] === char;
                        colorClass = isCorrect 
                          ? 'text-[hsl(var(--typing-correct))]' 
                          : 'text-[hsl(var(--typing-incorrect))] underline decoration-2 decoration-[hsl(var(--typing-incorrect))]';
                      }

                      return (
                        <span key={i} className={`relative typing-char ${colorClass}`}>
                          {/* Smooth blinking cursor caret */}
                          {isCurrent && (
                            <span 
                              className="absolute left-0 bg-[hsl(var(--primary))] animate-pulse"
                              style={{
                                width: '2px',
                                top: '15%',
                                height: '70%',
                              }}
                            />
                          )}
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Restart button */}
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" onClick={handleNewTest} className="gap-2 text-[hsl(var(--muted-foreground))]">
                  <RotateCcw className="h-4 w-4" />
                  Restart Test
                </Button>
              </div>
            </div>
          )}

          {/* ===== Results Screen ===== */}
          <AnimatePresence>
            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Main Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent">
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <Zap className="h-8 w-8 text-[hsl(var(--primary))]" />
                      <p className="text-4xl font-bold">{result.netWpm}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Net WPM</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[hsl(var(--success)/0.3)] bg-gradient-to-br from-[hsl(var(--success)/0.05)] to-transparent">
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <Target className="h-8 w-8 text-[hsl(var(--success))]" />
                      <p className="text-4xl font-bold">{result.accuracy}%</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Accuracy</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <Timer className="h-8 w-8 text-[hsl(var(--warning))]" />
                      <p className="text-4xl font-bold">{result.duration}s</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Duration</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <Trophy className="h-8 w-8 text-[hsl(var(--chart-3))]" />
                      <p className="text-4xl font-bold">{result.grossWpm}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Gross WPM</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detail Cards */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold">Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--muted-foreground))]">Characters</span>
                          <span>
                            <span className="text-[hsl(var(--success))]">{result.correctCharacters}</span>
                            {' / '}
                            <span className="text-[hsl(var(--destructive))]">{result.incorrectCharacters}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--muted-foreground))]">Words Typed</span>
                          <span className="font-medium">{result.wordsTyped}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--muted-foreground))]">Error Rate</span>
                          <span className="font-medium">{result.errorRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--muted-foreground))]">Total Keys Pressed</span>
                          <span className="font-medium">{typedText.length + backspaceCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[hsl(var(--muted-foreground))]">Backspaces Used</span>
                          <span className="font-medium">{backspaceCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold">Mistyped Keys</h3>
                      {result.mistypedKeys.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--success))]">Perfect! No mistakes 🎉</p>
                      ) : (
                        <div className="space-y-2">
                          {result.mistypedKeys.slice(0, 5).map((mk, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[hsl(var(--destructive)/0.1)] font-mono text-[hsl(var(--destructive))]">
                                  {mk.expected === ' ' ? '␣' : mk.expected}
                                </span>
                                <ArrowRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[hsl(var(--muted))] font-mono">
                                  {mk.typed === ' ' ? '␣' : mk.typed}
                                </span>
                              </div>
                              <span className="text-[hsl(var(--muted-foreground))]">×{mk.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <Button size="lg" onClick={handleNewTest} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  {user ? (
                    <Button
                      size="lg"
                      variant={saved ? 'success' : 'outline'}
                      onClick={handleSave}
                      disabled={saving || saved}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Result'}
                    </Button>
                  ) : (
                    <Link href="/register">
                      <Button size="lg" variant="outline" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign Up to Save Results
                      </Button>
                    </Link>
                  )}
                </div>

                {!user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 rounded-xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] p-6 text-center"
                  >
                    <h3 className="font-semibold">Want to track your progress?</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      Create a free account to save your results, track streaks, and compare progress.
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <Link href="/register">
                        <Button size="sm">Create Account</Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="ghost" size="sm">Log In</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
