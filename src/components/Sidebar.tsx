import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.svg";
import { Users, Search } from "lucide-react";

export default function Sidebar() {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Toggle Button */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle sidebar"
            >
                {isMobileOpen ? (
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
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
