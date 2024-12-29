import { Resampler } from "./resampler";

enum MESSAGE {
  AUDIO_FRAME = "AUDIO_FRAME",
  SPEECH_START = "SPEECH_START",
  VAD_MISFIRE = "VAD_MISFIRE",
  SPEECH_END = "SPEECH_END",
  SPEECH_STOP = "SPEECH_STOP",
}

class VoiceAudioWorkletProcesser extends AudioWorkletProcessor {
  private resampler: Resampler;

  private stopProcessing = false;

  constructor(options: AudioWorkletNodeOptions) {
    super();

    this.port.onmessage = (ev) => {
      if (ev.data.message === MESSAGE.SPEECH_STOP) {
        this.stopProcessing = true;
      }
    };

    this.resampler = new Resampler({
      nativeSampleRate: sampleRate,
      targetSampleRate: 16000,
      targetFrameSize: options.parameterData?.frameSamples ?? 0,
    });
  }

  process(inputs: Float32Array[][]): boolean {
    if (this.stopProcessing) {
      return false;
    }

    const audioInput = inputs[0][0];

    if (audioInput instanceof Float32Array) {
      const frames = this.resampler.process(audioInput);
      for (const frame of frames) {
        this.port.postMessage(
          { message: MESSAGE.AUDIO_FRAME, data: frame.buffer },
          [frame.buffer]
        );
      }
    }

    return true;
  }
}

registerProcessor("vad-helper-worklet", VoiceAudioWorkletProcesser);
