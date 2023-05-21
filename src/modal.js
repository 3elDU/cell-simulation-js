
export function showModal(...children) {
	const modal = document.getElementById("modal-wrapper")

	for (let child of children) {
		modal.appendChild(child);
	}
	
	const closeButton = document.createElement('button')
	closeButton.innerText = 'Close'
	closeButton.style.display = 'block'
	closeButton.addEventListener("click", () => hideModal());
	modal.appendChild(closeButton);
	
	document.querySelector("#modal").style.display = "block";
}

export function hideModal() {
	document.querySelector("#modal").style.display = "none";
	document.querySelector("#modal-wrapper").innerHTML = '';
}
