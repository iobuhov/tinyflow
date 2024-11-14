import { vi, describe, expect, it, beforeEach } from "vitest";

describe("defineTask", () => {
    it("should return an object with run method", async () => {
        const task = defineTask({
            name: "Task",
            run: vi.fn(),
        });

        expect(task).toBeDefined();
        expect(task.name).toBe("Task");
        expect(task.run).toBeInstanceOf(Function);
    });

    describe("task.run", () => {
        let fn = vi.fn();
        let task;

        beforeEach(() => {
            fn = vi.fn();
            task = defineTask({
                name: "Task",
                run: fn,
            });
        });

        it("should accept two arguments", () => {
            expect(task.run.length).toBe(2);
        });

        it("should return a Promise", () => {
            expect(task.run(null, null)).toBeInstanceOf(Promise);
        });

        it("should call the spec.run function with correct arguments", async () => {
            task.run(37, 42);
            expect(fn).toHaveBeenCalledWith(37, 42);
        });
    });
});
