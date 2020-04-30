const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const checkForUpdates = () => {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  if (!isDev) {
    autoUpdater.checkForUpdates();

    autoUpdater.on("download-progress", (progressObj) => {
      log.info("Update percentage", progressObj.percent);
    });

    autoUpdater.on("update-downloaded", () => {
      // TODO emit event to inform menu update is available
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
