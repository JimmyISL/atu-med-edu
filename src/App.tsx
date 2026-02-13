import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './auth'
import { AppLayout } from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/dashboard/Dashboard'
import PeopleList from './pages/hr/PeopleList'
import PersonDetail from './pages/hr/PersonDetail'
import CoursesList from './pages/courses/CoursesList'
import CourseDetail from './pages/courses/CourseDetail'
import MeetingsList from './pages/meetings/MeetingsList'
import MeetingDetail from './pages/meetings/MeetingDetail'
import ActivitiesList from './pages/cme/ActivitiesList'
import ActivityDetail from './pages/cme/ActivityDetail'
import Transcript from './pages/cme/Transcript'
import TemplateLibrary from './pages/credentials/TemplateLibrary'
import Distribution from './pages/credentials/Distribution'
import CertificatePreview from './pages/credentials/CertificatePreview'
import Settings from './pages/settings/Settings'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
          <Route path="/forgot-password" element={<RedirectIfAuth><ForgotPassword /></RedirectIfAuth>} />

          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hr" element={<PeopleList />} />
            <Route path="/hr/:id" element={<PersonDetail />} />
            <Route path="/courses" element={<CoursesList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/meetings" element={<MeetingsList />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/cme" element={<ActivitiesList />} />
            <Route path="/cme/:id" element={<ActivityDetail />} />
            <Route path="/cme/transcript" element={<Transcript />} />
            <Route path="/credentials" element={<TemplateLibrary />} />
            <Route path="/credentials/distribution" element={<Distribution />} />
            <Route path="/credentials/preview" element={<CertificatePreview />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
