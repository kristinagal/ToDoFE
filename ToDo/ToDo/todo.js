document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        displayError("Please login first!");
        window.location.href = '../Login/login.html';
        return;
    }

    document.getElementById('userInfo').textContent = `Welcome, ${user.userName}`;

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('addTodoBtn').addEventListener('click', showTodoForm);
    document.getElementById('submitTodoBtn').addEventListener('click', addTodo);
    document.getElementById('cancelTodoBtn').addEventListener('click', hideTodoForm);

    fetchTodos(user.id);
});

// Display error message
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error');
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
}

// Format date as "yyyy-MM-dd" for input fields
function formatDateInput(dateString) {
    return dateString.split("T")[0];
}

// Format date for display as "DD MMMM YYYY"
function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Logout function
function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

function showTodoForm() {
    document.getElementById('addTodoForm').style.display = 'block';
}

function hideTodoForm() {
    document.getElementById('addTodoForm').style.display = 'none';
    document.getElementById('todoType').value = '';
    document.getElementById('todoContent').value = '';
    document.getElementById('todoDate').value = '';
}

// Add a new to-do item
function addTodo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const todoData = {
        userId: user.id,
        type: document.getElementById('todoType').value,
        content: document.getElementById('todoContent').value,
        endDate: document.getElementById('todoDate').value
    };

    fetch('https://localhost:7171/api/ToDo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    })
    .then(response => {
        if (response.status === 201) return response.json();
        throw new Error(response.status === 400 ? "Bad Request: Invalid data provided." : "Failed to add To-Do.");
    })
    .then(data => {
        addToDOM(data);
        hideTodoForm();
    })
    .catch(error => displayError(error.message));
}

// Fetch all to-dos for the logged-in user
function fetchTodos(userId) {
    fetch('https://localhost:7171/api/ToDo', { method: 'GET' })
    .then(response => {
        if (response.status === 200) return response.json();
        throw new Error(response.status === 404 ? "To-Dos not found." : "Error fetching To-Dos.");
    })
    .then(data => {
        data.filter(todo => todo.userId === userId).forEach(todo => addToDOM(todo));
    })
    .catch(error => displayError(error.message));
}

// Display a To-Do item in the DOM
function addToDOM(todo) {
    const todoList = document.getElementById('todoList');
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo-item');

    todoDiv.innerHTML = `
        <div class="todo-content">
            <strong>Type:</strong> ${todo.type} <br>
            <strong>Content:</strong> ${todo.content} <br>
            <span class="todo-date"><strong>Date:</strong> ${formatDateDisplay(todo.endDate)}</span>
        </div>
    `;

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.innerHTML = `<img src="editbutton.png" alt="Edit" class="icon">`;
    editBtn.addEventListener('click', () => openEditForm(todo, todoDiv));
    buttonGroup.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = `<img src="deletebutton.png" alt="Delete" class="icon">`;
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id, todoDiv));
    buttonGroup.appendChild(deleteBtn);

    todoDiv.appendChild(buttonGroup);
    todoList.appendChild(todoDiv);
}

// Open the edit form for a To-Do item
function openEditForm(todo, todoDiv) {
    const editForm = document.createElement('div');
    editForm.classList.add('edit-form');

    editForm.innerHTML = `
        <input type="text" value="${todo.type}" class="edit-type" />
        <textarea class="edit-content">${todo.content}</textarea>
        <input type="date" value="${formatDateInput(todo.endDate)}" class="edit-date" />
        <div class="form-buttons">
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;

    todoDiv.innerHTML = '';
    todoDiv.appendChild(editForm);

    editForm.querySelector('.save-btn').addEventListener('click', () => saveEdit(todo.id, todoDiv, editForm));
    editForm.querySelector('.cancel-btn').addEventListener('click', () => cancelEdit(todo, todoDiv));
}

// Save edits to a To-Do item
function saveEdit(todoId, todoDiv, editForm) {
    const updatedTodo = {
        id: todoId,
        userId: JSON.parse(localStorage.getItem('user')).id,
        type: editForm.querySelector('.edit-type').value,
        content: editForm.querySelector('.edit-content').value,
        endDate: editForm.querySelector('.edit-date').value + "T00:00:00"
    };

    fetch(`https://localhost:7171/api/ToDo/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
    })
    .then(response => {
        if (response.status === 204) {
            updateTodoInDOM(todoDiv, updatedTodo);
        } else {
            throw new Error("Failed to save edits.");
        }
    })
    .catch(error => displayError(error.message));
}

// Update the To-Do item in the DOM after a successful edit
function updateTodoInDOM(todoDiv, updatedTodo) {
    todoDiv.innerHTML = `
        <div class="todo-content">
            <strong>Type:</strong> ${updatedTodo.type} <br>
            <strong>Content:</strong> ${updatedTodo.content} <br>
            <span class="todo-date"><strong>Date:</strong> ${formatDateDisplay(updatedTodo.endDate)}</span>
        </div>
    `;

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.innerHTML = `<img src="editbutton.png" alt="Edit" class="icon">`;
    editBtn.addEventListener('click', () => openEditForm(updatedTodo, todoDiv));
    buttonGroup.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = `<img src="deletebutton.png" alt="Delete" class="icon">`;
    deleteBtn.addEventListener('click', () => deleteTodo(updatedTodo.id, todoDiv));
    buttonGroup.appendChild(deleteBtn);

    todoDiv.appendChild(buttonGroup);
}

// Cancel editing and restore the original To-Do item
function cancelEdit(todo, todoDiv) {
    todoDiv.innerHTML = '';
    addToDOM(todo);
}

// Delete a To-Do item
function deleteTodo(todoId, todoDiv) {
    fetch(`https://localhost:7171/api/ToDo/${todoId}`, { method: 'DELETE' })
    .then(response => {
        if (response.status === 204) {
            todoDiv.remove();
        } else {
            throw new Error("Failed to delete To-Do");
        }
    })
    .catch(error => displayError(error.message));
}
