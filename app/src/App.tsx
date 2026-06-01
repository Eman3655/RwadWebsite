import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonView from "./pages/LessonView";
import QuizPage from "./pages/QuizPage";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminLessons from "./pages/AdminLessons";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminStudents from "./pages/AdminStudents";
import NotFound from "./pages/NotFound";
import Certificates from "./pages/Certificates";
import AdminCertificates from "./pages/AdminCertificates";
import StudentDashboard from "./pages/StudentDashboard";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/lessons/:id" element={<LessonView />} />
      <Route path="/quizzes/:id" element={<QuizPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/courses" element={<AdminCourses />} />
      <Route path="/dashboard/lessons" element={<AdminLessons />} />
      <Route path="/dashboard/quizzes" element={<AdminQuizzes />} />
      <Route path="/dashboard/students" element={<AdminStudents />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/dashboard/certificates" element={<AdminCertificates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
