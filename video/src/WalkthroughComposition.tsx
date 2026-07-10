import React from 'react';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {ScreenSlide} from './ScreenSlide';
import screensManifest from '../screens.json';

export const WalkthroughComposition: React.FC = () => {
  const {fps} = screensManifest.videoConfig;

  return (
    <TransitionSeries>
      {screensManifest.screens.map((screen: any, index: number) => {
        const durationInFrames = screen.duration * fps;

        return (
          <React.Fragment key={screen.id}>
            <TransitionSeries.Sequence
              durationInFrames={durationInFrames}
            >
              <ScreenSlide
                imageSrc={screen.imagePath}
                title={screen.title}
                description={screen.description}
                width={screen.width}
                height={screen.height}
              />
            </TransitionSeries.Sequence>
            {index < screensManifest.screens.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: 30, // 1 second transition
                })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};
