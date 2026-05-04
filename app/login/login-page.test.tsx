import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

describe("LoginPage", () => {
  it("renders a labelled passphrase input", () => {
    render(<LoginPage />);
    const input = screen.getByLabelText(/passphrase/i);
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).type).toBe("password");
  });

  it("renders a Sign in button", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeDefined();
  });
});
