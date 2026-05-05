import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCopyForm } from "./AddCopyForm";

const noop = () => Promise.resolve();

describe("AddCopyForm", () => {
  it("renders condition select with NM/LP/MP/HP/DMG options", () => {
    render(<AddCopyForm onSave={noop} />);
    const select = screen.getByRole("combobox", { name: /condition/i });
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value
    );
    expect(options).toContain("NM");
    expect(options).toContain("LP");
    expect(options).toContain("MP");
    expect(options).toContain("HP");
    expect(options).toContain("DMG");
  });

  it("renders a location text input", () => {
    render(<AddCopyForm onSave={noop} />);
    expect(screen.getByRole("textbox", { name: /location/i })).toBeDefined();
  });

  it("Save button is disabled when condition is unset (empty default)", () => {
    render(<AddCopyForm onSave={noop} />);
    expect(
      screen.getByRole("button", { name: /save/i }).hasAttribute("disabled")
    ).toBe(true);
  });

  it("Save button is disabled when location is empty", async () => {
    const user = userEvent.setup();
    render(<AddCopyForm onSave={noop} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: /condition/i }),
      "NM"
    );
    expect(
      screen.getByRole("button", { name: /save/i }).hasAttribute("disabled")
    ).toBe(true);
  });

  it("Save button is enabled when both condition and location are filled", async () => {
    const user = userEvent.setup();
    render(<AddCopyForm onSave={noop} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: /condition/i }),
      "NM"
    );
    await user.type(screen.getByRole("textbox", { name: /location/i }), "Binder 1");
    expect(
      screen.getByRole("button", { name: /save/i }).hasAttribute("disabled")
    ).toBe(false);
  });

  it("Save button disabled and spinner visible while onSave is pending", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onSave = () => new Promise<void>((res) => { resolve = res; });

    render(<AddCopyForm onSave={onSave} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: /condition/i }),
      "LP"
    );
    await user.type(screen.getByRole("textbox", { name: /location/i }), "Box A");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(
      screen.getByRole("button", { name: /save/i }).hasAttribute("disabled")
    ).toBe(true);
    expect(screen.getByTestId("save-spinner")).toBeDefined();

    await act(async () => { resolve(); });
  });

  it("shows inline error text when onSave rejects", async () => {
    const user = userEvent.setup();
    const onSave = () => Promise.reject(new Error("Couldn't save. Try again."));

    render(<AddCopyForm onSave={onSave} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: /condition/i }),
      "NM"
    );
    await user.type(screen.getByRole("textbox", { name: /location/i }), "Binder 2");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/couldn't save/i);
  });

  it("Save button re-enabled after onSave rejects", async () => {
    const user = userEvent.setup();
    const onSave = () => Promise.reject(new Error("fail"));

    render(<AddCopyForm onSave={onSave} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: /condition/i }),
      "NM"
    );
    await user.type(screen.getByRole("textbox", { name: /location/i }), "Binder 2");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(
      screen.getByRole("button", { name: /save/i }).hasAttribute("disabled")
    ).toBe(false);
  });
});
