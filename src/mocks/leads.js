/**
 * Lead status constants.
 */
export const LEAD_STATUSES = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  RESPONDED: 'Responded',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost'
};

/**
 * Mock leads data array. Empty by default so only user-imported Excel/CSV data populates the app.
 */
const mockLeads = [];

export default mockLeads;
