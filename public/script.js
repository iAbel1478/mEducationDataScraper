class EducationalScraperUI {
    constructor() {
        this.statusInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadResults();
    }

    bindEvents() {
        // Scraper buttons
        document.querySelectorAll('.scraper-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scraperType = e.target.closest('.scraper-btn').dataset.scraper;
                this.startScraper(scraperType);
            });
        });

        // Refresh results button
        document.getElementById('refreshResults')?.addEventListener('click', () => {
            this.loadResults();
        });
    }

    async startScraper(scraperType) {
        try {
            // Disable all scraper buttons
            this.setScraperButtonsState(true);

            // Show status section
            this.showStatusSection();

            // Start scraper
            const response = await fetch(`/api/scrape/${scraperType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to start scraper');
            }

            // Start monitoring progress
            this.startStatusMonitoring();

            this.showNotification('Scraper started successfully!', 'success');

        } catch (error) {
            console.error('Error starting scraper:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
            this.setScraperButtonsState(false);
            this.hideStatusSection();
        }
    }

    startStatusMonitoring() {
        this.statusInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();

                this.updateStatusDisplay(status);

                // If scraping is complete, stop monitoring and load results
                if (!status.isRunning && status.progress === 100) {
                    clearInterval(this.statusInterval);
                    this.setScraperButtonsState(false);
                    
                    setTimeout(() => {
                        this.loadResults();
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
                `Running ${status.currentScraper} scraper...` : 
                'Completed';
        }

        if (progressFill && progressText) {
            progressFill.style.width = `${status.progress}%`;
            progressText.textContent = `${status.progress}%`;
        }

        if (logsOutput && status.logs) {
            logsOutput.innerHTML = status.logs
                .slice(-10) // Show last 10 logs
                .map(log => `<div class="log-entry ${log.includes('Error') ? 'error' : ''}">${this.escapeHtml(log)}</div>`)
                .join('');
            
            // Auto-scroll to bottom
            logsOutput.scrollTop = logsOutput.scrollHeight;
        }
    }

    async loadResults() {
        try {
            const response = await fetch('/api/results');
            const results = await response.json();

            this.displayResults(results);

            if (Object.keys(results).length > 0) {
                this.showResultsSection();
            }

        } catch (error) {
            console.error('Error loading results:', error);
            this.showNotification('Error loading results', 'error');
        }
    }

    displayResults(results) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;

        resultsGrid.innerHTML = '';

        Object.entries(results).forEach(([filename, data]) => {
            const resultCard = this.createResultCard(filename, data);
            resultsGrid.appendChild(resultCard);
        });
    }

    createResultCard(filename, data) {
        const card = document.createElement('div');
        card.className = 'result-card fade-in';

        const isAnalysis = filename.includes('analysis');
        const isArray = Array.isArray(data);
        
        let stats = {};
        let preview = '';

        if (isAnalysis && data.total_records !== undefined) {
            stats = {
                'Total Records': data.total_records,
                'Sources': Object.keys(data.sources || {}).length,
                'Categories': Object.keys(data.categories || {}).length,
                'Types': Object.keys(data.types || {}).length
            };
            preview = JSON.stringify(data, null, 2);
        } else if (isArray) {
            stats = {
                'Total Items': data.length,
                'Sources': [...new Set(data.map(item => item.source))].length,
                'Categories': [...new Set(data.map(item => item.category))].length,
                'Types': [...new Set(data.map(item => item.type))].length
            };
            preview = JSON.stringify(data.slice(0, 2), null, 2) + '\n...';
        } else {
            stats = {
                'File Size': `${JSON.stringify(data).length} chars`,
                'Type': typeof data,
                'Keys': Object.keys(data).length
            };
            preview = JSON.stringify(data, null, 2);
        }

        card.innerHTML = `
            <div class="result-header">
                <h3>${this.formatFilename(filename)}</h3>
                <button class="download-btn" onclick="window.open('/api/download/${filename}', '_blank')">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
            
            <div class="result-stats">
                ${Object.entries(stats).map(([label, value]) => `
                    <div class="stat-item">
                        <span class="stat-value">${value}</span>
                        <span class="stat-label">${label}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="result-preview">
                <pre>${this.escapeHtml(preview.substring(0, 1000))}${preview.length > 1000 ? '...' : ''}</pre>
            </div>
        `;

        return card;
    }

    formatFilename(filename) {
        return filename
            .replace(/[_-]/g, ' ')
            .replace(/\.(json|csv|xlsx)$/i, '')
            .replace(/\b\w/g, l => l.toUpperCase());
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

    setScraperButtonsState(disabled) {
        document.querySelectorAll('.scraper-btn').forEach(btn => {
            btn.disabled = disabled;
            if (disabled) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            } else {
                const scraperType = btn.dataset.scraper;
                const icons = {
                    simple: 'fas fa-rocket',
                    education: 'fas fa-database',
                    meducation: 'fas fa-globe'
                };
                const labels = {
                    simple: 'Run Simple Scraper',
                    education: 'Run Education Scraper',
                    meducation: 'Run mEducation Scraper'
                };
                btn.innerHTML = `<i class="${icons[scraperType]}"></i> ${labels[scraperType]}`;
            }
        });
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
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
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
    new EducationalScraperUI();
});