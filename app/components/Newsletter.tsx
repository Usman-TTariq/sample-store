'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Newsletter subscription:', email);
        alert(`Thank you for subscribing with ${email}!`);
        setEmail('');
    };

    return (
        <section className="relative w-full py-10 sm:py-12 bg-[#FFD23F] overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    {/* Left Side - Text */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 leading-snug">
                            Subscribe Our Newsletter To Get The Best
                        </h2>
                        <p className="text-white/95 font-medium text-sm sm:text-base">
                            Deals Right In Your Email
                        </p>
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1 w-full max-w-md">
                        <form
                            onSubmit={handleNewsletterSubmit}
                            className="flex flex-col sm:flex-row gap-3 w-full"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter Email"
                                required
                                className="w-full sm:flex-1 min-w-0 px-4 sm:px-6 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                            />
                            <button
                                type="submit"
                                className="w-full sm:w-auto shrink-0 px-6 py-3 bg-[#FFD23F] hover:bg-black hover:text-white border-2 border-white text-black rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                Send
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
