export async function generateHuggingFaceImage(
  prompt: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey || apiKey === "MY_HF_API_KEY") {
    throw new Error("Hugging Face API key unavailable: set HF_API_KEY in environment");
  }

  const model = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: `Cinematic concept art, masterpiece lighting, high detail: ${prompt}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Hugging Face API error (${response.status}): ${errorText || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type") || "image/png";
  const base64Data = buffer.toString("base64");

  return {
    dataUrl: `data:${mimeType};base64,${base64Data}`,
    mimeType,
  };
}
