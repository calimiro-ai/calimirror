const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch") No need for it if you use Node 18+

module.exports = NodeHelper.create({

    paused: false,
    stopped: false,
    route: "/workout-tracking",
    exercisesRoute: "/available-exercises",

    start () {

        this.expressApp.use(bodyParser.json());

        this.expressApp.post(this.route, (req, res) => {
            res.status(200).json({res: "OK"});
            this.sendSocketNotification("WORKOUT_TRACKING_DATA", req.body);
        });

    },

    socketNotificationReceived(notification, payload) {
        if(notification == "SEND_TO_BACKEND") {
            const url = "http://localhost:8000" + this.route;

            fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"}, // Content-length by default calculated
                    body: JSON.stringify(payload)
                }
            )
            .then(res => res.status)
            .then(status => {
                console.log(`Status code of POST request to ${url}   :   %d`, res.status);
            })
            .catch(err => {
                console.error(`POST request to ${url} failed:\n`, err);
            });
        }

        else if (notification == "WORKOUT_TRACKING_START") {
            const url = "http://localhost:8000" + this.exercisesRoute;

            fetch(url)
            .then(res => {
                console.log(`Status code of GET request to ${url}   :   %d`, res.status);
                return res;
            })
            .then(res => res.json())
            .then(data => {
                this.sendSocketNotification("WORKOUT_TRACKING_START", data);
            })
            .catch(err => {
                console.error(`GET request to ${url} failed:\n`, err);
            });

        }
    }

});