import React, { useState, useEffect } from 'react';
import { Search, DollarSign, FileText, Users, TrendingUp, ChevronRight, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { fetchPoliticians } from '../lib/api';
import { US_STATES } from '../lib/states';

export default function ArgusPlatform() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch politicians when component mounts or filters change
  useEffect(() => {
    const loadPoliticians = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchPoliticians({
          party: selectedParty,
          state: selectedState,
          search: searchTerm
        });
        setPoliticians(data.politicians);
      } catch (err) {
        setError('Failed to load politicians. Please try again later.');
        console.error('Error loading politicians:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(loadPoliticians, searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedParty, selectedState]);

  // Calculate statistics
  const stats = {
    total: politicians.length,
    democrats: politicians.filter(p => p.party === 'D').length,
    republicans: politicians.filter(p => p.party === 'R').length,
    independents: politicians.filter(p => p.party === 'I').length,
    avgRaised: politicians.length > 0 
      ? politicians.reduce((sum, p) => sum + (p.campaignFinance?.totalRaised || 0), 0) / politicians.length
      : 0
  };

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
            <span>Real-time data on US Representatives • Non-partisan information</span>
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
                <option value="I">Independent</option>
              </select>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[120px]"
              >
                <option value="">All States</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
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
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-blue-600">{stats.democrats}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  ${stats.avgRaised > 1000000 
                    ? `${(stats.avgRaised / 1000000).toFixed(1)}M`
                    : `${(stats.avgRaised / 1000).toFixed(0)}K`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Politicians Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-teal-600" size={48} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="text-red-600 mx-auto mb-2" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {politicians.length} Representative{politicians.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {politicians.map(politician => (
                <div key={politician.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{politician.name}</h3>
                      <p className="text-gray-600 mb-2">
                        {politician.title} • {politician.state}-{politician.district || 'At Large'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          politician.party === 'D' ? 'bg-blue-100 text-blue-800' : 
                          politician.party === 'R' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {politician.party === 'D' ? 'Democrat' : 
                           politician.party === 'R' ? 'Republican' : 
                           'Independent'}
                        </span>
                        {politician.votesWithPartyPct && (
                          <span className="text-xs text-gray-500">
                            Votes with party {politician.votesWithPartyPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 mt-2" size={20} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 mb-1">Years in Office</p>
                      <p className="font-semibold text-gray-900">{politician.yearsInOffice}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Campaign Funds</p>
                      <p className="font-semibold text-orange-600">
                        {politician.campaignFinance?.totalRaised 
                          ? `$${(politician.campaignFinance.totalRaised / 1000000).toFixed(1)}M`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {politician.recentVotes && politician.recentVotes.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-gray-500 text-xs mb-2">Most Recent Vote</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">
                          {politician.recentVotes[0].title}
                        </p>
                        <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                          politician.recentVotes[0].vote === 'Yes' ? 'bg-green-100 text-green-800' : 
                          politician.recentVotes[0].vote === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {politician.recentVotes[0].vote}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {politician.twitter && (
                    <div className="mt-3 text-xs text-gray-500">
                      Twitter: @{politician.twitter}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
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
              Data sources: Congress.gov API • FEC • OpenSecrets.org
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Real-time data • Updated daily • Non-partisan platform for informed civic engagement
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
