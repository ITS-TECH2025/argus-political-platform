// pages/api/politicians.js
// Simplified working version with all code in one file

export default async function handler(req, res) {
  const { party, state, search } = req.query;

  try {
    // Generate politician data
    let politicians = generatePoliticians();

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

    // Return successful response
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

// Generate realistic politician data
function generatePoliticians() {
  // Actual House seats per state (2024)
  const stateSeats = {
    'AL': 7, 'AK': 1, 'AZ': 9, 'AR': 4, 'CA': 52, 'CO': 8, 'CT': 5, 'DE': 1,
    'FL': 28, 'GA': 14, 'HI': 2, 'ID': 2, 'IL': 17, 'IN': 9, 'IA': 4, 'KS': 4,
    'KY': 6, 'LA': 6, 'ME': 2, 'MD': 8, 'MA': 9, 'MI': 13, 'MN': 8, 'MS': 4,
    'MO': 8, 'MT': 2, 'NE': 3, 'NV': 4, 'NH': 2, 'NJ': 12, 'NM': 3, 'NY': 26,
    'NC': 14, 'ND': 1, 'OH': 15, 'OK': 5, 'OR': 6, 'PA': 17, 'RI': 2, 'SC': 7,
    'SD': 1, 'TN': 9, 'TX': 38, 'UT': 4, 'VT': 1, 'VA': 11, 'WA': 10, 'WV': 2,
    'WI': 8, 'WY': 1
  };

  // Name pools
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Donald', 'Sandra', 'Mark', 'Ashley',
    'Paul', 'Kimberly', 'Steven', 'Donna', 'Andrew', 'Emily', 'Kenneth', 'Michelle'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill'
  ];

  const bills = [
    'Infrastructure Investment Act',
    'Healthcare Reform Act',
    'Education Funding Act',
    'Defense Authorization Act',
    'Climate Action Act',
    'Tax Reform Act',
    'Immigration Reform Act',
    'Veterans Benefits Act',
    'Small Business Support Act',
    'Criminal Justice Reform Act'
  ];

  const politicians = [];
  let id = 1;

  // Generate representatives for each state
  Object.entries(stateSeats).forEach(([state, seats]) => {
    for (let district = 1; district <= seats; district++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Realistic party distribution
      const partyRand = Math.random();
      const party = partyRand < 0.48 ? 'D' : partyRand < 0.96 ? 'R' : 'I';
      
      // Years in office (weighted towards newer members)
      const yearsInOffice = Math.random() < 0.6 
        ? Math.floor(Math.random() * 6) + 1  // 60% are 1-6 years
        : Math.floor(Math.random() * 20) + 7; // 40% are 7-26 years
      
      // Campaign finance (correlates with years in office and state size)
      const baseAmount = 800000;
      const stateMultiplier = seats > 10 ? 1.5 : 1;
      const yearsMultiplier = 1 + (yearsInOffice * 0.05);
      const randomVariance = 0.5 + Math.random();
      const totalRaised = Math.floor(baseAmount * stateMultiplier * yearsMultiplier * randomVariance);
      
      // Recent votes
      const recentVotes = [];
      for (let i = 0; i < 3; i++) {
        const bill = bills[Math.floor(Math.random() * bills.length)];
        // Party influences vote probability
        const voteProb = party === 'D' ? 0.7 : 0.3;
        const vote = Math.random() < voteProb ? 'Yes' : 'No';
        
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months
        
        recentVotes.push({
          title: bill,
          vote: vote,
          date: date.toISOString().split('T')[0]
        });
      }
      
      politicians.push({
        id: `H${String(id++).padStart(6, '0')}`,
        name: `${firstName} ${lastName}`,
        party: party,
        state: state,
        district: seats === 1 ? 'At-Large' : String(district),
        title: 'Representative',
        yearsInOffice: yearsInOffice,
        votesWithPartyPct: 75 + Math.floor(Math.random() * 20), // 75-95%
        missedVotesPct: Math.floor(Math.random() * 15), // 0-15%
        campaignFinance: {
          totalRaised: totalRaised
        },
        recentVotes: recentVotes,
        office: `${1000 + Math.floor(Math.random() * 1400)} ${['Rayburn', 'Longworth', 'Cannon'][Math.floor(Math.random() * 3)]} HOB`,
        phone: `202-225-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        url: `https://house.gov/${lastName.toLowerCase()}`,
        twitter: Math.random() > 0.3 ? `Rep${lastName}${state}` : null,
        nextElection: '2024'
      });
    }
  });

  return politicians;
}
