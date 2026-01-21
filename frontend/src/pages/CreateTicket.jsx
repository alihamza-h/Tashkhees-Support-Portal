import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBox, FaHeading, FaUpload, FaCheckCircle, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../utils/api';

const CreateTicket = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ticketId, setTicketId] = useState('');
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        product: '',
        subject: '',
        description: '',
    });
    const [file, setFile] = useState(null);

    // Auto-fill user details if logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                userName: user.name || '',
                userEmail: user.email || ''
            }));
        }
    }, [isAuthenticated, user]);

    const products = [
        'RxScan',
        'Medscribe',
        'Legalyze',
        'DICOM Viewer',
        'Breast Cancer Detection',
        'Other'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Add user ID if logged in
            if (isAuthenticated && user) {
                data.append('userId', user.id);
            }

            if (file) {
                data.append('attachment', file);
            }

            const response = await api.post('/tickets', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTicketId(response.data.data.ticket.ticketId);
            setSuccess(true);
            toast.success('Ticket created successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <Card className="max-w-md text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mb-6"
                        >
                            <FaCheckCircle className="text-green-500 text-7xl mx-auto" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-4">Ticket Created!</h2>
                        <p className="text-gray-300 mb-6">
                            Your ticket has been successfully created. We'll get back to you soon.
                        </p>
                        <div className="glass-card p-4 mb-6">
                            <p className="text-sm text-gray-400 mb-2">Your Ticket ID</p>
                            <p className="text-2xl font-bold gradient-text">{ticketId}</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            A confirmation email has been sent to <span className="text-purple-400">{formData.userEmail}</span>
                        </p>
                        <div className="flex gap-4">
                            <Button onClick={() => navigate('/')} variant="secondary" className="flex-1">
                                Back to Home
                            </Button>
                            <Button
                                onClick={() => isAuthenticated ? navigate('/my-tickets') : navigate('/login')}
                                className="flex-1"
                            >
                                Track Ticket
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-4">Create Support Ticket</h1>
                    <p className="text-gray-300">Fill out the form below and we'll get back to you as soon as possible</p>
                </motion.div>

                {/* Logged in indicator */}
                {isAuthenticated && user && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <FaUser className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Logged in as</p>
                            <p className="text-white font-semibold">{user.name} ({user.email})</p>
                        </div>
                    </motion.div>
                )}

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <Input
                                    label="Full Name"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    icon={FaUser}
                                    placeholder="John Doe"
                                    required
                                    disabled={isAuthenticated}
                                    className={isAuthenticated ? 'opacity-75' : ''}
                                />
                                {isAuthenticated && (
                                    <FaLock className="absolute right-4 top-10 text-gray-500" size={12} />
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    label="Email Address"
                                    name="userEmail"
                                    type="email"
                                    value={formData.userEmail}
                                    onChange={handleChange}
                                    icon={FaEnvelope}
                                    placeholder="john@example.com"
                                    required
                                    disabled={isAuthenticated}
                                    className={isAuthenticated ? 'opacity-75' : ''}
                                />
                                {isAuthenticated && (
                                    <FaLock className="absolute right-4 top-10 text-gray-500" size={12} />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Product
                            </label>
                            <div className="relative">
                                <FaBox className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    required
                                >
                                    <option value="">Select a product</option>
                                    {products.map(product => (
                                        <option key={product} value={product}>{product}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            icon={FaHeading}
                            placeholder="Brief description of your issue"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field min-h-[150px] resize-none"
                                placeholder="Please provide detailed information about your issue..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Attachment (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="input-field cursor-pointer flex items-center gap-3"
                                >
                                    <FaUpload className="text-gray-400" />
                                    <span className="text-gray-400">
                                        {file ? file.name : 'Choose file (images, PDFs, documents)'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full" size="lg">
                            Submit Ticket
                        </Button>
                    </form>
                </Card>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateTicket;
