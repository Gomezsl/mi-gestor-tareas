const SUPABASE_URL = "https://jdsuhlziheodvrbzqysx.supabase.co";
const SUPABASE_KEY = "sb_publishable_3l6aJa4ldViuw-g3PLqFiQ_M7mLND6A";

// CAMBIO AQUÍ: Usamos _supabase (con guion bajo) para no chocar con la librería
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM
const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const todoList = document.getElementById('todo-list');

// --- AUTENTICACIÓN ---
document.getElementById('btn-signup').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message); 
    else alert("¡Revisa tu correo de confirmación!");
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message); 
    else checkUser();
};

document.getElementById('btn-logout').onclick = async () => {
    await _supabase.auth.signOut();
    checkUser();
};

// --- GESTIÓN DE TAREAS ---
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
            <span class="${task.is_completed ? 'task-done' : ''}">${task.task}</span>
            <button onclick="deleteTask(${task.id})">🗑️</button>
        `;
        todoList.appendChild(li);
    });
}

document.getElementById('btn-add').onclick = async () => {
    const input = document.getElementById('todo-input');
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (input.value && user) {
        await _supabase.from('tasks').insert([{ task: input.value, user_id: user.id }]);
        input.value = '';
        fetchTasks();
    }
};

// Hacemos que deleteTask sea accesible desde el HTML
window.deleteTask = async (id) => {
    await _supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
};

// Revisar si hay sesión activa al cargar
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
