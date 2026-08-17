const MODE_BRIEF: Record<string, string> = {
  mobile:
    "a set of 3 mobile app screens arranged side by side on a soft neutral background, each rendered inside a realistic modern phone frame with rounded corners and a status bar",
  web: "a single desktop web app dashboard screen shown in a clean browser window with a sidebar, header and content area, on a soft neutral background",
  system:
    "a design system sheet showing colour swatches, type scale, buttons, inputs, badges and card components laid out on a neutral grid",
};

const QUALITY =
  "Award-winning product design, precise 8pt grid, generous whitespace, consistent corner radii, accessible contrast, real interface copy in clean sans-serif type, crisp icons, tasteful shadows. No lorem ipsum gibberish, no watermark, no distorted text, no photographic people. Rendered as a flat, pixel-sharp interface screenshot.";

export function buildDesignPrompt(idea: string, mode: string, style: string): string {
  const brief = MODE_BRIEF[mode] ?? MODE_BRIEF["mobile"];
  return `Ultra high fidelity UI design mockup: ${brief}. Product idea: ${idea}. Visual style: ${style}. ${QUALITY}`;
}

export function buildRefinePrompt(
  original: string,
  mode: string,
  style: string,
  instruction: string,
): string {
  const brief = MODE_BRIEF[mode] ?? MODE_BRIEF["mobile"];
  return `Edit the attached UI design in place. Keep the same ${brief}, the same layout, composition and branding — change only what the instruction asks. Instruction: ${instruction}. Original brief: ${original}. Visual style: ${style}. ${QUALITY}`;
}
