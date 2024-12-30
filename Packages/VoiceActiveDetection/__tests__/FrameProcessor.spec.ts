import { FrameProcessor } from "../FrameProcessor";

describe("FrameProcessor", () => {
  test("should call predictSpeechPresence and return true for speech detected", async () => {
    const mockPredictSpeechPresence = jest.fn();
    const mockModelReset = jest.fn();

    // Initialize the class with the mocks
    const frameProcessor = new FrameProcessor({
      predictSpeechPresence: mockPredictSpeechPresence,
      modelReset: mockModelReset,
    });

    mockPredictSpeechPresence.mockResolvedValue({
      notSpeech: 0.3,
      isSpeech: 0.7,
    });

    const frame = new Float32Array([0.1, 0.2, 0.3]);
    const result = await frameProcessor.process(frame);

    expect(mockPredictSpeechPresence).toHaveBeenCalledWith(frame);
    expect(result.msg).toBe("SPEECH_START");
  });

  test("Should call predictSpeechPresence and show Speech Started initially, then show Speech Stopped after redemption speech.", async () => {
    // Mock implementation for predictSpeechPresence

    const mockPredictSpeechPresence = jest.fn();
    const mockModelReset = jest.fn();

    // Initialize the class with the mocks
    const frameProcessor = new FrameProcessor({
      predictSpeechPresence: mockPredictSpeechPresence,
      modelReset: mockModelReset,
    });

    mockPredictSpeechPresence.mockResolvedValue({
      notSpeech: 0.3,
      isSpeech: 0.7,
    });

    const frame = new Float32Array([0.1, 0.2, 0.3]);
    const result = await frameProcessor.process(frame);

    expect(result.msg).toBe("SPEECH_START");
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);

    mockPredictSpeechPresence.mockResolvedValue({
      notSpeech: 0.8,
      isSpeech: 0.2,
    });

    // Redemption Frames
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    await frameProcessor.process(frame);
    const finalResult = await frameProcessor.process(frame);

    expect(finalResult.msg).toBe("SPEECH_END");
  });
});
