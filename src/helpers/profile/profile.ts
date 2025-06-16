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

import type { SolidDataset, WebId } from "@inrupt/solid-client";
import {
  getAltProfileUrlAllFrom,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getNamedNode,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";

const OIDC = "http://www.w3.org/ns/solid/oidc#";

export const namePredicates = [`${OIDC}client_name`, foaf.name, vcard.fn];
export const imagePredicates = [
  `${OIDC}logo_uri`,
  foaf.img,
  vcard.hasLogo,
  vcard.hasPhoto,
];

export function getFromWebIdProfile(
  profiles: SolidDataset,
  webId: string,
  predicates: string[],
  allowedNamed?: boolean,
): string | null | undefined {
  const thing = getThing(profiles, webId);
  return (
    thing &&
    predicates.reduce(
      (t: string | null, p) =>
        t ??
        getStringNoLocale(thing, p) ??
        (allowedNamed ? getNamedNode(thing, p)?.value : null) ??
        null,
      null,
    )
  );
}

export async function getFromWebIdHelper(
  webId: WebId,
  predicates: string[],
  options: {
    fetch: typeof fetch;
    allowedNamed?: boolean;
  },
): Promise<string | null> {
  let webIdProfile;
  const authFetch = options.fetch;
  // This should always use the unauthenticated fetch
  try {
    webIdProfile = await getSolidDataset(webId);
  } catch (e) {
    webIdProfile = null;
  }

  if (!webIdProfile) return null;

  const name = getFromWebIdProfile(
    webIdProfile,
    webId,
    predicates,
    options.allowedNamed,
  );

  // If the name is in the WebId profile don't bother looking further
  if (name) return name;

  try {
    // Use Promise.any so that as soon as we find any name
    // that we can use this function will return
    return await Promise.any(
      getAltProfileUrlAllFrom(webId, webIdProfile).map(
        async (uniqueProfileIri) => {
          const dataset = await getSolidDataset(uniqueProfileIri, {
            fetch: authFetch,
          });
          const altName = getFromWebIdProfile(
            dataset,
            webId,
            predicates,
            options.allowedNamed,
          );
          if (!altName) {
            throw Error("No Name");
          }
          return altName;
        },
      ),
    );
  } catch (e) {
    return null;
  }
}
