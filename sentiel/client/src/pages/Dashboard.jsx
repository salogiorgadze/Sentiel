import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import achievements from "../data/achievements";

const Dashboard = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data);
      } catch (err) {
        console.log("GET NOTIFICATIONS ERROR:", err);
      }
    };

    getNotifications();
  }, []);

  const unreadCount = notifications.filter(
  (notification) => !notification.isRead
).length;

const markAsRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  } catch (err) {
    console.log("MARK NOTIFICATION ERROR:", err);
  }
};

const markAllAsRead = async () => {
  try {
    await api.patch("/notifications/read-all");

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  } catch (err) {
    console.log("MARK ALL NOTIFICATIONS ERROR:", err);
  }
};

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const studentResponse = await api.get("/auth/me");

        const student = studentResponse.data;

        setStudent(student);

        const [tasksResponse, projectsResponse] = await Promise.all([
          api.get("/student/tasks"),
          api.get(`/student-projects/student/${student._id}`),
        ]);

        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
      } catch (err) {
        console.log("DASHBOARD ERROR:", err);
        console.log("DATA:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4ef]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4ef]">
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

  const totalXP = projects.reduce((sum, project) => sum + project.score, 0);

  const averageScore = projects.length === 0 ? 0 : totalXP / projects.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const pendingTasks = tasks.filter((task) => task.status === "pending").length;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      toast.success("Logged out successfully!");

      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };
  return (
    <main className="min-h-screen bg-[#f3f4ef] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#568253]">
              Student Portal
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717] md:text-5xl">
              {student.fullname}
            </h1>

            <p className="mt-3 max-w-xl text-gray-500">
              Keep track of your tasks, projects and overall progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ranking")}
              className="group flex w-fit items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-3 font-semibold text-[#171717] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4ef] text-[#568253]">
                #
              </span>

              <span>View Ranking</span>

              <span className="transition group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex w-40 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 font-semibold text-[#171717] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              View Profile
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-black/10 bg-white px-5 py-3 font-semibold text-gray-600 shadow-sm transition hover:bg-gray-100"
            >
              Log out
            </button>
            <div className="relative">
  <button
    onClick={() =>
      setShowNotifications((prev) => !prev)
    }
    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xl transition hover:bg-gray-50"
  >
    ♥︎

    {unreadCount > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#568253] px-1 text-[10px] font-bold text-white">
        {unreadCount}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <h3 className="font-bold">
          Notifications
        </h3>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-[#568253] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() =>
                !notification.isRead &&
                markAsRead(notification._id)
              }
              className={`w-full border-b border-black/5 px-4 py-4 text-left transition hover:bg-gray-50 ${
                !notification.isRead
                  ? "bg-[#f3f7f2]"
                  : "bg-white"
              }`}
            >
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#568253]" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#171717]">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-[10px] text-gray-400">
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )}
</div>
          </div>
          
        </header>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>

                <h2 className="mt-3 text-4xl font-bold text-[#171717]">
                  {tasks.length}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4ef] text-sm font-bold text-[#568253]">
                T
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">Assigned to you</p>
          </div>

          <div className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>

                <h2 className="mt-3 text-4xl font-bold text-[#171717]">
                  {pendingTasks}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-sm font-bold text-yellow-600">
                P
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">Tasks to complete</p>
          </div>
          <div className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>

                <h2 className="mt-3 text-4xl font-bold text-[#171717]">
                  {completedTasks}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-sm font-bold text-green-600">
                ✓
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">Finished tasks</p>
          </div>

          <div className="group rounded-2xl bg-[#568253] p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total XP</p>

                <h2 className="mt-3 text-4xl font-bold">{totalXP}</h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold">
                XP
              </div>
            </div>

            <p className="mt-4 text-xs text-white/60">Earned from projects</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#568253]">
                  Your work
                </p>

                <h2 className="mt-1 text-2xl font-bold">My Tasks</h2>
              </div>

              <span className="rounded-full bg-[#f3f4ef] px-3 py-1 text-xs font-semibold text-gray-600">
                {tasks.length} total
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-2xl bg-[#f8f8f5] p-8 text-center">
                <p className="font-medium text-gray-600">No tasks yet</p>

                <p className="mt-1 text-sm text-gray-400">
                  Your assigned tasks will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="group rounded-2xl border border-black/5 bg-[#fafaf8] p-5 transition hover:border-[#568253]/30 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#171717]">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold capitalize text-yellow-700">
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          task.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.status}
                      </span>

                      {task.deadline && (
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {task.note && (
                      <div className="mt-4 border-l-2 border-[#568253] pl-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Note
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {task.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-widest text-[#568253]">
                Your progress
              </p>

              <h2 className="mt-1 text-2xl font-bold">My Projects</h2>

              <p className="mt-1 text-sm text-gray-500">
                Your project scores and XP.
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f3f4ef] p-5">
                <p className="text-xs font-medium text-gray-500">
                  Average Score
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  {averageScore.toFixed(1)}
                </h3>

                <p className="mt-1 text-xs text-gray-400">out of 100</p>
              </div>

              <div className="rounded-2xl bg-[#568253] p-5 text-white">
                <p className="text-xs font-medium text-white/70">Total XP</p>

                <h3 className="mt-2 text-3xl font-bold">{totalXP}</h3>

                <p className="mt-1 text-xs text-white/60">from projects</p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-2xl bg-[#f8f8f5] p-6 text-center">
                <p className="font-medium text-gray-600">No projects yet</p>

                <p className="mt-1 text-sm text-gray-400">
                  Your project results will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#fafaf8] p-4 transition hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">Project</p>
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-lg font-bold">{project.score}</p>
                      <p className="text-xs text-gray-400">/ 100</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-widest text-[#568253]">
                Achievements
              </p>

              <h2 className="mt-1 text-2xl font-bold">Your achievements</h2>
            </div>

            {(student.achievements || []).length === 0 ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-gray-500">
                  No achievements yet. Keep working!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {(student.achievements || []).map((achievementId) => {
                  const achievement = achievements[achievementId];

                  if (!achievement) {
                    return null;
                  }

                  return (
                    <div
                      key={achievementId}
                      className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div>
                          <h3 className="font-bold">{achievement.title}</h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
