import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTicketAlt, FaEye, FaHome, FaPlus, FaClock, FaCheckCircle, FaFlask } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../utils/api';

const MyTickets = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyTickets();
        }
    }, [user]);

    const fetchMyTickets = async () => {
        try {
            const response = await api.get(`/tickets/user/${user.email}`);
            setTickets(response.data.data.tickets);
        } catch (error) {
            toast.error('Failed to fetch your tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    // Get ticket stats
    const stats = {
        total: tickets.length,
        toDo: tickets.filter(t => t.status === 'TO DO').length,
        inProgress: tickets.filter(t => t.status === 'In Progress' || t.status === 'In Progress QA').length,
        completed: tickets.filter(t => t.status === 'Completed' || t.status === 'Done').length,
    };

    return (
        <div className="min-h-screen py-8 px-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="particle top-10 left-10 w-64 h-64 opacity-20" />
            <div className="particle bottom-0 right-10 w-96 h-96 opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <h1 className="text-5xl font-extrabold gradient-text mb-3 tracking-tight">My Portal</h1>
                        <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-medium">{user?.name}</span>. Here's your support overview.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <NotificationBell />
                        <Button className="glass-button shadow-lg shadow-purple-500/20" onClick={() => navigate('/create-ticket')}>
                            <FaPlus className="mr-2" />
                            New Ticket
                        </Button>
                        <Button variant="secondary" className="glass-button-secondary" onClick={() => navigate('/')}>
                            <FaHome className="mr-2" />
                            Home
                        </Button>
                        <Button variant="secondary" className="glass-button-secondary border-red-500/20 hover:bg-red-500/10" onClick={handleLogout}>
                            <FaSignOutAlt className="mr-2 text-red-400" />
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Stats & Tickets (8 Cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: FaTicketAlt },
                                { label: 'Pending', value: stats.toDo, color: 'from-yellow-500/80 to-orange-500/80', icon: FaClock },
                                { label: 'In Progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: FaFlask },
                                { label: 'Resolved', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: FaCheckCircle },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card-hover p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center"
                                >
                                    <div className={`w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-inner`}>
                                        <stat.icon className="text-white text-xl" />
                                    </div>
                                    <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Tickets Table */}
                        <Card className="rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FaTicketAlt className="text-purple-400" />
                                    Active Support Tickets
                                </h3>
                            </div>

                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                                    <p className="text-gray-400 font-medium">Fetching your records...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaTicketAlt className="text-5xl text-gray-700" />
                                    </div>
                                    <p className="text-gray-400 text-lg mb-6">You haven't created any tickets yet</p>
                                    <Button size="lg" onClick={() => navigate('/create-ticket')} className="glass-button px-8">
                                        Open A New Ticket
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="text-left py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
                                                <th className="text-left py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Service</th>
                                                <th className="text-left py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Subject</th>
                                                <th className="text-left py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                                <th className="text-left py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {tickets.map((ticket, index) => (
                                                <motion.tr
                                                    key={ticket._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <td className="py-5 px-6 font-mono text-xs text-purple-400 font-bold">{ticket.ticketId}</td>
                                                    <td className="py-5 px-6">
                                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                            {ticket.product}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-6 text-gray-300 text-sm max-w-[200px] truncate group-hover:text-white transition-colors">{ticket.subject}</td>
                                                    <td className="py-5 px-6">
                                                        <Badge status={ticket.status} size="sm" />
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <button
                                                            onClick={() => navigate(`/ticket/${ticket._id}`)}
                                                            className="text-purple-400 hover:text-white flex items-center gap-1.5 transition-colors font-bold text-xs"
                                                        >
                                                            <FaEye /> View
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Column: Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Knowledge Base Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 rounded-3xl border border-primary-500/20 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FaFlask className="text-8xl -rotate-12" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <FaEye className="text-primary-400" />
                                </div>
                                Support Resources
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Troubleshooting FAQ', desc: 'Common issues and solutions' },
                                    { title: 'Product Manuals', desc: 'Detailed user guides for all apps' },
                                    { title: 'Security Guidelines', desc: 'Keeping your data safe' },
                                    { title: 'Release Notes', desc: 'What is new in the latest version' },
                                ].map((item, i) => (
                                    <div key={i} className="group cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
                                        <p className="text-white font-bold text-sm mb-1 group-hover:text-primary-400">{item.title}</p>
                                        <p className="text-gray-500 text-xs">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Product Tip Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl bg-gradient-to-br from-indigo-500/10 to-transparent"
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-3xl text-yellow-400">💡</div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">Did you know?</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        You can attach screenshots directly to your tickets to help our developers diagnose issues faster!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MyTickets;
