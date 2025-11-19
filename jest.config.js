module.exports = {
    // Use jsdom environment to simulate browser DOM
    testEnvironment: 'jsdom',

    // Test file patterns
    testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],

    // Coverage configuration
    collectCoverageFrom: ['js/**/*.js', '!js/**/*.test.js', '!js/**/*.spec.js'],

    // Clear mocks between tests
    clearMocks: true,

    // Verbose output
    verbose: true,
};
