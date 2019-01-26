const { app, dialog, systemPreferences } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

const joinPath = (relativePath, { extraResource = false } = {}) => {
  // Prod: assets is in the same directory (as Resources) so remove the ../
  if (extraResource && !isDev) {
    relativePath = relativePath.replace("../", "");
    return path.join(process.resourcesPath, relativePath);
  }

  return path.join(__dirname, relativePath);
};

const getTrackName = trackPath => {
  return trackPath.split("/").pop();
};

const getIconsByTheme = () => {
  if (systemPreferences.isDarkMode()) {
    return {
      playIcon: joinPath("../assets/play-dark.png"),
      stopIcon: joinPath("../assets/stop-dark.png"),
      updateIcon: joinPath("../assets/update-dark.png")
    };
  } else {
    return {
      playIcon: joinPath("../assets/play-light.png"),
      stopIcon: joinPath("../assets/stop-light.png"),
      updateIcon: joinPath("../assets/update-light.png")
    };
  }
};

const showErrorDialog = ({
  message = "You're killing me smalls...",
  detail
}) => {
  dialog.showMessageBox(null, {
    type: "error",
    title: message,
    message,
    detail
  });
};

const setProductionAppPreferences = () => {
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
    app.dock.hide();
  }
};

module.exports = {
  joinPath,
  getTrackName,
  getIconsByTheme,
  showErrorDialog,
  setProductionAppPreferences
};
