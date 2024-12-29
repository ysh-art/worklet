
class Resampler {
  constructor(options) {
    this.options = options;

    if (options.nativeSampleRate < 16000 || options.targetSampleRate > options.nativeSampleRate) {
      throw new Error('Invalid sample rates: Ensure 16000 <= targetSampleRate <= nativeSampleRate');
    }

    this.inputBuffer = [];
  }

  process(audioFrame) {
    const outputFrames = [];
    for (const sample of audioFrame) {
      this.inputBuffer.push(sample);
      while (this.hasEnoughDataForFrame()) {
        const outputFrame = this.generateOutputFrame();
        outputFrames.push(outputFrame);
      }
    }
    return outputFrames;
  }

  hasEnoughDataForFrame() {
    return (
      (this.inputBuffer.length * this.options.targetSampleRate) / this.options.nativeSampleRate >=
      this.options.targetFrameSize
    );
  }

  generateOutputFrame() {
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
          ((outputIndex + 1) * this.options.nativeSampleRate) / this.options.targetSampleRate
        )
      ) {
        const value = this.inputBuffer[inputIndex];
        sum += value;
        num += 1;
        inputIndex += 1;
      }
      outputFrame[outputIndex] = num > 0 ? sum / num : 0;
      outputIndex += 1;
    }

    this.inputBuffer = this.inputBuffer.slice(inputIndex);
    return outputFrame;
  }
}

class VoiceAudioWorkletProcesser extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.stopProcessing = false;
    this.port.onmessage = ev => {
      if (ev.data.message === 'SPEECH_START') {
        this.stopProcessing = true;
      }
    };
    this.resampler = new Resampler({
      nativeSampleRate: sampleRate,
      targetSampleRate: 16000,
      targetFrameSize: options.parameterData?.frameSamples ?? 0,
    });
  }

  process(inputs) {
    if (this.stopProcessing) {
      return false;
    }
    const audioInput = inputs[0][0];
    if (audioInput instanceof Float32Array) {
      const frames = this.resampler.process(audioInput);
      for (const frame of frames) {
        this.port.postMessage({ message: 'AUDIO_FRAME', data: frame.buffer }, [frame.buffer]);
      }
    }
    return true;
  }
}
registerProcessor('vad-helper-worklet', VoiceAudioWorkletProcesser);
