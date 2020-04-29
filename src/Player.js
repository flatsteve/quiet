const log = require("electron-log");
const playSound = require("play-sound")();

const {
  getIconsByTheme,
  getTrackName,
  joinPath,
  showErrorDialog,
} = require("./utils");
const { showNotification } = require("./notifications");

class Player {
  constructor(tray) {
    this.tray = tray;

    // extraResource = Weird asar packaging thing. Files within an asar archive have restrictions.
    // It seems because we spawn a node child_process for tracks we have to un-package them (via extraResource)
    // essentially removing them from the asar archive and lifting them into the Resources directory -
    // thus freeing them from the restriction of archive files
    // https://github.com/electron-userland/electron-builder/issues/751
    // https://electronjs.org/docs/tutorial/application-packaging
    this.track = joinPath("../assets/noises/buzz.mp3", { extraResource: true });

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

  handleDroppedTrack(droppedTrack) {
    this.track = droppedTrack;

    if (this.isPlaying) {
      return this.stop({ skipToNewTrack: true });
    }

    this.play();
  }

  play() {
    this.audioProcess = playSound.play(this.track, (err) => {
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
}

module.exports = Player;
