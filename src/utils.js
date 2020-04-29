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

const getTrackName = (trackPath) => {
  return trackPath.split("/").pop();
};

const getIconsByTheme = () => {
  if (systemPreferences.isDarkMode()) {
    return {
      playIcon: joinPath("../assets/play-dark.png"),
      stopIcon: joinPath("../assets/stop-dark.png"),
      updateIcon: joinPath("../assets/update-dark.png"),
    };
  } else {
    return {
      playIcon: joinPath("../assets/play-light.png"),
      stopIcon: joinPath("../assets/stop-light.png"),
      updateIcon: joinPath("../assets/update-light.png"),
    };
  }
};

const getTimerDisplay = (currentTimer) => {
  let minutes = parseInt(currentTimer / 60, 10);
  let seconds = parseInt(currentTimer % 60, 10);

  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutes}:${seconds}`;
};

const showErrorDialog = ({
  message = "You're killing me smalls...",
  detail,
}) => {
  dialog.showMessageBox(null, {
    type: "error",
    title: message,
    message,
    detail,
  });
};

const setProductionAppPreferences = () => {
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
    app.dock.hide();
  }
};

const TIMES = {
  TWENTY_FIVE_MIN: 10,
  FIVE_MIN: 5,
  ONE_SEC: 1000,
};

module.exports = {
  TIMES,
  joinPath,
  getTrackName,
  getTimerDisplay,
  getIconsByTheme,
  showErrorDialog,
  setProductionAppPreferences,
};
