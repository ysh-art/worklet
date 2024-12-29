export interface FrameProcessorOptions {
  POSITIVE_SPEECH_THRESHOLD: number;
  NEGATIVE_SPEECH_THRESHOLD: number;
  PRE_SPEECH_PAD_FRAMES: number;
  REDEMPTION_FRAMES: number;
  FRAME_SAMPLES: number;
  MIN_SPEECH_FRAMES: number;
  SUBMIT_USER_SPEECH_ON_PAUSE: boolean;
}

export interface SpeechProbabilities {
  notSpeech: number;
  isSpeech: number;
}

export enum MESSAGE {
  AUDIO_FRAME = 'AUDIO_FRAME',
  SPEECH_START = 'SPEECH_START',
  VAD_MISFIRE = 'VAD_MISFIRE',
  SPEECH_END = 'SPEECH_END',
  SPEECH_STOP = 'SPEECH_STOP',
}

export interface FrameProcessorInterface {
  process: (arr: Float32Array) => Promise<{
    probs?: SpeechProbabilities;
    msg?: MESSAGE;
    frame?: Float32Array;
  }>;
}

export interface SpeechConfidenceFramesInterface {
  frame: Float32Array;
  isSpeech: boolean;
}

export type Log = {
  info: (message: string) => void;
  error: (message: string) => void;
};
