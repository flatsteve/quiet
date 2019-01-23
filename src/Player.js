const log = require("electron-log");
const player = require("play-sound")();

const { getIconsByTheme, joinPath } = require("./utils");

class Player {
  constructor(tray) {
    this.tray = tray;
    this.tray.setToolTip("Quiet please...");
    this.isPlaying = false;
    this.audioProcess = null;
    this.shouldRepeat = true;
    this.icons = getIconsByTheme();
  }

  handlePlayOrStop(sound = joinPath("../assets/noise.mp3")) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(sound);
    }
  }

  play(sound) {
    if (this.audioProcess) {
      this.audioProcess.kill();
    }

    this.isPlaying = true;
    this.shouldRepeat = true;
    this.tray.setImage(this.icons.stopIcon);

    this.audioProcess = player.play(sound, err => {
      if (err) {
        return log.error(err);
      }

      if (this.shouldRepeat) {
        log.info("RESTARTING");
        this.play(sound);
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
    const { playIcon, stopIcon } = this.icons;

    if (this.isPlaying) {
      this.tray.setImage(stopIcon);
    } else {
      this.tray.setImage(playIcon);
    }
  }
}

module.exports = Player;
