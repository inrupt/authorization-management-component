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
import fs from "fs";
import path from "path";
import { addToCache, defaultUrls } from "../src/session/PurposeCache";

// Undici struggles to follow these redirects for some reason,
// but the browser handles it fine
const redirected = {
  "https://w3id.org/dpv": "https://w3id.org/dpv/2.0",
};

async function main() {
  const cache = {};

  for (let ont of defaultUrls) {
    if (ont in redirected) {
      ont = redirected[ont as keyof typeof redirected];
    }
    // eslint-disable-next-line no-await-in-loop
    await addToCache(ont, cache);
  }

  const cachePath = process.argv[2];
  console.log("Path for cached purposes file: ", cachePath);

  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath);
  }

  fs.writeFileSync(
    path.join(cachePath, "purposesParsed.ts"),
    `export default ${JSON.stringify(cache, null, 2)}`
  );
}

main().catch((e) => {
  console.log("Error occurred preparing purposes", e);
  process.exit(1);
});
