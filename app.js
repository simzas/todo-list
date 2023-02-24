//Selectors
const todoInput = document.querySelector('.todo-input');
const addTodoButton = document.querySelector('.button-add-todo');
const todoList = document.querySelector('.todo-list');
const loaderIcon = document.querySelector('#loader-icon');
const addIconButton = document.querySelector('.fa-plus-square');

//input value
let todoInputValue = "";

//local variable
let loadedList;

//Event listeners
document.addEventListener("DOMContentLoaded", loadTodoListOnPageLoad);
addTodoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', changeItemState);
todoInput.oninput = () => setTodoInputValue(todoInput.value);
todoInput.addEventListener("animationend", function() { 
    console.log("animation ended");
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
            progressTodoItem(item.parentElement);    
        break;
        case 'blocked-btn': 
            blockTodoItem(item.parentElement);    
        break;
        case 'complete-btn': 
            completeTodoItem(item.parentElement);    
        break;
        case 'trash-btn': 
            deleteTodoItem(item.parentElement);    
        break;
        default: 
            console.log("unknown class: "+item);    
        break;
    }
    removePreviousState(item.classList[0], item.parentElement);
}

function deleteTodoItem(item) {
    try {
        hideLoadingIcon(false);
        loadedList.splice(loadedList.findIndex(obj => obj.todoItemName == item.getElementsByClassName("todo-item")[0].innerText), 1);
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

function progressTodoItem(item) {
    hideLoadingIcon(false);
    loadedList.forEach(listItem => {
        if (listItem.todoItemName === item.getElementsByClassName("todo-item")[0].innerText) {
            listItem.state = "in-progress";
        }
    })
    localStorage.setItem("todoList", JSON.stringify(loadedList));

    item.classList.toggle('in-progress');
    hideLoadingIcon(true);
}

function blockTodoItem(item) {
    hideLoadingIcon(false);
    loadedList.forEach(listItem => {
        if (listItem.todoItemName === item.getElementsByClassName("todo-item")[0].innerText) {
            listItem.state = "blocked";
        }
    })
    localStorage.setItem("todoList", JSON.stringify(loadedList));

    item.classList.toggle('blocked');
    hideLoadingIcon(true);
}
    
function completeTodoItem(item) {
    hideLoadingIcon(false);
    loadedList.forEach(listItem => {
        if (listItem.todoItemName === item.getElementsByClassName("todo-item")[0].innerText) {
            listItem.state = "completed";
        }
    })
    localStorage.setItem("todoList", JSON.stringify(loadedList));

    item.classList.toggle('completed');
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
        if (loadedList === undefined) throw new Error("localstorage failed to load");

        let todoList = await loadLocalStorage();
        let newTodoItem = {todoItemName, "state": "todo" };
        todoList.unshift(newTodoItem);
        localStorage.setItem("todoList", JSON.stringify(todoList));
        loadedList = todoList;
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

async function loadTodoListOnPageLoad() {
    hideLoadingIcon(false);
    let storedTodoList;
    try {
        storedTodoList = await loadLocalStorage();
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