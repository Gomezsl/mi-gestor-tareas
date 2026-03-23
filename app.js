const SUPABASE_URL = "https://jdsuhlziheodvrbzqysx.supabase.co";
const SUPABASE_KEY = "sb_publishable_3l6aJa4ldViuw-g3PLqFiQ_M7mLND6A";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const todoList = document.getElementById('todo-list');
const todoInput = document.getElementById('todo-input');

// Soporte para Enter
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
});

// Autenticación
document.getElementById('btn-signup').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert("Por favor, completa los campos");

    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message); 
    else alert("¡Excelente! Revisa tu email para activar tu cuenta.");
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');
    
    btn.innerText = "Cargando...";
    btn.disabled = true;

    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
        btn.innerText = "Entrar";
        btn.disabled = false;
    } else {
        checkUser();
    }
};

document.getElementById('btn-logout').onclick = async () => {
    await _supabase.auth.signOut();
    checkUser();
};

// Gestión de Tareas
async function fetchTasks() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) return;

    const { data: tasks, error } = await _supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: false });

    if (error) return console.log(error);
    
    todoList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task-text ${task.is_completed ? 'task-done' : ''}" 
                  onclick="toggleTask(${task.id}, ${task.is_completed})">
                ${task.task}
            </span>
            <button class="btn-delete" onclick="deleteTask(${task.id})">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        todoList.appendChild(li);
    });
}

document.getElementById('btn-add').onclick = async () => {
    const val = todoInput.value.trim();
    const btn = document.getElementById('btn-add');
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (val && user) {
        btn.disabled = true;
        const { error } = await _supabase.from('tasks').insert([{ task: val, user_id: user.id }]);
        if (error) alert(error.message);
        todoInput.value = '';
        btn.disabled = false;
        fetchTasks();
    }
};

window.toggleTask = async (id, currentState) => {
    await _supabase.from('tasks').update({ is_completed: !currentState }).eq('id', id);
    fetchTasks();
};

window.deleteTask = async (id) => {
    // Borrado directo para una sensación más "app"
    await _supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
};

async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (user) {
        authSection.classList.add('hidden');
        todoSection.classList.remove('hidden');
        document.getElementById('user-email').innerText = user.email;
        fetchTasks();
    } else {
        authSection.classList.remove('hidden');
        todoSection.classList.add('hidden');
        todoList.innerHTML = '';
    }
}

checkUser();
