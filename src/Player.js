const log = require("electron-log");
const playSound = require("play-sound")();

const { getTrackName, joinPath, showErrorDialog } = require("./utils");
const { showNotification } = require("./notifications");

class Player {
  constructor(tray) {
    this.tray = tray;
    this.track = joinPath("../assets/noises/buzz.mp3", { extraResource: true });

    this.isPlaying = false;
    this.audioProcess = null;
    this.shouldPlayAgain = true;
    this.showNotification = true;
    this.updateAvailable = false;
  }

  play() {
    this.audioProcess = playSound.play(this.track, (err) => {
      if (err) {
        log.error(err);

        return showErrorDialog({
          message: "Error playing track",
          detail:
            "Sorry, something went wrong. Check the track hasn't moved or been deleted."
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

    if (this.showNotification) {
      showNotification({
        title: "Now playing",
        body: getTrackName(this.track)
      });
    }

    this.showNotification = false;
  }

  stop() {
    if (this.audioProcess) {
      this.audioProcess.kill();
    }

    this.shouldPlayAgain = false;
    this.isPlaying = false;
    this.showNotification = true;
  }
}

module.exports = Player;
