const path = require("path");
const { app, globalShortcut, Tray } = require("electron");
const isDev = require("electron-is-dev");
const player = require("play-sound")();

let audio = null;
let shouldRepeat = true;

console.info("APP RUNNING IN", isDev ? "DEV" : "PROD");

if (!isDev) {
  app.setLoginItemSettings({ openAtLogin: true });
  app.dock.hide();
}

app.on("ready", () => {
  let isPlaying = false;

  const playIcon = path.join(__dirname, "assets/play.png");
  const stopIcon = path.join(__dirname, "assets/stop.png");
  const tray = new Tray(playIcon);

  const play = () => {
    // Make sure child process is killed before starting a new one.
    if (audio) {
      audio.kill();
    }

    isPlaying = true;
    shouldRepeat = true;

    tray.setImage(stopIcon);

    audio = player.play(path.join(__dirname, "assets/noise.mp3"), err => {
      if (err) {
        return console.error(err);
      }

      // When track ends just start playing again if it isn't explicity stopped
      if (shouldRepeat) {
        console.info("RESTARTING");
        play();
      }
    });
  };

  const stop = () => {
    isPlaying = false;
    shouldRepeat = false;

    audio.kill();
    tray.setImage(playIcon);
  };

  const handlePlayStop = () => {
    if (isPlaying) {
      return stop();
    }

    play();
  };

  // Event handlers
  tray.on("click", () => {
    handlePlayStop();
  });

  tray.on("double-click", () => {
    if (isPlaying) {
      stop();
    }

    app.quit();
  });

  globalShortcut.register("MediaPlayPause", () => {
    handlePlayStop();
  });
});

app.on("will-quit", () => {
  console.info("EXIT APP");

  // Unregister all shortcuts.
  if (audio) {
    audio.kill();
  }

  globalShortcut.unregisterAll();
});
