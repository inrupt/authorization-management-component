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

import { render, waitFor, act } from "@testing-library/react";
import * as axe from "axe-core";
import ListAgents from "./ListAgents";
import WorkerProvider from "../../session/WorkerProvider.mock";

describe("ListAgents", () => {
  it("renders a ListResources component", async () => {
    const onDetails = jest.fn();

    const { asFragment, getByText, getByTestId, getAllByTestId, container } =
      render(
        <WorkerProvider>
          <ListAgents
            agents={[
              "https://id.inrupt.com/jeswrtest51",
              "https://id.inrupt.com/testuser12345?lookup",
            ]}
            onDetails={onDetails}
            onReload={() => {
              /* noop */
            }}
          />
        </WorkerProvider>,
      );

    await waitFor(() => {
      expect(getByText("Jesse Wright 🐨")).toBeVisible();
      expect(getByText("Virginia")).toBeVisible();
    });

    getByText("Jesse Wright 🐨").click();
    getByText("Virginia").click();
    getByText("https://id.inrupt.com/jeswrtest51").click();
    getByText("https://id.inrupt.com/testuser12345?lookup").click();
    expect(onDetails).toHaveBeenCalledTimes(4);
    expect(onDetails).toHaveBeenNthCalledWith(
      1,
      "https://id.inrupt.com/jeswrtest51",
    );
    expect(onDetails).toHaveBeenNthCalledWith(
      2,
      "https://id.inrupt.com/testuser12345?lookup",
    );
    expect(onDetails).toHaveBeenNthCalledWith(
      3,
      "https://id.inrupt.com/jeswrtest51",
    );
    expect(onDetails).toHaveBeenNthCalledWith(
      4,
      "https://id.inrupt.com/testuser12345?lookup",
    );

    // Clicking on the row *should* trigger onDetails
    getByTestId("agent-row[https://id.inrupt.com/jeswrtest51]").click();
    expect(onDetails).toHaveBeenNthCalledWith(
      5,
      "https://id.inrupt.com/jeswrtest51",
    );

    getByTestId(
      "agent-row[https://id.inrupt.com/testuser12345?lookup]",
    ).click();
    expect(onDetails).toHaveBeenNthCalledWith(
      6,
      "https://id.inrupt.com/testuser12345?lookup",
    );

    expect(asFragment()).toMatchSnapshot();

    // Clicking the sort icon for name should toggle the icon
    expect(getByTestId("table-heading-sort-icon-name")).toHaveClass(
      "bi bi-sort-down sort-icon",
    );

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual([
      "agent-row[https://id.inrupt.com/jeswrtest51]",
      "agent-row[https://id.inrupt.com/testuser12345?lookup]",
    ]);

    act(() => {
      getByTestId("table-heading-sort-icon-name").click();
    });

    expect(getByTestId("table-heading-sort-icon-name")).toHaveClass(
      "bi bi-sort-up sort-icon",
    );

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual([
      "agent-row[https://id.inrupt.com/testuser12345?lookup]",
      "agent-row[https://id.inrupt.com/jeswrtest51]",
    ]);

    // WebId should only invert after the second click since it is not in focus
    expect(getByTestId("table-heading-sort-icon-webId")).toHaveClass(
      "bi bi-sort-down sort-icon",
    );

    act(() => {
      getByTestId("table-heading-sort-icon-webId").click();
    });

    expect(getByTestId("table-heading-sort-icon-webId")).toHaveClass(
      "bi bi-sort-down sort-icon",
    );

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual([
      "agent-row[https://id.inrupt.com/jeswrtest51]",
      "agent-row[https://id.inrupt.com/testuser12345?lookup]",
    ]);

    act(() => {
      getByTestId("table-heading-sort-icon-webId").click();
    });

    expect(getByTestId("table-heading-sort-icon-webId")).toHaveClass(
      "bi bi-sort-up sort-icon",
    );

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual([
      "agent-row[https://id.inrupt.com/testuser12345?lookup]",
      "agent-row[https://id.inrupt.com/jeswrtest51]",
    ]);

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("displays a modal when there are no agents", async () => {
    const onDetails = jest.fn();

    const { getByText, container, baseElement } = render(
      <WorkerProvider>
        <ListAgents
          agents={[]}
          onDetails={onDetails}
          onReload={() => {
            /* noop */
          }}
        />
      </WorkerProvider>,
    );

    await waitFor(() => {
      expect(
        getByText("You have not yet granted access to anyone."),
      ).toBeVisible();
    });

    expect(baseElement).toMatchSnapshot();

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("renders a ListResources component with an search value", async () => {
    const onDetails = jest.fn();

    const { getByText, getAllByTestId, container } = render(
      <WorkerProvider>
        <ListAgents
          agents={[
            "https://id.inrupt.com/jeswrtest51",
            "https://id.inrupt.com/testuser12345?lookup",
          ]}
          onDetails={onDetails}
          searchString="jess"
          onReload={() => {
            /* noop */
          }}
        />
      </WorkerProvider>,
    );

    await waitFor(() => {
      expect(getByText("Jesse Wright 🐨")).toBeVisible();
    });

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual(["agent-row[https://id.inrupt.com/jeswrtest51]"]);

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("renders a ListResources component with a search value in the webid but not name", async () => {
    const onDetails = jest.fn();

    const { getByText, getAllByTestId, container } = render(
      <WorkerProvider>
        <ListAgents
          agents={[
            "https://id.inrupt.com/jeswrtest51",
            "https://id.inrupt.com/testuser12345?lookup",
          ]}
          onDetails={onDetails}
          searchString="jeswrtest51"
          onReload={() => {
            /* noop */
          }}
        />
      </WorkerProvider>,
    );

    await waitFor(() => {
      expect(getByText("Jesse Wright 🐨")).toBeVisible();
    });

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual(["agent-row[https://id.inrupt.com/jeswrtest51]"]);

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("renders a ListResources component with a search value containing captials not in the result", async () => {
    const onDetails = jest.fn();

    const { getByText, getAllByTestId, container } = render(
      <WorkerProvider>
        <ListAgents
          agents={[
            "https://id.inrupt.com/jeswrtest51",
            "https://id.inrupt.com/testuser12345?lookup",
          ]}
          onDetails={onDetails}
          searchString="JESSE"
          onReload={() => {
            /* noop */
          }}
        />
      </WorkerProvider>,
    );

    await waitFor(() => {
      expect(getByText("Jesse Wright 🐨")).toBeVisible();
    });

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual(["agent-row[https://id.inrupt.com/jeswrtest51]"]);

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("renders a ListResources component with an emoji search value", async () => {
    const onDetails = jest.fn();

    const { getByText, getAllByTestId, container } = render(
      <WorkerProvider>
        <ListAgents
          agents={[
            "https://id.inrupt.com/jeswrtest51",
            "https://id.inrupt.com/testuser12345?lookup",
          ]}
          onDetails={onDetails}
          searchString="🐨"
          onReload={() => {
            /* noop */
          }}
        />
      </WorkerProvider>,
    );

    await waitFor(() => {
      expect(getByText("Jesse Wright 🐨")).toBeVisible();
    });

    expect(
      getAllByTestId("agent-row", { exact: false }).map((elem) =>
        elem.getAttribute("data-testid"),
      ),
    ).toEqual(["agent-row[https://id.inrupt.com/jeswrtest51]"]);

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
