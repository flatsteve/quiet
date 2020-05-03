const EventEmitter = require("events");

const { TIMES, getTimerDisplay } = require("./utils");

const WORK_TIMER_VAL = TIMES.TWENTY_FIVE_MIN;
const BREAK_TIMER_VAL = TIMES.FIVE_MIN;

class Timer extends EventEmitter {
  constructor(tray) {
    super();

    this.tray = tray;

    this.intervalId = null;
    this.currentTimer = WORK_TIMER_VAL;
    this.workMode = true;
    this.tray.setTitle(getTimerDisplay(this.currentTimer, this.workMode));
  }

  start() {
    this.intervalId = setInterval(() => {
      this.currentTimer -= 1;

      const displayTime = getTimerDisplay(this.currentTimer, this.workMode);
      this.tray.setTitle(displayTime);

      if (this.currentTimer < 0) {
        if (this.workMode) {
          return this.emit("break");
        }

        return this.emit("stop", { shouldReset: false });
      }
    }, TIMES.ONE_SEC);
  }

  resetTimer(shouldReset) {
    clearInterval(this.intervalId);

    if (shouldReset) {
      this.currentTimer = WORK_TIMER_VAL;
      this.workMode = true;
    } else {
      this.currentTimer = this.workMode ? BREAK_TIMER_VAL : WORK_TIMER_VAL;
      this.workMode = !this.workMode;
    }

    this.tray.setTitle(getTimerDisplay(this.currentTimer, this.workMode));
    this.intervalId = null;
  }
}

module.exports = Timer;
