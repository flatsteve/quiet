const path = require("path");
const { app, Tray } = require("electron");
const player = require("play-sound")((opts = {}));

app.setLoginItemSettings({
  openAtLogin: true
});

app.dock.hide();

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
      audio = player.play(
        path.join(__dirname, "assets/white-noise.mp3"),
        err => {
          if (err) throw err;
        }
      );

      isPlaying = true;
      tray.setImage(stopIcon);
    }
  });

  tray.on("double-click", () => {
    app.quit();
  });
});
