import type { AstroIntegrationLogger } from "astro";
import { vi } from "vitest";

export class LoggerMock implements AstroIntegrationLogger {
  // oxlint-disable-next-line no-explicit-any
  public options!: any;
  public label = "mock";

  public fork(_label: string): AstroIntegrationLogger {
    return this;
  }
  public info = vi.fn();
  public warn = vi.fn();
  public error = vi.fn();
  public debug = vi.fn();
}
