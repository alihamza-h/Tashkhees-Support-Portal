import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTicketAlt, FaEye, FaHome, FaPlus } from 'react-icons/fa';
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
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">My Tickets</h1>
                        <p className="text-gray-300">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <Button onClick={() => navigate('/create-ticket')}>
                            <FaPlus />
                            New Ticket
                        </Button>
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

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Pending', value: stats.toDo, color: 'from-yellow-500 to-orange-500' },
                        { label: 'In Progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500' },
                        { label: 'Resolved', value: stats.completed, color: 'from-green-500 to-emerald-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-4 text-center"
                        >
                            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </p>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tickets */}
                <Card>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading your tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <FaTicketAlt className="text-6xl text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">You haven't created any tickets yet</p>
                            <Button onClick={() => navigate('/create-ticket')}>
                                Create Your First Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">Ticket ID</th>
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
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-mono text-purple-400 font-semibold">{ticket.ticketId}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                                    {ticket.product}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300 max-w-xs truncate">{ticket.subject}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ticket.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                                        ticket.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                                            ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-gray-500/20 text-gray-400'
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

export default MyTickets;
