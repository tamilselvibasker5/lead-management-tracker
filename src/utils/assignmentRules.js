/**
 * Comprehensive Geography Dictionary for Auto-Detecting Lead Locations and Employee Places.
 */
export const GEOGRAPHY_DICTIONARY = [
  {
    region: 'Tamil Nadu',
    names: ['tamil nadu', 'tamilnadu', 'tn', 'tamil'],
    places: [
      'chennai', 'coimbatore', 'madurai', 'salem', 'trichy', 'tiruchirappalli',
      'tirunelveli', 'vellore', 'erode', 'thanjavur', 'tuticorin', 'thoothukudi',
      'dindigul', 'tiruppur', 'kanchipuram', 'nagercoil', 'cuddalore', 'tiruvallur',
      'guindy', 't nagar', 'velachery', 'ambattur', 'tnagar', 'adyar', 'chromepet',
      'tambaram', 'ooty', 'kodaikanal', 'karur', 'namakkal', 'hosur', 'rajapalayam',
      'puducherry', 'pondicherry', 'siruseri', 'omr', 'porur'
    ]
  },
  {
    region: 'Karnataka',
    names: ['karnataka', 'ka', 'kannada'],
    places: [
      'bangalore', 'bengaluru', 'mysore', 'mysuru', 'hubli', 'hubballi',
      'mangalore', 'mangaluru', 'belgaum', 'belagavi', 'davanagere', 'shimoga',
      'shivamogga', 'tumkur', 'tumakuru', 'udupi', 'koramangala', 'indiranagar',
      'whitefield', 'hsr', 'hsr layout', 'electronic city', 'jp nagar', 'jayanagar',
      'yelahanka', 'marathahalli', 'blr', 'bellary', 'ballari', 'gulbarga', 'kalaburagi',
      'sarjapur', 'manyata', 'hebbal', 'banashankari'
    ]
  },
  {
    region: 'Maharashtra',
    names: ['maharashtra', 'mh', 'marathi'],
    places: [
      'mumbai', 'pune', 'nagpur', 'nashik', 'thane', 'aurangabad', 'chhatrapati sambhajinagar',
      'solapur', 'amravati', 'kolhapur', 'navi mumbai', 'kalyan', 'dombivli',
      'andheri', 'bandra', 'powai', 'hinjewadi', 'baner', 'wakad', 'viman nagar',
      'borivali', 'dadar', 'worli', 'juhu', 'malad', 'vasai', 'virar', 'panvel',
      'goregaon', 'chembur', 'ghatkopar', 'hadapsar', 'kharadi', 'pimprichinchwad'
    ]
  },
  {
    region: 'Delhi / NCR / North',
    names: ['delhi', 'ncr', 'hindi', 'north'],
    places: [
      'delhi', 'new delhi', 'noida', 'greater noida', 'gurgaon', 'gurugram',
      'haryana', 'hr', 'faridabad', 'ghaziabad', 'dlf', 'connaught place', 'cp',
      'rohini', 'dwarka', 'saket', 'punjab', 'pb', 'chandigarh', 'ludhiana',
      'amritsar', 'jalandhar', 'jaipur', 'rajasthan', 'rj', 'jodhpur', 'udaipur',
      'kota', 'uttar pradesh', 'up', 'lucknow', 'kanpur', 'agra', 'varanasi', 'noida sector',
      'cyber city', 'sohna road', 'indirapuram'
    ]
  },
  {
    region: 'Telangana & Andhra Pradesh',
    names: ['telangana', 'ts', 'andhra pradesh', 'andhra', 'ap', 'telugu'],
    places: [
      'hyderabad', 'secunderabad', 'warangal', 'nizamabad', 'karimnagar',
      'banjara hills', 'gachibowli', 'hitec city', 'hitech city', 'jubilee hills',
      'madhapur', 'kukatpally', 'vizag', 'visakhapatnam', 'vijayawada', 'guntur',
      'tirupati', 'nellore', 'kakinada', 'kurnool', 'rajahmundry', 'anantapur',
      'kondapur', 'begumpet', 'ameerpet', 'shamshabad'
    ]
  },
  {
    region: 'Gujarat',
    names: ['gujarat', 'gj', 'gujarati'],
    places: [
      'ahmedabad', 'surat', 'vadodara', 'baroda', 'rajkot', 'gandhinagar',
      'bhavnagar', 'jamnagar', 'anand', 'vapi', 'navsari', 'mehsana', 'bharuch'
    ]
  },
  {
    region: 'West Bengal & East',
    names: ['west bengal', 'wb', 'bengali', 'east'],
    places: [
      'kolkata', 'calcutta', 'howrah', 'durgapur', 'siliguri', 'asansol',
      'salt lake', 'new town', 'park street', 'kharagpur', 'haldia', 'bhubaneswar',
      'cuttack', 'odisha', 'orissa', 'ranchi', 'jamshedpur', 'jharkhand', 'patna', 'bihar'
    ]
  },
  {
    region: 'Kerala',
    names: ['kerala', 'kl', 'malayalam'],
    places: [
      'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram', 'calicut', 'kozhikode',
      'thrissur', 'kollam', 'alappuzha', 'alleppey', 'kottayam', 'palakkad',
      'kannur', 'kasaragod', 'malappuram', 'wayanad', 'kakkanad', 'technopark'
    ]
  }
];

/**
 * Fallback static employees list for reference.
 */
export const employees = [
  {
    id: 'usr_007',
    name: 'Tamilvanan',
    location: 'Chennai, Tamil Nadu',
    language: 'English, Tamil',
    role: 'Employee'
  },
  {
    id: 'usr_008',
    name: 'Tamilnadu Employee',
    location: 'Tamil Nadu',
    language: 'Tamil, English',
    role: 'Employee'
  },
  {
    id: 'usr_005',
    name: 'Karan Malhotra',
    location: 'Bangalore, Karnataka',
    language: 'English, Kannada',
    role: 'Employee'
  },
  {
    id: 'usr_003',
    name: 'Amit Patel',
    location: 'Mumbai, Maharashtra',
    language: 'English, Gujarati, Marathi',
    role: 'Employee'
  },
  {
    id: 'usr_004',
    name: 'Sunita Verma',
    location: 'Delhi, NCR',
    language: 'English, Hindi',
    role: 'Employee'
  },
  {
    id: 'usr_006',
    name: 'Divya Agarwal',
    location: 'Hyderabad, Telangana',
    language: 'English, Telugu',
    role: 'Employee'
  }
];

/**
 * Helper to retrieve system employees list from argument, localStorage, or fallback.
 */
function getEffectiveEmployees(employeesList) {
  if (Array.isArray(employeesList) && employeesList.length > 0) {
    return employeesList;
  }
  try {
    const stored = localStorage.getItem('lead_tracker_employees');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading employees from storage:', e);
  }
  return employees;
}

/**
 * Extract full search text from a lead object or location string.
 */
function extractLeadText(locationOrLead, language = '') {
  if (typeof locationOrLead === 'object' && locationOrLead !== null) {
    const parts = [
      locationOrLead.location,
      locationOrLead.Location,
      locationOrLead.city,
      locationOrLead.City,
      locationOrLead.state,
      locationOrLead.State,
      locationOrLead.address,
      locationOrLead.Address,
      locationOrLead.place,
      locationOrLead.Place,
      locationOrLead.region,
      locationOrLead.Region,
      locationOrLead.language,
      locationOrLead.Language,
      language
    ].filter(Boolean);

    return parts.join(' ').toLowerCase().trim();
  }

  return `${locationOrLead || ''} ${language || ''}`.toLowerCase().trim();
}

/**
 * Identify regional clusters associated with a text string.
 */
function findRegionsForText(text) {
  if (!text) return [];
  const matchedRegions = [];

  for (const entry of GEOGRAPHY_DICTIONARY) {
    const matchesRegionName = entry.names.some((name) => text.includes(name));
    const matchesPlace = entry.places.some((place) => {
      // Avoid short false positive substring matches (e.g., 'in' or 'at')
      if (place.length <= 2) {
        const regex = new RegExp(`\\b${place}\\b`, 'i');
        return regex.test(text);
      }
      return text.includes(place);
    });

    if (matchesRegionName || matchesPlace) {
      matchedRegions.push(entry);
    }
  }

  return matchedRegions;
}

/**
 * Calculate match score between a lead's text and an employee.
 * Higher score = stronger match.
 */
function calculateMatchScore(leadText, emp, leadRegions) {
  if (!leadText || !emp) return 0;

  const empLoc = String(emp.location || '').toLowerCase().trim();
  const empName = String(emp.name || '').toLowerCase().trim();
  const empLang = String(emp.language || emp.languages || 'English').toLowerCase().trim();
  const empRegions = Array.isArray(emp.regions) ? emp.regions.map((r) => String(r).toLowerCase()) : [];

  let score = 0;

  // 1. Direct Location match (Exact or Substring)
  if (empLoc) {
    if (leadText.includes(empLoc)) {
      score += 100;
    } else {
      const empLocTokens = empLoc.split(/[\s,/-]+/).filter((t) => t.length > 2);
      for (const token of empLocTokens) {
        if (leadText.includes(token)) {
          score += 40;
        }
      }
    }
  }

  // 2. Direct Employee Name match (e.g., "Tamilnadu Employee")
  if (empName) {
    const nameTokens = empName.split(/\s+/).filter((t) => t.length > 3 && t !== 'employee' && t !== 'admin');
    for (const token of nameTokens) {
      if (leadText.includes(token)) {
        score += 50;
      }
    }
  }

  // 3. Custom Employee Regions array check
  for (const reg of empRegions) {
    if (leadText.includes(reg)) {
      score += 60;
    }
  }

  // 4. Regional Cluster Matching via Geography Dictionary
  if (leadRegions.length > 0) {
    const empDetectedRegions = findRegionsForText(empLoc + ' ' + empName + ' ' + empRegions.join(' '));
    for (const leadReg of leadRegions) {
      const isSharedRegion = empDetectedRegions.some((er) => er.region === leadReg.region);
      if (isSharedRegion) {
        score += 70;
      }
    }
  }

  // 5. Language matching score bonus
  if (empLang) {
    const langTokens = empLang.split(/[\s,/-]+/).filter((t) => t.length > 2);
    for (const lang of langTokens) {
      if (leadText.includes(lang)) {
        score += 85;
      }
    }
  }

  return score;
}

/**
 * Finds the matching system employee for a lead based on location, city, state, & language.
 * Unassigned leads fallback to an English language employee.
 *
 * @param {string|object} locationOrLead - Lead location string or lead object { location, city, state, ... }
 * @param {string} [language=''] - Lead language string (if locationOrLead is string)
 * @param {Array} [employeesList=null] - List of current system employees
 * @returns {object|null} Matched employee object or null
 */
export function findMatchingEmployee(locationOrLead, language = '', employeesList = null) {
  let empList = employeesList;
  if (!empList && Array.isArray(language)) {
    empList = language;
    language = '';
  }

  const effectiveEmps = getEffectiveEmployees(empList);
  if (!effectiveEmps || effectiveEmps.length === 0) return null;

  const leadText = extractLeadText(locationOrLead, typeof language === 'string' ? language : '');

  const leadRegions = leadText ? findRegionsForText(leadText) : [];

  let bestEmp = null;
  let maxScore = 0;
  const scoredEmployees = [];

  if (leadText) {
    for (const emp of effectiveEmps) {
      const score = calculateMatchScore(leadText, emp, leadRegions);
      if (score > 0) {
        scoredEmployees.push({ emp, score });
        if (score > maxScore) {
          maxScore = score;
          bestEmp = emp;
        }
      }
    }
  }

  // If we have top matches tied with the same highest score, pick deterministically using lead text hash
  if (scoredEmployees.length > 1) {
    const topScorers = scoredEmployees.filter((item) => item.score === maxScore);
    if (topScorers.length > 1) {
      let hash = 0;
      for (let i = 0; i < leadText.length; i++) {
        hash = (hash << 5) - hash + leadText.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % topScorers.length;
      return topScorers[index].emp;
    }
  }

  if (bestEmp) return bestEmp;

  // Fallback Rule: Assign unassigned leads to an English language employee
  const englishEmps = effectiveEmps.filter((emp) => {
    const empLangs = String(emp.language || emp.languages || 'English').toLowerCase();
    return empLangs.includes('english') || empLangs === '';
  });

  if (englishEmps.length > 0) {
    // Pick deterministically among English employees if lead text exists, else first
    if (leadText) {
      let hash = 0;
      for (let i = 0; i < leadText.length; i++) {
        hash = (hash << 5) - hash + leadText.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % englishEmps.length;
      return englishEmps[index];
    }
    return englishEmps[0];
  }

  return effectiveEmps[0] || null;
}

/**
 * Smart Auto-Assignment Function.
 * Returns the matched employee's ID (or name), or 'Unassigned' if no match.
 *
 * @param {string|object} locationOrLead
 * @param {string|Array} [language='']
 * @param {Array} [employeesList=null]
 * @returns {string} Employee ID or 'Unassigned'
 */
export function autoAssignLead(locationOrLead = '', language = '', employeesList = null) {
  const matchedEmp = findMatchingEmployee(locationOrLead, language, employeesList);
  if (matchedEmp) {
    return matchedEmp.id || matchedEmp.name || 'Unassigned';
  }
  return 'Unassigned';
}

// Compatibility Aliases
export const assignLeadByLocation = (location, employeesList) => autoAssignLead(location, '', employeesList);
export const getAutoAssignedEmployee = (location, language, employeesList) => findMatchingEmployee(location, language, employeesList);
