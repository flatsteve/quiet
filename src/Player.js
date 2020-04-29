const log = require("electron-log");
const player = require("play-sound")();

const {
  TIMES,
  getIconsByTheme,
  getTrackName,
  getTimerDisplay,
  joinPath,
  showErrorDialog,
} = require("./utils");
const { installUpdateAndRestart } = require("./updater");
const { showNotification } = require("./notifications");

const WORK_TIMER_VAL = TIMES.TWENTY_FIVE_MIN;
const BREAK_TIMER_VAL = TIMES.FIVE_MIN;

class Player {
  constructor(tray) {
    this.tray = tray;
    this.tray.setToolTip("Quiet please");
    this.intervalId = null;
    this.currentTimer = WORK_TIMER_VAL;
    this.tray.setTitle(getTimerDisplay(this.currentTimer));
    this.workMode = true;

    // extraResource = Weird asar packaging thing. Files within an asar archive have restrictions.
    // It seems because we spawn a node child_process for tracks we have to un-package them (via extraResource)
    // essentially removing them from the asar archive and lifting them into the Resources directory -
    // thus freeing them from the restriction of archive files
    // https://github.com/electron-userland/electron-builder/issues/751
    // https://electronjs.org/docs/tutorial/application-packaging
    this.track = joinPath("../assets/buzz.mp3", { extraResource: true });

    this.isPlaying = false;
    this.audioProcess = null;
    this.shouldPlayAgain = true;
    this.showNotification = true;

    this.icons = getIconsByTheme();
    this.updateAvailable = false;
  }

  setUpdateAvailable() {
    this.updateAvailable = true;
    this.tray.setImage(this.icons.updateIcon);
  }

  handleThemeChange() {
    this.icons = getIconsByTheme();
    const { playIcon, stopIcon, updateIcon } = this.icons;

    if (this.updateAvailable) {
      return this.tray.setImage(updateIcon);
    }

    if (this.isPlaying) {
      return this.tray.setImage(stopIcon);
    }

    this.tray.setImage(playIcon);
  }

  handlePlayerEvent(droppedTrack) {
    if (this.updateAvailable) {
      this.stop();
      return installUpdateAndRestart();
    }

    if (droppedTrack) {
      return this.handleDroppedTrack(droppedTrack);
    }

    this.handleTrayClick();
  }

  handleDroppedTrack(droppedTrack) {
    this.track = droppedTrack;

    if (this.isPlaying) {
      return this.stop({ skipToNewTrack: true });
    }

    this.play();
  }

  handleTrayClick() {
    if (this.isPlaying) {
      this.resetTimer({ manualStop: true });
      return this.stop();
    }

    this.intervalId = setInterval(() => {
      this.currentTimer -= 1;

      const displayTime = getTimerDisplay(this.currentTimer);
      this.tray.setTitle(displayTime);

      if (this.currentTimer <= 0) {
        this.resetTimer();
        return this.stop();
      }
    }, TIMES.ONE_SEC);

    this.play();
  }

  play() {
    this.audioProcess = player.play(this.track, (err) => {
      if (err) {
        log.error(err);

        return showErrorDialog({
          message: "Error playing track",
          detail:
            "Sorry, something went wrong. Check the track hasn't moved or been deleted.",
        });
      }

      // Callback - if we get here audio process finished without error
      // This is the "loop", if shouldPlayAgain is true then play whatever this.track is
      if (this.shouldPlayAgain) {
        this.play();
      }
    });

    this.isPlaying = true;
    this.shouldPlayAgain = true;
    this.tray.setImage(this.icons.stopIcon);

    if (this.showNotification) {
      showNotification({
        title: "Now playing",
        body: getTrackName(this.track),
      });
    }

    this.showNotification = false;
  }

  stop({ skipToNewTrack } = {}) {
    // If skipToNewTrack is past kill the current process and start a new one using the dropped track
    // If not kill the process and do not start a new track (see play() callback)
    if (skipToNewTrack) {
      this.shouldPlayAgain = true;
    } else {
      this.shouldPlayAgain = false;
    }

    if (this.audioProcess) {
      this.audioProcess.kill();
    }

    this.isPlaying = false;
    this.showNotification = true;
    this.tray.setImage(this.icons.playIcon);
  }

  resetTimer({ manualStop } = {}) {
    clearInterval(this.intervalId);

    if (manualStop) {
      this.currentTimer = WORK_TIMER_VAL;
    } else {
      this.currentTimer = this.workMode ? BREAK_TIMER_VAL : WORK_TIMER_VAL;
      this.workMode = !this.workMode;
    }

    this.tray.setTitle(getTimerDisplay(this.currentTimer));
    this.intervalId = null;
  }
}

module.exports = Player;
