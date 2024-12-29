// Libraries
import { useState } from "react";
import * as React from "react";
import { VoiceDetection } from "../../../Packages/VoiceActiveDetection/VoiceDetectection";

const mymodule = new VoiceDetection();

export const VoiceOutbound = (): React.JSX.Element => {
  const [textAreaContent, setTextAreaContent] = useState("Not started");
  const [logicRunning, setLogicRunning] = useState(false);

  const startLogic = async () => {
    setLogicRunning(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      },
    });

    mymodule.start(stream);
    setTextAreaContent("Started");
  };

  const stopLogic = () => {
    setLogicRunning(false);
    mymodule.stop();
    setTextAreaContent("Stopped");
  };

  return (
    <div>
      <h4>{textAreaContent}</h4>
      <br />
      <button onClick={startLogic}>Start Logic</button>
      <button onClick={stopLogic} disabled={!logicRunning}>
        Stop Logic
      </button>
    </div>
  );
};
