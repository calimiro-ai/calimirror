const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");

module.exports = NodeHelper.create({


    start () {

        this.expressApp.use(bodyParser.json());

        this.expressApp.post("/workout-tracking", (req, res) => {
            res.status(200).json({status: "OK", data: req.body});
            this.sendSocketNotification("WORKOUT_TRACKING_DATA", req.body);
        });

    },

    socketNotificationReceived(notification, payload) {

    }
});