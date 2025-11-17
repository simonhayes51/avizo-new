import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, TrendingUp, Award, Crown, Zap, Users, Plus, X, Edit2 } from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  available: boolean;
}

interface ClientLoyalty {
  id: string;
  clientName: string;
  points: number;
  tier: string;
  totalSpent: number;
  visits: number;
  lastVisit: Date;
}

export default function LoyaltyProgram() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'rewards' | 'clients'>('overview');
  const [showAddReward, setShowAddReward] = useState(false);

  const tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      color: 'from-amber-600 to-amber-700',
      icon: <Star className="w-6 h-6" />,
      benefits: ['Earn 1 point per $1 spent', 'Birthday reward', 'Special offers'],
    },
    {
      id: 'silver',
      name: 'Silver',
      minPoints: 500,
      color: 'from-slate-400 to-slate-500',
      icon: <Award className="w-6 h-6" />,
      benefits: ['Earn 1.5 points per $1', 'Priority booking', 'Birthday reward', '10% off special services'],
    },
    {
      id: 'gold',
      name: 'Gold',
      minPoints: 1000,
      color: 'from-yellow-500 to-yellow-600',
      icon: <Trophy className="w-6 h-6" />,
      benefits: ['Earn 2 points per $1', 'Priority booking', 'Birthday reward', '15% off all services', 'Free consultation'],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minPoints: 2500,
      color: 'from-purple-500 to-purple-600',
      icon: <Crown className="w-6 h-6" />,
      benefits: ['Earn 3 points per $1', 'VIP Priority booking', 'Birthday reward', '20% off all services', 'Free monthly service', 'Referral bonuses'],
    },
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Free Service',
      description: 'Redeem for any basic service',
      pointsCost: 500,
      available: true,
    },
    {
      id: '2',
      name: '20% Off',
      description: 'Get 20% off your next visit',
      pointsCost: 300,
      available: true,
    },
    {
      id: '3',
      name: 'Premium Treatment',
      description: 'Free upgrade to premium service',
      pointsCost: 750,
      available: true,
    },
    {
      id: '4',
      name: 'Gift Card $50',
      description: '$50 gift card for services',
      pointsCost: 1000,
      available: true,
    },
    {
      id: '5',
      name: 'VIP Package',
      description: 'Exclusive VIP treatment package',
      pointsCost: 2000,
      available: true,
    },
  ];

  const topClients: ClientLoyalty[] = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      points: 3200,
      tier: 'platinum',
      totalSpent: 9600,
      visits: 24,
      lastVisit: new Date('2025-11-15'),
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      points: 2100,
      tier: 'gold',
      totalSpent: 6300,
      visits: 18,
      lastVisit: new Date('2025-11-16'),
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      points: 1800,
      tier: 'gold',
      totalSpent: 5400,
      visits: 15,
      lastVisit: new Date('2025-11-14'),
    },
    {
      id: '4',
      clientName: 'James Wilson',
      points: 950,
      tier: 'silver',
      totalSpent: 2850,
      visits: 12,
      lastVisit: new Date('2025-11-10'),
    },
    {
      id: '5',
      clientName: 'Olivia Brown',
      points: 650,
      tier: 'silver',
      totalSpent: 1950,
      visits: 8,
      lastVisit: new Date('2025-11-13'),
    },
  ];

  const stats = {
    totalMembers: 247,
    activeMembers: 189,
    pointsIssued: 125400,
    rewardsRedeemed: 87,
    avgPointsPerClient: 508,
  };

  const getTierBadge = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return null;

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white bg-gradient-to-r ${tier.color} text-sm font-medium`}>
        {tier.icon}
        {tier.name}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Loyalty & Rewards</h1>
            <p className="text-slate-600 mt-1">Build customer loyalty with rewards</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddReward(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Add Reward
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'tiers'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Tiers
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'rewards'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Rewards Catalog
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'clients'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Top Clients
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-600">Total Members</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalMembers}</div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-600">Active Members</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.activeMembers}</div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-slate-600">Points Issued</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.pointsIssued.toLocaleString()}</div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-slate-600">Rewards Redeemed</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.rewardsRedeemed}</div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-slate-600">Avg Points/Client</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.avgPointsPerClient}</div>
            </div>
          </div>

          {/* Program Summary */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Loyalty Program at a Glance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-purple-100 mb-1">Engagement Rate</div>
                <div className="text-3xl font-bold">{((stats.activeMembers / stats.totalMembers) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-purple-100 mb-1">Redemption Rate</div>
                <div className="text-3xl font-bold">{((stats.rewardsRedeemed / stats.totalMembers) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-purple-100 mb-1">Total Value Given</div>
                <div className="text-3xl font-bold">${(stats.rewardsRedeemed * 25).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-gradient-to-br ${tier.color} rounded-xl p-6 text-white hover-lift`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className="text-white/80">{tier.minPoints}+ points</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white/90 mb-2">Benefits:</h4>
                {tier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-slate-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">{reward.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{reward.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-lg text-slate-900">{reward.pointsCost}</span>
                  <span className="text-sm text-slate-600">points</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reward.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {reward.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Client</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Tier</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Points</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Total Spent</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Visits</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {topClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-900">{client.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getTierBadge(client.tier)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-slate-900">{client.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-green-600">
                      ${client.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-slate-700">{client.visits}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {client.lastVisit.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      {showAddReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Add New Reward</h2>
              <button
                onClick={() => setShowAddReward(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reward Name</label>
                <input
                  type="text"
                  placeholder="e.g., Free Haircut"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the reward..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Points Cost</label>
                <input
                  type="number"
                  placeholder="500"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="available" className="text-sm text-slate-700">Make available immediately</label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowAddReward(false)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddReward(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Add Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
