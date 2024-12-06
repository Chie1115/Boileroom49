"use strict";
document.addEventListener("DOMContentLoaded", () => {
    let toDoList = []; // Array to hold all the tasks
    // Getting the elements from the HTML document and assigning them to variables
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const message = document.getElementById("message");
    const filterSelect = document.getElementById("filterSelect");
    const sortSelect = document.getElementById("sortSelect");
    const searchInput = document.getElementById("searchInput");
    // Event listener for adding new tasks when the form is submitted
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const taskDescription = taskInput.value.trim();
        // If the input is empty, show an error message and stop further execution
        if (taskDescription === "") {
            message.innerText = "You must enter a task.";
            return;
        }
        createNewTask(taskDescription);
        updateTaskElements();
        taskInput.value = "";
        message.innerText = "";
    });
    // Updating task list when we apply any type of filter
    filterSelect.addEventListener("change", updateTaskElements);
    sortSelect.addEventListener("change", updateTaskElements);
    searchInput.addEventListener("input", updateTaskElements);
    // Function to add a new task to the list
    function createNewTask(description) {
        const newTask = { taskID: Date.now(), taskDescription: description, isCompleted: false };
        toDoList.push(newTask);
        saveToLocalStorage();
    }
    // Function to display tasks on the webpage
    function updateTaskElements() {
        taskList.innerHTML = "";
        let filteredTasks = [...toDoList]; // Create a copy of the task list for filtering and sorting
        // Apply search filter
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => task.taskDescription.toLowerCase().includes(searchTerm));
        }
        // Apply status filter
        const filterValue = filterSelect.value;
        if (filterValue !== "all") {
            filteredTasks = filteredTasks.filter(task => filterValue === "completed" ? task.isCompleted : !task.isCompleted);
        }
        // Apply sorting
        const sortValue = sortSelect.value;
        if (sortValue === "date") {
            filteredTasks.sort((a, b) => a.taskID - b.taskID); // Sort by date - ID = Date
        }
        else if (sortValue === "status") {
            filteredTasks.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
        }
        // Loop through the filtered and sorted tasks and create HTML elements for each
        filteredTasks.forEach(task => {
            const showTask = document.createElement("li");
            showTask.className = task.isCompleted ? "completed" : "";
            showTask.dataset.id = task.taskID.toString();
            const showDescription = document.createElement("p");
            showDescription.textContent = `${task.taskDescription} `;
            const completeTask = document.createElement("button");
            completeTask.className = "completeButton";
            completeTask.textContent = task.isCompleted ? "Undo" : "Mark task as completed";
            completeTask.addEventListener("click", () => markAsCompleteToDo(task.taskID));
            const deleteTask = document.createElement("button");
            deleteTask.className = "deleteButton";
            deleteTask.textContent = "Delete task";
            deleteTask.addEventListener("click", () => deleteToDo(task.taskID));
            const editTask = document.createElement("button");
            editTask.className = "editButton";
            editTask.textContent = "Edit task";
            editTask.addEventListener("click", () => editToDo(task.taskID));
            showTask.appendChild(showDescription);
            showTask.appendChild(completeTask);
            showTask.appendChild(deleteTask);
            showTask.appendChild(editTask);
            taskList.appendChild(showTask);
        });
    }
    function markAsCompleteToDo(taskID) {
        toDoList = toDoList.map(task => {
            if (task.taskID === taskID) {
                return Object.assign(Object.assign({}, task), { isCompleted: !task.isCompleted });
            }
            return task;
        });
        updateTaskElements();
        saveToLocalStorage();
    }
    function deleteToDo(taskID) {
        toDoList = toDoList.filter(task => task.taskID !== taskID);
        updateTaskElements();
        saveToLocalStorage();
    }
    function editToDo(taskID) {
        const listItem = document.querySelector(`[data-id='${taskID}']`);
        const taskToEdit = toDoList.find(task => task.taskID === taskID);
        if (listItem && taskToEdit) {
            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.value = taskToEdit.taskDescription;
            inputField.className = "editInput";
            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.className = "saveButton";
            saveButton.addEventListener("click", () => {
                const newDescription = inputField.value.trim();
                if (newDescription !== "") {
                    taskToEdit.taskDescription = newDescription;
                    updateTaskElements();
                    saveToLocalStorage();
                }
            });
            listItem.querySelector("p").remove();
            listItem.querySelector(".editButton").remove();
            listItem.appendChild(inputField);
            listItem.appendChild(saveButton);
            let completeButtonElementsList = listItem.getElementsByClassName("completeButton");
            if (completeButtonElementsList.length > 0) {
                completeButtonElementsList[0].remove();
            }
        }
    }
    // Load tasks from localStorage when the page loads
    const savedTasks = localStorage.getItem("toDoList");
    if (savedTasks) {
        toDoList = JSON.parse(savedTasks).map((task) => ({ taskID: task.taskID, taskDescription: task.taskDescription, isCompleted: task.isCompleted }));
        updateTaskElements();
    }
    function saveToLocalStorage() {
        localStorage.setItem("toDoList", JSON.stringify(toDoList));
    }
});
