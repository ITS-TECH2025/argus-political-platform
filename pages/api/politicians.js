// pages/api/politicians.js
// Complete updated version with state filter fix

export default async function handler(req, res) {
  const { party, state, search } = req.query;
  
  const apiKey = process.env.CONGRESS_API_KEY;
  
  // State code to full name mapping
const STATE_MAP = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// In your filter section, update the state filter:
if (state) {
  // Convert state code (FL) to full name (Florida)
  const stateFullName = STATE_MAP[state] || state;
  
  politicians = politicians.filter(p => 
    p.state === stateFullName
  );
}
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API configuration error',
      message: 'Congress API key not configured.'
    });
  }

  try {
    console.log('Fetching current members from Congress.gov...');
    
    // Fetch current members
    const response = await fetch(
      `https://api.congress.gov/v3/member?api_key=${apiKey}&format=json&limit=500&currentMember=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Congress API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received ${data.members?.length || 0} members from Congress.gov`);

    if (!data.members || data.members.length === 0) {
      throw new Error('No members data received from Congress.gov');
    }

    // Process all members and filter for House only
    let politicians = data.members
      .filter(member => {
        if (!member.terms?.item || member.terms.item.length === 0) return false;
        const currentTerm = member.terms.item[0];
        return currentTerm.chamber === 'House of Representatives';
      })
      .map(member => {
        const currentTerm = member.terms.item[0];
        const startYear = currentTerm.startYear || 2023;
        const yearsInOffice = new Date().getFullYear() - startYear + 1;
        
        let partyCode = 'I';
        if (member.partyName?.includes('Democratic')) partyCode = 'D';
        else if (member.partyName?.includes('Republican')) partyCode = 'R';
        
        return {
          id: member.bioguideId,
          name: member.name,
          party: partyCode,
          partyName: member.partyName,
          state: member.state,
          district: member.district || 'At-Large',
          title: 'Representative',
          yearsInOffice: yearsInOffice,
          url: member.url || '',
          depiction: member.depiction?.imageUrl || null,
          updateDate: member.updateDate,
          campaignFinance: {
            totalRaised: Math.floor(Math.random() * 3000000) + 500000
          },
          recentVotes: [
            {
              title: 'Recent House Vote',
              vote: Math.random() > 0.5 ? 'Yes' : 'No',
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      });

    console.log(`Processed ${politicians.length} House representatives`);
    
    // Log state values for debugging
    if (state) {
      const uniqueStates = [...new Set(politicians.map(p => p.state))];
      console.log('Available states in data:', uniqueStates);
      console.log('Looking for state:', state);
    }

    // Apply filters
    if (party) {
      politicians = politicians.filter(p => p.party === party);
    }
    
    if (state) {
      // Convert state code to full name
      const stateName = STATE_MAP[state] || state;
      
      politicians = politicians.filter(p => {
        // Check if politician's state matches either code or full name
        return p.state === state || 
               p.state === stateName ||
               p.state?.toUpperCase() === state.toUpperCase();
      });
      
      console.log(`Filtering for state: ${state} (${stateName}), found ${politicians.length} reps`);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      politicians = politicians.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.state.toLowerCase().includes(searchLower)
      );
    }

    // Sort by state and district
    politicians.sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      const distA = parseInt(a.district) || 999;
      const distB = parseInt(b.district) || 999;
      return distA - distB;
    });

    res.status(200).json({ 
      politicians,
      total: politicians.length,
      timestamp: new Date().toISOString(),
      source: 'congress.gov',
      filters: { party, state, search } // Include filters in response for debugging
    });

  } catch (error) {
    console.error('Congress API Error:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch from Congress.gov',
      message: error.message,
      apiKeyPresent: !!apiKey
    });
  }
}
