import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaSignOutAlt, FaTicketAlt, FaEye, FaCheckCircle, FaClock, FaFlask, FaFlagCheckered, FaHome, FaInbox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../utils/api';

const DeveloperDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, isDeveloper, isAdmin } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        product: '',
        search: '',
    });

    useEffect(() => {
        // Redirect admin to admin dashboard
        if (isAdmin) {
            navigate('/admin');
            return;
        }
        if (!isDeveloper) {
            navigate('/my-tickets');
            return;
        }
        fetchTickets();
    }, []);

    useEffect(() => {
        if (isDeveloper && !isAdmin) {
            fetchTickets();
        }
    }, [filters]);

    const fetchTickets = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.product) params.product = filters.product;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/tickets', { params });
            setTickets(response.data.data.tickets);
            if (response.data.data.stats) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const products = ['RxScan', 'Medscribe', 'Legalyze', 'DICOM Viewer', 'Breast Cancer Detection', 'Other'];
    const statuses = ['TO DO', 'In Progress', 'In Progress QA', 'Completed', 'Done'];

    const statCards = [
        { label: 'My Tickets', value: stats.total || 0, color: 'from-primary-600 to-primary-400', icon: FaTicketAlt },
        { label: 'TO DO', value: stats.toDo || 0, color: 'from-todo-500 to-todo-700', icon: FaClock },
        { label: 'In Progress', value: stats.inProgress || 0, color: 'from-inprogress-500 to-inprogress-700', icon: FaClock },
        { label: 'QA', value: stats.inProgressQA || 0, color: 'from-qa-500 to-qa-700', icon: FaFlask },
        { label: 'Completed', value: stats.completed || 0, color: 'from-completed-500 to-completed-700', icon: FaCheckCircle },
        { label: 'Done', value: stats.done || 0, color: 'from-done-500 to-done-700', icon: FaFlagCheckered },
    ];

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">🔧 Developer Dashboard</h1>
                        <p className="text-gray-300">Welcome, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Button variant="secondary" onClick={() => navigate('/')}>
                            <FaHome />
                            Home
                        </Button>
                        <Button variant="secondary" onClick={handleLogout}>
                            <FaSignOutAlt />
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                >
                    <p className="text-blue-300 text-sm">
                        <FaInbox className="inline mr-2" />
                        You are viewing only tickets assigned to you. Contact admin for new ticket assignments.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card hover className="text-center py-4 px-3">
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="text-white text-lg" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-gray-400 text-xs">{stat.label}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="input-field pl-12"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="input-field"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            value={filters.product}
                            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                            className="input-field"
                        >
                            <option value="">All Products</option>
                            {products.map(product => (
                                <option key={product} value={product}>{product}</option>
                            ))}
                        </select>
                        <Button
                            variant="secondary"
                            onClick={() => setFilters({ status: '', product: '', search: '' })}
                        >
                            <FaFilter />
                            Clear Filters
                        </Button>
                    </div>
                </Card>

                {/* Tickets Table */}
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">📋 My Assigned Tickets ({tickets.length})</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <FaInbox className="text-6xl text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">No tickets assigned to you yet</p>
                            <p className="text-gray-500 text-sm">When admin assigns tickets to you, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Ticket ID</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">User</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Product</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Subject</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Priority</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Created</th>
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket, index) => (
                                        <motion.tr
                                            key={ticket._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-mono text-purple-400 font-semibold">{ticket.ticketId}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-medium text-sm">{ticket.userName}</p>
                                                    <p className="text-gray-400 text-xs">{ticket.userEmail}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                                                    {ticket.product}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300 max-w-[200px] truncate text-sm">{ticket.subject}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ticket.priority === 'Critical' ? 'bg-critical-500/20 text-critical-400 animate-pulse' :
                                                    ticket.priority === 'High' ? 'bg-high-500/20 text-high-400' :
                                                        ticket.priority === 'Medium' ? 'bg-medium-500/20 text-medium-400' :
                                                            'bg-low-500/20 text-low-400'
                                                    }`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge status={ticket.status} size="sm" />
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => navigate(`/ticket/${ticket._id}`)}
                                                >
                                                    <FaEye />
                                                    View
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DeveloperDashboard;
