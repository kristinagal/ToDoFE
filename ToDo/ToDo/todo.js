document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert('Please login first!');
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Logout
function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

function showTodoForm() {
    document.getElementById('addTodoForm').style.display = 'block';
}

// cancel addTodo
function hideTodoForm() {
    document.getElementById('addTodoForm').style.display = 'none';
    document.getElementById('todoType').value = '';
    document.getElementById('todoContent').value = '';
    document.getElementById('todoDate').value = '';
}

// add todo
function addTodo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const todoType = document.getElementById('todoType').value;
    const todoContent = document.getElementById('todoContent').value;
    const todoDate = document.getElementById('todoDate').value;

    const todoData = {
        userId: user.id,
        type: todoType,
        content: todoContent,
        endDate: todoDate
    };

    fetch('https://localhost:7171/api/ToDo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add To-Do');
        }
        return response.json();
    })
    .then(data => {
        addToDOM(data);
        hideTodoForm();
    })
    .catch(error => {
        alert('Failed to add To-Do: ' + error.message);
    });
}

// todos of current user
function fetchTodos(userId) {
    fetch('https://localhost:7171/api/ToDo', {  
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const userTodos = data.filter(todo => todo.userId === userId);
        userTodos.forEach(todo => addToDOM(todo));
    })
    .catch(error => {
        alert('Error fetching To-Dos: ' + error.message);
    });
}

// atvaizdavimas
function addToDOM(todo) {
    const todoList = document.getElementById('todoList');
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo-item');

    const formattedDate = formatDate(todo.endDate);

    todoDiv.innerHTML = `
        <div class="todo-content">
            <strong>Type:</strong> ${todo.type} <br>
            <strong>Content:</strong> ${todo.content} <br>
            <span class="todo-date"><strong>Date:</strong> ${formattedDate}</span>
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

function openEditForm(todo, todoDiv) {
    const editForm = document.createElement('div');
    editForm.classList.add('edit-form');

    editForm.innerHTML = `
        <input type="text" value="${todo.type}" class="edit-type" />
        <textarea class="edit-content">${todo.content}</textarea>
        <input type="date" value="${todo.endDate}" class="edit-date" />
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

function saveEdit(todoId, todoDiv, editForm) {
    const updatedTodo = {
        type: editForm.querySelector('.edit-type').value,
        content: editForm.querySelector('.edit-content').value,
        endDate: editForm.querySelector('.edit-date').value,
        userId: JSON.parse(localStorage.getItem('user')).id
    };

    fetch(`https://localhost:7171/api/ToDo/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTodo)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save edits');
        }
        return response.json();
    })
    .then(data => {
        todoDiv.innerHTML = '';
        addToDOM(data);
    })
    .catch(error => {
        alert('Failed to save edits: ' + error.message);
    });
}

// cancel editing and restore original to-do item
function cancelEdit(todo, todoDiv) {
    todoDiv.innerHTML = '';
    addToDOM(todo);
}

function deleteTodo(todoId, todoDiv) {
    fetch(`https://localhost:7171/api/ToDo/${todoId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete To-Do');
        }
        todoDiv.remove();
    })
    .catch(error => {
        alert('Failed to delete To-Do: ' + error.message);
    });
}
