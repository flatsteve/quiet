const {
  app,
  globalShortcut,
  nativeImage,
  nativeTheme,
  Menu,
  Tray
} = require("electron");
const log = require("electron-log");

const { checkForUpdates } = require("./updater");
const { setProductionAppPreferences, showErrorDialog } = require("./utils");

setProductionAppPreferences();

const Player = require("./Player");
const Timer = require("./Timer");
const ContextMenu = require("./ContextMenu");

let player, contextMenu, menuTemplate;

app.on("ready", () => {
  function buildMenu(tray) {
    contextMenu = new ContextMenu();
    menuTemplate = Menu.buildFromTemplate(contextMenu.menuItems);
    tray.setContextMenu(menuTemplate);
  }

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

  const tray = new Tray(nativeImage.createEmpty());
  const timer = new Timer(tray);
  player = new Player(tray);
  buildMenu(tray);

  contextMenu.on("play", handlePlay);
  contextMenu.on("stop", handleStop);
  timer.on("stop", handleStop);
  nativeTheme.on("updated", () => buildMenu(tray));
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
    player.handleDroppedTrack(track);
  });
});

app.on("will-quit", () => {
  log.info("EXIT APP");

  player.stop();
  globalShortcut.unregisterAll();
});
