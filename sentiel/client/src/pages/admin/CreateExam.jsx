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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      return [...prev, studentId];
    });
  };

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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4ef]">
        <p className="text-gray-500">Loading students...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/exams")}
            className="mb-5 text-sm font-semibold text-[#568253] transition hover:underline"
          >
            ← Back to Exams
          </button>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#568253]">
            Sentinel Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717]">
            Create Exam
          </h1>

          <p className="mt-2 text-black/50">
            Organize your monthly exam and select the students
            who will participate.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic information */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#568253]">
                Exam information
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Basic Details
              </h2>
            </div>

            <div className="space-y-5">

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Exam title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="September Monthly Exam"
                  required
                  className="w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#568253] focus:bg-white focus:ring-2 focus:ring-[#568253]/10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Monthly evaluation..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#568253] focus:bg-white focus:ring-2 focus:ring-[#568253]/10"
                />
              </div>

              {/* Topics */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Topics
                </label>

                <input
                  type="text"
                  name="topics"
                  value={form.topics}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Backend"
                  className="w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#568253] focus:bg-white focus:ring-2 focus:ring-[#568253]/10"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Separate topics with commas
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Exam date & time
                </label>

                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition focus:border-[#568253] focus:bg-white focus:ring-2 focus:ring-[#568253]/10"
                />
              </div>
            </div>
          </section>

          {/* Students */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#568253]">
                Participants
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Select Students
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose which students will see this exam.
              </p>
            </div>

            {students.length === 0 ? (
              <div className="rounded-2xl bg-[#f8f8f5] p-8 text-center">
                <p className="font-medium text-gray-600">
                  No students found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const selected = selectedStudents.includes(
                    student._id
                  );

                  return (
                    <label
                      key={student._id}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                        selected
                          ? "border-[#568253]/30 bg-[#f3f7f2]"
                          : "border-black/5 bg-[#fafaf8] hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleStudent(student._id)
                        }
                        className="h-5 w-5 accent-[#568253]"
                      />

                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3f4ef] font-bold text-[#568253]">
                          {student.profilePicture ? (
                            <img
                              src={`https://sentiel-app.onrender.com${student.profilePicture}`}
                              alt={student.fullname}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            student.fullname
                              ?.charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#171717]">
                            {student.fullname}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      {selected && (
                        <span className="rounded-full bg-[#568253] px-3 py-1 text-xs font-bold text-white">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bottom actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/exams")}
              className="rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#568253] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#79b176] hover:text-black hover:shadow-md"
            >
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateExam;