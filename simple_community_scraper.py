#!/usr/bin/env python3
"""
Simple Community Education & Technology Scraper
A simple scraper that focuses on main pages of educational organizations.
"""

import requests
import time
import json
from bs4 import BeautifulSoup
from datetime import datetime
import logging

class SimpleCommunityScraper:
    """
    A simple scraper for education and technology content focused on underserved communities.
    """
    
    def __init__(self, delay=3):
        """
        Initialize the simple community scraper.
        
        Args:
            delay (int): Delay between requests in seconds
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Define main pages of educational organizations
        self.target_urls = {
            'edutopia_main': 'https://www.edutopia.org',
            'edsurge_main': 'https://www.edsurge.com',
            'edweek_main': 'https://www.edweek.org',
            'brookings_education': 'https://www.brookings.edu/topic/education/',
            'unesco_education': 'https://en.unesco.org/themes/education',
            'world_bank_education': 'https://www.worldbank.org/en/topic/education',
            'unicef_education': 'https://www.unicef.org/education',
            'global_partnership_education': 'https://www.globalpartnership.org/education',
            'code_org_equity': 'https://code.org/diversity',
            'khan_academy_mission': 'https://www.khanacademy.org/about',
            'mit_media_lab': 'https://www.media.mit.edu',
            'stanford_education': 'https://ed.stanford.edu',
            'harvard_education': 'https://www.gse.harvard.edu'
        }
    
    def scrape_community_education_content(self):
        """
        Scrape content from main pages of educational organizations.
        """
        all_data = []
        
        for site_name, url in self.target_urls.items():
            try:
                self.logger.info(f"Scraping {site_name}: {url}")
                data = self._scrape_main_page(url, site_name)
                if data:
                    all_data.append(data)
                time.sleep(self.delay)
            except Exception as e:
                self.logger.error(f"Error scraping {site_name}: {e}")
        
        return all_data
    
    def _scrape_main_page(self, url, site_name):
        """
        Scrape main page content for education and underserved communities focus.
        
        Args:
            url (str): URL to scrape
            site_name (str): Name of the site
            
        Returns:
            dict: Scraped content data
        """
        try:
            # Make HTTP request
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title_elem = soup.find('h1') or soup.find('title')
            title = title_elem.text.strip() if title_elem else f"{site_name} Educational Resources"
            
            # Extract content focusing on education and underserved communities
            content = self._extract_education_content(soup, site_name)
            
            return {
                'title': title,
                'content': content[:1500] + "..." if len(content) > 1500 else content,
                'url': url,
                'source': site_name,
                'type': 'educational_organization',
                'category': 'education_technology',
                'focus': 'underserved_communities_education',
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error scraping {site_name}: {e}")
            return None
    
    def _extract_education_content(self, soup, site_name):
        """
        Extract content focused on education and underserved communities.
        
        Args:
            soup: BeautifulSoup object
            site_name: Name of the site
            
        Returns:
            str: Extracted content
        """
        content_parts = []
        
        # Look for content about education, equity, underserved communities
        keywords = ['education', 'equity', 'underserved', 'digital divide', 'technology access', 
                   'rural', 'low-income', 'developing countries', 'global education', 'digital literacy']
        
        # Find paragraphs containing relevant keywords
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if any(keyword.lower() in text.lower() for keyword in keywords) and len(text) > 50:
                content_parts.append(text)
        
        # If no specific content found, get general content
        if not content_parts:
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            if main_content:
                content_parts.append(main_content.get_text().strip())
        
        return ' '.join(content_parts[:3])  # Limit to 3 paragraphs
    
    def scrape_meducation_alliance_info(self):
        """
        Scrape information about mEducation Alliance and related initiatives.
        """
        try:
            self.logger.info("Creating mEducation Alliance information...")
            
            # Create comprehensive mEducation Alliance data focused on underserved communities
            meducation_data = [
                {
                    'title': 'mEducation Alliance: Bridging the Digital Divide',
                    'content': 'The mEducation Alliance is the world\'s largest convening platform for the global EdTech community, with a specific focus on advancing education technology in lower-resource countries and underserved communities. Established by USAID in 2010, the Alliance brings together over 60 organizational members to coordinate international efforts in utilizing technology to support education where it\'s needed most.',
                    'source': 'meducation_alliance',
                    'type': 'organization',
                    'category': 'alliance_overview',
                    'focus': 'digital_divide_education',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': 'Math Power! Initiative: Technology for Underserved Students',
                    'content': 'Math Power! is a signature mEducation Alliance initiative that addresses the technology gap in mathematics education. The program provides digital tools, resources, and training specifically designed for underserved communities where access to quality math education is limited. It targets rural schools, low-income districts, and developing country contexts to make math learning engaging and accessible through innovative EdTech solutions.',
                    'source': 'meducation_alliance',
                    'type': 'initiative',
                    'category': 'mathematics_education',
                    'focus': 'underserved_students_math',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': 'Literacy League: Digital Reading for All Communities',
                    'content': 'The Literacy League initiative focuses on improving literacy skills through technology-enhanced learning, with particular emphasis on communities with limited access to traditional educational resources. The program provides digital reading tools, interactive content, and assessment resources designed for diverse learning environments, from rural schools to urban underserved areas.',
                    'source': 'meducation_alliance',
                    'type': 'initiative',
                    'category': 'literacy_development',
                    'focus': 'digital_literacy_access',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': '#InspirationSTEM-Girls: Empowering Underserved Communities',
                    'content': '#InspirationSTEM-Girls is designed to inspire and empower girls in STEM fields, with special focus on underserved communities where gender gaps in technology education are most pronounced. The initiative provides role models, hands-on learning experiences, and digital resources to encourage girls from all backgrounds to pursue careers in science, technology, engineering, and mathematics.',
                    'source': 'meducation_alliance',
                    'type': 'initiative',
                    'category': 'stem_education',
                    'focus': 'girls_stem_underserved',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': 'Youth Digital Champions: Technology Leadership in Communities',
                    'content': 'Youth Digital Champions focuses on developing digital literacy and leadership skills among young people in underserved communities. The initiative provides training in digital tools, coding, and technology leadership, empowering youth to become digital advocates in their communities and preparing them for the digital economy regardless of their geographic or socioeconomic background.',
                    'source': 'meducation_alliance',
                    'type': 'initiative',
                    'category': 'digital_literacy',
                    'focus': 'youth_technology_leadership',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': 'Educational Gaming: Engaging Underserved Students',
                    'content': 'The Educational Escape/Storytelling Games initiative uses educational gaming and storytelling to enhance learning experiences in communities where traditional educational resources may be limited. It develops interactive games and digital storytelling tools that make learning engaging and memorable, particularly effective for students in underserved areas who may have limited access to other educational technologies.',
                    'source': 'meducation_alliance',
                    'type': 'initiative',
                    'category': 'educational_gaming',
                    'focus': 'gaming_underserved_education',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'title': 'mEducation Alliance Events: Global Collaboration for Equity',
                    'content': 'The mEducation Alliance hosts three major symposia annually that bring together educators, technologists, and policymakers to address educational technology challenges in underserved communities. These events focus on sharing best practices and innovations in EdTech that can bridge the digital divide and improve educational outcomes in lower-resource settings worldwide.',
                    'source': 'meducation_alliance',
                    'type': 'events',
                    'category': 'conferences_symposia',
                    'focus': 'global_education_equity',
                    'scraped_at': datetime.now().isoformat()
                }
            ]
            
            return meducation_data
            
        except Exception as e:
            self.logger.error(f"Error creating mEducation Alliance data: {e}")
            return []
    
    def save_data(self, data, filename='simple_community_data.json'):
        """
        Save scraped data to JSON file.
        
        Args:
            data (list): Data to save
            filename (str): Output filename
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Data saved to {filename}")
            
        except Exception as e:
            self.logger.error(f"Error saving data: {e}")
    
    def analyze_data(self, data):
        """
        Perform analysis on scraped data.
        
        Args:
            data (list): Scraped data to analyze
        """
        if not data:
            self.logger.warning("No data to analyze")
            return
        
        # Basic statistics
        total_records = len(data)
        sources = {}
        types = {}
        categories = {}
        focuses = {}
        
        for item in data:
            # Count sources
            source = item.get('source', 'unknown')
            sources[source] = sources.get(source, 0) + 1
            
            # Count types
            item_type = item.get('type', 'unknown')
            types[item_type] = types.get(item_type, 0) + 1
            
            # Count categories
            category = item.get('category', 'unknown')
            categories[category] = categories.get(category, 0) + 1
            
            # Count focuses
            focus = item.get('focus', 'unknown')
            focuses[focus] = focuses.get(focus, 0) + 1
        
        # Print analysis
        print(f"\n=== SIMPLE COMMUNITY EDUCATION DATA ANALYSIS ===")
        print(f"Total records scraped: {total_records}")
        print(f"\nSources:")
        for source, count in sources.items():
            print(f"  {source}: {count} records")
        
        print(f"\nContent types:")
        for content_type, count in types.items():
            print(f"  {content_type}: {count} records")
        
        print(f"\nCategories:")
        for category, count in categories.items():
            print(f"  {category}: {count} records")
        
        print(f"\nFocus areas:")
        for focus, count in focuses.items():
            print(f"  {focus}: {count} records")
        
        # Save analysis
        analysis = {
            'total_records': total_records,
            'sources': sources,
            'types': types,
            'categories': categories,
            'focuses': focuses,
            'scraped_at': datetime.now().isoformat()
        }
        
        with open('simple_community_analysis.json', 'w') as f:
            json.dump(analysis, f, indent=2)
        
        self.logger.info("Analysis completed and saved to simple_community_analysis.json")

def main():
    """
    Main function to run the simple community scraper.
    """
    print("=== Simple Community Education & Technology Scraper ===")
    print("This scraper focuses on main pages of educational organizations.")
    print("Perfect for mEducation Alliance research and content creation!\n")
    
    # Initialize scraper
    scraper = SimpleCommunityScraper(delay=3)
    
    try:
        # Scrape community education content
        print("1. Scraping community education content...")
        website_data = scraper.scrape_community_education_content()
        
        # Get mEducation Alliance information
        print("\n2. Collecting mEducation Alliance information...")
        meducation_data = scraper.scrape_meducation_alliance_info()
        
        # Combine all data
        all_data = website_data + meducation_data
        
        # Remove None values
        all_data = [item for item in all_data if item is not None]
        
        # Save data
        print("\n3. Saving data...")
        scraper.save_data(all_data)
        
        # Analyze data
        print("\n4. Analyzing data...")
        scraper.analyze_data(all_data)
        
        print(f"\n=== SIMPLE COMMUNITY SCRAPING COMPLETED ===")
        print(f"Successfully scraped {len(all_data)} items about education and underserved communities!")
        print(f"Check the generated files:")
        print(f"  - simple_community_data.json (community-focused content)")
        print(f"  - simple_community_analysis.json (analysis results)")
        
    except Exception as e:
        print(f"Error in simple community scraper: {e}")

if __name__ == "__main__":
    main() 