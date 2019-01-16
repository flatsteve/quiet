const path = require("path");
const { app, BrowserWindow, Tray } = require("electron");

app.on("ready", () => {
  const icon = "images/cog.png";
  const iconPath = path.join(__dirname, icon);

  trayIcon = new Tray(iconPath);
  trayIcon.setToolTip("Hello World");

  trayIcon.on("click", () => {
    console.log("CLICK");
  });
});
