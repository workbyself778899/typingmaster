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
  Keyboard as KeyboardIcon,
  Save,
  LogIn,
  Globe,
  Loader2,
  Eye,
  EyeOff,
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

// ===== Types =====
type LanguageOption = 'english' | 'nepali-unicode' | 'nepali-preeti';
const durations = [15, 30, 60, 120] as const;

// ===== Government Kalimati / Traditional Nepali Unicode Map =====
// Specs: H=अ, A=आ, [=इ, {=ई, f=उ, F=ऊ, ]=ए, }=ऐ, O=ओ, W=औ, Z=ऋ
// k=क, K=ख, g=ग, G=घ, <=ङ, c=च, C=छ, j=ज, J=झ, Y=ञ
// q=ट, Q=ठ, x=ड, X=ढ, N=ण, t=त, T=थ, d=द, D=ध, n=न
// p=प, P=फ, b=ब, B=भ, m=म, y=य, r=र, l=ल, v=व, S=श, z=ष, s=स, h=h
const unicodeKeyboardMap: Record<string, string> = {
  // Standalone Vowels
  'H': 'अ',
  'A': 'आ',
  '[': 'इ',
  '{': 'ई',
  'f': 'उ',
  'F': 'ऊ',
  ']': 'ए',
  '}': 'ऐ',
  'O': 'ओ',
  'W': 'औ',
  'Z': 'ऋ',

  // Consonants
  'k': 'क',
  'K': 'ख',
  'g': 'ग',
  'G': 'घ',
  '<': 'ङ',
  'c': 'च',
  'C': 'छ',
  'j': 'ज',
  'J': 'झ',
  'Y': 'ञ',
  'q': 'ट',
  'Q': 'ठ',
  'x': 'ड',
  'X': 'ढ',
  'N': 'ण',
  't': 'त',
  'T': 'थ',
  'd': 'द',
  'D': 'ध',
  'n': 'न',
  'p': 'प',
  'P': 'फ',
  'b': 'ब',
  'B': 'भ',
  'm': 'म',
  'y': 'य',
  'r': 'र',
  'l': 'ल',
  'v': 'व',
  'V': 'ँ',
  'S': 'श',
  'z': 'ष',
  's': 'स',
  'h': 'ह',

  // Standalone / Default matra fallbacks
  'a': 'ा',
  'i': 'ि',
  'I': 'ी',
  'u': 'ु',
  'U': 'ू',
  'e': 'े',
  'E': 'ै',
  'o': 'ो',
  'w': 'ौ',
  'R': 'ृ',

  // Punctuation & Modifiers
  '/': '्',
  '.': '।',
  ':': 'ः',
  'M': 'ं',
  '%': '%',
  '?': '?',
};

// Matra mappings when typed after a consonant or virama (ka=का, ki=कि, kI=की, ku=कु, kU=कू, ke=के, kE=कै, ko=को, kw=कौ, kM=कं, k:=कः, kR=कृ)
const unicodeMatraMap: Record<string, string> = {
  'a': 'ा',
  'i': 'ि',
  'I': 'ी',
  'u': 'ु',
  'U': 'ू',
  'e': 'े',
  'E': 'ै',
  'o': 'ो',
  'w': 'ौ',
  'M': 'ं',
  'V': 'ँ',
  ':': 'ः',
  'R': 'ृ',
};

// ===== Traditional Preeti Font Keyboard Map =====
// For Preeti: 's' -> 'क', 'k' -> 'प', ';' -> 'स', 'z' -> 'श', etc.
const preetiKeyboardMap: Record<string, string> = {
  's': 'क', 'v': 'ख', 'u': 'ग', '3': 'घ', 'ª': 'ङ',
  'r': 'च', '5': 'छ', 'h': 'ज', '´': 'झ', '`': 'ञ',
  '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण',
  't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
  'k': 'प', 'K': 'फ', 'a': 'ब', 'e': 'भ', 'd': 'म',
  'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व', 'z': 'श',
  'i': 'ष', ';': 'स', 'x': 'ह',

  'f': 'ा', 'L': 'ी', "'": 'ु', '"': 'ू', ']': 'े',
  '}': 'ै', '+': 'ं', 'H': 'ः', 'F': 'ँ',

  'c': 'अ', 'p': 'उ', 'P': 'ए',
  '|': '।', '.': '।',

  'A': 'ब', 'S': 'क', 'D': 'म', 'G': 'न',
  'J': 'व', 'Z': 'श',
  'X': 'ह', 'C': 'अ', 'V': 'ख', 'B': 'द', 'N': 'ल',
  'M': 'म्', 'Q': 'रु', 'W': 'ध', 'E': 'भ', 'R': 'च',
  'T': 'त', 'Y': 'थ', 'U': 'ग', 'I': 'ष', 'O': 'इ',
};

const isConsonant = (key: string) => {
  return [
    's', 'v', 'u', '3', 'ª', 'r', '5', 'h', '´', '`',
    '6', '7', '8', '9', '0', 't', 'y', 'b', 'w', 'g',
    'k', 'K', 'a', 'e', 'd', 'o', '/', 'n', 'j', 'z',
    'i', ';', 'x'
  ].includes(key.toLowerCase());
};

const isConsonantUnicode = (char: string) => {
  return [
    'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
    'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
    'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श',
    'ष', 'स', 'ह'
  ].includes(char);
};

// Keyboard keys definition
const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

export default function TypingPage() {
  const { user } = useAuth();
  
  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Configuration state
  const [language, setLanguage] = useState<LanguageOption>('nepali-unicode');
  const [duration, setDuration] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<TextDifficulty>('medium');
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(false);
  
  // Test typing state
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [pendingMatra, setPendingMatra] = useState<string | null>(null);

  // Active key state for virtual keyboard
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);

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
  const lastLineTopRef = useRef<number>(0);
  const keystrokesRef = useRef<{ char: string; expected: string; timestamp: number; isCorrect: boolean; latency: number }[]>([]);
  const typedTextRef = useRef<string>('');
  const startTimeRef = useRef<number | null>(null);

  // Sync ref with typedText state
  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  // Text loading helper
  const loadText = useCallback((lang: LanguageOption, dur: number, diff: TextDifficulty, nums: boolean, punct: boolean) => {
    if (lang === 'english') {
      return generateText({ duration: dur, difficulty: diff, includeNumbers: nums, includePunctuation: punct });
    } else if (lang === 'nepali-unicode') {
      return getRandomNepaliText('unicode');
    } else {
      return getRandomNepaliText('preeti');
    }
  }, []);

  // Set initial text
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const customText = params.get('text');
      const langParam = params.get('lang');

      if (langParam === 'english') {
        setLanguage('english');
      } else if (langParam === 'preeti' || langParam === 'nepali-preeti') {
        setLanguage('nepali-preeti');
      } else if (langParam === 'unicode' || langParam === 'nepali' || langParam === 'nepali-unicode') {
        setLanguage('nepali-unicode');
      }

      if (customText) {
        setTargetText(customText);
        return;
      }
    }
    setTargetText(loadText(language, duration, difficulty, includeNumbers, includePunctuation));
  }, [language, duration, difficulty, includeNumbers, includePunctuation, loadText]);

  // Timer runner
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

  // Auto-focus handler
  const focusInput = () => {
    if (!isComplete && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [targetText]);

  // Auto-scroll handler (Keep active line visible without premature upside jumps)
  useEffect(() => {
    if (!textDisplayRef.current || isComplete) return;

    const activeWordEl = textDisplayRef.current.querySelector('.typing-word-active') as HTMLElement;
    if (!activeWordEl) return;

    const container = textDisplayRef.current;
    const wordTop = activeWordEl.offsetTop;

    // Line 1 threshold check (offsetTop < 35px): lock scroll to top 0
    if (wordTop < 35) {
      if (container.scrollTop !== 0) {
        container.scrollTop = 0;
      }
      lastLineTopRef.current = 0;
      return;
    }

    // Only scroll when transitioning to a new line (offsetTop changes by > 20px)
    if (Math.abs(wordTop - lastLineTopRef.current) > 20) {
      lastLineTopRef.current = wordTop;
      container.scrollTo({
        top: Math.max(0, wordTop - 10),
        behavior: 'smooth',
      });
    }
  }, [typedText, isComplete]);

  // Handle mapped key typing values
  const handleNewTypedValue = (value: string) => {
    if (isComplete) return;
    const now = Date.now();

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(now);
      startTimeRef.current = now;
      lastKeystrokeTimeRef.current = now;
    }

    const currentLen = value.length;
    const prevLen = typedText.length;

    if (currentLen < prevLen) {
      setBackspaceCount(prev => prev + (prevLen - currentLen));
    } else if (currentLen > prevLen) {
      const latency = lastKeystrokeTimeRef.current > 0 ? now - lastKeystrokeTimeRef.current : 0;
      lastKeystrokeTimeRef.current = now;

      const addedString = value.slice(prevLen);
      for (let i = 0; i < addedString.length; i++) {
        const typedChar = addedString[i];
        const expectedChar = targetText[prevLen + i];
        const isCorrect = typedChar === expectedChar;

        keystrokesRef.current.push({
          char: typedChar,
          expected: expectedChar || '',
          timestamp: now,
          isCorrect,
          latency: i === 0 ? latency : 0,
        });
      }
    }

    setTypedText(value);
    typedTextRef.current = value;

    if (value.length >= targetText.length) {
      handleTestComplete(value);
    }
  };

  // Hidden textarea native input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (language !== 'nepali-unicode') {
      handleNewTypedValue(e.target.value);
    }
  };

  // Capture input keydown for on-the-fly transliteration
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComplete) return;

    // Track physical keypress state
    const keyStr = e.key.toLowerCase();
    setPressedKeys((prev) => ({ ...prev, [keyStr]: true }));

    if (e.key === 'Backspace') {
      if (language === 'nepali-unicode') {
        e.preventDefault();
        if (typedText.length > 0) {
          setBackspaceCount((prev) => prev + 1);
          const newTyped = typedText.slice(0, -1);
          setTypedText(newTyped);
        }
      }
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return;
    }

    if (language === 'nepali-unicode' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const rawKey = e.key;
      const lastChar = typedText.slice(-1);
      const isAfterConsonant = lastChar && (isConsonantUnicode(lastChar) || lastChar === '्');

      // 1. Matra barakhadi modifier check (ka=का, ki=कि, kI=की, ku=कु, kU=कू, ke=के, kE=कै, ko=को, kw=कौ, kM=कं, k:=कः, kR=कृ)
      if (isAfterConsonant && unicodeMatraMap[rawKey]) {
        handleNewTypedValue(typedText + unicodeMatraMap[rawKey]);
        return;
      }

      // 2. Shr (S + r = श्र)
      if (rawKey === 'r' && lastChar === 'श') {
        handleNewTypedValue(typedText + '्र');
        return;
      }

      const mappedChar = unicodeKeyboardMap[rawKey] || rawKey;
      handleNewTypedValue(typedText + mappedChar);
      return;
    }

    if (language === 'nepali-preeti' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();

      const key = e.key;
      let mappedChar = preetiKeyboardMap[key] || key;

      // 1. Short i matra logic (l typed before consonant in Preeti)
      if (key === 'l') {
        setPendingMatra('ि');
        return;
      }

      if (pendingMatra && isConsonant(key)) {
        mappedChar = mappedChar + pendingMatra;
        setPendingMatra(null);
      }

      // 2. cf -> आ
      if (key === 'f' && typedText.endsWith('अ')) {
        handleNewTypedValue(typedText.slice(0, -1) + 'आ');
        return;
      }

      // 3. O{ -> ई
      if (key === '{' && typedText.endsWith('इ')) {
        handleNewTypedValue(typedText.slice(0, -1) + 'ई');
        return;
      }

      // 4. Reph { -> prepend 'र्' to consonant
      if (key === '{') {
        const lastChar = typedText.slice(-1);
        if (lastChar && isConsonantUnicode(lastChar)) {
          handleNewTypedValue(typedText.slice(0, -1) + 'र' + '्' + lastChar);
          return;
        }
      }

      // 5. f] -> ो and f} -> ौ
      if (key === ']' && typedText.endsWith('ा')) {
        handleNewTypedValue(typedText.slice(0, -1) + 'ो');
        return;
      }
      if (key === '}' && typedText.endsWith('ा')) {
        handleNewTypedValue(typedText.slice(0, -1) + 'ौ');
        return;
      }

      handleNewTypedValue(typedText + mappedChar);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const keyStr = e.key.toLowerCase();
    setPressedKeys((prev) => ({ ...prev, [keyStr]: false }));
  };

  // Complete test
  const handleTestComplete = (finalValue?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsComplete(true);
    
    const value = finalValue !== undefined ? finalValue : typedTextRef.current;
    const endTime = Date.now();
    const start = startTimeRef.current || startTime || endTime;
    const actualDurationSec = Math.max(1, (endTime - start) / 1000);
    const durationSec = (value.length < targetText.length && elapsedSeconds >= duration) ? duration : actualDurationSec;
    const minutes = durationSec / 60;

    let correctCount = 0;
    const minLength = Math.min(value.length, targetText.length);
    for (let i = 0; i < minLength; i++) {
      if (value[i] === targetText[i]) correctCount++;
    }
    const incorrectCount = value.length - correctCount;
    const totalKeystrokes = keystrokesRef.current.length || value.length;

    const grossWpm = Math.round((totalKeystrokes / 5) / minutes);
    const netWpm = Math.max(0, Math.round((correctCount / 5) / minutes));
    const finalAccuracy = value.length > 0 ? Math.round((correctCount / value.length) * 10000) / 100 : 100;

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

  // Reset test state
  const handleNewTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setBackspaceCount(0);
    setTypedText('');
    typedTextRef.current = '';
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    
    lastKeystrokeTimeRef.current = 0;
    lastLineTopRef.current = 0;
    keystrokesRef.current = [];

    const newText = loadText(language, duration, difficulty, includeNumbers, includePunctuation);
    setTargetText(newText);
    
    // Reset wrapper scroll to top
    if (textDisplayRef.current) {
      textDisplayRef.current.scrollTop = 0;
    }

    setTimeout(focusInput, 50);
  };

  // Handle options changes
  const handleLanguageChange = (lang: LanguageOption) => {
    setLanguage(lang);
    setTypedText('');
    typedTextRef.current = '';
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    setTargetText(loadText(lang, duration, difficulty, includeNumbers, includePunctuation));
    setTimeout(focusInput, 50);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    setTypedText('');
    typedTextRef.current = '';
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    setTargetText(loadText(language, d, difficulty, includeNumbers, includePunctuation));
    setTimeout(focusInput, 50);
  };

  const handleDifficultyChange = (d: TextDifficulty) => {
    setDifficulty(d);
    setTypedText('');
    typedTextRef.current = '';
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    setTargetText(loadText(language, duration, d, includeNumbers, includePunctuation));
    setTimeout(focusInput, 50);
  };

  const handleNumbersToggle = (nums: boolean) => {
    setIncludeNumbers(nums);
    setTypedText('');
    typedTextRef.current = '';
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    setTargetText(loadText(language, duration, difficulty, nums, includePunctuation));
    setTimeout(focusInput, 50);
  };

  const handlePunctuationToggle = (punct: boolean) => {
    setIncludePunctuation(punct);
    setTypedText('');
    typedTextRef.current = '';
    setIsStarted(false);
    setIsComplete(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setSaved(false);
    setPendingMatra(null);
    setTargetText(loadText(language, duration, difficulty, includeNumbers, punct));
    setTimeout(focusInput, 50);
  };

  // Save session
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

  // Live stats WPM calculations with millisecond precision
  const now = Date.now();
  const liveElapsedMs = isStarted && startTime ? Math.max(1000, now - startTime) : 0;
  const liveMinutes = liveElapsedMs > 0 ? liveElapsedMs / 60000 : 1;

  let liveCorrect = 0;
  const checkLen = Math.min(typedText.length, targetText.length);
  for (let i = 0; i < checkLen; i++) {
    if (typedText[i] === targetText[i]) liveCorrect++;
  }

  const liveWpm = isStarted && liveElapsedMs > 0
    ? (isComplete && result ? result.netWpm : Math.max(0, Math.round((liveCorrect / 5) / liveMinutes)))
    : 0;
  const liveAccuracy = typedText.length > 0 ? Math.round((liveCorrect / typedText.length) * 100) : 100;
  const timeRemaining = Math.max(0, duration - elapsedSeconds);
  const isTimeLow = timeRemaining <= 10 && isStarted && !isComplete;

  // Font family helper
  const getDisplayFontClass = () => {
    if (language === 'nepali-preeti') {
      return 'font-preeti font-normal text-2xl sm:text-3xl tracking-normal leading-[2.0]';
    }
    if (language === 'nepali-unicode') {
      return 'font-sans font-medium text-xl sm:text-2xl tracking-normal leading-[2.1]';
    }
    return 'font-mono text-lg sm:text-xl tracking-wide leading-[2.1]';
  };

  // Expected keyboard key logic
  const getExpectedKey = () => {
    if (isComplete || !targetText) return null;
    const char = targetText[typedText.length];
    if (!char) return null;

    if (language === 'english' || language === 'nepali-preeti') {
      return char.toLowerCase();
    }

    // Nepali expected key lookup
    if (char === ' ') return ' ';
    
    const activeMap = language === 'nepali-unicode' ? unicodeKeyboardMap : preetiKeyboardMap;
    const entry = Object.entries(activeMap).find(([k, v]) => v === char);
    if (entry) return entry[0].toLowerCase();
    
    return null;
  };

  const expectedKey = getExpectedKey();

  // Rendering clean target prompt text without green/red colors
  const renderTextContent = () => {
    if (!targetText) return null;

    // Split target text into words keeping space delimiters
    const words = targetText.split(/(\s+)/);
    let charGlobalIndex = 0;

    return words.map((word, wordIndex) => {
      const wordStart = charGlobalIndex;
      const wordEnd = charGlobalIndex + word.length;
      charGlobalIndex += word.length;

      // Handle space tokens
      if (/^\s+$/.test(word)) {
        const isCurrentSpace = typedText.length >= wordStart && typedText.length < wordEnd;
        return (
          <span key={wordIndex} className="relative inline">
            {isCurrentSpace && (
              <span
                className="absolute left-0 bg-[hsl(var(--primary))] animate-pulse rounded-full"
                style={{ width: '2.5px', top: '10%', height: '80%', zIndex: 10 }}
              />
            )}
            {word.replace(/ /g, '\u00A0')}
          </span>
        );
      }

      // 1. Untyped word (upcoming)
      if (typedText.length <= wordStart) {
        return (
          <span key={wordIndex} className="inline-block text-[hsl(var(--foreground))]">
            {word}
          </span>
        );
      }

      // 2. Completely typed word (past) - clean dimmed text, no red/green
      if (typedText.length >= wordEnd) {
        return (
          <span key={wordIndex} className="inline-block text-[hsl(var(--muted-foreground)/0.55)]">
            {word}
          </span>
        );
      }

      // 3. Active word - soft primary highlight, no red/green
      const typedOffset = typedText.length - wordStart;
      const typedPart = word.slice(0, typedOffset);
      const untypedPart = word.slice(typedOffset);

      return (
        <span key={wordIndex} className="inline-block relative bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] font-semibold rounded px-1">
          <span>{typedPart}</span>
          <span
            className="inline-block bg-[hsl(var(--primary))] animate-pulse rounded-full align-middle mx-[0.5px]"
            style={{ width: '2.5px', height: '1.2em' }}
          />
          <span className="opacity-70">{untypedPart}</span>
        </span>
      );
    });
  };

  // Render user's typed text with green (correct) and red (incorrect) word colors
  const renderTypedTextPreview = () => {
    if (!typedText) return null;

    const targetWords = targetText.trim().split(/\s+/);
    const typedWords = typedText.split(/\s+/);

    return (
      <div className="mt-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] p-3">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center justify-between">
          <span>टाइप गरिएको पाठ र नतिजा रंग संकेत (Typed Text Color Display):</span>
        </p>
        <div className={`flex flex-wrap gap-1.5 text-lg leading-relaxed ${getDisplayFontClass()}`}>
          {typedWords.map((word, i) => {
            if (!word && i === typedWords.length - 1) return null;
            const targetWord = targetWords[i];
            const isLast = i === typedWords.length - 1 && !isComplete;

            if (isLast) {
              const isMatch = targetWord && targetWord.startsWith(word);
              return (
                <span key={i} className={`px-2 py-0.5 rounded-md font-semibold text-base border transition-colors ${isMatch ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'}`}>
                  {word}
                </span>
              );
            }

            const isCorrect = word === targetWord;
            return (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-md font-semibold text-base border transition-colors ${
                  isCorrect
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40 line-through'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // Render word-by-word accuracy feedback with green/red coloring
  const renderWordFeedback = () => {
    if (!targetText) return null;

    const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
    const typedWords = typedText.split(/\s+/);

    return (
      <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] p-3.5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            शब्द जाँच (Live Word Accuracy Feedback)
          </span>
          <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            {typedWords.filter((w, i) => i < typedWords.length - 1 && w === targetWords[i]).length} / {targetWords.length} शब्द सही
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
          {targetWords.map((targetWord, idx) => {
            const typedWord = typedWords[idx];
            const isCurrentWord = idx === typedWords.length - 1 && !isComplete;

            if (typedWord === undefined) {
              // Upcoming word
              return (
                <span
                  key={idx}
                  className="rounded-md border border-dashed border-[hsl(var(--border))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground)/0.6)]"
                >
                  {targetWord}
                </span>
              );
            }

            if (isCurrentWord) {
              // Word currently being typed
              const isMatchSoFar = targetWord.startsWith(typedWord);
              return (
                <span
                  key={idx}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold flex items-center gap-1 animate-pulse ${
                    isMatchSoFar
                      ? 'border-blue-500/60 bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      : 'border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <span className="text-[10px]">✎</span>
                  {typedWord || targetWord}
                </span>
              );
            }

            // Completed word check
            const isCorrect = typedWord === targetWord;
            if (isCorrect) {
              return (
                <span
                  key={idx}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                >
                  <span className="font-bold">✓</span>
                  {typedWord}
                </span>
              );
            }

            // Incorrect word
            return (
              <span
                key={idx}
                className="rounded-md border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5"
                title={`Expected: ${targetWord}`}
              >
                <span className="line-through">{typedWord || '—'}</span>
                <span className="text-[10px] text-red-500/90 font-normal">({targetWord})</span>
              </span>
            );
          })}
        </div>
      </div>
    );
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
        <div className="mx-auto max-w-4xl px-3 py-3 sm:py-5">
          
          {/* ===== Config Bar ===== */}
          {!isStarted && !showResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm"
            >
              {/* Language Selection */}
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:p-1">
                  {[
                    { id: 'english', label: 'English' },
                    { id: 'nepali-unicode', label: 'Nepali (Unicode)' },
                    { id: 'nepali-preeti', label: 'Nepali (Preeti)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id as LanguageOption)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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
              <div className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:p-1">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDurationChange(d)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:p-1">
                    {(['easy', 'medium', 'hard'] as TextDifficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDifficultyChange(d)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
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

              {/* Numbers & Punctuation Toggles (English only) */}
              {language === 'english' && (
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:p-1 gap-1">
                    <button
                      onClick={() => handleNumbersToggle(!includeNumbers)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        includeNumbers
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                      title="Include Numbers (123)"
                    >
                      # numbers
                    </button>
                    <button
                      onClick={() => handlePunctuationToggle(!includePunctuation)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        includePunctuation
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                      title="Include Punctuation (?, . !)"
                    >
                      ! punctuation
                    </button>
                  </div>
                </div>
              )}

              {/* Keyboard Visibility Toggle */}
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  showKeyboard
                    ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
                title="Toggle Virtual Keyboard"
              >
                {showKeyboard ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>Keyboard</span>
              </button>
            </motion.div>
          )}

          {/* ===== Live Stats Bar ===== */}
          {isStarted && !showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 flex items-center justify-center gap-6 sm:gap-10"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">{liveWpm}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">WPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-[hsl(var(--success))]" />
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">{liveAccuracy}%</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">ACC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className={`h-4 w-4 ${isTimeLow ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--warning))]'}`} />
                <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${isTimeLow ? 'text-[hsl(var(--destructive))]' : ''}`}>
                  {timeRemaining}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">SEC</span>
              </div>
            </motion.div>
          )}

          {/* ===== Progress Bar ===== */}
          {isStarted && !showResult && (
            <div className="mb-3 max-w-2xl mx-auto">
              <Progress value={Math.round((typedText.length / targetText.length) * 100)} className="h-1" />
            </div>
          )}

          {/* ===== Typing Area ===== */}
          {!showResult && (
            <div className="space-y-4">
              {/* BOX 1: Target Text Box */}
              <Card 
                onClick={focusInput}
                className="cursor-text border-[hsl(var(--border))] shadow-md select-none bg-[hsl(var(--card))]"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                      {language === 'nepali-unicode' ? 'नेपाली पाठ बाकस (Target Text to Type)' : 'Target Text to Type'}
                    </span>
                    {!isStarted && (
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <KeyboardIcon className="h-3.5 w-3.5" />
                        Click & start typing to begin
                      </span>
                    )}
                  </div>

                  {/* Scrollable target text frame */}
                  <div
                    ref={textDisplayRef}
                    className={`h-[110px] sm:h-[125px] overflow-hidden text-left scroll-smooth ${getDisplayFontClass()}`}
                  >
                    {renderTextContent()}
                  </div>
                </CardContent>
              </Card>

              {/* BOX 2: Live Typed Nepali Input & Colored Word Feedback Box */}
              <Card className="border-[hsl(var(--primary)/0.3)] shadow-md bg-[hsl(var(--card))]">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="nepali-typing-input" className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] flex items-center gap-1.5 cursor-pointer">
                      <KeyboardIcon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                      {language === 'nepali-unicode' ? 'तपाईँको नेपाली टाइपिंग बाकस (Your Typed Text Box)' : 'Your Typed Text Box'}
                    </label>
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {typedText.length} / {targetText.length} {language === 'nepali-unicode' ? 'अक्षर' : 'chars'}
                    </span>
                  </div>

                  {/* Visible Interactive Input Box */}
                  <textarea
                    id="nepali-typing-input"
                    ref={inputRef}
                    value={typedText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    placeholder={
                      language === 'nepali-unicode'
                        ? 'यहाँ टाइप गर्नुहोस्... (Start typing here in Nepali Unicode)'
                        : 'Start typing here...'
                    }
                    rows={2}
                    className={`w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-lg shadow-inner transition-all focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.25)] ${getDisplayFontClass()}`}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={isComplete}
                  />

                  {/* Live Typed Text Color Preview (Correct=Green, Incorrect=Red) */}
                  {renderTypedTextPreview()}

                  {/* Colored Word Feedback Box */}
                  {renderWordFeedback()}
                </CardContent>
              </Card>

              {/* Controls */}
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleNewTest} className="h-8 gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Test
                </Button>
              </div>
            </div>
          )}

          {/* ===== Dynamic Virtual Keyboard ===== */}
          {!showResult && showKeyboard && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 sm:mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 shadow-sm max-w-3xl mx-auto"
            >
              <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center">
                {keyboardLayout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 justify-center w-full">
                    {row.map((char) => {
                      const isSpace = char === ' ';
                      const isExpected = expectedKey === char;
                      const isPressed = pressedKeys[char];
                      
                      // Match Nepali characters map for keycap labels
                      const getDevanagariLabel = () => {
                        if (language === 'english') return '';
                        const activeMap = language === 'nepali-unicode' ? unicodeKeyboardMap : preetiKeyboardMap;
                        return activeMap[char] || '';
                      };

                      const devanagariLabel = getDevanagariLabel();

                      return (
                        <div
                          key={char}
                          className={`flex flex-col items-center justify-center rounded-md sm:rounded-lg border text-xs font-semibold select-none transition-all duration-75 ${
                            isSpace ? 'w-[200px] sm:w-[260px]' : 'w-[28px] sm:w-[38px]'
                          } h-[34px] sm:h-[38px] ${
                            isPressed 
                              ? 'bg-[hsl(var(--primary))] text-white scale-95 border-transparent shadow-sm'
                              : isExpected 
                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                                : 'border-[hsl(var(--border))] bg-[hsl(var(--keyboard-key))] text-[hsl(var(--muted-foreground))]'
                          }`}
                        >
                          <span className="uppercase text-[9px] sm:text-[10px] opacity-70 leading-none">{isSpace ? 'Space' : char}</span>
                          {devanagariLabel && (
                            <span className="text-[10px] sm:text-[11px] font-bold text-[hsl(var(--foreground))] leading-none mt-0.5">{devanagariLabel}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ===== Results Screen ===== */}
          <AnimatePresence>
            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6"
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
