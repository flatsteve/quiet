const log = require("electron-log");
const player = require("play-sound")();

const { getIconsByTheme, getTrackName, joinPath } = require("./utils");
const { installUpdateAndRestart } = require("./updater");
const { showNotification } = require("./notifications");

class Player {
  constructor(tray) {
    this.tray = tray;
    this.tray.setToolTip("Quiet please");

    // Weird asar packaging thing - files within an asar package have restrictions.
    // It seems because we spawn a process to tracks we have to un-package them essentially
    // removing them from the archive and lifting them into the Resources directory
    // https://github.com/electron-userland/electron-builder/issues/751
    // https://electronjs.org/docs/tutorial/application-packaging
    this.track = joinPath("../assets/noise.mp3", { extraResource: true });

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
      // THIS IS THE ISSUE - stop is async - callback hasn't been hit by the time we call play
      // So stop kill audio & sets should repeat to false
      // We call play - setting should repeat to true
      // Callback is hit and play re-triggered, hence double tracks playing
      this.stop();

      this.track = droppedTrack;
      return this.play();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.audioProcess = player.play(this.track, err => {
      if (err) {
        return log.error(err);
      }

      if (this.shouldRepeat) {
        log.info("RESTARTING");
        this.play();
      }
    });

    this.isPlaying = true;
    this.shouldRepeat = true;
    this.tray.setImage(this.icons.stopIcon);
    showNotification({ title: "Now playing", body: getTrackName(this.track) });
  }

  stop() {
    this.shouldRepeat = false;

    if (this.audioProcess) {
      this.audioProcess.kill();
    }

    this.isPlaying = false;
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

  setUpdateAvailable() {
    this.updateAvailable = true;
    this.tray.setImage(this.icons.updateIcon);
  }
}

module.exports = Player;
