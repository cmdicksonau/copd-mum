import "./index.css";
import { Composition } from "remotion";
import { WalkthroughComposition } from "./WalkthroughComposition";
import screensManifest from "../screens.json";

// Calculate total duration in frames
const calculateDuration = () => {
  const {fps} = screensManifest.videoConfig;
  const totalSeconds = screensManifest.screens.reduce(
    (sum: number, screen: any) => sum + screen.duration,
    0
  );
  const transitionOverlap = (screensManifest.screens.length - 1) * 30;
  return (totalSeconds * fps) - transitionOverlap;
};

export const RemotionRoot: React.FC = () => {
  const {fps, width, height} = screensManifest.videoConfig;
  const durationInFrames = calculateDuration();

  return (
    <>
      <Composition
        id="WalkthroughComposition"
        component={WalkthroughComposition}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
