'use client';

import { useState } from 'react';
import { Mail, Send, Sparkles, Tag, Zap } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            setStatus('success');
            setMessage("You're in! Check your inbox for the best deals.");
            setEmail('');
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    };

    return (
        <section className="relative w-full py-12 sm:py-14 overflow-hidden bg-[#111111]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#FFD23F]/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#FFD23F]/15 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-[90%] max-w-3xl rounded-full bg-[#FFD23F]/5 blur-2xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl sm:rounded-3xl border border-[#FFD23F]/25 bg-gradient-to-br from-[#1a1a1a] via-[#111111] to-[#0d0d0d] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/40">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD23F]/15 border border-[#FFD23F]/30 px-3 py-1.5 mb-4">
                                <Sparkles className="w-3.5 h-3.5 text-[#FFD23F]" />
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FFD23F]">
                                    Free weekly deals
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-white leading-tight mb-3">
                                Never Miss a{' '}
                                <span className="text-[#FFD23F]">Hot Deal</span> Again
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto lg:mx-0 mb-5">
                                Join thousands of smart shoppers. Verified codes, flash sales &amp; exclusive
                                offers — delivered straight to your inbox.
                            </p>

                            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-300">
                                <li className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-[#FFD23F] shrink-0" />
                                    Top store codes
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-[#FFD23F] shrink-0" />
                                    Early sale alerts
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-[#FFD23F] shrink-0" />
                                    No spam, ever
                                </li>
                            </ul>
                        </div>

                        <div className="flex-1 w-full max-w-md lg:max-w-lg mx-auto lg:mx-0 lg:ml-auto">
                            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2 p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (status !== 'idle') setStatus('idle');
                                        }}
                                        placeholder="your@email.com"
                                        required
                                        disabled={status === 'loading'}
                                        className="w-full sm:flex-1 min-w-0 px-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FFD23F]/50 disabled:opacity-60"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="group w-full sm:w-auto shrink-0 px-6 py-3 bg-[#FFD23F] hover:bg-white text-[#111111] rounded-xl transition-all font-bold flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-[#FFD23F]/25 hover:shadow-[#FFD23F]/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? (
                                            <span className="w-5 h-5 border-2 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Get Deals
                                                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {message && (
                                    <p
                                        className={`text-sm font-medium text-center lg:text-left ${
                                            status === 'success' ? 'text-[#FFD23F]' : 'text-red-400'
                                        }`}
                                    >
                                        {message}
                                    </p>
                                )}

                                <p className="text-[11px] sm:text-xs text-gray-500 text-center lg:text-left">
                                    Unsubscribe anytime · 100% free
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
