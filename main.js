const path = require("path");
const { app, Tray } = require("electron");
const isDev = require("electron-is-dev");
const player = require("play-sound")();

console.info("APP RUNNING IN", isDev ? "DEV" : "PROD");

if (!isDev) {
  app.setLoginItemSettings({
    openAtLogin: true
  });

  app.dock.hide();
}

app.on("ready", () => {
  let isPlaying = false;
  let audio;

  const playIcon = path.join(__dirname, "assets/play.png");
  const stopIcon = path.join(__dirname, "assets/stop.png");
  const tray = new Tray(playIcon);

  const play = () => {
    // Make sure child process is killed before starting a new one.
    if (audio) {
      audio.kill();
    }

    audio = player.play(path.join(__dirname, "assets/noise.mp3"), err => {
      if (err) {
        return console.error(err);
      }

      // When track ends just start playing again
      console.info("RESTARTING");
      play();
    });

    isPlaying = true;
    tray.setImage(stopIcon);
  };

  const stop = () => {
    audio.kill();
    isPlaying = false;
    tray.setImage(playIcon);
  };

  tray.on("click", () => {
    if (isPlaying) {
      return stop();
    }

    play();
  });

  tray.on("double-click", () => {
    if (isPlaying) {
      stop();
    }

    app.quit();
  });
});
