import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      const response = await api.get("/api/exams");
      setExams(response.data);
    } catch (error) {
      console.error("FAILED TO FETCH EXAMS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/exams/${examId}`);

      setExams((prev) =>
        prev.filter((exam) => exam._id !== examId)
      );
    } catch (error) {
      console.error("DELETE EXAM ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete exam"
      );
    }
  };

  if (loading) {
    return <p>Loading exams...</p>;
  }

  return (
    <div className="exams-page">
      <div className="exams-header">
        <div>
          <h1>Exams</h1>
          <p>Manage monthly exams and student results.</p>
        </div>

        <button onClick={() => navigate("/admin/exams/create")}>
          + Create Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div>
          <p>No exams created yet.</p>

          <button
            onClick={() => navigate("/admin/exams/create")}
          >
            Create your first exam
          </button>
        </div>
      ) : (
        <div className="exams-list">
          {exams.map((exam) => {
            const examDate = new Date(exam.date);
            const isPast = examDate < new Date();

            return (
              <div className="exam-card" key={exam._id}>
                <div>
                  <h2>{exam.title}</h2>

                  {exam.description && (
                    <p>{exam.description}</p>
                  )}

                  <p>
                    <strong>Date:</strong>{" "}
                    {examDate.toLocaleString()}
                  </p>

                  <p>
                    <strong>Students:</strong>{" "}
                    {exam.students?.length || 0}
                  </p>

                  {exam.topics?.length > 0 && (
                    <div>
                      <strong>Topics:</strong>

                      <div>
                        {exam.topics.map((topic, index) => (
                          <span key={index}>
                            {topic}
                            {index < exam.topics.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p>
                    <strong>Status:</strong>{" "}
                    {isPast ? "Completed" : "Upcoming"}
                  </p>
                </div>

                <div className="exam-actions">
                  <button
                    onClick={() =>
                      navigate(`/admin/exams/${exam._id}`)
                    }
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/exams/${exam._id}/edit`
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(exam._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Exams;