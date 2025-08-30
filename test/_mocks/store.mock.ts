// oxlint-disable no-explicit-any
// oxlint-disable explicit-module-boundary-types
import type { DataStore } from "astro/loaders";

export class StoreMock implements DataStore {
  readonly #store = new Map<string, any>();

  public get(key: string) {
    return this.#store.get(key);
  }

  public entries() {
    return [...this.#store.entries()];
  }

  public set(opts: any) {
    this.#store.set(opts.id, opts);
    return true;
  }

  public values() {
    return [...this.#store.values()];
  }

  public keys() {
    return [...this.#store.keys()];
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
