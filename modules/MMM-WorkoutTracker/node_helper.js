const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");
const { response } = require("express");
const { not } = require("ajv/dist/compile/codegen");
// const fetch = require("node-fetch") No need for it if you use Node 18+

module.exports = NodeHelper.create({

    paused: false,
    stopped: false,

    workoutTrackingDataRoute: "/workout-tracking",
    workoutSessionStateRoute: "/workout-session-state",
    workoutSessionStartRoute: "/workout-session-start",
    workoutSessionSetExerciseRoute: "/set-manual-exercise", 

    start () {

        this.expressApp.use(bodyParser.json());

        this.expressApp.post(this.workoutTrackingDataRoute, (req, res) => {
            var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

            console.log("POST Request from " + fullUrl);

            res.status(200).json({response: "OK"});
            this.sendSocketNotification("WORKOUT_TRACKING_DATA", req.body);
        });

    },

    socketNotificationReceived(notification, payload) {
        if(notification === "WORKOUT_SESSION_STATE") {
            const url = "http://localhost:8000" + this.workoutSessionStateRoute;

            fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"}, // Content-length by default calculated
                    body: JSON.stringify(payload)
                }
            )
            .then(res => res.status)
            .then(status => {
                console.log(`Status code of POST request to ${url}   :   %d`, status);
            })
            .catch(err => {
                console.error(`POST request to ${url} failed:\n`, err);
            });
        }

        else if (notification === "WORKOUT_LOADING_START") {
            const url = "http://localhost:8000" + this.workoutSessionStartRoute;

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
                this.sendSocketNotification("SHOW_ERROR_LOADING_SESSION_FAILED", {});
            });

        }
    }

});