import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useClerk } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./lib/api";
import Sidebar from "./components/Sidebar";
import UsersPage from "./pages/UsersPage";
import LookupPage from "./pages/LookupPage";

// Admin Guard Component
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        // Token is now handled by interceptor in api.ts
        const res = await api.get('/me');
        if (res.data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Failed to verify admin status", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="layout-shell">
        <div className="hero-title">Loading ProxLock Admin...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="error-state">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '500px' }}>
          <div className="error-message" style={{ width: '100%', boxSizing: 'border-box' }}>
            Unauthorized: You do not have admin access.
          </div>
          <button
            onClick={() => signOut()}
            style={{
              alignSelf: 'flex-start',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--btn-secondary-bg)',
              border: '1px solid var(--btn-secondary-border)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/lookup" element={<LookupPage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <AdminGuard>
          <Layout />
        </AdminGuard>
      </SignedIn>
    </>
  )
}

export default App
