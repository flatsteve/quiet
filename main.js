const { app, globalShortcut, Tray } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const isDev = require("electron-is-dev");
const player = require("play-sound")();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let audio = null;
let shouldRepeat = true;

log.info("APP IS RUNNING IN", isDev ? "DEV" : "PROD");

if (!isDev) {
  app.setLoginItemSettings({ openAtLogin: true });
  app.dock.hide();
}

app.on("ready", () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  let isPlaying = false;

  const playIcon = path.join(__dirname, "assets/play.png");
  const stopIcon = path.join(__dirname, "assets/stop.png");
  const tray = new Tray(playIcon);

  const play = () => {
    // Make sure child process is killed before starting a new one.
    if (audio) {
      audio.kill();
    }

    isPlaying = true;
    shouldRepeat = true;

    tray.setImage(stopIcon);

    audio = player.play(path.join(__dirname, "assets/noise.mp3"), err => {
      if (err) {
        return log.error(err);
      }

      // When track ends just start playing again if it isn't explicity stopped
      if (shouldRepeat) {
        log.info("RESTARTING");
        play();
      }
    });
  };

  const stop = () => {
    isPlaying = false;
    shouldRepeat = false;

    audio.kill();
    tray.setImage(playIcon);
  };

  const handlePlayStop = () => {
    if (isPlaying) {
      return stop();
    }

    play();
  };

  // Event handlers
  tray.on("click", () => {
    handlePlayStop();
  });

  tray.on("double-click", () => {
    if (isPlaying) {
      stop();
    }

    app.quit();
  });

  globalShortcut.register("MediaPlayPause", () => {
    handlePlayStop();
  });
});

app.on("will-quit", () => {
  log.info("EXIT APP");

  if (audio) {
    audio.kill();
  }

  globalShortcut.unregisterAll();
});
