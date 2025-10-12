const addBtn = document.querySelector("#add_task_btn");
const nameEntry = document.querySelector("#add_task_name");
let taskContainer = document.querySelector(".task-container");

let tasks = [];


function addTask() {
    if(nameEntry.value === '') {
        alert("чтобы добавить задачу, надо написать ее");
    }else{
        let task = document.createElement("li")
        task.innerHTML = nameEntry.value;
        taskContainer.appendChild(task);
        let closeBtn = document.createElement("span");
        closeBtn.innerHTML = "\u00d7";
        task.appendChild(closeBtn);
        saveData();
    }
    nameEntry.value = '';
}


function saveData() {
    localStorage.setItem("data", taskContainer.innerHTML);
}

function showTasks() {
    taskContainer.innerHTML = localStorage.getItem("data");
}

addBtn.onclick = addTask;

taskContainer.addEventListener("click", e => {
    if(e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
    }
})

showTasks();


