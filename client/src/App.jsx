import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { QuickActions } from "./components/QuickActions";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrgPage } from "./pages/OrgPage";
import { PeoplePage } from "./pages/PeoplePage";
import { LifecyclePage } from "./pages/LifecyclePage";
import { WorkPage } from "./pages/WorkPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { LeavesPage } from "./pages/LeavesPage";
import { PerformancePage } from "./pages/PerformancePage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./store/auth";

function Guard({ children, roles }) {
  const user = useAuth((s) => s.user);
  if (roles && !roles.includes(user?.role)) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="directory/:id" element={<ProfilePage />} />
          <Route path="org" element={<Guard roles={["admin"]}><OrgPage /></Guard>} />
          <Route path="people" element={<Guard roles={["admin"]}><PeoplePage /></Guard>} />
          <Route path="lifecycle" element={<Guard roles={["admin"]}><LifecyclePage /></Guard>} />
          <Route path="work" element={<WorkPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reviews" element={<Guard roles={["admin", "team_leader"]}><ReviewsPage /></Guard>} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <QuickActions />
    </>
  );
}
