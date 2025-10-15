let addBtn, nameEntry, dateEntry, taskContainer, searchInput, sortSelect, filterSelect;
let tasks = [];


function createMainElements() {
    // корневой контейнер
    const container = document.createElement("div");
    container.classList.add("container");

    // div приложения
    const app = document.createElement("div");
    app.classList.add("to-do-app");

    // верхняя панель
    const header = document.createElement("div");
    header.classList.add("header");

    const title = document.createElement("h2");
    title.textContent = "Just To-Do It!";

    // панель поиска и сортировки
    const controlPanel = document.createElement("div");
    controlPanel.classList.add("controls");

    // поиск
    searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "поиск по названию...";

    // сортировка
    sortSelect = document.createElement("select");

    const sortOptions = [
        { value: "id_desc", text: "сначала новые" },
        { value: "id_asc", text: "сначала старые" },
        { value: "deadline_asc", text: "сначала срочные ↑" },
        { value: "deadline_desc", text: "сначала несрочные ↓" },
    ];

    sortOptions.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        sortSelect.appendChild(option);
    });

    // фильтрация
    filterSelect = document.createElement("select");

    const filterOptions = [
        { value: "all", text: "все" },
        { value: "active", text: "невыполненные" },
        { value: "done", text: "выполненные" },
    ];

    filterOptions.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        filterSelect.appendChild(option);
    });

    controlPanel.append(searchInput, sortSelect, filterSelect);
    header.append(title, controlPanel);

    // форма добавления задачи
    const row = document.createElement("div");
    row.classList.add("row");

    nameEntry = document.createElement("input");
    nameEntry.type = "text";
    nameEntry.placeholder = "напиши свою задачу...";

    dateEntry = document.createElement("input");
    dateEntry.type = "date";
    dateEntry.value = new Date().toISOString().split("T")[0];

    addBtn = document.createElement("button");
    addBtn.textContent = "добавить";

    row.append(nameEntry, dateEntry, addBtn);

    // контейнер для задач
    taskContainer = document.createElement("ul");
    taskContainer.classList.add("task-container");

    // сборка
    app.append(header, row, taskContainer);
    container.append(app);
    document.body.appendChild(container);

    // события
    addBtn.onclick = addTask;
    // taskContainer.addEventListener("click", taskClickHandler);
    searchInput.addEventListener("input", updateToDoListHTML);
    sortSelect.addEventListener("change", updateToDoListHTML);
    filterSelect.addEventListener("change", updateToDoListHTML);
}


createMainElements();


function searchFilter(ts) {
    const query = searchInput.value.trim().toLowerCase();
    if (query === "") return ts;
    return ts.filter(t => t.title.toLowerCase().includes(query));
}

function statusFilter(ts) {
    switch (filterSelect.value) {
        case "active":
            return ts.filter(t => t.active);
        case "done":
            return ts.filter(t => !t.active);
        default:
            return ts;
    }
}

function sortTasks(ts) {
    switch (sortSelect.value) {
        case "id_asc":
            return ts.sort((a, b) => a.id - b.id);
        case "id_desc":
            return ts.sort((a, b) => b.id - a.id);
        case "deadline_asc":
            return ts.sort((a, b) => (a.date || "") > (b.date || "") ? 1 : -1);
        case "deadline_desc":
            return ts.sort((a, b) => (a.date || "") < (b.date || "") ? 1 : -1);
        default:
            return ts;
    }
}


function updateToDoListHTML() {
    // очистка списка
    while (taskContainer.firstChild) {
        taskContainer.removeChild(taskContainer.firstChild);
    }
    let tasks_to_show = sortTasks(statusFilter(searchFilter(tasks)));
    // добавление задач
    tasks_to_show.forEach(task => {
        let taskHTML = document.createElement("li");

        // текст задачи
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = task.title;
        titleInput.classList.add("task-title");
        if (!task.active) {
            titleInput.style.textDecoration = "line-through";
            titleInput.style.opacity = "0.6";
        }

        // изменение названия задачи
        titleInput.addEventListener("input", e => {
            const t = tasks.find(t => t.id == task.id);
            if (t) t.title = e.target.value;
        });

        // выбор даты
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = task.date || new Date().toISOString().split("T")[0];

        dateInput.addEventListener("change", e => {
            const t = tasks.find(t => t.id == task.id);
            if (t) t.date = e.target.value;
        });

        // кнопка удаления
        const closeBtn = document.createElement("span");
        closeBtn.textContent = "\u00d7";
        closeBtn.classList.add("close-btn");
        closeBtn.addEventListener("click", e => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        // клик по задаче = отметка выполненной
        taskHTML.addEventListener("click", e => {
            if (e.target.tagName !== "INPUT") { // чтобы не срабатывало при редактировании
                const t = tasks.find(t => t.id == task.id);
                if (t) {
                    t.active = !t.active;
                    saveData();
                    updateToDoListHTML();
                }
            }
        });

        // сборка li
        taskHTML.append(titleInput, dateInput, closeBtn);
        taskContainer.appendChild(taskHTML);

        // taskHTML.textContent = task.title;
        // taskHTML.dataset.id = task.id;
        // taskContainer.appendChild(taskHTML);

        // let closeBtn = document.createElement("span");
        // closeBtn.textContent = "\u00d7";
        // taskHTML.appendChild(closeBtn);
    });
    // saveData();
}


function addTask() {
    if(nameEntry.value === '') {
        alert("чтобы добавить задачу, надо написать ее");
        return;
    }
    let deadline = dateEntry.value || null;
    if(!tasks.length){ // список пуст
        tasks = [{
            id: 1,
            active: true,
            date: deadline,
            title: nameEntry.value
        }]
    }else { // добавить в уже непустой список наерх
        tasks.unshift({
            id: tasks.length + 1,
            active: true,
            date: deadline,
            title: nameEntry.value
        }); 
    } 
    updateToDoListHTML();
    nameEntry.value = '';
    dateEntry.value = new Date().toISOString().split("T")[0];;
}


function deleteTask(task_id) {
    indexTask = tasks.findIndex(value => value.id == task_id);
    tasks.splice(indexTask, 1);
    updateToDoListHTML(); 
    // TODO: сдвиг индексов
}


function saveData() {
    localStorage.setItem('todo-list', JSON.stringify(tasks));
}


// addBtn.onclick = addTask;

// taskContainer.addEventListener("click", e => {
//     if(e.target.tagName === "SPAN") {
//         deleteTask(e.target.parentElement.dataset.id);
//     }
// })


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