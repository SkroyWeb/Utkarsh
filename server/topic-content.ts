import axios from "axios";
import { searchSources } from "./research";
import { aiEnabled, generateAiLesson } from "./lesson-ai";

export interface TopicSearchResult {
  title: string;
  url: string;
  snippet?: string;
  image?: string;
}

interface TopicProfile {
  matches: RegExp;
  icon: string;
  lens: string;
  coreIdea: string;
  howItWorks: string;
  example: string;
  importance: string;
  caution: string;
  vocabulary: string;
}

const topicProfiles: TopicProfile[] = [
  {
    matches: /quantum|particle|relativity|physics|mechanics|thermodynamic/i,
    icon: "⚛️",
    lens: "use models, experiments, and measurable predictions rather than everyday intuition",
    coreIdea: "the rules that describe matter, energy, space, and time at the scale relevant to the question",
    howItWorks: "separate the system being studied, the quantities that can be measured, and the mathematical model that connects them",
    example: "a thought experiment or a laboratory measurement that makes the abstract principle observable",
    importance: "it explains phenomena that classical, everyday descriptions cannot handle and guides technologies built from those effects",
    caution: "an analogy can make the idea easier to approach, but it is not a substitute for the precise definition or the evidence",
    vocabulary: "system, state, measurement, interaction, model, and prediction",
  },
  {
    matches: /machine learning|deep learning|artificial intelligence|\bai\b|neural network|algorithm|data science/i,
    icon: "🤖",
    lens: "connect the data, the objective, the learning process, and the model's limitations",
    coreIdea: "a system that uses examples or rules to produce a prediction, decision, or generated result",
    howItWorks: "identify the input and target, choose an objective, adjust the model using data, and evaluate it on examples it did not train on",
    example: "a small training set, a prediction made from it, and the kind of mistake that reveals where the model needs better data or design",
    importance: "it can automate pattern-heavy work, but its usefulness depends on data quality, evaluation, and the consequences of errors",
    caution: "a confident output is not proof that the system understands the subject or that its result is fair and correct",
    vocabulary: "features, labels, training, inference, generalization, bias, and evaluation",
  },
  {
    matches: /climate|global warming|weather|carbon|greenhouse|environment|ecosystem|biodiversity/i,
    icon: "🌍",
    lens: "separate the physical mechanism, the observed evidence, the impacts, and the choices available to people",
    coreIdea: "the relationship between a physical process and changes in the atmosphere, oceans, land, living systems, or communities",
    howItWorks: "trace energy or matter through the relevant system, then distinguish a short-term fluctuation from a long-term trend",
    example: "a cause-and-effect chain from an emission or environmental change to a measurable shift and then to a local consequence",
    importance: "it connects scientific measurements with risks, adaptation decisions, public policy, and changes in daily life",
    caution: "individual events do not prove a long-term trend on their own, and solutions should be judged by evidence, scale, cost, and trade-offs",
    vocabulary: "baseline, feedback, emissions, exposure, risk, mitigation, adaptation, and uncertainty",
  },
  {
    matches: /genetic|gene|dna|rna|cell|biology|human body|anatomy|physiology|evolution/i,
    icon: "🧬",
    lens: "move from structure to function, then connect individual mechanisms to the larger living system",
    coreIdea: "how biological information, structures, and processes work together to produce a trait or life function",
    howItWorks: "follow the information or material through the relevant steps, while distinguishing correlation from a demonstrated cause",
    example: "a pathway from a molecule or cell process to a visible trait, body response, or population-level effect",
    importance: "it helps explain health, inheritance, disease, adaptation, and the design of biological research",
    caution: "biological systems are variable and interactive, so a single gene, symptom, or study rarely explains the whole outcome",
    vocabulary: "cell, gene, expression, regulation, variation, inheritance, pathway, and homeostasis",
  },
  {
    matches: /renewable|solar|wind power|hydro|electricity|energy|battery|nuclear/i,
    icon: "⚡",
    lens: "follow the energy from its source through conversion, storage, delivery, and use",
    coreIdea: "how a source of energy is converted into a usable form and what constraints shape that process",
    howItWorks: "identify the source, conversion technology, efficiency losses, storage or balancing needs, and the final application",
    example: "one unit of energy moving through a device or grid, including where useful energy is produced and where constraints appear",
    importance: "it affects reliability, cost, emissions, infrastructure, resource use, and the transition to different energy systems",
    caution: "no technology should be evaluated from one metric alone; reliability, lifecycle impacts, location, and scale all matter",
    vocabulary: "conversion, efficiency, capacity, demand, storage, grid, lifecycle, and reliability",
  },
  {
    matches: /ancient|history|civilization|empire|war|revolution|archaeology|philosophy|ethics|democracy/i,
    icon: "🏛️",
    lens: "place the ideas or events in time and context, then compare evidence with later interpretations",
    coreIdea: "the people, institutions, ideas, and conditions that shaped the subject and the changes that followed",
    howItWorks: "build a timeline, identify the actors and incentives, examine primary evidence, and separate documented facts from interpretation",
    example: "a specific event, text, artifact, or decision that shows how a broader pattern affected real people",
    importance: "context explains why the subject developed as it did and helps reveal which lessons can or cannot transfer to the present",
    caution: "historical explanations are shaped by surviving evidence, perspective, translation, and the categories used by later writers",
    vocabulary: "context, chronology, primary source, institution, evidence, interpretation, continuity, and change",
  },
  {
    matches: /space|astronomy|planet|star|galaxy|rocket|orbit|cosmos/i,
    icon: "🚀",
    lens: "connect the object or mission to the physical conditions, observations, and engineering constraints involved",
    coreIdea: "what the subject is, where it fits in the universe, and which forces or instruments determine what we can know about it",
    howItWorks: "describe the system, the observation or mission design, the measurements collected, and how those measurements support a conclusion",
    example: "an orbit, telescope observation, or mission decision that turns a difficult question into data",
    importance: "it expands scientific knowledge while driving advances in instruments, communications, materials, and navigation",
    caution: "images and headlines are interpretations of measurements; scale, uncertainty, and the limits of an instrument still matter",
    vocabulary: "scale, orbit, mass, gravity, spectrum, observation, mission, and uncertainty",
  },
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function limitText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

function getProfile(query: string): TopicProfile | undefined {
  return topicProfiles.find((profile) => profile.matches.test(query));
}

async function fetchWikipediaContext(query: string): Promise<TopicSearchResult | undefined> {
  try {
    const searchResponse = await axios.get<unknown[][]>(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "opensearch",
          search: query,
          limit: 1,
          namespace: 0,
          format: "json",
        },
        timeout: 4000,
        headers: { "User-Agent": "ExplainIt educational app" },
      },
    );

    const titles = Array.isArray(searchResponse.data?.[1]) ? searchResponse.data[1] : [];
    const title = typeof titles[0] === "string" ? titles[0] : undefined;
    if (!title) return undefined;

    const summaryResponse = await axios.get<{
      title?: string;
      extract?: string;
      thumbnail?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
    }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      {
        timeout: 4000,
        headers: { "User-Agent": "ExplainIt educational app" },
      },
    );

    const extract = summaryResponse.data.extract?.trim();
    if (!extract) return undefined;

    return {
      title: summaryResponse.data.title || title,
      url:
        summaryResponse.data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      snippet: extract,
      image: summaryResponse.data.thumbnail?.source,
    };
  } catch (error) {
    console.warn("Topic context lookup unavailable:", error instanceof Error ? error.message : error);
    return undefined;
  }
}

export async function searchTopic(query: string): Promise<TopicSearchResult[]> {
  const multi = await searchSources(query);
  if (multi.length) return multi;

  const context = await fetchWikipediaContext(query);
  const topicSlug = encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g, "-"));

  if (context) {
    return [
      context,
      {
        title: `Further reading about ${context.title}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(context.title.replace(/ /g, "_"))}`,
      },
      {
        title: `${query} — related learning resources`,
        url: `https://www.britannica.com/search?query=${topicSlug}`,
      },
    ];
  }

  return [
    {
      title: `Learning overview: ${query}`,
      url: `https://www.britannica.com/search?query=${topicSlug}`,
      snippet: `No verified overview was available for "${query}" during this search. The explanation will stay focused on the question you asked and will clearly separate general framing from sourced details.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Lesson = narration + whiteboard visuals, built together so they stay in sync.
// Each "beat" is one narrated paragraph plus what the whiteboard shows for it.
// ---------------------------------------------------------------------------

export type BoardVisual = BoardArt & (
  | { kind: "title"; label: string; text: string; subtitle?: string; items?: string[] }
  | { kind: "concept"; label: string; text: string; note?: string }
  | { kind: "steps"; label: string; items: string[] }
  | { kind: "facts"; label: string; items: string[] }
  | { kind: "vocab"; label: string; items: string[] }
  | { kind: "example"; label: string; text: string; prompt?: string }
  | { kind: "caution"; label: string; text: string }
  | { kind: "timeline"; label: string; events: Array<{ when: string; what: string }> }
  | { kind: "comparison"; label: string; leftTitle: string; rightTitle: string; rows: Array<{ left: string; right: string }> }
  | { kind: "diagram"; label: string; nodes: string[]; caption?: string }
  | { kind: "bars"; label: string; items: Array<{ label: string; value: number; unit?: string }> }
  | { kind: "quiz"; label: string; question: string; options: string[]; answer: number; explain?: string }
  | { kind: "formula"; label: string; text: string; note?: string }
);

export type Emotion = "neutral" | "happy" | "excited" | "curious" | "serious";
export type Gesture = "none" | "nod" | "lean" | "tilt";

/** Optional visuals any slide can carry. */
export interface BoardArt {
  icon?: string;
  image?: string;
}

export interface Beat {
  say: string;
  board: BoardVisual;
  emotion?: Emotion;
  gesture?: Gesture;
}

export interface TimedBeat extends Beat {
  /** character offset of this beat inside Lesson.script */
  start: number;
  end: number;
}

export interface Lesson {
  script: string;
  beats: TimedBeat[];
}

function capFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** "a, b, and c" -> ["A", "B", "C"] */
function toList(text: string, maxLength = 80): string[] {
  return text
    .split(/,\s*(?:and\s+|then\s+)?/)
    .map((part) => limitText(capFirst(part.trim()), maxLength))
    .filter(Boolean);
}

function withTiming(beats: Beat[]): Lesson {
  let cursor = 0;
  const timed = beats.map((beat) => {
    const start = cursor;
    const end = start + beat.say.length;
    cursor = end + 2; // the "\n\n" between paragraphs
    return { ...beat, start, end };
  });
  return { script: beats.map((beat) => beat.say).join("\n\n"), beats: timed };
}

export async function buildLesson(
  query: string,
  searchResults: TopicSearchResult[] = [],
): Promise<Lesson> {
  const topic = query.trim().replace(/\s+/g, " ");

  // New path: an LLM writes a lesson specific to this topic. Falls back to the
  // template lesson below if no API key is set or the model output is unusable.
  if (aiEnabled()) {
    const aiBeats = await generateAiLesson(topic);
    if (aiBeats) return withTiming(aiBeats);
  }

  const profile = getProfile(topic);
  const context =
    searchResults.find((result) => result.snippet && result.snippet.length > 80) ||
    (await fetchWikipediaContext(topic));
  const sourceText = context?.snippet;
  // Only Wikimedia-hosted images are embedded in the lesson page.
  const image = context?.image?.startsWith("https://upload.wikimedia.org/") ? context.image : undefined;
  const icon = profile?.icon ?? "📘";
  const facts = sourceText ? splitSentences(sourceText).slice(0, 6) : [];
  const sourcedFacts = facts.length
    ? facts.map((fact, index) => `${index + 1}. ${limitText(fact, 280)}`).join(" ")
    : `There is not enough verified information to state specific facts about ${topic} confidently. We will focus on the core ideas and clearly distinguish what is known from what remains uncertain.`;

  // Short versions of the same facts for the board (narration keeps the full text).
  const factsBoard: BoardVisual = facts.length
    ? { kind: "facts", label: "Key facts", icon: "📌", items: facts.map((fact) => limitText(fact, 80)) }
    : {
        kind: "concept",
        label: "Key facts", icon: "📌",
        text: "No verified source details were found, so this lesson sticks to the core ideas.",
      };

  if (profile) {
    return withTiming([
      {
        say: `Welcome to a lesson on ${topic}.`,
        board: {
          kind: "title",
          label: "Lesson",
          icon,
          image,
          text: capFirst(topic),
          subtitle: "Today we will cover",
          items: ["Core idea", "How it works", "Example", "Why it matters", "Keep in mind", "Key facts", "Vocabulary"],
        },
      },
      {
        say: `To understand ${topic}, ${profile.lens}. The central idea is ${profile.coreIdea}. Start by asking what the subject includes, what it does not include, and what evidence would distinguish one explanation from another.`,
        board: {
          kind: "concept",
          label: "Core idea",
          icon,
          image,
          text: capFirst(profile.coreIdea),
          note: `Approach: ${profile.lens}`,
        },
      },
      {
        say: `The process works like this: ${profile.howItWorks}. For ${topic}, that means paying attention to the sequence of causes and effects instead of memorizing isolated terms.`,
        board: { kind: "steps", label: "How it works", icon: "⚙️", items: toList(profile.howItWorks) },
      },
      {
        say: `A concrete way to make the idea stick is to use ${profile.example}. As you study, ask what would change if one part of that example changed. That question often reveals the mechanism more clearly than a definition alone.`,
        board: {
          kind: "example",
          label: "Example", icon: "🔍",
          text: capFirst(profile.example),
          prompt: "What would change if one part changed?",
        },
      },
      {
        say: `Why this matters: ${profile.importance}. It connects the topic to real decisions and observations, while also showing where a simple explanation stops being enough.`,
        board: { kind: "concept", label: "Why it matters", icon: "💡", text: capFirst(profile.importance) },
      },
      {
        say: `Keep this limitation in view: ${profile.caution}. Good understanding includes knowing what a claim can explain, what evidence supports it, and what remains uncertain.`,
        board: { kind: "caution", label: "Keep in mind", icon: "⚠️", text: capFirst(profile.caution) },
      },
      {
        say: `Some important facts about ${topic} are: ${sourcedFacts}`,
        board: factsBoard,
      },
      {
        say: `The key vocabulary for this lesson is ${profile.vocabulary}. In short, understand the mechanism first, test it against the evidence, and then use the vocabulary to describe what you found. You can use that approach when exploring more about ${topic}.`,
        board: { kind: "vocab", label: "Key vocabulary", icon: "🔤", items: toList(profile.vocabulary, 30) },
      },
    ]);
  }

  return withTiming([
    {
      say: `Welcome to a lesson on ${topic}.`,
      board: {
        kind: "title",
        label: "Lesson",
        icon,
        image,
        text: capFirst(topic),
        subtitle: "Today we will cover",
        items: ["Big picture", "Key facts", "Three layers", "Comparison", "Summary"],
      },
    },
    {
      say: `The short answer is not one universal definition: ${topic} needs to be understood through its subject, mechanism, evidence, and consequences. First identify what kind of thing it is, what problem or question it addresses, and which terms need a precise definition.`,
      board: { kind: "steps", label: "Four lenses", icon: "🔭", items: ["Subject", "Mechanism", "Evidence", "Consequences"] },
    },
    {
      say: `Here are some important facts about ${topic}: ${sourcedFacts}`,
      board: factsBoard,
    },
    {
      say: `To study ${topic} in depth, separate three layers. First, describe the parts or ideas involved. Next, explain the sequence that connects them. Finally, check an example and ask what evidence would support or challenge the explanation.`,
      board: {
        kind: "steps",
        label: "Three layers", icon: "🧱",
        items: ["Describe the parts or ideas", "Explain the sequence connecting them", "Check an example against the evidence"],
      },
    },
    {
      say: `A practical follow-up is to compare ${topic} with a nearby concept that is easy to confuse with it. Note the shared features, the important difference, and the situation where choosing the wrong concept would lead to a wrong conclusion.`,
      board: {
        kind: "concept",
        label: "Compare",
        icon: "⚖️",
        text: "Compare it with a nearby concept that is easy to confuse with it.",
        note: "Note the shared features, the key difference, and when the wrong choice misleads.",
      },
    },
    {
      say: `This topic is best understood as a process rather than a collection of facts. Keep track of assumptions, limits, and uncertainty, and do not treat a polished explanation as evidence by itself.`,
      board: {
        kind: "caution",
        label: "Keep in mind", icon: "⚠️",
        text: "Think in processes, not isolated facts. Track assumptions, limits and uncertainty.",
      },
    },
    {
      say: `In summary, start with the definition of ${topic}, trace how it works, test the idea against an example, and then examine why it matters. Ask a follow-up question if you want the next lesson to focus on its history, mechanism, applications, or criticism.`,
      board: {
        kind: "steps",
        label: "Summary", icon: "✅",
        items: ["Define it", "Trace how it works", "Test it with an example", "Ask why it matters"],
      },
    },
  ]);
}

/** Narration only (kept for existing callers). */
export async function buildEducationalScript(
  query: string,
  searchResults: TopicSearchResult[] = [],
): Promise<string> {
  return (await buildLesson(query, searchResults)).script;
}
