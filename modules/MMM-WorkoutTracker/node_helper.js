const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");

module.exports = NodeHelper.create({


    paused: false,
    stopped: false,

    start () {

        this.expressApp.use(bodyParser.json());

        this.expressApp.post("/workout-tracking", (req, res) => {
            this.sendSocketNotification("WORKOUT_SESSION_RUNNING");
            res.status(200).json({status: "OK", paused: this.paused, stopped: this.stopped});
            this.sendSocketNotification("WORKOUT_TRACKING_DATA", req.body);
        });

    },

    socketNotificationReceived(notification, payload) {
        if(notification == "WORKOUT_SESSION_RUNNING") {
            this.paused = payload.paused;
            this.stopped = payload.stopped;
        }
    }
});