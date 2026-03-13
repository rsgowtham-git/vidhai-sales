// Vercel Serverless Function: /api/outreach-generate
// Handles ICP-based prospect discovery and outreach content generation
// Supports two modes: 'discover' (built-in contacts) and 'upload' (user-provided CSV contacts)

const TECHNOSOFT_CONTEXT = `You are an expert B2B sales assistant for Technosoft Engineering, a global provider of Digital Engineering & Consulting, Product Engineering, and Manufacturing Engineering services. Technosoft operates in North America and Europe, supporting Transportation, Industrial Products, Process Industry, Medical Equipment, Energy, and Furniture manufacturers.

Key capabilities:
- Mechanical design and CAD services (SolidWorks, KeyCreator, NX)
- Embedded systems and IoT solutions
- Electrical design and automation
- Testing & validation (PPAP, FAI automation)
- Turnkey automation (AGV/AMR, robotics, AI vision inspection)
- Plant engineering and facility planning
- Data analytics, digital twins, and Industry 4.0

Typical clients: Fortune 1000 and mid-market manufacturers (>$300M revenue) in US/Canada.
Value proposition: Reduce time-to-market, offload engineering backlog, deliver cost-effective high-quality engineering capacity with an onsite/offshore model.`;

const GEMINI_MODEL = 'gemini-2.5-flash';

// Mock data for discover mode fallback
function getMockContacts(criteria) {
    const mockCompanies = [
        { companyName: 'Lincoln Electric Holdings', industry: 'Industrial Manufacturing', revenue: '$3.8B', hqLocation: 'Cleveland, OH', employees: '12,000+' },
        { companyName: 'Textron Inc', industry: 'Aerospace & Defense', revenue: '$13.7B', hqLocation: 'Providence, RI', employees: '33,000+' },
        { companyName: 'Parker Hannifin', industry: 'Industrial Manufacturing', revenue: '$19.1B', hqLocation: 'Cleveland, OH', employees: '58,000+' },
        { companyName: 'BorgWarner Inc', industry: 'Automotive Components', revenue: '$14.2B', hqLocation: 'Auburn Hills, MI', employees: '44,000+' },
        { companyName: 'PACCAR Inc', industry: 'Transportation Equipment', revenue: '$35.1B', hqLocation: 'Bellevue, WA', employees: '29,000+' },
        { companyName: 'Roper Technologies', industry: 'Diversified Industrial', revenue: '$5.6B', hqLocation: 'Sarasota, FL', employees: '16,400+' },
        { companyName: 'AMETEK Inc', industry: 'Electronic Instruments', revenue: '$6.6B', hqLocation: 'Berwyn, PA', employees: '21,000+' },
        { companyName: 'Cummins Inc', industry: 'Power Solutions', revenue: '$34.1B', hqLocation: 'Columbus, IN', employees: '73,600+' },
        { companyName: 'Illinois Tool Works', industry: 'Diversified Manufacturing', revenue: '$16.1B', hqLocation: 'Glenview, IL', employees: '46,000+' },
        { companyName: 'Dover Corporation', industry: 'Industrial Manufacturing', revenue: '$8.5B', hqLocation: 'Downers Grove, IL', employees: '25,000+' }
    ];

    const mockTitles = criteria.jobTitles && criteria.jobTitles.length > 0
        ? criteria.jobTitles
        : ['VP Engineering', 'Director Product Development', 'VP Manufacturing'];

    const mockFirstNames = ['James', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Lisa', 'David', 'Karen', 'William', 'Patricia'];
    const mockLastNames = ['Anderson', 'Mitchell', 'Thompson', 'Rodriguez', 'Nakamura', 'Patel', "O'Brien", 'Chen', 'Kowalski', 'Fernandez'];

    const count = Math.min(parseInt(criteria.contactCount) || 5, mockCompanies.length);
    const contacts = [];

    for (let i = 0; i < count; i++) {
        const company = mockCompanies[i];
        const firstName = mockFirstNames[i];
        const lastName = mockLastNames[i];
        const title = mockTitles[i % mockTitles.length];
        const emailDomain = company.companyName.toLowerCase().replace(/[^a-z]/g, '') + '.com';

        contacts.push({
            firstName, lastName, title,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
            phone: `+1 (${String(200 + i * 100 + Math.floor(Math.random() * 99)).padStart(3, '0')}) ${String(400 + Math.floor(Math.random() * 599)).padStart(3, '0')}-${String(1000 + Math.floor(Math.random() * 8999))}`,
            linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            companyName: company.companyName,
            industry: company.industry,
            revenue: company.revenue,
            hqLocation: company.hqLocation,
            employees: company.employees
        });
    }

    return contacts;
}

// Sleep helper for rate limiting
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Gemini API call with retry for rate limits
async function callGemini(prompt, apiKey, retries = 2) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: TECHNOSOFT_CONTEXT }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        // Retry on rate limit (429) or server error (500/503)
        if (retries > 0 && (response.status === 429 || response.status >= 500)) {
            const waitTime = response.status === 429 ? 15000 : 3000;
            console.log(`Gemini API ${response.status}, retrying in ${waitTime/1000}s...`);
            await sleep(waitTime);
            return callGemini(prompt, apiKey, retries - 1);
        }
        throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Generate LinkedIn search URL for a contact
// Constructs a direct LinkedIn search link the BDE can click to find the profile
function buildLinkedInSearchUrl(firstName, lastName, companyName) {
    const query = encodeURIComponent(`${firstName} ${lastName} ${companyName}`);
    return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
}

// Find LinkedIn profile using Gemini Google Search grounding
// Uses the same Gemini API key - no separate CSE needed
async function findLinkedIn(firstName, lastName, companyName, geminiApiKey) {
    try {
        const searchPrompt = `I need the exact LinkedIn profile URL for ${firstName} ${lastName} who works at ${companyName}. Search Google for "${firstName} ${lastName} ${companyName} linkedin.com/in" and return ONLY the linkedin.com/in/ URL. If found, return just the URL. If not found, return NOT_FOUND.`;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: searchPrompt }] }],
                    tools: [{ google_search: {} }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 256 }
                })
            }
        );

        if (!response.ok) {
            console.error(`Gemini Search grounding error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Check grounding metadata for LinkedIn URLs (may come as redirect URLs)
        const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        for (const chunk of groundingChunks) {
            const uri = chunk.web?.uri || '';
            if (uri.includes('linkedin.com/in/')) return uri;
        }

        // Extract LinkedIn URL from the text response
        const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/);
        if (linkedinMatch) return linkedinMatch[0];

        // Fall back to a LinkedIn search URL the BDE can click
        return null;
    } catch (err) {
        console.error('LinkedIn lookup error:', err.message);
        return null;
    }
}

// Discover real companies and contacts using Gemini with Google Search grounding
async function discoverContacts(criteria, geminiApiKey) {
    const count = Math.min(parseInt(criteria.contactCount) || 5, 10);
    const jobTitles = criteria.jobTitles && criteria.jobTitles.length > 0
        ? criteria.jobTitles.join(', ')
        : 'VP Engineering, Director Product Development, VP Manufacturing';
    const locations = criteria.locations && criteria.locations.length > 0
        ? criteria.locations.join(', ')
        : 'United States';

    const prompt = `Search the web and find ${count} REAL manufacturing companies that match this Ideal Customer Profile:

- Industry/Persona: ${criteria.industryPersona}
- Revenue Range: ${criteria.revenueRange}
- Employee Count: ${criteria.employeeCount || 'Any'}
- Geography: ${locations}
- Target Job Titles: ${jobTitles}

For each company, search for a real person who holds one of the target titles at that company.

Return ONLY a valid JSON array with exactly ${count} objects. Each object must have:
- companyName: real company name
- industry: their specific industry
- revenue: approximate annual revenue
- hqLocation: city, state
- employees: approximate employee count
- firstName: real first name of a person at this company
- lastName: real last name of that person
- title: their actual job title

IMPORTANT:
- These must be REAL companies that actually exist, found via web search
- Find REAL executives/leaders at these companies
- Match the industry and revenue criteria as closely as possible
- Do NOT invent or fabricate company or people names
- Return ONLY the JSON array, no other text, no markdown formatting`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ google_search: {} }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Gemini discovery error ${response.status}:`, errText);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = text;
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const contacts = JSON.parse(jsonStr);
        if (!Array.isArray(contacts) || contacts.length === 0) return null;

        // Filter out contacts where person was not found, and add placeholder fields
        return contacts
            .filter(c => c.companyName && c.firstName && c.firstName !== 'Not Found' && c.lastName !== 'Not Found')
            .map(c => {
                const domain = (c.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
                return {
                    firstName: c.firstName,
                    lastName: c.lastName,
                    title: c.title && c.title !== 'Not Found' ? c.title : 'Engineering Leader',
                    companyName: c.companyName,
                    industry: c.industry || criteria.industryPersona,
                    revenue: c.revenue || criteria.revenueRange,
                    hqLocation: c.hqLocation || '',
                    employees: c.employees || '',
                    email: c.email || `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@${domain}`,
                    phone: c.phone || 'Look up on LinkedIn'
                };
            });
    } catch (err) {
        console.error('Contact discovery error:', err.message);
        return null;
    }
}

// Generate all outreach content for a single contact via Gemini
async function generateOutreachContent(contact, geminiKey) {
    const contactInfo = `Contact: ${contact.firstName} ${contact.lastName}, ${contact.title} at ${contact.companyName}
Industry: ${contact.industry || 'Manufacturing'}
Revenue: ${contact.revenue || 'Not specified'}
Location: ${contact.hqLocation || 'Not specified'}
Employees: ${contact.employees || 'Not specified'}`;

    // Single comprehensive prompt to reduce API calls
    const prompt = `Generate a complete B2B sales outreach package for Technosoft Engineering targeting:

${contactInfo}

Provide ALL of the following in this exact format with the exact section headers shown:

===RESEARCH===
A 2-3 paragraph research summary about this person and their company, focusing on potential engineering needs and pain points Technosoft can address. Include likely industry trends and technology adoption challenges.

===CONNECTION===
A LinkedIn connection request message (MAXIMUM 200 characters, count carefully). Make it personal and specific to their role/company. Do NOT be generic.

===SUBJECT===
An InMail subject line (one line only).

===INMAIL===
A LinkedIn InMail message (150-200 words). Include: specific reference to their challenges, one Technosoft capability that addresses it, clear CTA for a 15-minute call. Tone: consultative, not pushy.

===COLDCALL===
A complete cold calling script with these sections:
OPENER (30-45 seconds): Introduction and hook specific to their company
QUALIFICATION QUESTIONS (3 questions): Discovery questions about their engineering needs
TALKING POINTS (3 points): Key Technosoft capabilities relevant to them
OBJECTION HANDLING (2 common objections with responses)
CLOSE: Ask for a meeting/next steps`;

    const fullResponse = await callGemini(prompt, geminiKey);

    // Parse sections
    const researchMatch = fullResponse.match(/===RESEARCH===([\s\S]*?)(?====|$)/);
    const connectionMatch = fullResponse.match(/===CONNECTION===([\s\S]*?)(?====|$)/);
    const subjectMatch = fullResponse.match(/===SUBJECT===([\s\S]*?)(?====|$)/);
    const inmailMatch = fullResponse.match(/===INMAIL===([\s\S]*?)(?====|$)/);
    const coldcallMatch = fullResponse.match(/===COLDCALL===([\s\S]*?)(?====|$)/);

    return {
        researchSummary: (researchMatch ? researchMatch[1].trim() : fullResponse.substring(0, 500)),
        connectionRequest: (connectionMatch ? connectionMatch[1].trim() : '').substring(0, 200),
        inmailSubject: subjectMatch ? subjectMatch[1].trim().split('\n')[0] : `Engineering Partnership Opportunity for ${contact.companyName}`,
        inmailDraft: inmailMatch ? inmailMatch[1].trim() : '',
        coldCallScript: coldcallMatch ? coldcallMatch[1].trim() : ''
    };
}

// Generate mock outreach content (no API calls)
function generateMockOutreach(contact) {
    return {
        researchSummary: `${contact.firstName} ${contact.lastName} serves as ${contact.title} at ${contact.companyName}, a ${contact.revenue || 'significant'} revenue ${(contact.industry || 'manufacturing').toLowerCase()} company headquartered in ${contact.hqLocation || 'the US'} with ${contact.employees || 'significant'} employees globally.\n\n${contact.companyName} has been investing heavily in digital transformation and manufacturing modernization. Recent industry analysis suggests the company is focused on improving operational efficiency, reducing time-to-market for new products, and implementing Industry 4.0 technologies across their facilities.\n\nAs ${contact.title}, ${contact.firstName} likely oversees engineering operations, product development cycles, and technology adoption decisions. Key pain points for leaders in this role typically include managing engineering backlog, accelerating product development timelines, integrating automation and IoT solutions, and maintaining quality standards while scaling operations.`,
        connectionRequest: `Hi ${contact.firstName}, I noticed ${contact.companyName}'s push into advanced manufacturing. As a ${contact.title}, I'd love to share how we've helped similar firms cut engineering backlogs by 40%.`.substring(0, 200),
        inmailSubject: `Engineering Partnership Opportunity for ${contact.companyName}`,
        inmailDraft: `Hi ${contact.firstName},\n\nI hope this message finds you well. I've been following ${contact.companyName}'s impressive growth in the ${(contact.industry || 'manufacturing').toLowerCase()} space, and I wanted to reach out because I believe there's a strong alignment between your engineering priorities and our capabilities at Technosoft Engineering.\n\nMany ${contact.title}s at companies similar to ${contact.companyName} are dealing with growing engineering backlogs, pressure to accelerate time-to-market, and the challenge of scaling technical teams without compromising quality. We've helped manufacturers like Harley-Davidson, Thor Industries, and Illinois Tool Works address exactly these challenges.\n\nWould you be open to a brief 15-minute call next week to explore whether there's a fit?\n\nBest regards`,
        coldCallScript: `OPENER (30-45 seconds):\n"Hi ${contact.firstName}, this is [Your Name] from Technosoft Engineering. I know I'm calling out of the blue, so I'll be brief. We work with ${(contact.industry || 'manufacturing').toLowerCase()} companies like ${contact.companyName} to help them accelerate product development and reduce engineering costs. Do you have just two minutes?"\n\nQUALIFICATION QUESTIONS:\n1. "How is ${contact.companyName} currently handling peak engineering workloads?"\n2. "What's your biggest bottleneck in getting products from concept to production?"\n3. "Has ${contact.companyName} been exploring automation or Industry 4.0 initiatives?"\n\nTALKING POINTS:\n1. Engineering Capacity: "Our clients typically see a 40% reduction in engineering backlog within the first quarter."\n2. Cost Efficiency: "Our onsite/offshore model delivers Fortune 500 quality at a 30-40% cost reduction."\n3. Domain Expertise: "We've delivered 250+ projects in ${(contact.industry || 'manufacturing').toLowerCase()} and related sectors."\n\nOBJECTION HANDLING:\n"We handle everything internally." -> "Many of our best clients started that way. Even companies with strong internal teams benefit from a specialized partner for peak workloads or niche capabilities."\n"We already have a provider." -> "We don't suggest replacing what's working. Where we differentiate is AI vision inspection, AGV/AMR automation, and embedded IoT."\n\nCLOSE:\n"${contact.firstName}, based on what you've shared, I think there could be a strong fit. Would you be open to a 30-minute meeting where I can walk you through relevant case studies?"`
    };
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const mode = body.mode || 'discover';
        const isMockMode = process.env.MOCK_MODE !== 'false';
        const geminiKey = process.env.GEMINI_API_KEY;
        // Google CSE env vars no longer needed - using Gemini Search grounding instead

        let contacts = [];

        // ========== UPLOAD MODE: user-provided contacts ==========
        if (mode === 'upload') {
            if (!body.contacts || !Array.isArray(body.contacts) || body.contacts.length === 0) {
                return res.status(400).json({ error: 'No contacts provided in upload' });
            }

            contacts = body.contacts;
            const findLinkedIn_flag = body.findLinkedIn || false;

            // Enrich each contact with AI-generated outreach
            const enrichedContacts = [];
            for (const contact of contacts) {
                try {
                    // Find LinkedIn if requested
                    if (findLinkedIn_flag && !contact.linkedinUrl) {
                        if (geminiKey) {
                            const linkedinUrl = await findLinkedIn(
                                contact.firstName, contact.lastName, contact.companyName,
                                geminiKey
                            );
                            if (linkedinUrl) contact.linkedinUrl = linkedinUrl;
                        }
                        // Always provide a LinkedIn search fallback if no profile found
                        if (!contact.linkedinUrl) {
                            contact.linkedinUrl = buildLinkedInSearchUrl(
                                contact.firstName, contact.lastName, contact.companyName
                            );
                            contact.linkedinIsSearch = true;
                        }
                    }

                    // Generate outreach content
                    if (!isMockMode && geminiKey) {
                        const outreach = await generateOutreachContent(contact, geminiKey);
                        enrichedContacts.push({ ...contact, ...outreach });
                    } else {
                        const outreach = generateMockOutreach(contact);
                        enrichedContacts.push({ ...contact, ...outreach });
                    }
                } catch (err) {
                    console.error(`Error enriching contact ${contact.firstName} ${contact.lastName}:`, err.message);
                    // Fall back to mock outreach for this contact
                    const outreach = generateMockOutreach(contact);
                    enrichedContacts.push({ ...contact, ...outreach });
                }
            }

            return res.status(200).json({
                mock: isMockMode || !geminiKey,
                contacts: enrichedContacts,
                mode: 'upload'
            });
        }

        // ========== DISCOVER MODE: AI-powered prospect discovery ==========
        if (!body.industryPersona) {
            return res.status(400).json({ error: 'Missing required ICP criteria' });
        }

        // Mock mode: return realistic mock data immediately
        if (isMockMode || !geminiKey) {
            contacts = getMockContacts(body);
            const enriched = contacts.map(c => ({ ...c, ...generateMockOutreach(c) }));
            return res.status(200).json({ mock: true, contacts: enriched, criteria: body });
        }

        // Real mode: Discover contacts using Gemini + Google Search grounding
        // Step 1: Find real companies and people matching ICP criteria
        const discovered = await discoverContacts(body, geminiKey);
        if (discovered && discovered.length > 0) {
            contacts = discovered;
        } else {
            // Fallback to mock contacts if discovery fails
            console.error('Contact discovery failed, falling back to built-in list');
            contacts = getMockContacts(body);
        }

        // Step 2: Enrich each contact with LinkedIn + AI outreach content
        // Skip individual LinkedIn lookups in discover mode to save API calls
        // (discovery prompt already found real people, so provide search links)
        const enrichedContacts = [];
        for (const contact of contacts) {
            try {
                // Provide LinkedIn search link for each discovered contact
                if (!contact.linkedinUrl) {
                    contact.linkedinUrl = buildLinkedInSearchUrl(
                        contact.firstName, contact.lastName, contact.companyName
                    );
                    contact.linkedinIsSearch = true;
                }

                // Generate AI outreach content (with delay to respect rate limits)
                if (enrichedContacts.length > 0) await sleep(2000);
                const outreach = await generateOutreachContent(contact, geminiKey);
                enrichedContacts.push({ ...contact, ...outreach });
            } catch (err) {
                console.error(`Error enriching contact ${contact.firstName} ${contact.lastName}:`, err.message);
                const outreach = generateMockOutreach(contact);
                enrichedContacts.push({ ...contact, ...outreach });
            }
        }

        return res.status(200).json({
            mock: false,
            contacts: enrichedContacts,
            criteria: body
        });

    } catch (error) {
        console.error('Outreach generation error:', error);
        return res.status(500).json({ error: 'Failed to generate outreach playbook: ' + error.message });
    }
};
