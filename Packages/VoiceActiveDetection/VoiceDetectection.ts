import { AudioAnalyzer } from './AudioAnalyzer';

// types
import { Log } from './types';

export class Loger implements Log {
  info(message: string): void {
    console.log(`INFO: ${message}`);
  }

  error(message: string): void {
    console.log(`ERROR: ${message}`);
  }
}


export class VoiceDetection {
  private audioContext!: AudioContext;

  private audioAnalyzer!:AudioAnalyzer;

  private sourceNode!: MediaStreamAudioSourceNode;

  public log: Log;

  constructor() {
    this.log = new Loger();
  }

  start = async (stream: MediaStream) => {
    console.log(" voice detection started")
    this.log.info("IT has rellly started")

    if (stream === undefined) {
      this.log.error('Stream is undefined');
      return;
    }

    this.audioContext = new AudioContext();
    this.sourceNode = new MediaStreamAudioSourceNode(this.audioContext, { mediaStream: stream });
    this.audioAnalyzer = new AudioAnalyzer({ audioContext: this.audioContext, log: this.log });
    await this.audioAnalyzer.init();
    this.audioAnalyzer.start(this.sourceNode);
  };

  stop = () => {
    console.log("voice detection stopped")
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.audioAnalyzer) {
      this.audioAnalyzer.destroy();
    }
    this.audioContext.close();
  };
}
