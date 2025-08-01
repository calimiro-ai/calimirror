



Module.register("MMM-WorkoutTracker", {
	defaults: {
		statsDisplayTexts: ["Current exercise: ", "Num of reps: "],
		statsDisplayUnits: ["", "reps"],
		appTitle: "Calimiro AI",
		divWhiteBorderClass: "white-border"
	},

	paused: false,
	stopped: false,

	mainContainer: null,

	stats: null,
	availableExercises: null,
	exerciseDurations: [],
	performedExercises: [],


	getStyles () {
		return [this.file("MMM-WorkoutTracker.css")];
	},

	start () {
		this.sendSocketNotification("CREATE_SOCKET_CONNECTION", this.config);
	},

	addWhiteBorderClassToContainer(container) {
		container.classList.add(this.defaults.divWhiteBorderClass);
	},

	createStatsDisplays() {
		var statsDisplaysContainer = document.createElement("div");
		this.addWhiteBorderClassToContainer(statsDisplaysContainer);

		var statsDisplays = [];

		for(x = 0; x < this.defaults.statsDisplayTexts.length; ++x) {
			const element = document.createElement("h3");
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

		this.mainContainer.appendChild(statsDisplaysContainer);
	},

	createHeadlineBanner() {
		var headlineBanner = document.createElement("div");
		this.addWhiteBorderClassToContainer(headlineBanner);

		var title = document.createElement("h3");
		title.innerHTML = this.defaults.appTitle;
		headlineBanner.appendChild(title);

		this.mainContainer.appendChild(headlineBanner);
	},

	createButtons() {
		var buttonsContainer = document.createElement("div");
		this.addWhiteBorderClassToContainer(buttonsContainer);

		var pauseButton = document.createElement("button");
		pauseButton.className = "big-button";
		pauseButton.innerHTML = "Pause Workout Session";
		pauseButton.onclick = () => {
			this.pauseWorkoutTracking();
			pauseButton.innerHTML = this.paused ? "Resume Workout Session" : "Pause Workout Session";
		};

		buttonsContainer.appendChild(pauseButton);

		buttonsContainer.appendChild(document.createElement("br"));

		var quitButton = document.createElement("button");
		quitButton.className = "big-button";
		quitButton.innerHTML = "Exit Workout Session";
		quitButton.onclick = () => {

			this.stopWorkoutTracking();

		};
		buttonsContainer.appendChild(quitButton);

		this.mainContainer.appendChild(buttonsContainer);
	},


	getDom () {

		this.mainContainer = document.createElement("div");
		this.mainContainer.className = "workout-tracker-wrapper";
		
		this.createHeadlineBanner();
		this.createStatsDisplays();


		this.createButtons();

		return this.mainContainer;
	},

	notificationReceived(notification, payload, sender) {
		if(sender) {
			if(sender.name === "MMM-WorkoutStarter" && notification === "WORKOUT_TRACKING_START") {
				this.startWorkoutTracking();
				this.paused = false;
				this.stopped = false;
			}

			if(notification === "WORKOUT_LOADING_START") {
				this.sendSocketNotification("WORKOUT_LOADING_START", {})
			}

		}
	},

	socketNotificationReceived(notification, payload) {
		if(notification === "WORKOUT_TRACKING_DATA") {
			
			if(!this.paused) {
				this.stats = [];

				this.stats.push(payload.current_exercise);
				this.stats.push(payload.total_reps);

				this.performedExercises.push(payload.last_exercise);
				this.exerciseDurations.push(payload.last_exercise_duration);
				
				console.log(this.performedExercises);
				console.log(this.exerciseDurations);

				this.updateDom();
			} else {
				this.sendToBackend();
				this.sendNotification("HIDE_ALERT", {}); // Hide previous alert or notification
				this.sendNotification("SHOW_ALERT", {type: "notification", effect: "exploader", title: "Workout Tracker", message: "Workout Session is paused!", timer: 3000});
			}
		}
		else if(notification === "WORKOUT_TRACKING_START") {
			//Add the exercise selector
			this.availableExercises = payload.available_exercises;
			this.areExercisesAvailable = true;
			this.updateDom();
		}
		else if(notification === "SHOW_ERROR_LOADING_SESSION_FAILED") {
			this.sendNotification("SHOW_ALERT", {type: "notification", title: "Calimiro", message: "Calimiro couldn't start the workout session. Please retry.", effect: "exploader", timer: 3000});

			setTimeout(() => {
				this.sendNotification("WORKOUT_TRACKING_END", {});
			}, 1000);
			
		}

		else if(notification === "SHOW_ERROR_LOADING_SESSION_TIMEOUT") {
			this.sendNotification("SHOW_ALERT", {type: "notification", title: "Calimiro", message: "It seems that your workout session took too long time to be loaded. Please retry.", effect: "exploader", timer: 3000});

			setTimeout(() => {
				this.sendNotification("WORKOUT_TRACKING_END", {});
			}, 1000);
			
		}

	},

	startWorkoutTracking() {
		this.sendSocketNotification("WORKOUT_TRACKING_START", {});
	},
	
	stopWorkoutTracking() {
		this.stopped = true;
		this.sendToBackend();

		setTimeout(() => {
			this.sendNotification("WORKOUT_TRACKING_END", {});
		}, 1000);
	},
	
	pauseWorkoutTracking() {
		this.paused = !this.paused;
		this.sendToBackend();
	},

	sendToBackend() {
		this.sendSocketNotification("WORKOUT_SESSION_STATE", {paused: this.paused, stopped: this.stopped});
	}

});
