import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../contextApi/AuthContext";
import Auth from "../pages/Auth";

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ login: vi.fn() }}>
        {ui}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};
describe("Auth Component", () => {
it("updates email input value", () => {
  renderWithProviders(<Auth />, { providerProps: { value: { login: vi.fn() } } });

  const emailInput = screen.getAllByPlaceholderText("Email")[0];
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });

  expect(emailInput.value).toBe("test@example.com");
});
it("renders login form by default", () => {
  renderWithProviders(<Auth />);
const headings = screen.getAllByRole("heading", { level: 2, name: /login to atithi_nivas/i });
expect(headings[0]).toBeInTheDocument();

});

});
