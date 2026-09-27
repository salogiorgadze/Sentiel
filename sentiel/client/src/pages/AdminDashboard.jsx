import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStudents = async () => {
      try {
        const response = await api.get("/admin/students");
        setStudents(response.data);
      } catch (err) {
        console.log("GET STUDENTS ERROR:", err);
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    getStudents();
  }, []);

  if (loading) {
    return <h1>Students loading...</h1>;
  }
  return (
    <main className="min-h-screen bg-[#f3f4ef] p-6 md:p-10">
      {/* Header */}
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#568253]">
          Sentinel Admin
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Squad Dashboard
        </h1>

        <p className="mt-2 text-black/50">
          Manage your students and track their progress.
        </p>
      </header>

      {/* Stats */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 border border-black/10">
          <p className="text-sm text-black/50">Total Students</p>

          <h2 className="mt-2 text-3xl font-bold">{students.length}</h2>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-black/10">
          <p className="text-sm text-black/50">Active Students</p>

          <h2 className="mt-2 text-3xl font-bold">{students.length}</h2>
        </div>

        <div className="rounded-2xl bg-[#568253] text-white p-6">
          <p className="text-sm text-white/50">Squad</p>

          <h2 className="mt-2 text-3xl font-bold">Sally's Squad</h2>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold">Students</h2>

            <p className="text-sm text-black/50 mt-1">
              Select a student to manage their progress.
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-white p-10 text-center">
            <h3 className="font-semibold text-lg">No students yet</h3>

            <p className="text-black/50 mt-2">
              Students will appear here after they register.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f3f4ef] font-bold text-[#568253]">
                    {student.profilePicture ? (
                      <img
                        src={`https://sentiel-app.onrender.com${student.profilePicture}`}
                        alt={student.fullname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      student.fullname?.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold">{student.fullname}</h3>

                    <p className="text-sm text-black/50">{student.email}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => navigate(`/admin/students/${student._id}`)}
                    className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#79b176] hover:text-black"
                  >
                    View Student
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
