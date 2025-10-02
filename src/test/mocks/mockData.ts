export const mockCalendarEvents = [
  {
    id: '1',
    title: 'Sales Strategy Review with Tech Corp',
    startTime: new Date(Date.now() + 30 * 60000).toISOString(),
    endTime: new Date(Date.now() + 90 * 60000).toISOString(),
    attendees: ['john@techcorp.com', 'sarah@techcorp.com'],
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '2',
    title: 'Product Demo - Acme Industries',
    startTime: new Date(Date.now() + 120 * 60000).toISOString(),
    endTime: new Date(Date.now() + 180 * 60000).toISOString(),
    attendees: ['bob@acme.com'],
    meetingLink: 'https://zoom.us/j/123456789',
  },
];

export const mockEmails = [
  {
    id: '1',
    from: 'john@techcorp.com',
    subject: 'Re: Q4 Budget Discussion',
    snippet: 'Looking forward to our meeting tomorrow...',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isUnread: true,
  },
  {
    id: '2',
    from: 'sarah@acme.com',
    subject: 'Product Demo Questions',
    snippet: 'Can you provide more details about...',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isUnread: false,
  },
];

export const mockPrioritizedAgenda = {
  critical: [
    { description: 'Respond to urgent client inquiry', dueTime: new Date(Date.now() + 3600000).toISOString() }
  ],
  high: [
    { description: 'Prepare sales deck for tomorrow', dueTime: new Date(Date.now() + 7200000).toISOString() }
  ],
  medium: [
    { description: 'Review contract terms' }
  ],
  low: [
    { description: 'Update CRM records' }
  ],
  fyi: [
    { description: 'Team meeting notes available' }
  ],
};

export const mockCompanyResearch = {
  companyName: 'Tech Corp',
  industry: 'Enterprise Software',
  size: '500-1000 employees',
  stage: 'Growth',
  recentNews: [
    'Raised $50M Series B',
    'Expanded to European markets'
  ],
  financialHealth: {
    status: 'Healthy',
    fundingRounds: '$75M total',
    revenue: '$50M ARR',
  },
  keyDecisionMakers: [
    { name: 'John Smith', title: 'VP of Sales', linkedInUrl: 'https://linkedin.com/in/johnsmith' }
  ],
};

export const mockSalesIntelligence = {
  meetingTitle: 'Sales Strategy Review',
  attendees: [
    {
      name: 'John Smith',
      title: 'VP of Sales',
      company: 'Tech Corp',
      decisionMakingPower: 'High',
    }
  ],
  companySnapshot: {
    industry: 'Enterprise Software',
    size: '500-1000 employees',
    stage: 'Growth',
    recentNews: ['Raised $50M Series B'],
  },
  financialHealth: {
    status: 'Healthy' as const,
    funding: '$75M',
    revenue: '$50M ARR',
    indicators: ['Strong growth trajectory', 'Recent funding round'],
  },
  recommendedApproach: {
    keyPainPoints: [
      'Scaling sales operations',
      'Pipeline visibility',
    ],
    whatToPitch: [
      'Multi-region capabilities',
      'Real-time analytics',
    ],
    valueProposition: 'Help scale operations globally',
    estimatedBudget: '$100K-$500K',
    decisionMakerInfluence: 'High',
  },
  talkingPoints: [
    'Reference European expansion',
    'Discuss similar enterprise clients',
    'Mention SOC 2 compliance',
  ],
};

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  user: mockUser,
};
