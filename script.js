// Register service worker
if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("/serviceWorker.js")
			.then(res => console.log("service worker registered"))
			.catch(err => console.log("service worker not registered", err))
	})
}

// Debugging functions

let debug = false

function exit(msg) {
	if (debug) {
		throw new Error(msg);
	}
}


function log(msg) {
	if (debug) {
		console.log(`DEBUG: ${msg}`);
	}
}

// Initial setup
// Var setup
let taskList = document.getElementsByClassName("task-list")[0];
let newTaskField = document.querySelector('#new-task');
let taskElements = document.querySelectorAll('.task')

// If tasks exist, render the task list. If no tasks exist, initialise empty array in localStorage
window.addEventListener("load", (e) => {
	log('Initial load')
	if (localStorage.length > 0) {
		// If tasks exist, render them in the <ul>
		tasks = JSON.parse(localStorage.getItem('tasks'))
		render(tasks)
	} else {
		// If tasks array is empty, recreate the tasks array (catches a missing array as well)
		localStorage.setItem('tasks', JSON.stringify([]))
		render(tasks)
	}
});

// Render task list on frontend
function render(tasksArray) {
	document.querySelectorAll('.task').forEach(task => {
		task.remove()
	});
	log('Re-rendering frontend')

	tasksArray.forEach(task => {
		// Create new top-level list item to contain task
		let newListItem = document.createElement("li");
		newListItem.classList.add('task');

		// Create checkbox span within list item
		let newSpan = newListItem.appendChild(document.createElement("span"))
		newSpan.setAttribute('role', 'checkbox')
		newSpan.classList.add('checkbox')
		// newSpan.insertAdjacentText('afterend', task.content)

		// Create span to contain task content within list item
		let taskContentSpan = newListItem.appendChild(document.createElement("span"))
		taskContentSpan.classList.add('task-content')
		taskContentSpan.textContent = task.content;

		// Create delete button within list item
		let deleteButton = newListItem.appendChild(document.createElement('p'))
		deleteButton.classList.add('delete-task', 'hidden')
		deleteButton.textContent = 'Delete'

		if (task.completed) {
			newSpan.setAttribute('aria-checked', 'true')
			newSpan.textContent = '[x]'
			taskContentSpan.classList.add('checked')
		} else {
			newSpan.setAttribute('aria-checked', 'false')
			newSpan.textContent = '[ ]'
		}
		newListItem.setAttribute('id', task.id);
		newTaskField.before(newListItem);
	});
}

// Clear all tasks when the 'Delete all' button is pushed
document.getElementsByClassName('clear-tasks')[0].addEventListener('click', (e) => {
	if (confirm('This will permanently delete all stored tasks. this action cannot be undone. Proceed?')) {
		let tasks = []
		localStorage.setItem('tasks', JSON.stringify(tasks))
		document.querySelectorAll('.task').forEach(item => {
			item.remove()
		});
	} else {
		false;
	}

})

// Generate UUID
function generateUUID() { // Public Domain/MIT
	var d = new Date().getTime();//Timestamp
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16;//random number between 0 and 16
		if (d > 0) {//Use timestamp until depleted
			r = (d + r) % 16 | 0;
			d = Math.floor(d / 16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r) % 16 | 0;
			d2 = Math.floor(d2 / 16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

// Add task on enter
newTaskField.addEventListener("keydown", (event) => {
	// prevent enter key from entering a new line in he new task field
	if (event.key === "Enter") {
		event.preventDefault();
		// if new task field is not empty
		if (newTaskField.textContent !== '') {
			// ADD NEW TASK
			// Read content of localStorage into a JS array called 'tasks'
			if (!JSON.parse(localStorage.getItem('tasks'))) {
				localStorage.setItem('tasks', JSON.stringify([]))
			}
			tasks = JSON.parse(localStorage.getItem('tasks'))
			// Create new task object to be stored
			const newTask = {
				id: generateUUID(),
				content: newTaskField.innerHTML,
				completed: false
			}
			// Add new task object to end of JS array
			tasks.push(newTask)
			// Stringify tasks JS array, and write it back to localStorage
			localStorage.setItem('tasks', JSON.stringify(tasks))
			newTaskField.textContent = '';
			render(tasks)

		}

	}
}
);

// Edit task
addEventListener('mousedown', (e) => {
	if (e.target.classList.contains('task-content') && (e.detail == 2)) {
		e.preventDefault()

		taskElement = e.target
		taskElement.setAttribute('contentEditable', 'true')
		taskElement.addEventListener('keydown', (e) => {
			// prevent enter key from entering a new line in he new task field
			if (e.key === "Enter") {
				e.preventDefault();
				// if new task field is not empty
				if (taskElement.textContent !== '') {
					// ADD NEW TASK
					// Read content of localStorage into a JS array called 'tasks'
					tasks = JSON.parse(localStorage.getItem('tasks'))
					thisTask = tasks.filter(task => {
						return task.id === taskElement.parentElement.getAttribute('id');
					})
					thisTask[0].content = taskElement.textContent;
					// Stringify tasks JS array, and write it back to localStorage
					localStorage.setItem('tasks', JSON.stringify(tasks))
					render(tasks)
				}
			}
		})

		addEventListener('mousedown', (e) => {
			// Handle clicking out of editing current task
			if (e.target.getAttribute('id') !== taskElement.getAttribute('id')) {
				taskElement.removeAttribute('contentEditable')
			} else {
				false;
			}
		})
	} else {
		false;
	}
})

// Checkbox handler
addEventListener("click", (event) => {
	if (event.target.classList.contains('checkbox')) {
		let parentId = event.target.parentElement.id;
		// Read content of localStorage into a JS array called 'tasks'
		tasks = JSON.parse(localStorage.getItem('tasks'))
		thisTask = tasks.filter(task => {
			return task.id === parentId;
		})
		let checkbox = document
			.getElementById(parentId)
			.getElementsByClassName("checkbox")[0];
		// If checkbox is currently unchecked, check it, and mark the task as completed
		if (!checkbox.innerHTML.includes("x")) {
			thisTask[0].completed = true;
			checkbox.setAttribute('aria-checked', 'true')
			checkbox.innerHTML = "[x]"
			document.getElementById(parentId).getElementsByClassName('task-content')[0].classList.add('checked');

			// if the checkbox is currently checked, uncheck it, and mark the task as incomplete 
		} else {
			thisTask[0].completed = false;
			checkbox.setAttribute('aria-checked', 'false')
			checkbox.innerHTML = "[ ]"
			document.getElementById(parentId).getElementsByClassName('task-content')[0].classList.remove('checked');
		};
		// Stringify tasks JS array, and write it back to localStorage
		localStorage.setItem('tasks', JSON.stringify(tasks))
	}
});

// Show delete link on hover
// document.addEventListener('mouseover', (e) => {
// 	if (e.target.classList.contains('task')) {
// 		deleteButton = e.target.getElementsByClassName('delete-task')[0]
// 		deleteButton.classList.remove('hidden')
// 		e.target.addEventListener('mouseout', (e) => {
// 			deleteButton.classList.add('hidden')
// 		})
// 	}
// })

// Delete task on clicking 'delete task' link
document.addEventListener('click', (e) => {
	if (e.target.classList.contains('delete-task')) {
		tasks = JSON.parse(localStorage.getItem('tasks'))
		tasks = tasks.filter(task => task.id != e.target.parentElement.getAttribute('id'));
		localStorage.setItem('tasks', JSON.stringify(tasks))
		render(tasks)

	}
})