import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { FaUser, FaLock, FaSave } from 'react-icons/fa';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const updateData = {
                name: formData.name,
                ...(formData.newPassword && {
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword
                })
            };

            const response = await api.put('/auth/profile', updateData);
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Header />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8">My Profile</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="md:col-span-1">
                            <Card className="text-center p-6">
                                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-4xl text-white font-bold">
                                    {user?.name?.charAt(0)}
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">{user?.name}</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">{user?.email}</p>
                                <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold border border-primary-500/20">
                                    {user?.role}
                                </span>
                            </Card>
                        </div>

                        {/* Edit Form */}
                        <div className="md:col-span-2">
                            <Card className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                                            <FaUser className="text-primary-500" /> Personal Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                                                <Input
                                                    name="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="opacity-60 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                                            <FaLock className="text-accent-500" /> Change Password
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Current Password</label>
                                                <Input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">New Password</label>
                                                    <Input
                                                        type="password"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleChange}
                                                        placeholder="New password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirm Password</label>
                                                    <Input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : (
                                                <>
                                                    <FaSave className="mr-2" /> Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
