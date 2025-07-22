Module.register("MMM-WorkoutSessionPlot", {
    
    defaults: {
        chartData: [12, 19, 3, 5, 2, 3],
        chartLabels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"]
    },

    start() {

    },

    getScripts() {
        return [
            "https://cdn.jsdelivr.net/npm/chart.js"
        ];
    },

    getDom() {
        var mainContainer = document.createElement("div");
        mainContainer.style.width = "400px";
        mainContainer.style.height = "300px";

        var canvas = document.createElement("canvas");
        canvas.id = "chart-canvas";
        mainContainer.appendChild(canvas);

        setTimeout(() => {
            this.renderChart();
        }, 1000); // attendre le DOM


        return mainContainer;
    },

    renderChart() {
        const ctx = document.getElementById("chart-canvas").getContext("2d");
        new Chart(ctx, {
        type: "bar",
        data: {
            labels: this.config.chartLabels,
            datasets: [{
            label: "Exemple de données",
            data: this.config.chartData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
            y: {
                beginAtZero: true
            }
            }
        }
    });
    }
    
});