const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const checkForUpdates = () => {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
};

module.exports = checkForUpdates;
