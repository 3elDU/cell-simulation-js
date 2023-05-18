import config from "./config.js";
import { CellSimulation } from "./simulation.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simulation = new CellSimulation(64, 64, config);
let paused = true;
let selectedCell = null;

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

// handle click on the canvas (select cell)
document.getElementById("canvas").addEventListener("click", (event) => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const x = Math.trunc((event.clientX - rect.left) * scaleX);
	const y = Math.trunc((event.clientY - rect.top) * scaleY);

	selectedCell = simulation.cellAt(x, y);

	// gnome is constant through cell's lifetine, so update it here once, rather than re-rendering it every time
	const cellGenome = document.getElementById("cell-genome")
	cellGenome.innerHTML = ``;
	for (let gene of selectedCell.genome) {
		const li = document.createElement('li');
		li.innerText = JSON.stringify(gene);
		cellGenome.appendChild(li);
	}
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
setInterval(() => {
	renderFrame++;
	if (skipFrames == 0 || renderFrame % skipFrames != 0) {
		return;
	}

	if (selectedCell !== null && !selectedCell.empty) {
		// show a notice that the cell is dead
		document.getElementById("cell-is-dead").style.display = selectedCell.alive ? "none" : "block";

		document.getElementById("cell-info-card").style.display = "block";
		const cellDescription = document.getElementById("cell-description")
		cellDescription.innerText = `X: ${selectedCell.x}
			Y: ${selectedCell.y}
			Direction: ${selectedCell.direction}
			Color: ${JSON.stringify(selectedCell.color)}
			Energy: ${selectedCell.energy}
			Age: ${selectedCell.age}

			Current instruction: ${selectedCell.currentInstruction}
		`

		let genomeNodes = document.getElementById("cell-genome").children;
		// Highlight current instruction
		for (let i = 0; i < selectedCell.genome.length; i++) {
			if (i == selectedCell.currentInstruction) {
				genomeNodes[i].id = "current-instruction";
			} else {
				genomeNodes[i].id = "";
			}
		}

	} else {
		document.getElementById("cell-info-card").style.display = "none";
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
