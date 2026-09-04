'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Flame,
  Zap,
  Shield,
  Play,
  Sparkles,
  Crown,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StickmanArena, type StickmanArenaHandle, type GunType } from '@/components/game/StickmanArena';
import { gameAudio } from '@/lib/gameAudio';

// Firearm combat words
interface FirearmWord {
  word: string;
  gun: GunType;
  label: string;
  ammoName: string;
}

const FIREARM_WORDS: FirearmWord[] = [
  // 🔫 Dual Pistols
  { word: 'PISTOL', gun: 'pistol', label: '🔫 DUAL BLASTERS', ammoName: '9MM ENERGY' },
  { word: 'TRIGGER', gun: 'pistol', label: '🔫 HAIR TRIGGER', ammoName: 'RAPID CASINGS' },
  { word: 'BULLET', gun: 'pistol', label: '🔫 KINETIC SLUG', ammoName: 'HOLLOW POINT' },
  { word: 'REVOLVER', gun: 'pistol', label: '🔫 MAGNUM .44', ammoName: 'HEAVY CYLINDER' },
  { word: 'QUICKDRAW', gun: 'pistol', label: '🔫 SPEEDLOADER', ammoName: 'QUICK RELOAD' },

  // ⚡ Assault Rifle
  { word: 'RIFLE', gun: 'rifle', label: '⚡ PLASMA CARBINE', ammoName: '5.56MM TRACER' },
  { word: 'ASSAULT', gun: 'rifle', label: '⚡ ASSAULT SPREAD', ammoName: 'VELOCITY BURST' },
  { word: 'BURST', gun: 'rifle', label: '⚡ THREE-ROUND BURST', ammoName: 'ARMOR PIERCING' },
  { word: 'AUTOMATIC', gun: 'rifle', label: '⚡ FULL AUTO BARRAGE', ammoName: 'DRUM MAG' },
  { word: 'VELOCITY', gun: 'rifle', label: '⚡ HYPERSONIC RIFLE', ammoName: 'SUPERSONIC' },

  // 💥 Combat Shotgun
  { word: 'SHOTGUN', gun: 'shotgun', label: '💥 COMBAT 12-GAUGE', ammoName: 'BUCKSHOT SPREAD' },
  { word: 'SCATTER', gun: 'shotgun', label: '💥 SCATTER SHOT', ammoName: 'MULTI-PELLET' },
  { word: 'BUCKSHOT', gun: 'shotgun', label: '💥 HEAVY BUCKSHOT', ammoName: 'TUNGSTEN CORE' },
  { word: 'BREACHER', gun: 'shotgun', label: '💥 TACTICAL BREACHER', ammoName: 'EXPLOSIVE SLUG' },

  // 🎯 Sniper Railgun
  { word: 'SNIPER', gun: 'sniper', label: '🎯 50-CAL SNIPER', ammoName: 'GUIDED ROUNDS' },
  { word: 'HEADSHOT', gun: 'sniper', label: '🎯 CRITICAL HEADSHOT', ammoName: 'THERMAL OPTIC' },
  { word: 'CROSSHAIR', gun: 'sniper', label: '🎯 PRECISION SCOPE', ammoName: 'STABILIZED BEAM' },
  { word: 'BALLISTIC', gun: 'sniper', label: '🎯 LONG-RANGE SNIPER', ammoName: 'KINETIC SABOT' },
];

// Enemy Gunner Roster
const ENEMY_ROSTER = [
  { wave: 1, name: 'SHADOW GUNNER', isBoss: false, health: 90 },
  { wave: 2, name: 'CYBER TROOPER', isBoss: false, health: 100 },
  { wave: 3, name: '👑 WAR MACHINE TITAN', isBoss: true, health: 140 },
  { wave: 4, name: 'PLASMA REAPER', isBoss: false, health: 110 },
  { wave: 5, name: 'LASER VANGUARD', isBoss: false, health: 120 },
  { wave: 6, name: '🔥 MECH COMMANDER', isBoss: true, health: 170 },
  { wave: 7, name: 'GHOST OPERATIVE', isBoss: false, health: 130 },
  { wave: 8, name: 'HEAVY ENFORCER', isBoss: false, health: 140 },
  { wave: 9, name: '⚡ DREADNOUGHT PRIME', isBoss: true, health: 200 },
];

export default function GamePage() {
  const arenaRef = useRef<StickmanArenaHandle | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);

  // Ultra Super Meter (0 to 100)
  const [ultraMeter, setUltraMeter] = useState(0);

  // Current Enemy
  const currentEnemyInfo =
    ENEMY_ROSTER.find((e) => e.wave === round) || {
      wave: round,
      name: round % 3 === 0 ? `⚡ OVERLORD MECH-${round}` : `CYBER OUTLAW LVL ${round}`,
      isBoss: round % 3 === 0,
      health: 100 + round * 10,
    };

  const MAX_PLAYER_HEALTH = 100;
  const maxEnemyHealth = currentEnemyInfo.health;
  const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
  const [enemyHealth, setEnemyHealth] = useState(maxEnemyHealth);

  // Active word & firearm
  const [activeWordObj, setActiveWordObj] = useState<FirearmWord>(FIREARM_WORDS[0]);
  const [typedLetters, setTypedLetters] = useState('');
  const [isFiringCannon, setIsFiringCannon] = useState(false);

  // Speed tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeysTyped, setTotalKeysTyped] = useState(0);

  // Pick random word
  const getRandomWord = () => {
    const available = FIREARM_WORDS.filter((w) => w.word !== activeWordObj.word);
    return available[Math.floor(Math.random() * available.length)] || FIREARM_WORDS[0];
  };

  // Toggle sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    gameAudio.enabled = next;
  };

  // Start new duel
  const handleStartGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setRound(1);
    setScore(0);
    setCombo(0);
    setHighestCombo(0);
    setUltraMeter(0);
    setPlayerHealth(MAX_PLAYER_HEALTH);
    setEnemyHealth(ENEMY_ROSTER[0].health);
    setActiveWordObj(FIREARM_WORDS[0]);
    setTypedLetters('');
    setStartTime(Date.now());
    setTotalKeysTyped(0);

    if (arenaRef.current) {
      arenaRef.current.resetDuelists(false);
      arenaRef.current.triggerSpawnEffect();
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Enemy counter-fire timer
  useEffect(() => {
    if (!isPlaying || gameOver || isFiringCannon) return;

    const interval = setInterval(() => {
      if (arenaRef.current && !isFiringCannon) {
        arenaRef.current.triggerEnemyShoot();
        setPlayerHealth((prev) => {
          const damage = currentEnemyInfo.isBoss ? 16 + round * 2 : 10 + round;
          const next = prev - damage;
          if (next <= 0) {
            setGameOver(true);
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
        setCombo(0);
      }
    }, currentEnemyInfo.isBoss ? 3800 : 4400);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, isFiringCannon, round, currentEnemyInfo.isBoss]);

  // Keep focus on input
  const focusInput = () => {
    if (isPlaying && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [isPlaying, activeWordObj]);

  // Handle Keystrokes -> SHOOT GUN!
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isPlaying || gameOver || isFiringCannon) return;

    const pressedKey = e.key.toUpperCase();

    // Trigger Heavy Cannon Finisher via Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (typedLetters.length > 0 || ultraMeter >= 100) {
        triggerCannonBlast();
      }
      return;
    }

    if (pressedKey.length !== 1 || !/[A-Z]/.test(pressedKey)) {
      return;
    }

    const expectedIndex = typedLetters.length;
    const expectedChar = activeWordObj.word[expectedIndex];

    if (pressedKey === expectedChar) {
      // Correct letter -> BANG! SHOOT GUN!
      const newTyped = typedLetters + pressedKey;
      setTypedLetters(newTyped);
      setTotalKeysTyped((prev) => prev + 1);

      const isCrit = combo >= 5 || activeWordObj.gun === 'sniper';

      if (arenaRef.current) {
        arenaRef.current.triggerShoot(activeWordObj.gun, isCrit);
      }

      setUltraMeter((prev) => Math.min(100, prev + 5));

      const damage = isCrit ? 14 : activeWordObj.gun === 'shotgun' ? 16 : 10;
      setEnemyHealth((prev) => Math.max(1, prev - damage));

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > highestCombo) setHighestCombo(nextCombo);

      if (nextCombo % 5 === 0) {
        gameAudio.playComboJingle(nextCombo);
      }

      setScore((prev) => prev + 35 + nextCombo * 10);

      // Word completed -> FIRE CANNON BEAM!
      if (newTyped.length === activeWordObj.word.length) {
        triggerCannonBlast();
      }
    } else {
      // Mistake! Enemy immediately shoots back!
      setCombo(0);
      if (arenaRef.current) {
        arenaRef.current.triggerEnemyShoot();
      }
      setPlayerHealth((prev) => {
        const next = prev - 8;
        if (next <= 0) {
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }
  };

  // Heavy Railgun Cannon Finisher
  const triggerCannonBlast = () => {
    if (isFiringCannon) return;
    setIsFiringCannon(true);

    const isMaxUltra = ultraMeter >= 100;
    if (isMaxUltra) {
      setUltraMeter(0);
    }

    if (arenaRef.current) {
      arenaRef.current.triggerCannonFinisher(isMaxUltra, () => {
        const cannonBaseDmg = isMaxUltra ? 70 : 35;
        const damage = cannonBaseDmg + combo * 5;

        setEnemyHealth((prev) => {
          const next = prev - damage;
          if (next <= 0) {
            gameAudio.playVictory();
            const nextRound = round + 1;
            setRound(nextRound);
            setScore((s) => s + (currentEnemyInfo.isBoss ? 1500 : 600) * round);
            setPlayerHealth((h) => Math.min(MAX_PLAYER_HEALTH, h + (currentEnemyInfo.isBoss ? 45 : 30)));

            const nextEnemy =
              ENEMY_ROSTER.find((e) => e.wave === nextRound) || {
                wave: nextRound,
                name: nextRound % 3 === 0 ? `⚡ TITAN MECH-${nextRound}` : `CYBER ENFORCER LVL ${nextRound}`,
                isBoss: nextRound % 3 === 0,
                health: 100 + nextRound * 10,
              };

            setEnemyHealth(nextEnemy.health);

            if (nextEnemy.isBoss) {
              gameAudio.playBossRoar();
            }

            if (arenaRef.current) {
              arenaRef.current.resetDuelists(nextEnemy.isBoss);
              arenaRef.current.triggerSpawnEffect();
            }
          }
          return Math.max(0, next);
        });

        setActiveWordObj(getRandomWord());
        setTypedLetters('');
        setIsFiringCannon(false);
        setTimeout(focusInput, 50);
      });
    }
  };

  // Speed tracking
  const elapsedMinutes = startTime ? Math.max(0.1, (Date.now() - startTime) / 60000) : 1;
  const liveWpm = Math.round(totalKeysTyped / 5 / elapsedMinutes);

  const getGunBadgeStyle = (gun: GunType) => {
    switch (gun) {
      case 'shotgun':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'rifle':
        return 'bg-blue-500/20 text-[#38bdf8] border-[#38bdf8]/40';
      case 'sniper':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[hsl(var(--background))] select-none overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col justify-between px-3 sm:px-6 py-2 max-w-5xl mx-auto w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden gap-2">
        
        {/* Top 1-Line Compact Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-xs">
              <Crosshair className="h-4 w-4" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              STICKMAN GUN SHOOTOUT
              {currentEnemyInfo.isBoss && (
                <Badge className="bg-gradient-to-r from-purple-600 to-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0">
                  BOSS DUEL
                </Badge>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="h-7 px-2 text-[11px] gap-1"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-[#38bdf8]" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              )}
              <span>{soundEnabled ? 'Audio ON' : 'Muted'}</span>
            </Button>
            {isPlaying && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartGame}
                className="h-7 px-2 text-[11px] text-[hsl(var(--muted-foreground))]"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* 1-Line Sleek Arcade Ribbon (Stats + Ultra Meter) */}
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs flex-shrink-0 text-xs">
          {/* Wave */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">
              {currentEnemyInfo.isBoss ? <Crown className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
            </span>
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Wave:</span>
            <span className="font-black tabular-nums">{round}</span>
          </div>

          {/* Kill Streak */}
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Streak:</span>
            <span className="font-black text-[#38bdf8] tabular-nums">{combo}x</span>
          </div>

          {/* Speed WPM */}
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Fire Rate:</span>
            <span className="font-black tabular-nums">{liveWpm} WPM</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-bold uppercase text-[10px] text-[hsl(var(--muted-foreground))]">Score:</span>
            <span className="font-black text-purple-400 tabular-nums">{score}</span>
          </div>

          {/* Integrated Ultra Meter Bar */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[180px]">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Ultra</span>
            <div className="relative flex-1 h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  ultraMeter >= 100
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-[#38bdf8]'
                }`}
                style={{ width: `${ultraMeter}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-300 tabular-nums">{ultraMeter}%</span>
          </div>
        </div>

        {/* Stickman Arena (Flexible Responsive Canvas Viewport) */}
        <div
          onClick={focusInput}
          className="flex-1 min-h-0 flex items-center justify-center relative w-full overflow-hidden cursor-pointer"
        >
          <div className="w-full h-full flex items-center justify-center max-h-[44vh]">
            <StickmanArena
              ref={arenaRef}
              playerHealth={playerHealth}
              enemyHealth={enemyHealth}
              maxHealth={maxEnemyHealth}
              enemyName={currentEnemyInfo.name}
              isBoss={currentEnemyInfo.isBoss}
            />
          </div>
        </div>

        {/* Gun Typing Command Center */}
        <Card
          onClick={focusInput}
          className="border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg p-3 sm:p-4 relative overflow-hidden flex-shrink-0 cursor-pointer"
        >
          {/* Hidden Input for capturing keystrokes */}
          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyDown}
            className="absolute -left-[9999px] top-0 opacity-0 h-0 w-0 pointer-events-none"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {!isPlaying ? (
            <div className="py-4 text-center space-y-2">
              <h3 className="text-lg font-black flex items-center justify-center gap-2">
                <Crosshair className="h-5 w-5 text-amber-500" />
                STICKMAN GUN SHOOTOUT DUEL
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                Type letters to pull the trigger! Complete words or hit [Space] for the Railgun Cannon blast!
              </p>
              <Button
                size="sm"
                onClick={handleStartGame}
                className="gap-1.5 font-bold px-6 shadow-md shadow-amber-500/20 text-xs"
              >
                <Play className="h-3.5 w-3.5" />
                START DUEL
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active Weapon Header */}
              <div className="flex items-center justify-between flex-wrap gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] text-[10px]">
                    EQUIPPED:
                  </span>
                  <Badge variant="outline" className={`text-[10px] font-extrabold uppercase px-2 py-0 ${getGunBadgeStyle(activeWordObj.gun)}`}>
                    {activeWordObj.label}
                  </Badge>
                  <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] hidden sm:inline">
                    ({activeWordObj.ammoName})
                  </span>
                </div>

                <span className={`text-[11px] font-black tracking-wide ${
                  ultraMeter >= 100 ? 'text-amber-400 animate-bounce' : 'text-[#38bdf8]'
                }`}>
                  {ultraMeter >= 100
                    ? '⚡ ULTRA FULL! HIT [SPACE] FOR RAILGUN CANNON! 💥'
                    : 'COMPLETE WORD OR HIT [SPACE] FOR BEAM CANNON! ⚡'}
                </span>
              </div>

              {/* Big Letter Tiles Display */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1 flex-wrap">
                {activeWordObj.word.split('').map((char, index) => {
                  const isTyped = index < typedLetters.length;
                  const isCurrent = index === typedLetters.length;

                  return (
                    <motion.div
                      key={index}
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                      className={`w-10 h-13 sm:w-13 sm:h-16 flex items-center justify-center text-xl sm:text-3xl font-black rounded-lg border-2 transition-all shadow-sm ${
                        isTyped
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20'
                          : isCurrent
                          ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8] shadow-[#38bdf8]/30 ring-2 ring-[#38bdf8]/40'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {char}
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))] pt-1.5 border-t border-[hsl(var(--border))]">
                <span>Rounds Fired: {typedLetters.length} / {activeWordObj.word.length}</span>
                <span className="text-[#38bdf8] font-bold">
                  {isFiringCannon
                    ? '💥 HEAVY RAILGUN BLASTING! BANG BANG!'
                    : 'Type each letter to shoot!'}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* 1-Line Compact Armory Guide Footer */}
        <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))] px-1 py-0.5 border-t border-[hsl(var(--border))] flex-shrink-0">
          <span>🔫 Pistols: Rapid fire</span>
          <span>⚡ Rifle: Tracers</span>
          <span>💥 Shotgun: 4-pellet spread</span>
          <span>🎯 Sniper: Piercing crit</span>
          <span className="font-bold text-[#38bdf8]">[Space]: Railgun Cannon</span>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            >
              <div className="rounded-2xl border-2 border-red-500/40 bg-[hsl(var(--card))] p-6 shadow-2xl text-center space-y-4 max-w-sm w-full">
                <h2 className="text-2xl font-black text-red-500">OUTGUNNED!</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {currentEnemyInfo.name} shot you down. You reached Wave {round}!
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[9px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Score</p>
                    <p className="text-lg font-extrabold text-[#38bdf8]">{score}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[9px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Wave</p>
                    <p className="text-lg font-extrabold">{round}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-[9px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Streak</p>
                    <p className="text-lg font-extrabold text-amber-400">{highestCombo}x</p>
                  </div>
                </div>

                <Button size="sm" onClick={handleStartGame} className="w-full gap-1.5 font-bold">
                  <RotateCcw className="h-3.5 w-3.5" />
                  TRY AGAIN
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
