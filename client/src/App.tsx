import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import React, { Suspense, lazy } from 'react';
import Header from './components/Header';

const Landing = lazy(() => import('./components/Landing'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const NotesContainer = lazy(() => import('./components/notes/NotesContainer'));
const NoteEditor = lazy(() => import('./components/notes/NoteEditor'));
const EditNote = lazy(() => import('./components/notes/EditNote'));
const TestShare = lazy(() => import('./components/TestShare'));

const App = () => {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Header />
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <NotesContainer />
                   </ProtectedRoute>
                }
              />
              <Route
                path="/notes/new"
                element={
                  <ProtectedRoute>
                    <NoteEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:id"
                element={
                  <ProtectedRoute>
                    <EditNote />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-share"
                element={
                  <ProtectedRoute>
                    <TestShare />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
