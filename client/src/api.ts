// api.ts
export async function getLLMResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Error from server: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response as string;

  } catch (error) {
    console.error("Fetch error:", error);
    return `Error: ${(error as Error).message}`;
  }
}
