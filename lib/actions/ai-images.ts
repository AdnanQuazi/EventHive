"use server";

type GenerateEventImagesInput = {
  prompt: string;
  title?: string;
  category?: string;
  count?: number;
};

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const EVENT_IMAGE_SYSTEM_PROMPT = [
  "You generate hero images for event listings.",
  "Output must be a single high-quality image in 16:9 composition.",
  "Do not include text overlays, logos, watermarks, or signatures.",
  "Prioritize cinematic lighting, clear focal subject, and modern visual style.",
].join(" ");

function buildPrompt(input: GenerateEventImagesInput): string {
  const contextLines = [
    input.title ? `Event title: ${input.title}` : "",
    input.category ? `Category: ${input.category}` : "",
  ].filter(Boolean);

  return [
    "Create a high-quality cinematic event poster style image.",
    "Target image composition: 16:9 widescreen.",
    "No text, no logos, no watermarks, no signatures.",
    "Single coherent scene, rich lighting, modern composition.",
    contextLines.join(" | "),
    `User prompt: ${input.prompt.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateOneImage(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: EVENT_IMAGE_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${message}`);
  }

  const payload = await response.json();
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) continue;

    for (const part of parts) {
      const inlineData = part?.inlineData;
      if (inlineData?.data && inlineData?.mimeType) {
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    }
  }

  throw new Error("Gemini did not return an image. Try a more specific prompt.");
}

export async function generateEventMainImages(
  input: GenerateEventImagesInput
): Promise<ActionResult<{ images: string[] }>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        data: null,
        error: "Missing GEMINI_API_KEY in environment configuration",
      };
    }

    const trimmedPrompt = input.prompt?.trim();
    if (!trimmedPrompt) {
      return { data: null, error: "Prompt is required" };
    }

    const count = Math.min(Math.max(input.count ?? 4, 1), 6);
    const fullPrompt = buildPrompt({ ...input, prompt: trimmedPrompt });

    const images = await Promise.all(
      Array.from({ length: count }, () => generateOneImage(fullPrompt, apiKey))
    );

    return { data: { images }, error: null };
  } catch (error) {
    console.error("AI image generation error:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate images with Gemini",
    };
  }
}
