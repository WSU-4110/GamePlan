// Strategy Interface (using JavaScript class as contract)
class DataSourceStrategy {
    /**
     * Fetch data based on search query
     * @param {string} query - User search input
     * @returns {Promise<Array>} Array of example objects
     */
    async fetchData(query) {
        throw new Error('fetchData() must be implemented by subclass');
    }
}

// Concrete Strategy A: Sample Data (Development)
class SampleDataStrategy extends DataSourceStrategy {
    constructor() {
        super();
        this.sampleData = [
            {
                title: 'First Person Controller',
                engine: 'Unity',
                description: 'Basic first-person movement controller with mouse look',
                keywords: ['movement', 'player', 'controller', 'fps'],
            },
            {
                title: 'Health System',
                engine: 'Unreal Engine',
                description: 'Complete health and damage system with UI integration',
                keywords: ['health', 'damage', 'combat', 'ui'],
            },
            {
                title: '2D Platformer Physics',
                engine: 'Godot',
                description: 'Smooth 2D platformer movement with jump mechanics',
                keywords: ['platformer', 'physics', '2d', 'jump'],
            },
            {
                title: 'Inventory System',
                engine: 'Unity',
                description: 'Drag and drop inventory with tooltips',
                keywords: ['inventory', 'ui', 'drag', 'items'],
            },
            {
                title: 'Save System',
                engine: 'Unity',
                description: 'Save and load game data with JSON',
                keywords: ['save', 'load', 'data', 'json'],
            },
        ];
    }

    async fetchData(query) {
        // Simulate async behavior for consistency
        return Promise.resolve(this._filterLocal(this.sampleData, query));
    }

    _filterLocal(data, searchText) {
        const lowerQuery = searchText.toLowerCase();
        return data.filter((example) => {
            const titleMatch = example.title.toLowerCase().includes(lowerQuery);
            const descMatch = example.description.toLowerCase().includes(lowerQuery);
            const keywordMatch = example.keywords.some((kw) =>
                kw.toLowerCase().includes(lowerQuery)
            );
            return titleMatch || descMatch || keywordMatch;
        });
    }
}

// Concrete Strategy B: API Data (Production)
class APIDataStrategy extends DataSourceStrategy {
    constructor(apiEndpoint = '/api/search', timeout = 5000) {
        super();
        this.apiEndpoint = apiEndpoint;
        this.timeout = timeout;
    }

    async fetchData(query) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.apiEndpoint}?q=${encodeURIComponent(query)}`, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            return this._handleError(error);
        }
    }

    _handleError(error) {
        console.error('Search API error:', error);
        // Graceful degradation: return empty results
        // Production: could show error message to user
        return [];
    }
}

// Export for Node.js/Jest (doesn't affect browser usage)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataSourceStrategy,
        SampleDataStrategy,
        APIDataStrategy,
    };
}
