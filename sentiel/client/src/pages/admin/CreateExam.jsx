import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateExam = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    topics: "",
    startDate: "",
    endDate: "",
    duration: 60,
    maxScore: 100,
  });

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "text",
      options: [],
      correctAnswer: "",
      points: 1,
    },
  ]);

  // სტუდენტების წამოღება
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/api/admin/students");

        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // ჩვეულებრივი input-ების შეცვლა
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // სტუდენტის არჩევა/მოხსნა
  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      return [...prev, studentId];
    });
  };

  // კითხვის შეცვლა
  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === index
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  };

  // ახალი კითხვის დამატება
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        type: "text",
        options: [],
        correctAnswer: "",
        points: 1,
      },
    ]);
  };

  // კითხვის წაშლა
  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // გამოცდის შექმნა
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const examData = {
        ...form,

        topics: form.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),

        duration: Number(form.duration),
        maxScore: Number(form.maxScore),

        students: selectedStudents,

        questions: questions.map((question) => ({
          ...question,
          points: Number(question.points),
        })),
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
            placeholder="September JavaScript Exam"
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Exam description..."
          />
        </div>

        <div>
          <label>Topics</label>

          <input
            type="text"
            name="topics"
            value={form.topics}
            onChange={handleChange}
            placeholder="JavaScript, React, CSS"
          />

          <small>
            Separate topics with commas
          </small>
        </div>

        {/* DATES */}

        <div>
          <label>Start date</label>

          <input
            type="datetime-local"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>End date</label>

          <input
            type="datetime-local"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Duration (minutes)</label>

          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Maximum score</label>

          <input
            type="number"
            name="maxScore"
            value={form.maxScore}
            onChange={handleChange}
            min="1"
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

        {/* QUESTIONS */}

        <div>
          <h2>Questions</h2>

          {questions.map((question, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
              }}
            >
              <h3>Question {index + 1}</h3>

              <textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "question",
                    e.target.value
                  )
                }
                placeholder="Write the question..."
                required
              />

              <select
                value={question.type}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "type",
                    e.target.value
                  )
                }
              >
                <option value="text">
                  Text answer
                </option>

                <option value="multiple-choice">
                  Multiple choice
                </option>
              </select>

              {question.type === "multiple-choice" && (
                <div>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3..."
                    value={question.options.join(", ")}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "options",
                        e.target.value
                          .split(",")
                          .map((option) => option.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </div>
              )}

              <input
                type="text"
                placeholder="Correct answer"
                value={question.correctAnswer}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "correctAnswer",
                    e.target.value
                  )
                }
                required
              />

              <input
                type="number"
                min="1"
                placeholder="Points"
                value={question.points}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "points",
                    e.target.value
                  )
                }
              />

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                >
                  Remove question
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
          >
            + Add question
          </button>
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