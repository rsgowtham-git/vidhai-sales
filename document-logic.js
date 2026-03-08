// Document generation logic for VidHai Sales

// Show/hide forms based on document type selection
document.getElementById('documentType')?.addEventListener('change', function() {
    const type = this.value;
    
    // Hide all forms
    document.querySelectorAll('.document-form').forEach(form => {
        form.classList.add('hidden');
    });
    
    // Show selected form
    if (type) {
        const formMap = {
            'proposal': 'proposalForm',
            'roi': 'roiForm',
            'technical': 'technicalForm',
            'executive': 'executiveForm',
            'custom': 'customForm'
        };
        
        const formId = formMap[type];
        if (formId) {
            document.getElementById(formId).classList.remove('hidden');
        }
    }
});

// Generate Sales Proposal
function generateProposal() {
    const data = {
        clientName: document.getElementById('propClientName').value,
        industry: document.getElementById('propIndustry').value,
        solution: document.getElementById('propSolution').value,
        challenge: document.getElementById('propChallenge').value,
        value: document.getElementById('propValue').value,
        investment: document.getElementById('propInvestment').value,
        timeline: document.getElementById('propTimeline').value
    };

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const document = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      SALES PROPOSAL
                ${data.solution}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prepared for: ${data.clientName}
Industry: ${data.industry}
Date: ${date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY

${data.clientName} faces a critical challenge in ${data.industry}:

${data.challenge}

We propose implementing ${data.solution} to address this challenge and
transform your operations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE CHALLENGE

${data.challenge}

This impacts your organization through:
• Operational inefficiencies
• Increased costs and resource strain  
• Competitive disadvantage
• Inability to scale effectively

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROPOSED SOLUTION

${data.solution}

Our solution delivers:

${data.value}

Key Benefits:
• Streamlined operations and improved efficiency
• Reduced costs and faster time-to-market
• Enhanced competitive positioning
• Scalable platform for future growth
• Industry-leading support and training

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPLEMENTATION APPROACH

Phase 1: Discovery & Planning (Weeks 1-2)
• Requirements analysis and system audit
• Stakeholder interviews and workflow mapping
• Detailed implementation roadmap

Phase 2: Configuration & Setup (Weeks 3-8)
• System installation and configuration
• Data migration and integration
• Custom workflow development

Phase 3: Training & Deployment (Weeks 9-12)
• Comprehensive user training programs
• Pilot deployment with key users
• Knowledge transfer and documentation

Phase 4: Optimization & Support (Ongoing)
• Performance monitoring and optimization
• Dedicated technical support
• Continuous improvement initiatives

Total Timeline: ${data.timeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INVESTMENT

Total Investment: ${data.investment}

Includes:
• Complete solution deployment
• Implementation services and project management
• Training and change management
• 12 months of premium support
• Ongoing updates and enhancements

Payment Terms: Flexible payment options available

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY CHOOSE US

• Proven track record with leading ${data.industry} companies
• Deep industry expertise and technical excellence
• Comprehensive support and training programs
• Commitment to your long-term success
• Scalable solutions that grow with your business

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS

1. Review this proposal with your team
2. Schedule a detailed technical demonstration
3. Finalize implementation timeline
4. Execute agreement and begin onboarding

We look forward to partnering with ${data.clientName} on this
transformative initiative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:
[Your Name]
[Title]
[Email]
[Phone]

Proposal Valid Through: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    displayDocument(document, 'Sales Proposal');
}

// Generate ROI Analysis
function generateROI() {
    const data = {
        clientName: document.getElementById('roiClientName').value,
        currentCost: parseFloat(document.getElementById('roiCurrentCost').value) || 0,
        proposedCost: parseFloat(document.getElementById('roiProposedCost').value) || 0,
        efficiencyGain: parseFloat(document.getElementById('roiEfficiencyGain').value) || 0,
        timeframe: parseInt(document.getElementById('roiTimeframe').value) || 3,
        additionalBenefits: document.getElementById('roiAdditionalBenefits').value
    };

    const annualSavings = data.currentCost - data.proposedCost;
    const totalSavings = annualSavings * data.timeframe;
    const roi = ((totalSavings - data.proposedCost) / data.proposedCost * 100).toFixed(1);
    const paybackMonths = (data.proposedCost / (annualSavings / 12)).toFixed(1);

    const document = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   ROI ANALYSIS REPORT
            ${data.clientName} Investment Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analysis Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Timeframe: ${data.timeframe} Years

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY

This analysis demonstrates the financial impact of implementing our
solution for ${data.clientName}.

Key Findings:
• ROI: ${roi}% over ${data.timeframe} years
• Payback Period: ${paybackMonths} months
• Annual Savings: $${annualSavings.toLocaleString()}
• ${data.timeframe}-Year Total Savings: $${totalSavings.toLocaleString()}
• Efficiency Improvement: ${data.efficiencyGain}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COST ANALYSIS

Current State:
  Annual Operating Cost:        $${data.currentCost.toLocaleString()}
  ${data.timeframe}-Year Total Cost:           $${(data.currentCost * data.timeframe).toLocaleString()}

Proposed Solution:
  Implementation Investment:    $${data.proposedCost.toLocaleString()}
  Reduced Annual Cost:          $${(data.currentCost - annualSavings).toLocaleString()}
  ${data.timeframe}-Year Total Cost:           $${(data.proposedCost + (data.currentCost - annualSavings) * data.timeframe).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINANCIAL BENEFITS

Year 1:
  Implementation Cost:          $${data.proposedCost.toLocaleString()}
  Annual Savings:               $${annualSavings.toLocaleString()}
  Net Benefit:                  $${(annualSavings - data.proposedCost).toLocaleString()}

Year 2:
  Cumulative Savings:           $${(annualSavings * 2).toLocaleString()}
  Net Benefit:                  $${(annualSavings * 2 - data.proposedCost).toLocaleString()}

Year 3:
  Cumulative Savings:           $${(annualSavings * 3).toLocaleString()}
  Net Benefit:                  $${(annualSavings * 3 - data.proposedCost).toLocaleString()}

Total ${data.timeframe}-Year ROI:                     ${roi}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPERATIONAL BENEFITS

Efficiency Gains:
• ${data.efficiencyGain}% improvement in operational efficiency
• Reduced manual processes and errors
• Faster time-to-market for products
• Enhanced quality and consistency

Additional Quantifiable Benefits:
${data.additionalBenefits}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK MITIGATION

Low Risk Investment:
• Proven technology with established track record
• Comprehensive training and support included
• Phased implementation reduces disruption
• Flexible scaling to match business growth

Payback Period: ${paybackMonths} months

After payback, all savings flow directly to bottom line, providing
continuous value and competitive advantage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDATION

Based on this financial analysis, we recommend proceeding with
implementation. The combination of strong ROI (${roi}%), rapid
payback (${paybackMonths} months), and substantial operational
benefits makes this a compelling investment for ${data.clientName}.

The ${data.timeframe}-year net benefit of $${(totalSavings - data.proposedCost).toLocaleString()} represents
significant value creation and positions your organization for
sustained competitive advantage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assumptions & Methodology:
• Analysis based on current operating costs and efficiencies
• Conservative efficiency gain estimates
• Does not include intangible benefits (improved morale, etc.)
• All figures in USD

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    displayDocument(document, 'ROI Analysis');
}

// Generate Technical Specification
function generateTechnical() {
    const data = {
        project: document.getElementById('techProject').value,
        scope: document.getElementById('techScope').value,
        requirements: document.getElementById('techRequirements').value,
        deliverables: document.getElementById('techDeliverables').value,
        timeline: document.getElementById('techTimeline').value
    };

    const document = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               TECHNICAL SPECIFICATION DOCUMENT
                    ${data.project}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Version: 1.0
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Project Timeline: ${data.timeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROJECT OVERVIEW

${data.scope}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. TECHNICAL REQUIREMENTS

${data.requirements}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. SYSTEM ARCHITECTURE

3.1 Infrastructure
• Scalable cloud-based deployment
• High availability and redundancy
• Secure data storage and transmission
• API-first architecture for integration

3.2 Technology Stack
• Modern web-based interface
• RESTful API services
• Database: Enterprise-grade RDBMS
• Authentication: SSO/OAuth 2.0

3.3 Integration Points
• ERP system integration
• CAD/PLM system connectivity
• Third-party API integrations
• Data import/export capabilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. DELIVERABLES

${data.deliverables}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. IMPLEMENTATION PHASES

Phase 1: Requirements Finalization
• Detailed requirements gathering
• Technical design documentation
• Architecture review and approval

Phase 2: Development & Configuration
• Core system development
• Integration implementation
• Custom feature development

Phase 3: Testing & Quality Assurance
• Unit testing
• Integration testing
• User acceptance testing (UAT)
• Performance testing

Phase 4: Deployment & Training
• Production deployment
• User training programs
• Documentation delivery
• Go-live support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. QUALITY ASSURANCE

• Comprehensive testing at each phase
• Automated testing framework
• Performance benchmarking
• Security audits and penetration testing
• Code review and quality gates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. SECURITY & COMPLIANCE

• Role-based access control (RBAC)
• Data encryption at rest and in transit
• Audit logging and monitoring
• Compliance with industry standards
• Regular security updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. SUPPORT & MAINTENANCE

• Dedicated technical support team
• SLA: 99.9% uptime guarantee
• Regular system updates and patches
• Proactive monitoring and maintenance
• Knowledge base and documentation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. ACCEPTANCE CRITERIA

• All technical requirements met
• Successful completion of UAT
• Performance benchmarks achieved
• Security audit passed
• Training completed
• Documentation delivered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. PROJECT TIMELINE

${data.timeline}

Milestone tracking and regular status updates will be provided
throughout the project lifecycle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Prepared By: [Your Name]
Approval Required: Yes
Next Review Date: [Date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    displayDocument(document, 'Technical Specification');
}

// Generate Executive Summary
function generateExecutive() {
    const data = {
        title: document.getElementById('execTitle').value,
        highlights: document.getElementById('execHighlights').value,
        metrics: document.getElementById('execMetrics').value,
        recommendations: document.getElementById('execRecommendations').value
    };

    const document = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    EXECUTIVE SUMMARY
                   ${data.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Confidential

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY HIGHLIGHTS

${data.highlights}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFORMANCE METRICS

${data.metrics}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRATEGIC RECOMMENDATIONS

${data.recommendations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS

1. Review and approve recommendations
2. Allocate resources for implementation
3. Establish timeline and milestones
4. Schedule follow-up review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prepared By: [Your Name]
[Title]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    displayDocument(document, 'Executive Summary');
}

// Generate Custom Document
function generateCustom() {
    const data = {
        title: document.getElementById('customTitle').value,
        content: document.getElementById('customContent').value
    };

    const document = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ${data.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    displayDocument(document, data.title);
}

// Display generated document
function displayDocument(content, title) {
    const outputSection = document.getElementById('outputSection');
    const outputDiv = document.getElementById('documentOutput');
    
    outputDiv.textContent = content;
    outputSection.classList.remove('hidden');
    
    // Store for later use
    window.currentDocument = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
    };
    
    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy document to clipboard
function copyToClipboard() {
    if (window.currentDocument) {
        navigator.clipboard.writeText(window.currentDocument.content)
            .then(() => {
                alert('Document copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
    }
}

// Download document as text file
function downloadDocument() {
    if (window.currentDocument) {
        const blob = new Blob([window.currentDocument.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${window.currentDocument.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Save document to history
function saveDocument() {
    if (!window.currentDocument) {
        alert('No document to save');
        return;
    }

    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        alert('Please log in to save documents');
        window.location.href = 'login.html';
        return;
    }

    // Get existing documents from localStorage
    const documents = JSON.parse(localStorage.getItem('savedDocuments') || '[]');
    
    // Add new document
    documents.push({
        id: Date.now(),
        userId: user.email,
        title: window.currentDocument.title,
        content: window.currentDocument.content,
        timestamp: window.currentDocument.timestamp
    });
    
    // Save back to localStorage
    localStorage.setItem('savedDocuments', JSON.stringify(documents));
    
    alert('Document saved successfully!');
}
