const EventEmitter = require("events");
const settings = require("electron-settings");

const { getIconsByTheme } = require("./utils");
const { installUpdateAndRestart } = require("./updater");

class ContextMenu extends EventEmitter {
  constructor() {
    super();

    const { playIcon, stopIcon, updateIcon } = getIconsByTheme();
    this.menu = [
      {
        id: "start",
        label: " Start",
        enabled: true,
        icon: playIcon,
        click: () => {
          this.emit("play");
        }
      },
      {
        id: "stop",
        label: " Stop",
        enabled: false,
        icon: stopIcon,
        click: () => {
          this.emit("stop", { shouldReset: true });
        }
      },
      {
        id: "update",
        label: " Update",
        enabled: false,
        icon: updateIcon,
        click: () => {
          installUpdateAndRestart();
        }
      },
      { type: "separator" },
      {
        id: "sound",
        label: "Play Sound",
        type: "checkbox",
        checked: settings.has("playSound") ? settings.get("playSound") : true,
        click: () => {
          settings.set("playSound", !settings.get("playSound"));
        }
      },
      { type: "separator" },
      { label: "Quit", role: "quit" }
    ];
  }

  get menuItems() {
    return this.menu;
  }

  toggleStartStop(menu) {
    const start = menu.getMenuItemById("start");
    const stop = menu.getMenuItemById("stop");

    start.enabled = !start.enabled;
    stop.enabled = !stop.enabled;
  }

  setUpdateAvailable(menu) {
    menu.getMenuItemById("update").enabled = true;
  }
}

module.exports = ContextMenu;
