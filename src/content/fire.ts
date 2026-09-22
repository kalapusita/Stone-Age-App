export const fireContent = {
  title: "MAKING FIRE",
  subtitle: "Learning to Control Fire",
  hook: `Imagine living hundreds of thousands of years ago.

There are no matches. No lighters. No electricity.

When the sun goes down, it becomes completely dark. In colder environments, staying warm can become a matter of survival.

Then humans learned to control one of nature's most powerful forces: fire.`,

  readingHeading: "Humans and Fire",
  reading: `Early humans probably encountered fire naturally through events such as wildfires and lightning. But encountering fire and controlling it are very different things.

Archaeological evidence shows that early humans were controlling fire hundreds of thousands of years ago. At Gesher Benot Ya'aqov in present-day Israel, archaeologists found concentrations of burned wood, seeds and flint dating to about 790,000 years ago. Their locations suggest that early humans repeatedly used particular places for fires or hearths.

Fire transformed everyday life. It provided warmth and light, offered some protection from predators, and allowed food to be cooked, making many foods easier to eat and digest. Hearths may also have become places where people gathered, shared food and information, and socialized.

But there was another major step: being able to start a fire rather than simply maintain one. Archaeological evidence from Barnham, England, reported in recent research, indicates deliberate fire-making around 400,000 years ago. Archaeologists found heated ground, fire-cracked flint and pieces of iron pyrite, a mineral that can produce sparks when struck.`,

  evidenceImage: "/images/fire-evidence-gesher.jpg",
  evidenceCaption:
    "Fire-altered stone tools — Gesher Benot Ya'aqov, Israel, approximately 790,000 years ago.",

  investigationPrompt: "How can archaeologists know that humans were using fire?",
  evidenceCategories: [
    {
      key: "charcoal",
      label: "CHARCOAL / BURNED MATERIAL",
      explanation:
        "Concentrations of charcoal and ash in one spot, rather than scattered randomly, can mark the location of a hearth that was used again and again.",
    },
    {
      key: "bone",
      label: "BURNT BONE",
      explanation:
        "Animal bone that shows the color and cracking patterns produced by heat can suggest that food was cooked, or that bone was burned as fuel or discarded near a fire.",
    },
    {
      key: "stone",
      label: "FIRE-ALTERED STONE",
      explanation:
        "Heat can change the color, texture and fracture patterns of stone. Flint and other stone tools found near a hearth sometimes show these heat signatures.",
    },
  ],
  contextNote:
    "Archaeological interpretation relies on CONTEXT — the pattern and location of evidence together — not simply on finding one burned object.",

  responseQuestion:
    "Which TWO effects of controlling fire do you think were most important?",
  effectOptions: [
    { key: "warmth", label: "Warmth" },
    { key: "cooking", label: "Cooking" },
    { key: "protection", label: "Protection" },
    { key: "social", label: "Social life" },
  ],
  explanationPrompt: "Explain your choices using what you learned.",
};
