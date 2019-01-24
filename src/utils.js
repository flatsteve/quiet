const { app, systemPreferences } = require("electron");
const path = require("path");
const log = require("electron-log");
const isDev = require("electron-is-dev");

const joinPath = (relativePath, { extraResource = false } = {}) => {
  // Prod: assets is in the same directory (as Resources) so remove the ../
  if (extraResource && !isDev) {
    relativePath = relativePath.replace("../", "");
    return path.join(process.resourcesPath, relativePath);
  }

  return path.join(__dirname, relativePath);
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

const setProductionAppPreferences = () => {
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
    app.dock.hide();
  }
};

module.exports.joinPath = joinPath;
module.exports.getIconsByTheme = getIconsByTheme;
module.exports.setProductionAppPreferences = setProductionAppPreferences;
