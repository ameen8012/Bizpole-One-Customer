import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaHandshake, FaChartLine, FaUsers, FaArrowRight, FaRocket } from "react-icons/fa";
import { useState } from "react";
import PartnerSignupModal from "../components/Modals/PartnerSignupModal";
import PartnerLoginModal from "../components/Modals/PartnerLoginModal";

const Partners = () => {
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const benefits = [
        {
            icon: <FaChartLine className="text-4xl text-yellow-500" />,
            title: "Increased Revenue",
            description: "Expand your service portfolio and generate new revenue streams through our partnership program."
        },
        {
            icon: <FaUsers className="text-4xl text-yellow-500" />,
            title: "Wide Network",
            description: "Gain access to our extensive network of businesses and professionals across India."
        },
        {
            icon: <FaHandshake className="text-4xl text-yellow-500" />,
            title: "Dedicated Support",
            description: "Get prioritized support and a dedicated account manager to help you succeed."
        },
        {
            icon: <FaRocket className="text-4xl text-yellow-500" />,
            title: "Advanced Tools",
            description: "Utilize our AI-powered platform and dashboard to manage your clients efficiently."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-gray-50">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-400/10 skew-x-12 transform translate-x-1/2 -z-0" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 mb-12 md:mb-0" data-aos="fade-right">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-6 leading-tight">
                                    Grow Your Business <br />
                                    <span className="text-yellow-500">Partner With Us</span>
                                </h1>
                                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                    Join India's fastest-growing business network. We empower partners with the technology and support needed to scale and succeed in the digital economy.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => setIsSignupModalOpen(true)}
                                        className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-500 transition-all flex items-center gap-2"
                                    >
                                        Join Partner Program <FaArrowRight />
                                    </button>
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="border-2 border-black text-black px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-md active:scale-95"
                                    >
                                        Existing Partner
                                    </button>
                                    <button className="text-gray-600 font-medium hover:text-black transition-all underline underline-offset-4">
                                        Learn More
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="md:w-1/2 relative" data-aos="fade-left">
                            <div className="w-full h-80 md:h-[500px] bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <FaHandshake className="text-white text-[150px] opacity-40" />
                                </div>
                                {/* Decorative circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">Why Partner With Bizpole?</h2>
                        <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-yellow-400 hover:shadow-xl transition-all duration-300"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="mb-6">{benefit.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-black">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-black text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-6 text-center relative z-10" data-aos="zoom-in">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to take the next step?</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Become a part of our ecosystem today and unlock limitless opportunities for growth and innovation. Or contact us for any query.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button
                            onClick={() => setIsSignupModalOpen(true)}
                            className="bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-all shadow-xl"
                        >
                            Become a Partner Now
                        </button>
                        <button className="bg-transparent border-2 border-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Signup Modal */}
            <PartnerSignupModal
                isOpen={isSignupModalOpen}
                onClose={() => setIsSignupModalOpen(false)}
                onSwitchToLogin={() => {
                    setIsSignupModalOpen(false);
                    setIsLoginModalOpen(true);
                }}
            />

            <PartnerLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToSignup={() => {
                    setIsLoginModalOpen(false);
                    setIsSignupModalOpen(true);
                }}
            />
        </div>
    );
};

export default Partners;
