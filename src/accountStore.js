const STORE_KEY = 'loklAccounts'

export const SEED_CREATORS = [
  { id: 's1', name: 'Ananya Krishnan', city: 'Chennai', state: 'Tamil Nadu', language: 'Tamil', niche: 'Food & Dining', instagram: '@ananyaeats', followers: 8200, avgLikes: 650, avgComments: 45, postsPerWeek: 5, localFollowerPct: 78, score: { total: 82, engagementAuth: 85, audienceSentiment: 76, contentConsistency: 85, localRelevance: 78, engagementRate: '8.47' } },
  { id: 's2', name: 'Rahul Verma', city: 'Kanpur', state: 'Uttar Pradesh', language: 'Hindi', niche: 'Comedy', instagram: '@rahulcomedy', followers: 15400, avgLikes: 920, avgComments: 88, postsPerWeek: 4, localFollowerPct: 65, score: { total: 74, engagementAuth: 72, audienceSentiment: 79, contentConsistency: 70, localRelevance: 65, engagementRate: '6.54' } },
  { id: 's3', name: 'Sneha Patil', city: 'Pune', state: 'Maharashtra', language: 'Marathi', niche: 'Fashion', instagram: '@snehastyle', followers: 6800, avgLikes: 510, avgComments: 38, postsPerWeek: 6, localFollowerPct: 72, score: { total: 79, engagementAuth: 80, audienceSentiment: 74, contentConsistency: 90, localRelevance: 72, engagementRate: '8.06' } },
  { id: 's4', name: 'Karthik Reddy', city: 'Hyderabad', state: 'Telangana', language: 'Telugu', niche: 'Food & Dining', instagram: '@karthikeats', followers: 12000, avgLikes: 1100, avgComments: 92, postsPerWeek: 5, localFollowerPct: 85, score: { total: 86, engagementAuth: 88, audienceSentiment: 82, contentConsistency: 85, localRelevance: 85, engagementRate: '9.93' } },
  { id: 's5', name: 'Priya Mehta', city: 'Surat', state: 'Gujarat', language: 'Gujarati', niche: 'Fashion', instagram: '@priyafashion', followers: 9500, avgLikes: 720, avgComments: 54, postsPerWeek: 4, localFollowerPct: 70, score: { total: 77, engagementAuth: 78, audienceSentiment: 74, contentConsistency: 70, localRelevance: 70, engagementRate: '8.15' } },
  { id: 's6', name: 'Arjun Nair', city: 'Kochi', state: 'Kerala', language: 'Malayalam', niche: 'Travel', instagram: '@arjuntravels', followers: 11000, avgLikes: 880, avgComments: 70, postsPerWeek: 3, localFollowerPct: 60, score: { total: 75, engagementAuth: 82, audienceSentiment: 76, contentConsistency: 56, localRelevance: 60, engagementRate: '8.64' } },
  { id: 's7', name: 'Divya Sharma', city: 'Jaipur', state: 'Rajasthan', language: 'Hindi', niche: 'Fashion', instagram: '@divyastyle', followers: 7500, avgLikes: 580, avgComments: 42, postsPerWeek: 5, localFollowerPct: 68, score: { total: 76, engagementAuth: 77, audienceSentiment: 72, contentConsistency: 85, localRelevance: 68, engagementRate: '8.29' } },
  { id: 's8', name: 'Rohan Das', city: 'Kolkata', state: 'West Bengal', language: 'Bengali', niche: 'Food & Dining', instagram: '@rohanfoodie', followers: 9200, avgLikes: 810, avgComments: 65, postsPerWeek: 6, localFollowerPct: 80, score: { total: 83, engagementAuth: 85, audienceSentiment: 78, contentConsistency: 90, localRelevance: 80, engagementRate: '9.51' } },
]

const normalize = (value = '') => value.trim().toLowerCase()

const readAccounts = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY))
    return { creators: [], brands: [], ...data }
  } catch {
    return { creators: [], brands: [] }
  }
}

const writeAccounts = (accounts) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(accounts))
}

export const saveCreatorAccount = (creator) => {
  const accounts = readAccounts()
  const key = normalize(creator.instagram || creator.email || creator.name)
  accounts.creators = [
    ...accounts.creators.filter((account) => normalize(account.instagram || account.email || account.name) !== key),
    creator,
  ]
  writeAccounts(accounts)
}

export const saveBrandAccount = (brand) => {
  const accounts = readAccounts()
  const key = normalize(brand.phone || brand.email || brand.brandName)
  accounts.brands = [
    ...accounts.brands.filter((account) => normalize(account.phone || account.email || account.brandName) !== key),
    brand,
  ]
  writeAccounts(accounts)
}

export const findCreatorAccount = (identifier, password) => {
  const key = normalize(identifier)
  return readAccounts().creators.find((account) => (
    normalize(account.instagram) === key ||
    normalize(account.email) === key ||
    normalize(account.name) === key
  ) && account.password === password)
}

export const findBrandAccount = (identifier, password) => {
  const key = normalize(identifier)
  return readAccounts().brands.find((account) => (
    normalize(account.phone) === key ||
    normalize(account.email) === key ||
    normalize(account.brandName) === key
  ) && account.password === password)
}

export const getCreators = () => {
  const accounts = readAccounts()
  const localCreators = accounts.creators || []
  
  const merged = [...SEED_CREATORS]
  const seenIds = new Set(merged.map(c => c.id))
  const seenInstagrams = new Set(merged.map(c => normalize(c.instagram)))
  
  localCreators.forEach(c => {
    const normInsta = normalize(c.instagram)
    if (!seenIds.has(c.id) && !seenInstagrams.has(normInsta)) {
      merged.push(c)
      seenIds.add(c.id)
      seenInstagrams.add(normInsta)
    }
  })
  
  return merged
}

export const getLocalCampaigns = () => {
  const accounts = readAccounts()
  const campaigns = []
  accounts.brands.forEach(brand => {
    if (brand.campaign) {
      campaigns.push({
        id: brand.campaign.id || `campaign-${brand.id}`,
        brandId: brand.id,
        brandName: brand.brandName,
        city: brand.city,
        state: brand.state,
        category: brand.category,
        title: brand.campaign.title || brand.campaignTitle,
        description: brand.campaign.description || brand.campaignDesc,
        budget: brand.campaign.budget || brand.budget,
        language: brand.campaign.language || brand.language,
        targetNiche: brand.campaign.targetNiche || brand.targetNiche,
        deliverables: brand.campaign.deliverables || brand.deliverables,
        status: brand.campaign.status || 'open',
        createdAt: brand.campaign.createdAt || brand.createdAt
      })
    }
  })
  return campaigns
}

export const saveLocalApplication = (application) => {
  const accounts = readAccounts()
  const applicationWithId = {
    ...application,
    id: application.id || `application-${Date.now()}`,
  }
  const applications = accounts.applications || []
  const duplicateKey = [
    applicationWithId.campaignId,
    applicationWithId.brandId,
    normalize(applicationWithId.creatorInstagram || applicationWithId.creatorName),
  ].join('|')

  accounts.applications = [
    ...applications.filter((existing) => {
      const existingKey = [
        existing.campaignId,
        existing.brandId,
        normalize(existing.creatorInstagram || existing.creatorName),
      ].join('|')
      return existingKey !== duplicateKey
    }),
    applicationWithId,
  ]
  writeAccounts(accounts)
  return applicationWithId
}

export const getLocalApplications = () => {
  const accounts = readAccounts()
  return accounts.applications || []
}

export const updateLocalApplicationStatus = (applicationId, status) => {
  const accounts = readAccounts()
  accounts.applications = (accounts.applications || []).map((application) => (
    application.id === applicationId
      ? { ...application, status, statusUpdatedAt: new Date().toISOString() }
      : application
  ))
  writeAccounts(accounts)
}

export const saveLocalMessage = (message) => {
  const accounts = readAccounts()
  const messageWithId = {
    ...message,
    id: message.id || `message-${Date.now()}`,
  }
  accounts.messages = [
    ...(accounts.messages || []),
    messageWithId,
  ]
  writeAccounts(accounts)
  return messageWithId
}

export const getLocalMessages = (applicationId) => {
  const accounts = readAccounts()
  return (accounts.messages || [])
    .filter((message) => message.applicationId === applicationId)
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
}
export const createEscrow = (application, budgetAmount) => {
  const accounts = readAccounts()
  const commissionRate = 0.10 // LOKL takes 10% commission
  const commission = Math.round(budgetAmount * commissionRate)
  const creatorPayout = budgetAmount - commission

  const escrow = {
    id: `escrow-${application.id}`,
    applicationId: application.id,
    campaignId: application.campaignId,
    campaignTitle: application.campaignTitle,
    brandId: application.brandId,
    brandName: application.brandName,
    creatorId: application.creatorId,
    creatorName: application.creatorName,
    creatorInstagram: application.creatorInstagram,
    totalAmount: budgetAmount,
    commission,
    creatorPayout,
    status: 'held', // held -> released
    createdAt: new Date().toISOString(),
    releasedAt: null,
  }

  const escrows = accounts.escrows || []
  accounts.escrows = [
    ...escrows.filter((e) => e.applicationId !== application.id),
    escrow,
  ]
  writeAccounts(accounts)
  return escrow
}

export const getEscrows = () => {
  const accounts = readAccounts()
  return accounts.escrows || []
}

export const getEscrowByApplication = (applicationId) => {
  const accounts = readAccounts()
  return (accounts.escrows || []).find((e) => e.applicationId === applicationId)
}

export const releaseEscrow = (applicationId) => {
  const accounts = readAccounts()
  accounts.escrows = (accounts.escrows || []).map((e) =>
    e.applicationId === applicationId
      ? { ...e, status: 'released', releasedAt: new Date().toISOString() }
      : e
  )
  writeAccounts(accounts)
  return accounts.escrows.find((e) => e.applicationId === applicationId)
}

export const getCreatorEscrows = (creatorId, creatorInstagram) => {
  const accounts = readAccounts()
  const norm = normalize(creatorInstagram)
  return (accounts.escrows || []).filter((e) =>
    (creatorId && e.creatorId === creatorId) ||
    normalize(e.creatorInstagram) === norm
  )
}

export const getBrandEscrows = (brandId) => {
  const accounts = readAccounts()
  return (accounts.escrows || []).filter((e) => e.brandId === brandId)
}

export function parseBudgetToNumber(budgetString = '') {
  // Converts "₹15,000 – ₹50,000" or "₹999/mo" style strings to a usable number (takes lower bound or single value)
  const numbers = budgetString.match(/[\d,]+/g)
  if (!numbers || numbers.length === 0) return 5000 // fallback default
  const firstNumber = parseInt(numbers[0].replace(/,/g, ''), 10)
  return isNaN(firstNumber) ? 5000 : firstNumber
}