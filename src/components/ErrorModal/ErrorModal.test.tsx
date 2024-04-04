import { render } from "@testing-library/react";
import { ErrorModal } from "./ErrorModal";

describe("ErrorModal", () => {
  it("renders an Error with a title and a message", () => {
    const errorMessage = "This is an error message";
    const errorName = "Error title";
    const e = new Error(errorMessage);
    e.name = errorName;
    const { baseElement } = render(
      <ErrorModal err={e} isOpen={true} onClose={() => {}} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("renders an Error with a title, a message and a cause", () => {
    const errorMessage = "This is an error message";
    const errorName = "Error title";
    const e = new Error(errorMessage, { cause: new Error("Error cause") });
    e.name = errorName;
    const { baseElement } = render(
      <ErrorModal err={e} isOpen={true} onClose={() => {}} />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
