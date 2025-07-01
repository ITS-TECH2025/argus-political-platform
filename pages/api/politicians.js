// pages/api/politicians.js
// Using Congress.gov API - No API key required!

export default async function handler(req, res) {
  const { party, state, search } = req.query;

  try {
    // Fetch current members from Congress.gov API
    // This gets the 118th Congress (current) House members
    const membersResponse = await fetch(
      'https://api.congress.gov/v3/member?format=json&limit=450&currentMember=true'
    );

    if (!membersResponse.ok) {
      throw new Error('Failed to fetch from Congress.gov');
    }

    const membersData = await membersResponse.json();
    const members = membersData.members || [];

    // Transform the data to match your component structure
    let politicians = members
      .filter(member => member.terms && member.terms.item && member.terms.item.length > 0)
      .map(member => {
        // Get the most recent term
        const currentTerm = member.terms.item[0];
        const isHouse = currentTerm.chamber === 'House of Representatives';
        
        // Calculate years in office
        const firstTermStart = member.terms.item[member.terms.item.length - 1].startYear;
        const yearsInOffice = new Date().getFullYear() - firstTermStart;

        return {
          id: member.bioguideId,
          name: member.name,
          party: member.partyName === 'Democratic' ? 'D' : 
                 member.partyName === 'Republican' ? 'R' : 'I',
          state: member.state,
          district: isHouse ? currentTerm.district : null,
          title: isHouse ? 'Representative' : 'Senator',
          chamber: currentTerm.chamber,
          yearsInOffice: yearsInOffice,
          url: member.officialWebsiteUrl,
          depiction: member.depiction ? member.depiction.imageUrl : null,
          terms: member.terms.item,
          campaignFinance: {
            totalRaised: 0 // We'll need FEC API for this
          },
          recentVotes: [] // We'll fetch this separately if needed
        };
      })
      .filter(p => p.chamber === 'House of Representatives'); // Filter for House only

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

    // For campaign finance, we can use the FEC API (also free, no key required)
    // Note: This is simplified - in production you'd want to batch these requests
    const limitedPoliticians = politicians.slice(0, 20); // Limit for demo
    
    for (let politician of limitedPoliticians) {
      try {
        // FEC uses a different ID format, so we'd need to map bioguideId to FEC ID
        // For now, we'll skip this, but you can implement it later
        politician.campaignFinance.totalRaised = Math.random() * 5000000; // Placeholder
      } catch (error) {
        console.error(`Failed to fetch finance data for ${politician.name}`);
      }
    }

    // Sort by state and district
    politicians.sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      return (a.district || '').localeCompare(b.district || '');
    });

    res.status(200).json({ 
      politicians,
      total: politicians.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch politician data',
      message: error.message 
    });
  }
}

// Alternative approach using GovTrack.us API (also free)
// pages/api/politicians-govtrack.js

export async function fetchFromGovTrack() {
  try {
    // GovTrack provides data in a different format
    const response = await fetch(
      'https://www.govtrack.us/api/v2/role?current=true&role_type=representative&limit=450'
    );
    
    const data = await response.json();
    
    return data.objects.map(role => ({
      id: role.person.bioguideid,
      name: role.person.name,
      party: role.party,
      state: role.state,
      district: role.district,
      title: role.role_type_label,
      startDate: role.startdate,
      endDate: role.enddate,
      website: role.website,
      phone: role.phone,
      office: role.extra.office,
      // GovTrack includes social media
      twitter: role.person.twitterid,
      youtube: role.person.youtubeid
    }));
  } catch (error) {
    console.error('GovTrack API error:', error);
    return [];
  }
}

// For bill voting data, you can use:
// https://api.congress.gov/v3/bill/118/hr/[bill-number]?format=json

// For member voting records:
// https://api.congress.gov/v3/member/[bioguideId]/sponsored-legislation?format=json
