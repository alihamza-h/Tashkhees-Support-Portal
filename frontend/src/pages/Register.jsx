import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaKey, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [licenseValid, setLicenseValid] = useState(null);
    const [licenseProduct, setLicenseProduct] = useState(null);
    const [validatingLicense, setValidatingLicense] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        licenseKey: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        // Reset license validation when key changes
        if (e.target.name === 'licenseKey') {
            setLicenseValid(null);
            setLicenseProduct(null);
        }
    };

    const validateLicenseKey = async () => {
        if (!formData.licenseKey || formData.licenseKey.trim().length < 10) {
            toast.error('Please enter a valid license key');
            return;
        }

        setValidatingLicense(true);
        try {
            const response = await api.post('/licenses/validate', { code: formData.licenseKey });
            if (response.data.valid) {
                setLicenseValid(true);
                setLicenseProduct(response.data.data?.product);
                toast.success('License key is valid!');
            } else {
                setLicenseValid(false);
                toast.error(response.data.message);
            }
        } catch (error) {
            setLicenseValid(false);
            toast.error(error.response?.data?.message || 'Invalid license key');
        } finally {
            setValidatingLicense(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate license key first
        if (!licenseValid) {
            toast.error('Please validate your license key first');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const user = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.licenseKey
            );
            toast.success(`Welcome to Tashkhees, ${user.name}!`);
            navigate('/my-tickets');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-4">Product Registration</h1>
                    <p className="text-gray-300">Register with your product license key</p>
                </motion.div>

                <Card>
                    {/* Info Banner */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                    >
                        <div className="flex gap-3">
                            <FaInfoCircle className="text-blue-400 text-lg flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-blue-300 text-sm font-medium mb-1">License Key Required</p>
                                <p className="text-blue-200/70 text-xs">
                                    You need a valid license key to register. This key was provided when you purchased a Tashkhees product.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* License Key Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <FaKey className="inline mr-2" />
                                License Key <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="licenseKey"
                                    value={formData.licenseKey}
                                    onChange={handleChange}
                                    placeholder="TSK-XXXX-XXXX-XXXX"
                                    className={`input-field flex-1 font-mono uppercase ${licenseValid === true ? 'border-green-500 bg-green-500/10' :
                                            licenseValid === false ? 'border-red-500 bg-red-500/10' : ''
                                        }`}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={validateLicenseKey}
                                    loading={validatingLicense}
                                    disabled={!formData.licenseKey || formData.licenseKey.length < 10}
                                >
                                    Verify
                                </Button>
                            </div>

                            {/* License Status */}
                            {licenseValid === true && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center gap-2 text-green-400 text-sm"
                                >
                                    <FaCheckCircle />
                                    <span>Valid license for <span className="font-semibold">{licenseProduct}</span></span>
                                </motion.div>
                            )}

                            {licenseValid === false && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center gap-2 text-red-400 text-sm"
                                >
                                    <FaTimesCircle />
                                    <span>Invalid or already used license key</span>
                                </motion.div>
                            )}
                        </div>

                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            icon={FaUser}
                            placeholder="Your full name"
                            required
                            disabled={!licenseValid}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={FaEnvelope}
                            placeholder="your@email.com"
                            required
                            disabled={!licenseValid}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            icon={FaLock}
                            placeholder="••••••••"
                            required
                            disabled={!licenseValid}
                        />

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            icon={FaLock}
                            placeholder="••••••••"
                            required
                            disabled={!licenseValid}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                            disabled={!licenseValid}
                        >
                            <FaUserPlus />
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                Login here
                            </Link>
                        </p>
                    </div>
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

export default Register;
