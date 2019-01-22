const { app, globalShortcut, systemPreferences, Tray } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const isDev = require("electron-is-dev");
const player = require("play-sound")();

const { getIconsByTheme, joinPath, updateCurrentIcon } = require("./utils");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let icons;
let audioProcess = null;
let shouldRepeat = true;

log.info("APP RUNNING IN", isDev ? "DEV" : "PROD");

if (!isDev) {
  app.setLoginItemSettings({ openAtLogin: true });
  app.dock.hide();
}

app.on("ready", () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  let isPlaying = false;

  icons = getIconsByTheme();
  const tray = new Tray(icons.playIcon);
  tray.setToolTip("Quiet please.");

  const play = () => {
    // Make sure child process is killed before starting a new one.
    if (audioProcess) {
      audioProcess.kill();
    }

    isPlaying = true;
    shouldRepeat = true;

    tray.setImage(icons.stopIcon);

    audioProcess = player.play(joinPath("../assets/noise.mp3"), err => {
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

    audioProcess.kill();
    tray.setImage(icons.playIcon);
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

  systemPreferences.subscribeNotification(
    "AppleInterfaceThemeChangedNotification",
    () => {
      icons = getIconsByTheme();
      updateCurrentIcon(isPlaying, tray);
    }
  );

  globalShortcut.register("MediaPlayPause", () => {
    handlePlayStop();
  });
});

app.on("will-quit", () => {
  log.info("EXIT APP");

  if (audioProcess) {
    audioProcess.kill();
  }

  globalShortcut.unregisterAll();
});
