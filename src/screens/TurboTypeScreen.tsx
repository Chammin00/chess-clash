import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  G,
  Line,
  Ellipse,
  Text as SvgText,
} from 'react-native-svg';
import { TURBO_STAGES, KEYBOARD_ROWS, TurboStage } from '../data/turboTypeWords';

interface Props {
  onBack: () => void;
  onRunComplete?: (wordsTyped: number) => void;
}

interface WordObstacle {
  id: number;
  word: string;
  typed: number;
  screenX: number;
  lane: number;
}

const LANE_COUNT = 3;
const LANE_OFFSETS = [-36, 0, 36];
const LANE_NAMES = ['Top', 'Middle', 'Bottom'];

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

type GameMode = 'kid' | 'flappy';
type GamePhase = 'start' | 'playing' | 'gameover';

const BEST_SCORE_KEY = 'turbo_type_best_score_v1';

/**
 * Computes procedural multi-octave terrain Y at a given world X coordinate.
 */
function computeTerrainY(
  wx: number,
  height: number,
  stage: TurboStage,
  seed: number
): number {
  const base = height * 0.72;
  const amp = stage.hillAmplitude;
  const freq = stage.hillFrequency;
  const n1 = Math.sin((wx + seed) * freq) * amp;
  const n2 = Math.sin((wx + seed * 1.7) * freq * 2.3) * (amp * 0.35);
  const n3 = Math.cos((wx + seed * 0.4) * freq * 0.45) * (amp * 0.45);
  return base + n1 + n2 + n3;
}

function computeTerrainSlopeDeg(
  wx: number,
  height: number,
  stage: TurboStage,
  seed: number
): number {
  const dy =
    computeTerrainY(wx + 12, height, stage, seed) -
    computeTerrainY(wx - 12, height, stage, seed);
  return (Math.atan2(dy, 24) * 180) / Math.PI;
}

export const TurboTypeScreen: React.FC<Props> = ({ onBack, onRunComplete }) => {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [mode, setMode] = useState<GameMode>('kid');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 340 });

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [stageIndex, setStageIndex] = useState(0);
  const [speedMult, setSpeedMult] = useState(1.0);
  const [stageBanner, setStageBanner] = useState<string | null>(null);
  const [errorFlash, setErrorFlash] = useState(false);
  const [carLane, setCarLane] = useState(1);

  // Render-synced state updated at 60fps
  const [renderTick, setRenderTick] = useState(0);

  // Mutable simulation state in refs for smooth 60fps loop
  const simRef = useRef({
    running: false,
    worldX: 0,
    seed: Math.random() * 5000,
    score: 0,
    combo: 0,
    hearts: 3,
    maxHearts: 3,
    stageIndex: 0,
    spawnTimer: 0.6,
    boostTimer: 0,
    shakeTimer: 0,
    nextId: 1,
    carLane: 1,
    carLaneY: 0,
    obstacles: [] as WordObstacle[],
    sparks: [] as Spark[],
  });

  const shiftLane = useCallback((delta: number) => {
    const s = simRef.current;
    const next = Math.max(0, Math.min(LANE_COUNT - 1, s.carLane + delta));
    if (next !== s.carLane) {
      s.carLane = next;
      setCarLane(next);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY).then((val) => {
      if (val) {
        const parsed = parseInt(val, 10);
        if (!Number.isNaN(parsed)) setBestScore(parsed);
      }
    });
  }, []);

  const getStage = (idx: number): TurboStage =>
    TURBO_STAGES[Math.min(idx, TURBO_STAGES.length - 1)];

  const getCarScreenX = (width: number) => Math.max(82, Math.min(165, width * 0.18));

  const spawnWord = useCallback(
    (stIdx: number, width: number) => {
      const st = getStage(stIdx);
      const word = st.words[Math.floor(Math.random() * st.words.length)];
      const s = simRef.current;
      s.obstacles.push({
        id: s.nextId++,
        word,
        typed: 0,
        screenX: width + 80,
        lane: Math.floor(Math.random() * LANE_COUNT),
      });
    },
    []
  );

  const spawnSparks = (x: number, y: number, color: string, count: number) => {
    const s = simRef.current;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 45 + Math.random() * 130;
      s.sparks.push({
        id: s.nextId++,
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 35,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        color,
        size: 3 + Math.random() * 3.5,
      });
    }
  };

  const startGame = useCallback(() => {
    const s = simRef.current;
    s.running = true;
    s.worldX = 0;
    s.seed = Math.random() * 5000;
    s.score = 0;
    s.combo = 0;
    s.maxHearts = mode === 'flappy' ? 1 : 3;
    s.hearts = s.maxHearts;
    s.stageIndex = 0;
    s.spawnTimer = 0.7;
    s.boostTimer = 0;
    s.shakeTimer = 0;
    s.carLane = 1;
    s.carLaneY = 0;
    s.obstacles = [];
    s.sparks = [];

    setScore(0);
    setCombo(0);
    setHearts(s.maxHearts);
    setStageIndex(0);
    setSpeedMult(1.0);
    setCarLane(1);
    setStageBanner(null);
    setPhase('playing');

    spawnWord(0, canvasSize.width);
  }, [mode, canvasSize.width, spawnWord]);

  const finishRun = useCallback(
    (finalScore: number) => {
      simRef.current.running = false;
      setPhase('gameover');
      setBestScore((prev) => {
        const nextBest = Math.max(prev, finalScore);
        AsyncStorage.setItem(BEST_SCORE_KEY, String(nextBest));
        return nextBest;
      });
      if (onRunComplete) {
        onRunComplete(finalScore);
      }
    },
    [onRunComplete]
  );

  // Main 60fps animation loop
  useEffect(() => {
    if (phase !== 'playing') return;
    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const s = simRef.current;
      if (!s.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const st = getStage(s.stageIndex);
      const boostFactor = s.boostTimer > 0 ? 1.45 : 1.0;
      const speed = (st.baseSpeed + s.score * 4.2) * boostFactor;
      s.worldX += speed * dt;

      if (s.boostTimer > 0) s.boostTimer -= dt;
      if (s.shakeTimer > 0) s.shakeTimer -= dt;

      s.spawnTimer -= dt;
      const dynamicInterval = Math.max(0.9, st.spawnInterval - s.score * 0.018);
      if (s.spawnTimer <= 0) {
        spawnWord(s.stageIndex, canvasSize.width);
        s.spawnTimer = dynamicInterval;
      }

      const targetLaneY = LANE_OFFSETS[s.carLane];
      s.carLaneY += (targetLaneY - s.carLaneY) * Math.min(1, dt * 14);

      const carX = getCarScreenX(canvasSize.width);
      const carY = computeTerrainY(s.worldX + carX, canvasSize.height, st, s.seed) + s.carLaneY;

      // Exhaust / turbo trail
      if (Math.random() < (s.boostTimer > 0 ? 0.9 : 0.35)) {
        s.sparks.push({
          id: s.nextId++,
          x: carX - 34,
          y: carY - 10,
          vx: -80 - Math.random() * 50,
          vy: -12 - Math.random() * 25,
          life: 0.32,
          maxLife: 0.32,
          color: s.boostTimer > 0 ? '#F97316' : 'rgba(255,255,255,0.55)',
          size: s.boostTimer > 0 ? 5.5 : 3.5,
        });
      }

      // Move incoming word crates
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.screenX -= speed * dt;
        if (obs.lane === s.carLane && obs.screenX <= carX + 34 && obs.screenX >= carX - 34) {
          s.obstacles.splice(i, 1);
          s.hearts -= 1;
          s.combo = 0;
          s.shakeTimer = 0.38;
          spawnSparks(carX + 20, carY - 22, '#EF4444', 18);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setHearts(s.hearts);
          setCombo(0);
          if (s.hearts <= 0) {
            finishRun(s.score);
            return;
          }
        } else if (obs.screenX < -90) {
          s.obstacles.splice(i, 1);
        }
      }

      // Update sparks
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const pt = s.sparks[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) s.sparks.splice(i, 1);
      }

      setRenderTick((t) => (t + 1) % 1000000);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, canvasSize.width, canvasSize.height, spawnWord, finishRun]);

  const handleLetterPress = useCallback(
    (rawChar: string) => {
      const s = simRef.current;
      if (!s.running) return;
      const ch = rawChar.toLowerCase();
      if (!/^[a-z]$/.test(ch)) return;

      const active =
        s.obstacles.find((o) => o.typed < o.word.length && o.lane === s.carLane) ||
        s.obstacles.find((o) => o.typed < o.word.length);
      if (!active) return;

      const expected = active.word[active.typed];
      if (ch === expected) {
        active.typed += 1;
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const st = getStage(s.stageIndex);
        const obsY =
          computeTerrainY(s.worldX + active.screenX, canvasSize.height, st, s.seed) - 42;
        spawnSparks(active.screenX, obsY, '#FFD000', 5);

        if (active.typed >= active.word.length) {
          s.score += 1;
          s.combo += 1;
          s.boostTimer = 0.42;
          spawnSparks(active.screenX, obsY, '#4ADE80', 16);
          s.obstacles = s.obstacles.filter((o) => o.id !== active.id);

          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          const newStage = Math.min(Math.floor(s.score / 8), TURBO_STAGES.length - 1);
          if (newStage > s.stageIndex) {
            s.stageIndex = newStage;
            setStageIndex(newStage);
            const nextSt = getStage(newStage);
            setStageBanner(`STAGE ${newStage + 1}: ${nextSt.name.toUpperCase()} — SPEED UP!`);
            setTimeout(() => setStageBanner(null), 2200);
          }

          setScore(s.score);
          setCombo(s.combo);
          setSpeedMult(1.0 + s.score * 0.028);
        }
        setRenderTick((t) => (t + 1) % 1000000);
      } else {
        s.combo = 0;
        setCombo(0);
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 220);
      }
    },
    [canvasSize.height]
  );

  // Physical keyboard support on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') {
        if (e.key === 'Enter') {
          startGame();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        shiftLane(-1);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        shiftLane(1);
        return;
      }
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleLetterPress(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleLetterPress, startGame]);

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasSize({ width, height });
    }
  };

  // Build SVG paths for current frame
  const s = simRef.current;
  const st = getStage(s.stageIndex);
  const { width: w, height: h } = canvasSize;
  const carX = getCarScreenX(w);
  const carY = computeTerrainY(s.worldX + carX, h, st, s.seed) + s.carLaneY;
  const carSlope = computeTerrainSlopeDeg(s.worldX + carX, h, st, s.seed);
  const bounceY = s.boostTimer > 0 ? -Math.sin((s.boostTimer / 0.42) * Math.PI) * 9 : 0;

  let hillPath = `M 0 ${h}`;
  for (let hx = 0; hx <= w + 24; hx += 24) {
    const hy =
      h * 0.56 +
      Math.sin((hx + s.worldX * 0.28) * 0.006) * 28 +
      Math.cos((hx + s.worldX * 0.28) * 0.013) * 12;
    hillPath += ` L ${hx} ${hy.toFixed(1)}`;
  }
  hillPath += ` L ${w} ${h} Z`;

  let terrainFillPath = `M 0 ${h}`;
  let roadStrokePath = '';
  let activeLanePath = '';
  for (let x = 0; x <= w + 16; x += 16) {
    const ty = computeTerrainY(s.worldX + x, h, st, s.seed);
    terrainFillPath += ` L ${x} ${(ty - 52).toFixed(1)}`;
    roadStrokePath += x === 0 ? `M ${x} ${ty.toFixed(1)}` : ` L ${x} ${ty.toFixed(1)}`;
    const aly = ty + LANE_OFFSETS[s.carLane];
    activeLanePath += x === 0 ? `M ${x} ${aly.toFixed(1)}` : ` L ${x} ${aly.toFixed(1)}`;
  }
  terrainFillPath += ` L ${w} ${h} Z`;

  const activeObs =
    s.obstacles.find((o) => o.typed < o.word.length && o.lane === s.carLane) ||
    s.obstacles.find((o) => o.typed < o.word.length) ||
    null;
  const nextExpectedChar = activeObs ? activeObs.word[activeObs.typed]?.toLowerCase() : null;

  const shakeX = s.shakeTimer > 0 ? (Math.random() - 0.5) * 10 : 0;
  const shakeY = s.shakeTimer > 0 ? (Math.random() - 0.5) * 10 : 0;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏎️ TURBO TYPE RALLY</Text>
        <View style={styles.hudRow}>
          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>
              S{st.id}: {st.name}
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>Words: {score}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>Best: {bestScore}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>Lane: {LANE_NAMES[carLane]}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>{speedMult.toFixed(1)}x</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>
              {'❤️'.repeat(Math.max(0, hearts))}
              {'🖤'.repeat(Math.max(0, s.maxHearts - hearts))}
            </Text>
          </View>
        </View>
      </View>

      {/* Side-Scrolling Game Canvas */}
      <View style={styles.canvasWrap} onLayout={onCanvasLayout}>
        <Svg width={w} height={h} style={{ transform: [{ translateX: shakeX }, { translateY: shakeY }] }}>
          <Defs>
            <SvgLinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={st.skyTop} />
              <Stop offset="1" stopColor={st.skyBottom} />
            </SvgLinearGradient>
            <SvgLinearGradient id="terrGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={st.groundTop} />
              <Stop offset="1" stopColor={st.groundBottom} />
            </SvgLinearGradient>
          </Defs>

          {/* Sky */}
          <Rect x={0} y={0} width={w} height={h} fill="url(#skyGrad)" />

          {/* Sun or Cosmic Stars */}
          {s.stageIndex >= 4 ? (
            Array.from({ length: 24 }).map((_, idx) => {
              const sx = (((idx * 137 - s.worldX * 0.08) % w) + w) % w;
              const sy = (idx * 47) % (h * 0.5);
              return <Circle key={idx} cx={sx} cy={sy} r={(idx % 2) + 1.2} fill="#FFFFFF" opacity={0.85} />;
            })
          ) : (
            <G>
              <Circle cx={w - 75} cy={52} r={28} fill="#FDE047" />
              {[0, 1, 2, 3].map((c) => {
                const cx = (((c * 240 - s.worldX * 0.14) % (w + 160)) + (w + 160)) % (w + 160) - 80;
                const cy = 38 + (c % 2) * 28;
                return (
                  <G key={c} opacity={0.65}>
                    <Circle cx={cx} cy={cy} r={16} fill="#FFFFFF" />
                    <Circle cx={cx + 16} cy={cy - 5} r={20} fill="#FFFFFF" />
                    <Circle cx={cx + 34} cy={cy} r={15} fill="#FFFFFF" />
                  </G>
                );
              })}
            </G>
          )}

          {/* Parallax Hills */}
          <Path d={hillPath} fill={st.hillBack} />

          {/* Procedural Changing Terrain + 3-Lane Road */}
          <Path d={terrainFillPath} fill="url(#terrGrad)" />
          <Path d={roadStrokePath} stroke={st.roadColor} strokeWidth={108} fill="none" />
          <Path d={activeLanePath} stroke="rgba(255,208,0,0.18)" strokeWidth={32} fill="none" />

          {/* Incoming Word Obstacles */}
          {s.obstacles.map((obs) => {
            const oy =
              computeTerrainY(s.worldX + obs.screenX, h, st, s.seed) +
              LANE_OFFSETS[obs.lane] -
              20;
            const isTarget = activeObs?.id === obs.id;
            const boxW = Math.max(78, obs.word.length * 18 + 24);
            return (
              <G key={obs.id} transform={`translate(${obs.screenX}, ${oy})`}>
                <Rect x={-3} y={20} width={6} height={18} fill="#94A3B8" />
                <Rect
                  x={-boxW / 2}
                  y={-20}
                  width={boxW}
                  height={40}
                  rx={10}
                  fill={isTarget ? '#0F172A' : '#1E293B'}
                  stroke={isTarget ? '#FFD000' : '#64748B'}
                  strokeWidth={isTarget ? 3.5 : 2}
                />
                <SvgText
                  x={0}
                  y={6}
                  textAnchor="middle"
                  fontSize={19}
                  fontWeight="bold"
                  fill={isTarget ? '#FFD000' : '#F8FAFC'}
                >
                  {obs.word.toUpperCase()}
                </SvgText>
              </G>
            );
          })}

          {/* Sparks / Exhaust Particles */}
          {s.sparks.map((pt) => (
            <Circle
              key={pt.id}
              cx={pt.x}
              cy={pt.y}
              r={pt.size}
              fill={pt.color}
              opacity={Math.max(0, pt.life / pt.maxLife)}
            />
          ))}

          {/* Player Car (hugs terrain & tilts with slope) */}
          <G transform={`translate(${carX}, ${carY - 14 + bounceY}) rotate(${carSlope})`}>
            <Ellipse cx={0} cy={13} rx={36} ry={6} fill="rgba(0,0,0,0.28)" />
            <Rect
              x={-36}
              y={-16}
              width={72}
              height={23}
              rx={8}
              fill={st.carColor}
              stroke="#0F172A"
              strokeWidth={2.5}
            />
            <Path
              d="M -20 -16 L -10 -32 L 16 -32 L 25 -16 Z"
              fill="#F8FAFC"
              stroke="#0F172A"
              strokeWidth={2.5}
            />
            <Path d="M -14 -18 L -8 -28 L 12 -28 L 18 -18 Z" fill="#38BDF8" />
            {/* Wheels */}
            {[-20, 20].map((wx) => (
              <G key={wx} transform={`translate(${wx}, 9) rotate(${(s.worldX * 4) % 360})`}>
                <Circle cx={0} cy={0} r={10} fill="#1E293B" stroke="#0F172A" strokeWidth={2} />
                <Circle cx={0} cy={0} r={4} fill="#E2E8F0" />
                <Line x1={-4} y1={0} x2={4} y2={0} stroke="#94A3B8" strokeWidth={1.5} />
              </G>
            ))}
          </G>
        </Svg>

        {stageBanner && (
          <View style={styles.stageBanner}>
            <Text style={styles.stageBannerText}>{stageBanner}</Text>
          </View>
        )}

        {phase === 'playing' && (
          <View style={styles.laneControls}>
            <TouchableOpacity style={styles.laneBtn} onPress={() => shiftLane(-1)}>
              <Text style={styles.laneBtnText}>▲ Lane Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laneBtn} onPress={() => shiftLane(1)}>
              <Text style={styles.laneBtnText}>▼ Lane Down</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Start Overlay */}
        {phase === 'start' && (
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🏎️ Turbo Type Rally</Text>
              <Text style={styles.modalDesc}>
                Drive over changing hills and type incoming words before they crash into your car!
                Every stage gets faster!
              </Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'kid' && styles.modeBtnActive]}
                  onPress={() => setMode('kid')}
                >
                  <Text style={styles.modeBtnTitle}>❤️ Kid Rally (3 Hearts)</Text>
                  <Text style={styles.modeBtnSub}>Great for learning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'flappy' && styles.modeBtnActive]}
                  onPress={() => setMode('flappy')}
                >
                  <Text style={styles.modeBtnTitle}>⚡ Flappy Pro (1 Hit)</Text>
                  <Text style={styles.modeBtnSub}>Endless hardcore</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                <Text style={styles.startBtnText}>🚀 START DRIVING!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Over Overlay */}
        {phase === 'gameover' && (
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🏁 Race Complete!</Text>
              <Text style={styles.modalDesc}>
                You typed {score} words and reached Stage {s.stageIndex + 1} ({st.name})!
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{score}</Text>
                  <Text style={styles.statBoxLbl}>WORDS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{bestScore}</Text>
                  <Text style={styles.statBoxLbl}>BEST</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>+{score * 5}</Text>
                  <Text style={styles.statBoxLbl}>GOLD</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                <Text style={styles.startBtnText}>🔄 DRIVE AGAIN!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Active Word Letter Bar */}
      <View style={styles.targetBar}>
        <Text style={styles.targetLabel}>TYPE WORD:</Text>
        <View style={styles.lettersRow}>
          {activeObs ? (
            activeObs.word.split('').map((ch, idx) => {
              const isDone = idx < activeObs.typed;
              const isCur = idx === activeObs.typed;
              return (
                <View
                  key={idx}
                  style={[
                    styles.letterChip,
                    isDone && styles.letterDone,
                    isCur && styles.letterCur,
                    isCur && errorFlash && styles.letterErr,
                  ]}
                >
                  <Text style={styles.letterChipText}>{ch.toUpperCase()}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.waitingText}>Zooming ahead...</Text>
          )}
        </View>
        {combo >= 2 && (
          <View style={styles.comboPill}>
            <Text style={styles.comboText}>🔥 {combo}x</Text>
          </View>
        )}
      </View>

      {/* Touch-Friendly On-Screen Kid Keyboard */}
      <View style={styles.kbdWrap}>
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <View key={rIdx} style={styles.kbdRow}>
            {row.map((ch) => {
              const isNext = nextExpectedChar === ch;
              return (
                <TouchableOpacity
                  key={ch}
                  activeOpacity={0.7}
                  style={[styles.keyBtn, isNext && styles.keyBtnHighlight]}
                  onPress={() => handleLetterPress(ch)}
                >
                  <Text style={[styles.keyBtnText, isNext && styles.keyBtnTextHighlight]}>
                    {ch.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  topBar: {
    backgroundColor: '#1E3FA2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#152E8A',
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: '#FFD000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  stagePill: {
    backgroundColor: '#F47920',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  stagePillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  statPill: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statPillText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 12,
  },
  canvasWrap: {
    flex: 1,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  stageBanner: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#FFD000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  stageBannerText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 15,
  },
  laneControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 6,
  },
  laneBtn: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2,
    borderColor: '#FFD000',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  laneBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#1E3FA2',
    padding: 22,
    maxWidth: 430,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E3FA2',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  modeBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  modeBtnSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#15803D',
  },
  startBtnText: {
    color: '#052E16',
    fontSize: 17,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  statBoxVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3FA2',
  },
  statBoxLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  targetBar: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: '#1E293B',
  },
  targetLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '900',
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  letterChip: {
    minWidth: 32,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterDone: {
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
  },
  letterCur: {
    backgroundColor: '#1D4ED8',
    borderColor: '#FFD000',
    transform: [{ scale: 1.1 }],
  },
  letterErr: {
    backgroundColor: '#991B1B',
    borderColor: '#F87171',
  },
  letterChipText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  waitingText: {
    color: '#64748B',
    fontWeight: '800',
  },
  comboPill: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comboText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 12,
  },
  kbdWrap: {
    backgroundColor: '#0B1120',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 5,
    alignItems: 'center',
  },
  kbdRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 680,
  },
  keyBtn: {
    flex: 1,
    maxWidth: 54,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnHighlight: {
    backgroundColor: '#FFD000',
    borderColor: '#FFFFFF',
  },
  keyBtnText: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 15,
  },
  keyBtnTextHighlight: {
    color: '#0F172A',
  },
});
