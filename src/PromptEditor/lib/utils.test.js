import { fmtTime } from "./utils";

describe("fmtTime", () => {
  it("formats a valid ISO date string", () => {
    const iso = "2025-08-25T14:30:00Z";
    const result = fmtTime(iso);

    expect(typeof result).toBe("string");
    expect(result).toMatch(/2025|Aug|25/); // date part
  });

  it("returns the input string if date is invalid", () => {
    const invalidIso = "not-a-date";
    expect(fmtTime(invalidIso)).toBe(invalidIso);
  });

  it("works with different valid date strings", () => {
    const iso = "2023-01-01T00:00:00Z";
    const result = fmtTime(iso);

    expect(result).toMatch(/2023|Jan|1/);
  });
});
