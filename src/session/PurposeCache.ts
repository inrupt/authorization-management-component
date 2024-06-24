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
import dereference from "rdf-dereference";
import { Quad } from "@rdfjs/types";
import { SKOS } from "../helpers/access/access";

const map = {
  [`${SKOS}prefLabel`]: "purposeLabel",
  [`${SKOS}definition`]: "definition",
} as const;

export type PurposeCache = Record<
  string,
  { purposeLabel?: string | undefined; definition?: string | undefined }
>;
export async function addToCache(url: string, cache: PurposeCache) {
  const { data } = await dereference.dereference(url, {});

  return new Promise((res, rej) => {
    data.on("data", ({ subject, predicate, object, graph }: Quad) => {
      if (
        predicate.termType === "NamedNode" &&
        predicate.value in map &&
        subject.termType === "NamedNode" &&
        object.termType === "Literal" &&
        graph.termType === "DefaultGraph"
      ) {
        // eslint-disable-next-line no-param-reassign
        (cache[subject.value] ??= {})[
          // if the predicate.value is not a key of the map object this won't be executed,
          // as it is already checked in the if expression
          // @ts-ignore
          map[predicate.value] as "purposeLabel" | "definition"
        ] ??= object.value;
      }
    });
    data.on("end", res);
    data.on("error", rej);
  });
}

// This is the set of ontologies for which we cache the purposeLabels and descriptions
// in AMI.
export const defaultUrls = ["https://w3id.org/dpv"];
