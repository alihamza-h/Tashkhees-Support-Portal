import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { FaUser, FaCog, FaKey, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const firstName = user?.name?.split(' ')[0] || 'User';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between mb-8">
            {/* Welcome Text */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-white transition-colors">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-300">{firstName}</span>
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm transition-colors">Here's what's happening today</p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center border-2 border-neutral-800">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FaUser className="text-white" />
                            )}
                        </div>
                        <FaChevronDown className={`text-neutral-400 text-xs transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden transition-colors"
                                >
                                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                                        <p className="text-neutral-800 dark:text-white font-semibold truncate">{user?.name}</p>
                                        <p className="text-neutral-500 text-xs truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-sm"
                                        >
                                            <FaUser className="text-primary-500 dark:text-primary-400" /> View Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-sm"
                                        >
                                            <FaCog className="text-neutral-400" /> Settings
                                        </button>
                                        <button
                                            onClick={() => { /* Open change password modal */ setShowDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-sm"
                                        >
                                            <FaKey className="text-accent-500 dark:text-accent-400" /> Change Password
                                        </button>
                                        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                                        >
                                            <FaSignOutAlt /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
