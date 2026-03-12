// Vercel Serverless Function: /api/outreach-generate
// Handles ICP-based prospect discovery and outreach content generation

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

// Mock data for realistic demo
function getMockContacts(criteria) {
    const mockCompanies = [
        {
            companyName: 'Lincoln Electric Holdings',
            industry: 'Industrial Manufacturing',
            revenue: '$3.8B',
            hqLocation: 'Cleveland, OH',
            employees: '12,000+'
        },
        {
            companyName: 'Textron Inc',
            industry: 'Aerospace & Defense',
            revenue: '$13.7B',
            hqLocation: 'Providence, RI',
            employees: '33,000+'
        },
        {
            companyName: 'Parker Hannifin',
            industry: 'Industrial Manufacturing',
            revenue: '$19.1B',
            hqLocation: 'Cleveland, OH',
            employees: '58,000+'
        },
        {
            companyName: 'BorgWarner Inc',
            industry: 'Automotive Components',
            revenue: '$14.2B',
            hqLocation: 'Auburn Hills, MI',
            employees: '44,000+'
        },
        {
            companyName: 'PACCAR Inc',
            industry: 'Transportation Equipment',
            revenue: '$35.1B',
            hqLocation: 'Bellevue, WA',
            employees: '29,000+'
        },
        {
            companyName: 'Roper Technologies',
            industry: 'Diversified Industrial',
            revenue: '$5.6B',
            hqLocation: 'Sarasota, FL',
            employees: '16,400+'
        },
        {
            companyName: 'AMETEK Inc',
            industry: 'Electronic Instruments',
            revenue: '$6.6B',
            hqLocation: 'Berwyn, PA',
            employees: '21,000+'
        },
        {
            companyName: 'Cummins Inc',
            industry: 'Power Solutions',
            revenue: '$34.1B',
            hqLocation: 'Columbus, IN',
            employees: '73,600+'
        },
        {
            companyName: 'Illinois Tool Works',
            industry: 'Diversified Manufacturing',
            revenue: '$16.1B',
            hqLocation: 'Glenview, IL',
            employees: '46,000+'
        },
        {
            companyName: 'Dover Corporation',
            industry: 'Industrial Manufacturing',
            revenue: '$8.5B',
            hqLocation: 'Downers Grove, IL',
            employees: '25,000+'
        }
    ];

    const mockTitles = criteria.jobTitles && criteria.jobTitles.length > 0
        ? criteria.jobTitles
        : ['VP Engineering', 'Director Product Development', 'VP Manufacturing'];

    const mockFirstNames = ['James', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Lisa', 'David', 'Karen', 'William', 'Patricia'];
    const mockLastNames = ['Anderson', 'Mitchell', 'Thompson', 'Rodriguez', 'Nakamura', 'Patel', 'O\'Brien', 'Chen', 'Kowalski', 'Fernandez'];

    const count = Math.min(parseInt(criteria.contactCount) || 5, mockCompanies.length);
    const contacts = [];

    for (let i = 0; i < count; i++) {
        const company = mockCompanies[i];
        const firstName = mockFirstNames[i];
        const lastName = mockLastNames[i];
        const title = mockTitles[i % mockTitles.length];
        const emailDomain = company.companyName.toLowerCase().replace(/[^a-z]/g, '') + '.com';

        contacts.push({
            firstName,
            lastName,
            title,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
            phone: `+1 (${String(200 + i * 100 + Math.floor(Math.random() * 99)).padStart(3, '0')}) ${String(400 + Math.floor(Math.random() * 599)).padStart(3, '0')}-${String(1000 + Math.floor(Math.random() * 8999))}`,
            linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            companyName: company.companyName,
            industry: company.industry,
            revenue: company.revenue,
            hqLocation: company.hqLocation,
            employees: company.employees,
            researchSummary: generateMockResearch(firstName, lastName, title, company),
            connectionRequest: generateMockConnectionRequest(firstName, title, company),
            inmailSubject: `Engineering Partnership Opportunity for ${company.companyName}`,
            inmailDraft: generateMockInmail(firstName, lastName, title, company),
            coldCallScript: generateMockColdCall(firstName, lastName, title, company)
        });
    }

    return contacts;
}

function generateMockResearch(firstName, lastName, title, company) {
    return `${firstName} ${lastName} serves as ${title} at ${company.companyName}, a ${company.revenue} revenue ${company.industry.toLowerCase()} company headquartered in ${company.hqLocation} with ${company.employees} employees globally.

${company.companyName} has been investing heavily in digital transformation and manufacturing modernization. Recent industry analysis suggests the company is focused on improving operational efficiency, reducing time-to-market for new products, and implementing Industry 4.0 technologies across their facilities.

As ${title}, ${firstName} likely oversees engineering operations, product development cycles, and technology adoption decisions. Key pain points for leaders in this role typically include managing engineering backlog, accelerating product development timelines, integrating automation and IoT solutions, and maintaining quality standards while scaling operations. Technosoft's expertise in CAD services, embedded systems, turnkey automation (AGV/AMR, robotics), and plant engineering directly addresses these challenges.`;
}

function generateMockConnectionRequest(firstName, title, company) {
    const messages = [
        `Hi ${firstName}, I noticed ${company.companyName}'s push into advanced manufacturing. As a ${title}, I'd love to share how we've helped similar firms cut engineering backlogs by 40%.`,
        `${firstName}, impressed by ${company.companyName}'s growth trajectory. We specialize in engineering services for ${company.industry.toLowerCase()} — would love to connect and share insights.`,
        `Hi ${firstName}, fellow engineering enthusiast here. We've helped companies like ${company.companyName} accelerate product development. Would love to connect and exchange ideas.`
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return msg.substring(0, 200);
}

function generateMockInmail(firstName, lastName, title, company) {
    return `Hi ${firstName},

I hope this message finds you well. I've been following ${company.companyName}'s impressive growth in the ${company.industry.toLowerCase()} space, and I wanted to reach out because I believe there's a strong alignment between your engineering priorities and our capabilities at Technosoft Engineering.

Many ${title}s at companies similar to ${company.companyName} are dealing with growing engineering backlogs, pressure to accelerate time-to-market, and the challenge of scaling technical teams without compromising quality. We've helped manufacturers like Harley-Davidson, Thor Industries, and Illinois Tool Works address exactly these challenges through our onsite/offshore engineering model.

Specifically, I think our turnkey automation solutions (AGV/AMR, robotics, AI vision inspection) and our CAD/product engineering services could significantly impact ${company.companyName}'s operational efficiency.

Would you be open to a brief 15-minute call next week to explore whether there's a fit? I'd love to share a few relevant case studies from the ${company.industry.toLowerCase()} sector.

Best regards`;
}

function generateMockColdCall(firstName, lastName, title, company) {
    return `OPENER (30-45 seconds):
"Hi ${firstName}, this is [Your Name] from Technosoft Engineering. I know I'm calling out of the blue, so I'll be brief. We work with ${company.industry.toLowerCase()} companies like ${company.companyName} to help them accelerate product development and reduce engineering costs through our specialized engineering services. I noticed ${company.companyName} has been expanding, and I wanted to see if you're facing any of the challenges we typically help with. Do you have just two minutes?"

QUALIFICATION QUESTIONS:
1. "How is ${company.companyName} currently handling peak engineering workloads? Are you primarily using internal teams or do you leverage external engineering partners?"
2. "What's your biggest bottleneck right now in getting products from concept to production? Is it design capacity, testing/validation, or something else?"
3. "Has ${company.companyName} been exploring automation or Industry 4.0 initiatives? If so, what stage are those projects in?"

TALKING POINTS:
1. Engineering Capacity: "We provide dedicated engineering teams that integrate seamlessly with your existing workflows — our clients typically see a 40% reduction in engineering backlog within the first quarter."
2. Cost Efficiency: "Our onsite/offshore model delivers Fortune 500 quality engineering at a 30-40% cost reduction compared to adding full-time headcount."
3. Domain Expertise: "We've delivered 250+ projects in ${company.industry.toLowerCase()} and related sectors, including work with companies like Harley-Davidson and Thor Industries."

OBJECTION HANDLING:
Objection: "We handle everything internally."
Response: "That's great — many of our best clients started that way. What we've found is that even companies with strong internal teams benefit from having a specialized partner for peak workloads or niche capabilities like turnkey automation or CAD migration. Would it be helpful to see how other ${company.industry.toLowerCase()} companies have structured this?"

Objection: "We already have an engineering services provider."
Response: "Understood — and I wouldn't suggest replacing what's working. Many of our clients work with multiple partners for different specializations. Where we really differentiate is in areas like AI vision inspection, AGV/AMR automation, and embedded IoT — areas where deep domain expertise makes a significant difference."

CLOSE:
"${firstName}, based on what you've shared, I think there could be a strong fit. Would you be open to a 30-minute meeting where I can walk you through 2-3 case studies specifically relevant to ${company.companyName}? I'm available [suggest two specific times]. What works best for you?"`;
}

// Gemini API call for real mode
async function callGemini(prompt, apiKey) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: TECHNOSOFT_CONTEXT }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Real ZoomInfo search (stub — activate when API key is available)
async function searchZoomInfo(criteria, apiKey) {
    // ZoomInfo API integration point
    // For now, returns empty — mock mode handles this
    return [];
}

// Real Google CSE for LinkedIn (stub — activate when API key is available)
async function findLinkedIn(firstName, lastName, companyName, apiKey, engineId) {
    try {
        const query = encodeURIComponent(`${firstName} ${lastName} ${companyName}`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${query}&siteSearch=linkedin.com/in/`;
        const response = await fetch(url);
        const data = await response.json();
        return data.items?.[0]?.link || null;
    } catch {
        return null;
    }
}

// Generate outreach content via Gemini for a single contact
async function generateOutreachContent(contact, geminiKey) {
    const contactInfo = `Contact: ${contact.firstName} ${contact.lastName}, ${contact.title} at ${contact.companyName}\nIndustry: ${contact.industry}\nRevenue: ${contact.revenue}\nLocation: ${contact.hqLocation}`;

    // Generate research summary
    const researchPrompt = `Based on the following contact information, generate a 2-3 paragraph research summary about this person and their company, focusing on potential engineering needs and pain points that Technosoft can address:\n\n${contactInfo}\n\nFocus on: recent company news, industry trends, potential automation needs, engineering challenges typical for this industry and company size.`;
    const researchSummary = await callGemini(researchPrompt, geminiKey);

    // Generate connection request
    const connectionPrompt = `Generate a LinkedIn connection request message (MAXIMUM 200 characters) for:\n${contactInfo}\nContext: ${researchSummary}\nMake it personal, mention something specific about their role or company. Do NOT be generic.`;
    const connectionRequest = await callGemini(connectionPrompt, geminiKey);

    // Generate InMail
    const inmailPrompt = `Generate a LinkedIn InMail message (150-200 words) with a subject line for:\n${contactInfo}\nResearch: ${researchSummary}\nInclude: specific reference to their challenges, one Technosoft capability that addresses it, clear CTA for a 15-minute call. Tone: consultative, not pushy.\n\nFormat:\nSUBJECT: [subject line here]\n[body of InMail]`;
    const inmailRaw = await callGemini(inmailPrompt, geminiKey);
    const subjectMatch = inmailRaw.match(/SUBJECT:\s*(.+)/i);
    const inmailSubject = subjectMatch ? subjectMatch[1].trim() : `Engineering Partnership for ${contact.companyName}`;
    const inmailDraft = inmailRaw.replace(/SUBJECT:\s*.+\n?/i, '').trim();

    // Generate cold call script
    const coldCallPrompt = `Generate a cold calling pitch script for:\n${contactInfo}\nResearch: ${researchSummary}\n\nFormat:\nOPENER (30-45 seconds): Introduction and hook\nQUALIFICATION QUESTIONS (3 questions): Discovery questions about their engineering needs\nTALKING POINTS (3 points): Key Technosoft capabilities relevant to them\nOBJECTION HANDLING (2 common objections with responses)\nCLOSE: Ask for a meeting/next steps`;
    const coldCallScript = await callGemini(coldCallPrompt, geminiKey);

    return {
        researchSummary,
        connectionRequest: connectionRequest.substring(0, 200),
        inmailSubject,
        inmailDraft,
        coldCallScript
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
        const criteria = req.body;

        if (!criteria || !criteria.industryPersona) {
            return res.status(400).json({ error: 'Missing required ICP criteria' });
        }

        const isMockMode = process.env.MOCK_MODE !== 'false';
        const geminiKey = process.env.GEMINI_API_KEY;

        // Mock mode: return realistic mock data immediately
        if (isMockMode || !geminiKey) {
            const contacts = getMockContacts(criteria);
            return res.status(200).json({
                mock: true,
                contacts,
                criteria
            });
        }

        // Real mode: use APIs
        const zoomInfoKey = process.env.ZOOMINFO_API_KEY;
        const googleCseKey = process.env.GOOGLE_CSE_API_KEY;
        const googleCseEngine = process.env.GOOGLE_CSE_ENGINE_ID;

        let contacts = [];

        // Try ZoomInfo first
        if (zoomInfoKey) {
            contacts = await searchZoomInfo(criteria, zoomInfoKey);
        }

        // If no ZoomInfo results, fall back to mock contacts but enrich with real AI
        if (contacts.length === 0) {
            contacts = getMockContacts(criteria);
        }

        // Enrich each contact with Gemini-generated content
        const enrichedContacts = [];
        for (const contact of contacts) {
            try {
                // Find LinkedIn URL if Google CSE is configured
                if (googleCseKey && googleCseEngine) {
                    const linkedinUrl = await findLinkedIn(
                        contact.firstName, contact.lastName, contact.companyName,
                        googleCseKey, googleCseEngine
                    );
                    if (linkedinUrl) {
                        contact.linkedinUrl = linkedinUrl;
                    }
                }

                // Generate AI outreach content
                const outreach = await generateOutreachContent(contact, geminiKey);
                enrichedContacts.push({
                    ...contact,
                    ...outreach
                });
            } catch (err) {
                console.error(`Error enriching contact ${contact.firstName} ${contact.lastName}:`, err);
                enrichedContacts.push(contact);
            }
        }

        return res.status(200).json({
            mock: false,
            contacts: enrichedContacts,
            criteria
        });

    } catch (error) {
        console.error('Outreach generation error:', error);
        return res.status(500).json({ error: 'Failed to generate outreach playbook' });
    }
};