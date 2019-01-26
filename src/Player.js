const log = require("electron-log");
const player = require("play-sound")();

const {
  getIconsByTheme,
  getTrackName,
  joinPath,
  showErrorDialog
} = require("./utils");
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
    this.shouldPlayAgain = true;

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
      this.tray.setImage(stopIcon);
    } else {
      this.tray.setImage(playIcon);
    }
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
      return this.stop();
    }

    this.play();
  }

  play() {
    this.audioProcess = player.play(this.track, err => {
      if (err) {
        log.error(err);

        return showErrorDialog({
          message: "Error playing track",
          detail:
            "Sorry, something went wrong. Check the track hasn't moved or been deleted."
        });
      }

      // Process was stopped without error
      if (this.shouldPlayAgain) {
        this.play();
      }
    });

    this.isPlaying = true;
    this.shouldPlayAgain = true;
    this.tray.setImage(this.icons.stopIcon);
    showNotification({ title: "Now playing", body: getTrackName(this.track) });
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
    this.tray.setImage(this.icons.playIcon);
  }
}

module.exports = Player;
