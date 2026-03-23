const SUPABASE_URL = "https://jdsuhlziheodvrbzqysx.supabase.co";
const SUPABASE_KEY = "sb_publishable_3l6aJa4ldViuw-g3PLqFiQ_M7mLND6A";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const todoList = document.getElementById('todo-list');

// --- MEJORA: SOPORTE PARA TECLA ENTER ---
document.getElementById('todo-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
});

// --- AUTENTICACIÓN ---
document.getElementById('btn-signup').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert("Llena todos los campos");

    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message); 
    else alert("¡Revisa tu correo para confirmar tu cuenta!");
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');
    
    btn.innerText = "Entrando...";
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
        btn.innerText = "Entrar";
    } else {
        checkUser();
    }
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
            <span class="task-text ${task.is_completed ? 'task-done' : ''}" 
                  onclick="toggleTask(${task.id}, ${task.is_completed})">
                ${task.task}
            </span>
            <button onclick="deleteTask(${task.id})">🗑️</button>
        `;
        todoList.appendChild(li);
    });
}

document.getElementById('btn-add').onclick = async () => {
    const input = document.getElementById('todo-input');
    const btn = document.getElementById('btn-add');
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (input.value && user) {
        btn.disabled = true;
        await _supabase.from('tasks').insert([{ task: input.value, user_id: user.id }]);
        input.value = '';
        btn.disabled = false;
        fetchTasks();
    }
};

// --- MEJORA: FUNCIÓN PARA TACHAR TAREAS ---
window.toggleTask = async (id, currentState) => {
    await _supabase
        .from('tasks')
        .update({ is_completed: !currentState })
        .eq('id', id);
    fetchTasks();
};

window.deleteTask = async (id) => {
    if(confirm("¿Borrar esta tarea?")) {
        await _supabase.from('tasks').delete().eq('id', id);
        fetchTasks();
    }
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
        document.getElementById('btn-login').innerText = "Entrar";
    }
}

checkUser();
