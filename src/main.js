const { app, globalShortcut, systemPreferences, Tray } = require("electron");
const log = require("electron-log");

const Player = require("./Player");
const { checkForUpdates } = require("./updater");
const {
  getIconsByTheme,
  setProductionAppPreferences,
  showErrorDialog
} = require("./utils");

let player;

setProductionAppPreferences();

app.on("ready", () => {
  const { playIcon } = getIconsByTheme();
  const tray = new Tray(playIcon);
  player = new Player(tray);

  checkForUpdates(player);

  tray.on("click", () => {
    player.handlePlayerEvent();
  });

  globalShortcut.register("MediaPlayPause", () => {
    player.handlePlayerEvent();
  });

  tray.on("drop-files", (e, files) => {
    const track = files[0];
    const trackExtension = track.split(".").pop();

    log.info("Track:", track, "Extension:", trackExtension);

    if (trackExtension !== "mp3") {
      return showErrorDialog({ detail: "I only play .mp3's for now." });
    }

    player.handlePlayerEvent(track);
  });

  tray.on("double-click", () => {
    player.stop();
    app.quit();
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
