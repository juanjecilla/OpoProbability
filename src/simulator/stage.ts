import type { Outcome } from '../lib/draw';

export type StagePhase = 'idle' | 'spinning' | 'revealing' | 'done';

export interface Stage {
  phase: StagePhase;
  /** Topics the candidate studied in the Session this draw belongs to. */
  studied: ReadonlySet<number>;
  drawn: number[];
  /** How many of `drawn` have dropped out of the drum so far. */
  shown: number;
  outcome: Outcome | null;
  /** Whether this stage was produced by an animated single draw. */
  animated: boolean;
}

export const IDLE_STAGE: Stage = {
  phase: 'idle',
  studied: new Set(),
  drawn: [],
  shown: 0,
  outcome: null,
  animated: false,
};
