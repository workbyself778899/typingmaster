'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Zap,
  Target,
  Clock,
  Type,
  FileText,
  CheckCircle2,
  ChevronRight,
  Shuffle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { textModePassages } from '@/lib/textModePassages';

export default function TextModePage() {
  // Selected passage state
  const [selectedPassageId, setSelectedPassageId] = useState<string>(textModePassages[0].id);
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);

  // Active target passage
  const currentPassage = textModePassages.find((p) => p.id === selectedPassageId) || textModePassages[0];
  const targetText = isCustomMode ? customText : currentPassage.text;

  // Typing state
  const [typedText, setTypedText] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Results
  const [showResult, setShowResult] = useState<boolean>(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Total words in current target text
  const totalTargetWords = targetText.trim() ? targetText.trim().split(/\s+/).length : 0;

  // Focus textarea helper
  const focusInput = () => {
    if (!isComplete && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [selectedPassageId, isCustomMode, isEditingCustom]);

  // Stopwatch timer (Counts UP without countdown limit)
  useEffect(() => {
    if (isStarted && !isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isComplete]);

  // Smooth scroll container to keep active word in view
  useEffect(() => {
    if (activeWordRef.current && textDisplayRef.current) {
      const container = textDisplayRef.current;
      const word = activeWordRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();

      if (wordRect.top < containerRect.top + 30 || wordRect.bottom > containerRect.bottom - 30) {
        word.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [typedText]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isComplete) return;
    const value = e.target.value;
    const now = Date.now();

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(now);
    }

    setTypedText(value);

    // Auto-complete when entire passage is typed
    if (value.length >= targetText.length && targetText.length > 0) {
      completeTest();
    }
  };

  // Complete test
  const completeTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsComplete(true);
    setShowResult(true);
  };

  // Reset current passage typing
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setTypedText('');
    setShowResult(false);
    if (textDisplayRef.current) {
      textDisplayRef.current.scrollTop = 0;
    }
    setTimeout(focusInput, 50);
  };

  // Switch to another passage
  const handleSelectPassage = (id: string) => {
    setSelectedPassageId(id);
    setIsCustomMode(false);
    setIsEditingCustom(false);
    handleReset();
  };

  // Select next passage in list
  const handleNextPassage = () => {
    const currentIndex = textModePassages.findIndex((p) => p.id === selectedPassageId);
    const nextIndex = (currentIndex + 1) % textModePassages.length;
    handleSelectPassage(textModePassages[nextIndex].id);
  };

  // Pick random passage
  const handleRandomPassage = () => {
    const otherPassages = textModePassages.filter((p) => p.id !== selectedPassageId);
    const random = otherPassages[Math.floor(Math.random() * otherPassages.length)] || textModePassages[0];
    handleSelectPassage(random.id);
  };

  // Save custom text
  const handleApplyCustomText = () => {
    if (customText.trim()) {
      setIsCustomMode(true);
      setIsEditingCustom(false);
      handleReset();
    }
  };

  // Live Statistics Calculations
  const now = Date.now();
  const liveElapsedMs = isStarted && startTime ? Math.max(1000, now - startTime) : 0;
  const liveElapsedSec = liveElapsedMs / 1000;

  // Correct characters count
  let correctCharCount = 0;
  const checkLen = Math.min(typedText.length, targetText.length);
  for (let i = 0; i < checkLen; i++) {
    if (typedText[i] === targetText[i]) correctCharCount++;
  }

  // Words typed
  const wordsTypedCount = Math.round(correctCharCount / 5);

  // Words Per Second (WPS)
  const wps = liveElapsedSec > 0 ? parseFloat((wordsTypedCount / liveElapsedSec).toFixed(2)) : 0;

  // Words Per Minute (WPM)
  const wpm = liveElapsedSec > 0 ? Math.max(0, Math.round(wordsTypedCount / (liveElapsedSec / 60))) : 0;

  // Accuracy %
  const accuracy = typedText.length > 0 ? Math.round((correctCharCount / typedText.length) * 100) : 100;

  // Format stopwatch MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Target Passage Text
  // Only green (correct) or red (incorrect) text colors, no background highlight, with smooth cursor.
  const renderPassageContent = () => {
    if (!targetText) return null;

    const words = targetText.split(/(\s+)/);
    let charGlobalIndex = 0;

    return words.map((word, wordIndex) => {
      const wordStart = charGlobalIndex;
      const wordEnd = charGlobalIndex + word.length;
      charGlobalIndex += word.length;

      // Space tokens
      if (/^\s+$/.test(word)) {
        const isPastSpace = typedText.length >= wordEnd;
        const typedChar = typedText[wordStart];
        const isCorrectSpace = isPastSpace && (typedChar === word || typedChar === ' ');

        return (
          <span
            key={wordIndex}
            className={`typing-word relative inline ${
              isPastSpace
                ? isCorrectSpace
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-red-600 dark:text-red-400 font-semibold'
                : ''
            }`}
          >
            {word.replace(/ /g, '\u00A0')}
          </span>
        );
      }

      const hasTrailingSpace = targetText[wordEnd] === ' ' || targetText[wordEnd] === '\t' || targetText[wordEnd] === '\n';
      const completeBoundary = hasTrailingSpace ? wordEnd + 1 : wordEnd;

      // 1. Active word currently being typed
      if (typedText.length >= wordStart && typedText.length < completeBoundary) {
        const typedOffset = Math.min(word.length, typedText.length - wordStart);
        const typedPart = word.slice(0, typedOffset);
        const untypedPart = word.slice(typedOffset);

        const renderedTypedChars = Array.from(typedPart).map((char, charIdx) => {
          const globalIdx = wordStart + charIdx;
          const userTypedChar = typedText[globalIdx];
          const isCharCorrect = userTypedChar === char;

          return (
            <span
              key={charIdx}
              className={
                isCharCorrect
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-red-600 dark:text-red-400 font-bold'
              }
            >
              {char}
            </span>
          );
        });

        return (
          <span
            key={wordIndex}
            ref={activeWordRef}
            className="typing-word typing-word-active inline-block relative text-[hsl(var(--foreground))]"
          >
            <span>{renderedTypedChars}</span>
            <span
              className="inline-block bg-[hsl(var(--primary))] animate-pulse rounded-full align-middle mx-[0.5px]"
              style={{ width: '2.5px', height: '1.2em' }}
            />
            <span className="text-[hsl(var(--foreground))] opacity-75">{untypedPart}</span>
          </span>
        );
      }

      // 2. Completed word
      if (typedText.length >= completeBoundary) {
        const userTypedWord = typedText.slice(wordStart, wordEnd);
        const isWordCorrect = userTypedWord === word;

        return (
          <span
            key={wordIndex}
            className={`typing-word inline-block font-semibold transition-colors ${
              isWordCorrect
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400 line-through decoration-red-500'
            }`}
          >
            {word}
          </span>
        );
      }

      // 3. Upcoming untyped word
      return (
        <span
          key={wordIndex}
          className="typing-word inline-block text-[hsl(var(--foreground))] opacity-70"
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[hsl(var(--background))] select-none overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col justify-between px-3 sm:px-6 py-2 max-w-5xl mx-auto w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden gap-2">
        
        {/* Top 1-Line Compact Bar */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              FULL TEXT MODE
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0">
                No Timer
              </Badge>
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomPassage}
              className="h-7 px-2 text-[11px] gap-1"
              title="Random passage"
            >
              <Shuffle className="h-3 w-3" />
              <span className="hidden sm:inline">Random</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPassage}
              className="h-7 px-2 text-[11px] gap-1"
              title="Next passage"
            >
              <ChevronRight className="h-3 w-3" />
              <span className="hidden sm:inline">Next</span>
            </Button>
            <Button
              variant={isEditingCustom ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditingCustom(!isEditingCustom)}
              className="h-7 px-2 text-[11px] gap-1"
            >
              <Type className="h-3 w-3" />
              <span className="hidden sm:inline">Custom</span>
            </Button>
            {isStarted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2 text-[11px] text-[hsl(var(--muted-foreground))]"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Custom Text Editor Drawer (If Open) */}
        {isEditingCustom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] p-3 shadow-md space-y-2 flex-shrink-0"
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[hsl(var(--primary))]">
                <Type className="h-3.5 w-3.5" />
                Paste Custom Passage
              </span>
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {customText.trim() ? customText.trim().split(/\s+/).length : 0} words
              </span>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste article, essay, or text excerpt here..."
              className="w-full h-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditingCustom(false)} className="h-6 text-xs px-2">
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyCustomText} disabled={!customText.trim()} className="h-6 text-xs px-2.5">
                Start Typing
              </Button>
            </div>
          </motion.div>
        )}

        {/* 1-Line Passage Chips Selector Bar */}
        {!isEditingCustom && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1 flex-shrink-0 mr-1">
              <BookOpen className="h-3 w-3 text-[hsl(var(--primary))]" />
              Texts:
            </span>
            {textModePassages.map((passage) => {
              const isSelected = !isCustomMode && selectedPassageId === passage.id;
              const wordCount = passage.text.trim().split(/\s+/).length;

              return (
                <button
                  key={passage.id}
                  onClick={() => handleSelectPassage(passage.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--foreground))] font-bold shadow-xs'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{passage.title}</span>
                  <span className="text-[10px] text-[hsl(var(--primary))] font-extrabold">{wordCount}w</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 1-Line Live Stats & Progress Ribbon */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs flex-shrink-0 text-xs">
          {/* WPS (Words Per Second) — PROMINENT */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Speed:</span>
            <span className="font-black text-sm tabular-nums text-[hsl(var(--primary))]">
              {wps.toFixed(2)}
              <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] ml-0.5">WPS</span>
            </span>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-mono">({wpm} WPM)</span>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Acc:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{accuracy}%</span>
          </div>

          {/* Elapsed Time */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Time:</span>
            <span className="font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Progress Counter & Mini Bar */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold tabular-nums whitespace-nowrap">
              {Math.min(totalTargetWords, wordsTypedCount)} / {totalTargetWords}w
            </span>
            <div className="relative flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--primary))] transition-all duration-150 rounded-full"
                style={{ width: `${Math.min(100, Math.round((typedText.length / Math.max(1, targetText.length)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Text Practice Card (Expands to Fill Exact Remaining Screen Height) */}
        <Card
          onClick={focusInput}
          className="flex-1 min-h-0 flex flex-col border-2 border-[hsl(var(--border))] shadow-lg bg-[hsl(var(--card))] overflow-hidden cursor-text"
        >
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.25)] flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground))] truncate">
                {isCustomMode ? 'Custom Passage' : currentPassage.title}
              </span>
              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 flex-shrink-0">
                {totalTargetWords} words
              </Badge>
            </div>

            <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium hidden sm:inline">
              Click &amp; type naturally at your own pace
            </span>
          </div>

          <CardContent className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col overflow-hidden relative">
            {/* Scrollable text display with smooth auto-scroll to keep active word centered */}
            <div
              ref={textDisplayRef}
              className="flex-1 min-h-0 overflow-y-auto leading-[2.3] font-mono text-base sm:text-lg pr-2 select-none tracking-normal scroll-smooth"
            >
              {renderPassageContent()}
            </div>

            {/* Hidden Input for capturing keystrokes */}
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              className="absolute -left-[9999px] top-0 opacity-0 h-0 w-0 pointer-events-none"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </CardContent>
        </Card>

        {/* 1-Line Bottom Hint Bar */}
        <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))] px-1 py-0.5 border-t border-[hsl(var(--border))] flex-shrink-0">
          <span>• No countdown timer: practice long 400-word passages without pressure.</span>
          <span>• Live WPS calculated continuously as you type.</span>
        </div>

        {/* Completed Results Modal (Overlay Modal, Never Causes Scrolling) */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            >
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-[hsl(var(--card))] p-6 shadow-2xl text-center space-y-5 max-w-md w-full">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Passage Completed!</h2>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    You completed the entire passage at your own pace.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Words / Sec</p>
                    <p className="text-2xl font-black text-[hsl(var(--primary))]">{wps.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Speed (WPM)</p>
                    <p className="text-2xl font-black">{wpm}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Accuracy</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Total Time</p>
                    <p className="text-2xl font-black">{formatTime(elapsedSeconds)}</p>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try Again
                  </Button>
                  <Button onClick={handleNextPassage} size="sm" className="gap-1.5 text-xs font-bold">
                    Next Passage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
