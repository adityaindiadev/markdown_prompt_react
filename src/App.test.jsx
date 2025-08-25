// App.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("saves snapshot and displays it in version list", () => {
  render(<App />);
  
  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, { target: { value: "# Hello World" } });

  // const saveBtn = screen.getByText(/Save Version/i);
  const saveBtn = screen.getByTestId("saveBtn");
  fireEvent.click(saveBtn);

  expect(screen.getAllByText(/Hello World/).length).toBeGreaterThan(0);
});
