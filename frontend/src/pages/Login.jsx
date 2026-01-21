import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'DEVELOPER') {
                navigate('/developer');
            } else {
                navigate('/my-tickets');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                    <h1 className="text-4xl font-bold gradient-text mb-4">Welcome Back</h1>
                    <p className="text-gray-300">Login to track your tickets and get support</p>
                </motion.div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={FaEnvelope}
                            placeholder="your@email.com"
                            required
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
                        />

                        <Button type="submit" loading={loading} className="w-full" size="lg">
                            <FaSignInAlt />
                            Login
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                Register here
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

export default Login;
