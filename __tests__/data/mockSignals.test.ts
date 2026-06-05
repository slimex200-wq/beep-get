import { latestSignal, logs, signalQueue } from "@/data/mockSignals";

describe("mock signal sample copy", () => {
  it("does not ship timed demo Blink labels in reusable signal samples", () => {
    const notes = [latestSignal, ...signalQueue, ...logs]
      .map((signal) => signal.note)
      .filter(Boolean)
      .join("\n");

    expect(latestSignal.note).toBe("Blink received");
    expect(notes).not.toMatch(/2\s*sec\s*blink|demo blink/i);
  });
});
