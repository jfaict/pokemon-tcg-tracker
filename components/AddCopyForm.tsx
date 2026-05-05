"use client";

import { useState } from "react";

type Condition = "NM" | "LP" | "MP" | "HP" | "DMG";

interface Props {
  onSave: (condition: Condition, location: string) => Promise<void>;
}

export function AddCopyForm({ onSave }: Props) {
  const [condition, setCondition] = useState<Condition | "">("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = condition !== "" && location.trim() !== "";

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(condition as Condition, location.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <div>
      <label htmlFor="add-copy-condition">Condition</label>
      <select
        id="add-copy-condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value as Condition | "")}
        disabled={saving}
      >
        <option value="">—</option>
        <option value="NM">NM</option>
        <option value="LP">LP</option>
        <option value="MP">MP</option>
        <option value="HP">HP</option>
        <option value="DMG">DMG</option>
      </select>

      <label htmlFor="add-copy-location">Location</label>
      <input
        id="add-copy-location"
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={saving}
      />

      <button onClick={handleSave} disabled={!canSave || saving}>
        Save
        {saving && <span data-testid="save-spinner" aria-hidden="true"> …</span>}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
