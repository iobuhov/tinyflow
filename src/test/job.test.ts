import { vi, describe, expect, it, afterEach } from "vitest";
import { defineJob } from "../job.mjs";

describe("defineJob", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return a runnable job", async () => {
        const spy = vi.spyOn(console, "info");

        const job = defineJob({
            name: "Foo",
            setup: (inputs: null, outputs: null) => ({ inputs, outputs }),
            steps: [
                {
                    name: "Bar",
                    run: () => console.info("One"),
                },
                {
                    name: "Baz",
                    run: () => console.info("Two"),
                },
            ],
            finally: context => {
                console.info("Finally", context);
            },
        });

        expect(job.name).toBe("Foo");

        await job.run(null, null);
        const output = spy.mock.calls.flat();

        expect(output).toMatchInlineSnapshot(`
          [
            "[1/2] Bar",
            "One",
            "[2/2] Baz",
            "Two",
            "Running finally hook",
            "Finally",
            {
              "inputs": null,
              "outputs": null,
            },
          ]
        `);
    });

    it("the job should skip step when step.if return false", async () => {
        const spy = vi.spyOn(console, "info");
        const fn = vi.fn(() => false);

        const job = defineJob({
            name: "Foo",
            setup: (inputs: null, outputs: null) => ({ inputs, outputs }),
            steps: [
                {
                    name: "Bar",
                    run: () => console.info("One"),
                },
                {
                    name: "Baz",
                    if: fn,
                    run: () => console.info("Two"),
                },
            ],
        });

        await job.run(null, null);

        expect(fn).toHaveBeenCalledWith({ inputs: null, outputs: null });

        const output = spy.mock.calls.flat();

        expect(output).toMatchInlineSnapshot(`
          [
            "[1/2] Bar",
            "One",
            "[2/2] Skip Baz step",
          ]
        `);
    });
});
