import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiCalendar,
    FiX,
    FiChevronDown,
} from 'react-icons/fi';

const PRIORITY_COLORS = { High: '#ff6b6b', Medium: '#ffd93d', Low: '#6bcb77' };
const STATUS_COLORS = {
    Todo: '#748ffc',
    'In Progress': '#ffd43b',
    Completed: '#51cf66',
};

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Form state
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        dueDate: '',
    });

    useEffect(() => {
        fetchTasks();
    }, [filterStatus, filterPriority, sortBy, sortOrder, search]);

    const fetchTasks = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'All') params.append('status', filterStatus);
            if (filterPriority !== 'All') params.append('priority', filterPriority);
            if (search) params.append('search', search);
            params.append('sortBy', sortBy);
            params.append('order', sortOrder);

            const { data } = await API.get(`/tasks?${params.toString()}`);
            setTasks(data);
        } catch (err) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setForm({ title: '', description: '', priority: 'Medium', status: 'Todo', dueDate: '' });
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (!payload.dueDate) payload.dueDate = null;

            if (editingTask) {
                await API.put(`/tasks/${editingTask._id}`, payload);
                toast.success('Task updated!');
            } else {
                await API.post('/tasks', payload);
                toast.success('Task created!');
            }
            setShowModal(false);
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving task');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await API.delete(`/tasks/${id}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await API.put(`/tasks/${task._id}`, { status: newStatus });
            fetchTasks();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = (task) => {
        if (!task.dueDate || task.status === 'Completed') return false;
        return new Date(task.dueDate) < new Date();
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Tasks</h1>
                    <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <FiPlus /> New Task
                </button>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <div className="select-wrapper">
                        <FiFilter className="select-icon" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <div className="select-wrapper">
                        <FiFilter className="select-icon" />
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                            <option value="All">All Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <div className="select-wrapper">
                        <FiCalendar className="select-icon" />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="createdAt">Created Date</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <button
                        className="btn-sort-order"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Task List */}
            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started!</p>
                    <button onClick={openCreateModal} className="btn-primary">
                        <FiPlus /> Create Task
                    </button>
                </div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className={`task-card ${task.status === 'Completed' ? 'task-completed' : ''} ${isOverdue(task) ? 'task-overdue' : ''}`}
                        >
                            <div className="task-card-left">
                                <div className="task-status-indicator">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task, e.target.value)}
                                        className="status-select"
                                        style={{ color: STATUS_COLORS[task.status] }}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div className="task-content">
                                    <h3 className="task-title">{task.title}</h3>
                                    {task.description && (
                                        <p className="task-description">{task.description}</p>
                                    )}
                                    <div className="task-meta">
                                        <span
                                            className="badge badge-priority"
                                            style={{
                                                backgroundColor: `${PRIORITY_COLORS[task.priority]}22`,
                                                color: PRIORITY_COLORS[task.priority],
                                                borderColor: `${PRIORITY_COLORS[task.priority]}44`,
                                            }}
                                        >
                                            {task.priority}
                                        </span>
                                        {task.dueDate && (
                                            <span className={`badge badge-date ${isOverdue(task) ? 'badge-overdue' : ''}`}>
                                                <FiCalendar /> {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="task-actions">
                                <button
                                    onClick={() => openEditModal(task)}
                                    className="btn-icon"
                                    title="Edit"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => handleDelete(task._id)}
                                    className="btn-icon btn-icon-danger"
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon">
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Enter task description (optional)"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
