// pages/api/politicians.js
// Working version with comprehensive representative data

export default async function handler(req, res) {
  const { party, state, search } = req.query;

  try {
    // For now, we'll use comprehensive mock data that represents all 435 House members
    // This ensures your site works immediately while we set up real APIs
    let politicians = generateComprehensivePoliticianData();

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

function generateComprehensivePoliticianData() {
  // State representation data (approximate House seats per state)
  const stateData = [
    { state: 'AL', seats: 7 }, { state: 'AK', seats: 1 }, { state: 'AZ', seats: 9 },
    { state: 'AR', seats: 4 }, { state: 'CA', seats: 52 }, { state: 'CO', seats: 8 },
    { state: 'CT', seats: 5 }, { state: 'DE', seats: 1 }, { state: 'FL', seats: 28 },
    { state: 'GA', seats: 14 }, { state: 'HI', seats: 2 }, { state: 'ID', seats: 2 },
    { state: 'IL', seats: 17 }, { state: 'IN', seats: 9 }, { state: 'IA', seats: 4 },
    { state: 'KS', seats: 4 }, { state: 'KY', seats: 6 }, { state: 'LA', seats: 6 },
    { state: 'ME', seats: 2 }, { state: 'MD', seats: 8 }, { state: 'MA', seats: 9 },
    { state: 'MI', seats: 13 }, { state: 'MN', seats: 8 }, { state: 'MS', seats: 4 },
    { state: 'MO', seats: 8 }, { state: 'MT', seats: 2 }, { state: 'NE', seats: 3 },
    { state: 'NV', seats: 4 }, { state: 'NH', seats: 2 }, { state: 'NJ', seats: 12 },
    { state: 'NM', seats: 3 }, { state: 'NY', seats: 26 }, { state: 'NC', seats: 14 },
    { state: 'ND', seats: 1 }, { state: 'OH', seats: 15 }, { state: 'OK', seats: 5 },
    { state: 'OR', seats: 6 }, { state: 'PA', seats: 17 }, { state: 'RI', seats: 2 },
    { state: 'SC', seats: 7 }, { state: 'SD', seats: 1 }, { state: 'TN', seats: 9 },
    { state: 'TX', seats: 38 }, { state: 'UT', seats: 4 }, { state: 'VT', seats: 1 },
    { state: 'VA', seats: 11 }, { state: 'WA', seats: 10 }, { state: 'WV', seats: 2 },
    { state: 'WI', seats: 8 }, { state: 'WY', seats: 1 }
  ];

  // Name pools for generating realistic names
  const firstNames = {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra', 'Ashley', 'Kimberly', 'Donna', 'Emily', 'Michelle']
  };
  
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  const bills = [
    'Infrastructure Investment Act',
    'Clean Energy Transition Act',
    'Healthcare Access Expansion Act',
    'Education Funding Reform Act',
    'Veterans Support Act',
    'Small Business Relief Act',
    'Tax Reform Act',
    'Immigration Reform Act',
    'Defense Authorization Act',
    'Climate Action Act'
  ];

  const politicians = [];
  let idCounter = 1000;

  // Generate representatives for each state
  stateData.forEach(({ state, seats }) => {
    for (let district = 1; district <= seats; district++) {
      const isFemale = Math.random() > 0.7; // ~30% female representation
      const firstName = isFemale 
        ? firstNames.female[Math.floor(Math.random() * firstNames.female.length)]
        : firstNames.male[Math.floor(Math.random() * firstNames.male.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Assign party based on rough national distribution
      const partyRoll = Math.random();
      const party = partyRoll < 0.47 ? 'D' : partyRoll < 0.94 ? 'R' : 'I';
      
      // Generate realistic years in office (weighted towards newer members)
      const yearsRoll = Math.random();
      const yearsInOffice = yearsRoll < 0.3 ? Math.floor(Math.random() * 3) + 1 :
                           yearsRoll < 0.6 ? Math.floor(Math.random() * 5) + 4 :
                           yearsRoll < 0.85 ? Math.floor(Math.random() * 8) + 9 :
                           Math.floor(Math.random() * 15) + 17;
      
      // Generate campaign finance (correlates somewhat with years in office)
      const baseFunding = 500000;
      const maxFunding = 5000000;
      const fundingMultiplier = Math.min(yearsInOffice * 0.1 + 0.5, 2);
      const randomVariance = 0.5 + Math.random();
      const totalRaised = Math.floor(baseFunding + (Math.random() * (maxFunding - baseFunding)) * fundingMultiplier * randomVariance);
      
      // Generate recent votes
      const recentVotes = [];
      for (let i = 0; i < 3; i++) {
        const bill = bills[Math.floor(Math.random() * bills.length)];
        const votePosition = party === 'D' 
          ? (Math.random() > 0.2 ? 'Yes' : 'No')  // Dems more likely to vote Yes
          : (Math.random() > 0.8 ? 'Yes' : 'No'); // Reps more likely to vote No
        
        recentVotes.push({
          title: bill,
          vote: votePosition,
          date: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
        });
      }
      
      politicians.push({
        id: `H${idCounter++}`,
        name: `${firstName} ${lastName}`,
        party,
        state,
        district: seats === 1 ? 'At-Large' : district.toString(),
        title: 'Representative',
        yearsInOffice,
        votesWithPartyPct: 85 + Math.floor(Math.random() * 15), // 85-99%
        missedVotesPct: Math.floor(Math.random() * 10), // 0-10%
        campaignFinance: {
          totalRaised
        },
        recentVotes,
        office: `${Math.floor(Math.random() * 2000) + 1000} ${['Rayburn', 'Longworth', 'Cannon'][Math.floor(Math.random() * 3)]} House Office Building`,
        phone: `202-225-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        url: `https://house.gov/${lastName.toLowerCase()}`,
        twitter: Math.random() > 0.2 ? `Rep${lastName}` : null,
        nextElection: '2024'
      });
    }
  });

  // Shuffle array to mix states
  for (let i = politicians.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [politicians[i], politicians[j]] = [politicians[j], politicians[i]];
  }

  return politicians;
}
