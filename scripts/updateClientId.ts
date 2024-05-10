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

import { overwriteFile } from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-node";
import { Blob } from "buffer";
import { buildClientIdentifierDoc } from "../src/helpers/clientId/clientId";

const CLIENT_ID_DOC_IRI =
  "https://storage.inrupt.com/87048fc7-b553-4c86-95de-633e1675f0bd/AMI/clientid.jsonld";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// build client id doc
const clientIdDoc = buildClientIdentifierDoc(
  "http://localhost:3000/",
  CLIENT_ID_DOC_IRI
);

async function updateClientId() {
  // save it to pod
  const session = new Session();
  await session.login({
    oidcIssuer: "https://login.inrupt.com",
    clientId,
    clientSecret,
    clientName: "update-clientid",
  });

  const file = new Blob([JSON.stringify(clientIdDoc)], {
    type: "application/ld+json",
  });

  await overwriteFile(CLIENT_ID_DOC_IRI, file, {
    contentType: "application/ld+json",
    fetch: session.fetch,
    // eslint-disable-next-line no-console
  });
  await session.logout();
  console.log("dev client ID doc updated");
}

updateClientId().catch((e) => {
  console.log("Error updating clientId", e);
  process.exit(1);
});
