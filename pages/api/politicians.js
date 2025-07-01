// Updates for pages/api/politicians.js
// Add chamber to the query parameters at the top
const { party, state, search, chamber } = req.query;

// Remove the House-only filter and update the mapping to include chamber info:
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

// Add chamber filter in the filters section:
if (chamber) {
  politicians = politicians.filter(p => p.chamber === chamber);
  console.log(`After chamber filter: ${politicians.length} members`);
}
