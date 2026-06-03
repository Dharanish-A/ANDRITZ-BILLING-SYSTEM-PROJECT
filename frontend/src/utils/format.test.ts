import { describe, expect, it } from "vitest";
import { currency, shortDate } from "./format";

describe("format utils", () => {
  describe("currency", () => {
    it("should format numerical values as INR currency by default", () => {
      const formatted = currency(125000);
      expect(formatted).toContain("1,25,000");
    });

    it("should fallback to 0 when input is null, undefined, or empty", () => {
      expect(currency(null)).toContain("0");
      expect(currency(undefined)).toContain("0");
    });

    it("should format other currencies if code is specified", () => {
      const formatted = currency(100, "USD");
      expect(formatted).toContain("100");
    });
  });

  describe("shortDate", () => {
    it("should format valid ISO string dates nicely", () => {
      const date = "2026-05-29T10:00:00Z";
      const formatted = shortDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe("-");
    });

    it("should return hyphen when no date value is passed", () => {
      expect(shortDate()).toBe("-");
      expect(shortDate("")).toBe("-");
    });
  });
});
