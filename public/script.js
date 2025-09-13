class EducationalScraperUI {
    constructor() {
        this.statusInterval = null;
        this.currentData = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Run scraper button
        document.getElementById('runScraperBtn').addEventListener('click', () => {
            this.startScraping();
        });

        // URL input enter key
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startScraping();
            }
        });

        // Example URL buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.dataset.url;
                document.getElementById('urlInput').value = url;
                this.startScraping();
            });
        });

        // Refresh results button
        document.getElementById('refreshResults')?.addEventListener('click', () => {
            this.displayResults();
        });
    }

    async startScraping() {
        const urlInput = document.getElementById('urlInput');
        const url = urlInput.value.trim();

        if (!url) {
            this.showNotification('Please enter a website URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showNotification('Please enter a valid URL (e.g., https://example.com)', 'error');
            return;
        }

        try {
            // Disable button and show status
            this.setButtonState(true);
            this.showStatusSection();

            // Start scraping
            const response = await fetch('/api/scrape/url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to start scraper');
            }

            // Store the scraped data and show results immediately
            this.currentData = [result.data];
            this.setButtonState(false);
            this.hideStatusSection();
            this.renderResults([result.data]);
            this.showResultsSection();
            this.showNotification('Scraping completed successfully!', 'success');

        } catch (error) {
            console.error('Error starting scraper:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
            this.setButtonState(false);
            this.hideStatusSection();
        }
    }

    startStatusMonitoring() {
        this.statusInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();

                this.updateStatusDisplay(status);

                // If scraping is complete, stop monitoring and show results
                if (!status.isRunning && status.progress === 100) {
                    clearInterval(this.statusInterval);
                    this.setButtonState(false);
                    
                    setTimeout(() => {
                        this.displayResults();
                        this.showResultsSection();
                    }, 1000);
                }

            } catch (error) {
                console.error('Error fetching status:', error);
            }
        }, 2000);
    }

    updateStatusDisplay(status) {
        const statusText = document.getElementById('statusText');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const logsOutput = document.getElementById('logsOutput');

        if (statusText) {
            statusText.textContent = status.isRunning ? 
                'Scraping website...' : 
                'Completed';
        }

        if (progressFill && progressText) {
            progressFill.style.width = `${status.progress}%`;
            progressText.textContent = `${status.progress}%`;
        }

        if (logsOutput && status.logs) {
            logsOutput.innerHTML = status.logs
                .slice(-15) // Show last 15 logs
                .map(log => `<div class="log-entry ${log.includes('Error') ? 'error' : ''}">${this.escapeHtml(log)}</div>`)
                .join('');
            
            // Auto-scroll to bottom
            logsOutput.scrollTop = logsOutput.scrollHeight;
        }
    }

    async displayResults() {
        try {
            const response = await fetch('/api/results');
            const results = await response.json();

            // Extract the scraped data
            let scrapedData = [];
            
            // Look for data in various result files
            Object.values(results).forEach(data => {
                if (Array.isArray(data)) {
                    scrapedData = scrapedData.concat(data);
                } else if (data && typeof data === 'object' && data.data) {
                    if (Array.isArray(data.data)) {
                        scrapedData = scrapedData.concat(data.data);
                    }
                }
            });

            this.currentData = scrapedData;
            this.renderResults(scrapedData);

        } catch (error) {
            console.error('Error loading results:', error);
            this.showNotification('Error loading results', 'error');
        }
    }

    renderResults(data) {
        const resultsContent = document.getElementById('resultsContent');
        if (!resultsContent) return;

        if (!data || data.length === 0) {
            resultsContent.innerHTML = `
                <div style="text-align: center; color: #666; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No data scraped yet. Try running the scraper on a website!</p>
                </div>
            `;
            return;
        }

        const resultsHtml = data.map(item => `
            <div class="result-item">
                <h3 class="result-title">${this.escapeHtml(item.title || 'Untitled')}</h3>
                <div class="result-url">${this.escapeHtml(item.url || '')}</div>
                <div class="result-content">${this.escapeHtml(this.truncateText(item.content || '', 300))}</div>
                <div class="result-meta">
                    ${item.source ? `<span class="meta-tag">Source: ${this.escapeHtml(item.source)}</span>` : ''}
                    ${item.type ? `<span class="meta-tag">Type: ${this.escapeHtml(item.type)}</span>` : ''}
                    ${item.category ? `<span class="meta-tag">Category: ${this.escapeHtml(item.category)}</span>` : ''}
                </div>
            </div>
        `).join('');

        resultsContent.innerHTML = `
            ${resultsHtml}
            <div class="download-section">
                <button class="download-btn" onclick="window.scraperUI.downloadResults()">
                    <i class="fas fa-download"></i>
                    Download Results as JSON
                </button>
            </div>
        `;
    }

    downloadResults() {
        if (!this.currentData || this.currentData.length === 0) {
            this.showNotification('No data to download', 'error');
            return;
        }

        const dataStr = JSON.stringify(this.currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `scraped_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Results downloaded successfully!', 'success');
    }

    showStatusSection() {
        const statusSection = document.getElementById('statusSection');
        if (statusSection) {
            statusSection.style.display = 'block';
            statusSection.classList.add('fade-in');
        }
    }

    hideStatusSection() {
        const statusSection = document.getElementById('statusSection');
        if (statusSection) {
            statusSection.style.display = 'none';
        }
    }

    showResultsSection() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
        }
    }

    setButtonState(disabled) {
        const btn = document.getElementById('runScraperBtn');
        if (btn) {
            btn.disabled = disabled;
            if (disabled) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scraping...';
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> Run Scraper';
            }
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 350px;
            font-weight: 500;
        `;
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.scraperUI = new EducationalScraperUI();
});