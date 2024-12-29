import { InferenceSession, Tensor } from "onnxruntime-web";

import { SpeechProbabilities, Log } from "./types";

const zeroes = Array(2 * 64).fill(0);
const MODEL_URL = "https://cdn.jsdelivr.net/gh/ysh-art/silero-cdn-file/silero_vad.onnx";


export class SpeechDetectionModel {
  private session!: InferenceSession;

  private hiddenStates: Tensor = new Tensor("float32", zeroes, [2, 1, 64]);

  private cellStates: Tensor = new Tensor("float32", zeroes, [2, 1, 64]);

  private samplingRate: Tensor = new Tensor("int64", [BigInt(16000)]);

  public log: Log;

  constructor(log: Log) {
    this.log = log;
  }

  init = async () => {
    this.session = await InferenceSession.create(MODEL_URL);
  };

  resetState = () => {
    this.hiddenStates = new Tensor("float32", zeroes, [2, 1, 64]);
    this.cellStates = new Tensor("float32", zeroes, [2, 1, 64]);
  };

  process = async (audioFrame: Float32Array): Promise<SpeechProbabilities> => {
    const audioInput = new Tensor("float32", audioFrame, [
      1,
      audioFrame.length,
    ]);
    const inputs = {
      input: audioInput,
      h: this.hiddenStates,
      c: this.cellStates,
      sr: this.samplingRate,
    };

    if (this.session) {
      const out = await this.session.run(inputs);

      this.hiddenStates = out.hn;
      this.cellStates = out.cn;

      const [isSpeechOutput] = out.output.data;
      const notSpeech = 1 - (isSpeechOutput as number);
      const isSpeech = isSpeechOutput as number;

      return { notSpeech, isSpeech };
    } else {
      this.log.error("Speech Detection Model is not Initialized");
      return { notSpeech: 1, isSpeech: 0 };
    }
  };
}
