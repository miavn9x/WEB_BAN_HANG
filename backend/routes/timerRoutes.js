// routes/timerRoutes.js
const express = require("express");
const router = express.Router();

const convertToMilliseconds = (hours = 0, minutes = 0, seconds = 0) =>
  (hours * 3600 + minutes * 60 + seconds) * 1000;

// Các hằng số cho API ban đầu
const MAIN_PHASE_DURATION = convertToMilliseconds(0, 1, 0); // 1 phút (ví dụ)
const RESET_PHASE_DURATION = convertToMilliseconds(0, 0, 30); // 30 giây (ví dụ)

// API cho timer với 2 pha: main và reset
router.get("/timer", (req, res) => {
  const now = Date.now();

  if (!global.timerState) {
    global.timerState = {
      phase: "main",
      targetTime: now + MAIN_PHASE_DURATION,
    };
  }

  if (now >= global.timerState.targetTime) {
    const nextPhase = global.timerState.phase === "main" ? "reset" : "main";
    const duration =
      nextPhase === "main" ? MAIN_PHASE_DURATION : RESET_PHASE_DURATION;

    global.timerState = {
      phase: nextPhase,
      targetTime: now + duration,
    };
  }

  res.json({
    currentPhase: global.timerState.phase,
    targetTime: global.timerState.targetTime,
    serverTime: now,
    remainingTime: global.timerState.targetTime - now,
  });
});

// -------------------------------
// API mới: Đếm ngược 3 giờ (sau 3h sẽ tự động reset)
// -------------------------------
const THREE_HOUR_DURATION = convertToMilliseconds(3, 0, 0);

router.get("/timer/three-hour", (req, res) => {
  const now = Date.now();

  if (!global.threeHourTimer) {
    global.threeHourTimer = {
      targetTime: now + THREE_HOUR_DURATION,
    };
  }

  // Nếu đã hết thời gian đếm ngược, reset lại cho chu kỳ mới 3 giờ
  if (now >= global.threeHourTimer.targetTime) {
    global.threeHourTimer.targetTime = now + THREE_HOUR_DURATION;
  }

  const remainingTime = global.threeHourTimer.targetTime - now;

  res.json({
    targetTime: global.threeHourTimer.targetTime,
    serverTime: now,
    remainingTime,
    message:
      remainingTime > 0
        ? "Đang đếm ngược 3 giờ..."
        : "3 giờ đã hết, reset timer.",
  });
});

module.exports = router;
