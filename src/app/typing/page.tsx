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
  Globe,
  Loader2,
  Eye,
  EyeOff,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layout/navbar';
import { generateText, type TextDifficulty } from '@/lib/texts';
import { getRandomNepaliText } from '@/lib/nepaliTexts';
import type { TypingResult, MistypedKey, SlowestKey } from '@/types';



// ===== Types =====
type LanguageOption = 'english' | 'nepali-unicode' | 'nepali-preeti' | 'nepali-kantipur';
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
  ['shift_l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift_r'],
  [' ']
];

export default function TypingPage() {
  
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
  const [hideCompletedLines, setHideCompletedLines] = useState<boolean>(true);
  const [lineOffsetY, setLineOffsetY] = useState<number>(0);
  const [isCustomDurationOpen, setIsCustomDurationOpen] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');


  
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

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const lastLineTopRef = useRef<number>(0);
  const keystrokesRef = useRef<{ char: string; expected: string; timestamp: number; isCorrect: boolean; latency: number }[]>([]);
  const typedTextRef = useRef<string>('');
  const startTimeRef = useRef<number | null>(null);
  const handleTestCompleteRef = useRef<(finalValue?: string) => void>(() => {});
  const isCompleteRef = useRef<boolean>(false);

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
    } else if (lang === 'nepali-kantipur') {
      return getRandomNepaliText('kantipur');
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
      } else if (langParam === 'kantipur' || langParam === 'nepali-kantipur') {
        setLanguage('nepali-kantipur');
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
          if (next >= duration && !isCompleteRef.current) {
            // Use setTimeout to avoid calling setState from within another setState updater
            setTimeout(() => handleTestCompleteRef.current(), 0);
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

  // Fast Line-Sliding Handler (Slides completed lines up when moving past line 2)
  useEffect(() => {
    if (!textDisplayRef.current || isComplete) return;

    const container = textDisplayRef.current;
    const activeWordEl = container.querySelector('.typing-word-active') as HTMLElement;
    if (!activeWordEl) return;

    const wordTop = activeWordEl.offsetTop;

    if (wordTop <= 28) {
      if (lineOffsetY !== 0) setLineOffsetY(0);
    } else {
      const lineStep = 42;
      const lineIndex = Math.floor((wordTop - 8) / lineStep);
      const targetOffset = lineIndex >= 2 ? Math.max(0, (lineIndex - 1) * lineStep) : 0;
      if (lineOffsetY !== targetOffset) {
        setLineOffsetY(targetOffset);
      }
    }
  }, [typedText, isComplete, lineOffsetY]);

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
    if (e.key === 'Shift') {
      setPressedKeys((prev) => ({ ...prev, shift: true, shift_l: true, shift_r: true }));
    } else {
      setPressedKeys((prev) => ({ ...prev, [keyStr]: true }));
    }

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
    if (e.key === 'Shift') {
      setPressedKeys((prev) => ({ ...prev, shift: false, shift_l: false, shift_r: false }));
    } else {
      const keyStr = e.key.toLowerCase();
      setPressedKeys((prev) => ({ ...prev, [keyStr]: false }));
    }
  };

  // Complete test
  const handleTestComplete = (finalValue?: string) => {
    if (isCompleteRef.current) return; // Prevent double-completion
    if (timerRef.current) clearInterval(timerRef.current);
    setIsComplete(true);
    isCompleteRef.current = true;
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

  // Keep ref in sync so the timer always calls the latest handleTestComplete
  handleTestCompleteRef.current = handleTestComplete;

  // Reset test state
  const handleNewTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsStarted(false);
    setIsComplete(false);
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setBackspaceCount(0);
    setLineOffsetY(0);
    setTypedText('');
    typedTextRef.current = '';
    setResult(null);
    setShowResult(false);
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
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
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
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
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
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
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
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
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
    isCompleteRef.current = false;
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setResult(null);
    setShowResult(false);
    setPendingMatra(null);
    setTargetText(loadText(language, duration, difficulty, includeNumbers, punct));
    setTimeout(focusInput, 50);
  };

  // (Save session removed — no login system)

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

  // Font family helper — respects language
  const getDisplayFontClass = () => {
    if (language === 'nepali-preeti') {
      return 'font-preeti font-normal text-2xl sm:text-3xl tracking-normal leading-[2.2]';
    }
    if (language === 'nepali-kantipur') {
      return 'font-kantipur font-normal text-2xl sm:text-3xl tracking-normal leading-[2.2]';
    }
    const sizeClass = language === 'nepali-unicode'
      ? 'text-xl sm:text-2xl'
      : 'text-lg sm:text-xl';
    return `font-mono font-medium ${sizeClass} tracking-normal leading-[2.2]`;
  };

  // Expected keyboard key & Shift requirement logic
  const getExpectedCharInfo = () => {
    if (isComplete || !targetText) return { key: null, requiresShift: false };
    const char = targetText[typedText.length];
    if (!char) return { key: null, requiresShift: false };

    const shiftSymbols = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'];
    const isUppercase = (char >= 'A' && char <= 'Z') || shiftSymbols.includes(char);

    if (language === 'english' || language === 'nepali-preeti' || language === 'nepali-kantipur') {
      return { key: char.toLowerCase(), requiresShift: isUppercase };
    }

    if (char === ' ') return { key: ' ', requiresShift: false };

    const activeMap = language === 'nepali-unicode' ? unicodeKeyboardMap : preetiKeyboardMap;
    const entry = Object.entries(activeMap).find(([k, v]) => v === char);
    if (entry) {
      const rawKey = entry[0];
      const needsShift = (rawKey >= 'A' && rawKey <= 'Z') || shiftSymbols.includes(rawKey);
      return { key: rawKey.toLowerCase(), requiresShift: needsShift };
    }

    return { key: null, requiresShift: false };
  };

  const { key: expectedKey, requiresShift: expectedRequiresShift } = getExpectedCharInfo();

  // Rendering target prompt text with GREEN for correct and RED for wrong text
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

      // Check trailing space after word
      const hasTrailingSpace = targetText[wordEnd] === ' ' || targetText[wordEnd] === '\t' || targetText[wordEnd] === '\n';
      const completeBoundary = hasTrailingSpace ? wordEnd + 1 : wordEnd;

      // 1. Active word (currently typing)
      if (typedText.length >= wordStart && typedText.length < completeBoundary) {
        const typedOffset = Math.min(word.length, typedText.length - wordStart);
        const typedPart = word.slice(0, typedOffset);
        const untypedPart = word.slice(typedOffset);

        // Render typed characters with GREEN (correct) or RED (incorrect)
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
            className="typing-word typing-word-active inline-block relative text-[hsl(var(--foreground))]"
          >
            <span>{renderedTypedChars}</span>
            <span
              className="inline-block bg-[hsl(var(--primary))] animate-pulse rounded-full align-middle mx-[0.5px]"
              style={{ width: '2.5px', height: '1.2em' }}
            />
            <span className="text-[hsl(var(--foreground))]">{untypedPart}</span>
          </span>
        );
      }

      // 2. Past completed word -> GREEN if correct, RED if incorrect!
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
          className="typing-word inline-block text-[hsl(var(--foreground))]"
        >
          {word}
        </span>
      );
    });
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))] mx-auto" />
            <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium animate-pulse">Preparing typing test...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-3 py-4 sm:py-6">
          
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
                    { id: 'nepali-kantipur', label: 'Nepali (Kantipur)' },
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
                <div className="flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:p-1 gap-1">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setIsCustomDurationOpen(false);
                        handleDurationChange(d);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        duration === d && !isCustomDurationOpen
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}

                  {/* Custom Duration Button / Form */}
                  {isCustomDurationOpen ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseInt(customDurationInput, 10);
                        if (!isNaN(val) && val >= 5 && val <= 3600) {
                          handleDurationChange(val);
                          setIsCustomDurationOpen(false);
                        }
                      }}
                      className="flex items-center gap-1 border-l border-[hsl(var(--border))] pl-1.5"
                    >
                      <input
                        type="number"
                        autoFocus
                        min={5}
                        max={3600}
                        placeholder="Sec"
                        value={customDurationInput}
                        onChange={(e) => setCustomDurationInput(e.target.value)}
                        className="w-16 rounded bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                      />
                      <button
                        type="submit"
                        className="rounded bg-[hsl(var(--primary))] px-2 py-0.5 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
                      >
                        Set
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomDurationOpen(false)}
                        className="rounded px-1.5 py-0.5 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setCustomDurationInput(!durations.includes(duration as any) ? String(duration) : '');
                        setIsCustomDurationOpen(true);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        !durations.includes(duration as any)
                          ? 'bg-[hsl(var(--primary))] text-white font-semibold'
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                      }`}
                      title="Set custom duration in seconds"
                    >
                      {!durations.includes(duration as any) ? `${duration}s (Custom)` : 'Custom'}
                    </button>
                  )}
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

              {/* Line Hiding Toggle */}
              <button
                onClick={() => setHideCompletedLines(!hideCompletedLines)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  hideCompletedLines
                    ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-bold'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
                title="Hide completed lines when moving to next line (re-appears on Backspace)"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>{hideCompletedLines ? 'Line Hiding: ON' : 'Line Hiding: OFF'}</span>
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
                        Click &amp; start typing to begin
                      </span>
                    )}
                  </div>

                  {/* Target text frame (Fast GPU-accelerated Line Sliding Window) */}
                  <div
                    ref={textDisplayRef}
                    className={`min-h-[160px] sm:min-h-[190px] max-h-[220px] overflow-hidden text-left ${getDisplayFontClass()}`}
                  >
                    <div
                      className="transition-transform duration-100 ease-out"
                      style={{ transform: `translateY(-${lineOffsetY}px)` }}
                    >
                      {renderTextContent()}
                    </div>
                  </div>

                  {/* Hidden textarea for capturing keystrokes */}
                  <textarea
                    id="nepali-typing-input"
                    ref={inputRef}
                    value={typedText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    rows={1}
                    className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    disabled={isComplete}
                  />
                </CardContent>
              </Card>

              {/* Controls */}
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleNewTest} className="h-8 gap-1.5 text-xs text-[hsl(var(--muted-foreground))]"><RotateCcw className="h-3.5 w-3.5" />Restart Test</Button>
              </div>
            </div>
          )}

          {/* ===== Dynamic Virtual Keyboard ===== */}
          {!showResult && showKeyboard && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-4 sm:mt-6 max-w-3xl mx-auto"
            >
              {/* Keyboard housing */}
              <div className="relative rounded-2xl border-2 border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--muted)/0.7)] p-3 sm:p-5 shadow-2xl shadow-[hsl(var(--primary)/0.1)]">

                {/* Top shine */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="space-y-1.5 sm:space-y-2 flex flex-col items-center">
                  {keyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className={`flex gap-1 sm:gap-1.5 justify-center w-full ${rowIndex === 1 ? 'pl-2 sm:pl-4' : ''}`}>
                      {row.map((char) => {
                        const isSpace = char === ' ';
                        const isShift = char === 'shift_l' || char === 'shift_r';
                        
                        const isExpected = isShift ? expectedRequiresShift : (expectedKey === char);
                        const isPressed = isShift ? (pressedKeys['shift'] || pressedKeys[char]) : pressedKeys[char];

                        // Devanagari label
                        const getDevanagariLabel = () => {
                          if (language === 'english' || isShift) return '';
                          const activeMap = (language === 'nepali-unicode') ? unicodeKeyboardMap : preetiKeyboardMap;
                          return activeMap[char] || '';
                        };
                        const devanagariLabel = getDevanagariLabel();

                        // Keycap width sizing
                        let keyWidthClass = 'w-[30px] sm:w-[42px]';
                        if (isSpace) keyWidthClass = 'w-[180px] sm:w-[240px]';
                        if (isShift) keyWidthClass = 'w-[50px] sm:w-[68px]';

                        // Black & White (Monochrome) idle keycap styling
                        const monochromeIdleClass = 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold';

                        // Glowing highlight style when key is expected to be pressed
                        const glowingExpectedClass = isShift
                          ? 'border-rose-500 bg-rose-500 text-white shadow-[0_0_26px_9px_rgba(244,63,94,0.9)] animate-pulse scale-105 font-extrabold'
                          : 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white shadow-[0_0_26px_9px_rgba(59,130,246,0.85)] animate-pulse scale-105 font-extrabold';

                        // Pressed key style
                        const pressedClass = 'scale-90 border-transparent bg-indigo-600 dark:bg-indigo-500 text-white shadow-none translate-y-0.5 font-black';

                        return (
                          <div
                            key={char}
                            className={[
                              'relative flex flex-col items-center justify-center select-none',
                              'rounded-lg border-2 transition-all duration-75',
                              keyWidthClass,
                              'h-[36px] sm:h-[42px]',
                              // state-based styles
                              isPressed
                                ? pressedClass
                                : isExpected
                                  ? glowingExpectedClass
                                  : monochromeIdleClass,
                              // 3D keycap bottom shadow for black & white keys
                              !isPressed && !isExpected ? 'shadow-[0_3px_0_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_0_rgba(0,0,0,0.6)]' : '',
                            ].join(' ')}
                          >
                            {/* Key label */}
                            <span className={`uppercase leading-none ${isShift ? 'text-[9px] sm:text-[11px] font-black tracking-wider flex items-center gap-0.5' : isSpace ? 'text-[10px] sm:text-xs tracking-widest font-extrabold' : 'text-[10px] sm:text-[13px] font-extrabold'}`}>
                              {isShift ? '⇧ SHIFT' : isSpace ? 'SPACE' : char}
                            </span>
                            {/* Devanagari sub-label */}
                            {devanagariLabel && (
                              <span className="text-[9px] sm:text-[11px] font-extrabold leading-none mt-0.5 opacity-90">
                                {devanagariLabel}
                              </span>
                            )}
                            {/* Glow ring animation when key is expected */}
                            {isExpected && !isPressed && (
                              <span className="pointer-events-none absolute inset-0 rounded-lg border-2 border-current opacity-75 animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Status Legend */}
                <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-zinc-400 bg-white dark:bg-zinc-900 shadow-xs" />
                    Standard Key (Black & White)
                  </span>
                  <span className="flex items-center gap-1.5 text-[hsl(var(--primary))]">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    Next Key (Glowing)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    Shift Key (Glowing)
                  </span>
                </div>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
