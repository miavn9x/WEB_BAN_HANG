// routes/timerRoutes.js
const express = require("express");
const router = express.Router();

const convertToMilliseconds = (hours = 0, minutes = 0, seconds = 0) =>
  (hours * 3600 + minutes * 60 + seconds) * 1000;

const MAIN_PHASE_DURATION = convertToMilliseconds(0, 2, 0); // 2 giờ vị trí 1, phút vị rí 2, giây vị trí 3 
const RESET_PHASE_DURATION = convertToMilliseconds(0, 2, 0); // 10 phút

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

  // Trả về thông tin hiện tại của timer
  res.json({
    currentPhase: global.timerState.phase,
    targetTime: global.timerState.targetTime,
    serverTime: now,
  });
});

module.exports = router;
