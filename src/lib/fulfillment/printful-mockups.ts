/**
 * Printful Mockup Generator API client.
 *
 * Generates product mockup images with customer photos rendered ON the product.
 * Uses Printful's POST /mockup-generator/create-task/{id} endpoint.
 *
 * Flow:
 * 1. Create mockup task with product ID + image URL
 * 2. Poll for task completion (usually 5-15 seconds)
 * 3. Return generated mockup image URLs
 */

const API_KEY = process.env.PRINTFUL_API_KEY || "";
const BASE_URL = "https://api.printful.com";
const IS_MOCK = !API_KEY;

type MockupTask = {
  task_key: string;
  status: "pending" | "completed" | "failed";
};

type MockupResult = {
  task_key: string;
  status: string;
  mockups: Array<{
    placement: string;
    variant_ids: number[];
    mockup_url: string;
    extra: Array<{ title: string; url: string }>;
  }>;
  error?: string;
};

/**
 * Create a mockup generation task.
 * Returns a task_key to poll for results.
 */
export async function createMockupTask(
  printfulProductId: number | string,
  imageUrl: string,
  variantIds?: number[],
): Promise<{ taskKey: string } | null> {
  if (IS_MOCK) {
    console.log("[Printful Mockup] MOCK mode — no API key");
    return null;
  }

  try {
    const body: any = {
      variant_ids: variantIds || [],
      files: [
        {
          placement: "default",
          image_url: imageUrl,
          position: {
            area_width: 1800,
            area_height: 2400,
            width: 1800,
            height: 2400,
            top: 0,
            left: 0,
          },
        },
      ],
    };

    const res = await fetch(
      `${BASE_URL}/mockup-generator/create-task/${printfulProductId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.warn(`[Printful Mockup] Create task failed: ${res.status} ${err}`);
      return null;
    }

    const data = await res.json();
    const taskKey = data.result?.task_key;
    if (!taskKey) return null;

    return { taskKey };
  } catch (e: any) {
    console.warn("[Printful Mockup] Error creating task:", e.message);
    return null;
  }
}

/**
 * Poll for mockup task completion.
 * Returns mockup URLs when ready.
 */
export async function getMockupResult(
  taskKey: string,
  maxAttempts = 10,
): Promise<MockupResult | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(
        `${BASE_URL}/mockup-generator/task?task_key=${taskKey}`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!res.ok) return null;

      const data = await res.json();
      const result = data.result;

      if (result?.status === "completed") {
        return result as MockupResult;
      }

      if (result?.status === "failed") {
        console.warn("[Printful Mockup] Task failed:", result.error);
        return null;
      }

      // Still pending — wait 2s and try again
      await new Promise((r) => setTimeout(r, 2000));
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Generate a mockup in one call — create task + poll for result.
 * Returns the first mockup URL or null.
 */
export async function generateProductMockup(
  printfulProductId: number | string,
  imageUrl: string,
  variantIds?: number[],
): Promise<string | null> {
  const task = await createMockupTask(printfulProductId, imageUrl, variantIds);
  if (!task) return null;

  const result = await getMockupResult(task.taskKey);
  if (!result?.mockups?.length) return null;

  return result.mockups[0].mockup_url;
}

/**
 * Get available print files/placements for a product.
 * Useful for knowing which placement areas exist.
 */
export async function getProductPrintfiles(
  printfulProductId: number | string,
): Promise<any | null> {
  if (IS_MOCK) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/mockup-generator/printfiles/${printfulProductId}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}
