document.addEventListener('DOMContentLoaded', () => {

    const todoForm = document.getElementById('todo-form');
    const judulInput = document.getElementById('judul-tugas');
    const tanggalInput = document.getElementById('tanggal-tenggat');
    const deskripsiInput = document.getElementById('deskripsi-tugas');
    const todoListBody = document.getElementById('todo-list-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const notificationEl = document.getElementById('notification');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const showNotification = (message, type = 'info') => {
        notificationEl.textContent = message;
        notificationEl.className = `notification ${type} show`;
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    };

    const renderTodos = (items = todos) => {
        todoListBody.innerHTML = '';
        
        if (items.length === 0) {
            todoListBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #888;">Belum ada tugas.</td></tr>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        items.forEach(todo => {
            const tr = document.createElement('tr');
            const dueDate = new Date(todo.dueDate + 'T00:00:00');
            let statusText, statusClass;

            if (todo.completed) {
                statusText = 'Completed';
                statusClass = 'status-completed';
            } else if (dueDate < today) {
                statusText = 'Overdue';
                statusClass = 'status-overdue';
            } else {
                statusText = 'Not Yet Completed';
                statusClass = 'status-pending';
            }

            tr.innerHTML = `
                <td>
                    <div class="task-details">
                        <h4>${todo.title}</h4>
                        <p>${todo.description || 'Tidak ada deskripsi.'}</p>
                    </div>
                </td>
                <td>${new Date(todo.dueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <input type="checkbox" class="toggle-complete" data-id="${todo.id}" ${todo.completed ? 'checked' : ''} title="Tandai Selesai">
                    <button class="btn-delete" data-id="${todo.id}" title="Hapus Tugas">🗑️</button>
                </td>
            `;
            todoListBody.appendChild(tr);
        });
    };

    const addTodo = (e) => {
        e.preventDefault();
        
        const title = judulInput.value.trim();
        const dueDate = tanggalInput.value;
        const description = deskripsiInput.value.trim();

        if (!title || !dueDate) {
            showNotification('Judul dan tanggal tenggat wajib diisi!', 'error');
            return;
        }
        
        const newTodo = { id: Date.now(), title, description, dueDate, completed: false };
        todos.unshift(newTodo);
        
        saveTodos();
        renderTodos();
        todoForm.reset();
        showNotification('Tugas berhasil ditambahkan!', 'success');
    };

    const handleTableActions = (e) => {
        const target = e.target;
        
        const deleteButton = target.closest('.btn-delete');
        const toggleCheckbox = target.closest('.toggle-complete');

        if (deleteButton) {
            const todoId = Number(deleteButton.dataset.id);
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                todos = todos.filter(t => t.id !== todoId);
                saveTodos();
                renderTodos();
                showNotification('Tugas berhasil dihapus.', 'success');
            }
            return;
        }

        if (toggleCheckbox) {
            const todoId = Number(toggleCheckbox.dataset.id);
            const todo = todos.find(t => t.id === todoId);
            todo.completed = toggleCheckbox.checked;
            saveTodos();
            renderTodos();
            showNotification('Status tugas diperbarui.', 'info');
        }
    };
    
    function filterTodos() {
        const searchText = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = todos.filter(todo => {
            // Search filter
            const matchSearch = todo.title.toLowerCase().includes(searchText) || (todo.description && todo.description.toLowerCase().includes(searchText));
            // Status filter
            let matchStatus = true;
            const dueDate = new Date(todo.dueDate + 'T00:00:00');
            if (status === 'completed') matchStatus = todo.completed;
            else if (status === 'notyet') matchStatus = !todo.completed && dueDate >= today;
            else if (status === 'overdue') matchStatus = !todo.completed && dueDate < today;
            return matchSearch && matchStatus;
        });

        renderTodos(filtered);
    }

    const deleteAllTodos = () => {
        if (todos.length === 0) {
            showNotification('Tidak ada tugas untuk dihapus.', 'error');
            return;
        }
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA tugas?')) {
            todos = [];
            saveTodos();
            renderTodos();
            showNotification('Semua tugas telah dihapus.', 'success');
        }
    };

    todoForm.addEventListener('submit', addTodo);
    todoListBody.addEventListener('click', handleTableActions);
    searchInput.addEventListener('input', filterTodos);
    statusFilter.addEventListener('change', filterTodos);
    deleteAllBtn.addEventListener('click', deleteAllTodos);

    renderTodos();
});