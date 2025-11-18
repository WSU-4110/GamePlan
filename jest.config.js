// lowercase comments: jest config for jsdom environment
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {},
  // lowercase comments: use modern fake timers
  fakeTimers: { enableGlobally: true, legacyFakeTimers: false },
};

