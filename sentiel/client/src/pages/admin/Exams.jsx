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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4ef]">
        <p className="text-gray-500">Loading exams...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#568253]">
              Sentinel Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717]">
              Exams
            </h1>

            <p className="mt-2 text-black/50">
              Manage monthly exams and student results.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/exams/create")}
            className="rounded-2xl bg-[#568253] px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#79b176] hover:text-black hover:shadow-md"
          >
            + Create Exam
          </button>
        </header>

        {/* Empty state */}
        {exams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f4ef] text-xl text-[#568253]">
              📅
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#171717]">
              No exams yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first monthly exam and assign it
              to your students.
            </p>

            <button
              onClick={() => navigate("/admin/exams/create")}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#568253]"
            >
              Create your first exam
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">

            {exams.map((exam) => {
              const examDate = new Date(exam.date);
              const isPast = examDate < new Date();

              return (
                <div
                  key={exam._id}
                  className="group rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#568253]">
                        Monthly Exam
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-[#171717]">
                        {exam.title}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        isPast
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {isPast ? "Completed" : "Upcoming"}
                    </span>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                      {exam.description}
                    </p>
                  )}

                  {/* Info */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-[#f8f8f5] px-4 py-3">
                      <span>📅</span>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Date
                        </p>

                        <p className="text-sm font-semibold text-[#171717]">
                          {examDate.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-[#f8f8f5] px-4 py-3">
                      <span>👥</span>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Students
                        </p>

                        <p className="text-sm font-semibold text-[#171717]">
                          {exam.students?.length || 0} students
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  {exam.topics?.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Topics
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {exam.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-[#f3f4ef] px-3 py-1.5 text-xs font-medium text-[#568253]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex gap-2 border-t border-black/5 pt-5">

                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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
    </main>
  );
};

export default Exams;