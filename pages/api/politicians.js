// pages/api/politicians.js
// Updated to fetch ALL members with pagination

export default async function handler(req, res) {
  const { party, state, search } = req.query;
  
  const apiKey = process.env.CONGRESS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API configuration error',
      message: 'Congress API key not configured.'
    });
  }

  try {
    console.log('Fetching all current members from Congress.gov...');
    
    let allMembers = [];
    let offset = 0;
    const limit = 250; // Max allowed per request
    let hasMore = true;
    
    // Fetch all pages of members
    while (hasMore) {
      const response = await fetch(
        `https://api.congress.gov/v3/member?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}&currentMember=true`,
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
      
      if (data.members && data.members.length > 0) {
        allMembers = allMembers.concat(data.members);
        offset += limit;
        
        // Check if there are more pages
        hasMore = data.pagination && data.pagination.next;
        console.log(`Fetched ${allMembers.length} members so far...`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Total members fetched: ${allMembers.length}`);

    // Filter for House members only (not Senators)
    let politicians = allMembers
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
          chamber: 'House',
          yearsInOffice: yearsInOffice,
          url: member.url || '',
          depiction: member.depiction?.imageUrl || null,
          updateDate: member.updateDate,
          
          // REAL DATA from Congress.gov above this line
          // PLACEHOLDER DATA below this line (need other APIs for these):
          
          // Campaign finance - PLACEHOLDER (need FEC API)
          campaignFinance: {
            totalRaised: Math.floor(Math.random() * 3000000) + 500000,
            isPlaceholder: true
          },
          
          // Voting record - PLACEHOLDER (need separate API calls)
          recentVotes: [
            {
              title: 'Placeholder Vote Data',
              vote: Math.random() > 0.5 ? 'Yes' : 'No',
              date: new Date().toISOString().split('T')[0],
              isPlaceholder: true
            }
          ],
          
          // These would need additional API calls:
          votesWithPartyPct: null,
          missedVotesPct: null,
          office: null,
          phone: null,
          twitter: null
        };
      });

    console.log(`Processed ${politicians.length} House representatives`);

    // Apply filters
    if (party) {
      politicians = politicians.filter(p => p.party === party);
    }
    if (state) {
      politicians = politicians.filter(p => p.state === state);
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
      totalFetched: allMembers.length,
      timestamp: new Date().toISOString(),
      source: 'congress.gov',
      dataStatus: {
        realData: ['name', 'party', 'state', 'district', 'photo', 'yearsInOffice'],
        placeholderData: ['campaignFinance', 'recentVotes', 'votesWithPartyPct']
      }
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
