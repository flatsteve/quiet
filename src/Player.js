const log = require("electron-log");
const player = require("play-sound")();

const { getIconsByTheme, joinPath } = require("./utils");
const { installUpdateAndRestart } = require("./updater");

class Player {
  constructor(tray) {
    this.tray = tray;
    this.tray.setToolTip("Quiet please");

    this.track = joinPath("../assets/noise.mp3");

    this.isPlaying = false;
    this.audioProcess = null;
    this.shouldRepeat = true;

    this.icons = getIconsByTheme();
    this.updateAvailable = false;
  }

  handlePlayerEvent(droppedTrack) {
    if (this.updateAvailable) {
      this.stop();
      return installUpdateAndRestart();
    }

    if (droppedTrack) {
      this.track = droppedTrack;

      this.stop();
      return this.play();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  setUpdateAvailable() {
    this.updateAvailable = true;
    this.tray.setImage(this.icons.updateIcon);
  }

  play() {
    this.isPlaying = true;
    this.shouldRepeat = true;
    this.tray.setImage(this.icons.stopIcon);

    this.audioProcess = player.play(this.track, err => {
      if (err) {
        return log.error(err);
      }

      if (this.shouldRepeat) {
        log.info("RESTARTING");
        this.play();
      }
    });
  }

  stop() {
    this.isPlaying = false;
    this.shouldRepeat = false;

    if (this.audioProcess) {
      this.audioProcess.kill();
    }

    this.tray.setImage(this.icons.playIcon);
  }

  handleThemeChange() {
    this.icons = getIconsByTheme();
    const { playIcon, stopIcon, updateIcon } = this.icons;

    if (this.updateAvailable) {
      return this.tray.setImage(updateIcon);
    }

    if (this.isPlaying) {
      this.tray.setImage(stopIcon);
    } else {
      this.tray.setImage(playIcon);
    }
  }
}

module.exports = Player;
