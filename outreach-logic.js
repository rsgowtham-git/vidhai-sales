// Outreach Generator Logic
let currentContacts = null;
let currentCriteria = null;

document.getElementById('outreachForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateOutreach();
});

// Location selection helpers
const US_STATES = ['CA','TX','IL','OH','MI','IN','PA','NY','WI','TN','NC','GA','MN','MO','SC','AL','KY','CT','NJ','MA'];
const CANADA_PROVINCES = ['ON','QC','BC','AB'];

function selectAllUS() {
    document.querySelectorAll('input[name="location"]').forEach(cb => {
        if (US_STATES.includes(cb.value)) cb.checked = true;
    });
}

function selectAllCanada() {
    document.querySelectorAll('input[name="location"]').forEach(cb => {
        if (CANADA_PROVINCES.includes(cb.value)) cb.checked = true;
    });
}

function clearLocations() {
    document.querySelectorAll('input[name="location"]').forEach(cb => {
        cb.checked = false;
    });
}

async function generateOutreach() {
    const industryPersona = document.getElementById('industryPersona').value;
    const revenueRange = document.getElementById('revenueRange').value;
    const employeeCount = document.getElementById('employeeCount').value;
    const contactCount = document.getElementById('contactCount').value;
    const customTitle = document.getElementById('customTitle').value;

    const locationCheckboxes = document.querySelectorAll('input[name="location"]:checked');
    const locations = Array.from(locationCheckboxes).map(cb => cb.value);

    const titleCheckboxes = document.querySelectorAll('input[name="jobTitle"]:checked');
    const jobTitles = Array.from(titleCheckboxes).map(cb => cb.value);

    if (customTitle) {
        jobTitles.push(customTitle);
    }

    if (!industryPersona || !revenueRange) {
        alert('Please fill in Industry/Company Persona and Revenue Range');
        return;
    }

    if (jobTitles.length === 0) {
        alert('Please select at least one job title');
        return;
    }

    const btn = document.getElementById('generateBtn');
    const progressBar = document.getElementById('progressBar');

    btn.disabled = true;
    btn.textContent = 'Generating...';
    progressBar.style.display = 'block';

    const criteria = {
        industryPersona,
        revenueRange,
        employeeCount,
        contactCount,
        locations,
        jobTitles
    };

    try {
        // Step 1: Searching contacts
        updateProgress(15, 'Searching for matching contacts...');
        await sleep(600);

        updateProgress(30, 'Applying ICP filters...');
        await sleep(400);

        // Step 2: Call the API
        updateProgress(45, 'Finding prospects and generating outreach content...');

        const response = await fetch('/api/outreach-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(criteria)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        updateProgress(70, `Found ${result.contacts.length} contacts. Building playbook...`);
        await sleep(500);

        // Step 3: Display results
        updateProgress(85, 'Preparing results...');
        await sleep(400);

        // Step 4: Save to Supabase
        updateProgress(92, 'Saving to history...');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase.from('generated_outreach').insert({
                user_id: user.id,
                icp_criteria: criteria,
                contacts: result.contacts,
                contact_count: result.contacts.length
            });
            if (error) console.error('Save error:', error);
        }

        updateProgress(100, 'Complete!');
        await sleep(400);

        currentContacts = result.contacts;
        currentCriteria = criteria;
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating outreach playbook: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🎯 Generate Playbook';
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

function displayResults(result) {
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';

    // Show mock banner if applicable
    if (result.mock) {
        document.getElementById('mockBanner').style.display = 'block';
    }

    // Summary stats
    const summaryDiv = document.getElementById('resultSummary');
    summaryDiv.innerHTML = `
        <div class="summary-stat"><strong>${result.contacts.length}</strong> Contacts Found</div>
        <div class="summary-stat"><strong>${result.contacts.filter(c => c.linkedinUrl).length}</strong> LinkedIn Profiles</div>
        <div class="summary-stat"><strong>${result.contacts.filter(c => c.coldCallScript).length}</strong> Complete Playbooks</div>
    `;

    // Contact cards
    const cardsDiv = document.getElementById('contactCards');
    cardsDiv.innerHTML = result.contacts.map((contact, idx) => `
        <div class="contact-card" id="contact-${idx}">
            <div class="contact-card-header" onclick="toggleContact(${idx})">
                <div class="contact-info">
                    <h3>${contact.firstName} ${contact.lastName}</h3>
                    <div class="contact-meta">
                        <span>${contact.title}</span>
                        <span>${contact.companyName}</span>
                        <span>${contact.hqLocation}</span>
                    </div>
                </div>
                <span class="expand-icon">▼</span>
            </div>
            <div class="contact-card-body">
                <div class="contact-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${contact.email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${contact.phone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">LinkedIn:</span>
                        <span class="detail-value"><a href="${contact.linkedinUrl}" target="_blank">${contact.linkedinUrl}</a></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Revenue:</span>
                        <span class="detail-value">${contact.revenue}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Industry:</span>
                        <span class="detail-value">${contact.industry}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Employees:</span>
                        <span class="detail-value">${contact.employees || 'N/A'}</span>
                    </div>
                </div>

                <div class="outreach-section">
                    <h4>Research Summary</h4>
                    <div class="content">${escapeHtml(contact.researchSummary || '')}</div>
                </div>

                <div class="outreach-section">
                    <h4>LinkedIn Connection Request</h4>
                    <div class="content">${escapeHtml(contact.connectionRequest || '')}</div>
                    <div class="char-count">${(contact.connectionRequest || '').length}/200 characters</div>
                </div>

                <div class="outreach-section">
                    <h4>LinkedIn InMail Draft</h4>
                    <div class="content"><strong>Subject:</strong> ${escapeHtml(contact.inmailSubject || '')}\n\n${escapeHtml(contact.inmailDraft || '')}</div>
                </div>

                <div class="outreach-section">
                    <h4>Cold Call Script</h4>
                    <div class="content">${escapeHtml(contact.coldCallScript || '')}</div>
                </div>
            </div>
        </div>
    `).join('');

    cardsDiv.scrollIntoView({ behavior: 'smooth' });
}

function toggleContact(idx) {
    const card = document.getElementById(`contact-${idx}`);
    card.classList.toggle('expanded');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// DOCX Generation using docx.js
async function downloadDOCX() {
    if (!currentContacts || currentContacts.length === 0) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, BorderStyle, AlignmentType } = window.docx;

    const children = [];

    // Title page
    children.push(
        new Paragraph({
            children: [new TextRun({ text: 'PROSPECT INTELLIGENCE PLAYBOOK', bold: true, size: 48, color: '01696F' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 24, color: '626C71' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `${currentContacts.length} Prospects | ${currentCriteria.industryPersona} | ${currentCriteria.revenueRange}`, size: 22, color: '626C71' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            children: [new TextRun({ text: 'Powered by Vidhai Sales Intelligence', italics: true, size: 20, color: '999999' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        })
    );

    // Each contact gets a section
    currentContacts.forEach((contact, idx) => {
        if (idx > 0 || true) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Header
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'PROSPECT INTELLIGENCE BRIEF', bold: true, size: 28, color: '01696F' })],
                spacing: { after: 300 },
                border: { bottom: { color: '01696F', space: 4, style: BorderStyle.SINGLE, size: 6 } }
            })
        );

        // Contact info
        const infoLines = [
            `Contact: ${contact.firstName} ${contact.lastName}`,
            `Title: ${contact.title}`,
            `Company: ${contact.companyName}`,
            `Industry: ${contact.industry}`,
            `Revenue: ${contact.revenue}`,
            `HQ: ${contact.hqLocation}`,
            `LinkedIn: ${contact.linkedinUrl || 'N/A'}`,
            `Email: ${contact.email}`,
            `Phone: ${contact.phone}`
        ];

        infoLines.forEach(line => {
            children.push(new Paragraph({
                children: [new TextRun({ text: line, size: 22 })],
                spacing: { after: 80 }
            }));
        });

        // Research Summary
        children.push(
            new Paragraph({ children: [], spacing: { after: 200 } }),
            new Paragraph({
                children: [new TextRun({ text: 'RESEARCH SUMMARY', bold: true, size: 24, color: '01696F' })],
                spacing: { after: 150 },
                border: { bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 2 } }
            }),
            new Paragraph({
                children: [new TextRun({ text: contact.researchSummary || 'N/A', size: 21 })],
                spacing: { after: 200 }
            })
        );

        // Connection Request
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'LINKEDIN CONNECTION REQUEST', bold: true, size: 24, color: '01696F' })],
                spacing: { after: 150 },
                border: { bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 2 } }
            }),
            new Paragraph({
                children: [new TextRun({ text: contact.connectionRequest || 'N/A', size: 21 })],
                spacing: { after: 200 }
            })
        );

        // InMail Draft
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'LINKEDIN INMAIL DRAFT', bold: true, size: 24, color: '01696F' })],
                spacing: { after: 150 },
                border: { bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 2 } }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Subject: ', bold: true, size: 21 }),
                    new TextRun({ text: contact.inmailSubject || 'N/A', size: 21 })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [new TextRun({ text: contact.inmailDraft || 'N/A', size: 21 })],
                spacing: { after: 200 }
            })
        );

        // Cold Call Script
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'COLD CALLING PITCH & TALKING POINTS', bold: true, size: 24, color: '01696F' })],
                spacing: { after: 150 },
                border: { bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 2 } }
            }),
            new Paragraph({
                children: [new TextRun({ text: contact.coldCallScript || 'N/A', size: 21 })],
                spacing: { after: 200 }
            })
        );
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children
        }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Outreach_Playbook_${new Date().toISOString().split('T')[0]}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}

// CSV Download
function downloadCSV() {
    if (!currentContacts || currentContacts.length === 0) return;

    const headers = ['First Name', 'Last Name', 'Title', 'Company', 'Industry', 'Revenue', 'HQ Location', 'Email', 'Phone', 'LinkedIn URL'];
    const rows = currentContacts.map(c => [
        c.firstName,
        c.lastName,
        c.title,
        c.companyName,
        c.industry,
        c.revenue,
        c.hqLocation,
        c.email,
        c.phone,
        c.linkedinUrl
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Outreach_Contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function resetForm() {
    document.getElementById('formCard').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('mockBanner').style.display = 'none';
    document.getElementById('outreachForm').reset();
    currentContacts = null;
    currentCriteria = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}