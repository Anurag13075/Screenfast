export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readTime: string;
  emoji: string;
  content: ContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-tools-for-app-ui-design",
    title: "8 AI Tools for App UI Design in 2026 (And When to Use Each)",
    excerpt:
      "A practical breakdown of where AI design tools actually help — prompt-to-screen generators, code-to-UI assistants, and everything in between.",
    category: "Tools",
    date: "2026-06-02",
    readTime: "7 min read",
    emoji: "🧰",
    content: [
      {
        type: "p",
        text: "Two years ago, \"AI UI design\" mostly meant auto-layout suggestions inside Figma. That's no longer the whole picture. A new category of tools now takes a text prompt and returns a coherent, on-brand set of screens — device frames, spacing, type scale and all — in under a minute. If you're evaluating this space for the first time, it helps to know what each type of tool is actually built for, because they solve different problems.",
      },
      { type: "h2", text: "1. Prompt-to-screen generators" },
      {
        type: "p",
        text: "These tools take a single sentence describing your product and generate a full screen set: onboarding, home, detail views, whatever fits the flow you described. The output is meant to look shippable on the first try, not as a rough sketch to redo from scratch. This is the category Screenfast sits in — you describe the product, pick a visual direction, and get device-framed mobile screens or web dashboards back, along with a matching design system sheet.",
      },
      {
        type: "p",
        text: "Best for: founders and developers who need a believable, consistent UI fast — for a pitch deck, an MVP, or a starting point to hand to a developer — without waiting on a design hire.",
      },
      { type: "h2", text: "2. Code-to-UI assistants" },
      {
        type: "p",
        text: "A different category generates React or HTML components directly from a prompt, aimed at developers who want working code rather than a visual mockup. These are strong when you already know your component structure and just want boilerplate scaffolding.",
      },
      {
        type: "p",
        text: "Best for: developers building out functional UI who don't need exploratory visual direction first.",
      },
      { type: "h2", text: "3. Auto-layout and suggestion engines" },
      {
        type: "p",
        text: "Built into existing design tools, these assist rather than generate — cleaning up spacing, suggesting component variants, or auto-arranging elements you've already placed. They speed up an existing workflow rather than replacing the blank-canvas step.",
      },
      {
        type: "p",
        text: "Best for: designers already working inside a tool like Figma who want faster iteration, not a starting point from zero.",
      },
      { type: "h2", text: "4. Wireframe-to-mockup converters" },
      {
        type: "p",
        text: "These take a rough sketch — sometimes literally a photo of a whiteboard — and turn it into a cleaner digital wireframe. Useful early in a workshop or brainstorm, less useful once you need production-ready visuals.",
      },
      { type: "h2", text: "How to actually choose" },
      {
        type: "list",
        items: [
          "Starting from nothing and need believable screens fast → prompt-to-screen generator",
          "Already have a component library and just need code → code-to-UI assistant",
          "Already designing in Figma and want faster iteration → auto-layout tool",
          "Running a workshop and need to digitize a sketch → wireframe converter",
        ],
      },
      {
        type: "p",
        text: "Most solo founders and small teams get the most leverage from the first category, simply because it removes the biggest bottleneck: getting from a one-line idea to something a developer can actually build against. That's the gap tools like Screenfast are built to close — a full screen set and design system from a single prompt, exported at full resolution when you're ready to hand it off.",
      },
    ],
  },
  {
    slug: "design-app-without-design-team",
    title: "How to Design an App Without a Design Team",
    excerpt:
      "A realistic workflow for solo founders and small teams who need a coherent UI without hiring a designer or learning Figma from scratch.",
    category: "Guides",
    date: "2026-05-18",
    readTime: "6 min read",
    emoji: "🛠️",
    content: [
      {
        type: "p",
        text: "Most early-stage products don't fail because the design was ugly. They stall because the founder spent three weeks in a design tool they don't know, trying to get spacing and type scale to feel consistent, instead of shipping something a user could react to. If you're building solo or with a tiny team, the goal isn't a beautiful design — it's a coherent one you can get in front of people fast.",
      },
      { type: "h2", text: "Step 1: Write the one-sentence brief before touching any tool" },
      {
        type: "p",
        text: "Before opening anything, write a single sentence: what the app does, and who it's for. \"A habit tracker for shift workers with irregular schedules\" tells a design tool — human or AI — far more than \"a habit tracker app.\" This sentence is the input for every generation, every layout decision, every color choice that follows. Skipping it is the single biggest reason early mockups feel generic.",
      },
      { type: "h2", text: "Step 2: Pick one visual direction and commit" },
      {
        type: "p",
        text: "Indecision between five aesthetic directions is more expensive than picking a merely-good one and moving. Broadly, most products fit one of four buckets: minimal (lots of whitespace, restrained color), brutalist (bold type, hard edges, high contrast), glassy (blur, translucency, soft depth), or dark premium (deep backgrounds, high-contrast accents). Pick the one that matches how your users already think about the category — a finance tool skews minimal or dark premium; a creator tool can afford brutalist.",
      },
      { type: "h2", text: "Step 3: Generate the full flow, not one screen" },
      {
        type: "p",
        text: "A single polished screen tells you nothing about whether your product holds together. Generate the entire flow — onboarding through to the core action — so you can see whether navigation, spacing and hierarchy stay consistent across screens. This is where prompt-to-screen tools save the most time versus manually designing screen by screen, because consistency is enforced automatically rather than something you have to police yourself.",
      },
      { type: "h2", text: "Step 4: Extract a design system, even a small one" },
      {
        type: "p",
        text: "The moment you hand screens to a developer, inconsistency becomes expensive — slightly different button radii or spacing values across screens turn into real implementation time. Pull out a minimal system before handoff: your color tokens, a type scale (even just three sizes), and your core components (button, input, card). It doesn't need to be comprehensive. It needs to exist.",
      },
      { type: "h2", text: "Step 5: Hand off, don't gold-plate" },
      {
        type: "p",
        text: "Resist the urge to keep refining. Export at full resolution, write a short handoff note on states you haven't covered (empty states, error states, loading), and get it to a developer or into code. You can revise once real users have touched it — that feedback is worth more than another afternoon of solo polish.",
      },
      {
        type: "quote",
        text: "The bar for a first version isn't \"finished.\" It's \"coherent enough that a user's confusion is about the product, not the interface.\"",
      },
    ],
  },
  {
    slug: "design-systems-101",
    title: "Design Systems 101: Tokens, Type Scales, and Components Explained",
    excerpt:
      "A plain-language breakdown of what a design system actually is, why it matters even for a one-person project, and what the minimum viable version looks like.",
    category: "Fundamentals",
    date: "2026-05-04",
    readTime: "8 min read",
    emoji: "🧩",
    content: [
      {
        type: "p",
        text: "\"Design system\" sounds like something only large companies need — a 40-page Figma file maintained by a dedicated team. In practice, the core idea scales down to a single developer working alone: a design system is just the set of decisions you've already made about how your product looks, written down so you don't have to re-decide them on every screen.",
      },
      { type: "h2", text: "Color tokens" },
      {
        type: "p",
        text: "A token is a named value instead of a raw one. Rather than using the hex code #E8622C in twelve different files, you define --color-primary once and reference it everywhere. The benefit isn't aesthetic — it's that changing your brand color later becomes a one-line edit instead of a find-and-replace across your whole codebase. A minimum viable token set covers background, foreground (text), primary, muted, and border. Five values, not fifty.",
      },
      { type: "h2", text: "Type scale" },
      {
        type: "p",
        text: "A type scale is a small, fixed set of font sizes used consistently, instead of picking a slightly different size every time you add a heading. A workable scale for most apps is four or five steps — something like 14px body text, 16px emphasized body, 20px section heading, 32px page heading, 48px hero. The specific numbers matter less than the discipline of reusing the same five values everywhere.",
      },
      { type: "h2", text: "Spacing scale" },
      {
        type: "p",
        text: "The same logic applies to space between elements. Rather than eyeballing padding on every card, pick a base unit (commonly 4px or 8px) and only ever use multiples of it — 8, 16, 24, 32. This is why interfaces built on a real spacing scale feel calm and intentional even when they're visually simple: everything lines up because it was never allowed not to.",
      },
      { type: "h2", text: "Core components" },
      {
        type: "p",
        text: "The last piece is a small library of reusable pieces — button, input, card, badge — each with a fixed set of states (default, hover, disabled, active). Once these exist, new screens become assembly rather than re-invention. This is the single biggest lever for shipping fast without things looking inconsistent screen to screen.",
      },
      { type: "h2", text: "What a minimum viable design system actually needs" },
      {
        type: "list",
        items: [
          "5–8 color tokens (not a full palette)",
          "A 4–5 step type scale",
          "An 8px-based spacing scale",
          "3–5 core components with defined states",
        ],
      },
      {
        type: "p",
        text: "That's genuinely the whole list. Everything more elaborate — dark mode variants, animation tokens, elevation systems — is worth adding once the product has traction, not before. Tools that generate screens from a prompt can produce this starter system alongside the screens themselves, which is often the fastest way to get a consistent baseline without building one by hand.",
      },
    ],
  },
  {
    slug: "minimal-vs-brutalist-vs-glassy",
    title: "Minimal vs. Brutalist vs. Glassy: Choosing a UI Style for Your App",
    excerpt:
      "Four common app aesthetics, what they signal to users, and a simple framework for picking the right one for your product category.",
    category: "Design",
    date: "2026-04-21",
    readTime: "5 min read",
    emoji: "🎨",
    content: [
      {
        type: "p",
        text: "Visual style isn't decoration — it's a signal users read before they read a word of copy. A finance app that looks brutalist reads as untrustworthy before a user even understands what it does. A kids' education app that looks like enterprise software feels cold. Getting the direction right matters more than getting the details right.",
      },
      { type: "h2", text: "Minimal" },
      {
        type: "p",
        text: "Generous whitespace, restrained color, quiet typography. Minimal signals precision, trust, and low cognitive load — which is why it dominates finance, health, and productivity tools. The risk is blending in: minimal done without a distinct accent color or type choice can feel indistinguishable from every other minimal app.",
      },
      { type: "h2", text: "Brutalist" },
      {
        type: "p",
        text: "Bold type, hard edges, high contrast, sometimes deliberately \"unpolished\" details. Brutalist signals confidence and a willingness to break convention — strong for creator tools, dev tools, and anything targeting an audience that values personality over polish. It's a bad fit anywhere trust is the primary job of the interface, like payments or healthcare.",
      },
      { type: "h2", text: "Glassy (glassmorphism)" },
      {
        type: "p",
        text: "Translucency, blur, soft depth and layering. Glassy signals modernity and a premium feel, and reads especially well on device-native apps where it can pick up whatever's behind it. It's more expensive to implement well — blur effects can hurt performance on lower-end devices — so it suits products where visual delight is part of the pitch, like media or lifestyle apps.",
      },
      { type: "h2", text: "Dark premium" },
      {
        type: "p",
        text: "Deep, near-black backgrounds with high-contrast accent colors. Dark premium signals sophistication and focus — it's become the default for developer tools, trading platforms, and anything that wants to feel serious and expert-oriented rather than approachable.",
      },
      { type: "h2", text: "A simple way to choose" },
      {
        type: "p",
        text: "Ask what your interface needs to signal first: trust, personality, delight, or expertise. Trust points toward minimal. Personality points toward brutalist. Delight points toward glassy. Expertise points toward dark premium. Then look at three competitors in your exact category — if all three already use the same direction, that's the expected baseline for users, and deviating from it is a deliberate differentiation decision, not an accident.",
      },
      {
        type: "p",
        text: "Whatever direction you pick, the biggest visual mistake isn't choosing the \"wrong\" style — it's mixing two. A brutalist hero section on top of minimal product screens reads as unfinished, not eclectic. Commit to one direction across the whole flow.",
      },
    ],
  },
  {
    slug: "idea-to-shippable-ui-workflow",
    title: "From Idea to Shippable UI: A Practical Workflow",
    excerpt:
      "The exact sequence of steps that gets a product from a rough idea to developer-ready screens — without a design team and without weeks of iteration.",
    category: "Guides",
    date: "2026-04-09",
    readTime: "6 min read",
    emoji: "🚀",
    content: [
      {
        type: "p",
        text: "\"Shippable\" is a specific bar, and it's lower than most people think. It doesn't mean pixel-perfect or fully animated. It means a developer can open the file and know exactly what to build — every screen, every state, every spacing decision already made. Here's a workflow that gets there in an afternoon rather than a month.",
      },
      { type: "h2", text: "1. Describe, don't brainstorm out loud" },
      {
        type: "p",
        text: "Write the one-sentence product description before opening any tool: what it does, who it's for. This single input drives everything downstream — it's the difference between a generic screen set and one that actually reflects your product's specific audience and use case.",
      },
      { type: "h2", text: "2. Pick a style and generate the full flow at once" },
      {
        type: "p",
        text: "Choose a visual direction (minimal, brutalist, glassy, dark premium) and generate every screen in the flow together, not one at a time. Consistency across a flow is much harder to achieve by stitching together individually-designed screens than by generating them as a set from the start.",
      },
      { type: "h2", text: "3. Review for gaps, not polish" },
      {
        type: "p",
        text: "At this stage, resist the urge to nitpick spacing. Instead check for structural gaps: is there an empty state? An error state? What happens after the primary action succeeds? These are the details that actually block a developer, far more than a slightly-off margin.",
      },
      { type: "h2", text: "4. Pull the design system alongside the screens" },
      {
        type: "p",
        text: "Export your color tokens, type scale, and core components as their own reference sheet. This becomes the single source of truth a developer checks against instead of eyeballing values off individual screens — it's what keeps screen 12 consistent with screen 1.",
      },
      { type: "h2", text: "5. Export at full resolution and hand off" },
      {
        type: "p",
        text: "Full-resolution exports (not screenshots) let a developer inspect exact pixel values, colors, and spacing directly. If your tool supports code export (React or HTML), even better — it removes an entire translation step between design and implementation.",
      },
      { type: "h2", text: "6. Ship, then iterate on real feedback" },
      {
        type: "p",
        text: "The version you hand off doesn't need to survive unchanged. It needs to be good enough that user feedback is about the product, not the interface. Once it's live, revise based on what people actually do, not on further solo guessing.",
      },
      {
        type: "quote",
        text: "Speed to a coherent first version beats perfection on a version nobody has used yet, every time.",
      },
    ],
  },
  {
    slug: "what-founders-get-wrong-about-product-design",
    title: "What Founders Get Wrong About Product Design",
    excerpt:
      "Five recurring mistakes non-designer founders make when shipping their first product UI — and what to do instead.",
    category: "Founders",
    date: "2026-03-27",
    readTime: "6 min read",
    emoji: "💡",
    content: [
      {
        type: "p",
        text: "Most early-stage design problems aren't about taste. They're about process — founders without a design background tend to repeat the same handful of mistakes, and they're avoidable once you know to watch for them.",
      },
      { type: "h2", text: "1. Designing the happy path only" },
      {
        type: "p",
        text: "It's easy to design the screen where everything works — data loaded, form filled correctly, action succeeded. It's much easier to forget the empty state, the error state, the loading state. These aren't edge cases; for a new product with little data, the empty state is often the first thing a real user sees. Design it on purpose, not as an afterthought.",
      },
      { type: "h2", text: "2. Treating visual polish as the finish line" },
      {
        type: "p",
        text: "A beautifully designed screen with confusing navigation will underperform a plainer screen that's easy to use. Founders without design training often over-invest in visual details (shadows, gradients, micro-animations) and under-invest in information hierarchy — what should the user notice first, second, third. Fix hierarchy before polish.",
      },
      { type: "h2", text: "3. Skipping a design system and paying for it later" },
      {
        type: "p",
        text: "Without token-level decisions made up front, every new screen re-litigates spacing and color from scratch, and inconsistency compounds fast. A basic system — a handful of color tokens, a type scale, a spacing scale — takes an hour to define and saves many hours of rework later.",
      },
      { type: "h2", text: "4. Copying a competitor's UI wholesale" },
      {
        type: "p",
        text: "Looking at competitors for category conventions (where does navigation usually sit, what pattern do users already expect) is smart. Copying their specific visual choices is not — it erases the one thing that could differentiate your product, and it's usually obvious to users who've seen both.",
      },
      { type: "h2", text: "5. Waiting for a \"real\" designer before shipping anything" },
      {
        type: "p",
        text: "This is the most expensive mistake. Waiting months to hire before putting anything in front of users delays the feedback that would tell you what's actually worth designing well. A coherent, imperfect first version — built solo, with AI tools or otherwise — beats a polished version that arrives too late to matter.",
      },
      {
        type: "p",
        text: "None of these require design talent to avoid. They require treating design as a sequence of decisions (hierarchy, states, consistency) rather than a talent you either have or don't. Get the decisions right, and \"good enough taste\" carries the rest of the way further than founders usually expect.",
      },
    ],
  },
];

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
