const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch") No need for it if you use Node 18+

module.exports = NodeHelper.create({

    paused: false,
    stopped: false,
    route: "/workout-tracking",

    start () {

        this.expressApp.use(bodyParser.json());

        this.expressApp.post(this.route, (req, res) => {
            res.status(200).json({res: "OK"});
            this.sendSocketNotification("WORKOUT_TRACKING_DATA", req.body);
        });

    },

    socketNotificationReceived(notification, payload) {
        if(notification == "SEND_TO_BACKEND") {
            fetch("http://localhost:8000" + this.route, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"}, // Content-length by default calculated
                    body: JSON.stringify(payload)
                }
            )
            .then(res => res.status)
            .then(status => {
                console.log("Status code: %d", status);
            })
            .catch(err => {
                console.error("Error: ", err);
            });
        }
    }

});