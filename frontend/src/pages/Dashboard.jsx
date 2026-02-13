import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { analyticsAPI } from '../api/axios';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiBarChart2,
    FiTrendingUp,
    FiList,
} from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [productivity, setProductivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch tasks from main API for basic stats
            const { data: tasks } = await API.get('/tasks');

            const total = tasks.length;
            const completed = tasks.filter((t) => t.status === 'Completed').length;
            const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
            const todo = tasks.filter((t) => t.status === 'Todo').length;
            const high = tasks.filter((t) => t.priority === 'High').length;
            const medium = tasks.filter((t) => t.priority === 'Medium').length;
            const low = tasks.filter((t) => t.priority === 'Low').length;
            const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

            setStats({
                totalTasks: total,
                completed,
                inProgress,
                todo,
                highPriority: high,
                mediumPriority: medium,
                lowPriority: low,
                completionRate,
            });

            // Try to fetch analytics from Python service
            try {
                if (user?._id) {
                    const { data: prodData } = await analyticsAPI.get(`/productivity/${user._id}?days=14`);
                    setProductivity(prodData);
                }
            } catch {
                // Python service might not be running
                console.log('Analytics service not available');
            }
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-screen">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    const priorityChartData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [
            {
                data: [
                    stats?.highPriority || 0,
                    stats?.mediumPriority || 0,
                    stats?.lowPriority || 0,
                ],
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77'],
                borderColor: ['#ff5252', '#ffc107', '#4caf50'],
                borderWidth: 2,
            },
        ],
    };

    const statusChartData = {
        labels: ['Todo', 'In Progress', 'Completed'],
        datasets: [
            {
                data: [stats?.todo || 0, stats?.inProgress || 0, stats?.completed || 0],
                backgroundColor: ['#748ffc', '#ffd43b', '#51cf66'],
                borderColor: ['#5c7cfa', '#fab005', '#40c057'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#c9d1d9', padding: 16, font: { size: 13 } },
            },
        },
    };

    const productivityChartData = productivity
        ? {
            labels: productivity.dailyData.slice(-14).map((d) =>
                new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
            ),
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: productivity.dailyData.slice(-14).map((d) => d.completed),
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    borderRadius: 6,
                },
            ],
        }
        : null;

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: {
                ticks: { color: '#8b949e', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
            y: {
                ticks: { color: '#8b949e', stepSize: 1 },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
        },
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name || 'User'}!</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <FiList />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.totalTasks || 0}</span>
                        <span className="stat-label">Total Tasks</span>
                    </div>
                </div>
                <div className="stat-card stat-completed">
                    <div className="stat-icon">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.completed || 0}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-icon">
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.inProgress || 0}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
                <div className="stat-card stat-rate">
                    <div className="stat-icon">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.completionRate || 0}%</span>
                        <span className="stat-label">Completion Rate</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>
                        <FiBarChart2 /> Task Status
                    </h3>
                    <div className="chart-wrapper">
                        <Doughnut data={statusChartData} options={chartOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>
                        <FiAlertCircle /> Priority Distribution
                    </h3>
                    <div className="chart-wrapper">
                        <Doughnut data={priorityChartData} options={chartOptions} />
                    </div>
                </div>
                {productivityChartData && (
                    <div className="chart-card chart-card-wide">
                        <h3>
                            <FiTrendingUp /> Productivity Trend (Last 14 Days)
                        </h3>
                        <div className="chart-wrapper chart-wrapper-bar">
                            <Bar data={productivityChartData} options={barOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
