import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.svg";
import { Users, LayoutDashboard, Search } from "lucide-react";

export default function Sidebar() {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle sidebar"
            >
                {isMobileOpen ? (
                    <span>X</span> // Icons handled by CSS or SVG usually
                ) : (
                    <span>Menu</span>
                )}
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo-link" onClick={() => setIsMobileOpen(false)}>
                        <img src={logo} alt="ProxLock Logo" className="sidebar-logo-icon" />
                        <h1 className="sidebar-logo">Admin</h1>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/users"
                        className={`sidebar-nav-item ${isActive("/users") || isActive("/") ? "active" : ""}`}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <Users size={20} />
                        <span>Users</span>
                    </Link>

                    <Link
                        to="/lookup"
                        className={`sidebar-nav-item ${isActive("/lookup") ? "active" : ""}`}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <Search size={20} />
                        <span>Lookup</span>
                    </Link>

                    {/* Add more admin links here later */}

                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user-button">
                        <UserButton showName={false} />
                    </div>

                    <div className="sidebar-footer">
                        <p className="sidebar-footer-text">© 2026 PROXLOCK</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
