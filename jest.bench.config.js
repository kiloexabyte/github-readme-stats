export default {
  // Jest-bench need its own test environment to function
  testEnvironment: "jest-bench/environment",
  testEnvironmentOptions: {
    // still Jest-bench environment will run your environment if you specify it here
    testEnvironment: "jest-environment-node",
    testEnvironmentOptions: {
      // specify any option for your environment
    },
  },
  // always include "default" reporter along with Jest-bench reporter
  // for error reporting
  reporters: ["default", "jest-bench/reporter"],
  // will pick up "*.bench.ts" file.
  testRegex: "(\\.bench)\\.(ts|tsx|js)$",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
