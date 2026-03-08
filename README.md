# VidHai Sales

AI-powered sales tool for customized pitch generation, presentations, and professional document creation. Part of the [VidHai](https://github.com/rsgowtham-git) ecosystem.

## Features

### 🎯 Core Capabilities

1. **Pitch Deck Generator**
   - AI-powered customized presentations
   - Professional slide templates
   - Industry-specific content
   - Export to multiple formats

2. **Document Generator** (NEW)
   - **Sales Proposals**: Comprehensive proposals with executive summary, solution details, and pricing
   - **ROI Analysis**: Detailed financial analysis with payback period, savings calculations, and recommendations
   - **Technical Specifications**: Complete technical documentation for implementation projects
   - **Executive Summaries**: High-level reports for leadership
   - **Custom Documents**: Flexible document creation for any purpose

3. **Account Management**
   - Strategic account tracking
   - Opportunity pipeline
   - Activity history
   - Performance metrics

### 🎨 Design System

Built with the **Perplexity Design System**:
- Modern, professional UI
- Light/dark mode support
- Responsive design for all devices
- Accessible components (WCAG 2.1 AA compliant)

## Getting Started

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/rsgowtham-git/vidhai-sales.git
cd vidhai-sales
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

3. Navigate to `http://localhost:8000`

### Database Setup (Optional)

For production use with Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `supabase-setup.sql`
3. Update Supabase credentials in `app.js`

## Usage

### Creating a Pitch Deck

1. Log in to your account
2. Navigate to **Pitch Deck** from the dashboard
3. Fill in client details:
   - Company name and industry
   - Key challenges
   - Your solution
   - Value proposition
4. Click **Generate Deck**
5. Review, customize, and export

### Generating Documents

1. Navigate to **Documents** from the dashboard
2. Select document type:
   - Sales Proposal
   - ROI Analysis
   - Technical Specification
   - Executive Summary
   - Custom Document
3. Fill in the required details
4. Click **Generate**
5. Copy, download, or save to history

### Managing History

- View all generated decks and documents
- Filter by type and date
- Regenerate or edit previous work
- Export to various formats

## Project Structure

```
vidhai-sales/
├── index.html              # Landing page
├── login.html              # Authentication
├── dashboard.html          # Main dashboard
├── deck-generator.html     # Pitch deck creation
├── document-generator.html # Document creation (NEW)
├── history.html            # Document history
├── app.js                  # Core application logic
├── deck-logic.js           # Pitch deck generation
├── document-logic.js       # Document generation (NEW)
├── style.css               # Perplexity design system
├── style-extended.css      # Extended styles
└── supabase-setup.sql      # Database schema
```

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Design System**: Perplexity design tokens and components
- **Storage**: localStorage (development) / Supabase (production)
- **Authentication**: Email/password with session management

## Future Integration with VidHai

This sales tool is designed to integrate seamlessly with the VidHai platform:

1. **Unified Authentication**: Share user accounts across VidHai tools
2. **Content Repository**: Store and access documents from VidHai hub
3. **AI Engine**: Leverage VidHai's AI capabilities for enhanced generation
4. **Analytics**: Centralized reporting and insights
5. **API Integration**: RESTful APIs for tool interoperability

## Customization

### Branding

Update logo and colors in `style.css`:
```css
:root {
  --color-primary: #your-brand-color;
  --color-primary-hover: #your-hover-color;
}
```

### Document Templates

Customize templates in `document-logic.js` by editing the template strings in each generation function.

### Database Schema

Modify `supabase-setup.sql` to add custom fields or tables.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] AI-powered content suggestions
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app (iOS/Android)
- [ ] Email integration
- [ ] Calendar sync
- [ ] Competitive intelligence tracking

## License

MIT License - feel free to use this project for your own purposes.

## Contact

Gowtham RS - [@rsgowtham-git](https://github.com/rsgowtham-git)

Project Link: [https://github.com/rsgowtham-git/vidhai-sales](https://github.com/rsgowtham-git/vidhai-sales)

---

**Part of the VidHai AI Tools Ecosystem**
