const { systemPreferences } = require("electron");
const path = require("path");

const joinPath = relativePath => {
  return path.join(__dirname, relativePath);
};

const getIconsByTheme = () => {
  if (systemPreferences.isDarkMode()) {
    return {
      playIcon: joinPath("../assets/play-dark.png"),
      stopIcon: joinPath("../assets/stop-dark.png")
    };
  } else {
    return {
      playIcon: joinPath("../assets/play-light.png"),
      stopIcon: joinPath("../assets/stop-light.png")
    };
  }
};

const updateCurrentIcon = (isPlaying, tray) => {
  const { playIcon, stopIcon } = getIconsByTheme();

  if (isPlaying) {
    return tray.setImage(stopIcon);
  }

  return tray.setImage(playIcon);
};

module.exports.getIconsByTheme = getIconsByTheme;
module.exports.updateCurrentIcon = updateCurrentIcon;
