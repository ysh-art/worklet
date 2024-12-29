// constants
import { DEFAULT_FRAMEPROCESSOR_OPTIONS } from './constants';

// types
import {
  FrameProcessorOptions,
  FrameProcessorInterface,
  MESSAGE,
  SpeechProbabilities,
  SpeechConfidenceFramesInterface,
} from './types';

export class FrameProcessor implements FrameProcessorInterface {
  private speaking = false;

  private redemptionCounter = 0;

  private speechConfidenceFrames: SpeechConfidenceFramesInterface[] = [];

  private options: FrameProcessorOptions;

  private predictSpeechPresence: (frame: Float32Array) => Promise<SpeechProbabilities>;

  private modelReset: () => void;

  constructor({
    predictSpeechPresence,
    modelReset,
  }: {
    predictSpeechPresence: (frame: Float32Array) => Promise<SpeechProbabilities>;
    modelReset: () => void;
  }) {
    this.predictSpeechPresence = predictSpeechPresence;
    this.modelReset = modelReset;
    this.reset();
    this.options = DEFAULT_FRAMEPROCESSOR_OPTIONS;
  }

  reset = () => {
    this.speaking = false;
    this.speechConfidenceFrames = [];
    this.modelReset();
    this.redemptionCounter = 0;
  };

  process = async (frame: Float32Array) => {
    const speechProbability = await this.predictSpeechPresence(frame);

    this.speechConfidenceFrames.push({
      frame,
      isSpeech: speechProbability.isSpeech >= this.options.POSITIVE_SPEECH_THRESHOLD,
    });

    if (speechProbability.isSpeech >= this.options.POSITIVE_SPEECH_THRESHOLD && this.redemptionCounter) {
      this.redemptionCounter = 0;
    }

    if (speechProbability.isSpeech >= this.options.POSITIVE_SPEECH_THRESHOLD && !this.speaking) {
      this.speaking = true;
      return { speechProbability, msg: MESSAGE.SPEECH_START, frame };
    }

    this.redemptionCounter += 1;

    if (
      speechProbability.isSpeech < this.options.NEGATIVE_SPEECH_THRESHOLD &&
      this.speaking &&
      this.redemptionCounter >= this.options.REDEMPTION_FRAMES
    ) {
      this.redemptionCounter = 0;
      this.speaking = false;

      const speechConfidenceFrames = this.speechConfidenceFrames;
      this.speechConfidenceFrames = [];

      const speechFrameCount = speechConfidenceFrames.reduce((acc, item) => acc + +item.isSpeech, 0);

      if (speechFrameCount >= this.options.MIN_SPEECH_FRAMES) {
        return { speechProbability, msg: MESSAGE.SPEECH_END, frame };
      } else {
        return { speechProbability, msg: MESSAGE.VAD_MISFIRE, frame };
      }
    }

    if (!this.speaking) {
      while (this.speechConfidenceFrames.length > this.options.PRE_SPEECH_PAD_FRAMES) {
        this.speechConfidenceFrames.shift();
      }
    }
    return { speechProbability, frame };
  };
}
