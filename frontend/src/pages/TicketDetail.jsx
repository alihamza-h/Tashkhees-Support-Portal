import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaBox, FaClock, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../utils/api';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isDeveloper } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // All available statuses in order
    const allStatuses = ['TO DO', 'In Progress', 'In Progress QA', 'Completed', 'Done'];

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data.data.ticket);
            setReplies(response.data.data.replies || []);
        } catch (error) {
            toast.error('Failed to fetch ticket details');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/tickets/${id}/status`, { status: newStatus });
            toast.success(`Status updated to "${newStatus}"`);
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleAssign = async () => {
        setUpdating(true);
        try {
            await api.put(`/tickets/${id}/assign`);
            toast.success('Ticket assigned to you');
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to assign ticket');
        } finally {
            setUpdating(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setSendingReply(true);
        try {
            await api.post('/replies', {
                ticketId: id,
                message: replyMessage,
                senderName: user?.name || 'Support Team',
                senderEmail: user?.email,
                senderRole: isDeveloper ? 'DEVELOPER' : 'USER'
            });
            setReplyMessage('');
            fetchTicketDetails();
            toast.success('Reply sent');
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'TO DO': 'border-blue-500 bg-blue-500/20',
            'In Progress': 'border-yellow-500 bg-yellow-500/20',
            'In Progress QA': 'border-orange-500 bg-orange-500/20',
            'Completed': 'border-emerald-500 bg-emerald-500/20',
            'Done': 'border-green-500 bg-green-500/20'
        };
        return colors[status] || colors['TO DO'];
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'text-red-400 bg-red-500/20 border-red-500/30',
            'High': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
            'Medium': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
            'Low': 'text-gray-400 bg-gray-500/20 border-gray-500/30'
        };
        return colors[priority] || colors['Medium'];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading ticket details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
                        <FaArrowLeft />
                        Back
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl font-bold gradient-text">
                                    {ticket?.ticketId}
                                </h1>
                                <Badge status={ticket?.status} size="lg" />
                            </div>
                            <p className="text-gray-300 text-lg">{ticket?.subject}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${getPriorityColor(ticket?.priority)}`}>
                            <p className="text-xs opacity-70">Priority</p>
                            <p className="font-bold">{ticket?.priority}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Details */}
                        <Card>
                            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{ticket?.description}</p>

                            {ticket?.attachmentPath && (
                                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-gray-400 mb-2">Attachment</p>
                                    <a
                                        href={`http://localhost:5000/${ticket.attachmentPath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        View Attachment →
                                    </a>
                                </div>
                            )}
                        </Card>

                        {/* Replies Section */}
                        <Card>
                            <h2 className="text-2xl font-bold text-white mb-4">Conversation</h2>

                            {replies.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>No messages yet. Start the conversation below.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-6">
                                    {replies.map((reply, index) => (
                                        <motion.div
                                            key={reply._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-4 rounded-xl ${reply.senderRole === 'DEVELOPER'
                                                    ? 'bg-purple-500/20 border border-purple-500/30 ml-8'
                                                    : 'bg-white/5 border border-white/10 mr-8'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.senderRole === 'DEVELOPER' ? 'bg-purple-600' : 'bg-blue-600'
                                                    }`}>
                                                    <FaUser className="text-white text-sm" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{reply.senderName}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                {reply.senderRole === 'DEVELOPER' && (
                                                    <span className="px-2 py-1 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                                                        Support Team
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-300 ml-11">{reply.message}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Form */}
                            {user && (
                                <form onSubmit={handleSendReply} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="input-field flex-1"
                                    />
                                    <Button type="submit" loading={sendingReply} disabled={!replyMessage.trim()}>
                                        <FaPaperPlane />
                                        Send
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Info */}
                        <Card>
                            <h3 className="text-lg font-bold text-white mb-4">User Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <FaUser className="text-blue-400 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="text-white">{ticket?.userName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <FaEnvelope className="text-purple-400 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Email</p>
                                        <p className="text-white text-sm">{ticket?.userEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <FaBox className="text-cyan-400 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Product</p>
                                        <p className="text-white">{ticket?.product}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                                        <FaClock className="text-gray-400 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Created</p>
                                        <p className="text-white text-sm">
                                            {new Date(ticket?.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Developer Actions */}
                        {isDeveloper && (
                            <Card>
                                <h3 className="text-lg font-bold text-white mb-4">Developer Actions</h3>
                                <div className="space-y-4">
                                    {/* Assign Section */}
                                    {!ticket?.assignedTo ? (
                                        <Button
                                            onClick={handleAssign}
                                            loading={updating}
                                            className="w-full"
                                        >
                                            🎯 Pick Up Ticket
                                        </Button>
                                    ) : (
                                        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">Assigned to</p>
                                            <p className="text-white font-semibold">{ticket.assignedTo.name}</p>
                                        </div>
                                    )}

                                    {/* Status Update */}
                                    <div>
                                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                                            <FaHistory /> Update Status
                                        </p>
                                        <div className="space-y-2">
                                            {allStatuses.map((status) => (
                                                <motion.button
                                                    key={status}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleStatusChange(status)}
                                                    disabled={ticket?.status === status || updating}
                                                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${ticket?.status === status
                                                            ? `${getStatusColor(status)} border-2`
                                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border-white/10'
                                                        } disabled:opacity-50 text-left flex items-center justify-between`}
                                                >
                                                    <span>{status}</span>
                                                    {ticket?.status === status && (
                                                        <FaCheckCircle className="text-green-400" />
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Status History */}
                        {ticket?.statusHistory && ticket.statusHistory.length > 0 && (
                            <Card>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaHistory className="text-purple-400" /> Status History
                                </h3>
                                <div className="space-y-3">
                                    {ticket.statusHistory.slice().reverse().map((history, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 relative"
                                        >
                                            {index !== ticket.statusHistory.length - 1 && (
                                                <div className="absolute left-4 top-8 w-0.5 h-full bg-white/10"></div>
                                            )}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(history.status)}`}>
                                                <FaCheckCircle className="text-sm" />
                                            </div>
                                            <div>
                                                <Badge status={history.status} size="sm" />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(history.changedAt).toLocaleString()}
                                                </p>
                                                {history.changedBy && (
                                                    <p className="text-xs text-gray-500">
                                                        by {history.changedBy.name || 'System'}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
