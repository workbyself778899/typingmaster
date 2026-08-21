'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeystrokeData, TypingResult, MistypedKey, SlowestKey } from '@/types';

// ===== Types =====

export interface TypingEngineState {
  text: string;
  currentIndex: number;
  typed: (string | null)[]; // null = not yet typed, string = what was typed
  isStarted: boolean;
  isComplete: boolean;
  isPaused: boolean;
  startTime: number | null;
  endTime: number | null;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  backspaces: number;
  totalKeystrokes: number;
}

export interface TypingEngineReturn {
  state: TypingEngineState;
  // Live stats
  wpm: number;
  grossWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  progress: number; // 0-100
  // Actions
  handleKeyDown: (e: KeyboardEvent) => void;
  reset: (newText?: string) => void;
  // Results
  getResult: () => TypingResult | null;
}

// ===== Constants =====
const WORD_LENGTH = 5; // Standard: 1 word = 5 characters

// ===== Hook =====

export function useTypingEngine(
  initialText: string,
  options: {
    timeLimit?: number; // seconds, 0 = no limit
    onComplete?: (result: TypingResult) => void;
  } = {}
): TypingEngineReturn {
  const { timeLimit = 60, onComplete } = options;

  const [state, setState] = useState<TypingEngineState>(() => createInitialState(initialText));
  const keystrokesRef = useRef<KeystrokeData[]>([]);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Timer
  useEffect(() => {
    if (state.isStarted && !state.isComplete && !state.isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (timeLimit > 0 && next >= timeLimit) {
            // Time's up — complete
            setState((s) => ({ ...s, isComplete: true, endTime: Date.now() }));
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isStarted, state.isComplete, state.isPaused, timeLimit]);

  // Fire onComplete when test ends
  useEffect(() => {
    if (state.isComplete && state.startTime) {
      if (timerRef.current) clearInterval(timerRef.current);
      const result = buildResult(state, keystrokesRef.current);
      if (result) onCompleteRef.current?.(result);
    }
  }, [state.isComplete, state.startTime]);

  // Calculate live stats
  const minutes = Math.max(1 / 60, elapsedSeconds / 60); // avoid /0
  const grossWpm = Math.round((state.totalKeystrokes / WORD_LENGTH) / minutes);
  const netWpm = Math.max(0, Math.round((state.correctChars / WORD_LENGTH) / minutes));
  const totalTyped = state.correctChars + state.incorrectChars;
  const accuracy = totalTyped > 0 ? Math.round((state.correctChars / totalTyped) * 10000) / 100 : 100;
  const progress = state.text.length > 0 ? Math.round((state.currentIndex / state.text.length) * 100) : 0;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore modifier-only keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) return;
      // Prevent default for space to avoid page scroll
      if (e.key === ' ') e.preventDefault();

      setState((prev) => {
        if (prev.isComplete) return prev;

        const now = Date.now();
        const latency = lastKeystrokeTimeRef.current > 0 ? now - lastKeystrokeTimeRef.current : 0;
        lastKeystrokeTimeRef.current = now;

        // Start on first keypress
        const isStarted = prev.isStarted || true;
        const startTime = prev.startTime || now;

        // Handle Backspace
        if (e.key === 'Backspace') {
          if (prev.currentIndex <= 0) return { ...prev, isStarted, startTime };
          const newIndex = prev.currentIndex - 1;
          const prevCharTyped = prev.typed[newIndex];
          const newTyped = [...prev.typed];
          newTyped[newIndex] = null;

          const wasCorrect = prevCharTyped !== null && prevCharTyped === prev.text[newIndex];

          return {
            ...prev,
            isStarted,
            startTime,
            currentIndex: newIndex,
            typed: newTyped,
            correctChars: Math.max(0, prev.correctChars - (wasCorrect ? 1 : 0)),
            incorrectChars: Math.max(0, prev.incorrectChars - (wasCorrect ? 0 : 1)),
            backspaces: prev.backspaces + 1,
            totalKeystrokes: prev.totalKeystrokes + 1,
          };
        }

        // Only process single character keys
        if (e.key.length !== 1) return { ...prev, isStarted, startTime };

        const expected = prev.text[prev.currentIndex];
        const isCorrect = e.key === expected;
        const newTyped = [...prev.typed];
        newTyped[prev.currentIndex] = e.key;

        // Record keystroke
        keystrokesRef.current.push({
          character: e.key,
          expected,
          timestamp: now,
          isCorrect,
          latency,
        });

        const newIndex = prev.currentIndex + 1;
        const isComplete = newIndex >= prev.text.length;

        return {
          ...prev,
          isStarted,
          startTime,
          currentIndex: newIndex,
          typed: newTyped,
          correctChars: prev.correctChars + (isCorrect ? 1 : 0),
          incorrectChars: prev.incorrectChars + (isCorrect ? 0 : 1),
          errors: prev.errors + (isCorrect ? 0 : 1),
          totalKeystrokes: prev.totalKeystrokes + 1,
          isComplete,
          endTime: isComplete ? now : null,
        };
      });
    },
    []
  );

  const reset = useCallback(
    (newText?: string) => {
      if (timerRef.current) clearInterval(timerRef.current);
      keystrokesRef.current = [];
      lastKeystrokeTimeRef.current = 0;
      setElapsedSeconds(0);
      setState(createInitialState(newText || initialText));
    },
    [initialText]
  );

  const getResult = useCallback((): TypingResult | null => {
    if (!state.startTime) return null;
    return buildResult(state, keystrokesRef.current);
  }, [state]);

  return {
    state,
    wpm: state.isStarted ? netWpm : 0,
    grossWpm: state.isStarted ? grossWpm : 0,
    accuracy,
    elapsedSeconds,
    progress,
    handleKeyDown,
    reset,
    getResult,
  };
}

// ===== Helpers =====

function createInitialState(text: string): TypingEngineState {
  return {
    text,
    currentIndex: 0,
    typed: new Array(text.length).fill(null),
    isStarted: false,
    isComplete: false,
    isPaused: false,
    startTime: null,
    endTime: null,
    errors: 0,
    correctChars: 0,
    incorrectChars: 0,
    backspaces: 0,
    totalKeystrokes: 0,
  };
}

function buildResult(state: TypingEngineState, keystrokes: KeystrokeData[]): TypingResult | null {
  if (!state.startTime) return null;

  const endTime = state.endTime || Date.now();
  const durationMs = endTime - state.startTime;
  const durationSec = durationMs / 1000;
  const minutes = durationSec / 60 || 1 / 60;

  const totalChars = state.correctChars + state.incorrectChars;
  const totalKeystrokes = state.totalKeystrokes || totalChars;
  const grossWpm = Math.round((totalKeystrokes / WORD_LENGTH) / minutes);
  const netWpm = Math.max(0, Math.round((state.correctChars / WORD_LENGTH) / minutes));
  const accuracy = totalChars > 0 ? Math.round((state.correctChars / totalChars) * 10000) / 100 : 100;
  const errorRate = totalChars > 0 ? Math.round((state.errors / totalChars) * 10000) / 100 : 0;

  // Mistyped keys
  const mistypedMap = new Map<string, { typed: string; count: number }>();
  keystrokes
    .filter((k) => !k.isCorrect)
    .forEach((k) => {
      const key = `${k.expected}->${k.character}`;
      const existing = mistypedMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        mistypedMap.set(key, { typed: k.character, count: 1 });
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

  // Slowest keys
  const latencyMap = new Map<string, { total: number; count: number }>();
  keystrokes
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

  return {
    grossWpm,
    netWpm,
    accuracy,
    totalCharacters: totalChars,
    correctCharacters: state.correctChars,
    incorrectCharacters: state.incorrectChars,
    errorRate,
    wordsTyped: Math.round(totalChars / WORD_LENGTH),
    duration: Math.round(durationSec),
    mistypedKeys,
    slowestKeys,
    slowestWords: [],
    keystrokes,
  };
}
