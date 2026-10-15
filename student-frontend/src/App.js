
import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/students';

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    course: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Fetch failed');
      setStudents(await response.json());
    } catch (error) {
      setMessage('Could not connect to backend. Check Spring Boot.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      if (!response.ok) throw new Error('Save failed');

      setForm({ name: '', email: '', course: '' });
      setEditingId(null);
      setMessage(
        isEditing
          ? 'Student updated successfully!'
          : 'Student added successfully!'
      );
      await fetchStudents();
    } catch (error) {
      setMessage('Could not save student. Check backend and CORS.');
    }
  };

  const handleEdit = (student) => {
    setForm({
      name: student.name || '',
      email: student.email || '',
      course: student.course || ''
    });
    setEditingId(student.id);
    setMessage('');
    setActivePage('Students');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');

      setMessage('Student deleted successfully!');
      await fetchStudents();
    } catch (error) {
      setMessage('Could not delete student. Check the backend.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', course: '' });
    setMessage('');
  };

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    return (
      (student.name || '').toLowerCase().includes(query) ||
      (student.email || '').toLowerCase().includes(query) ||
      (student.course || '').toLowerCase().includes(query) ||
      String(student.id).includes(query)
    );
  });

  const navItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Students', icon: '♙' },
    { name: 'Settings', icon: '⚙' }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>StudentHub</strong>
            <span>MANAGEMENT PORTAL</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => {
                setActivePage(item.name);
                if (item.name === 'Students') {
                  document.getElementById('student-records')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                } else if (item.name === 'Dashboard') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setMessage('Settings are not configured yet.');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === 'Students' && (
                <span className="nav-count">{students.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">?</div>
          <strong>StudentHub Portal</strong>
          <p>Manage your student records in one place.</p>
          <span className="sidebar-version">React · Spring Boot · MySQL</span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="welcome-tag">OVERVIEW</span>
              <h1>Welcome to your dashboard</h1>
              <p>Here's what's happening with your student records today.</p>
            </div>
            <div className="welcome-illustration" aria-hidden="true">
              <div className="illustration-circle">♙</div>
              <div className="illustration-dot dot-one" />
              <div className="illustration-dot dot-two" />
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon stat-purple">♙</div>
              <div className="stat-details">
                <span>Total Students</span>
                <strong>{students.length}</strong>
                <small>Registered student records</small>
              </div>
              <span className="stat-decoration">01</span>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-blue">✓</div>
              <div className="stat-details">
                <span>Backend Status</span>
                <strong className="ready-text">
                  {loading ? 'Loading' : 'Connected'}
                </strong>
                <small>Student service status</small>
              </div>
              <span className="status-dot" />
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-orange">⌕</div>
              <div className="stat-details">
                <span>Search Results</span>
                <strong>{filteredStudents.length}</strong>
                <small>Matching student records</small>
              </div>
              <span className="stat-decoration">03</span>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel form-panel">
              <div className="panel-heading">
                <div className="panel-title-icon">＋</div>
                <div>
                  <h2>{editingId !== null ? 'Edit Student' : 'Add New Student'}</h2>
                  <p>
                    {editingId !== null
                      ? 'Update the student details.'
                      : 'Fill in the details to register a student.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter student name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="course">Course Name</label>
                <input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="e.g. Full Stack Development"
                  value={form.course}
                  onChange={handleChange}
                  required
                />

                <button className="submit-button" type="submit">
                  {editingId !== null ? '✓  Save Changes' : '+  Add Student'}
                </button>

                {editingId !== null && (
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancel Editing
                  </button>
                )}
              </form>

              {message && (
                <p
                  role="status"
                  className={`message ${
                    message.toLowerCase().includes('successfully')
                      ? 'success-message'
                      : 'error-message'
                  }`}
                >
                  {message.toLowerCase().includes('successfully') ? '✓ ' : 'ⓘ '}
                  {message}
                </p>
              )}

              <div className="form-tip">
                <span>ⓘ</span>
                All fields are required to save a student record.
              </div>
            </article>

            <article className="panel records-panel" id="student-records">
              <div className="records-header">
                <div>
                  <span className="panel-eyebrow">DATABASE OVERVIEW</span>
                  <h2>Student Records</h2>
                  <p>View, search and manage your registered students.</p>
                </div>
                <span className="total-pill">
                  {students.length} {students.length === 1 ? 'student' : 'students'}
                </span>
              </div>

              <div className="search-control">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  aria-label="Search student records"
                  placeholder="Search students by name, email, course or ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Email Address</th>
                      <th>Course</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          Loading student records...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <strong>
                            {students.length === 0
                              ? 'No students added yet'
                              : 'No matching records'}
                          </strong>
                          <p>
                            {students.length === 0
                              ? 'Add a student using the form.'
                              : 'Try searching for a different term.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <span className="id-badge">#{student.id}</span>
                          </td>
                          <td>
                            <div className="student-cell">
                              <span className="student-avatar">
                                {(student.name || '?').charAt(0).toUpperCase()}
                              </span>
                              <strong>{student.name}</strong>
                            </div>
                          </td>
                          <td className="email-cell">{student.email}</td>
                          <td>
                            <span className="course-tag">
                              {student.course || '-'}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => handleEdit(student)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => handleDelete(student.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing <strong>{filteredStudents.length}</strong> of{' '}
                  <strong>{students.length}</strong> records
                </span>
                <span className="live-indicator">
                  <span /> Live data
                </span>
              </div>
            </article>
          </section>

          <footer className="page-footer">
            <span>© StudentHub Management Portal</span>
            <span>Built with React, Spring Boot &amp; MySQL</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
