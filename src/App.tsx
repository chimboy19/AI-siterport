import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from './firebase'
import LandingPage from './pages/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import ReportEditorPage from './pages/ReportEditorPage'
import CreateReportPage from './pages/CreateReportPage'
import ProjectPage from './pages/ProjectPage'
import ProjectsListPage from './pages/ProjectsListPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import LoadingSpinner from './components/LoadingSpinner'
import { Toaster } from 'react-hot-toast'
import './App.css'

function LanguageRedirect() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const lang = navigator.language.startsWith("ja") || navigator.language.startsWith("jp")? "jp": "en";
    if (user) {
      navigate(`/${lang}/dashboard`, { replace: true });
    } else {
      navigate(`/${lang}`, { replace: true });
    }
  }, [user, navigate]);

  return null;
}

function App() {
  const [, loading] = useAuthState(auth)
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LanguageRedirect />} />
          <Route path="/:lang">
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route path="projects" element={
            <ProtectedRoute>
              <Layout>
                <ProjectsListPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="project/:projectId" element={
            <ProtectedRoute>
              <Layout>
                <ProjectPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="project/:projectId/create-report" element={
            <ProtectedRoute>
              <Layout>
                <CreateReportPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="report/:reportId" element={
            <ProtectedRoute>
              <Layout>
                <ReportEditorPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="search" element={
            <ProtectedRoute>
              <Layout>
                <SearchPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          </Route>

          <Route path="*" element={<LanguageRedirect />} />
        </Routes>
      </Router>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App
