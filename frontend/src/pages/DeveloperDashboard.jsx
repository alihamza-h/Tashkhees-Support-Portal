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
        <div className="min-h-screen py-8 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="particle top-1/4 right-0 w-80 h-80 opacity-10" />
            <div className="particle bottom-1/4 left-0 w-64 h-64 opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500/20 rounded-xl">
                                <FaFlask className="text-primary-400 text-2xl" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Dev Console</h1>
                        </div>
                        <p className="text-gray-400">System maintenance and ticket resolution terminal.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Button variant="secondary" className="glass-button-secondary" onClick={() => navigate('/')}>
                            <FaHome className="mr-2" /> Home
                        </Button>
                        <Button variant="secondary" className="glass-button-secondary border-red-500/20 hover:bg-red-500/10" onClick={handleLogout}>
                            <FaSignOutAlt className="mr-2 text-red-400" /> Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Performance & Shortcuts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                    {/* Stats Summary (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="glass-card-hover p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center">
                                        <div className={`w-10 h-10 mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="text-white text-sm" />
                                        </div>
                                        <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Efficiency Metric */}
                        <Card className="rounded-3xl border-white/5 bg-gradient-to-r from-primary-500/10 to-transparent">
                            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-500/30 border-t-primary-500 flex items-center justify-center animate-spin-slow">
                                        <span className="text-lg font-black text-white animate-none">84%</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Resolution Efficiency</h4>
                                        <p className="text-gray-400 text-sm italic">You are performing above the team average this week.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">+12% vs LW</span>
                                    <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold border border-primary-500/20">Elite Tier</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Access (4 Cols) */}
                    <Card className="lg:col-span-4 rounded-3xl border-white/10 bg-white/5 p-6 h-full">
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                            <FaSearch className="text-primary-400 text-xs" />
                            Dev Resources
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'API Docs', icon: FaFlask },
                                { name: 'DB Schema', icon: FaInbox },
                                { name: 'Internal Wiki', icon: FaTicketAlt },
                                { name: 'QA Checklist', icon: FaCheckCircle },
                            ].map((res, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <res.icon className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">{res.name}</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary-500 transition-all shadow-[0_0_8px_rgba(139,92,246,0)] group-hover:shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Main View: Filters and List */}
                <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                        <div className="flex-1 min-w-[300px] relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search assigned tickets..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="input-field pl-12 bg-black/20 border-white/10 focus:border-primary-500/50"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="input-field w-40 bg-black/20 border-white/10"
                            >
                                <option value="">Status</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <Button
                                variant="secondary"
                                className="glass-button-secondary py-2 border-white/5"
                                onClick={() => setFilters({ status: '', product: '', search: '' })}
                            >
                                <FaFilter className="text-xs" /> Reset
                            </Button>
                        </div>
                    </div>

                    {/* Tickets Data Container */}
                    <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                        {loading ? (
                            <div className="text-center py-24">
                                <div className="animate-spin w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing records...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-24">
                                <FaInbox className="text-7xl text-gray-800 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">Queue is Clear</h3>
                                <p className="text-gray-600">Great job! All your assigned tasks are addressed.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="text-left py-5 px-6 text-xs font-black uppercase tracking-widest text-gray-500">Subject / App</th>
                                            <th className="text-left py-5 px-6 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Priority</th>
                                            <th className="text-left py-5 px-6 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
                                            <th className="text-left py-5 px-6 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tickets.map((ticket, index) => (
                                            <motion.tr
                                                key={ticket._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center font-mono text-xs font-bold text-primary-400 group-hover:scale-110 transition-transform">
                                                            {ticket.ticketId.split('-').pop()}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-sm mb-1">{ticket.subject}</p>
                                                            <span className="text-[10px] font-black uppercase text-gray-500 px-2 py-0.5 border border-white/5 rounded-md">
                                                                {ticket.product}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${ticket.priority === 'Critical' ? 'bg-critical-500/10 text-critical-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]' :
                                                        ticket.priority === 'High' ? 'bg-high-500/10 text-high-400' :
                                                            ticket.priority === 'Medium' ? 'bg-medium-500/10 text-medium-400' :
                                                                'bg-low-500/10 text-low-400'
                                                        }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Badge status={ticket.status} size="sm" />
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <Button
                                                        size="sm"
                                                        className="glass-button-secondary border-primary-500/20 hover:text-primary-400"
                                                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                                                    >
                                                        Details
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
        </div>
    );
};

export default DeveloperDashboard;
