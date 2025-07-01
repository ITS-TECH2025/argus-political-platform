// pages/api/politicians.js
// Complete working version with House and Senate support

export default async function handler(req, res) {
  const { party, state, search, chamber } = req.query;
  
  // Get API key from environment variable
  const apiKey = process.env.CONGRESS_API_KEY;
  
  if (!apiKey) {
    console.error('CONGRESS_API_KEY not found in environment variables');
    return res.status(500).json({ 
      error: 'API configuration error',
      message: 'Congress API key not configured.'
    });
  }

  try {
    console.log('Fetching all current members from Congress.gov...');
    
    // Fetch ALL members with pagination
    let allMembers = [];
    let offset = 0;
    const limit = 250; // Max per request
    let hasMore = true;
    
    while (hasMore) {
      const url = `https://api.congress.gov/v3/member?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}&currentMember=true`;
      console.log(`Fetching members ${offset} to ${offset + limit}...`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Congress API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.members && data.members.length > 0) {
        allMembers = allMembers.concat(data.members);
        offset += data.members.length;
        
        // Check if there's a next page
        hasMore = data.pagination && data.pagination.next;
        console.log(`Got ${data.members.length} members, total so far: ${allMembers.length}`);
      } else {
        hasMore = false;
      }
      
      // Safety check to prevent infinite loops
      if (offset > 1000) {
        console.log('Safety limit reached');
        hasMore = false;
      }
    }
    
    console.log(`Total members fetched: ${allMembers.length}`);

    // Debug: Check what chamber values we're getting
if (req.query.debug === 'chambers') {
  const chamberTypes = {};
  allMembers.forEach(member => {
    const chamber = member.terms?.item?.[0]?.chamber || 'No chamber';
    chamberTypes[chamber] = (chamberTypes[chamber] || 0) + 1;
  });
  
  // Also show a few Senate examples if any
  const senateExamples = allMembers
    .filter(m => m.terms?.item?>[0]?.chamber?.toLowerCase().includes('senat'))
    .slice(0, 3)
    .map(m => ({
      name: m.name,
      state: m.state,
      chamber: m.terms.item[0].chamber
    }));
  
  return res.status(200).json({
    chamberTypes,
    senateExamples,
    totalMembers: allMembers.length
  });
}    // State code to full name mapping
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
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
      'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa',
      'MP': 'Northern Mariana Islands'
    };

    // Process all members - include both House AND Senate
    let politicians = allMembers
      .filter(member => {
        if (!member.terms?.item || member.terms.item.length === 0) return false;
        const currentTerm = member.terms.item[0];
        // Include both chambers
        return currentTerm.chamber === 'House of Representatives' || 
               currentTerm.chamber === 'Senate';
      })
      .map(member => {
        const currentTerm = member.terms.item[0];
        const startYear = currentTerm.startYear || 2023;
        const yearsInOffice = new Date().getFullYear() - startYear + 1;
        
        // Determine chamber and title
        let memberChamber = 'House';
        let title = 'Representative';
        
        if (currentTerm.chamber === 'Senate') {
          memberChamber = 'Senate';
          title = 'Senator';
        }
        
        let partyCode = 'I';
        if (member.partyName?.includes('Democratic')) partyCode = 'D';
        else if (member.partyName?.includes('Republican')) partyCode = 'R';
        
        return {
          id: member.bioguideId,
          name: member.name,
          party: partyCode,
          partyName: member.partyName,
          state: member.state,
          district: memberChamber === 'House' ? (member.district || 'At-Large') : null,
          title: title,
          chamber: memberChamber,
          yearsInOffice: yearsInOffice,
          url: member.url || '',
          depiction: member.depiction?.imageUrl || null,
          updateDate: member.updateDate,
          campaignFinance: {
            totalRaised: Math.floor(Math.random() * 3000000) + 500000
          },
          recentVotes: [
            {
              title: 'Recent Vote',
              vote: Math.random() > 0.5 ? 'Yes' : 'No',
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      });

    console.log(`Processed ${politicians.length} Congress members`);

    // Apply filters
    if (party) {
      politicians = politicians.filter(p => p.party === party);
      console.log(`After party filter: ${politicians.length} members`);
    }
    
    if (state) {
      // Convert state code to full name if needed
      const stateFullName = STATE_MAP[state] || state;
      console.log(`Filtering for state: ${state} -> ${stateFullName}`);
      
      politicians = politicians.filter(p => {
        return p.state === stateFullName || p.state === state;
      });
      
      console.log(`After state filter: ${politicians.length} members`);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      politicians = politicians.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.state.toLowerCase().includes(searchLower)
      );
      console.log(`After search filter: ${politicians.length} members`);
    }
    
    if (chamber) {
      politicians = politicians.filter(p => p.chamber === chamber);
      console.log(`After chamber filter: ${politicians.length} members`);
    }

    // Sort by state and district
    politicians.sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      if (a.chamber !== b.chamber) return a.chamber.localeCompare(b.chamber);
      const distA = parseInt(a.district) || 999;
      const distB = parseInt(b.district) || 999;
      return distA - distB;
    });

    res.status(200).json({ 
      politicians,
      total: politicians.length,
      totalFetched: allMembers.length,
      timestamp: new Date().toISOString(),
      source: 'congress.gov',
      filters: { party, state, search, chamber }
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
