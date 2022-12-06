// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}

// Debugging functions

let debug = false;

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
let newTaskField = document.querySelector("#new-task");
let taskElements = document.querySelectorAll(".task");

// If tasks exist, render the task list. If no tasks exist, initialise empty array in localStorage
window.addEventListener("load", (e) => {
  log("Initial load");
  if (localStorage.getItem("tasks")) {
    // If tasks exist, render them in the <ul>
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    render(tasks);
  } else {
    // If tasks array is empty, recreate the tasks array (catches a missing array as well)
    localStorage.setItem("tasks", JSON.stringify([]));
    render([]);
  }
});

function createTaskListElement(id) {
  // Create new top-level list item to contain task
  let newListItem = document.createElement("li");
  newListItem.classList.add("task");
  newListItem.setAttribute("id", id);
  return newListItem;
}

function createCheckboxElement(completed) {
  // Create checkbox span within list item
  let newSpan = document.createElement("span");
  newSpan.setAttribute("role", "checkbox");
  newSpan.setAttribute("tabindex", "0");
  newSpan.classList.add("checkbox");

  // Create checked or uncheckbox, depending on whether the task is marked as completed in localstorage
  if (completed) {
    newSpan.setAttribute("aria-checked", "true");
    newSpan.textContent = "[x]";
    taskContentSpan.classList.add("checked");
  } else {
    newSpan.setAttribute("aria-checked", "false");
    newSpan.textContent = "[ ]";
  }

  return newSpan;
}

function createContentElement(content) {
  // Create span to contain task content within list item
  let taskContentSpan = document.createElement("span");
  taskContentSpan.classList.add("task-content");
  taskContentSpan.setAttribute("tabindex", "0");
  taskContentSpan.textContent = content;
  return taskContentSpan;
}

function createDeleteButton() {
  // Create delete button within list item
  let deleteButton = document.createElement("p");
  deleteButton.classList.add("delete-task", "hidden");
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("tabindex", "0");
  return deleteButton;
}

// Render task list on frontend
function render(tasksArray) {
  document.querySelectorAll(".task").forEach((task) => {
    task.remove();
  });
  log("Re-rendering frontend");

  tasksArray.forEach(function createAndInsertDomForTask(task) {
    const newListItem = createTaskListElement(task.id);
    newListItem.append(createCheckboxElement(task.completed));
    newListItem.append(createContentElement(task.content));
    newListItem.append(createDeleteButton());

    newTaskField.before(newListItem);
  });
}


// Clear all tasks when the 'Delete all' button is pushed
document
  .getElementsByClassName("clear-tasks")[0]
  .addEventListener("click", (e) => {
    if (
      confirm(
        "This will permanently delete all stored tasks. this action cannot be undone. Proceed?"
      )
    ) {
      let tasks = [];
      localStorage.setItem("tasks", JSON.stringify(tasks));
      document.querySelectorAll(".task").forEach((item) => {
        item.remove();
      });
    } else {
      false;
    }
  });

// Add task on enter
newTaskField.addEventListener("keydown", (event) => {
  // prevent enter key from entering a new line in he new task field
  if (event.key === "Enter") {
    event.preventDefault();
    // if new task field is not empty
    if (newTaskField.textContent !== "") {
      // ADD NEW TASK
      // Read content of localStorage into a JS array called 'tasks'
      if (!JSON.parse(localStorage.getItem("tasks"))) {
        localStorage.setItem("tasks", JSON.stringify([]));
      }
      tasks = JSON.parse(localStorage.getItem("tasks"));
      // Create new task object to be stored
      const newTask = {
        id: crypto.randomUUID(),
        content: newTaskField.innerHTML,
        completed: false,
      };
      // Add new task object to end of JS array
      tasks.push(newTask);
      // Stringify tasks JS array, and write it back to localStorage
      localStorage.setItem("tasks", JSON.stringify(tasks));
      newTaskField.textContent = "";
      render(tasks);
    }
  }
});

// Edit task
addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("task-content") && e.detail == 2) {
    e.preventDefault();

    taskElement = e.target;
    taskElement.setAttribute("contentEditable", "true");
    taskElement.addEventListener("keydown", (e) => {
      // prevent enter key from entering a new line in he new task field
      if (e.key === "Enter") {
        e.preventDefault();
        // if new task field is not empty
        if (taskElement.textContent !== "") {
          // ADD NEW TASK
          // Read content of localStorage into a JS array called 'tasks'
          tasks = JSON.parse(localStorage.getItem("tasks"));
          thisTask = tasks.filter((task) => {
            return task.id === taskElement.parentElement.getAttribute("id");
          });
          thisTask[0].content = taskElement.textContent;
          // Stringify tasks JS array, and write it back to localStorage
          localStorage.setItem("tasks", JSON.stringify(tasks));
          render(tasks);
        }
      }
    });

    addEventListener("mousedown", (e) => {
      // Handle clicking out of editing current task
      if (e.target.getAttribute("id") !== taskElement.getAttribute("id")) {
        taskElement.removeAttribute("contentEditable");
      } else {
        false;
      }
    });
  } else {
    false;
  }
});

// Checkbox handler
addEventListener("click", (event) => {
  if (event.target.classList.contains("checkbox")) {
    let parentId = event.target.parentElement.id;
    // Read content of localStorage into a JS array called 'tasks'
    tasks = JSON.parse(localStorage.getItem("tasks"));
    thisTask = tasks.filter((task) => {
      return task.id === parentId;
    });
    let checkbox = document
      .getElementById(parentId)
      .getElementsByClassName("checkbox")[0];
    // If checkbox is currently unchecked, check it, and mark the task as completed
    if (!checkbox.innerHTML.includes("x")) {
      thisTask[0].completed = true;
      checkbox.setAttribute("aria-checked", "true");
      checkbox.innerHTML = "[x]";
      document
        .getElementById(parentId)
        .getElementsByClassName("task-content")[0]
        .classList.add("checked");

      // if the checkbox is currently checked, uncheck it, and mark the task as incomplete
    } else {
      thisTask[0].completed = false;
      checkbox.setAttribute("aria-checked", "false");
      checkbox.innerHTML = "[ ]";
      document
        .getElementById(parentId)
        .getElementsByClassName("task-content")[0]
        .classList.remove("checked");
    }
    // Stringify tasks JS array, and write it back to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
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
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-task")) {
    tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks = tasks.filter(
      (task) => task.id != e.target.parentElement.getAttribute("id")
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));
    render(tasks);
  }
});

// Trigger doubleclick
let dblclick = new MouseEvent("dblclick", {
  view: window,
  bubbles: true,
  cancelable: true,
});

// Focus handler
document.addEventListener("focusin", (e) => {
  // If checkbox in focus, toggle it
  if (e.target.classList.contains("checkbox")) {
    console.log("Checkbox");
    e.target.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        let parentId = event.target.parentElement.id;
        // Read content of localStorage into a JS array called 'tasks'
        tasks = JSON.parse(localStorage.getItem("tasks"));
        thisTask = tasks.filter((task) => {
          return task.id === parseInt(parentId);
        });
        let checkbox = document
          .getElementById(parentId)
          .getElementsByClassName("checkbox")[0];
        // If checkbox is currently unchecked, check it, and mark the task as completed
        if (!checkbox.innerHTML.includes("x")) {
          thisTask[0].completed = true;
          checkbox.setAttribute("aria-checked", "true");
          checkbox.innerHTML = "[x]";
          // if the checkbox is currently checked, uncheck it, and mark the task as incomplete
        } else {
          thisTask[0].completed = false;
          checkbox.setAttribute("aria-checked", "false");
          checkbox.innerHTML = "[ ]";
        }
        // Stringify tasks JS array, and write it back to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    });
  } else if (e.target.classList.contains("task-content")) {
    e.target.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.target.dispatchEvent(dblclick);
      }
    });
  } else if (e.target.classList.contains("delete-task")) {
    e.target.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.target.click();
      }
    });
  }
});

// document.addEventListener('keyup', function () {
// 	console.log('focused: ', document.activeElement)
// }, true);
