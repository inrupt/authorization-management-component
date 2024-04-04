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
import { PlaywrightTestConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;

const baseURL = `http://localhost:${PORT}`;
const testAppBaseURL = `http://localhost:8080`;

const config: PlaywrightTestConfig = {
  timeout: 2.5 * 60 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? "100%" : "50%",
  globalSetup: "./e2e/utils/globalSetup.ts",
  outputDir: "test-results/",
  testMatch: "e2e/*.playwright.ts",
  webServer: [
    {
      command: process.env.CI ? "npm start" : "npm run dev",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      // There has been CI issues while starting the server with a default 60s timeout.
      timeout: 3 * 60 * 1000,
    },
    {
      command: process.env.CI ? "npm run start:e2e" : "npm run dev:e2e",
      url: testAppBaseURL,
      reuseExistingServer: true,
      // There has been CI issues while starting the server with a default 60s timeout.
      timeout: 3 * 60 * 1000,
    },
  ],
  use: {
    baseURL,
    trace: "on",
    headless: true,
    video: "on-first-retry",
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Desktop Firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "Desktop Safari",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "Microsoft Edge",
      use: {
        ...devices["Desktop Edge"],
      },
    },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12"],
    //   },
    // },
    {
      name: "Mobile Samsung",
      use: {
        ...devices["Galaxy S8"],
      },
    },
  ],
};
export default config;
