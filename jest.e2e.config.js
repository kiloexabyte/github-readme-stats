export default {
  clearMocks: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/e2e/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
