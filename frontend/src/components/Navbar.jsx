import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCheckSquare, FiGrid, FiList, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <FiCheckSquare className="brand-icon" />
                    <span>QuickTask</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        <FiGrid />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/tasks"
                        className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
                    >
                        <FiList />
                        <span>Tasks</span>
                    </Link>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <FiUser />
                        <span>{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout" title="Logout">
                        <FiLogOut />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
