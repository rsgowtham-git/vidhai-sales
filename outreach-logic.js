// Outreach Generator Logic
let currentContacts = null;
let currentCriteria = null;
let uploadedContacts = null;
let currentMode = 'discover';

document.getElementById('outreachForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateOutreach();
});

// ========================================
// MODE SWITCHING
// ========================================
function switchMode(mode) {
    currentMode = mode;
    const discoverTab = document.getElementById('modeTabDiscover');
    const uploadTab = document.getElementById('modeTabUpload');
    const formCard = document.getElementById('formCard');
    const uploadCard = document.getElementById('uploadCard');
    const resultCard = document.getElementById('resultCard');

    if (mode === 'discover') {
        discoverTab.classList.add('active');
        uploadTab.classList.remove('active');
        formCard.style.display = 'block';
        uploadCard.style.display = 'none';
        resultCard.style.display = 'none';
    } else {
        discoverTab.classList.remove('active');
        uploadTab.classList.add('active');
        formCard.style.display = 'none';
        uploadCard.style.display = 'block';
        resultCard.style.display = 'none';
    }
}

// ========================================
// CSV / EXCEL UPLOAD
// ========================================

// Column name mapping — flexible header matching
const COLUMN_MAP = {
    firstName: ['first name', 'firstname', 'first_name', 'fname', 'given name'],
    lastName: ['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name'],
    title: ['title', 'job title', 'jobtitle', 'job_title', 'position', 'role', 'designation'],
    companyName: ['company', 'company name', 'companyname', 'company_name', 'organization', 'org', 'employer'],
    industry: ['industry', 'sector', 'vertical', 'industry_vertical'],
    revenue: ['revenue', 'annual revenue', 'company revenue', 'annual_revenue', 'rev'],
    hqLocation: ['location', 'hq location', 'hq_location', 'headquarters', 'city', 'state', 'hq', 'address', 'city/state'],
    email: ['email', 'email address', 'e-mail', 'email_address', 'work email', 'contact email'],
    phone: ['phone', 'phone number', 'telephone', 'mobile', 'phone_number', 'work phone', 'direct phone'],
    linkedinUrl: ['linkedin', 'linkedin url', 'linkedin_url', 'linkedin profile', 'li url', 'profile url'],
    employees: ['employees', 'employee count', 'employee_count', 'headcount', 'company size', 'size']
};

function matchColumn(header) {
    const normalized = header.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
        if (aliases.includes(normalized)) return field;
    }
    return null;
}

function parseCSVText(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    // Parse CSV with proper quote handling
    function parseLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    }

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine).filter(r => r.some(c => c));
    return { headers, rows };
}

function mapToContacts(headers, rows) {
    // Map headers to our field names
    const fieldMap = {};
    headers.forEach((h, idx) => {
        const field = matchColumn(h);
        if (field) fieldMap[idx] = field;
    });

    return rows.map(row => {
        const contact = {};
        Object.entries(fieldMap).forEach(([idx, field]) => {
            contact[field] = row[parseInt(idx)] || '';
        });
        // Set defaults for missing fields
        contact.firstName = contact.firstName || '';
        contact.lastName = contact.lastName || '';
        contact.title = contact.title || '';
        contact.companyName = contact.companyName || '';
        contact.industry = contact.industry || '';
        contact.revenue = contact.revenue || '';
        contact.hqLocation = contact.hqLocation || '';
        contact.email = contact.email || '';
        contact.phone = contact.phone || '';
        contact.linkedinUrl = contact.linkedinUrl || '';
        contact.employees = contact.employees || '';
        return contact;
    }).filter(c => c.firstName || c.lastName || c.companyName); // Filter empty rows
}

function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const { headers, rows } = parseCSVText(e.target.result);
            processUploadedData(file.name, headers, rows);
        };
        reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
        // Load SheetJS dynamically for Excel files
        loadSheetJS().then(() => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                if (jsonData.length < 2) {
                    alert('The file appears to be empty or has no data rows.');
                    return;
                }
                const headers = jsonData[0].map(h => String(h || ''));
                const rows = jsonData.slice(1).map(r => r.map(c => String(c || '')));
                processUploadedData(file.name, headers, rows);
            };
            reader.readAsArrayBuffer(file);
        });
    } else {
        alert('Please upload a .csv, .xlsx, or .xls file.');
    }
}

let sheetJSLoaded = false;
function loadSheetJS() {
    if (sheetJSLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = () => { sheetJSLoaded = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function processUploadedData(fileName, headers, rows) {
    uploadedContacts = mapToContacts(headers, rows);

    if (uploadedContacts.length === 0) {
        alert('No valid contacts found. Make sure your file has headers like: First Name, Last Name, Title, Company, etc.');
        return;
    }

    // Show preview
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('uploadFileName').textContent = fileName;
    document.getElementById('uploadContactCount').textContent = uploadedContacts.length + ' contacts found';

    // Build preview table (show first 5)
    const previewContacts = uploadedContacts.slice(0, 5);
    const thead = document.getElementById('uploadPreviewHead');
    const tbody = document.getElementById('uploadPreviewBody');

    thead.innerHTML = '<tr><th>NAME</th><th>TITLE</th><th>COMPANY</th><th>INDUSTRY</th><th>LOCATION</th></tr>';
    tbody.innerHTML = previewContacts.map(c => `
        <tr>
            <td>${escapeHtml(c.firstName + ' ' + c.lastName)}</td>
            <td>${escapeHtml(c.title)}</td>
            <td>${escapeHtml(c.companyName)}</td>
            <td>${escapeHtml(c.industry)}</td>
            <td>${escapeHtml(c.hqLocation)}</td>
        </tr>
    `).join('');

    if (uploadedContacts.length > 5) {
        tbody.innerHTML += `<tr><td colspan="5" style="text-align:center; opacity:0.6;">... and ${uploadedContacts.length - 5} more contacts</td></tr>`;
    }

    // Hide dropzone
    document.getElementById('uploadDropzone').style.display = 'none';
}

function clearUpload() {
    uploadedContacts = null;
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadDropzone').style.display = 'flex';
    document.getElementById('csvFileInput').value = '';
}

function downloadTemplate() {
    const headers = 'First Name,Last Name,Title,Company,Industry,Revenue,Location,Email,Phone,LinkedIn URL';
    const sample = 'James,Anderson,VP Engineering,Lincoln Electric Holdings,Industrial Manufacturing,$3.8B,"Cleveland, OH",james.anderson@lincolnelectric.com,+1 (216) 555-1234,https://linkedin.com/in/james-anderson';
    const csv = headers + '\n' + sample + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outreach_contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Drag and drop
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('uploadDropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('csvFileInput');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileUpload(input);
        }
    });
});

// ========================================
// GENERATE FROM UPLOADED CONTACTS
// ========================================
async function generateFromUpload() {
    if (!uploadedContacts || uploadedContacts.length === 0) {
        alert('No contacts loaded. Please upload a file first.');
        return;
    }

    const btn = document.getElementById('uploadGenerateBtn');
    const progressBar = document.getElementById('uploadProgressBar');

    btn.disabled = true;
    btn.textContent = 'Generating...';
    progressBar.style.display = 'block';

    const findLinkedIn = document.getElementById('findLinkedIn')?.checked || false;

    try {
        updateUploadProgress(10, 'Processing ' + uploadedContacts.length + ' contacts...');
        await sleep(400);

        updateUploadProgress(25, 'Sending contacts to AI for personalization...');

        const response = await fetch('/api/outreach-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'upload',
                contacts: uploadedContacts,
                findLinkedIn: findLinkedIn
            })
        });

        if (!response.ok) {
            throw new Error('API error: ' + response.status);
        }

        const result = await response.json();

        updateUploadProgress(75, 'Generated outreach for ' + result.contacts.length + ' contacts...');
        await sleep(400);

        // Save to Supabase
        updateUploadProgress(90, 'Saving to history...');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase.from('generated_outreach').insert({
                user_id: user.id,
                icp_criteria: { mode: 'upload', contactCount: uploadedContacts.length },
                contacts: result.contacts,
                contact_count: result.contacts.length
            });
            if (error) console.error('Save error:', error);
        }

        updateUploadProgress(100, 'Complete!');
        await sleep(400);

        currentContacts = result.contacts;
        currentCriteria = { mode: 'upload', industryPersona: 'Uploaded Contacts', revenueRange: 'Various' };

        // Hide upload card, show results
        document.getElementById('uploadCard').style.display = 'none';
        document.querySelector('.mode-selector').style.display = 'none';
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating outreach playbook: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Playbook for Uploaded Contacts';
        setTimeout(() => { progressBar.style.display = 'none'; }, 1000);
    }
}

function updateUploadProgress(percent, text) {
    document.getElementById('uploadProgressBarFill').style.width = percent + '%';
    document.getElementById('uploadProgressText').textContent = text;
}

// ========================================
// DISCOVER MODE — Original generation
// ========================================

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
        mode: 'discover',
        industryPersona,
        revenueRange,
        employeeCount,
        contactCount,
        locations,
        jobTitles
    };

    try {
        // Step 1: Searching the web for real companies
        updateProgress(15, 'Searching the web for matching companies...');
        await sleep(600);

        updateProgress(30, 'Discovering prospects and generating outreach...');
        await sleep(400);

        // Step 2: Call the API (this may take 30-60 seconds as AI searches the web)
        updateProgress(45, 'AI is researching companies and building outreach... this may take a moment');

        const response = await fetch('/api/outreach-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(criteria)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            if (response.status === 504 || response.status === 502) {
                throw new Error('Request timed out. The AI search is taking longer than expected. Try reducing the number of contacts or try again.');
            }
            throw new Error(errData.error || 'API error: ' + response.status);
        }

        const result = await response.json();

        updateProgress(70, 'Found ' + result.contacts.length + ' contacts. Building playbook...');
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

        // Hide form and mode selector
        document.getElementById('formCard').style.display = 'none';
        document.querySelector('.mode-selector').style.display = 'none';
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating outreach playbook: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Playbook';
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
                    <h3>${escapeHtml(contact.firstName + ' ' + contact.lastName)}</h3>
                    <div class="contact-meta">
                        <span>${escapeHtml(contact.title)}</span>
                        <span>${escapeHtml(contact.companyName)}</span>
                        <span>${escapeHtml(contact.hqLocation)}</span>
                    </div>
                </div>
                <span class="expand-icon">&#9660;</span>
            </div>
            <div class="contact-card-body">
                <div class="contact-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${escapeHtml(contact.email)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${escapeHtml(contact.phone)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">LinkedIn:</span>
                        <span class="detail-value">${contact.linkedinUrl ? '<a href="' + escapeHtml(contact.linkedinUrl) + '" target="_blank">' + (contact.linkedinIsSearch ? 'Search on LinkedIn' : escapeHtml(contact.linkedinUrl)) + '</a>' + (contact.linkedinIsSearch ? ' <span style="color:var(--text-muted);font-size:0.8em">(auto-search)</span>' : '') : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Revenue:</span>
                        <span class="detail-value">${escapeHtml(contact.revenue)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Industry:</span>
                        <span class="detail-value">${escapeHtml(contact.industry)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Employees:</span>
                        <span class="detail-value">${escapeHtml(contact.employees || 'N/A')}</span>
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
    const card = document.getElementById('contact-' + idx);
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
            children: [new TextRun({ text: 'Generated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), size: 24, color: '626C71' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            children: [new TextRun({ text: currentContacts.length + ' Prospects | ' + (currentCriteria.industryPersona || 'Uploaded Contacts') + ' | ' + (currentCriteria.revenueRange || 'Various'), size: 22, color: '626C71' })],
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
        children.push(new Paragraph({ children: [new PageBreak()] }));

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
            'Contact: ' + contact.firstName + ' ' + contact.lastName,
            'Title: ' + contact.title,
            'Company: ' + contact.companyName,
            'Industry: ' + contact.industry,
            'Revenue: ' + contact.revenue,
            'HQ: ' + contact.hqLocation,
            'LinkedIn: ' + (contact.linkedinUrl || 'N/A'),
            'Email: ' + contact.email,
            'Phone: ' + contact.phone
        ];

        infoLines.forEach(line => {
            children.push(new Paragraph({
                children: [new TextRun({ text: line, size: 22 })],
                spacing: { after: 80 }
            }));
        });

        // Sections
        const sections = [
            { title: 'RESEARCH SUMMARY', content: contact.researchSummary },
            { title: 'LINKEDIN CONNECTION REQUEST', content: contact.connectionRequest },
            { title: 'LINKEDIN INMAIL DRAFT', content: (contact.inmailSubject ? 'Subject: ' + contact.inmailSubject + '\n\n' : '') + (contact.inmailDraft || '') },
            { title: 'COLD CALLING PITCH & TALKING POINTS', content: contact.coldCallScript }
        ];

        sections.forEach(section => {
            children.push(
                new Paragraph({ children: [], spacing: { after: 200 } }),
                new Paragraph({
                    children: [new TextRun({ text: section.title, bold: true, size: 24, color: '01696F' })],
                    spacing: { after: 150 },
                    border: { bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 2 } }
                }),
                new Paragraph({
                    children: [new TextRun({ text: section.content || 'N/A', size: 21 })],
                    spacing: { after: 200 }
                })
            );
        });
    });

    const doc = new Document({
        sections: [{ properties: {}, children }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Outreach_Playbook_' + new Date().toISOString().split('T')[0] + '.docx';
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
        ...rows.map(row => row.map(cell => '"' + (cell || '').replace(/"/g, '""') + '"').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Outreach_Contacts_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function resetForm() {
    document.querySelector('.mode-selector').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('mockBanner').style.display = 'none';
    currentContacts = null;
    currentCriteria = null;

    if (currentMode === 'discover') {
        document.getElementById('formCard').style.display = 'block';
        document.getElementById('outreachForm').reset();
    } else {
        document.getElementById('uploadCard').style.display = 'block';
        clearUpload();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}
