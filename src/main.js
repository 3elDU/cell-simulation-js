import config from "./config.js";
import { CellSimulation } from "./simulation.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simulation = new CellSimulation(64, 64, config);
let paused = true;

// How many frames to skip when rendering
// 1 - render each frame, lowest performance
// 0 - don't render at all (skip all frames)
let skipFrames = 1;

// for FPS counter
let framesPassed = 0;

document.getElementById("pause").addEventListener("click", () => {
	paused = !paused;

	const button = document.getElementById("pause")

	if (paused) {
		button.innerText = "Unpause"
	} else {
		button.innerText = "Pause"
	}
})

document.getElementById("skipFrames").addEventListener("input", (event) => {
	skipFrames = Number.parseInt(event.target.value);
})

document.getElementById("reset-map").addEventListener("click", () => {
	simulation.generateMap();
})

// update simulation
setInterval(() => {
	if (!paused) {
		simulation.update();
		framesPassed++;
	}
});

// show FPS
setInterval(() => {
	document.getElementById("fps-text").innerText = `FPS: ${framesPassed}`;
	framesPassed = 0;
}, 1000);

let renderFrame = 0;
// render
setInterval(() => {
	renderFrame++;

	if (skipFrames == 0 || renderFrame % skipFrames != 0 ) {
		return;
	}
	
	ctx.fillStyle = 'black'
	const { width, height } = canvas
	ctx.fillRect(0, 0, width, height)

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			const bot = simulation.cellAt(x, y);
			if (bot.empty) {
				continue
			}

			if (bot.alive) {
				ctx.fillStyle = `rgb(${bot.color.r}, ${bot.color.g}, ${bot.color.b})`
			} else {
				ctx.fillStyle = 'rgb(100, 100, 100)'
			}

			ctx.fillRect(x, y, 1, 1)
		}
	}
}, 1000 / 25);
