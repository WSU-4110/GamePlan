// GamePlan Website JavaScript

// Wait for the page to load completely before running our code
document.addEventListener('DOMContentLoaded', function() {

    // Set up all the interactive features
    setupMobileMenu();
    setupBrowseFilters();
    setupSearch();
    setupButtons();
});

// MOBILE MENU - Makes the hamburger menu work on phones.
function setupMobileMenu() {
    // Find the hamburger button and menu
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');

    // Only run if both elements exist on the page
    if (hamburger && menu) {
        // When hamburger is clicked, show/hide menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const menuLinks = document.querySelectorAll('.nav-link');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }
}

// BROWSE FILTERS - Filter code examples by engine and category
function setupBrowseFilters() {
    // Find the filter dropdowns and examples grid
    const engineFilter = document.getElementById('engine-filter');
    const categoryFilter = document.getElementById('category-filter');
    const examplesGrid = document.getElementById('examples-grid');

    // Only run if we're on the browse page
    if (engineFilter && categoryFilter && examplesGrid) {

        // Function to filter the examples
        function filterExamples() {
            const selectedEngine = engineFilter.value;
            const selectedCategory = categoryFilter.value;
            const allExamples = examplesGrid.querySelectorAll('.example-card');

            // Go through each example card
            allExamples.forEach(function(example) {
                const cardEngine = example.getAttribute('data-engine');
                const cardCategory = example.getAttribute('data-category');

                // Check if this card matches the selected filters
                const engineMatches = (selectedEngine === 'all' || cardEngine === selectedEngine);
                const categoryMatches = (selectedCategory === 'all' || cardCategory === selectedCategory);

                // Show or hide the card based on filters
                if (engineMatches && categoryMatches) {
                    example.style.display = 'block';
                } else {
                    example.style.display = 'none';
                }
            });
        }

        // Run filter when dropdowns change
        engineFilter.addEventListener('change', filterExamples);
        categoryFilter.addEventListener('change', filterExamples);

        // Check if URL has an engine parameter (like ?engine=unity)
        const urlParams = new URLSearchParams(window.location.search);
        const engineFromUrl = urlParams.get('engine');
        if (engineFromUrl) {
            engineFilter.value = engineFromUrl;
            filterExamples();
        }
    }
}

// SEARCH FUNCTIONALITY - Search through code examples
function setupSearch() {
    // Find search elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const resultsArea = document.getElementById('search-results-grid');
    const resultsInfo = document.getElementById('results-info');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    // Sample data - this will be replaced with real database data later
    const sampleData = [
        {
            title: 'First Person Controller',
            engine: 'Unity',
            description: 'Basic first-person movement controller with mouse look',
            keywords: ['movement', 'player', 'controller', 'fps']
        },
        {
            title: 'Health System',
            engine: 'Unreal Engine',
            description: 'Complete health and damage system with UI integration',
            keywords: ['health', 'damage', 'combat', 'ui']
        },
        {
            title: '2D Platformer Physics',
            engine: 'Godot',
            description: 'Smooth 2D platformer movement with jump mechanics',
            keywords: ['platformer', 'physics', '2d', 'jump']
        },
        {
            title: 'Inventory System',
            engine: 'Unity',
            description: 'Drag and drop inventory with tooltips',
            keywords: ['inventory', 'ui', 'drag', 'items']
        },
        {
            title: 'Save System',
            engine: 'Unity',
            description: 'Save and load game data with JSON',
            keywords: ['save', 'load', 'data', 'json']
        }
    ];

    // Function to perform the search
    function doSearch() {
        if (!searchInput || !resultsArea) return;

        const searchText = searchInput.value.toLowerCase().trim();

        // If search is empty, clear results
        if (searchText === '') {
            clearResults();
            return;
        }

        // Find matching examples
        const matches = sampleData.filter(function(example) {
            // Check if search text is in title, description, or keywords
            const titleMatch = example.title.toLowerCase().includes(searchText);
            const descMatch = example.description.toLowerCase().includes(searchText);
            const keywordMatch = example.keywords.some(function(keyword) {
                return keyword.toLowerCase().includes(searchText);
            });

            return titleMatch || descMatch || keywordMatch;
        });

        // Show the results
        showResults(matches, searchText);
    }

    // Function to display search results
    function showResults(matches, searchText) {
        // Clear previous results
        resultsArea.innerHTML = '';

        // If no matches found
        if (matches.length === 0) {
            if (resultsInfo) resultsInfo.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        // Show results count
        if (resultsInfo) resultsInfo.style.display = 'block';
        if (noResults) noResults.style.display = 'none';
        if (resultsCount) {
            resultsCount.textContent = `Found ${matches.length} result${matches.length !== 1 ? 's' : ''} for "${searchText}"`;
        }

        // Create cards for each result
        matches.forEach(function(example) {
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
            resultsArea.appendChild(card);
        });

        // Set up the new buttons
        setupButtons();
    }

    // Function to clear search results
    function clearResults() {
        if (resultsArea) resultsArea.innerHTML = '';
        if (resultsInfo) resultsInfo.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
    }

    // Set up search button click
    if (searchButton) {
        searchButton.addEventListener('click', doSearch);
    }

    // Set up search when Enter key is pressed
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                doSearch();
            }
        });
    }

    // Set up suggestion tags (quick search buttons)
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(function(tag) {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            if (searchInput) {
                searchInput.value = searchTerm;
                doSearch();
            }
        });
    });
}

// BUTTON INTERACTIONS - Handle View Code and Download buttons
function setupButtons() {
    // Find all buttons on the page
    const allButtons = document.querySelectorAll('.btn');

    allButtons.forEach(function(button) {
        const buttonText = button.textContent;

        // Only handle View Code and Download buttons
        if (buttonText.includes('Download') || buttonText.includes('View Code')) {

            // Remove any existing click handlers to avoid duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add click handler to the new button
            newButton.addEventListener('click', function(e) {
                e.preventDefault(); // Don't follow any links

                const originalText = this.textContent;

                // Show loading state
                this.textContent = 'Loading...';
                this.disabled = true;

                // After 1 second, show placeholder message
                setTimeout(function() {
                    newButton.textContent = originalText;
                    newButton.disabled = false;
                    alert('This feature will be available when the database is connected!');
                }, 1000);
            });
        }
    });
}