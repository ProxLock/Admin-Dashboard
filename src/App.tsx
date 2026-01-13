import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "./lib/api";
import Sidebar from "./components/Sidebar";
import UsersPage from "./pages/UsersPage";

// Admin Guard Component
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken({ template: "default" });
        setAuthToken(token);

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
        <div className="error-message">
          Unauthorized: You do not have admin access.
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
