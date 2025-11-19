class SearchManager {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.searchInput = null;
        this.resultsArea = null;
        this.resultsInfo = null;
        this.resultsCount = null;
        this.noResults = null;
        this.browseGrid = null;
        this.filtersSection = null;
    }

    /**
     * Initialize search UI elements
     * @param {Object} elements - DOM element references
     */
    initialize(elements) {
        this.searchInput = elements.searchInput;
        this.resultsArea = elements.resultsArea;
        this.resultsInfo = elements.resultsInfo;
        this.resultsCount = elements.resultsCount;
        this.noResults = elements.noResults;
        this.browseGrid = elements.browseGrid || null;
        this.filtersSection = elements.filtersSection || null;
    }

    /**
     * Change data source strategy at runtime
     * @param {DataSourceStrategy} strategy - New strategy
     */
    setDataSource(strategy) {
        this.dataSource = strategy;
    }

    /**
     * Execute search with current strategy
     * @param {string} query - Search query
     */
    async search(query) {
        const trimmedQuery = query.trim();

        if (trimmedQuery === '') {
            this._clearResults();
            return;
        }

        try {
            // Delegate to current strategy
            const results = await this.dataSource.fetchData(trimmedQuery);
            this._renderResults(results, trimmedQuery);
        } catch (error) {
            console.error('Search failed:', error);
            this._renderResults([], trimmedQuery);
        }
    }

    /**
     * Render search results to DOM
     * @param {Array} results - Search results
     * @param {string} query - Original query
     */
    _renderResults(results, query) {
        this.resultsArea.innerHTML = '';

        if (this.browseGrid) {
            this.browseGrid.style.display = results.length === 0 ? '' : 'none';
        }
        if (this.filtersSection) {
            this.filtersSection.style.display = results.length === 0 ? '' : 'none';
        }

        if (results.length === 0) {
            if (this.resultsInfo) this.resultsInfo.style.display = 'none';
            if (this.noResults) this.noResults.style.display = 'block';
            return;
        }

        // Show results count
        if (this.resultsInfo) this.resultsInfo.style.display = 'block';
        if (this.noResults) this.noResults.style.display = 'none';
        if (this.resultsCount) {
            const plural = results.length !== 1 ? 's' : '';
            this.resultsCount.textContent = `Found ${results.length} result${plural} for "${query}"`;
        }

        // Create cards for each result
        results.forEach((example) => {
            const card = this._createCard(example);
            this.resultsArea.appendChild(card);
        });

        // Reactivate button handlers for new cards
        if (typeof setupButtons === 'function') {
            setupButtons();
        }
    }

    /**
     * Create a result card element
     * @param {Object} example - Example data
     * @returns {HTMLElement} Card element
     */
    _createCard(example) {
        const card = document.createElement('div');
        card.className = 'example-card';
        card.innerHTML = `
            <h4>${example.title}</h4>
            <p class="engine-tag">${example.engine}</p>
            <p>${example.description}</p>
            <div class="card-actions">
                <button class="btn btn-primary">View Code</button>
                <button class="btn btn-outline">Download</button>
            </div>
        `;
        return card;
    }

    /**
     * Clear all search results
     */
    _clearResults() {
        if (this.resultsArea) this.resultsArea.innerHTML = '';
        if (this.resultsInfo) this.resultsInfo.style.display = 'none';
        if (this.noResults) this.noResults.style.display = 'none';
    }
}

// Export for Node.js/Jest (doesn't affect browser usage)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}
