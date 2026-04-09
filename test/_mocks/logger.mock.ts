import type { AstroIntegrationLogger } from "astro";
import { vi } from "vitest";

export class LoggerMock implements AstroIntegrationLogger {
  public options!: any;
  public label = "mock";

  public fork(_label: string): AstroIntegrationLogger {
    return this;
  }
  public info = vi.fn<AstroIntegrationLogger["info"]>();
  public warn = vi.fn<AstroIntegrationLogger["warn"]>();
  public error = vi.fn<AstroIntegrationLogger["error"]>();
  public debug = vi.fn<AstroIntegrationLogger["debug"]>();
}
