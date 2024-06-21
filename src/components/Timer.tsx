import formatDuration from "format-duration";
import { useTimer } from "react-use-precision-timer";
import { useCallback, useEffect, useState } from "react";

interface TimerProps {
  shouldRun: boolean;
}

function Timer({ shouldRun }: TimerProps) {
  const [duration, setDuration] = useState(0);

  const updateDisplayedTime = () => {
    setDuration(timer.getElapsedStartedTime());
  };

  const timer = useTimer({ delay: 1000 }, updateDisplayedTime);

  const startStopTimer = useCallback(() => {
    if (shouldRun) {
      setDuration(0);
      timer.start();
    } else {
      timer.stop();
    }
  }, [shouldRun, timer]);

  useEffect(() => {
    startStopTimer();
  }, [startStopTimer]);

  return <div>{formatDuration(duration, { leading: true })}</div>;
}

export default Timer;
