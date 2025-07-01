import React, { useState, useMemo } from 'react';
import { Search, DollarSign, FileText, Users, TrendingUp, ChevronRight, AlertCircle, Eye } from 'lucide-react';

// Mock data - will be replaced with real APIs later
const mockPoliticians = [
  {
    id: "H001234",
    name: "Sarah Johnson", 
    party: "D",
    state: "CA",
    district: "12",
    title: "Representative",
    yearsInOffice: 6,
    recentVotes: [
      { title: "Climate Action Act", vote: "Yes", date: "2024-06-15" }
    ],
    campaignFinance: { totalRaised: 2450000 }
  },
  {
    id: "H005678", 
    name: "Michael Rodriguez",
    party: "R",
    state: "TX", 
    district: "8",
    title: "Representative",
    yearsInOffice: 4,
    recentVotes: [
      { title: "Climate Action Act", vote: "No", date: "2024-06-15" }
    ],
    campaignFinance: { totalRaised: 1850000 }
  }
];

export default function ArgusPlatform() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const filteredPoliticians = useMemo(() => {
    return mockPoliticians.filter(politician => {
      const matchesSearch = politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          politician.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty = !selectedParty || politician.party === selectedParty;
      const matchesState = !selectedState || politician.state === selectedState;
      
      return matchesSearch && matchesParty && matchesState;
    });
  }, [searchTerm, selectedParty, selectedState]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Argus Branding */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Eye className="text-teal-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Argus</h1>
                <p className="text-sm text-gray-600">Political Accountability Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <AlertCircle size={16} />
            <span>Transparent data on your representatives • Non-partisan information</span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search representatives by name or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[140px]"
              >
                <option value="">All Parties</option>
                <option value="D">Democrat</option>
                <option value="R">Republican</option>
              </select>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[120px]"
              >
                <option value="">All States</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Users className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reps</p>
                <p className="text-2xl font-bold text-gray-900">{mockPoliticians.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Democrats</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockPoliticians.filter(p => p.party === 'D').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <div className="w-5 h-5 bg-red-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Republicans</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockPoliticians.filter(p => p.party === 'R').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <DollarSign className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Raised</p>
                <p className="text-2xl font-bold text-orange-600">$2.1M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Politicians Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {filteredPoliticians.length} Representative{filteredPoliticians.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPoliticians.map(politician => (
            <div key={politician.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{politician.name}</h3>
                  <p className="text-gray-600 mb-2">{politician.title} • {politician.state}-{politician.district}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    politician.party === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {politician.party === 'D' ? 'Democrat' : 'Republican'}
                  </span>
                </div>
                <ChevronRight className="text-gray-400 mt-2" size={20} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 mb-1">Years in Office</p>
                  <p className="font-semibold text-gray-900">{politician.yearsInOffice}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Raised</p>
                  <p className="font-semibold text-orange-600">
                    ${(politician.campaignFinance.totalRaised / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-gray-500 text-xs mb-2">Most Recent Vote</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {politician.recentVotes[0].title}
                  </p>
                  <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                    politician.recentVotes[0].vote === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {politician.recentVotes[0].vote}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="text-teal-600" size={20} />
              <span className="font-semibold text-gray-900">Argus</span>
            </div>
            <p className="text-sm text-gray-600">
              Data sources: ProPublica Congress API • FEC • OpenSecrets.org
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Non-partisan platform for informed civic engagement
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
