// Deck Generator Logic
let currentDeck = null;

document.getElementById('deckForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateDeck();
});

async function generateDeck() {
    const company = document.getElementById('company').value;
    const contact = document.getElementById('contact').value;
    const title = document.getElementById('title').value;
    const industry = document.getElementById('industry').value;
    const painPoints = document.getElementById('painPoints').value;
    
    const engagementCheckboxes = document.querySelectorAll('input[name="engagement"]:checked');
    const engagementTypes = Array.from(engagementCheckboxes).map(cb => cb.value);
    
    if (!company || !industry) {
        alert('Please fill in Company and Industry');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    const progressBar = document.getElementById('progressBar');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    
    btn.disabled = true;
    btn.textContent = 'Generating...';
    progressBar.style.display = 'block';
    
    try {
        // Step 1: Search case studies
        updateProgress(20, 'Searching case study library...');
        await sleep(800);
        
        const { data: allCases } = await supabase
            .from('case_studies')
            .select('*');
        
        // Match by industry and engagement type
        const relevantCases = (allCases || []).filter(cs => {
            const industryMatch = cs.industry === industry;
            const engagementMatch = engagementTypes.some(et => 
                cs.engagement_types.some(cet => cet.includes(et.split(' ')[0]))
            );
            return industryMatch || engagementMatch;
        }).slice(0, 3);
        
        updateProgress(40, `Found ${relevantCases.length} relevant case studies`);
        await sleep(600);
        
        // Step 2: Generate deck structure
        updateProgress(60, 'Generating presentation content...');
        await sleep(800);
        
        const deckData = {
            company,
            contact: contact || 'Leadership Team',
            title: title || '',
            industry,
            engagementTypes,
            painPoints,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            slides: [
                {
                    type: 'title',
                    title: company,
                    subtitle: 'Engineering Partnership Proposal',
                    meta: `Prepared for: ${contact || 'Leadership Team'}\nDate: ${new Date().toLocaleDateString()}`
                },
                {
                    type: 'content',
                    title: 'Understanding Your Challenges',
                    content: painPoints || `As a leader in the ${industry} industry, you face evolving challenges in engineering excellence and operational efficiency.`,
                    bullets: [
                        'Legacy systems limiting innovation velocity',
                        'Need for faster time-to-market',
                        'Quality and consistency improvements',
                        'Cost optimization opportunities'
                    ]
                },
                {
                    type: 'content',
                    title: 'Our Capabilities',
                    content: `We specialize in ${engagementTypes.join(', ')} for the ${industry} industry.`,
                    bullets: engagementTypes.length > 0 
                        ? engagementTypes.map(et => `${et}: End-to-end solutions from design to deployment`)
                        : ['Product Engineering', 'Plant Engineering', 'Digital Manufacturing', 'Automation']
                },
                ...relevantCases.map(cs => ({
                    type: 'case-study',
                    title: `Success Story: ${cs.company}`,
                    company: cs.company,
                    industry: cs.industry,
                    summary: cs.summary,
                    outcome: cs.outcome,
                    engagementTypes: cs.engagement_types
                })),
                {
                    type: 'content',
                    title: 'Why Partner With Us',
                    bullets: [
                        '250+ successful projects delivered across industries',
                        `Deep expertise in ${industry} sector challenges`,
                        'Proven ROI with measurable outcomes',
                        'End-to-end support from concept to commissioning',
                        'Global team with local presence'
                    ]
                },
                {
                    type: 'content',
                    title: 'Proposed Next Steps',
                    bullets: [
                        'Schedule discovery workshop (2-3 days)',
                        'Conduct technical assessment of current state',
                        'Develop customized proposal with ROI analysis',
                        'Begin pilot project with defined milestones'
                    ]
                }
            ],
            caseStudiesUsed: relevantCases.map(cs => cs.id)
        };
        
        updateProgress(80, 'Finalizing presentation...');
        await sleep(600);
        
        // Step 3: Save to database
        updateProgress(90, 'Saving to history...');
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from('generated_decks').insert({
            user_id: user.id,
            company_name: company,
            contact_name: contact,
            industry,
            engagement_types: engagementTypes,
            deck_content: deckData
        });
        
        if (error) throw error;
        
        updateProgress(100, 'Complete!');
        await sleep(400);
        
        // Display deck
        currentDeck = deckData;
        displayDeck(deckData);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating deck: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Research & Generate Deck';
        setTimeout(() => {
            progressBar.style.display = 'none';
        }, 1000);
    }
}

function updateProgress(percent, text) {
    document.getElementById('progressBarFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function displayDeck(deck) {
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';
    
    const contentDiv = document.getElementById('deckContent');
    contentDiv.innerHTML = '';
    
    deck.slides.forEach((slide, idx) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'slide-preview';
        
        let slideHTML = `<div class="slide-number">Slide ${idx + 1} of ${deck.slides.length}</div>`;
        slideHTML += `<h3 class="slide-title">${slide.title}</h3>`;
        
        if (slide.subtitle) {
            slideHTML += `<p class="slide-subtitle">${slide.subtitle}</p>`;
        }
        
        if (slide.meta) {
            slideHTML += `<pre class="slide-meta">${slide.meta}</pre>`;
        }
        
        if (slide.content) {
            slideHTML += `<p class="slide-content">${slide.content}</p>`;
        }
        
        if (slide.bullets && slide.bullets.length > 0) {
            slideHTML += '<ul class="slide-bullets">';
            slide.bullets.forEach(bullet => {
                slideHTML += `<li>${bullet}</li>`;
            });
            slideHTML += '</ul>';
        }
        
        if (slide.outcome) {
            slideHTML += `<div class="slide-outcome">`;
            slideHTML += `<strong>Outcome:</strong> ${slide.outcome}`;
            slideHTML += `</div>`;
        }
        
        slideEl.innerHTML = slideHTML;
        contentDiv.appendChild(slideEl);
    });
    
    contentDiv.scrollIntoView({ behavior: 'smooth' });
}

function downloadDeck() {
    if (!currentDeck) return;
    
    let text = `${currentDeck.company} - Capability Deck\n`;
    text += `Generated: ${currentDeck.date}\n`;
    text += `Prepared for: ${currentDeck.contact}\n`;
    text += `\n${'='.repeat(60)}\n\n`;
    
    currentDeck.slides.forEach((slide, idx) => {
        text += `SLIDE ${idx + 1}: ${slide.title}\n`;
        text += `${'-'.repeat(60)}\n`;
        
        if (slide.subtitle) text += `${slide.subtitle}\n\n`;
        if (slide.meta) text += `${slide.meta}\n\n`;
        if (slide.content) text += `${slide.content}\n\n`;
        
        if (slide.bullets) {
            slide.bullets.forEach(bullet => {
                text += `• ${bullet}\n`;
            });
            text += '\n';
        }
        
        if (slide.outcome) {
            text += `OUTCOME: ${slide.outcome}\n\n`;
        }
        
        text += '\n';
    });
    
    downloadTextFile(text, `${currentDeck.company}_Capability_Deck.txt`);
}

function copyDeck() {
    if (!currentDeck) return;
    
    let text = `${currentDeck.company} - Capability Deck\n\n`;
    currentDeck.slides.forEach((slide, idx) => {
        text += `[Slide ${idx + 1}] ${slide.title}\n`;
        if (slide.content) text += `${slide.content}\n`;
        if (slide.bullets) {
            slide.bullets.forEach(b => text += `• ${b}\n`);
        }
        text += '\n';
    });
    
    copyToClipboard(text);
}

function resetForm() {
    document.getElementById('formCard').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('deckForm').reset();
    currentDeck = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}