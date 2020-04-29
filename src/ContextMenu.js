const EventEmitter = require("events");

class ContextMenu extends EventEmitter {
  constructor() {
    super();

    this.menu = [
      {
        label: "Start",
        enabled: true,
        click: () => {
          this.emit("play");
        },
      },
      {
        label: "Stop",
        enabled: false,
        click: () => {
          this.emit("stop", { shouldReset: true });
        },
      },
      { type: "separator" },
      { label: "Quit", role: "quit" },
    ];
  }

  get menuItems() {
    return this.menu;
  }

  toggleStartStop(menu) {
    menu.items[0].enabled = !menu.items[0].enabled;
    menu.items[1].enabled = !menu.items[1].enabled;
  }
}

module.exports = ContextMenu;
