import { useState, useEffect } from 'react';
import { Search, Users, DollarSign } from 'lucide-react';

// Utility function to fetch politicians
const fetchPoliticians = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.party) params.append('party', filters.party);
  if (filters.state) params.append('state', filters.state);
  if (filters.search) params.append('search', filters.search);
  if (filters.chamber) params.append('chamber', filters.chamber);
  
  const response = await fetch(`/api/politicians?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch politicians');
  }
  
  return response.json();
};

export default function Home() {
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedChamber, setSelectedChamber] = useState('');

  // Update the useEffect to include chamber
  useEffect(() => {
    const loadPoliticians = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchPoliticians({
          party: selectedParty,
          state: selectedState,
          search: searchTerm,
          chamber: selectedChamber
        });
        setPoliticians(data.politicians);
      } catch (err) {
        setError('Failed to load politicians. Please try again later.');
        console.error('Error loading politicians:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadPoliticians, searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedParty, selectedState, selectedChamber]);

  // Update the stats to show chamber breakdown
  const stats = {
    total: politicians.length,
    house: politicians.filter(p => p.chamber === 'House').length,
    senate: politicians.filter(p => p.chamber === 'Senate').length,
    democrats: politicians.filter(p => p.party === 'D').length,
    republicans: politicians.filter(p => p.party === 'R').length,
    independents: politicians.filter(p => p.party === 'I').length,
    avgRaised: politicians.length > 0 
      ? politicians.reduce((sum, p) => sum + (p.campaignFinance?.totalRaised || 0), 0) / politicians.length
      : 0
  };

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Argus</h1>
              <p className="text-gray-600">Political Accountability Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Real-time data on US Congress • Non-partisan information</span>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
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

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Party Filter */}
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[140px]"
              >
                <option value="">All Parties</option>
                <option value="D">Democrat</option>
                <option value="R">Republican</option>
                <option value="I">Independent</option>
              </select>

              {/* State Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[140px]"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              {/* Chamber Filter */}
              <select
                value={selectedChamber}
                onChange={(e) => setSelectedChamber(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[140px]"
              >
                <option value="">All Chambers</option>
                <option value="House">House</option>
                <option value="Senate">Senate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Users className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Democrats</p>
                <p className="text-2xl font-bold text-blue-600">{stats.democrats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Users className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Republicans</p>
                <p className="text-2xl font-bold text-red-600">{stats.republicans}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ${(stats.avgRaised / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Loading...' : `${stats.total} Representatives Found`}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading politicians...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {politicians.map((politician) => (
                <div key={politician.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {politician.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {politician.title} • {politician.state}{politician.chamber === 'House' && politician.district ? `-${politician.district}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          politician.party === 'D' ? 'bg-blue-100 text-blue-800' :
                          politician.party === 'R' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {politician.party === 'D' ? 'Democrat' : 
                           politician.party === 'R' ? 'Republican' : 'Independent'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Years in Office</div>
                      <div className="text-lg font-semibold text-gray-900 mb-3">
                        {politician.yearsInOffice}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">Campaign Funds</div>
                      <div className="text-lg font-semibold text-orange-600 mb-3">
                        ${(politician.campaignFinance.totalRaised / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-500 mb-1">Most Recent Vote</div>
                      <div className="text-sm">
                        <div className="text-gray-700">{politician.recentVotes[0].title}</div>
                        <span className={`font-medium ${
                          politician.recentVotes[0].vote === 'Yes' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {politician.recentVotes[0].vote}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

