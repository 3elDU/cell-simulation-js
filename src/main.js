import Bot from "./bot.js";
import config from "./config.js";
import { hideModal, showModal } from "./modal.js";
import { CellSimulation } from "./simulation.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simulation = new CellSimulation(64, 64, config);
let paused = true;
let selectedCell = null;

// for FPS counter
let framesPassed = 0;

document.getElementById("pause").addEventListener("click", () => {
	paused = !paused;
	const button = document.getElementById("pause")
	button.innerText = paused ? "Unpause" : "Pause";
})

document.getElementById("reset-map").addEventListener("click", () => {
	simulation.generateMap();
})

document.getElementById("clear-map").addEventListener("click", () => {
	simulation.clearMap();
})

document.getElementById("cell-save").addEventListener("click", () => {
	let name = prompt("Cell name");
	if (name === null || name === "") {
		return;
	}
	localStorage.setItem(name, JSON.stringify(selectedCell));
})

// returns keys of all saved cells, retrieved from localStorage
export function getSavedCells() {
	let items = [];

	for (let i = 0; i < localStorage.length; i++) {
		items.push(localStorage.key(i));
	}

	return items;
}

document.getElementById("cell-load").addEventListener("click", () => {
	const select = document.createElement("select")
	select.id = "cell-select"
	for (const i of getSavedCells()) {
		const option = document.createElement("option");
		option.text = i;
		option.value = i;
		select.appendChild(option);
	}

	const submit = document.createElement("button")
	submit.innerText = 'Load';
	submit.addEventListener("click", () => {
		const key = document.querySelector("#cell-select").value;
		let obj = JSON.parse(localStorage.getItem(key));
		let cell = Bot.fromJSON(selectedCell.x, selectedCell.y, obj);
		simulation.bots[selectedCell.y * simulation.width + selectedCell.x] = cell;
		
		hideModal();
	})

	showModal(select, submit);
})

document.getElementById("cell-kill").addEventListener("click", () => {
	selectedCell.alive = false;
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
	document.getElementById("fps-text").innerText = `TPS: ${framesPassed}`;
	framesPassed = 0;
}, 1000);

// Render
setInterval(() => {
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
}, 1000 / 20);
