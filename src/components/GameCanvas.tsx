import React, { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../constants';

// --- Types ---
type GameState = 'start' | 'playing' | 'gameover';
type SpriteState = 'idle' | 'walk' | 'attack' | 'hit'; // We generated idle, attack, hit. We'll alternate idle for walk.
interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}
interface Player extends Entity {
  state: SpriteState;
  frame: number;
  facingLeft: boolean;
  attackTimer: number;
  hitTimer: number;
}
interface Enemy extends Entity {
  type: number; // 0 to 7
  speed: number;
  state: 'walk' | 'hit' | 'dead';
  hitTimer: number;
  facingLeft: boolean;
}
interface Projectile extends Entity {
  active: boolean;
  facingLeft: boolean;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [hearts, setHearts] = useState(3);
  const heartsRef = useRef(3);

  type ImageElement = HTMLImageElement | HTMLCanvasElement;
  const imagesRef = useRef<{
    bgSky: ImageElement | null;
    bgMountain: ImageElement | null;
    bgBeach: ImageElement | null;
    apple: ImageElement | null;
    angryToast: ImageElement | null;
    baguetteSnake: ImageElement | null;
    croissantBat: ImageElement | null;
    sandwichCrab: ImageElement | null;
    donutSlime: ImageElement | null;
    pretzelSpider: ImageElement | null;
    pancakeTurtle: ImageElement | null;
    cinnamonArmadillo: ImageElement | null;
  }>({
    bgSky: null,
    bgMountain: null,
    bgBeach: null,
    apple: null,
    angryToast: null, baguetteSnake: null, croissantBat: null, sandwichCrab: null,
    donutSlime: null, pretzelSpider: null, pancakeTurtle: null, cinnamonArmadillo: null
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const rafId = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // Load images and remove white background using flood-fill
  useEffect(() => {
    const processImage = (img: HTMLImageElement, cropHorizontal: boolean = false, fillEdges: 'all' | 'top' | 'none' = 'all'): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return canvas;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const w = canvas.width;
      const h = canvas.height;
      const visited = new Uint8Array(w * h);
      
      // Start flood fill from edges to remove borders and checkerboard
      const stack: [number, number][] = [];
      if (fillEdges !== 'none') {
        for (let i = 0; i < w; i++) {
          stack.push([i, 0]); 
          if (fillEdges === 'all') stack.push([i, h - 1]);
        }
        
        if (fillEdges === 'all') {
          for (let i = 0; i < h; i++) {
            stack.push([0, i]); stack.push([w - 1, i]);
          }
        }
      }
      
      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        
        const idx = y * w + x;
        if (visited[idx]) continue;
        visited[idx] = 1;
        
        const px = idx * 4;
        const alpha = data[px + 3];
        if (alpha === 0) continue; // Skip already transparent
        
        const r = data[px];
        const g = data[px + 1];
        const b = data[px + 2];
        
        // Match white and light grey (checkerboard colors)
        const isNeutral = Math.abs(r - g) <= 15 && Math.abs(g - b) <= 15 && Math.abs(r - b) <= 15;
        const isBrightGrey = isNeutral && r >= 170;
        
        if (isBrightGrey) {
          data[px + 3] = 0; // Make transparent
          
          stack.push([x + 1, y]);
          stack.push([x - 1, y]);
          stack.push([x, y + 1]);
          stack.push([x, y - 1]);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Auto-crop horizontally to allow seamless tiling without empty gaps
      if (cropHorizontal) {
        let minX = w, maxX = 0;
        let hasVisible = false;
        
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (data[idx + 3] > 0) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              hasVisible = true;
            }
          }
        }

        if (hasVisible) {
          // Trim 2px off each side to remove generated black/white border artifacts
          minX = Math.min(w - 1, minX + 2);
          maxX = Math.max(0, maxX - 2);

          if (minX <= maxX && (minX > 0 || maxX < w - 1)) {
            const croppedCanvas = document.createElement('canvas');
            const cropW = maxX - minX + 1;
            croppedCanvas.width = cropW;
            croppedCanvas.height = h;
            const croppedCtx = croppedCanvas.getContext('2d');
            if (croppedCtx) {
              croppedCtx.drawImage(canvas, minX, 0, cropW, h, 0, 0, cropW, h);
              return croppedCanvas;
            }
          }
        }
      }
      
      return canvas;
    };

    const loadImg = (src: string, cropHorizontal: boolean = false, fillEdges: 'all' | 'top' | 'none' = 'all') => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Just in case
      img.onload = () => {
        const processed = processImage(img, cropHorizontal, fillEdges);
        if (src === ASSETS.BG_SKY) imagesRef.current.bgSky = processed;
        if (src === ASSETS.BG_MOUNTAIN) imagesRef.current.bgMountain = processed;
        if (src === ASSETS.BG_BEACH) imagesRef.current.bgBeach = processed;
        if (src === ASSETS.APPLE_SPRITE) imagesRef.current.apple = processed;
        if (src === ASSETS.ANGRY_TOAST) imagesRef.current.angryToast = processed;
        if (src === ASSETS.BAGUETTE_SNAKE) imagesRef.current.baguetteSnake = processed;
        if (src === ASSETS.CROISSANT_BAT) imagesRef.current.croissantBat = processed;
        if (src === ASSETS.SANDWICH_CRAB) imagesRef.current.sandwichCrab = processed;
        if (src === ASSETS.DONUT_SLIME) imagesRef.current.donutSlime = processed;
        if (src === ASSETS.PRETZEL_SPIDER) imagesRef.current.pretzelSpider = processed;
        if (src === ASSETS.PANCAKE_TURTLE) imagesRef.current.pancakeTurtle = processed;
        if (src === ASSETS.CINNAMON_ARMADILLO) imagesRef.current.cinnamonArmadillo = processed;
      };
      img.src = src;
    };

    // Sky is fully opaque. Backgrounds get horizontal crop. Sprites get no crop.
    loadImg(ASSETS.BG_SKY, true, 'none');
    loadImg(ASSETS.BG_MOUNTAIN, true, 'top');
    loadImg(ASSETS.BG_BEACH, true, 'top');
    loadImg(ASSETS.APPLE_SPRITE, false, 'all');
    loadImg(ASSETS.ANGRY_TOAST, false, 'all');
    loadImg(ASSETS.BAGUETTE_SNAKE, false, 'all');
    loadImg(ASSETS.CROISSANT_BAT, false, 'all');
    loadImg(ASSETS.SANDWICH_CRAB, false, 'all');
    loadImg(ASSETS.DONUT_SLIME, false, 'all');
    loadImg(ASSETS.PRETZEL_SPIDER, false, 'all');
    loadImg(ASSETS.PANCAKE_TURTLE, false, 'all');
    loadImg(ASSETS.CINNAMON_ARMADILLO, false, 'all');
    
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keys.current[e.code] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Main Loop
  const startGame = () => {
    cancelAnimationFrame(rafId.current);
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setHearts(3);
    heartsRef.current = 3;
    
    // Scale up player and ground
    const player: Player = {
      x: 100, y: 300, vx: 0, vy: 0, width: 96, height: 96,
      state: 'idle', frame: 0, facingLeft: false, attackTimer: 0, hitTimer: 0
    };
    
    let enemies: Enemy[] = [];
    let projectiles: Projectile[] = [];
    let cameraX = 0;
    
    const spawnEnemy = () => {
      if (enemies.length < 5) {
        // Wait till we have canvas reference to get accurate ground level, defaulting for initial array
        enemies.push({
          x: player.x + window.innerWidth / 2 + Math.random() * 500,
          y: 0, // Gets re-snapped in loop
          vx: 0, vy: 0, width: 96, height: 96,
          type: Math.floor(Math.random() * 8), // 0 to 7
          speed: 2 + Math.random() * 2,
          state: 'walk',
          hitTimer: 0,
          facingLeft: true
        });
      }
    };

    let enemySpawnTimer = 0;

    const gameLoop = (timestamp: number) => {
      const dt = timestamp - (lastTime.current || timestamp);
      lastTime.current = timestamp;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      
      // Update dimensions properly so setting canvas width doesn't cause layout thrashing
      if (containerRef.current) {
        if (canvas.width !== containerRef.current.clientWidth) {
          canvas.width = containerRef.current.clientWidth;
        }
        if (canvas.height !== containerRef.current.clientHeight) {
          canvas.height = containerRef.current.clientHeight;
        }
      }
      
      const GRAVITY = 0.5;
      const JUMP_POWER = -12;
      const MOVE_SPEED = 6;
      const GROUND_Y = canvas.height - 40; // Ground near the very bottom

      // Update Player
      if (player.hitTimer > 0) {
        player.hitTimer -= dt;
        player.state = 'hit';
      } else if (player.attackTimer > 0) {
        player.attackTimer -= dt;
        player.state = 'attack';
      } else {
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
          player.vx = -MOVE_SPEED;
          player.facingLeft = true;
          player.state = 'walk'; 
        } else if (keys.current['ArrowRight'] || keys.current['KeyD']) {
          player.vx = MOVE_SPEED;
          player.facingLeft = false;
          player.state = 'walk';
        } else {
          player.vx = 0;
          player.state = 'idle';
        }

        if ((keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW']) && player.y >= GROUND_Y - player.height) {
          player.vy = JUMP_POWER;
        }

        if (keys.current['KeyX'] && player.attackTimer <= 0) {
          player.attackTimer = 300; // Attack lasts 300ms
          // Throw riceball
          projectiles.push({
            x: player.x + (player.facingLeft ? -10 : player.width),
            y: player.y + 40,
            vx: player.facingLeft ? -12 : 12, // Faster projectiles for larger scale
            vy: -4,
            width: 24,
            height: 24,
            active: true,
            facingLeft: player.facingLeft
          });
        }
      }

      player.vy += GRAVITY;
      player.x += player.vx;
      player.y += player.vy;

      if (player.y > GROUND_Y - player.height) {
        player.y = GROUND_Y - player.height;
        player.vy = 0;
      }
      
      // Prevent running too far back
      if (player.x < cameraX) player.x = cameraX;

      // Camera follow
      if (player.x > cameraX + canvas.width * 0.4) {
        cameraX = player.x - canvas.width * 0.4;
      }

      // Spawning
      enemySpawnTimer += dt;
      if (enemySpawnTimer > 2000) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      // Update Projectiles
      projectiles.forEach(p => {
        if (p.active) {
          p.x += p.vx;
          p.vy += GRAVITY * 0.5;
          p.y += p.vy;
          if (p.y > GROUND_Y) p.active = false; // hit ground
        }
      });
      projectiles = projectiles.filter(p => p.active && p.x > cameraX && p.x < cameraX + canvas.width + 200);

      // Update Enemies
      enemies.forEach((enemy, index) => {
        if (enemy.state === 'hit') {
          enemy.hitTimer -= dt;
          if (enemy.hitTimer <= 0) {
            enemy.state = 'dead';
          }
          // Physics for bouncing
          enemy.vy += GRAVITY;
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
          
          if (enemy.y > GROUND_Y - enemy.height) {
            enemy.y = GROUND_Y - enemy.height;
            enemy.vy = -enemy.vy * 0.5; // bounce a bit
            enemy.vx *= 0.8; // friction
          }
        } else {
          enemy.y = GROUND_Y - enemy.height; // Always keep snapped to ground when walking
          // Patrol between camera edges
          if (enemy.facingLeft) {
            enemy.x -= enemy.speed;
            enemy.vx = -enemy.speed; // for facing
            if (enemy.x <= cameraX) {
              enemy.facingLeft = false;
            }
          } else {
            enemy.x += enemy.speed;
            enemy.vx = enemy.speed; // for facing
            if (canvas && enemy.x + enemy.width >= cameraX + canvas.width) {
              enemy.facingLeft = true;
            }
          }
        }

        // Collision with player
        if (enemy.state !== 'hit' && player.hitTimer <= 0) {
          if (
            player.x < enemy.x + enemy.width - 20 &&
            player.x + player.width - 20 > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
          ) {
            player.hitTimer = 1000;
            player.vy = -8;
            player.vx = player.facingLeft ? 8 : -8;
            heartsRef.current -= 1;
            setHearts(heartsRef.current);
            if (heartsRef.current <= 0) {
              setGameState('gameover');
              cancelAnimationFrame(rafId.current);
              return;
            }
          }
        }

        // Collision with projectiles
        projectiles.forEach(p => {
          if (p.active && enemy.state === 'walk' &&
            p.x < enemy.x + enemy.width &&
            p.x + p.width > enemy.x &&
            p.y < enemy.y + enemy.height &&
            p.y + p.height > enemy.y
          ) {
            p.active = false;
            enemy.state = 'hit';
            enemy.hitTimer = 700; // time string in hit animation before dead
            enemy.vy = -6; // bounce up
            enemy.vx = (enemy.x > p.x) ? 6 : -6; // bounce away from projectile
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        });
      });
      
      enemies = enemies.filter(e => e.state !== 'dead');

      // --- Draw ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Parallax Backgrounds (3 layers)
      const drawBgLayer = (img: HTMLImageElement | HTMLCanvasElement | null, speedFactor: number) => {
        if (!img) return;
        const bgScale = canvas.height / img.height;
        const scaledWidth = Math.ceil(img.width * bgScale);
        const totalLoopWidth = (scaledWidth * 2) - 2; // Subtract a bit to ensure 1px overlap on both ends
        
        let offsetX = -(cameraX * speedFactor) % totalLoopWidth;
        if (offsetX > 0) offsetX -= totalLoopWidth;
        
        // Loop enough times to cover the whole screen width seamlessly using mirroring
        for (let x = offsetX; x < canvas.width; x += totalLoopWidth) {
          const startX = Math.floor(x);
          
          // Draw standard orientation
          ctx.drawImage(img, startX, 0, scaledWidth + 1, canvas.height);
          
          // Draw mirrored orientation immediately following it to sew edges seamlessly together
          ctx.save();
          ctx.translate(startX + totalLoopWidth + 1, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, scaledWidth + 1, canvas.height);
          ctx.restore();
        }
      };

      // 1. Sky/Ocean (moves slowest)
      if (imagesRef.current.bgSky) {
        drawBgLayer(imagesRef.current.bgSky, 0.05);
      } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Mountain Midground (moves medium speed)
      drawBgLayer(imagesRef.current.bgMountain, 0.2);

      // 3. Beach Foreground (moves fastest)
      drawBgLayer(imagesRef.current.bgBeach, 1.0);

      // Draw Ground
      ctx.fillStyle = '#8f9779'; // soft greenish-brown for the ground
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

      const drawSprite = (
        img: HTMLImageElement | HTMLCanvasElement | null,
        frameNum: number,
        totalFrames: number,
        x: number, y: number,
        w: number, h: number,
        flipX: boolean
      ) => {
        if (!img) return;
        const fw = img.width / totalFrames;
        const fh = img.height;
        ctx.save();
        ctx.translate(x - cameraX + (flipX ? w : 0), y);
        if (flipX) ctx.scale(-1, 1);
        ctx.drawImage(img, frameNum * fw, 0, fw, fh, 0, 0, w, h);
        ctx.restore();
      };

      // Draw Player
      let playerFrame = 0;
      if (player.state === 'idle') playerFrame = 0;
      if (player.state === 'walk') {
         // simple animation by time
         playerFrame = (Math.floor(Date.now() / 200) % 2) === 0 ? 1 : 0; // alternate between walk and idle for dynamic look, or just stay walk
         playerFrame = 1; // It's only 1 frame for walk, let's just show it.
      }
      if (player.state === 'attack') playerFrame = 2;
      if (player.state === 'hit') playerFrame = 3;
      
      drawSprite(imagesRef.current.apple, playerFrame, 4, player.x, player.y, player.width, player.height, player.facingLeft);

      // Draw Enemies
      const enemyImages = [
        imagesRef.current.angryToast,
        imagesRef.current.baguetteSnake,
        imagesRef.current.croissantBat,
        imagesRef.current.sandwichCrab,
        imagesRef.current.donutSlime,
        imagesRef.current.pretzelSpider,
        imagesRef.current.pancakeTurtle,
        imagesRef.current.cinnamonArmadillo
      ];

      enemies.forEach(en => {
        const img = enemyImages[en.type];
        
        let flip = false;
        if (en.state === 'hit') {
          flip = en.vx > 0;
        } else {
          flip = en.facingLeft;
        }

        let frame = 0; // idle
        if (en.state === 'walk') {
          frame = (Math.floor(Date.now() / 200) % 2) === 0 ? 1 : 0; // alternate walk and idle
        } else if (en.state === 'hit') {
          frame = 3; // hit frame
        }

        drawSprite(img, frame, 4, en.x, en.y, en.width, en.height, flip);
      });

      // Draw projectiles (Riceballs)
      projectiles.forEach(p => {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(p.x - cameraX + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        const center = p.x - cameraX + p.width/2;
        ctx.fillRect(center - 2, p.y + p.height/2 - 2, 4, 4); // Little seaweed wrap bit
      });
      
      // UI removed from canvas, handled by React overly
      rafId.current = requestAnimationFrame(gameLoop);
    };

    rafId.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="flex-1 w-full h-full relative bg-blue-50 overflow-hidden" ref={containerRef}>
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 z-20 flex flex-col md:flex-row gap-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur shadow rounded-xl py-2 px-4 flex items-center gap-2 pointer-events-auto border border-slate-200">
            <span className="text-xl">{'❤️'.repeat(hearts)}{'🖤'.repeat(3 - hearts)}</span>
          </div>
          <div className="bg-white/90 backdrop-blur shadow rounded-xl py-2 px-4 flex items-center pointer-events-auto border border-slate-200">
             <span className="font-mono font-bold text-slate-800 text-lg">Score: {score}</span>
          </div>
        </div>
      )}
      {gameState === 'playing' && (
        <button
          onClick={(e) => { e.currentTarget.blur(); startGame(); }}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-800 font-bold py-2 px-4 rounded-xl shadow backdrop-blur transition-all pointer-events-auto border border-slate-200"
        >
          Reset Game
        </button>
      )}
      {gameState === 'start' && (
        <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-slate-800">Apple's Adventure</h2>
            <p className="text-slate-600">Help Apple the baby panda fight her bread fear on the way to the rice ball shop!</p>
            
            <div className="flex flex-col gap-2 w-full bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
              <h3 className="font-semibold text-slate-700">Controls</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600"><kbd className="bg-white border rounded px-2 py-1 font-mono hover:bg-slate-50 transition-colors">←</kbd> <kbd className="bg-white border rounded px-2 py-1 font-mono">→</kbd> or A/D to move</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><kbd className="bg-white border rounded px-2 py-1 font-mono">Space</kbd> or W to jump</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><kbd className="bg-white border rounded px-2 py-1 font-mono text-blue-600 font-bold border-blue-200">X</kbd> to throw Rice Balls</div>
              <p className="text-xs text-slate-500 mt-2">On mobile devices, use the on-screen buttons.</p>
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Play Demo
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-900/80 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-red-500">Game Over!</h2>
            <p className="text-slate-600">Apple succumbed to the bread monsters.</p>
            <div className="bg-slate-50 p-4 w-full rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Final Score</span>
              <span className="text-4xl font-black text-slate-800 font-mono">{score}</span>
            </div>
            
            <button 
              onClick={startGame}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ imageRendering: 'pixelated' }} />

      {gameState === 'playing' && (
        <div className="absolute inset-x-0 bottom-8 px-6 md:hidden flex justify-between items-end z-20 pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onPointerDown={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = true; }}
              onPointerUp={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = false; }}
              onPointerCancel={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = false; }}
              onPointerLeave={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = false; }}
              className="w-16 h-16 bg-white/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-slate-800 text-3xl font-bold active:bg-white/60 active:scale-95 select-none touch-none transition-all shadow-lg"
            >
              ←
            </button>
            <button 
              onPointerDown={(e) => { e.preventDefault(); keys.current['ArrowRight'] = true; }}
              onPointerUp={(e) => { e.preventDefault(); keys.current['ArrowRight'] = false; }}
              onPointerCancel={(e) => { e.preventDefault(); keys.current['ArrowRight'] = false; }}
              onPointerLeave={(e) => { e.preventDefault(); keys.current['ArrowRight'] = false; }}
              className="w-16 h-16 bg-white/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-slate-800 text-3xl font-bold active:bg-white/60 active:scale-95 select-none touch-none transition-all shadow-lg"
            >
              →
            </button>
          </div>
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onPointerDown={(e) => { e.preventDefault(); keys.current['KeyX'] = true; }}
              onPointerUp={(e) => { e.preventDefault(); keys.current['KeyX'] = false; }}
              onPointerCancel={(e) => { e.preventDefault(); keys.current['KeyX'] = false; }}
              onPointerLeave={(e) => { e.preventDefault(); keys.current['KeyX'] = false; }}
              className="w-16 h-16 bg-white/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-blue-700 text-xl font-black active:bg-white/60 active:scale-95 select-none touch-none transition-all shadow-lg"
            >
              Throw
            </button>
            <button 
              onPointerDown={(e) => { e.preventDefault(); keys.current['Space'] = true; }}
              onPointerUp={(e) => { e.preventDefault(); keys.current['Space'] = false; }}
              onPointerCancel={(e) => { e.preventDefault(); keys.current['Space'] = false; }}
              onPointerLeave={(e) => { e.preventDefault(); keys.current['Space'] = false; }}
              className="w-16 h-16 bg-white/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-slate-800 text-xl font-bold active:bg-white/60 active:scale-95 select-none touch-none transition-all shadow-lg"
            >
              Jump
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
