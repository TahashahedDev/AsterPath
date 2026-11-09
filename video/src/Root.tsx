import { Composition } from "remotion";
import { Intro, INTRO_DURATION } from "./Intro";

/** 16:9 for the website; 9:16 for Instagram Reels and WhatsApp Status. */
export function Root() {
  return (
    <>
      <Composition id="Intro" component={Intro} durationInFrames={INTRO_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="IntroVertical" component={Intro} durationInFrames={INTRO_DURATION} fps={30} width={1080} height={1920} />
    </>
  );
}
