Module.register("MMM-WorkoutSessionPlot", {

    start() {
        this.sendSocketNotification("SOCKET_CONNECTION_OPENED", {});
    },

    getDom() {

    },

    notificationReceived(notification, payload, sender) {
        if(sender) {
            if(sender.name === "MMM-WorkoutStarter" && notification === "WORKOUT_SESSION_PLOT") {
                
            }
        }
    },

    socketNotificationReceived(notification, payload) {

    }

});