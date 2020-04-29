const {
  app,
  globalShortcut,
  systemPreferences,
  Menu,
  Tray,
} = require("electron");
const log = require("electron-log");

const { checkForUpdates } = require("./updater");
const {
  getIconsByTheme,
  setProductionAppPreferences,
  showErrorDialog,
} = require("./utils");

setProductionAppPreferences();

const Player = require("./Player");
const Timer = require("./Timer");
const ContextMenu = require("./ContextMenu");

let player;

app.on("ready", () => {
  const { playIcon } = getIconsByTheme();

  const tray = new Tray(playIcon);
  const timer = new Timer(tray);
  player = new Player(tray);

  const contextMenu = new ContextMenu();
  const menuTemplate = Menu.buildFromTemplate(contextMenu.menuItems);
  tray.setContextMenu(menuTemplate);

  // EVENTS //
  function handleStop({ shouldReset }) {
    timer.resetTimer(shouldReset);
    player.stop();
    contextMenu.toggleStartStop(menuTemplate);
  }

  function handlePlay() {
    timer.start();
    player.play();
    contextMenu.toggleStartStop(menuTemplate);
  }

  contextMenu.on("play", handlePlay);
  contextMenu.on("stop", handleStop);
  timer.on("stop", handleStop);
  // EVENTS //

  checkForUpdates();

  tray.on("drop-files", (e, files) => {
    const track = files[0];
    const trackExtension = track.split(".").pop();

    log.info("Track:", track, "Extension:", trackExtension);

    if (trackExtension !== "mp3") {
      return showErrorDialog({ detail: "I only play .mp3's for now." });
    }

    timer.resetTimer({ shouldReset: true });
    player.handleDroppedTrack(droppedTrack);
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
