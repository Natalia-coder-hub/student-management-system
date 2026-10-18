import { useEffect, useState } from "react";
import "./App.css";

// A reusable component: App sends its title and number through props.
function SummaryCard({ title, number, colour }) {
  return (
    <div className={`summary-card ${colour}`}>
      <h3>{title}</h3>
      <p>{number}</p>
    </div>
  );
}

const emptyStudent = {
  id: "",
  fullName: "",
  age: "",
  email: "",
  course: "",
  enrolled: "true",
};

function App() {
  // Student records are objects stored in an array.
  const [students, setStudents] = useState(() => {
    try {
      const savedStudents = localStorage.getItem("students");
      return savedStudents ? JSON.parse(savedStudents) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ ...emptyStudent });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Keep records after a browser refresh.
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const enrolledCount = students.filter((student) => student.enrolled).length;
  const notEnrolledCount = students.length - enrolledCount;

  const openAddForm = () => {
    setForm({ ...emptyStudent });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setForm({
      id: student.id,
      fullName: student.fullName,
      age: String(student.age),
      email: student.email,
      course: student.course,
      enrolled: String(student.enrolled),
    });
    setEditingId(student.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStudent });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
    setError("");
  };

  const validateStudent = () => {
    if (
      !form.id.trim() ||
      !form.fullName.trim() ||
      !form.age.trim() ||
      !form.email.trim() ||
      !form.course.trim()
    ) {
      return "Please complete every field.";
    }

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 16 || age > 100) {
      return "Age must be a whole number between 16 and 100.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    const duplicateId = students.some(
      (student) =>
        student.id.toLowerCase() === form.id.trim().toLowerCase() &&
        student.id !== editingId
    );

    if (duplicateId) {
      return "That student ID is already being used.";
    }

    return "";
  };

  const saveStudent = (event) => {
    event.preventDefault();

    const validationMessage = validateStudent();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const studentData = {
      id: form.id.trim(),
      fullName: form.fullName.trim(),
      age: Number(form.age),
      email: form.email.trim(),
      course: form.course.trim(),
      enrolled: form.enrolled === "true",
    };

    if (editingId !== null) {
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === editingId ? studentData : student
        )
      );
      setNotice("Student details updated.");
    } else {
      setStudents((currentStudents) => [...currentStudents, studentData]);
      setNotice("Student added successfully.");
    }

    closeForm();
  };

  const deleteStudent = () => {
    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== deleteId)
    );
    setDeleteId(null);
    setNotice("Student record deleted.");
  };

  const filteredStudents = students.filter((student) => {
    const searchText = search.trim().toLowerCase();
    return (
      student.id.toLowerCase().includes(searchText) ||
      student.fullName.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      student.course.toLowerCase().includes(searchText)
    );
  });

  // let is used here because the value is reassigned as initials are added.
  const getInitials = (fullName) => {
    const words = fullName.trim().split(/\s+/);
    let initials = "";

    for (let index = 0; index < words.length && index < 2; index += 1) {
      initials += words[index].charAt(0).toUpperCase();
    }

    return initials || "?";
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-decoration" aria-hidden="true">✦</div>
        <div className="header-content">
          <h1>Student Records</h1>
          <p className="header-subtitle">
            A simple way to manage student information
          </p>
        </div>
        <button className="add-button" onClick={openAddForm}>
          <span aria-hidden="true">＋</span> Add Student
        </button>
      </header>

      <main className="container">
        <section className="welcome">
          <div className="welcome-mark" aria-hidden="true">✎</div>
          <div>
            <p className="small-label purple-label">YOUR STUDENT DIRECTORY</p>
            <h2>Welcome to the Student Management System</h2>
            <p>Keep student details together and easy to find.</p>
          </div>
        </section>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button className="notice-close" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
          </div>
        )}

        <section className="summary" aria-label="Student totals">
          <SummaryCard title="Total Students" number={students.length} colour="card-lilac" />
          <SummaryCard title="Enrolled Students" number={enrolledCount} colour="card-peach" />
          <SummaryCard title="Not Enrolled" number={notEnrolledCount} colour="card-green" />
        </section>

        <section className="records">
          <div className="records-heading">
            <div>
              <p className="small-label purple-label">THE DIRECTORY</p>
              <h2>Student List <span className="count-pill">{students.length}</span></h2>
              <p>Search, update or remove a student record.</p>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search by name, ID, email or course"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search students"
              />
            </label>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty">
                      <span className="empty-icon" aria-hidden="true">✧</span>
                      <strong>{search ? "No matching students" : "No students added yet"}</strong>
                      <p>{search ? "Try another search." : "Select Add Student to create your first record."}</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="student-id">{student.id}</td>
                      <td>
                        <div className="student-name">
                          <span className="avatar">{getInitials(student.fullName)}</span>
                          <span>{student.fullName}</span>
                        </div>
                      </td>
                      <td>{student.age}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>
                        <span className={`status ${student.enrolled ? "status-enrolled" : "status-not-enrolled"}`}>
                          {student.enrolled ? "Enrolled" : "Not enrolled"}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="edit-button" onClick={() => openEditForm(student)}>Edit</button>
                        <button className="delete-button" onClick={() => setDeleteId(student.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <span className="footer-note">Small steps, organised records. ✦</span>
          </div>
        </section>

        
      </main>

      {showForm && (
        <div className="overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-top">
              <span className="modal-icon" aria-hidden="true">✎</span>
              <button className="close-button" type="button" onClick={closeForm} aria-label="Close form">×</button>
            </div>
            <p className="small-label purple-label">{editingId !== null ? "MAKE A CHANGE" : "ADD TO THE DIRECTORY"}</p>
            <h2 id="form-title">{editingId !== null ? "Edit student" : "Add a student"}</h2>
            <p className="modal-description">Enter the student's information below.</p>

            <form onSubmit={saveStudent} noValidate>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="student-id">Student ID *</label>
                  <input id="student-id" name="id" value={form.id} onChange={handleChange} disabled={editingId !== null} required />
                </div>
                <div className="form-field">
                  <label htmlFor="student-name">Full Name *</label>
                  <input id="student-name" name="fullName" value={form.fullName} onChange={handleChange} required />
                </div>
                <div className="form-field">
                  <label htmlFor="student-age">Age *</label>
                  <input id="student-age" name="age" type="number" min="16" max="100" step="1" value={form.age} onChange={handleChange} required />
                </div>
                <div className="form-field">
                  <label htmlFor="student-email">Email Address *</label>
                  <input id="student-email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-field full-field">
                  <label htmlFor="student-course">Course of Study *</label>
                  <input id="student-course" name="course" value={form.course} onChange={handleChange} required />
                </div>
                <div className="form-field full-field">
                  <label htmlFor="student-status">Enrollment Status</label>
                  <select id="student-status" name="enrolled" value={form.enrolled} onChange={handleChange}>
                    <option value="true">Enrolled</option>
                    <option value="false">Not enrolled</option>
                  </select>
                </div>
              </div>

              {error && <p className="error" role="alert">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeForm}>Cancel</button>
                <button type="submit" className="save-button">{editingId !== null ? "Update Student" : "Save Student"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteId !== null && (
        <div className="overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleteId(null);
        }}>
          <section className="modal delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-top">
              <span className="delete-modal-icon" aria-hidden="true">!</span>
              <button className="close-button" type="button" onClick={() => setDeleteId(null)} aria-label="Close confirmation">×</button>
            </div>
            <h2 id="delete-title">Delete this student?</h2>
            <p className="modal-description">This will remove the record from your student list. You cannot undo this action.</p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setDeleteId(null)}>Keep Student</button>
              <button className="delete-button" onClick={deleteStudent}>Yes, Delete</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
