import React from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProfile from "./pages/StudentProfile";
import Ranking from "./pages/Ranking";
import CreateExam from "./pages/admin/CreateExam";
import { ToastContainer } from "react-toastify";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute role="admin">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <Ranking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/exams/create" element={<CreateExam />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;
