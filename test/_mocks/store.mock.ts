/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { DataStore } from "astro/loaders";

export class StoreMock implements DataStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly #store = new Map<string, any>();

  public get(key: string) {
    return this.#store.get(key);
  }

  public entries() {
    return Array.from(this.#store.entries());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set(opts: any) {
    this.#store.set(opts.id, opts);
    return true;
  }

  public values() {
    return Array.from(this.#store.values());
  }

  public keys() {
    return Array.from(this.#store.keys());
  }

  public delete(key: string) {
    this.#store.delete(key);
  }

  public clear() {
    this.#store.clear();
  }

  public has(key: string) {
    return this.#store.has(key);
  }

  public addModuleImport(_fileName: string) {
    // Do nothing
  }
}
