import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FaHome, FaTicketAlt, FaUserPlus, FaPlusCircle, FaSignOutAlt,
    FaChartBar, FaKey, FaCopy, FaEnvelope, FaLock, FaUsers,
    FaCode, FaCheckCircle, FaClock, FaExclamationTriangle, FaUsersCog, FaEdit, FaTrash,
    FaCrown, FaTimes, FaUser, FaSearch, FaChartPie, FaEye, FaPalette
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import EditUserModal from '../components/EditUserModal';
import api from '../utils/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { theme, setTheme, themes } = useTheme();

    // Navigation state
    const [activeSection, setActiveSection] = useState('home');

    // Data state
    const [tickets, setTickets] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [workload, setWorkload] = useState([]);
    const [licenses, setLicenses] = useState([]);
    const [licenseStats, setLicenseStats] = useState({});
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [userType, setUserType] = useState(null); // 'developer' or 'enduser'
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [creatingUser, setCreatingUser] = useState(false);
    const [generatedLicense, setGeneratedLicense] = useState(null);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Ticket creation state
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [newTicket, setNewTicket] = useState({
        userName: '', userEmail: '', product: 'RxScan', subject: '', description: '', priority: 'Medium', assignedTo: ''
    });
    const [creatingTicket, setCreatingTicket] = useState(false);

    // Filters
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

    useEffect(() => {
        if (!isAdmin) { navigate('/dashboard'); return; }
        fetchAllData();
    }, []);

    useEffect(() => {
        if (isAdmin && activeSection === 'tickets') fetchTickets();
    }, [filters, activeSection]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchTickets(), fetchDevelopers(), fetchWorkload(), fetchLicenses(), fetchAllUsers()]);
        setLoading(false);
    };

    const fetchTickets = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/tickets/all', { params });
            setTickets(response.data.data.tickets);
            setStats(response.data.data.stats);
        } catch (error) {
            console.error('Failed to fetch tickets');
        }
    };

    const fetchDevelopers = async () => {
        try {
            const response = await api.get('/users/developers');
            setDevelopers(response.data.data.developers);
        } catch (error) { console.error('Failed to fetch developers'); }
    };

    const fetchWorkload = async () => {
        try {
            const response = await api.get('/users/workload');
            setWorkload(response.data.data.workload);
        } catch (error) { console.error('Failed to fetch workload'); }
    };

    const fetchLicenses = async () => {
        try {
            const response = await api.get('/licenses');
            setLicenses(response.data.data.licenses);
            setLicenseStats(response.data.data.stats);
        } catch (error) { console.error('Failed to fetch licenses'); }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await api.get('/users');
            setAllUsers(response.data.data.users);
        } catch (error) { console.error('Failed to fetch users'); }
    };

    const handleAssignTicket = async (developerId) => {
        if (!selectedTicket) return;
        try {
            await api.put(`/tickets/${selectedTicket._id}/assign`, { developerId });
            toast.success('Ticket assigned successfully');
            setShowAssignModal(false);
            setSelectedTicket(null);
            fetchTickets();
            fetchWorkload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign ticket');
        }
    };

    const handleUnassignTicket = async (ticketId) => {
        try {
            await api.put(`/tickets/${ticketId}/unassign`);
            toast.success('Ticket unassigned');
            fetchTickets();
            fetchWorkload();
        } catch (error) { toast.error('Failed to unassign ticket'); }
    };

    const handleCreateDeveloper = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error('All fields are required'); return;
        }
        setCreatingUser(true);
        try {
            await api.post('/auth/create-developer', newUser);
            toast.success(`Developer "${newUser.name}" created successfully`);
            setShowCreateUserModal(false);
            setUserType(null);
            setNewUser({ name: '', email: '', password: '' });
            fetchDevelopers();
            fetchWorkload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create developer');
        } finally { setCreatingUser(false); }
    };

    const handleCreateEndUser = async () => {
        setCreatingUser(true);
        try {
            // First generate a license key
            const licenseRes = await api.post('/licenses/generate', { count: 1, product: 'All Products' });
            const licenseCode = licenseRes.data.data.licenses[0].code;
            setGeneratedLicense(licenseCode);
            toast.success('License key generated! Share it with the user for registration.');
            await fetchLicenses();
        } catch (error) {
            toast.error('Failed to generate license');
        } finally { setCreatingUser(false); }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.userName || !newTicket.userEmail || !newTicket.subject || !newTicket.description) {
            toast.error('Please fill all required fields'); return;
        }
        setCreatingTicket(true);
        try {
            const ticketData = { ...newTicket };
            if (!ticketData.assignedTo) delete ticketData.assignedTo;

            const response = await api.post('/tickets', ticketData);

            // If assigned, update the ticket
            if (newTicket.assignedTo && response.data.data.ticket.id) {
                await api.put(`/tickets/${response.data.data.ticket.id}/assign`, { developerId: newTicket.assignedTo });
            }

            toast.success('Ticket created successfully');
            setShowCreateTicketModal(false);
            setNewTicket({ userName: '', userEmail: '', product: 'RxScan', subject: '', description: '', priority: 'Medium', assignedTo: '' });
            fetchTickets();
            fetchWorkload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally { setCreatingTicket(false); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

    const products = ['RxScan', 'Medscribe', 'Legalyze', 'DICOM Viewer', 'Breast Cancer Detection', 'Other'];
    const statuses = ['TO DO', 'In Progress', 'In Progress QA', 'Completed', 'Done'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];

    // Sidebar menu items
    const menuItems = [
        { id: 'home', icon: FaHome, label: 'Dashboard' },
        { id: 'tickets', icon: FaTicketAlt, label: 'All Tickets' },
        { id: 'users', icon: FaUserPlus, label: 'Create User' },
        { id: 'update-profiles', icon: FaUsersCog, label: 'Update Profiles' },
        { id: 'create-ticket', icon: FaPlusCircle, label: 'New Ticket' },
        { id: 'theme-settings', icon: FaPalette, label: 'Theme Settings' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* ============ LEFT SIDEBAR ============ */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1, width: isCollapsed ? 80 : 288 }}
                className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-r border-neutral-800 flex flex-col fixed h-full z-40 transition-all duration-300"
            >
                {/* Brand Header */}
                <div className={`p-6 border-b border-neutral-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                            <FaCrown className="text-white text-xl" />
                        </div>
                        {!isCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="text-xl font-bold text-white">Super Admin</h1>
                                <p className="text-xs text-neutral-400">Tashkhees Portal</p>
                            </motion.div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button onClick={toggleSidebar} className="text-neutral-400 hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Toggle Button (Collapsed State) */}
                {isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="mx-auto mt-4 p-2 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Expand Sidebar"
                    >
                        <FaChartBar className="rotate-90" />
                    </button>
                )}

                {/* User Profile */}
                <div className={`p-4 mx-4 mt-4 bg-neutral-800/50 rounded-xl border border-neutral-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                            <FaUser className="text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                                <p className="text-neutral-400 text-xs truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeSection === item.id
                                ? 'bg-gradient-to-r from-primary-600/80 to-primary-500/80 text-white shadow-lg shadow-primary-500/20'
                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon className={`${activeSection === item.id ? 'text-white' : ''} text-xl shrink-0`} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <FaSignOutAlt className="text-xl shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* ============ MAIN CONTENT ============ */}
            <main className={`flex-1 p-8 min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
                <Header />

                {/* HOME SECTION - Dashboard Overview */}
                {activeSection === 'home' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">📊 Dashboard Overview</h1>
                        <p className="text-neutral-400 mb-8">Real-time system monitoring and analytics</p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Tickets', value: stats.total || 0, icon: FaTicketAlt, color: 'from-primary-500 to-primary-400' },
                                { label: 'Unassigned', value: stats.unassigned || 0, icon: FaExclamationTriangle, color: 'from-unassigned-500 to-unassigned-400' },
                                { label: 'In Progress', value: (stats.inProgress || 0) + (stats.inProgressQA || 0), icon: FaClock, color: 'from-inprogress-500 to-inprogress-400' },
                                { label: 'Completed', value: (stats.completed || 0) + (stats.done || 0), icon: FaCheckCircle, color: 'from-completed-500 to-completed-400' },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                    <Card className="relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
                                        <div className="relative flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                                <stat.icon className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                                <p className="text-neutral-400 text-sm">{stat.label}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Status Distribution */}
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaChartPie className="text-primary-400" /> Status Distribution
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'TO DO', value: stats.toDo || 0, color: 'bg-todo-500' },
                                        { label: 'In Progress', value: stats.inProgress || 0, color: 'bg-inprogress-500' },
                                        { label: 'QA Testing', value: stats.inProgressQA || 0, color: 'bg-qa-500' },
                                        { label: 'Completed', value: stats.completed || 0, color: 'bg-completed-500' },
                                        { label: 'Done', value: stats.done || 0, color: 'bg-done-500' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                            <span className="text-neutral-300 flex-1">{item.label}</span>
                                            <span className="text-white font-bold">{item.value}</span>
                                            <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color}`} style={{ width: `${stats.total ? (item.value / stats.total) * 100 : 0}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Priority Overview */}
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaChartBar className="text-accent-400" /> Priority Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Critical', value: stats.critical || 0, color: 'from-critical-500 to-critical-700', emoji: '🔴' },
                                        { label: 'High', value: stats.high || 0, color: 'from-high-500 to-high-700', emoji: '🟠' },
                                        { label: 'Medium', value: stats.medium || 0, color: 'from-medium-500 to-medium-700', emoji: '🟡' },
                                        { label: 'Low', value: stats.low || 0, color: 'from-low-500 to-low-700', emoji: '⚪' },
                                    ].map((item, i) => (
                                        <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20 border border-white/10`}>
                                            <p className="text-3xl font-bold text-white">{item.value}</p>
                                            <p className="text-neutral-300 text-sm">{item.emoji} {item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Developer Workload */}
                        <Card className="p-6 mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FaUsers className="text-primary-400" /> Developer Workload
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {workload.map((dev, i) => (
                                    <motion.div key={dev.developer.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                                                <FaCode className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">{dev.developer.name}</p>
                                                <p className="text-neutral-400 text-xs">{dev.developer.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-primary-500/20 rounded-lg p-2">
                                                <p className="text-xl font-bold text-primary-400">{dev.tickets.total}</p>
                                                <p className="text-[10px] text-neutral-400">Total</p>
                                            </div>
                                            <div class="bg-inprogress-500/20 rounded-lg p-2">
                                                <p className="text-xl font-bold text-inprogress-400">{dev.tickets.inProgress}</p>
                                                <p className="text-[10px] text-neutral-400">Active</p>
                                            </div>
                                            <div className="bg-completed-500/20 rounded-lg p-2">
                                                <p className="text-xl font-bold text-completed-400">{dev.tickets.completed}</p>
                                                <p className="text-[10px] text-neutral-400">Done</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {workload.length === 0 && (
                                    <div className="col-span-3 text-center py-8 text-gray-400">
                                        No developers yet. Create one from "Create User" menu.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* License Keys Summary */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FaKey className="text-yellow-400" /> License Keys
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-white">{licenseStats.total || 0}</p>
                                    <p className="text-gray-400 text-sm">Total Keys</p>
                                </div>
                                <div className="text-center p-4 bg-green-500/10 rounded-xl">
                                    <p className="text-3xl font-bold text-green-400">{licenseStats.available || 0}</p>
                                    <p className="text-gray-400 text-sm">Available</p>
                                </div>
                                <div className="text-center p-4 bg-gray-500/10 rounded-xl">
                                    <p className="text-3xl font-bold text-gray-400">{licenseStats.used || 0}</p>
                                    <p className="text-gray-400 text-sm">Used</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* THEME SETTINGS */}
                {activeSection === 'theme-settings' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">🎨 Theme Settings</h1>
                        <p className="text-gray-400 mb-8">Switch the portal experience instantly for everyone.</p>

                        <Card className="max-w-4xl space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">Active Theme</label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="input-field"
                                >
                                    {themes.map((option) => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-2">
                                    Changes apply instantly and persist for all users on their next visit.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {themes.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className={`p-4 rounded-xl border ${theme === opt.id ? 'border-primary-400 shadow-lg' : 'border-white/10'} bg-white/5`}
                                    >
                                        <div
                                            className="h-24 rounded-lg mb-3"
                                            style={{
                                                background: `linear-gradient(135deg, ${opt.variables['--color-bg']}, ${opt.variables['--color-highlight']})`,
                                                border: `1px solid ${opt.variables['--color-border']}`,
                                                boxShadow: opt.variables['--color-shadow-soft']
                                            }}
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-white font-semibold">{opt.label}</p>
                                                <p className="text-gray-400 text-xs">{opt.description}</p>
                                            </div>
                                            <Button size="sm" variant="secondary" onClick={() => setTheme(opt.id)}>
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* TICKETS SECTION - All Tickets View */}
                {activeSection === 'tickets' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">🎫 All Tickets</h1>
                        <p className="text-gray-400 mb-6">Manage and assign tickets across the system</p>

                        {/* Filters */}
                        <Card className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text" placeholder="Search tickets..."
                                        value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="input-field pl-12"
                                    />
                                </div>
                                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field">
                                    <option value="">All Statuses</option>
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="input-field">
                                    <option value="">All Priorities</option>
                                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <Button variant="secondary" onClick={() => setFilters({ status: '', priority: '', search: '' })}>
                                    <FaTimes /> Clear
                                </Button>
                            </div>
                        </Card>

                        {/* Tickets Table */}
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Showing {tickets.length} tickets</h2>
                                <Button onClick={() => setActiveSection('create-ticket')}>
                                    <FaPlusCircle /> New Ticket
                                </Button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-gray-400">Loading tickets...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaTicketAlt className="text-5xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">No tickets found</p>
                                    <Button onClick={() => setActiveSection('create-ticket')}>Create First Ticket</Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">ID</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">User</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Subject</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Product</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Priority</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Status</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Assigned</th>
                                                <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map((ticket, index) => (
                                                <motion.tr
                                                    key={ticket._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="border-b border-white/5 hover:bg-white/5"
                                                >
                                                    <td className="py-3 px-3 font-mono text-purple-400 font-semibold">{ticket.ticketId}</td>
                                                    <td className="py-3 px-3">
                                                        <p className="text-white text-sm">{ticket.userName}</p>
                                                        <p className="text-gray-500 text-xs">{ticket.userEmail}</p>
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-300 max-w-[200px] truncate">{ticket.subject}</td>
                                                    <td className="py-3 px-3">
                                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{ticket.product}</span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.priority === 'Critical' ? 'bg-critical-500/20 text-critical-400 animate-pulse' :
                                                            ticket.priority === 'High' ? 'bg-high-500/20 text-high-400' :
                                                                ticket.priority === 'Medium' ? 'bg-medium-500/20 text-medium-400' : 'bg-low-500/20 text-low-400'
                                                            }`}>{ticket.priority}</span>
                                                    </td>
                                                    <td className="py-3 px-3"><Badge status={ticket.status} size="sm" /></td>
                                                    <td className="py-3 px-3">
                                                        {ticket.assignedTo ? (
                                                            <span className="text-green-400 text-sm flex items-center gap-1">
                                                                {ticket.assignedTo.name}
                                                                <button onClick={() => handleUnassignTicket(ticket._id)} className="text-gray-500 hover:text-red-400 ml-1">
                                                                    <FaTimes size={10} />
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setSelectedTicket(ticket); setShowAssignModal(true); }}
                                                                className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30"
                                                            >
                                                                + Assign
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Button size="sm" variant="secondary" onClick={() => navigate(`/ticket/${ticket._id}`)}>
                                                            <FaEye />
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}

                {/* CREATE USER SECTION */}
                {activeSection === 'users' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">👤 Create User</h1>
                        <p className="text-gray-400 mb-8">Add new developers or generate license keys for end users</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Developer Card */}
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    hover
                                    className="p-8 cursor-pointer border-2 border-transparent hover:border-purple-500/50"
                                    onClick={() => { setUserType('developer'); setShowCreateUserModal(true); }}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <FaCode className="text-white text-2xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-2">Add Developer</h3>
                                    <p className="text-gray-400 text-center text-sm">
                                        Create a developer account with email and password. They can manage tickets.
                                    </p>
                                </Card>
                            </motion.div>

                            {/* End User Card */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    hover
                                    className="p-8 cursor-pointer border-2 border-transparent hover:border-green-500/50"
                                    onClick={() => { setUserType('enduser'); setShowCreateUserModal(true); }}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <FaUser className="text-white text-2xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-2">Add End User</h3>
                                    <p className="text-gray-400 text-center text-sm">
                                        Generate a license key for a customer who purchased a product.
                                    </p>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Existing Developers List */}
                        <Card className="mt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Existing Developers ({developers.length})</h3>
                            {developers.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No developers yet</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {developers.map(dev => (
                                        <div key={dev._id} className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                                <FaUser className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">{dev.name}</p>
                                                <p className="text-gray-400 text-xs">{dev.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}

                {/* CREATE TICKET SECTION */}
                {activeSection === 'create-ticket' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">🎫 Create New Ticket</h1>
                        <p className="text-gray-400 mb-8">Create a ticket and optionally assign it to a developer immediately</p>

                        <Card className="max-w-2xl">
                            <form onSubmit={(e) => { e.preventDefault(); handleCreateTicket(); }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="User Name" value={newTicket.userName}
                                        onChange={(e) => setNewTicket({ ...newTicket, userName: e.target.value })}
                                        placeholder="Customer name" required
                                    />
                                    <Input
                                        label="User Email" type="email" value={newTicket.userEmail}
                                        onChange={(e) => setNewTicket({ ...newTicket, userEmail: e.target.value })}
                                        placeholder="customer@email.com" required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
                                        <select
                                            value={newTicket.product}
                                            onChange={(e) => setNewTicket({ ...newTicket, product: e.target.value })}
                                            className="input-field"
                                        >
                                            {products.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                        <select
                                            value={newTicket.priority}
                                            onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                            className="input-field"
                                        >
                                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Input
                                    label="Subject" value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    placeholder="Brief description of the issue" required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        placeholder="Detailed description..."
                                        rows={4} className="input-field resize-none" required
                                    />
                                </div>

                                {/* Admin-only: Assign Developer */}
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                                    <label className="block text-sm font-medium text-purple-300 mb-2">
                                        ⚡ Assign to Developer (Admin Only)
                                    </label>
                                    <select
                                        value={newTicket.assignedTo}
                                        onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">No assignment (TO DO)</option>
                                        {developers.map(dev => (
                                            <option key={dev._id} value={dev._id}>{dev.name} ({dev.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-purple-300/60 text-xs mt-2">
                                        When assigned, ticket status will automatically change to "In Progress"
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" size="lg" loading={creatingTicket}>
                                    <FaPlusCircle /> Create Ticket
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {/* UPDATE PROFILES SECTION */}
                {activeSection === 'update-profiles' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-2">👥 User Management</h1>
                        <p className="text-gray-400 mb-8">View and manage all users in the system</p>

                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Name</th>
                                            <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Email</th>
                                            <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Role</th>
                                            <th className="text-left py-3 px-3 text-gray-300 text-sm font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((u, index) => (
                                            <motion.tr
                                                key={u._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="border-b border-white/5 hover:bg-white/5"
                                            >
                                                <td className="py-3 px-3 text-white font-medium">{u.name}</td>
                                                <td className="py-3 px-3 text-gray-400">{u.email}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                                        u.role === 'DEVELOPER' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => { setSelectedUser(u); setShowEditUserModal(true); }}
                                                    >
                                                        <FaEdit /> Edit
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </main>

            {/* ============ MODALS ============ */}

            {/* Edit User Modal */}
            {
                showEditUserModal && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        onClose={() => { setShowEditUserModal(false); setSelectedUser(null); }}
                        onUpdate={fetchAllData}
                    />
                )
            }

            {/* Assign Ticket Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAssignModal(false)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Assign Ticket</h3>
                            <p className="text-gray-400 text-sm mb-4">{selectedTicket?.ticketId}: {selectedTicket?.subject?.substring(0, 40)}...</p>
                            <div className="space-y-2">
                                {developers.map(dev => (
                                    <button key={dev._id} onClick={() => handleAssignTicket(dev._id)}
                                        className="w-full p-3 bg-white/5 hover:bg-purple-500/20 border border-white/10 rounded-xl text-left flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                            <FaUser className="text-white" />
                                        </div>
                                        <div><p className="text-white font-semibold">{dev.name}</p><p className="text-gray-400 text-xs">{dev.email}</p></div>
                                    </button>
                                ))}
                            </div>
                            <Button variant="secondary" className="w-full mt-4" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateUserModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => { setShowCreateUserModal(false); setUserType(null); setGeneratedLicense(null); }}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {userType === 'developer' && (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-4">🔧 Add Developer</h3>
                                    <div className="space-y-4">
                                        <Input label="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Developer name" />
                                        <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="dev@tashkhees.com" />
                                        <Input label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <Button variant="secondary" className="flex-1" onClick={() => { setShowCreateUserModal(false); setUserType(null); }}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleCreateDeveloper} loading={creatingUser}>Create</Button>
                                    </div>
                                </>
                            )}

                            {userType === 'enduser' && !generatedLicense && (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-4">🔐 Generate License Key</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Generate a new license key for a customer. Share this key with them so they can register on the portal.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" className="flex-1" onClick={() => { setShowCreateUserModal(false); setUserType(null); }}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleCreateEndUser} loading={creatingUser}>Generate Key</Button>
                                    </div>
                                </>
                            )}

                            {userType === 'enduser' && generatedLicense && (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-4">✅ License Key Generated!</h3>
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-4">
                                        <p className="text-gray-400 text-sm mb-2">Share this key with your customer:</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-3 bg-black/30 rounded-lg text-green-400 font-mono">{generatedLicense}</code>
                                            <button
                                                onClick={() => copyToClipboard(generatedLicense)}
                                                className="p-3 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30"
                                            >
                                                <FaCopy />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-4">
                                        The customer can use this key on the registration page to create their account.
                                    </p>
                                    <Button className="w-full" onClick={() => { setShowCreateUserModal(false); setUserType(null); setGeneratedLicense(null); }}>Done</Button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AdminDashboard;
