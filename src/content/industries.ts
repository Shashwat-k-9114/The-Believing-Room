export type IndustrySlug =
  | "it-technology"
  | "finance"
  | "sales-marketing"
  | "animation-multimedia";

export interface Industry {
  slug: IndustrySlug;
  name: string;
  short: string;
  index: string;
  motif: string;
  accent: string;
  tagline: string;
  blurb: string;
  represents: string;
  whoShouldApply: string[];
  skills: string[];
  pitchFormats: { title: string; detail: string }[];
  portfolio: string[];
  panelLooksFor: string[];
  /** Illustrative functions only. NOT confirmed employer vacancies. */
  possibleFunctions: string[];
  faqs: { q: string; a: string }[];
}

export const industries: Industry[] = [
  {
    slug: "it-technology",
    name: "IT & Technology",
    short: "Technology",
    index: "01",
    motif: "Architecture",
    accent: "#9CC8F0",
    tagline: "Show them how you build.",
    blurb: "Software, AI, security, cloud and data. Demonstrated, not described.",
    represents:
      "Everything built with code and systems: software engineering, web and full-stack development, artificial intelligence and machine learning, cybersecurity, cloud and DevOps, data science and product development. The Technology arena rewards people who ship, and who can explain why they made the choices they did.",
    whoShouldApply: [
      "Students who have built something real, however small: an app, a model, a tool, a security write-up.",
      "Self-taught developers whose GitHub tells a better story than their transcript.",
      "Students in computer science, IT, data science and adjacent degrees.",
    ],
    skills: ["Full-stack web", "Machine learning", "Data analysis", "Cloud & DevOps", "Cybersecurity", "Systems design", "Mobile development"],
    pitchFormats: [
      { title: "Live demo", detail: "Run your project in front of the panel and walk through how it works." },
      { title: "Architecture walkthrough", detail: "Explain a system you designed: trade-offs, failures, what you would change." },
      { title: "Problem to prototype", detail: "Frame a real problem and show the smallest thing that solves it." },
    ],
    portfolio: ["A public repository with a readable README", "A deployed link or short screen recording", "One honest paragraph on what broke and how you fixed it"],
    panelLooksFor: ["Clarity of thinking under questioning", "Depth behind the demo", "Code and system hygiene", "Curiosity and speed of learning", "Explaining a technical idea simply"],
    possibleFunctions: ["Software engineering intern", "Machine learning intern", "Data analyst intern", "Security intern", "DevOps intern", "Product engineering intern"],
    faqs: [
      { q: "Do I need a finished product?", a: "No. A working prototype with a clear point of view is stronger than a polished clone. Be ready to explain what is real and what is not." },
      { q: "Can I demo something that needs the internet?", a: "Plan for it not to work. Bring a recorded fallback of your demo." },
    ],
  },
  {
    slug: "finance",
    name: "Finance",
    short: "Finance",
    index: "02",
    motif: "Structure",
    accent: "#D7C09A",
    tagline: "Make the numbers speak.",
    blurb: "Analysis, markets, accounting and fintech, argued with evidence.",
    represents:
      "Financial analysis, accounting, investment research, banking, fintech, business finance and risk. The Finance arena rewards disciplined reasoning: a clear thesis, honest assumptions and the ability to defend a number when someone pushes on it.",
    whoShouldApply: [
      "Commerce, economics, BBA, MBA, CA and CFA-track students with a point of view on a company or market.",
      "Students who build models, track markets or write research for fun.",
      "Fintech-curious engineers who understand both the code and the ledger.",
    ],
    skills: ["Financial modelling", "Equity research", "Accounting", "Risk analysis", "Valuation", "Excel & data tools", "Fintech product thinking"],
    pitchFormats: [
      { title: "Investment pitch", detail: "Present a company or asset: thesis, valuation, risks, what would change your mind." },
      { title: "Model walkthrough", detail: "Take the panel through a model you built and defend its assumptions." },
      { title: "Case in five minutes", detail: "Diagnose a business problem and recommend a financial decision." },
    ],
    portfolio: ["A model or research note (PDF, sheet or link)", "A clear statement of assumptions", "Sources for every figure you cite"],
    panelLooksFor: ["Logical structure", "Quality of assumptions", "Comfort with numbers under pressure", "Risk awareness", "Honesty about uncertainty"],
    possibleFunctions: ["Financial analyst intern", "Equity research intern", "Accounting intern", "Risk intern", "Corporate finance intern", "Fintech operations intern"],
    faqs: [
      { q: "Is this investment advice?", a: "No. Pitches are educational demonstrations of analytical ability. Nothing presented on stage is a recommendation to buy or sell anything." },
      { q: "Do I need real-money experience?", a: "No. Paper analysis and well-built models are welcome." },
    ],
  },
  {
    slug: "sales-marketing",
    name: "Sales & Marketing",
    short: "Sales & Marketing",
    index: "03",
    motif: "Narrative",
    accent: "#E9C4B0",
    tagline: "Sell the idea. Starting with yourself.",
    blurb: "Persuasion, growth and brand, performed live.",
    represents:
      "Sales, business development, digital and growth marketing, creative strategy, brand management, advertising and market research. This is the most performative arena: you are judged on how well you land a message with a room that is not obliged to agree.",
    whoShouldApply: [
      "Students who have run a campaign, a page, a club, a small business or a community.",
      "Natural communicators who can turn a product into a story and a story into a result.",
      "Analytical marketers who can show the numbers behind the creative.",
    ],
    skills: ["Sales pitching", "Growth marketing", "Content & copy", "Brand strategy", "Market research", "Performance analytics", "Community building"],
    pitchFormats: [
      { title: "Sell it live", detail: "Sell a product or idea to the panel in front of the audience." },
      { title: "Campaign teardown", detail: "Present a campaign you ran or admire: goal, audience, result, lesson." },
      { title: "Go-to-market in five minutes", detail: "Take a product and show how you would find its first hundred customers." },
    ],
    portfolio: ["A campaign, page or content sample", "Any real result you can verify", "A short reflection on what did not work"],
    panelLooksFor: ["Message clarity", "Audience understanding", "Evidence of results", "Handling objections", "Presence and authenticity"],
    possibleFunctions: ["Business development intern", "Digital marketing intern", "Growth intern", "Content strategy intern", "Brand intern", "Market research intern"],
    faqs: [
      { q: "What if I have no paid work to show?", a: "Personal projects, college festivals, clubs and small ventures count. Be specific about what you did and what changed because of it." },
      { q: "Can I bring slides?", a: "Yes, briefly. The strongest pitches rely on the person, not the deck." },
    ],
  },
  {
    slug: "animation-multimedia",
    name: "Animation & Multimedia",
    short: "Animation & Multimedia",
    index: "04",
    motif: "Motion",
    accent: "#C9B8F0",
    tagline: "Let the work move them.",
    blurb: "2D, 3D, VFX, motion, design and film: on a screen, not a PDF.",
    represents:
      "2D and 3D animation, VFX, motion graphics, graphic design, video editing, filmmaking, digital media, UI/UX and creative production. The Multimedia arena is a screening room: your reel plays on a large display and the panel responds to what they see and to how you talk about making it.",
    whoShouldApply: [
      "Animators, motion designers, editors, filmmakers and designers with a reel or portfolio.",
      "UI/UX designers who can defend decisions, not just show screens.",
      "Students who make things in their own time and have the files to prove it.",
    ],
    skills: ["2D / 3D animation", "VFX & compositing", "Motion graphics", "Graphic design", "Video editing", "UI/UX design", "Filmmaking"],
    pitchFormats: [
      { title: "Reel and commentary", detail: "A short reel followed by a conversation about decisions and process." },
      { title: "Process breakdown", detail: "Show one piece from brief to final: sketches, drafts, dead ends." },
      { title: "Design critique", detail: "Present a product or piece and take live feedback from the panel." },
    ],
    portfolio: ["A reel or portfolio link (two minutes or less)", "Process material for at least one piece", "Credits that make clear what you personally made"],
    panelLooksFor: ["Craft and taste", "Range and consistency", "Taking critique well", "Process and problem solving", "Command of tools"],
    possibleFunctions: ["Motion design intern", "Video editing intern", "3D / VFX intern", "Graphic design intern", "UI/UX design intern", "Production intern"],
    faqs: [
      { q: "How do I show large video files?", a: "Share a link to your reel (YouTube, Vimeo, Drive). The organisers will arrange playback on the day." },
      { q: "Will my work be published?", a: "Only with your separate written permission. See the media consent page." },
    ],
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
export const industryOptions = industries.map((i) => ({ value: i.slug, label: i.name }));
