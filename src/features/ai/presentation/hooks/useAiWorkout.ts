import { useCallback, useRef, useState } from 'react';
import { FrameScheduler } from '../../application/FrameScheduler';
import { prepare, type CameraCheck } from '../../application/CameraPreparationEngine';
import { poseFromFrame } from '../../infrastructure/camera/poseFrameSource';
import type { PoseRuntime } from '../../infrastructure/pose/PoseRuntime';
import { RepEngine } from '../../application/RepEngine';
import { FormEngine } from '../../application/FormEngine';
import { FatigueEngine } from '../../application/FatigueEngine';
import { CoachingEngine } from '../../application/CoachingEngine';
import { compute } from '../../application/MovementEngine';
import { definitionFor } from '../../application/definitions';
import type { Pose, LandmarkFrame } from '../../domain/Landmark';
import type { RepQuality, CameraPositionStatus } from '../../domain/RepTypes';
import { speak } from '../voice';

export interface DebugInfo {
  fps: number;
  aiFps: number;
  model: string;
  phase: string;
  rom: number;
  velocity: number;
  form: number;
  failure: number;
}

interface AiWorkoutState {
  status: CameraPositionStatus;
  hint: string | null;
  repCount: number;
  target: number;
  quality: RepQuality | null;
  isCounting: boolean;
  debug: DebugInfo;
}

export function useAiWorkout(
  exerciseId: string,
  target: number,
  runtime: PoseRuntime,
): AiWorkoutState & {
  onFrame: (frame: unknown, nowMs: number) => void;
  startCountdown: () => void;
  stop: () => void;
} {
  const def = definitionFor(exerciseId) ?? definitionFor('squat')!;
  const [status, setStatus] = useState<CameraPositionStatus>('POSITION_INVALID');
  const [hint, setHint] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [quality, setQuality] = useState<RepQuality | null>(null);

  const eng = useRef({
    scheduler: new FrameScheduler(12),
    rep: new RepEngine(),
    form: new FormEngine(),
    fatigue: new FatigueEngine(),
    coach: new CoachingEngine(),
  }).current;

  const isCountingRef = useRef(isCounting);
  isCountingRef.current = isCounting;
  const formScoreRef = useRef(50);

  const [debug, setDebug] = useState<DebugInfo>({
    fps: 0,
    aiFps: 0,
    model: 'MediaPipe',
    phase: 'IDLE',
    rom: 0,
    velocity: 0,
    form: 0,
    failure: 0,
  });

  const startCountdown = useCallback(() => setIsCounting(true), []);
  const stop = useCallback(() => setIsCounting(false), []);

  const onFrame = useCallback((frame: unknown, nowMs: number) => {
    if (!eng.scheduler.shouldRun(nowMs)) return;
    const pose: Pose = poseFromFrame(frame, runtime);
    const check: CameraCheck = prepare(pose, def);
    setStatus(check.status);
    setHint(check.hint);

    if (check.status !== 'POSITION_VALID' || !isCountingRef.current) {
      eng.rep.reset();
      setDebug((d) => ({ ...d, phase: eng.rep.getState() }));
      return;
    }

    const frameData: LandmarkFrame = { landmarks: pose.landmarks, timestamp: nowMs };
    const metrics = compute(frameData);

    const done = eng.rep.step(metrics, nowMs, def);
    if (done && done.counted) {
      eng.form.track(metrics);
      const form = eng.form.scoreRep(done, [metrics], def);
      formScoreRef.current = form.score;
      setQuality(form.quality);
      setRepCount((c) => c + 1);
      const msg = form.quality === 'GOOD'
        ? CoachingEngine.positiveMessages()[0]
        : 'Controla el movimiento.';
      setDebug((d) => ({ ...d, form: form.score, rom: done.romKneeDeg, phase: eng.rep.getState() }));
      void speak(msg);
      void eng.coach.record({ message: msg, priority: 1, minCooldownMs: 1500 }, nowMs);
    }

    const level = eng.fatigue.update(metrics, formScoreRef.current);
    if (level.advice && eng.coach.shouldSpeak({ message: level.advice, priority: 2, minCooldownMs: 12000 }, nowMs)) {
      void speak(level.advice);
      void eng.coach.record({ message: level.advice, priority: 2, minCooldownMs: 12000 }, nowMs);
      setDebug((d) => ({ ...d, failure: level.proximity }));
    }
    setDebug((d) => ({ ...d, velocity: metrics.velocityDegPerSec, phase: eng.rep.getState() }));
  }, [eng, runtime, def]);

  return { status, hint, repCount, target, quality, isCounting, debug, onFrame, startCountdown, stop };
}