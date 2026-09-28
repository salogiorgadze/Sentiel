import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {io} from 'socket.io-client';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);


  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    note: "",
  });

  const [projectForm, setProjectForm] = useState({
    title: "",
    score: "",
  });

  useEffect(() => {
    const getStudent = async () => {
      try {
        const [studentResponse, projectsResponse] = await Promise.all([
          api.get(`/api/admin/students/${studentId}`),
          api.get(`/api/student-projects/student/${studentId}`),
        ]);

        setStudent(studentResponse.data.student);
        setTasks(studentResponse.data.tasks);
        setProjects(projectsResponse.data);
      } catch (err) {
        console.log("GET STUDENT ERROR:", err);
        console.log("DATA:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    getStudent();
  }, [studentId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        `/admin/students/${studentId}/tasks`,
        form
      );

      setTasks((prev) => [response.data.task, ...prev]);

      setForm({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        note: "",
      });

      setShowForm(false);
    } catch (err) {
      console.log("ADD TASK ERROR:", err);
      console.log("DATA:", err.response?.data);
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await api.patch(
        `/admin/tasks/${taskId}/complete`
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? response.data.task : task
        )
      );
    } catch (err) {
      console.log("COMPLETE TASK ERROR:", err);
      console.log("DATA:", err.response?.data);
    }
  };

  // =========================
  // PROJECT FUNCTIONS
  // =========================

  const handleProjectChange = (e) => {
    setProjectForm({
      ...projectForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        `/api/student-projects/student/${studentId}`,
        {
          title: projectForm.title,
          score: Number(projectForm.score),
        }
      );

      setProjects((prev) => [
        response.data.project,
        ...prev,
      ]);

      setProjectForm({
        title: "",
        score: "",
      });

      setShowProjectForm(false);
    } catch (err) {
      console.log("ADD PROJECT ERROR:", err);
      console.log("DATA:", err.response?.data);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(
        `/api/student-projects/${projectId}`
      );

      setProjects((prev) =>
        prev.filter(
          (project) => project._id !== projectId
        )
      );
    } catch (err) {
      console.log("DELETE PROJECT ERROR:", err);
      console.log("DATA:", err.response?.data);
    }
  };

  const totalXP = projects.reduce(
    (sum, project) => sum + project.score,
    0
  );

  const averageScore =
    projects.length === 0
      ? 0
      : totalXP / projects.length;

  if (loading) {
    return <h1>Student loading...</h1>;
  }

  if (!student) {
    return <h1>Student not found</h1>;
  }


  return (
    <div className="min-h-screen bg-[#f3f4ef] p-8">

      <button
        onClick={() => navigate("/admin")}
        className="mb-6 rounded-lg bg-black px-4 py-2 text-white"
      >
        ← Back
      </button>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow">

        <h1 className="text-3xl font-bold">
          {student.fullname}
        </h1>

        <p className="mt-2 text-gray-500">
          {student.email}
        </p>

        <div className="mt-4">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            {student.role}
          </span>
        </div>

      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow">


        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Student Tasks
          </h2>

          <button
            className="rounded-lg bg-black px-4 py-2 text-white"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Task
          </button>

        </div>

        {showForm && (
          <form
            onSubmit={handleAddTask}
            className="mb-8 space-y-4 rounded-xl border border-black/10 p-5"
          >

            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />

            <textarea
              name="note"
              placeholder="Note"
              value={form.note}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />

            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Add Task
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        {tasks.length === 0 ? (
          <p className="text-gray-500">
            No tasks yet.
          </p>
        ) : (
          <div className="space-y-4">

            {tasks.map((task) => (

              <div
                key={task._id}
                className={`rounded-xl border p-5 ${
                  task.status === "completed"
                    ? "border-green-200 bg-green-50"
                    : "border-black/10 bg-white"
                }`}
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3 className="text-lg font-bold">
                      {task.title}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {task.description}
                    </p>

                  </div>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold">
                    {task.priority}
                  </span>

                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">

                  <span
                    className={`rounded-lg px-3 py-2 ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100"
                    }`}
                  >
                    Status: {task.status}
                  </span>

                  {task.deadline && (
                    <span className="rounded-lg bg-gray-100 px-3 py-2">
                      Deadline:{" "}
                      {new Date(
                        task.deadline
                      ).toLocaleDateString()}
                    </span>
                  )}

                </div>

                {task.note && (
                  <div className="mt-4 rounded-lg bg-[#f3f4ef] p-4">

                    <p className="text-sm font-semibold">
                      Note
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {task.note}
                    </p>

                  </div>
                )}


                {task.status !== "completed" && (
                  <button
                    onClick={() =>
                      completeTask(task._id)
                    }
                    className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Mark as completed
                  </button>
                )}

              </div>

            ))}

          </div>
        )}

      </div>


      <div className="rounded-2xl bg-white p-6 shadow">

   

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Projects
          </h2>

          <button
            onClick={() =>
              setShowProjectForm(!showProjectForm)
            }
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            + Add Project
          </button>

        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="rounded-xl bg-[#f3f4ef] p-5">

            <p className="text-sm text-gray-500">
              Average Score
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {averageScore.toFixed(1)}
            </h3>

          </div>

          <div className="rounded-xl bg-[#f3f4ef] p-5">

            <p className="text-sm text-gray-500">
              Total XP
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {totalXP}
            </h3>

          </div>

        </div>

        {/* ADD PROJECT FORM */}

        {showProjectForm && (
          <form
            onSubmit={handleAddProject}
            className="mb-8 space-y-4 rounded-xl border border-black/10 p-5"
          >

            <input
              type="text"
              name="title"
              placeholder="Project title"
              value={projectForm.title}
              onChange={handleProjectChange}
              required
              className="w-full rounded-lg border p-3"
            />

            <input
              type="number"
              name="score"
              placeholder="Score (0-100)"
              value={projectForm.score}
              onChange={handleProjectChange}
              min="0"
              max="100"
              required
              className="w-full rounded-lg border p-3"
            />

            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Add Project
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowProjectForm(false)
                }
                className="rounded-lg bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        {/* PROJECT LIST */}

        {projects.length === 0 ? (
          <p className="text-gray-500">
            No projects yet.
          </p>
        ) : (
          <div className="space-y-4">

            {projects.map((project) => (

              <div
                key={project._id}
                className="flex items-center justify-between rounded-xl border border-black/10 p-4"
              >

                <div>

                  <h3 className="font-semibold">
                    {project.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Score: {project.score}/100
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteProject(project._id)
                  }
                  className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default StudentProfile;