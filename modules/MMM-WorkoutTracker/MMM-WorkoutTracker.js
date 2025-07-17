/* 

MMM-WorkoutTracker module for CalisthenicsSmartMirror
CalisthenicsSmartMirror v0.1.0 (frontend)

*/



Module.register("MMM-WorkoutTracker", {
	defaults: {
		statsDisplayTexts: ["Current exercise: ", "Num of reps: ", "Timestamp: "],
		statsDisplayUnits: ["", "reps", "s"],
		appTitle: "WorkoutTracker",
		divWhiteBorderClass: "white-border"
	},

	paused: false,
	stopped: false,

	stats: null,

	containers: {},


	getStyles () {
		return [this.file("MMM-WorkoutTracker.css")];
	},

	start () {
		this.sendSocketNotification("CREATE_SOCKET_CONNECTION", this.config);
	},

	addWhiteBorderClassToContainer(container) {
		container.classList.add(this.defaults.divWhiteBorderClass);
	},

	createStatsDisplays(container) {
		var statsDisplaysContainer = document.createElement("div");
		this.addWhiteBorderClassToContainer(statsDisplaysContainer);

		var statsDisplays = [];

		for(x = 0; x < this.defaults.statsDisplayTexts.length; ++x) {
			const element = document.createElement("p");
			element.innerHTML = this.defaults.statsDisplayTexts[x];
			statsDisplaysContainer.appendChild(element);
			statsDisplays.push(element);
		}

		if(this.stats == null) {
			for(x = 0; x < statsDisplays.length; ++x) {
				statsDisplays[x].innerHTML += (" " + x == 0 ? "" : 0 + " " + this.defaults.statsDisplayUnits[x]);
			}
		} else {
			for(x = 0; x < this.stats.length; ++x) {
				statsDisplays[x].innerHTML += (" " + this.stats[x] + " " + this.defaults.statsDisplayUnits[x]);
			}
		}

		container.appendChild(statsDisplaysContainer);
		return statsDisplaysContainer;
	},

	createHeadlineBanner(container) {
		var headlineBanner = document.createElement("div");
		this.addWhiteBorderClassToContainer(headlineBanner);

		var title = document.createElement("h3");
		title.innerHTML = this.defaults.appTitle;
		headlineBanner.appendChild(title);

		container.appendChild(headlineBanner);

		return headlineBanner;
	},

	createButtons(container) {
		var buttonsContainer = document.createElement("div");
		this.addWhiteBorderClassToContainer(buttonsContainer);

		var pauseButton = document.createElement("button");
		pauseButton.className = "big-button";
		pauseButton.innerHTML = "Pause Workout Session ⏸️";
		pauseButton.onclick = () => {
			this.pauseWorkoutTracking();
			pauseButton.innerHTML = this.paused ? "Resume Workout Session ▶️" : "Pause Workout Session ⏸️";
		};

		buttonsContainer.appendChild(pauseButton);

		buttonsContainer.appendChild(document.createElement("br"));

		var quitButton = document.createElement("button");
		quitButton.className = "big-button";
		quitButton.innerHTML = "Exit Workout Session 🛑";
		quitButton.onclick = () => {

			this.stopWorkoutTracking();

		};
		buttonsContainer.appendChild(quitButton);

		container.appendChild(buttonsContainer);

		return buttonsContainer;
	},

	getDom () {
		this.containers = {};

		const mainContainer = document.createElement("div");
		mainContainer.className = "workout-tracker-wrapper";
		
		this.containers = {
			headlineBanner: this.createHeadlineBanner(mainContainer),
			stats: this.createStatsDisplays(mainContainer),
			buttons: this.createButtons(mainContainer)
		};

		return mainContainer;
	},

	notificationReceived(notification, payload, sender) {
		if(sender) {
			if(sender.name === "MMM-WorkoutStarter" && notification === "WORKOUT_TRACKING_START") {
				MM.getModules().withClass("tracking_modules").enumerate(module => module.show(1000));
				this.startWorkoutTracking();
				this.paused = false;
				this.stopped = false;
			}
		}
	},

	socketNotificationReceived(notification, payload) {
		if(notification == "WORKOUT_TRACKING_DATA") {
			
			if(!this.paused) {
				this.stats = [];

				this.stats.push(payload.current_exercise);
				this.stats.push(payload.total_reps);
				this.stats.push(payload.timestamp);

				this.updateDom();
			} else {
				this.sendNotification("HIDE_ALERT", {}); // Hide previous alert or notification
				this.sendNotification("SHOW_ALERT", {type: "notification", effect: "exploader", title: "Workout Tracker", message: "Workout Session is paused!", timer: 3000});
			}
		}

	},

	startWorkoutTracking() {
		// Test purpose
	},
	
	stopWorkoutTracking() {
		this.stopped = true;
		this.sendToBackend();
		
		MM.getModules().withClass("tracking_modules").enumerate(module => module.hide(1000));
		setTimeout(() => {
			this.sendNotification("WORKOUT_TRACKING_END", {});
		}, 1000);
	},
	
	pauseWorkoutTracking() {
		this.paused = !this.paused;
		this.sendToBackend();
	},

	sendToBackend() {
		this.sendSocketNotification("SEND_TO_BACKEND", {paused: this.paused, stopped: this.stopped});
	}

});
