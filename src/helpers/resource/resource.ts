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

const contentTypeToIconMap: Record<string, string> = {
  "image/png": "bi bi-image",
  "image/jpg": "bi bi-image",
  "image/bmp": "bi bi-image",
  "application/pdf": "bi bi-filetype-pdf",
};

export function getIconClassNameForContentType(
  contentType: string | undefined
): string {
  if (
    contentType === undefined ||
    contentTypeToIconMap[contentType] === undefined
  ) {
    return "bi bi-file-earmark-text";
  }
  return contentTypeToIconMap[contentType];
}

export function getPathComponentsFromIri(iri: string): Array<string> {
  const url = new URL(iri);
  return url.pathname.split("/").filter((c) => c.length);
}

export function getFileNameFromIri(iri: string): string {
  return getPathComponentsFromIri(iri).pop() ?? "";
}
