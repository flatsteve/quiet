const {
  app,
  globalShortcut,
  nativeImage,
  nativeTheme,
  Menu,
  Tray
} = require("electron");
const log = require("electron-log");
const settings = require("electron-settings");

const { showNotification } = require("./notifications");
const { checkForUpdates } = require("./updater");
const { setProductionAppPreferences, loadSettings } = require("./utils");

setProductionAppPreferences();

const Player = require("./Player");
const Timer = require("./Timer");
const ContextMenu = require("./ContextMenu");

let player, contextMenu, menuTemplate;

app.on("ready", () => {
  const userSettings = loadSettings();

  function buildMenu(tray, userSettings) {
    contextMenu = new ContextMenu(userSettings);
    menuTemplate = Menu.buildFromTemplate(contextMenu.menuItems);
    tray.setContextMenu(menuTemplate);
  }

  function handlePlay() {
    if (settings.get("playSound")) {
      player.play();
    }

    timer.start();

    contextMenu.toggleStartStop(menuTemplate);

    showNotification({
      title: "Time to Work 👨‍💻",
      body: "Get it done. It'll feel good later."
    });
  }

  function handleStop({ shouldReset }) {
    if (settings.get("playSound")) {
      player.stop();
    }

    timer.resetTimer(shouldReset);
    contextMenu.toggleStartStop(menuTemplate);
  }

  function handleBreak() {
    if (settings.get("playSound")) {
      player.stop();
    }

    timer.resetTimer();
    timer.start();

    showNotification({
      title: "Break Time 🧘‍♀️",
      body: "15 pushups then chill."
    });
  }

  const tray = new Tray(nativeImage.createEmpty());
  const timer = new Timer(tray);
  player = new Player(tray);
  buildMenu(tray, userSettings);

  contextMenu.on("play", handlePlay);
  contextMenu.on("stop", handleStop);
  timer.on("stop", handleStop);
  timer.on("break", handleBreak);
  nativeTheme.on("updated", () => buildMenu(tray));

  checkForUpdates();
});

app.on("will-quit", () => {
  log.info("EXITING APP");

  player.stop();
  globalShortcut.unregisterAll();
});
