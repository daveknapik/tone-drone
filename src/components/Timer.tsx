interface TimerProps {
  hours: number;
  minutes: number;
  seconds: number;
}

function Timer({ hours, minutes, seconds }: TimerProps) {
  const timeLocale = {
    region: "en-US",
    options: {
      minimumIntegerDigits: 2,
      useGrouping: false,
    },
  };

  return (
    <div>
      {hours.toLocaleString(timeLocale.region, timeLocale.options)}:
      {minutes.toLocaleString(timeLocale.region, timeLocale.options)}:
      {seconds.toLocaleString(timeLocale.region, timeLocale.options)}
    </div>
  );
}

export default Timer;
