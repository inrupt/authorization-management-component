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
import {
  getContainedResourceUrlAll,
  getSolidDataset,
} from "@inrupt/solid-client";
import {
  DatasetWithId,
  getResources as getResourceStrings,
} from "@inrupt/solid-client-access-grants";
import { Props as ResourceProps } from "../../ListResources/ListResources";

function getName(resource: string) {
  const stripped = resource.endsWith("/") ? resource.slice(0, -1) : resource;
  return stripped.slice(stripped.lastIndexOf("/") + 1);
}

export function resourceDetails(options: {
  resources: string[];
  fetch: typeof fetch;
}): Omit<ResourceProps, "depth">[] {
  return options.resources.map((resource) => ({
    key: resource,
    type: resource.endsWith("/") ? "Container" : "Resource",
    name: getName(resource),
    contains: async () => {
      const solidDataset = await getSolidDataset(resource, {
        fetch: options.fetch,
      });
      const contained = getContainedResourceUrlAll(solidDataset);
      return resourceDetails({ resources: contained, fetch: options.fetch });
    },
    resourceIri: resource,
  }));
}

interface Props {
  accessRequest: DatasetWithId;
  fetch: typeof fetch;
}

export default function getResources(options: Props) {
  return resourceDetails({
    resources: getResourceStrings(options.accessRequest),
    fetch: options.fetch,
  });
}
