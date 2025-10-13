const addBtn = document.querySelector("#add_task_btn");
const nameEntry = document.querySelector("#add_task_name");
let taskContainer = document.querySelector(".task-container");

let tasks = [];


function updateToDoListHTML() {
    // очистка списка
    while (taskContainer.firstChild) {
        console.log(taskContainer.firstChild);
        
        taskContainer.removeChild(taskContainer.firstChild);
    }
    // добавление задач
    tasks.forEach(task => {
        let taskHTML = document.createElement("li");
        taskHTML.textContent = task.title;
        taskHTML.dataset.id = task.id;
        taskContainer.appendChild(taskHTML);

        let closeBtn = document.createElement("span");
        closeBtn.textContent = "\u00d7";
        taskHTML.appendChild(closeBtn);
    });
    console.log(tasks);
    // saveData();
}


function addTask() {
    if(nameEntry.value === '') {
        alert("чтобы добавить задачу, надо написать ее");
        return;
    }
    if(!tasks.length){ // список пуст
        tasks = [{
            id: 1,
            title: nameEntry.value
        }]
    }else { // добавить в уже непустой список наерх
        tasks.unshift({
            id: tasks.length + 1,
            title: nameEntry.value
        }); 
    } 
    updateToDoListHTML();
    nameEntry.value = '';
}


function deleteTask(task_id) {
    indexTask = tasks.findIndex(value => value.id == task_id);
    console.log(task_id, indexTask);
    tasks.splice(indexTask, 1);
    updateToDoListHTML(); 
    // TODO: сдвиг индексов
}


function saveData() {
    localStorage.setItem('todo-list', JSON.stringify(tasks));
}


addBtn.onclick = addTask;

taskContainer.addEventListener("click", e => {
    if(e.target.tagName === "SPAN") {
        deleteTask(e.target.parentElement.dataset.id);
    }
})


function loadToDoList(){
    if(localStorage.getItem('todo-list')){
        // tasks = JSON.parse(localStorage.getItem('todo-list'))
        tasks = [];
        updateToDoListHTML();
    } else {
        tasks = [];
    }
}


loadToDoList();