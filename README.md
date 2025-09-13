# Educational Data Scraping Tools

This repository contains comprehensive web scraping tools designed to support research and content collection for educational technology organizations, particularly aligned with the mEducation Alliance internship requirements.

**🎯 100% FREE - No APIs, No Keys, No Costs!** All tools use pure HTML parsing to scrape publicly accessible educational content.

## Overview

The tools in this repository are built to support the following internship duties:

- **Communications**: Research and collect content from Alliance members and other EdTech organizations
- **Content Creation**: Create original content for blogs, case studies, and newsletters
- **Research & Analysis**: Conduct ongoing research on emerging trends in EdTech
- **Event Support**: Gather information about educational events and symposia
- **Community Engagement**: Support signature initiatives and programs

## Tools Included

### 1. General Education Scraper (`education_scraper.py`)

A comprehensive web scraper for educational websites and resources.

**Features:**
- Scrapes multiple educational websites (Edutopia, EdWeek, EdSurge, Khan Academy, Coursera)
- Extracts articles, courses, and educational content
- Supports both static and dynamic content (using Selenium)
- Saves data in multiple formats (JSON, CSV, Excel)
- Includes data analysis capabilities
- **100% Free - No API keys required!**

**Target Websites:**
- Edutopia (educational articles and resources)
- Education Week (educational news and research)
- EdSurge (EdTech news and product information)
- Khan Academy (course and learning resource data)
- Coursera (course information)
- MIT OpenCourseWare (free courses)
- OpenStax (free textbooks)
- FreeCodeCamp (free coding tutorials)
- W3Schools (free web development tutorials)
- Mozilla Developer Network (free developer resources)

### 2. mEducation Alliance Scraper (`meducation_scraper.py`)

A specialized scraper focused on mEducation Alliance and related organizations.

**Features:**
- Scrapes mEducation Alliance website and initiatives
- Collects data from member organizations
- Gathers information about events and symposia
- Scrapes research content relevant to EdTech in low-resource settings
- Generates newsletter content automatically
- Focuses on global EdTech trends
- **100% Free - No API keys required!**

### 3. Demo Scraper (`demo_scraper.py`)

A simple demonstration scraper that shows how to collect educational data.

**Features:**
- Easy-to-understand code structure
- Scrapes popular free educational websites
- Includes mEducation Alliance information
- Generates analysis reports
- **Perfect for learning and demonstration purposes**

**Target Organizations:**
- mEducation Alliance
- USAID Education
- UNESCO ICT in Education
- World Bank Education
- EdTech Impact
- Common Sense Education
- ISTE
- Khan Academy
- Code.org
- Scratch
- And many more...

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mEducation
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Chrome WebDriver (for Selenium):**
   ```bash
   # On Windows, download ChromeDriver from:
   # https://chromedriver.chromium.org/
   # Or use webdriver-manager (included in requirements)
   ```

## Usage

### Running the General Education Scraper

```bash
python education_scraper.py
```

This will:
- Scrape educational websites
- Extract articles and course information
- Save data to multiple formats
- Generate analysis reports

### Running the mEducation Alliance Scraper

```bash
python meducation_scraper.py
```

This will:
- Scrape mEducation Alliance website and initiatives
- Collect data from member organizations
- Gather research content
- Generate newsletter content
- Create comprehensive datasets

### Running the Demo Scraper (Recommended for beginners)

```bash
python demo_scraper.py
```

This will:
- Scrape popular educational websites
- Collect mEducation Alliance information
- Generate analysis reports
- **Perfect for understanding how the scrapers work**

### Custom Usage

You can also use the scrapers programmatically:

```python
from meducation_scraper import mEducationScraper

# Initialize scraper
scraper = mEducationScraper(headless=True, delay=3)

# Scrape specific content
meducation_data = scraper.scrape_meducation_alliance()
org_data = scraper.scrape_edtech_organizations()
research_data = scraper.scrape_edtech_research()

# Save data
scraper.save_data(meducation_data, 'meducation_data', 'json')

# Generate newsletter
newsletter = scraper.generate_newsletter_content(meducation_data)

# Clean up
scraper.cleanup()
```

## Output Files

The scrapers generate several output files:

### Data Files
- `education_data_YYYYMMDD_HHMMSS.json` - Raw scraped data in JSON format
- `education_data_YYYYMMDD_HHMMSS.csv` - Data in CSV format for Excel
- `education_data_YYYYMMDD_HHMMSS.xlsx` - Data in Excel format

### Analysis Files
- `analysis_results.json` - Basic statistics and analysis
- `meducation_analysis.json` - Detailed analysis for mEducation data

### Newsletter Content
- `newsletter_content.json` - Generated newsletter content organized by sections

### Log Files
- `scraper.log` - General scraper logs
- `meducation_scraper.log` - mEducation-specific logs

## Data Structure

The scraped data includes the following fields:

```json
{
  "title": "Article or Content Title",
  "content": "Extracted content (truncated to 500 characters)",
  "url": "Source URL",
  "source": "Website or organization name",
  "type": "Content type (article, course, event, etc.)",
  "category": "Content category",
  "scraped_at": "Timestamp of when data was scraped"
}
```

## Alignment with Internship Requirements

### Communications Duties
- **Content Collection**: Automatically collects content from Alliance members and EdTech organizations
- **Research Support**: Gathers articles, reports, and resources for publication
- **Newsletter Development**: Generates structured content for bi-weekly newsletters

### Research & Analysis Duties
- **Trend Analysis**: Scrapes global EdTech trends and developments
- **Research Collection**: Gathers academic and research content
- **Data Analysis**: Provides statistical analysis of collected data

### Event Support Duties
- **Event Information**: Collects data about upcoming symposia and events
- **Participant Research**: Gathers information about member organizations
- **Content Preparation**: Provides content for event materials

### Program & Community Engagement
- **Initiative Tracking**: Monitors signature initiatives (Math Power!, Literacy League, etc.)
- **Member Information**: Collects data about Alliance members
- **Resource Discovery**: Identifies relevant educational resources

## Ethical Considerations

- **Rate Limiting**: Built-in delays between requests to avoid overwhelming servers
- **Robots.txt Compliance**: Respects website robots.txt files
- **User-Agent Headers**: Uses proper browser identification
- **Error Handling**: Graceful error handling to avoid disrupting services
- **Free Content Only**: Only scrapes publicly accessible, free educational content
- **No API Keys**: Uses pure HTML parsing - no authentication required

## Customization

You can customize the scrapers by:

1. **Adding New Websites**: Modify the `target_sites` dictionary in the scraper classes
2. **Adjusting Scraping Rules**: Modify the CSS selectors and parsing logic
3. **Changing Output Formats**: Add new export formats in the `save_data` method
4. **Filtering Content**: Add content filtering based on keywords or categories

## Troubleshooting

### Common Issues

1. **ChromeDriver Not Found**: Install ChromeDriver or use webdriver-manager
2. **Website Changes**: Update CSS selectors if websites change their structure
3. **Rate Limiting**: Increase delay between requests if encountering blocks
4. **Memory Issues**: Reduce the number of concurrent scrapes for large datasets

### Debug Mode

Run scrapers with debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Add new scraping capabilities or improvements
4. Test thoroughly
5. Submit a pull request

## License

This project is designed for educational and research purposes. Please respect the terms of service of the websites being scraped.

## Support

For questions or issues related to the mEducation Alliance internship or these tools, please refer to the internship coordinator or technical documentation. 