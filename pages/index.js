  // Updates for pages/index.js

// Add chamber state at the top with other states:
const [selectedChamber, setSelectedChamber] = useState('');

// Update the useEffect to include chamber:
useEffect(() => {
  const loadPoliticians = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPoliticians({
        party: selectedParty,
        state: selectedState,
        search: searchTerm,
        chamber: selectedChamber  // Add this line
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
}, [searchTerm, selectedParty, selectedState, selectedChamber]); // Add selectedChamber here

// Add Chamber dropdown in the filters section (after the state dropdown):
<select
  value={selectedChamber}
  onChange={(e) => setSelectedChamber(e.target.value)}
  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white min-w-[140px]"
>
  <option value="">All Chambers</option>
  <option value="House">House</option>
  <option value="Senate">Senate</option>
</select>

// Update the subtitle in the header to reflect all of Congress:
<span>Real-time data on US Congress • Non-partisan information</span>

// Update the stats to show chamber breakdown:
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

// Update the stats display to show House/Senate counts:
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex items-center gap-3">
    <div className="bg-teal-100 p-2 rounded-lg">
      <Users className="text-teal-600" size={20} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">House</p>
      <p className="text-2xl font-bold text-gray-900">{stats.house}</p>
    </div>
  </div>
</div>

<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex items-center gap-3">
    <div className="bg-purple-100 p-2 rounded-lg">
      <Users className="text-purple-600" size={20} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">Senate</p>
      <p className="text-2xl font-bold text-gray-900">{stats.senate}</p>
    </div>
  </div>
</div>

// Update the politician cards to show chamber-specific info:
<p className="text-gray-600 mb-2">
  {politician.title} • {politician.state}{politician.chamber === 'House' && politician.district ? `-${politician.district}` : ''}
</p>
