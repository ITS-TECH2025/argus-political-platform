// pages/api/politicians.js
// CORRECTED VERSION - Fixed chamber detection logic

export default async function handler(req, res) {
  const { party, state, search, chamber } = req.query;

  const apiKey = process.env.CONGRESS_API_KEY;

  if (!apiKey) {
    console.error('CONGRESS_API_KEY not found in environment variables');
    return res.status(500).json({
      error: 'API configuration error',
      message: 'Congress API key not configured.',
    });
  }

  try {
    // --- Step 1: Fetch all current members from the Congress.gov API ---
    let allMembers = [];
    let offset = 0;
    const limit = 250; // Max members per API request
    let hasMore = true;

    console.log('Fetching all current members from Congress.gov...');

    while (hasMore) {
      const url = `https://api.congress.gov/v3/member?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}&currentMember=true`;
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Congress API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.members && data.members.length > 0) {
        allMembers = allMembers.concat(data.members);
        offset += data.members.length;
        hasMore = !!data.pagination?.next;
        console.log(`Fetched ${data.members.length} members. Total so far: ${allMembers.length}`);
      } else {
        hasMore = false;
      }
    }

    console.log(`Total members fetched from API: ${allMembers.length}`);

    // State code to full name mapping (kept as requested)
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

    // --- Step 2: Process the fetched members to create a clean data structure ---
    let politicians = allMembers
      .map(member => {
        const allTerms = member.terms?.item || [];
        if (allTerms.length === 0) {
          return null; // Skip if a member has no term data
        }

        // **CRITICAL FIX:** Find the most recent term by sorting terms by startYear descending.
        // Also check for endYear to ensure we get the current term
        const latestTerm = allTerms
          .filter(term => !term.endYear || term.endYear >= new Date().getFullYear()) // Current or future terms
          .sort((a, b) => (b.startYear || 0) - (a.startYear || 0))[0] || 
          allTerms.sort((a, b) => (b.startYear || 0) - (a.startYear || 0))[0]; // Fallback to most recent

        if (!latestTerm) {
          return null; // Skip if no valid term found
        }

        // **CRITICAL FIX:** Improved chamber detection logic
        // The Congress.gov API uses these exact strings for chamber identification
        let memberChamber = 'House';
        let title = 'Representative';
        let district = null;

        // Check chamber field more comprehensively
        const chamberStr = latestTerm.chamber?.toLowerCase() || '';
        
        if (chamberStr.includes('senate')) {
          memberChamber = 'Senate';
          title = 'Senator';
          district = null; // Senators don't have districts
        } else if (chamberStr.includes('house') || chamberStr.includes('representative')) {
          memberChamber = 'House';
          title = 'Representative';
          district = latestTerm.district || 'At-Large';
        } else {
          // If chamber is unclear, skip non-voting delegates and territories
          const stateCode = member.state?.toUpperCase();
          if (['PR', 'VI', 'GU', 'AS', 'MP', 'DC'].includes(stateCode)) {
            return null; // Skip non-voting delegates
          }
          // Default to House for unclear cases in the 50 states
          memberChamber = 'House';
          title = 'Representative';
          district = latestTerm.district || 'At-Large';
        }

        const startYear = latestTerm.startYear || new Date().getFullYear();
        const yearsInOffice = new Date().getFullYear() - startYear;

        let partyCode = 'I';
        if (member.partyName?.includes('Democratic')) partyCode = 'D';
        else if (member.partyName?.includes('Republican')) partyCode = 'R';

        return {
          id: member.bioguideId,
          name: member.name,
          party: partyCode,
          partyName: member.partyName,
          state: member.state, // The API provides the 2-letter code here
          district: district,
          title: title,
          chamber: memberChamber,
          yearsInOffice: yearsInOffice,
          url: member.url || '',
          depiction: member.depiction?.imageUrl || null,
          updateDate: member.updateDate,
          // Debug info to help troubleshoot
          _debug: {
            originalChamber: latestTerm.chamber,
            termStartYear: latestTerm.startYear,
            termEndYear: latestTerm.endYear,
          },
          // Placeholder data (to be replaced with real API data later)
          campaignFinance: {
            totalRaised: Math.floor(Math.random() * 3000000) + 500000,
          },
          recentVotes: [
            {
              title: memberChamber === 'Senate' ? 'Recent Senate Vote' : 'Recent House Vote',
              vote: Math.random() > 0.5 ? 'Yes' : 'No',
              date: new Date().toISOString().split('T')[0],
            },
          ],
        };
      })
      .filter(Boolean); // This removes any null entries from the map operation.

    console.log(`Processed ${politicians.length} voting members.`);
    
    // Log chamber breakdown for debugging
    const houseCount = politicians.filter(p => p.chamber === 'House').length;
    const senateCount = politicians.filter(p => p.chamber === 'Senate').length;
    console.log(`Chamber breakdown: ${houseCount} House, ${senateCount} Senate`);

    // --- Step 3: Apply filters based on query parameters ---
    let filteredPoliticians = [...politicians];

    if (party) {
      filteredPoliticians = filteredPoliticians.filter(p => p.party === party);
    }

    if (state) {
      const stateFullName = STATE_MAP[state.toUpperCase()] || state;
      filteredPoliticians = filteredPoliticians.filter(p => p.state === state.toUpperCase() || p.state === stateFullName);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPoliticians = filteredPoliticians.filter(p =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    if (chamber) {
      filteredPoliticians = filteredPoliticians.filter(p => p.chamber === chamber);
    }
    
    console.log(`Returning ${filteredPoliticians.length} members after filtering.`);

    // --- Step 4: Sort the final results ---
    filteredPoliticians.sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      if (a.chamber !== b.chamber) return a.chamber.localeCompare(b.chamber);
      // Sort by district number for House members
      const distA = parseInt(a.district) || 999;
      const distB = parseInt(b.district) || 999;
      return distA - distB;
    });

    // --- Step 5: Send the response ---
    res.status(200).json({
      politicians: filteredPoliticians,
      total: filteredPoliticians.length,
      totalFetched: allMembers.length,
      chamberBreakdown: {
        house: houseCount,
        senate: senateCount,
      },
      timestamp: new Date().toISOString(),
      source: 'congress.gov',
      filters: { party, state, search, chamber },
    });

  } catch (error) {
    console.error('Error in /api/politicians:', error);
    res.status(500).json({
      error: 'Failed to fetch data from Congress.gov',
      message: error.message,
      apiKeyPresent: !!apiKey,
    });
  }
}
