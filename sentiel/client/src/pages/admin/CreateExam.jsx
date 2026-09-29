import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const CreateExam = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    topics: "",
    date: "",
  });

  const [selectedStudents, setSelectedStudents] = useState([]);

  // სტუდენტების წამოღება
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/api/admin/students");
        setStudents(response.data);
      } catch (error) {
        console.error("FAILED TO FETCH STUDENTS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // input-ების შეცვლა
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // სტუდენტის არჩევა / მოხსნა
  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      return [...prev, studentId];
    });
  };

  // გამოცდის შექმნა
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      alert("Select at least one student");
      return;
    }

    try {
      const examData = {
        title: form.title,
        description: form.description,

        topics: form.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),

        date: form.date,

        students: selectedStudents,
      };

      await api.post("/api/exams", examData);

      alert("Exam created successfully!");

      navigate("/admin/exams");
    } catch (error) {
      console.error("CREATE EXAM ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create exam"
      );
    }
  };

  if (loading) {
    return <p>Loading students...</p>;
  }

  return (
    <div className="create-exam">

      <h1>Create Exam</h1>

      <form onSubmit={handleSubmit}>

        {/* BASIC INFO */}

        <div>
          <label>Exam title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="September Monthly Exam"
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Monthly evaluation..."
          />
        </div>

        <div>
          <label>Topics</label>

          <input
            type="text"
            name="topics"
            value={form.topics}
            onChange={handleChange}
            placeholder="JavaScript, React, Backend"
          />

          <small>
            Separate topics with commas
          </small>
        </div>

        {/* DATE */}

        <div>
          <label>Exam date & time</label>

          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* STUDENTS */}

        <div>
          <h2>Select students</h2>

          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            students.map((student) => (
              <label
                key={student._id}
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(
                    student._id
                  )}
                  onChange={() =>
                    toggleStudent(student._id)
                  }
                />

                {" "}

                {student.fullname} — {student.email}
              </label>
            ))
          )}
        </div>

        <br />

        <button type="submit">
          Create Exam
        </button>

      </form>
    </div>
  );
};

export default CreateExam;