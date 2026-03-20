import { 
    CreditCardIcon, 
    CheckIcon, 
    ChartBarIcon, 
    CubeIcon, 
    BellIcon, 
    ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SubscriptionPage = () => {
    const selectedTier = 'pro'; // Hardcoded for demo
    const tiers = ['Free', 'Pro', 'Enterprise'];
    const usage = {
        users: 75,
        maxUsers: 100,
        storage: 4.2,
        maxStorage: 10
    };

    const tierDetails = {
        free: {
            price: '$0',
            period: 'forever',
            features: ['Up to 10 Students', 'Basic Quiz System', 'Public Dashboard', 'Email Support']
        },
        pro: {
            price: '$49',
            period: 'per month',
            features: ['Up to 500 Students', 'AI Question Generator', 'Advanced Analytics', 'Priority Support', 'Custom Branding']
        },
        enterprise: {
            price: 'Custom',
            period: 'per institute',
            features: ['Unlimited Students', 'Full AI Integration', 'Dedicated Account Manager', 'SLA Guarantee', 'On-premise Options']
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans bg-white min-h-screen">
            {/* Header Section */}
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Institute Subscription</h1>
                <p className="text-gray-500 font-medium">Manage your billing, usage, and plan details for your learning community.</p>
            </header>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Active Plan Card */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-primary-100 text-xs font-bold uppercase tracking-wider mb-2">Current Plan</p>
                        <h2 className="text-3xl font-black mb-4">Pro Plan</h2>
                        <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                            <ShieldCheckIcon className="w-4 h-4" />
                            Active until Oct 12, 2026
                        </div>
                    </div>
                    <CubeIcon className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                </div>

                {/* Usage Stats */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Active Students</p>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-black text-gray-900">{usage.users}</span>
                            <span className="text-gray-400 font-bold mb-1">/ {usage.maxUsers}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full" style={{ width: `${(usage.users/usage.maxUsers)*100}%` }}></div>
                    </div>
                </div>

                {/* Storage Stats */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Cloud Storage</p>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-black text-gray-900">{usage.storage}GB</span>
                            <span className="text-gray-400 font-bold mb-1">/ {usage.maxStorage}GB</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(usage.storage/usage.maxStorage)*100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Billing Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6 text-primary-500" />
                        Payment Methods
                    </h2>
                    <div className="space-y-4">
                        <div className="border-2 border-primary-100 bg-primary-50/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <div className="w-8 h-5 bg-blue-600 rounded-sm"></div> {/* Visa Mock */}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-gray-500">Expires 09/27 • Default</p>
                                </div>
                            </div>
                            <button className="text-primary-600 font-bold text-sm">Edit</button>
                        </div>
                        <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary-300 hover:text-primary-500 transition-all">
                            + Add Payment Method
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <BellIcon className="w-6 h-6 text-primary-500" />
                        Billing History
                    </h2>
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-900">Sept 12, 202{6-i}</p>
                                    <p className="text-xs text-gray-500">Invoice #VID-{4000+i}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-900">$49.00</span>
                                    <button className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200">
                                        <ChartBarIcon className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Pricing Tiers */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-8">Compare Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.entries(tierDetails).map(([tier, details]) => (
                        <div key={tier} className={`rounded-xl p-8 border-2 transition-all duration-300 hover:scale-105 ${tier === selectedTier ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold capitalize">{tier}</h3>
                                {tier === selectedTier && (
                                    <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">Current</span>
                                )}
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black">{details.price}</span>
                                <span className="text-gray-500">/{details.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {details.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-sm text-gray-600">
                                        <CheckIcon className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                className={`w-full py-3 rounded-lg font-bold transition-all ${
                                    tier === selectedTier 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg active:scale-95'
                                }`}
                                disabled={tier === selectedTier}
                            >
                                {tier === selectedTier ? 'Active Plan' : 'Select Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Support Section */}
            <section className="bg-gradient-to-br from-gray-900 to-primary-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">Need Help?</h2>
                    <p className="text-primary-100 mb-8 max-w-2xl mx-auto opacity-80">
                        Our technical team is available to assist with any platform issues, account management, or reporting queries.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-primary-50 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
            </section>
        </div>
    );
};

export default SubscriptionPage;
