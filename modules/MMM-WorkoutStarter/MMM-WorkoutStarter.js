/* MMM-WorkoutStarter, written by Younes Bendimerad */


Module.register("MMM-WorkoutStarter", {

    defaults: {
        appTitle: "Calimiro AI"
    },

    getStyles: function() {
        return [this.file("MMM-WorkoutStarter.css")];
    },

	getDom: function() {
        // Div to hold the button
        const mainContainer = document.createElement("div");

        var titleText = document.createElement("h1");
        titleText.innerHTML = this.defaults.appTitle;
        mainContainer.appendChild(titleText);

        // Start Workout Button
        var startButton = document.createElement("button");
        startButton.innerHTML = "Start new Workout Session 💪";
        startButton.className = "workout-start-btn";
        startButton.onclick = () => {
            // Send notification to MMM-WorkoutTracker and dismiss other displayed modules, don't need any payload
            MM.getModules().enumerate(module => module.hide(1000));
            
            setTimeout(() => {
                this.sendNotification("WORKOUT_LOADING_START", {});
                MM.getModules().withClass("loading_modules").enumerate(module => module.show(1000));
            }, 1000);

        };

        mainContainer.appendChild(startButton);

        return mainContainer;
    },

    notificationReceived: function(notification, payload, sender) {
        if(sender) {
            if(sender.name === "MMM-WorkoutTracker" && notification === "WORKOUT_TRACKING_END") {
                this.show(1000);
                MM.getModules().exceptWithClass("tracking_modules loading_modules").enumerate(module => module.show());
                this.sendNotification("HIDE_ALERT"); // We don't want any alert to pop up
            }

            if(sender.name === "MMM-WorkoutLoadingScreen" && notification === "WORKOUT_LOADING_EXERCISES_FINISHED") {
                MM.getModules().withClass("loading_modules").enumerate(module => module.hide(1000));
                
                setTimeout(() => {
                    this.sendNotification("WORKOUT_TRACKING_START", {});
                    MM.getModules().withClass("tracking_modules").enumerate(module => module.show(1000));
                }, 1000);
            }
        }
    }
        

});