import { FrameProcessorOptions } from './types';

export const DEFAULT_FRAMEPROCESSOR_OPTIONS: FrameProcessorOptions = {
  POSITIVE_SPEECH_THRESHOLD: 0.5,
  NEGATIVE_SPEECH_THRESHOLD: 0.5 - 0.15,
  PRE_SPEECH_PAD_FRAMES: 1,
  REDEMPTION_FRAMES: 8,
  FRAME_SAMPLES: 1536,
  MIN_SPEECH_FRAMES: 3,
  SUBMIT_USER_SPEECH_ON_PAUSE: false,
};

export const audioWorkletNodeOptions = {
  parameterData: {
    frameSamples: DEFAULT_FRAMEPROCESSOR_OPTIONS.FRAME_SAMPLES,
  },
};
