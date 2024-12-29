import { FrameProcessor } from "./FrameProcessor";
import { SpeechDetectionModel } from "./SpeechDetectionModel";
// constants
import { audioWorkletNodeOptions } from "./constants";
import { AudioWorklet } from "./Worklet/AudioWorklet";

// types
import {
  FrameProcessorInterface,
  MESSAGE,
  SpeechProbabilities,
  Log,
} from "./types";

export class AudioAnalyzer {
  public audioContext: AudioContext;

  private frameProcessor!: FrameProcessorInterface;

  private audioWorkletNode!: AudioWorkletNode;

  public log: Log;

  constructor({ audioContext, log }: { audioContext: AudioContext; log: Log }) {
    this.audioContext = audioContext;
    this.log = log;
  }

  init = async () => {
    try {
      // @ts-ignore
      const workerURL = new AudioWorklet(
        new URL("./Worklet/worklet.ts", import.meta.url)
      );
      await this.audioContext.audioWorklet.addModule(workerURL);
    } catch (e) {
      this.log.error(`Encountered an error while loading worklet.`);
    }

    this.audioWorkletNode = new AudioWorkletNode(
      this.audioContext,
      "vad-helper-worklet",
      audioWorkletNodeOptions
    );

    const speechDetectionModel = new SpeechDetectionModel(this.log);

    try {
      await speechDetectionModel.init();
    } catch (e) {
      this.log.error("Encountered an error while initializing the model file.");
    }

    this.frameProcessor = new FrameProcessor({
      predictSpeechPresence: speechDetectionModel.process,
      modelReset: speechDetectionModel.resetState,
    });

    this.audioWorkletNode.port.onmessage = async (ev: MessageEvent) => {
      if (ev.data?.message === MESSAGE.AUDIO_FRAME) {
        let buffer: ArrayBuffer = ev.data.data;
        if (buffer instanceof ArrayBuffer) {
          const frame = new Float32Array(buffer);
          await this.processFrame(frame);
        } else {
          this.log.error("Invalid frames from audio rendring thread");
        }
      }
    };
  };

  start = (node: AudioNode) => {
    if (this.audioWorkletNode) {
      node.connect(this.audioWorkletNode);
      console.log("node connected");
    }
  };

  processFrame = async (frame: Float32Array) => {
    if (this.frameProcessor) {
      const ev = await this.frameProcessor.process(frame);
      this.handleFrameProcessorEvent(ev);
    }
  };

  private handleFrameProcessorEvent(
    ev: Partial<{
      probs: SpeechProbabilities;
      msg: MESSAGE;
      frame: Float32Array;
    }>
  ) {
    switch (ev.msg) {
      case MESSAGE.SPEECH_START:
        this.log.info("Speech started");
        break;

      case MESSAGE.VAD_MISFIRE:
        this.log.info("Misfire");
        break;

      case MESSAGE.SPEECH_END:
        this.log.info("Speech Ended");
        break;

      default:
        break;
    }
  }

  destroy = () => {
    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.postMessage({
        message: MESSAGE.SPEECH_STOP,
      });
      this.audioWorkletNode.disconnect();
    }
  };
}
