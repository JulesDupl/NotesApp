const API = 'https://notesapp-hrgy.onrender.com';

const list    = document.getElementById('notes-list');
const input   = document.getElementById('note-input');
const addBtn  = document.getElementById('add-btn');
const counter = document.getElementById('notes-count');
const toast   = document.getElementById('toast');

function showToast(msg, ms = 2200) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), ms);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderNotes(notes) {
  counter.textContent = notes.length === 0
    ? '— no notes yet —'
    : `— ${notes.length} note${notes.length !== 1 ? 's' : ''} —`;

  if (notes.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="icon">📋</div>Nothing here yet. Add your first note above.</div>`;
    return;
  }

  list.innerHTML = '';
  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;
    card.innerHTML = `
      <div style="flex:1">
        <div class="note-text">${escapeHtml(note.content)}</div>
        ${note.createdAt ? `<div class="note-meta">${formatDate(note.createdAt)}</div>` : ''}
      </div>
      <button class="del-btn" data-id="${note.id}">Delete</button>
    `;
    list.appendChild(card);
  });
}

async function fetchNotes() {
  try {
    const res = await fetch(`${API}/notes`);
    if (!res.ok) throw new Error();
    const notes = await res.json();
    renderNotes(notes);
  } catch {
    list.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div>Could not reach the backend.</div>`;
    counter.textContent = '— offline —';
  }
}

async function addNote() {
  const content = input.value.trim();
  if (!content) { input.focus(); return; }

  addBtn.disabled = true;
  try {
    const res = await fetch(`${API}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error();
    input.value = '';
    await fetchNotes();
    showToast('Note added.');
  } catch {
    showToast('Failed to add note.');
  } finally {
    addBtn.disabled = false;
  }
}

async function deleteNote(id) {
  try {
    const res = await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await fetchNotes();
    showToast('Note deleted.');
  } catch {
    showToast('Failed to delete note.');
  }
}

addBtn.addEventListener('click', addNote);

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
});

list.addEventListener('click', e => {
  const btn = e.target.closest('.del-btn');
  if (btn) deleteNote(btn.dataset.id);
});

fetchNotes();