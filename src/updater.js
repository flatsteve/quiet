const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const { showNotification } = require("./notifications");

const checkForUpdates = (player) => {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  if (!isDev) {
    autoUpdater.checkForUpdates();

    autoUpdater.on("download-progress", (progressObj) => {
      log.info("Update percentage", progressObj.percent);
    });

    autoUpdater.on("update-downloaded", () => {
      // TODO
      showNotification({
        title: "Update available",
        body: "Do something smart here",
      });
    });
  }
};

const installUpdateAndRestart = () => {
  autoUpdater.quitAndInstall();
};

module.exports = {
  checkForUpdates,
  installUpdateAndRestart,
};
