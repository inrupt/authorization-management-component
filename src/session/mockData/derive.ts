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

export default {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: "VerifiablePresentation",
  holder: "https://vc.ap.inrupt.com",
  verifiableCredential: [
    {
      id: "https://vc.ap.inrupt.com/vc/431063f0-fbb8-40e3-a4b9-ae026cf0afd8",
      type: ["SolidAccessGrant", "VerifiableCredential"],
      proof: {
        type: "Ed25519Signature2020",
        created: "2023-08-04T11:53:30.184Z",
        domain: "solid",
        proofPurpose: "assertionMethod",
        proofValue:
          "z4VzCexRntJK659QRAK89qKvhgRFzJNqpiu6cZdDcRx753BsfnUhYHxcvFysGtVmxkKYELh9bo5UEfDGt6WN2SQzD",
        verificationMethod:
          "https://vc.ap.inrupt.com/key/73c7719d-527a-3061-b891-fbad45d5c56d",
      },
      credentialStatus: {
        id: "https://vc.ap.inrupt.com/status/oz8E#0",
        type: "RevocationList2020Status",
        revocationListCredential: "https://vc.ap.inrupt.com/status/oz8E",
        revocationListIndex: "0",
      },
      credentialSubject: {
        id: "https://id.inrupt.com/jeswrtest51",
        providedConsent: {
          mode: "Read",
          forPersonalData:
            "https://storage.ap.inrupt.com/d8d9151a-9eaa-4a31-82be-be459700e632/be0f51b5-38af-4708-a8be-f1ea997051fa.txt",
          forPurpose: [
            "https://w3id.org/dpv#UserInterfacePersonalisation",
            "https://w3id.org/dpv#OptimiseUserInterface",
          ],
          hasStatus: "ConsentStatusExplicitlyGiven",
          isProvidedTo: "https://id.inrupt.com/jeswrtest51",
        },
      },
      expirationDate: "2025-07-22T14:00:00.000Z",
      issuanceDate: "2023-08-04T11:53:11.032Z",
      issuer: "https://vc.ap.inrupt.com",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.inrupt.com/credentials/v1.jsonld",
        "https://w3id.org/security/data-integrity/v1",
        "https://w3id.org/vc-revocation-list-2020/v1",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
      ],
    },
    {
      id: "https://vc.ap.inrupt.com/vc/e8c60ff6-d57f-48d5-ad69-25330d5299ef",
      type: ["SolidAccessGrant", "VerifiableCredential"],
      proof: {
        type: "Ed25519Signature2020",
        created: "2023-08-18T02:45:01.427Z",
        domain: "solid",
        proofPurpose: "assertionMethod",
        proofValue:
          "z333ft4p7kPWs4FthuGnQJV3bNSikBQXwoNrFKZMFCiGbLmzoMuxJ5FrbsA9DjFq8rEigpTzXpAszeo29YBPFPyYD",
        verificationMethod:
          "https://vc.ap.inrupt.com/key/73c7719d-527a-3061-b891-fbad45d5c56d",
      },
      credentialStatus: {
        id: "https://vc.ap.inrupt.com/status/ohV2#0",
        type: "RevocationList2020Status",
        revocationListCredential: "https://vc.ap.inrupt.com/status/ohV2",
        revocationListIndex: "0",
      },
      credentialSubject: {
        id: "https://id.inrupt.com/jeswrtest51",
        providedConsent: {
          mode: "Read",
          forPersonalData:
            "https://storage.ap.inrupt.com/d8d9151a-9eaa-4a31-82be-be459700e632/",
          hasStatus: "ConsentStatusExplicitlyGiven",
          isProvidedTo: "https://id.inrupt.com/jeswrtest11",
        },
      },
      issuanceDate: "2023-08-18T02:44:59.490Z",
      issuer: "https://vc.ap.inrupt.com",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.inrupt.com/credentials/v1.jsonld",
        "https://w3id.org/security/data-integrity/v1",
        "https://w3id.org/vc-revocation-list-2020/v1",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
      ],
    },
    {
      id: "https://vc.ap.inrupt.com/vc/b36e37c6-b170-4f4f-afc2-95e0c336923d",
      type: ["SolidAccessGrant", "VerifiableCredential"],
      proof: {
        type: "Ed25519Signature2020",
        created: "2023-08-07T11:59:44.232Z",
        domain: "solid",
        proofPurpose: "assertionMethod",
        proofValue:
          "z2QthZYAPRYun1ZjMF4nN7fJgYZyfeJ2VKmqFHYbmGW53gfSNRG71ZvnA8sqWrt4qPpa562PmCmHmaJtmmLBCVxdM",
        verificationMethod:
          "https://vc.ap.inrupt.com/key/73c7719d-527a-3061-b891-fbad45d5c56d",
      },
      credentialStatus: {
        id: "https://vc.ap.inrupt.com/status/VuOe#0",
        type: "RevocationList2020Status",
        revocationListCredential: "https://vc.ap.inrupt.com/status/VuOe",
        revocationListIndex: "0",
      },
      credentialSubject: {
        id: "https://id.inrupt.com/jeswrtest51",
        providedConsent: {
          mode: "Read",
          forPersonalData:
            "https://storage.ap.inrupt.com/d8d9151a-9eaa-4a31-82be-be459700e632/ad92288f-7dc2-478d-9327-5af556461e34.txt",
          forPurpose: [
            "https://w3id.org/dpv#UserInterfacePersonalisation",
            "https://w3id.org/dpv#OptimiseUserInterface",
          ],
          hasStatus: "ConsentStatusExplicitlyGiven",
          isProvidedTo: "https://id.inrupt.com/jeswrtest51",
        },
      },
      expirationDate: "2025-07-22T14:00:00.000Z",
      issuanceDate: "2023-08-07T11:59:08.634Z",
      issuer: "https://vc.ap.inrupt.com",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.inrupt.com/credentials/v1.jsonld",
        "https://w3id.org/security/data-integrity/v1",
        "https://w3id.org/vc-revocation-list-2020/v1",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
      ],
    },
  ],
};
