import { vi, describe, expect, it } from "vitest";
import { defineStep } from "../src/step.mjs";

describe("defineStep", () => {
    it("should return an object with name and run method", async () => {
        const step = defineStep({
            name: "step",
            run: vi.fn(),
        });

        expect(step).toBeDefined();
        expect(step.run).toBeInstanceOf(Function);
    });

    it("should keep if prop from step definition", () => {
        const fn = vi.fn();
        const step = defineStep({
            name: "step",
            run: vi.fn(),
            if: fn,
        });

        expect(step.if).toBe(fn);
    });
});
