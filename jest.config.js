// NOTE: transformIgnorePatterns intentionally not overridden here.
// The jest-expo preset ships its own (broader) patterns covering
// expo/expo-modules-core/react-native packages; overriding them
// breaks transformation of ESM/TS inside node_modules.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
};
