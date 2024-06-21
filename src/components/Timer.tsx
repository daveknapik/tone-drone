import usePrettyElapsedTimer from "use-pretty-elapsed-timer";
import { useCallback, useEffect } from "react";

interface TimerProps {
  shouldRun: boolean;
}

function Timer({ shouldRun }: TimerProps) {
  const { elapsedTime, start, stop, reset } = usePrettyElapsedTimer("HH:mm:ss");

  const updateDisplyedTime = useCallback(() => {
    if (shouldRun) {
      reset();
      start();
    } else {
      stop();
    }
  }, [reset, start, stop, shouldRun]);

  useEffect(() => {
    updateDisplyedTime();
  }, [updateDisplyedTime]);

  return <div>{elapsedTime}</div>;
}

export default Timer;
