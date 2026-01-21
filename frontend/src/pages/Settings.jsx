import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Card from '../components/ui/Card';
import ThemeToggle from '../components/ThemeToggle';
import { FaPalette, FaBell, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Header />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8">Settings</h1>

                    <div className="space-y-6">
                        {/* Appearance */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <FaPalette className="text-orange-500 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Appearance</h3>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Customize the look and feel of the application</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Theme</span>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </Card>

                        {/* Notifications (Placeholder) */}
                        <Card className="p-6 opacity-75">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <FaBell className="text-blue-500 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Notifications</h3>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage your email and push notifications</p>
                                    </div>
                                </div>
                                <Button variant="secondary" disabled size="sm">Coming Soon</Button>
                            </div>
                        </Card>

                        {/* Language (Placeholder) */}
                        <Card className="p-6 opacity-75">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <FaGlobe className="text-green-500 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Language</h3>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Select your preferred language</p>
                                    </div>
                                </div>
                                <Button variant="secondary" disabled size="sm">English (US)</Button>
                            </div>
                        </Card>

                        <div className="flex justify-center mt-8">
                            <Button onClick={() => navigate('/profile')}>Manage Profile Details</Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
