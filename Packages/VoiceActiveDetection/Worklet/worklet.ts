interface ResamplerOptions {
  nativeSampleRate: number;
  targetSampleRate: number;
  targetFrameSize: number;
}

enum MESSAGE {
  AUDIO_FRAME = "AUDIO_FRAME",
  SPEECH_START = "SPEECH_START",
  VAD_MISFIRE = "VAD_MISFIRE",
  SPEECH_END = "SPEECH_END",
  SPEECH_STOP = "SPEECH_STOP",
}

class Resampler {
  inputBuffer: Array<number>;

  constructor(public options: ResamplerOptions) {
    if (options.nativeSampleRate < 16000) {
      console.error(
        "nativeSampleRate is too low. Should have 16000 = targetSampleRate <= nativeSampleRate"
      );
    }
    this.inputBuffer = [];
  }

  process = (audioFrame: Float32Array): Float32Array[] => {
    const outputFrames: Array<Float32Array> = [];

    for (const sample of audioFrame) {
      this.inputBuffer.push(sample);

      while (this.hasEnoughDataForFrame()) {
        const outputFrame = this.generateOutputFrame();
        outputFrames.push(outputFrame);
      }
    }

    return outputFrames;
  };

  private hasEnoughDataForFrame(): boolean {
    return (
      (this.inputBuffer.length * this.options.targetSampleRate) /
        this.options.nativeSampleRate >=
      this.options.targetFrameSize
    );
  }

  private generateOutputFrame(): Float32Array {
    const outputFrame = new Float32Array(this.options.targetFrameSize);
    let outputIndex = 0;
    let inputIndex = 0;

    while (outputIndex < this.options.targetFrameSize) {
      let sum = 0;
      let num = 0;
      while (
        inputIndex <
        Math.min(
          this.inputBuffer.length,
          ((outputIndex + 1) * this.options.nativeSampleRate) /
            this.options.targetSampleRate
        )
      ) {
        const value = this.inputBuffer[inputIndex];
        if (value !== undefined) {
          sum += value;
          num += 1;
        }
        inputIndex += 1;
      }
      outputFrame[outputIndex] = sum / num;
      outputIndex += 1;
    }

    this.inputBuffer = this.inputBuffer.slice(inputIndex);
    return outputFrame;
  }
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
