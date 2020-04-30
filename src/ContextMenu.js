const EventEmitter = require("events");

const { getIconsByTheme } = require("./utils");
const { installUpdateAndRestart } = require("./updater");

class ContextMenu extends EventEmitter {
  constructor() {
    super();

    const { playIcon, stopIcon, updateIcon } = getIconsByTheme();
    this.menu = [
      {
        label: " Start",
        enabled: true,
        icon: playIcon,
        click: () => {
          this.emit("play");
        }
      },
      {
        label: " Stop",
        enabled: false,
        icon: stopIcon,
        click: () => {
          this.emit("stop", { shouldReset: true });
        }
      },
      {
        label: " Update",
        enabled: false,
        icon: updateIcon,
        click: () => {
          installUpdateAndRestart();
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
    menu.items[0].enabled = !menu.items[0].enabled;
    menu.items[1].enabled = !menu.items[1].enabled;
  }

  setUpdateAvailable(menu) {
    menu.items[2].enabled = true;
  }
}

module.exports = ContextMenu;
