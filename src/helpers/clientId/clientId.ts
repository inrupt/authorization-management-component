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

/* eslint-disable import/prefer-default-export */

export function buildClientIdentifierDoc(hostname: string, clientId: string) {
  return {
    "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
    client_id: clientId,
    client_name: "Inrupt AMC",
    // URLs the user will be redirected back to upon successful authentication:
    redirect_uris: [hostname, hostname.concat("login")],
    // URLs the user can be redirected to back to upon successful logout:
    post_logout_redirect_uris: [
      hostname,
      hostname.concat("login"),
      hostname.concat("*"),
    ],
    // Support refresh_tokens for refreshing the session:
    grant_types: ["authorization_code", "refresh_token"],
    // The scope must be explicit, as the default doesn't include offline_access,
    // preventing the refresh token from being issued.
    scope: "openid webid offline_access",
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    require_auth_time: false,
    tos_uri: "https://www.inrupt.com/terms-conditions",
    policy_uri: "https://www.inrupt.com/privacy-policy",
    logo_uri: hostname.concat("inrupt-hex-filled.svg"),
    client_uri: "https://www.inrupt.com/",
  };
}
