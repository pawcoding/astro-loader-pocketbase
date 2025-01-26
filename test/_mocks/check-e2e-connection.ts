export async function checkE2eConnection(): Promise<void> {
  try {
    await fetch("http://localhost:8090/api/health");
  } catch {
    throw new Error(
      "E2E connection failed. Make sure the PocketBase instance is running on http://localhost:8090."
    );
  }
}
