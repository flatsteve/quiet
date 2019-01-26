const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const checkForUpdates = player => {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  if (!isDev) {
    autoUpdater.checkForUpdates();

    autoUpdater.on("download-progress", progressObj => {
      log.info("Update percentage", progressObj.percent);
    });

    autoUpdater.on("update-downloaded", () => {
      player.setUpdateAvailable();
    });
  }
};

const installUpdateAndRestart = () => {
  autoUpdater.quitAndInstall();
};

module.exports = {
  checkForUpdates,
  installUpdateAndRestart
};
