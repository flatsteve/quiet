const { app, globalShortcut, systemPreferences, Tray } = require("electron");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const Player = require("./Player");
const checkForUpdates = require("./updater");
const { getIconsByTheme, setProductionAppPreferences } = require("./utils");

let player;

log.info("APP RUNNING IN", isDev ? "DEV" : "PROD");
setProductionAppPreferences();

app.on("ready", () => {
  checkForUpdates();

  const { playIcon } = getIconsByTheme();
  const tray = new Tray(playIcon);
  player = new Player(tray);

  tray.on("click", () => {
    player.handlePlayOrStop();
  });

  globalShortcut.register("MediaPlayPause", () => {
    player.handlePlayOrStop();
  });

  tray.on("double-click", () => {
    player.stop();
    app.quit();
  });

  tray.on("drop-files", function(event, files) {
    player.handlePlayOrStop(files[0]);
  });

  systemPreferences.subscribeNotification(
    "AppleInterfaceThemeChangedNotification",
    () => player.handleThemeChange()
  );
});

app.on("will-quit", () => {
  log.info("EXIT APP");

  player.stop();
  globalShortcut.unregisterAll();
});
