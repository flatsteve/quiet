const {
  app,
  globalShortcut,
  nativeImage,
  nativeTheme,
  Menu,
  Tray
} = require("electron");
const log = require("electron-log");

const { showNotification } = require("./notifications");
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

  function handleBreak() {
    player.stop();
    timer.resetTimer();
    timer.start();

    showNotification({
      title: "Break Time 🧘‍♀️",
      body: "10 push ups then chill."
    });
  }

  function handlePlay() {
    timer.start();
    player.play();
    contextMenu.toggleStartStop(menuTemplate);

    showNotification({
      title: "Time to Work 👨‍💻",
      body: "Get it done. It'll feel good later."
    });
  }

  const tray = new Tray(nativeImage.createEmpty());
  const timer = new Timer(tray);
  player = new Player(tray);
  buildMenu(tray);

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
