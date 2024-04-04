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
//
import {
  AccessModes,
  getAccessModes,
  getExpirationDate,
  getPurposes,
  getResources,
  DatasetWithId,
  AccessGrant,
} from "@inrupt/solid-client-access-grants";
import { verifiableCredentialToDataset } from "@inrupt/solid-client-vc";

export type Operations = keyof AccessModes;

export const selectionMatrix = {
  read: {
    name: "View",
    image: "eye-fill",
  },
  write: {
    name: "Create, edit or delete",
    image: "pencil-fill",
  },
  append: {
    name: "Add to",
    image: "folder-plus",
  },
} as const;

export function getGroupedAccessModes(
  grants: DatasetWithId[]
): Required<AccessModes> {
  const modes = grants.map((g) => getAccessModes(g));
  return {
    read: modes.some((mode) => mode.read),
    write: modes.some((mode) => mode.write),
    append: modes.some((mode) => mode.append),
  };
}

export function getGroupedPurposes(grants: AccessGrant[]): string[] {
  const purposes = grants
    .flatMap(getPurposes)
    .filter((g): g is string => g !== undefined);

  return [...new Set(purposes)];
}

export function getGroupedResources(grants: DatasetWithId[]): string[] {
  return [...new Set(grants.flatMap((g) => getResources(g)))];
}

export function getLatestExpirationDate(
  grants: Array<DatasetWithId>
): Date | undefined {
  return grants.reduce((latestDate: Date | undefined, grant) => {
    const expirationDate = getExpirationDate(grant);
    return latestDate === undefined ||
      (expirationDate !== undefined && expirationDate > latestDate)
      ? expirationDate
      : latestDate;
  }, undefined);
}

export function getIconClassNameForAccessMode(
  mode: Operations
): string | undefined {
  return `bi bi-${selectionMatrix[mode].image}`;
}

export function getAccessStringFromAccessMode(
  mode: Operations
): string | undefined {
  return selectionMatrix[mode].name;
}

export const SKOS = "http://www.w3.org/2004/02/skos/core#";

export interface Purpose {
  url: string;
  purposeLabel: Promise<string | undefined>;
  definition: Promise<string | undefined>;
  allowed: boolean;
}

export interface MockParams {
  requestor: string;
  resources: Array<string>;
  modes: Array<string>;
  purposes: Array<string>;
  expirationDate: string;
}

export async function createMockAccessGrant(
  options: MockParams
): Promise<DatasetWithId> {
  return verifiableCredentialToDataset(internalCreateMockAccessGrant(options), {
    includeVcProperties: false,
  });
}

// Mock access grants for testing purposes
// FIXME: Use shared access grant mock from the access grants library
function internalCreateMockAccessGrant({
  requestor,
  resources,
  modes,
  purposes,
  expirationDate,
}: MockParams) {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.inrupt.com/credentials/v1.jsonld",
      "https://w3id.org/security/data-integrity/v1",
      "https://w3id.org/vc-revocation-list-2020/v1",
      "https://w3id.org/vc/status-list/2021/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: "https://consent.pod.inrupt.com/vc/53973727-f4d0-9e8dbdc041fd",
    type: ["VerifiableCredential", "SolidCredential", "SolidConsentRequest"],
    issuer: "https://consent.pod.inrupt.com",
    issuanceDate: "2021-05-26T16:40:03Z",
    expirationDate,
    credentialSubject: {
      id: "https://mockappurl.com",
      inbox: "https://mockappurl.com/inbox/",
      providedConsent: {
        mode: modes,
        hasStatus: "ConsentStatusExplicitlyGiven",
        forPersonalData: resources,
        forPurpose: purposes,
        isProvidedTo: requestor,
      },
    },
    proof: {
      created: "2021-05-26T16:40:03.009Z",
      proofPurpose: "assertionMethod",
      proofValue: "eqp8h_kL1DwJCpn65z-d1Arnysx6b11...jb8j0MxUCc1uDQ",
      type: "Ed25519Signature2020",
      verificationMethod: "https://consent.pod.inrupt.com/key/396f686b4ec",
    },
    // FIXME: The cast is required because this mock is a plain JSON, not a dataset.
  };
}

// Mock access grants for testing purposes
export function createMockAccessRequest(
  data: MockParams
): Promise<DatasetWithId> {
  const grant = internalCreateMockAccessGrant(data);
  return verifiableCredentialToDataset(
    {
      ...grant,
      credentialSubject: {
        ...grant.credentialSubject,
        providedConsent: undefined,
        hasConsent: {
          ...grant.credentialSubject.providedConsent,
          hasStatus: "ConsentStatusRequested",
          isConsentForDataSubject: data.requestor,
        },
      },
    },
    {
      includeVcProperties: false,
    }
    // FIXME: The cast is required because this mock is a plain JSON, not a dataset.
  );
}
