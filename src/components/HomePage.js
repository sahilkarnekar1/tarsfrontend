import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import "../App.css"

const HomePage = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [editNote, setEditNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [loading, setloading] = useState(false);
  const chunksRef = useRef([]);


// Speech recognition setup
const recognitionRef = useRef(
  new (window.SpeechRecognition || window.webkitSpeechRecognition)()
);

recognitionRef.current.continuous = true;
recognitionRef.current.interimResults = true;
recognitionRef.current.lang = "en-US";

recognitionRef.current.onresult = (event) => {
  let transcript = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript + " ";
  }
  setNewNote(transcript);
};

recognitionRef.current.onerror = (event) => {
  console.error("Speech Recognition Error:", event);
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
    recognitionRef.current.start();
    setIsRecording(true);
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
  }
  recognitionRef.current.stop();
  setIsRecording(false);
};
console.log(audioBlob);


  // Fetch all notes from API
  const fetchNotes = async () => {
    setloading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notes`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }finally{
      setloading(false);
    }
  };

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
  
    setloading(true);
    const formData = new FormData();
    if (audioBlob !== null) {
      formData.append("audio", audioBlob, "recording.webm");
    }
    formData.append("title", newNoteTitle);
    formData.append("content", newNote);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notes/add`, formData, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data", // Ensure correct content type
        },
      });
  
      setNotes([...notes, response.data]); // Add new note to state
      setNewNote(""); // Clear input
      setNewNoteTitle(""); // Clear input
     setAudioBlob(null);
      fetchNotes();
    } catch (err) {
      console.error("Error adding note:", err);
    }finally{
      setloading(false);
    }
  };
  console.log(notes);
  

  // Open Edit Modal
  const handleEditClick = (note) => {
    setEditNote(note);
    setIsModalOpen(true);
  };

  // Handle Update Note
  const handleUpdateNote = async () => {
    if (!editNote.title.trim() || !editNote.content.trim()) return;
setloading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/notes/update/${editNote._id}`,
        {
          title: editNote.title,
          content: editNote.content,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      setIsModalOpen(false);
      fetchNotes(); // Refresh list after update
    } catch (err) {
      console.error("Error updating note:", err);
    }finally{
      setloading(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    setloading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/notes/delete/${id}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      setNotes(notes.filter((note) => note._id !== id)); // Remove from state
    } catch (err) {
      console.error("Error deleting note:", err);
    }finally{
      setloading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (


    <>

{
  loading && (
    <>
    <div className="loadercssstyle">
     <ClipLoader />
     </div>
    </>
   
  )
}

     <div style={styles.container}>
      <h2>My Notes</h2>

      {/* Add Note Section */}
      <div style={styles.addNoteSection}>
      <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="Enter a Title..."
          style={styles.input}
        />
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter a new note..."
          style={styles.input}
        />
        <button onClick={handleAddNote} style={styles.addButton} disabled={isRecording}>
          Add Note
        </button>
        <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      </div>

      {/* Notes List */}
      <ul style={styles.noteList}>
  {notes.map((note) => (
    <li key={note._id} style={styles.noteItem}>
      <span>{note.title}</span>
      <span>{note.content}</span>

      {/* Audio Player */}
      {note.audioPath && (
        <audio controls>
          <source src={note.audioPath} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Action Buttons */}
      <div>
        <button onClick={() => handleEditClick(note)} style={styles.editButton}>
          Edit
        </button>
        <button onClick={() => handleDeleteNote(note._id)} style={styles.deleteButton}>
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>


      {/* Edit Note Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Note</h3>
            <input
              type="text"
              value={editNote?.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              placeholder="Enter title..."
              style={styles.input}
            />
            <textarea
              value={editNote?.content}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
              placeholder="Enter content..."
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={handleUpdateNote} style={styles.saveButton}>
                Save
              </button>
              <button onClick={() => setIsModalOpen(false)} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>

   
  );
};

// Inline Styles
const styles = {
  container: { maxWidth: "600px", margin: "20px auto", textAlign: "center" },
  addNoteSection: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: { flex: 1, padding: "8px", fontSize: "16px" },
  textarea: { width: "100%", height: "100px", padding: "8px", fontSize: "16px" },
  addButton: { padding: "8px 12px", background: "green", color: "#fff", border: "none", cursor: "pointer" },
  noteList: { listStyle: "none", padding: 0 },
  noteItem: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" },
  editButton: { background: "blue", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" },
  deleteButton: { background: "red", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
  },
  modalActions: { marginTop: "10px", display: "flex", justifyContent: "space-between" },
  saveButton: { background: "purple", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer" },
  cancelButton: { background: "gray", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer" },
};

export default HomePage;
