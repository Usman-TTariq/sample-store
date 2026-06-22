'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      iconBg: 'bg-[#FFFBF0]',
      iconColor: 'text-[#B8860B]',
      title: 'Log In & Shop',
      description: 'Click to select your favorite coupon, explore amazing deals, and start shopping.',
    },
    {
      number: 2,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-[#FFFBF0]',
      iconColor: 'text-[#B8860B]',
      title: 'Get Rewards',
      description: 'Cashback rewards are instantly added to your wallet, ready for future use.',
    },
    {
      number: 3,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          <circle cx="8" cy="15" r="1" fill="currentColor" />
          <circle cx="16" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
      iconBg: 'bg-[#FFFBF0]',
      iconColor: 'text-[#B8860B]',
      title: 'Withdraw Cashback',
      description: 'Cashback gets added to your bank account, or as a voucher or recharge option instantly.',
    },
  ];

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 px-2 sm:px-0">
          How to Save
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 flex items-start overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD23F] to-[#1D63FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="absolute top-2 right-3">
                <span className="text-5xl font-black text-gray-100 leading-none select-none">
                  {step.number}
                </span>
              </div>
              <div className={`${step.iconBg} ${step.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 relative z-10 shadow-sm`}>
                <div className="w-7 h-7">{step.icon}</div>
              </div>
              <div className="relative z-10 flex-1 pr-8">
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

