const formSection = document.querySelector("#note-form-section");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title");
const notesGrid = document.querySelector("#notes-grid");
const emptyState = document.querySelector("#empty-state");
const noteCount = document.querySelector("#note-count");
const noteTemplate = document.querySelector("#note-template");

let notes = [];

function showForm() {
  formSection.hidden = false;
  titleInput.focus();
  formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideForm() {
  noteForm.reset();
  formSection.hidden = true;
}

function renderNotes() {
  notesGrid.replaceChildren();
  noteCount.textContent = notes.length;
  emptyState.hidden = notes.length > 0;

  notes.forEach((note) => {
    const card = noteTemplate.content.cloneNode(true);
    const category = card.querySelector(".category-label");
    const title = card.querySelector(".note-title");
    const content = card.querySelector(".note-content");
    const deleteButton = card.querySelector(".delete-button");

    category.textContent = note.category;
    title.textContent = note.title;
    content.textContent = note.content;
    deleteButton.addEventListener("click", () => deleteNote(note._id));

    notesGrid.append(card);
  });
}

async function loadNotes() {
  try {
    const response = await fetch("/api/notes");

    if (!response.ok) {
      throw new Error("Could not load notes.");
    }

    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error(error);
    alert("Notes could not be loaded. Please make sure the server is running.");
  }
}

async function deleteNote(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error("Could not delete note.");
    }

    notes = notes.filter((note) => note._id !== noteId);
    renderNotes();
  } catch (error) {
    console.error(error);
    alert("The note could not be deleted. Please try again.");
  }
}

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(noteForm);
  const newNote = {
    title: formData.get("title").trim(),
    category: formData.get("category"),
    content: formData.get("content").trim(),
  };

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    });

    if (!response.ok) {
      throw new Error("Could not save note.");
    }

    notes.unshift(await response.json());
    renderNotes();
    hideForm();
  } catch (error) {
    console.error(error);
    alert("The note could not be saved. Please try again.");
  }
});

document.querySelector("#new-note-button").addEventListener("click", showForm);
document.querySelector("#empty-new-note-button").addEventListener("click", showForm);
document.querySelector("#cancel-button").addEventListener("click", hideForm);
document.querySelector("#close-form-button").addEventListener("click", hideForm);

loadNotes();
