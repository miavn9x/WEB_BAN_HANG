import React, { useState, useEffect } from "react";
import "./Countdown.css";

const Countdown = () => {
  const [hours, setHours] = useState(24);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (hours === 0 && minutes === 0 && seconds === 0) {
        clearInterval(countdownInterval);
      } else {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else if (hours > 0) {
          setHours((prev) => prev - 1);
          setMinutes(59);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [hours, minutes, seconds]);

  const formatTime = (time) => String(time).padStart(2, "0");

  return (
    <div className="wrap">
      <h1>
        Draft <strong>Countdown</strong>
      </h1>

      <div className="countdown">
        <div className="bloc-time hours">
          <span className="count-title">Hours</span>
          <div className="figure">
            <span className="top">{formatTime(hours)[0]}</span>
            <span className="bottom">{formatTime(hours)[0]}</span>
          </div>
          <div className="figure">
            <span className="top">{formatTime(hours)[1]}</span>
            <span className="bottom">{formatTime(hours)[1]}</span>
          </div>
        </div>

        <div className="bloc-time min">
          <span className="count-title">Minutes</span>
          <div className="figure">
            <span className="top">{formatTime(minutes)[0]}</span>
            <span className="bottom">{formatTime(minutes)[0]}</span>
          </div>
          <div className="figure">
            <span className="top">{formatTime(minutes)[1]}</span>
            <span className="bottom">{formatTime(minutes)[1]}</span>
          </div>
        </div>

        <div className="bloc-time sec">
          <span className="count-title">Seconds</span>
          <div className="figure">
            <span className="top">{formatTime(seconds)[0]}</span>
            <span className="bottom">{formatTime(seconds)[0]}</span>
          </div>
          <div className="figure">
            <span className="top">{formatTime(seconds)[1]}</span>
            <span className="bottom">{formatTime(seconds)[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
