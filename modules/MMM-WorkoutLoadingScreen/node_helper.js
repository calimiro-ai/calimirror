const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch") No need for it if you use Node 18+

module.exports = NodeHelper.create({

    workoutLoadingExercisesFinished: "/workout-loading-exercises-finished",

    isLoading: false,

    start() {
        this.expressApp.get(this.workoutLoadingExercisesFinished, (req, res) => {
            if(this.isLoading) {
                var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

                console.log("GET Request from " + fullUrl);

                res.status(200).json({response: "OK"});
                
                this.isLoading = false;
                this.sendSocketNotification("WORKOUT_LOADING_EXERCISES_FINISHED", {});
            }
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "WORKOUT_LOADING_START") {
            this.isLoading = true;
        }
    }

});