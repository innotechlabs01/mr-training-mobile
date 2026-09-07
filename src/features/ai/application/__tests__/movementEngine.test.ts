import { compute } from '../MovementEngine';
import { LANDMARK_IDS as ID } from '../../domain/BodyPart';
import type { Landmark } from '../../domain/Landmark';

const L = (x: number, y: number): Landmark => ({ x, y, z: 0, confidence: 1, visibility: 1 });

describe('MovementEngine', () => {
  it('reports ~180 deg knee angle when standing straight', () => {
    const lm: Landmark[] = [];
    lm[ID.leftHip] = L(0.5, 0.3); lm[ID.leftKnee] = L(0.5, 0.6); lm[ID.leftAnkle] = L(0.5, 0.9);
    const m = compute({ landmarks: lm, timestamp: 1000 });
    expect(m.kneeAngleDeg).toBeCloseTo(180, 0);
  });
  it('reports ~90 deg knee angle at a deep squat', () => {
    const lm: Landmark[] = [];
    lm[ID.leftHip] = L(0.5, 0.7); lm[ID.leftKnee] = L(0.5, 0.6); lm[ID.leftAnkle] = L(0.5, 0.9);
    const m = compute({ landmarks: lm, timestamp: 1000 });
    expect(m.kneeAngleDeg).toBeCloseTo(90, 0);
    expect(m.hipDrop).toBeGreaterThan(1);
  });
});
