const SUPABASE_URL = "https://jdsuhlziheodvrbzqysx.supabase.co";
const SUPABASE_KEY = "sb_publishable_3l6aJa4ldViuw-g3PLqFiQ_M7mLND6A";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const listPanel = document.getElementById('list-panel');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const todoInput = document.getElementById('todo-input');

// Escuchar cambios de sesión en tiempo real
_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') checkUser();
    if (event === 'SIGNED_OUT') checkUser();
});

// Soporte para Enter
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
});

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');
    
    if(!email || !password) return alert("Escribe tu correo y contraseña");
    
    btn.innerText = "Verificando...";
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Error: " + error.message);
        btn.innerText = "Entrar";
    }
};

document.getElementById('btn-signup').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("¡Confirma tu correo electrónico!");
};

document.getElementById('btn-logout').onclick = async () => {
    await _supabase.auth.signOut();
};

async function fetchTasks() {
    const { data: tasks, error } = await _supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: false });

    if (error) return;
    todoList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text ${task.is_completed ? 'task-done' : ''}" 
                      onclick="toggleTask(${task.id}, ${task.is_completed})">
                    ${task.task}
                </span>
                <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
            `;
            todoList.appendChild(li);
        });
    }
}

document.getElementById('btn-add').onclick = async () => {
    const val = todoInput.value.trim();
    const { data: { user } } = await _supabase.auth.getUser();
    if (val && user) {
        await _supabase.from('tasks').insert([{ task: val, user_id: user.id }]);
        todoInput.value = '';
        fetchTasks();
    }
};

window.toggleTask = async (id, currentState) => {
    await _supabase.from('tasks').update({ is_completed: !currentState }).eq('id', id);
    fetchTasks();
};

window.deleteTask = async (id) => {
    await _supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
};

async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (user) {
        authSection.classList.add('hidden');
        todoSection.classList.remove('hidden');
        listPanel.classList.remove('hidden');
        document.getElementById('user-email').innerText = user.email;
        fetchTasks();
    } else {
        authSection.classList.remove('hidden');
        todoSection.classList.add('hidden');
        listPanel.classList.add('hidden');
        document.getElementById('btn-login').innerText = "Entrar";
    }
}

checkUser();
