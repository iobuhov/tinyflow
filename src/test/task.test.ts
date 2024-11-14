import { vi, describe, expect, it } from "vitest";
import { defineTask } from "../task.mjs";

describe("defineTask", () => {
    it("should return 'runnable'", async () => {
        const fn = vi.fn(() => Promise.resolve({ error: null }));
        const task = defineTask({
            name: "Task",
            run: fn,
        });

        expect(task).toBeDefined();
        expect(task.name).toBe("Task");
        expect(task.run).toBeInstanceOf(Function);
        expect(task.run(37, 42)).toBeInstanceOf(Promise);
        expect(fn).toHaveBeenCalledWith(37, 42);
    });
});
