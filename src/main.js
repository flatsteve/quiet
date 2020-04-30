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
const { setProductionAppPreferences } = require("./utils");

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
});

app.on("will-quit", () => {
  log.info("EXIT APP");

  player.stop();
  globalShortcut.unregisterAll();
});
