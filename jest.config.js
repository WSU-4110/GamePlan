module.exports = {
    // Use jsdom environment to simulate browser DOM
    testEnvironment: 'jsdom',

    // test file patterns
    testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],

    // coberage configuration
    collectCoverageFrom: ['js/**/*.js', '!js/**/*.test.js', '!js/**/*.spec.js'],

    clearMocks: true,

    // Verbose output
    verbose: true,
};

//notes:
// -  `collectCoverageFrom` if you add new folders or want deeper coverage.
// - iff ? performance becomes an issue, consider narrowing down `testMatch` patterns.
