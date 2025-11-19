/**
 * Unit tests for SearchManager class
 * Tests UI rendering, DOM manipulation, and search functionality
 */

// Import the classes we're testing
const SearchManager = require('./searchManager');
const { DataSourceStrategy, SampleDataStrategy, APIDataStrategy } = require('./dataSourceStrategy');

describe('SearchManager', () => {
    let searchManager;
    let mockDataSource;
    let mockElements;

    beforeEach(() => {
        // Set up jsdom document for DOM manipulation tests
        document.body.innerHTML = `
      <input id="search-input" />
      <div id="results-area"></div>
      <div id="results-info"></div>
      <div id="results-count"></div>
      <div id="no-results" style="display: none;"></div>
      <div id="examples-grid"></div>
      <section class="filters"></section>
    `;

        // Create mock DOM elements
        mockElements = {
            searchInput: document.getElementById('search-input'),
            resultsArea: document.getElementById('results-area'),
            resultsInfo: document.getElementById('results-info'),
            resultsCount: document.getElementById('results-count'),
            noResults: document.getElementById('no-results'),
            browseGrid: document.getElementById('examples-grid'),
            filtersSection: document.querySelector('.filters'),
        };

        // Create a mock data source
        mockDataSource = {
            fetchData: jest.fn(),
        };

        // Create SearchManager instance
        searchManager = new SearchManager(mockDataSource);
        searchManager.initialize(mockElements);
    });

    describe('Constructor', () => {
        test('should initialize with a data source', () => {
            const manager = new SearchManager(mockDataSource);
            expect(manager.dataSource).toBe(mockDataSource);
        });

        test('should initialize DOM element properties to null', () => {
            const manager = new SearchManager(mockDataSource);
            expect(manager.searchInput).toBeNull();
            expect(manager.resultsArea).toBeNull();
            expect(manager.resultsInfo).toBeNull();
            expect(manager.resultsCount).toBeNull();
            expect(manager.noResults).toBeNull();
        });
    });

    describe('initialize()', () => {
        test('should set DOM element references', () => {
            const manager = new SearchManager(mockDataSource);
            manager.initialize(mockElements);

            expect(manager.searchInput).toBe(mockElements.searchInput);
            expect(manager.resultsArea).toBe(mockElements.resultsArea);
            expect(manager.resultsInfo).toBe(mockElements.resultsInfo);
            expect(manager.resultsCount).toBe(mockElements.resultsCount);
            expect(manager.noResults).toBe(mockElements.noResults);
        });
    });

    describe('setDataSource()', () => {
        test('should update the data source strategy', () => {
            const newDataSource = {
                fetchData: jest.fn(),
            };

            searchManager.setDataSource(newDataSource);
            expect(searchManager.dataSource).toBe(newDataSource);
        });

        test('should allow switching between different strategies', () => {
            const strategy1 = { fetchData: jest.fn() };
            const strategy2 = { fetchData: jest.fn() };

            searchManager.setDataSource(strategy1);
            expect(searchManager.dataSource).toBe(strategy1);

            searchManager.setDataSource(strategy2);
            expect(searchManager.dataSource).toBe(strategy2);
        });
    });

    describe('search()', () => {
        test('should clear results when query is empty', async () => {
            const clearSpy = jest.spyOn(searchManager, '_clearResults');

            await searchManager.search('');

            expect(clearSpy).toHaveBeenCalled();
            expect(mockDataSource.fetchData).not.toHaveBeenCalled();
        });

        test('should clear results when query is only whitespace', async () => {
            const clearSpy = jest.spyOn(searchManager, '_clearResults');

            await searchManager.search('   ');

            expect(clearSpy).toHaveBeenCalled();
            expect(mockDataSource.fetchData).not.toHaveBeenCalled();
        });

        test('should trim whitespace from query before searching', async () => {
            mockDataSource.fetchData.mockResolvedValue([]);

            await searchManager.search('  test query  ');

            expect(mockDataSource.fetchData).toHaveBeenCalledWith('test query');
        });

        test('should delegate to data source strategy', async () => {
            const mockResults = [
                { title: 'Test', engine: 'Unity', description: 'Test desc', keywords: [] },
            ];
            mockDataSource.fetchData.mockResolvedValue(mockResults);

            await searchManager.search('test');

            expect(mockDataSource.fetchData).toHaveBeenCalledWith('test');
        });

        test('should render results on successful search', async () => {
            const mockResults = [
                { title: 'Test', engine: 'Unity', description: 'Test desc', keywords: [] },
            ];
            mockDataSource.fetchData.mockResolvedValue(mockResults);
            const renderSpy = jest.spyOn(searchManager, '_renderResults');

            await searchManager.search('test');

            expect(renderSpy).toHaveBeenCalledWith(mockResults, 'test');
        });

        test('should handle errors by rendering empty results', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDataSource.fetchData.mockRejectedValue(new Error('Network error'));
            const renderSpy = jest.spyOn(searchManager, '_renderResults');

            await searchManager.search('test');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
            expect(renderSpy).toHaveBeenCalledWith([], 'test');

            consoleErrorSpy.mockRestore();
        });

        test('should handle async operations correctly', async () => {
            const mockResults = [
                { title: 'Test 1', engine: 'Unity', description: 'Desc 1', keywords: [] },
                { title: 'Test 2', engine: 'Godot', description: 'Desc 2', keywords: [] },
            ];

            // Simulate async delay
            mockDataSource.fetchData.mockImplementation((query) => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(mockResults), 10);
                });
            });

            await searchManager.search('test');

            expect(mockElements.resultsArea.children.length).toBe(2);
        });
    });

    describe('_renderResults()', () => {
        test('should show no results message when results array is empty', () => {
            searchManager._renderResults([], 'test');

            expect(mockElements.resultsInfo.style.display).toBe('none');
            expect(mockElements.noResults.style.display).toBe('block');
            expect(mockElements.resultsArea.innerHTML).toBe('');
            expect(mockElements.browseGrid.style.display).toBe('');
            expect(mockElements.filtersSection.style.display).toBe('');
        });

        test('should hide no results message when results exist', () => {
            const results = [{ title: 'Test', engine: 'Unity', description: 'Desc', keywords: [] }];

            searchManager._renderResults(results, 'test');

            expect(mockElements.resultsInfo.style.display).toBe('block');
            expect(mockElements.noResults.style.display).toBe('none');
            expect(mockElements.browseGrid.style.display).toBe('none');
            expect(mockElements.filtersSection.style.display).toBe('none');
        });

        test('should display correct count for single result', () => {
            const results = [{ title: 'Test', engine: 'Unity', description: 'Desc', keywords: [] }];

            searchManager._renderResults(results, 'test');

            expect(mockElements.resultsCount.textContent).toBe('Found 1 result for "test"');
        });

        test('should display correct count for multiple results (plural)', () => {
            const results = [
                { title: 'Test 1', engine: 'Unity', description: 'Desc 1', keywords: [] },
                { title: 'Test 2', engine: 'Godot', description: 'Desc 2', keywords: [] },
                { title: 'Test 3', engine: 'Unreal Engine', description: 'Desc 3', keywords: [] },
            ];

            searchManager._renderResults(results, 'test');

            expect(mockElements.resultsCount.textContent).toBe('Found 3 results for "test"');
        });

        test('should create correct number of cards', () => {
            const results = [
                { title: 'Test 1', engine: 'Unity', description: 'Desc 1', keywords: [] },
                { title: 'Test 2', engine: 'Godot', description: 'Desc 2', keywords: [] },
            ];

            searchManager._renderResults(results, 'test');

            expect(mockElements.resultsArea.children.length).toBe(2);
        });

        test('should append cards to results area', () => {
            const results = [
                {
                    title: 'Inventory System',
                    engine: 'Unity',
                    description: 'Item management',
                    keywords: [],
                },
            ];

            searchManager._renderResults(results, 'inventory');

            const card = mockElements.resultsArea.querySelector('.example-card');
            expect(card).toBeTruthy();
            expect(card.querySelector('h4').textContent).toBe('Inventory System');
        });

        test('should clear previous results before rendering new ones', () => {
            mockElements.resultsArea.innerHTML = '<div>Old content</div>';

            const results = [
                { title: 'New Result', engine: 'Unity', description: 'New', keywords: [] },
            ];

            searchManager._renderResults(results, 'test');

            expect(mockElements.resultsArea.innerHTML).not.toContain('Old content');
            expect(mockElements.resultsArea.children.length).toBe(1);
        });
    });

    describe('_createCard()', () => {
        test('should create a card with correct structure', () => {
            const example = {
                title: 'Health System',
                engine: 'Unreal Engine',
                description: 'Complete health and damage system',
                keywords: ['health', 'damage'],
            };

            const card = searchManager._createCard(example);

            expect(card.className).toBe('example-card');
            expect(card.querySelector('h4')).toBeTruthy();
            expect(card.querySelector('.engine-tag')).toBeTruthy();
            expect(card.querySelector('.card-actions')).toBeTruthy();
        });

        test('should display title correctly', () => {
            const example = {
                title: 'Inventory System',
                engine: 'Unity',
                description: 'Test',
                keywords: [],
            };

            const card = searchManager._createCard(example);
            const title = card.querySelector('h4').textContent;

            expect(title).toBe('Inventory System');
        });

        test('should display engine tag correctly', () => {
            const example = {
                title: 'Test',
                engine: 'Godot',
                description: 'Test',
                keywords: [],
            };

            const card = searchManager._createCard(example);
            const engineTag = card.querySelector('.engine-tag').textContent;

            expect(engineTag).toBe('Godot');
        });

        test('should display description correctly', () => {
            const example = {
                title: 'Test',
                engine: 'Unity',
                description: 'A complete inventory management system',
                keywords: [],
            };

            const card = searchManager._createCard(example);
            const paragraphs = card.querySelectorAll('p');
            const description = Array.from(paragraphs).find(
                (p) => !p.classList.contains('engine-tag')
            ).textContent;

            expect(description).toBe('A complete inventory management system');
        });

        test('should create View Code and Download buttons', () => {
            const example = {
                title: 'Test',
                engine: 'Unity',
                description: 'Test',
                keywords: [],
            };

            const card = searchManager._createCard(example);
            const buttons = card.querySelectorAll('button');

            expect(buttons.length).toBe(2);
            expect(buttons[0].textContent).toBe('View Code');
            expect(buttons[1].textContent).toBe('Download');
        });

        test('should apply correct button classes', () => {
            const example = {
                title: 'Test',
                engine: 'Unity',
                description: 'Test',
                keywords: [],
            };

            const card = searchManager._createCard(example);
            const buttons = card.querySelectorAll('button');

            expect(buttons[0].classList.contains('btn')).toBe(true);
            expect(buttons[0].classList.contains('btn-primary')).toBe(true);
            expect(buttons[1].classList.contains('btn')).toBe(true);
            expect(buttons[1].classList.contains('btn-outline')).toBe(true);
        });

        test('should return an HTMLElement', () => {
            const example = {
                title: 'Test',
                engine: 'Unity',
                description: 'Test',
                keywords: [],
            };

            const card = searchManager._createCard(example);

            expect(card).toBeInstanceOf(HTMLElement);
            expect(card.tagName).toBe('DIV');
        });
    });

    describe('_clearResults()', () => {
        test('should clear results area innerHTML', () => {
            mockElements.resultsArea.innerHTML = '<div>Some content</div>';

            searchManager._clearResults();

            expect(mockElements.resultsArea.innerHTML).toBe('');
        });

        test('should hide results info', () => {
            mockElements.resultsInfo.style.display = 'block';

            searchManager._clearResults();

            expect(mockElements.resultsInfo.style.display).toBe('none');
        });

        test('should hide no results message', () => {
            mockElements.noResults.style.display = 'block';

            searchManager._clearResults();

            expect(mockElements.noResults.style.display).toBe('none');
        });

        test('should handle null elements gracefully', () => {
            const manager = new SearchManager(mockDataSource);
            manager.initialize({
                searchInput: null,
                resultsArea: mockElements.resultsArea,
                resultsInfo: null,
                resultsCount: null,
                noResults: null,
            });

            // Should not throw error
            expect(() => manager._clearResults()).not.toThrow();
        });
    });

    describe('Integration with DataSourceStrategy', () => {
        test('should work with SampleDataStrategy', async () => {
            const sampleStrategy = new SampleDataStrategy();
            searchManager.setDataSource(sampleStrategy);

            await searchManager.search('health');

            expect(mockElements.resultsArea.children.length).toBeGreaterThan(0);
        });

        test('should work with mock API strategy', async () => {
            const mockAPIStrategy = {
                fetchData: jest
                    .fn()
                    .mockResolvedValue([
                        {
                            title: 'API Result',
                            engine: 'Unity',
                            description: 'From API',
                            keywords: [],
                        },
                    ]),
            };

            searchManager.setDataSource(mockAPIStrategy);
            await searchManager.search('test');

            expect(mockAPIStrategy.fetchData).toHaveBeenCalledWith('test');
            expect(mockElements.resultsArea.children.length).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        test('should handle very long query strings', async () => {
            const longQuery = 'a'.repeat(1000);
            mockDataSource.fetchData.mockResolvedValue([]);

            await searchManager.search(longQuery);

            expect(mockDataSource.fetchData).toHaveBeenCalledWith(longQuery);
        });

        test('should handle special characters in query', async () => {
            const specialQuery = '<script>alert("test")</script>';
            mockDataSource.fetchData.mockResolvedValue([]);

            await searchManager.search(specialQuery);

            expect(mockDataSource.fetchData).toHaveBeenCalledWith(specialQuery);
        });

        test('should handle large result sets', () => {
            const largeResults = Array.from({ length: 100 }, (_, i) => ({
                title: `Result ${i}`,
                engine: 'Unity',
                description: `Description ${i}`,
                keywords: [],
            }));

            searchManager._renderResults(largeResults, 'test');

            expect(mockElements.resultsArea.children.length).toBe(100);
            expect(mockElements.resultsCount.textContent).toBe('Found 100 results for "test"');
        });

        test('should handle results with missing properties gracefully', () => {
            const incompleteResult = {
                title: 'Test',
                engine: 'Unity',
                // missing description and keywords
            };

            const card = searchManager._createCard(incompleteResult);

            expect(card).toBeTruthy();
            expect(card.querySelector('h4').textContent).toBe('Test');
        });
    });
});
