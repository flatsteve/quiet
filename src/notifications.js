const { Notification } = require("electron");

const showNotification = ({ title, body }) => {
  const notification = new Notification({
    title,
    body,
    silent: true
  });

  return notification.show();
};

module.exports.showNotification = showNotification;
