import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaSignInAlt, FaRocket } from 'react-icons/fa';
import Button from '../components/ui/Button';

const Landing = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 z-0" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/50 mb-6">
                            <FaRocket className="text-white text-5xl" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text">
                        Tashkhees
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                        Support Center
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Get help with all Tashkhees products - RxScan, Medscribe, Legalyze, DICOM Viewer, and more
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 mb-12"
                >
                    <Link to="/create-ticket">
                        <Button size="lg" className="min-w-[200px]">
                            <FaTicketAlt />
                            Create New Ticket
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline" size="lg" className="min-w-[200px]">
                            <FaSignInAlt />
                            Login
                        </Button>
                    </Link>
                </motion.div>

                {/* Info Text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-gray-400 text-sm"
                >
                    Already have a ticket? Track its progress after login
                </motion.p>

                {/* Floating Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
                >
                    {[
                        { icon: '🎯', title: 'Fast Response', desc: 'Get help within 24 hours' },
                        { icon: '🔒', title: 'Secure', desc: 'Your data is protected' },
                        { icon: '📊', title: 'Track Progress', desc: 'Real-time status updates' },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + index * 0.2 }}
                            className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300"
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Landing;
