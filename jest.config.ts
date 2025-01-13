//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import nextJest from "next/jest";
import type { Config } from "jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],

  // Exclude the e2e tests:
  modulePathIgnorePatterns: ["e2e"],

  // In CI, we can use 100% of the available resources:
  maxWorkers: process.env.CI ? "100%" : "50%",
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Collect coverage metrics:
  collectCoverage: true,
  coverageDirectory: "coverage",
  // This enables usage with Sonarcloud's code coverage tooling:
  coverageReporters: process.env.CI ? ["text", "lcov"] : ["text"],

  coveragePathIgnorePatterns: ["/node_modules/"],

  // Github-Actions reporter in CI:
  reporters: process.env.CI ? ["github-actions", "default"] : ["default"],

  // Required by the React testing library
  injectGlobals: true,
};

async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)();

  // Remove the ignore for /node_modules/ this allows Jest to transpile ESM
  // modules for use from CommonJS which is necessary until Jest fully supports ESM:
  // https://github.com/vercel/next.js/issues/40183
  // https://github.com/vercel/next.js/blob/v15.1.4/packages/next/src/build/jest/jest.ts#L175-L176
  nextJestConfig.transformIgnorePatterns =
    nextJestConfig.transformIgnorePatterns?.filter(
      (pattern: string) => !pattern.startsWith("/node_modules/")
    );

  return nextJestConfig;
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default jestConfig;
