//Selectors
const todoInput = document.querySelector('.todo-input');
const addTodoButton = document.querySelector('.button-add-todo');
const todoList = document.querySelector('.todo-list');
const loaderIcon = document.querySelector('#loader-icon');
const addIconButton = document.querySelector('.fa-plus-square');
const oneColumn = document.querySelector('.one');
const twoColumn = document.querySelector('.two');
const fourColumn = document.querySelector('.four'); 
const showDeletedItemsButton = document.querySelector('.items-deleted'); 
const showActiveItemsButton = document.querySelector('.items-active'); 

//input value
let todoInputValue = "";

//local variable
let loadedList;
let deletedList;

//Event listeners
document.addEventListener("DOMContentLoaded", loadTodoListOnPageLoad);
addTodoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', changeItemState);
oneColumn.addEventListener('click', () => changeColumns(1));
twoColumn.addEventListener('click', () => changeColumns(2));
fourColumn.addEventListener('click', () => changeColumns(4));
showDeletedItemsButton.addEventListener('click', () => console.log("show deleted items"));
showActiveItemsButton.addEventListener('click', () => console.log("show active items"));
todoInput.oninput = () => setTodoInputValue(todoInput.value);
todoInput.addEventListener("animationend", function() { 
    todoInput.classList.toggle("blink-red");
    addTodoButton.classList.toggle("blink-red");
    addIconButton.classList.toggle("blink-red");
});

//Functions
function setTodoInputValue(value) { todoInputValue = value; }

function addTodo(event) {
    event.preventDefault();

    if (todoInputValue === "") {
        //animations
        todoInput.classList.toggle("blink-red");
        addTodoButton.classList.toggle("blink-red");
        addIconButton.classList.toggle("blink-red");
        return;
    };

    hideLoadingIcon(false);

    addToLocalStorage(todoInputValue);

    //Todo div
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    //Create list
    const newTodo = document.createElement("li");
    newTodo.innerText = todoInputValue;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo);

    //progress btn
    const inProgressButton = document.createElement('button');
    inProgressButton.innerHTML = '<i class="fa fa-play"></i>';
    inProgressButton.classList.add("progress-btn");
    todoDiv.appendChild(inProgressButton);

    //Blocked btn
    const blockedButton = document.createElement('button');
    blockedButton.innerHTML = '<i class="fa fa-ban"></i>';
    blockedButton.classList.add("blocked-btn");
    todoDiv.appendChild(blockedButton);
    
    //Completed btn
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    //Delete btn
    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    //append to list
    if (loadedList.length > 0) {
        todoList.insertBefore(todoDiv, todoList.getElementsByClassName("todo").item(0));
    } else {
        todoList.appendChild(todoDiv);
    }

    //clear input value
    clearInputs();
    hideLoadingIcon(true);
};

function clearInputs() {
    todoInput.value = "";
    setTodoInputValue("");
}

function changeItemState(event) {
    const item = event.target;
    switch (item.classList[0]) {
        case 'progress-btn':  
            updateItemState(item.parentElement, "in-progress");    
        break;
        case 'blocked-btn': 
            updateItemState(item.parentElement, "blocked");   
        break;
        case 'complete-btn': 
            updateItemState(item.parentElement, "completed");   
        break;
        case 'trash-btn': 
            deleteTodoItem(item.parentElement);    
        return;
        default: 
            console.log("unknown class: "+item);    
        break;
    }
    removePreviousState(item.classList[0], item.parentElement);
}

function deleteTodoItem(item) {
    hideLoadingIcon(false);
    try {
        let itemValue = item.getElementsByClassName("todo-item")[0].innerText;
        addToDeletedItems(itemValue);
        loadedList.splice(loadedList.findIndex(obj => obj.todoItemName == itemValue), 1);
        localStorage.setItem("todoList", JSON.stringify(loadedList));

    } catch (err) {
        console.log(err);
        loadTodoListOnPageLoad();
        hideLoadingIcon(true);
        return;
    }
    
    //animation
    item.classList.add("fall");
    item.addEventListener('transitionend', function() { 
        item.remove();
        hideLoadingIcon(true); 
    });
}

function updateItemState(item, state) {
    hideLoadingIcon(false);

    if (item.classList.contains(state)) {
        loadedList.forEach(listItem => {
            if (listItem.todoItemName === item.getElementsByClassName("todo-item")[0].innerText) {
                listItem.state = "todo";
            }
        })
    } else {   
        loadedList.forEach(listItem => {
            if (listItem.todoItemName === item.getElementsByClassName("todo-item")[0].innerText) {
                listItem.state = state;
            }
        })
    }
    localStorage.setItem("todoList", JSON.stringify(loadedList));
    item.classList.toggle(state);
    hideLoadingIcon(true);
}

function removePreviousState(buttonType, element) {
    switch (buttonType) {
        case "complete-btn":
            element.classList.remove("in-progress");
            element.classList.remove("blocked");
        break;
        case "progress-btn":
            element.classList.remove("completed");
            element.classList.remove("blocked");
        break;
        case "blocked-btn":
            element.classList.remove("in-progress");
            element.classList.remove("completed");
        break;
        default: 
            console.log("unknown class to change:", buttonType);
        break;
    }
}

async function addToLocalStorage(todoItemName) {
    try {
        if (loadedList === undefined) throw new Error("localstorage todo items failed to load");

        let todoList = await loadLocalStorage();
        let newTodoItem = {todoItemName, "state": "todo" };
        todoList.unshift(newTodoItem);
        localStorage.setItem("todoList", JSON.stringify(todoList));
        loadedList = todoList;
    } catch (err) {
        console.log(err);
    }
}

async function addToDeletedItems(deletedItemName) {
    try {
        if (deletedList === undefined) throw new Error("localstorage deleted items failed to load");
        let newDeletedItem = {deletedItemName, "date": Date.now() };
        deletedList.push(newDeletedItem);
        localStorage.setItem("deletedList", JSON.stringify(deletedList));
    } catch (err) {
        console.log(err);
    }
}

function loadLocalStorage() {
    return new Promise((resolve, reject) => {
        try {
            if (localStorage.getItem("todoList") === null) {
                loadedList = [];
            } else {
                loadedList = JSON.parse(localStorage.getItem("todoList"));
            }
            resolve(loadedList); 
        } catch (err) {
            reject([]);
        }
    })
}

function loadDeletedItems() {
    return new Promise((resolve, reject) => {
        try {
            if (localStorage.getItem("deletedList") === null) {
                deletedList = [];
            } else {
                deletedList = JSON.parse(localStorage.getItem("deletedList"));
            }
            resolve(deletedList); 
        } catch (err) {
            reject([]);
        }
    })
}

async function loadTodoListOnPageLoad() {
    hideLoadingIcon(false);
    let storedTodoList;
    try {
        storedTodoList = await loadLocalStorage();
        deletedList = await loadDeletedItems();
    } catch (err) {
        console.log(err);
    }
    
    storedTodoList.forEach(storedTodoItem => {

    //Todo div
    const todoDiv = document.createElement("div");
    if (storedTodoItem.state === "in-progress") todoDiv.classList.add("in-progress"); 
    if (storedTodoItem.state === "blocked") todoDiv.classList.add("blocked"); 
    if (storedTodoItem.state === "completed") todoDiv.classList.add("completed"); 
    todoDiv.classList.add("todo");
    
    //Create list
    const newTodo = document.createElement("li");
    newTodo.innerText = storedTodoItem.todoItemName;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo);

    //progress btn
    const inProgressButton = document.createElement('button');
    inProgressButton.innerHTML = '<i class="fas fa-play"></i>';
    inProgressButton.classList.add("progress-btn");
    todoDiv.appendChild(inProgressButton);

    //Blocked btn
    const blockedButton = document.createElement('button');
    blockedButton.innerHTML = '<i class="fas fa-ban"></i>';
    blockedButton.classList.add("blocked-btn");
    todoDiv.appendChild(blockedButton);

    //Completed btn
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    //Delete btn
    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    //append to list
    todoList.appendChild(todoDiv);
    });

    hideLoadingIcon(true);

}

/**
 * @description whether should be loading icon hidden {true} or shown {false}
 * @param {boolean} bool 
 */
function hideLoadingIcon(bool) {
    const classList = loaderIcon.classList;
    if (bool) {
        if (!classList.contains("hidden")) {
            classList.add("hidden");
        }
    } else {
        if (classList.contains("hidden")) {
            classList.remove("hidden");
        }
    }
}

/**
 * @description changes amount of columns to be displayed
 * @param {number} columnsAmout
 */
function changeColumns(columnsAmout) {
    switch (columnsAmout) {
        case 1: 
            console.log("number of columns: ONE");
        break;
        case 2: 
            console.log("number of columns: TWO");
        break;
        case 4: 
            console.log("number of columns: FOUR");
        break;
        default: 
            console.log("unknown number of columns: ", columnsAmout);
        break;
    }
}