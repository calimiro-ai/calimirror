Module.register("MMM-WorkoutLoadingScreen", {
    defaults: {
        defaultLoadingText: "Loading",
        effectChar: ".",
        maxDots: 3,
        updateInterval: 1000,
        maxLoadingTime: 45
    },

    loadingStartTime: 0,

    start() {
        this.loadingText = this.defaults.defaultLoadingText;
        this.numOfPoints = 0;
        this.timeoutID = null;

        this.sendSocketNotification("START_NODE_HELPER", {});
    },

    scheduleNextUpdate() {
        this.timeoutID = setTimeout(() => {
            this.updateLoadingText();
            this.updateDom();
            this.scheduleNextUpdate();
        }, this.config.updateInterval);
    },

    updateLoadingText() {
        if (this.numOfPoints >= this.config.maxDots) {
            this.loadingText = this.defaults.defaultLoadingText;
            this.numOfPoints = 0;
        } else {
            this.loadingText += this.config.effectChar;
            this.numOfPoints++;
        }
    },

    stopLoading() {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
    },

    getDom() {
        const wrapper = document.createElement("div");
        
        var loadingTextElement = document.createElement("h1");
        loadingTextElement.innerHTML = this.loadingText;

        wrapper.appendChild(loadingTextElement);
        
        return wrapper;
    },

    notificationReceived(notification, payload, sender) {
        if(sender) {
            if(sender.name === "MMM-WorkoutStarter" && notification === "WORKOUT_LOADING_START") {
                this.sendSocketNotification("WORKOUT_LOADING_START", {});
                this.loadingStartTime = new Date().getTime();
                this.scheduleNextUpdate();
            }
        }
    },

    socketNotificationReceived(notification, payload) {
        if(notification === "WORKOUT_LOADING_EXERCISES_FINISHED") {
            this.sendNotification("WORKOUT_LOADING_EXERCISES_FINISHED", {});
            this.loadingStartTime = 0;
        }
    }

});
