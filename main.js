const path = require("path");
const { app, Tray } = require("electron");
const isDev = require("electron-is-dev");
const log = require("electron-log");
const player = require("play-sound")((opts = {}));

log.error("APP RUNNING");
log.error("IS DEV:", isDev);

if (!isDev) {
  app.setLoginItemSettings({
    openAtLogin: true
  });

  app.dock.hide();
}

app.on("ready", () => {
  const playIcon = path.join(__dirname, "assets/play.png");
  const stopIcon = path.join(__dirname, "assets/stop.png");

  let isPlaying = false;
  let audio;

  tray = new Tray(playIcon);

  tray.on("click", () => {
    if (isPlaying) {
      audio.kill();

      isPlaying = false;
      tray.setImage(playIcon);
    } else {
      audio = player.play(path.join(__dirname, "assets/noise.mp3"), err => {
        if (err) {
          log.error(err);
        }
      });

      isPlaying = true;
      tray.setImage(stopIcon);
    }
  });

  tray.on("double-click", () => {
    if (isPlaying) {
      audio.kill();
    }

    app.quit();
  });
});
