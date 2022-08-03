import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import useInterval from '../hooks/use-interval';
//import { secondsToMinutes } from '../utils/seconds-to-minutes';
import { secondsToTime } from '../utils/seconds-to-time';
// import { secondsToTime } from '../utils/seconds-to-time';
import { Button } from './button';
import { Timer } from './timer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellStart = require('../sounds/src_sounds_bell-start.mp3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellFinish = require('../sounds/src_sounds_bell-finish.mp3');

const audioStartWorking = new Audio(bellStart);
const audioStopWorking = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  LongRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = useState(props.pomodoroTime);
  const [timeCounting, setTimeCounting] = useState(false);
  const [working, setWorking] = useState(false);
  const [resting, setResting] = useState(false);
  const [cyclesQtdManager, setCyclesQtdManager] = useState(
    new Array(props.cycles - 1).fill(true),
  );

  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullWorkingTime, setFullWorkingTime] = useState(0);
  const [numberOfPomodoro, setNumberOfPomodoro] = useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null,
  );

  const configureWork = useCallback(() => {
    setTimeCounting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartWorking.play();
  }, [
    setTimeCounting,
    setWorking,
    setResting,
    setMainTime,
    props.pomodoroTime,
  ]);

  const configureRest = useCallback(
    (Long: boolean) => {
      setTimeCounting(true);
      setWorking(false);
      setResting(true);

      if (Long) {
        setMainTime(props.LongRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }
      audioStopWorking.play();
    },
    [setTimeCounting, setWorking, setResting, setMainTime, props.shortRestTime],
  );

  useEffect(() => {
    if (working) document.body.classList.add('working');
    if (resting) document.body.classList.remove('working');
    if (mainTime > 0) return;
    if (working && cyclesQtdManager.length > 0) {
      configureRest(false);
      cyclesQtdManager.pop();
    } else if (working && cyclesQtdManager.length <= 0) {
      configureRest(true);
      setCompletedCycles(completedCycles + 1);
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true));
    }
    if (working) setNumberOfPomodoro(numberOfPomodoro + 1);
    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    cyclesQtdManager,
    numberOfPomodoro,
    completedCycles,
    configureRest,
    setCyclesQtdManager,
    configureWork,
    props.cycles,
  ]);

  return (
    <div className="pomodoro">
      <h2>
        You are: {working ? 'Working(Trabalhando)' : 'Rest(Descansando)'} -_-
      </h2>
      <Timer mainTime={mainTime} />
      <div className="controls">
        <Button text="Work" onClick={() => configureWork()}></Button>
        <Button text="Rest" onClick={() => configureRest(false)}></Button>
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeCounting ? 'Pause' : 'Play'}
          onClick={() => setTimeCounting(!timeCounting)}
        ></Button>
      </div>
      <div className="details">
        <p>Concluded Cycles: {completedCycles}</p>
        <p>Worked Hours: {secondsToTime(fullWorkingTime)}</p>
        <p>Completed Pomodoros: {numberOfPomodoro}</p>
      </div>
    </div>
  );
}
