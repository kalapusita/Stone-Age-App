export const stoneToolsContent = {
  title: "STONE TOOLS",
  subtitle: "The First Technologies",
  hook: `Look at the object in your hand.

Today we have thousands of specialized tools. But millions of years ago, early humans began transforming ordinary pieces of stone into tools.

What could you do with a sharp piece of rock?`,

  reading: `Stone-tool technology stretches back millions of years. Some of the earliest known stone tools date to about 3.3 million years ago, while the widespread technology known as Oldowan appeared more than 2.6 million years ago.

Early toolmakers could strike one stone with another. A hammerstone was used to hit a stone core, breaking off sharp flakes. Those flakes could then be used for cutting and other tasks.

These seemingly simple tools opened new possibilities. Early humans could cut meat, process animal carcasses, break bones to reach nutritious marrow, pound materials and process different foods.

Stone technology did not remain the same. By around 1.76 million years ago, toolmakers were producing Acheulean handaxes — carefully shaped cutting tools with worked edges. Much later, increasingly varied tools included points, scrapers and awls, some of which could be attached to wooden shafts.

Stone tools therefore tell archaeologists more than simply what people owned. They provide evidence of skill, planning, technological innovation and how early humans interacted with their environment.`,

  progressionNote:
    "This shows one general pattern seen at some sites over a very long time span — it was not a single, universal, one-way progression that happened identically everywhere.",
  progression: [
    { key: "core", label: "CORE + FLAKES", image: "/images/stone-tools-oldowan.jpg", caption: "Oldowan core and flake tools — among the earliest widespread stone technology, more than 2.6 million years ago. Made by striking flakes off a stone core with a hammerstone; the sharp edges of the flakes could cut and scrape." },
    { key: "handaxe", label: "SHAPED HANDAXE", image: "/images/stone-tools-handaxe.jpg", caption: "Acheulean handaxe — a deliberately shaped cutting tool, from around 1.76 million years ago onward. Worked on both faces into a teardrop shape, a design repeated across vast distances and spans of time." },
    { key: "specialized", label: "MORE SPECIALIZED / COMPOSITE TOOLS", image: null, caption: "Later tools became more varied and specialized, including points and scrapers, some attached to wooden shafts." },
  ],

  knappingIntro:
    "Early humans shaped stone by striking it with another stone. Try it yourself. Choose where to strike the stone and watch how pieces break away to create a sharp edge.",

  archaeologistQuestion:
    "An archaeologist discovers a deliberately shaped stone tool. What might it tell us about its maker?",
  supportedInferences: [
    { key: "plan", label: "They could plan ahead." },
    { key: "fracture", label: "They understood something about how stone fractures." },
    { key: "manipulate", label: "They could manipulate materials to create useful objects." },
    { key: "resources", label: "They used technology to obtain or process resources." },
  ],
  unsupportedInference: {
    key: "language",
    label: "They spoke a particular language.",
    explanation:
      "Not necessarily. A stone tool can provide evidence of technological skill, but it cannot tell us what language its maker spoke.",
  },

  responseQuestion:
    "What can stone tools tell archaeologists about prehistoric humans?",
};
