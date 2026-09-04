'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { gameAudio } from '@/lib/gameAudio';

export type GunType = 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'cannon';

export interface StickmanArenaHandle {
  triggerShoot: (gun: GunType, isCrit?: boolean) => void;
  triggerCannonFinisher: (isMaxUltra?: boolean, onComplete?: () => void) => void;
  triggerEnemyShoot: () => void;
  resetDuelists: (isBoss?: boolean) => void;
  triggerSpawnEffect: () => void;
}

interface StickmanArenaProps {
  playerHealth: number;
  enemyHealth: number;
  maxHealth: number;
  enemyName?: string;
  isBoss?: boolean;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  length: number;
  width: number;
  fromPlayer: boolean;
  damage: number;
  isCrit: boolean;
}

interface ShellCasing {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  glow?: boolean;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
  isCrit?: boolean;
}

export const StickmanArena = forwardRef<StickmanArenaHandle, StickmanArenaProps>(
  ({ playerHealth, enemyHealth, maxHealth, enemyName = 'SHADOW GUNNER', isBoss = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Delayed Ghost health bars
    const [playerGhostHealth, setPlayerGhostHealth] = useState(playerHealth);
    const [enemyGhostHealth, setEnemyGhostHealth] = useState(enemyHealth);

    useEffect(() => {
      const timer = setTimeout(() => {
        setPlayerGhostHealth(playerHealth);
      }, 400);
      return () => clearTimeout(timer);
    }, [playerHealth]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setEnemyGhostHealth(enemyHealth);
      }, 400);
      return () => clearTimeout(timer);
    }, [enemyHealth]);

    // Duel State & Projectiles
    const stateRef = useRef({
      // Player
      playerX: 190,
      playerY: 260,
      playerRecoil: 0,
      playerGun: 'pistol' as GunType,
      playerMuzzleFlash: 0,

      // Enemy
      enemyX: 590,
      enemyY: 260,
      enemyRecoil: 0,
      enemyMuzzleFlash: 0,
      isBoss: isBoss,

      // Projectiles & Shells
      bullets: [] as Bullet[],
      shells: [] as ShellCasing[],
      particles: [] as Particle[],
      floatTexts: [] as FloatText[],

      // Finisher Cannon State
      beamActive: false,
      isMegaBeam: false,
      shakeAmount: 0,
      ambientEmbers: [] as { x: number; y: number; speedY: number; size: number; alpha: number }[],
    });

    useEffect(() => {
      stateRef.current.isBoss = isBoss;
    }, [isBoss]);

    // Initialize ambient sparks
    useEffect(() => {
      const s = stateRef.current;
      s.ambientEmbers = [];
      for (let i = 0; i < 25; i++) {
        s.ambientEmbers.push({
          x: Math.random() * 800,
          y: Math.random() * 340,
          speedY: Math.random() * 0.5 + 0.2,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    }, []);

    // Expose shoot methods to parent
    useImperativeHandle(ref, () => ({
      triggerShoot: (gun: GunType = 'pistol', isCrit: boolean = false) => {
        const s = stateRef.current;
        s.playerGun = gun;
        s.playerRecoil = isCrit ? 10 : 7;
        s.playerMuzzleFlash = 5;
        s.shakeAmount = gun === 'shotgun' ? 6 : isCrit ? 4 : 2;

        // Gun muzzle origin
        const muzzleX = s.playerX + 54;
        const muzzleY = s.playerY - 48;

        // Play Gunshot Audio
        if (gun === 'shotgun') {
          gameAudio.playShotgun();
        } else if (gun === 'rifle') {
          gameAudio.playRifle();
        } else if (gun === 'sniper') {
          gameAudio.playSniper();
        } else {
          gameAudio.playPistol();
        }

        // Spawn Ejected Brass Shell Casing
        s.shells.push({
          x: muzzleX - 12,
          y: muzzleY - 4,
          vx: -(Math.random() * 3 + 2),
          vy: -(Math.random() * 4 + 3),
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.4,
          alpha: 1,
        });

        // Spawn Bullets (Shotgun fires 4 pellets, others fire 1-2 high speed bullets)
        const bulletCount = gun === 'shotgun' ? 4 : 1;
        const bulletColors =
          gun === 'sniper'
            ? '#38bdf8'
            : gun === 'shotgun'
            ? '#f97316'
            : isCrit
            ? '#fbbf24'
            : '#fde047';

        for (let b = 0; b < bulletCount; b++) {
          const spreadY = gun === 'shotgun' ? (b - 1.5) * 3 : (Math.random() - 0.5) * 2;
          const damage = isCrit ? 25 : gun === 'shotgun' ? 22 : 12;

          s.bullets.push({
            id: Math.random(),
            x: muzzleX,
            y: muzzleY + spreadY,
            vx: gun === 'sniper' ? 36 : 28,
            vy: spreadY * 0.4,
            color: bulletColors,
            length: gun === 'sniper' ? 34 : 18,
            width: gun === 'sniper' ? 4 : 2.5,
            fromPlayer: true,
            damage,
            isCrit,
          });
        }

        // Muzzle flash spark particles
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: muzzleX,
            y: muzzleY,
            vx: Math.random() * 6 + 2,
            vy: (Math.random() - 0.5) * 4,
            color: '#f59e0b',
            size: Math.random() * 3 + 1,
            alpha: 1,
            decay: 0.08,
            glow: true,
          });
        }
      },

      triggerCannonFinisher: (isMaxUltra: boolean = false, onComplete?: () => void) => {
        const s = stateRef.current;
        s.playerGun = 'cannon';
        s.isMegaBeam = isMaxUltra;

        // Step 1: Deploy heavy railgun cannon & charge
        s.playerRecoil = 12;
        gameAudio.playCannonBeam();

        // Charge rings
        const muzzleX = s.playerX + 65;
        const muzzleY = s.playerY - 48;
        for (let i = 0; i < 25; i++) {
          s.particles.push({
            x: muzzleX + (Math.random() * 40 - 20),
            y: muzzleY + (Math.random() * 40 - 20),
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: isMaxUltra ? '#c084fc' : '#38bdf8',
            size: Math.random() * 5 + 2,
            alpha: 1,
            decay: 0.04,
            glow: true,
          });
        }

        setTimeout(() => {
          // Step 2: FIRE THE RAILGUN BEAM CANNON!
          s.beamActive = true;
          s.shakeAmount = isMaxUltra ? 26 : 18;
          s.enemyRecoil = 25;
          s.enemyX = s.enemyX + 80;

          gameAudio.playBangBang();

          // Float BANG BANG text
          s.floatTexts.push({
            x: s.enemyX - 50,
            y: s.enemyY - 95,
            text: isMaxUltra ? '⚡ ULTRA RAILGUN! BANG BANG! 💥' : '⚡ BANG! BANG! 💥',
            color: isMaxUltra ? '#c084fc' : '#f59e0b',
            alpha: 1,
            vy: -2.8,
            scale: isMaxUltra ? 1.8 : 1.5,
            isCrit: true,
          });

          // Blast particles
          const blastColors = isMaxUltra
            ? ['#c084fc', '#a855f7', '#f59e0b', '#ffffff']
            : ['#38bdf8', '#60a5fa', '#f59e0b', '#ef4444', '#ffffff'];

          for (let i = 0; i < 45; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 3;
            s.particles.push({
              x: s.enemyX,
              y: s.enemyY - 45,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: blastColors[Math.floor(Math.random() * blastColors.length)],
              size: Math.random() * 7 + 3,
              alpha: 1,
              decay: 0.03,
              glow: true,
            });
          }

          setTimeout(() => {
            s.beamActive = false;
            s.playerGun = 'pistol';
            if (onComplete) onComplete();
          }, 650);
        }, 220);
      },

      triggerEnemyShoot: () => {
        const s = stateRef.current;
        s.enemyRecoil = 8;
        s.enemyMuzzleFlash = 5;
        gameAudio.playRifle();

        const muzzleX = s.enemyX - (s.isBoss ? 60 : 45);
        const muzzleY = s.enemyY - 48;

        // Enemy fires red tracer bullet towards player!
        s.bullets.push({
          id: Math.random(),
          x: muzzleX,
          y: muzzleY,
          vx: -24,
          vy: (Math.random() - 0.5) * 2,
          color: '#ef4444',
          length: 20,
          width: 3,
          fromPlayer: false,
          damage: s.isBoss ? 20 : 12,
          isCrit: false,
        });

        // Shell eject
        s.shells.push({
          x: muzzleX + 12,
          y: muzzleY - 4,
          vx: Math.random() * 3 + 2,
          vy: -(Math.random() * 4 + 3),
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.4,
          alpha: 1,
        });
      },

      triggerSpawnEffect: () => {
        const s = stateRef.current;
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 1;
          s.particles.push({
            x: 590,
            y: 220,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            color: s.isBoss ? '#a855f7' : '#ef4444',
            size: Math.random() * 8 + 4,
            alpha: 0.8,
            decay: 0.03,
          });
        }
      },

      resetDuelists: (isBossMode: boolean = false) => {
        const s = stateRef.current;
        s.playerX = 190;
        s.playerY = 260;
        s.playerRecoil = 0;
        s.playerGun = 'pistol';
        s.enemyX = 590;
        s.enemyY = 260;
        s.enemyRecoil = 0;
        s.beamActive = false;
        s.bullets = [];
        s.shells = [];
        s.isBoss = isBossMode;
      },
    }));

    // Canvas rendering loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let frame = 0;

      const render = () => {
        frame++;
        const s = stateRef.current;

        // Screen shake
        let offsetX = 0;
        let offsetY = 0;
        if (s.shakeAmount > 0) {
          offsetX = (Math.random() - 0.5) * s.shakeAmount * 2;
          offsetY = (Math.random() - 0.5) * s.shakeAmount * 2;
          s.shakeAmount *= 0.86;
          if (s.shakeAmount < 0.2) s.shakeAmount = 0;
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(offsetX, offsetY);

        // --- BACKDROP ---
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.65, '#0b1120');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Moon
        ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 75, 75, 0, Math.PI * 2);
        ctx.fill();

        // Ambient sparks
        for (const ember of s.ambientEmbers) {
          ember.y -= ember.speedY;
          if (ember.y < 0) {
            ember.y = canvas.height;
            ember.x = Math.random() * canvas.width;
          }
          ctx.fillStyle = `rgba(56, 189, 248, ${ember.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ground Platform
        const groundY = 290;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
        groundGrad.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
        groundGrad.addColorStop(1, 'rgba(15, 23, 42, 1)');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // Glowing floor neon rim
        ctx.strokeStyle = s.beamActive
          ? s.isMegaBeam
            ? '#c084fc'
            : '#38bdf8'
          : 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = s.beamActive ? 5 : 3;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = s.beamActive ? 16 : 8;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 30; x < canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, groundY);
          ctx.lineTo(x + (x - canvas.width / 2) * 0.25, canvas.height);
          ctx.stroke();
        }

        // Return recoil gradually to 0
        if (s.playerRecoil > 0) s.playerRecoil *= 0.8;
        if (s.enemyRecoil > 0) s.enemyRecoil *= 0.8;
        if (s.playerMuzzleFlash > 0) s.playerMuzzleFlash--;
        if (s.enemyMuzzleFlash > 0) s.enemyMuzzleFlash--;

        s.enemyX += (590 - s.enemyX) * 0.1;

        // --- BULLET PROJECTILE ENGINE ---
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          // Check hit detection
          if (b.fromPlayer && b.x >= s.enemyX - 15) {
            // BULLET HITS ENEMY!
            s.bullets.splice(i, 1);
            s.enemyRecoil = 8;
            s.shakeAmount = 4;
            gameAudio.playBulletHit();

            // Hit sparks
            for (let p = 0; p < 8; p++) {
              s.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 8 + 2,
                vy: (Math.random() - 0.5) * 8,
                color: b.color,
                size: Math.random() * 3 + 1.5,
                alpha: 1,
                decay: 0.06,
                glow: true,
              });
            }

            // Damage popup
            s.floatTexts.push({
              x: s.enemyX + (Math.random() * 20 - 10),
              y: s.enemyY - 60,
              text: b.isCrit ? `CRIT! -${b.damage}` : `-${b.damage}`,
              color: b.isCrit ? '#f59e0b' : '#fde047',
              alpha: 1,
              vy: -2.2,
              scale: b.isCrit ? 1.4 : 1,
              isCrit: b.isCrit,
            });
            continue;
          } else if (!b.fromPlayer && b.x <= s.playerX + 15) {
            // BULLET HITS PLAYER!
            s.bullets.splice(i, 1);
            s.playerRecoil = 8;
            s.shakeAmount = 6;
            gameAudio.playBulletHit();

            for (let p = 0; p < 8; p++) {
              s.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 8 - 2,
                vy: (Math.random() - 0.5) * 8,
                color: '#ef4444',
                size: Math.random() * 3 + 1.5,
                alpha: 1,
                decay: 0.06,
              });
            }

            s.floatTexts.push({
              x: s.playerX + 10,
              y: s.playerY - 50,
              text: `-${b.damage}`,
              color: '#ef4444',
              alpha: 1,
              vy: -2,
              scale: 1.2,
            });
            continue;
          }

          // Off-screen removal
          if (b.x > canvas.width + 50 || b.x < -50) {
            s.bullets.splice(i, 1);
            continue;
          }

          // Draw Glowing Tracer Bullet
          ctx.save();
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(b.x - Math.sign(b.vx) * b.length, b.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Bullet bright tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.width, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // --- BRASS SHELL CASING ENGINE ---
        for (let i = s.shells.length - 1; i >= 0; i--) {
          const sh = s.shells[i];
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.vy += 0.35; // gravity
          sh.rot += sh.vrot;

          // Ground bounce
          if (sh.y >= 288) {
            sh.y = 288;
            sh.vy = -sh.vy * 0.45;
            sh.vx *= 0.6;
            if (Math.abs(sh.vy) < 0.5) sh.vy = 0;
            sh.alpha -= 0.02;
          }

          if (sh.alpha <= 0) {
            s.shells.splice(i, 1);
            continue;
          }

          // Draw golden brass shell casing
          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.rot);
          ctx.globalAlpha = sh.alpha;
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-3, -1.5, 6, 3);
          ctx.restore();
        }

        // --- HEAVY BEAM CANNON (If Active) ---
        if (s.beamActive) {
          const startX = s.playerX + 65;
          const startY = s.playerY - 48;
          const endX = s.enemyX + 35;
          const isMega = s.isMegaBeam;

          ctx.strokeStyle = isMega ? 'rgba(192, 132, 252, 0.5)' : 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = isMega ? 46 : 32;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, startY);
          ctx.stroke();

          ctx.strokeStyle = isMega ? 'rgba(232, 121, 249, 0.85)' : 'rgba(125, 211, 252, 0.85)';
          ctx.lineWidth = isMega ? 26 : 18;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, startY);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = isMega ? 12 : 8;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, startY);
          ctx.stroke();

          for (let r = startX + 25; r < endX; r += 40) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(r, startY, isMega ? 10 : 7, isMega ? 24 : 18, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(endX, startY, isMega ? 38 : 28, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- DRAW HERO GUNNER STICKMAN ---
        drawGunStickman(
          ctx,
          s.playerX - s.playerRecoil,
          s.playerY,
          '#38bdf8', // Neon Cyan
          1, // Facing Right
          s.playerGun,
          s.playerMuzzleFlash > 0,
          frame,
          1.0,
          false
        );

        // --- DRAW ENEMY GUNNER STICKMAN ---
        drawGunStickman(
          ctx,
          s.enemyX + s.enemyRecoil,
          s.enemyY,
          s.isBoss ? '#a855f7' : '#ef4444', // Red or Purple Boss
          -1, // Facing Left
          s.isBoss ? 'cannon' : 'rifle',
          s.enemyMuzzleFlash > 0,
          frame,
          s.isBoss ? 1.25 : 1.0,
          s.isBoss
        );

        // --- DRAW PARTICLES ---
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            s.particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          if (p.glow) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;

        // --- DRAW FLOATING COMBAT TEXTS ---
        for (let i = s.floatTexts.length - 1; i >= 0; i--) {
          const ft = s.floatTexts[i];
          ft.y += ft.vy;
          ft.alpha -= 0.024;

          if (ft.alpha <= 0) {
            s.floatTexts.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.font = `black ${Math.round(20 * ft.scale)}px monospace`;
          ctx.fillStyle = ft.color;
          ctx.shadowColor = ft.color;
          ctx.shadowBlur = ft.isCrit ? 14 : 8;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }

        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Draw Gun-Wielding Stickman
    const drawGunStickman = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string,
      dir: number,
      gunType: GunType,
      hasMuzzleFlash: boolean,
      frame: number,
      scale: number = 1.0,
      isBossUnit: boolean = false
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 4.5 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      const idleBounce = Math.sin(frame * 0.16) * 2.5 * scale;

      const headX = x;
      const headY = y - 74 * scale + idleBounce;
      const neckX = x;
      const neckY = y - 56 * scale + idleBounce;
      const hipX = x;
      const hipY = y - 24 * scale + idleBounce;

      // Legs in tactical combat stance
      const lFootX = x - 18 * dir * scale;
      const lFootY = y;
      const rFootX = x + 16 * dir * scale;
      const rFootY = y;

      // 1. Head (Circle)
      ctx.beginPath();
      ctx.arc(headX, headY, 14 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Eye / Tactical Visor
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 4 * dir * scale, headY - 2 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Boss Horns/Armor
      if (isBossUnit) {
        ctx.beginPath();
        ctx.moveTo(headX - 6 * scale, headY - 14 * scale);
        ctx.lineTo(headX - 10 * scale, headY - 26 * scale);
        ctx.moveTo(headX + 6 * scale, headY - 14 * scale);
        ctx.lineTo(headX + 10 * scale, headY - 26 * scale);
        ctx.stroke();
      }

      // 2. Spine / Torso (Straight Line)
      ctx.beginPath();
      ctx.moveTo(neckX, neckY);
      ctx.lineTo(hipX, hipY);
      ctx.stroke();

      // 3. Legs
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 10 * dir * scale, hipY + 18 * scale);
      ctx.lineTo(lFootX, lFootY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 10 * dir * scale, hipY + 18 * scale);
      ctx.lineTo(rFootX, rFootY);
      ctx.stroke();

      // 4. Arms Holding Gun
      const gunOriginX = x + 24 * dir * scale;
      const gunOriginY = y - 48 * scale;

      // Left support arm
      ctx.beginPath();
      ctx.moveTo(neckX, neckY + 4 * scale);
      ctx.lineTo(x + 12 * dir * scale, gunOriginY + 6 * scale);
      ctx.lineTo(gunOriginX + 14 * dir * scale, gunOriginY + 2 * scale);
      ctx.stroke();

      // Right trigger arm
      ctx.beginPath();
      ctx.moveTo(neckX, neckY + 4 * scale);
      ctx.lineTo(x + 16 * dir * scale, gunOriginY - 4 * scale);
      ctx.lineTo(gunOriginX, gunOriginY);
      ctx.stroke();

      // 5. DRAW FIREARM IN HANDS
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillStyle = '#1e293b';
      ctx.lineWidth = 3.5 * scale;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;

      let barrelTipX = gunOriginX + 28 * dir * scale;
      let barrelTipY = gunOriginY;

      if (gunType === 'cannon') {
        // Heavy Railgun Cannon!
        barrelTipX = gunOriginX + 42 * dir * scale;
        barrelTipY = gunOriginY;

        // Cannon body
        ctx.fillRect(
          dir === 1 ? gunOriginX - 6 * scale : gunOriginX - 36 * scale,
          gunOriginY - 8 * scale,
          42 * scale,
          16 * scale
        );
        ctx.strokeRect(
          dir === 1 ? gunOriginX - 6 * scale : gunOriginX - 36 * scale,
          gunOriginY - 8 * scale,
          42 * scale,
          16 * scale
        );

        // Power coil rings
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(gunOriginX + 10 * dir * scale, gunOriginY - 10 * scale);
        ctx.lineTo(gunOriginX + 10 * dir * scale, gunOriginY + 10 * scale);
        ctx.moveTo(gunOriginX + 24 * dir * scale, gunOriginY - 10 * scale);
        ctx.lineTo(gunOriginX + 24 * dir * scale, gunOriginY + 10 * scale);
        ctx.stroke();
      } else if (gunType === 'shotgun') {
        // Combat Shotgun
        barrelTipX = gunOriginX + 32 * dir * scale;
        // Twin barrels
        ctx.beginPath();
        ctx.moveTo(gunOriginX - 4 * dir * scale, gunOriginY);
        ctx.lineTo(barrelTipX, barrelTipY);
        ctx.moveTo(gunOriginX - 4 * dir * scale, gunOriginY + 4 * scale);
        ctx.lineTo(barrelTipX, barrelTipY + 4 * scale);
        // Pump handle
        ctx.moveTo(gunOriginX + 12 * dir * scale, gunOriginY + 6 * scale);
        ctx.lineTo(gunOriginX + 20 * dir * scale, gunOriginY + 6 * scale);
        ctx.stroke();
      } else if (gunType === 'sniper') {
        // Long Sniper Rifle with Scope
        barrelTipX = gunOriginX + 38 * dir * scale;
        // Long barrel
        ctx.beginPath();
        ctx.moveTo(gunOriginX - 6 * dir * scale, gunOriginY);
        ctx.lineTo(barrelTipX, barrelTipY);
        // Top Scope
        ctx.moveTo(gunOriginX + 4 * dir * scale, gunOriginY - 6 * scale);
        ctx.lineTo(gunOriginX + 18 * dir * scale, gunOriginY - 6 * scale);
        ctx.stroke();
      } else {
        // Tactical Pistol / Assault Rifle
        barrelTipX = gunOriginX + 24 * dir * scale;
        ctx.beginPath();
        // Barrel
        ctx.moveTo(gunOriginX - 6 * dir * scale, gunOriginY);
        ctx.lineTo(barrelTipX, barrelTipY);
        // Grip & Magazine
        ctx.moveTo(gunOriginX, gunOriginY);
        ctx.lineTo(gunOriginX - 2 * dir * scale, gunOriginY + 10 * scale);
        ctx.stroke();
      }

      // 6. DRAW MUZZLE FLASH CONE
      if (hasMuzzleFlash) {
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 18;

        ctx.beginPath();
        ctx.moveTo(barrelTipX, barrelTipY);
        ctx.lineTo(barrelTipX + 22 * dir * scale, barrelTipY - 12 * scale);
        ctx.lineTo(barrelTipX + 16 * dir * scale, barrelTipY - 2 * scale);
        ctx.lineTo(barrelTipX + 26 * dir * scale, barrelTipY);
        ctx.lineTo(barrelTipX + 16 * dir * scale, barrelTipY + 2 * scale);
        ctx.lineTo(barrelTipX + 22 * dir * scale, barrelTipY + 12 * scale);
        ctx.closePath();
        ctx.fill();

        // White core flash
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(barrelTipX + 4 * dir * scale, barrelTipY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();
    };

    return (
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[hsl(var(--border))] bg-[#090d16] shadow-2xl">
        {/* Duel Health Bars */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-4 z-10">
          
          {/* Hero Health Bar */}
          <div className="flex-1 max-w-[300px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-[#38bdf8] flex items-center gap-1.5 drop-shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#38bdf8] animate-ping" />
                CYBER GUNSLINGER
              </span>
              <span className="text-slate-400 tabular-nums font-mono text-[11px]">
                {Math.max(0, playerHealth)} / {maxHealth}
              </span>
            </div>
            <div className="relative h-3.5 w-full rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-amber-400/70 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${Math.max(0, (playerGhostHealth / maxHealth) * 100)}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-[#38bdf8] transition-all duration-150 rounded-full"
                style={{ width: `${Math.max(0, (playerHealth / maxHealth) * 100)}%` }}
              />
            </div>
          </div>

          {/* VS Badge */}
          <div className="px-3.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-xs font-black tracking-widest text-amber-400 shadow-lg">
            DUEL
          </div>

          {/* Enemy Health Bar */}
          <div className="flex-1 max-w-[300px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-400 tabular-nums font-mono text-[11px]">
                {Math.max(0, enemyHealth)} / {maxHealth}
              </span>
              <span className={`${isBoss ? 'text-purple-400' : 'text-[#ef4444]'} flex items-center gap-1.5 drop-shadow-sm`}>
                {enemyName}
                <span className={`h-2 w-2 rounded-full ${isBoss ? 'bg-purple-500' : 'bg-[#ef4444]'} animate-ping`} />
              </span>
            </div>
            <div className="relative h-3.5 w-full rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
              <div
                className="absolute top-0 right-0 h-full bg-amber-400/70 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${Math.max(0, (enemyGhostHealth / maxHealth) * 100)}%` }}
              />
              <div
                className={`absolute top-0 right-0 h-full transition-all duration-150 rounded-full ${
                  isBoss
                    ? 'bg-gradient-to-l from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-l from-[#ef4444] to-red-600'
                }`}
                style={{ width: `${Math.max(0, (enemyHealth / maxHealth) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Canvas Battlefield */}
        <canvas
          ref={canvasRef}
          width={800}
          height={340}
          className="w-full h-auto block aspect-[800/340] select-none"
        />
      </div>
    );
  }
);

StickmanArena.displayName = 'StickmanArena';
