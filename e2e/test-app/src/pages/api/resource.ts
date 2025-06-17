// MIT License
//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

import { getFile, getAccessGrant } from "@inrupt/solid-client-access-grants";
import { getNodeTestingEnvironment } from "@inrupt/internal-test-env";
import type { NextApiRequest, NextApiResponse } from "next";
import { createLoggedInSession, retryAsync } from "../../utils";
import type { ApiError } from "../../utils";

type Data = {
  dataset: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ApiError>,
) {
  const myEnv = getNodeTestingEnvironment();

  const session = await createLoggedInSession({
    id: myEnv.clientCredentials.requestor?.id,
    secret: myEnv.clientCredentials.requestor?.secret,
    idp: myEnv.idp,
  });

  const { grant, resource } = JSON.parse(req.body);

  if (typeof resource !== "string" || typeof grant !== "string") {
    return res.status(400).json({
      type: "https://example.org/missingParameter",
      title: "Missing resource",
      detail: "Request body missing a 'resource' entry",
      status: 400,
    });
  }

  const resourceFile = await retryAsync(async () =>
    getFile(
      resource,
      await retryAsync(() => getAccessGrant(grant, { fetch: session.fetch })),
      {
        fetch: session.fetch,
      },
    ),
  );

  const myfile = await resourceFile.text();
  return res.status(201).json({
    dataset: myfile,
  });
}
