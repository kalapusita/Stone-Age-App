export const caveArtContent = {
  title: "CAVE ART",
  subtitle: "Messages from the Past",
  hook: `Imagine finding these images deep inside a cave.

They were created tens of thousands of years ago. There are no written explanations telling us what they mean.

What can we learn from them?`,

  readingHeading: "Painting the Stone Age",
  reading: `Prehistoric people created paintings, drawings and engravings on cave walls. Some surviving examples are tens of thousands of years old and show that prehistoric humans were capable of sophisticated artistic and symbolic expression.

Artists commonly represented animals. At Chauvet Cave in France, more than 1,000 images have been recorded, including mammoths, cave lions, rhinoceroses, bison and bears. Some of the drawings date back more than 30,000 years.

Prehistoric artists used materials available in their environment. Ocher could provide red and yellow pigments, while charcoal and minerals such as manganese could produce darker colors.

But one major mystery remains:

Why did prehistoric people create cave art?

We cannot simply ask the artists, and they left no written explanation. Archaeologists therefore have to interpret the evidence.

The paintings might have been connected to beliefs or rituals, storytelling, communication, teaching, hunting — or something completely different.

We know the paintings existed. Their meaning is an interpretation.`,

  factObservation: "The paintings exist.",
  interpretation: "What the paintings meant.",

  evidenceImage: "/images/cave-art-chauvet.jpg",
  evidenceCaption: "Animal paintings — Chauvet Cave, France, more than 30,000 years old.",

  observationPrompt: "Look carefully. What can you actually observe?",
  observations: [
    { key: "animals", label: "Animals" },
    { key: "species", label: "Different species" },
    { key: "overlap", label: "Overlapping figures" },
    { key: "movement", label: "A sense of movement" },
    { key: "sizes", label: "Different sizes" },
    { key: "landscape", label: "Limited or no obvious landscape" },
  ],
  observeInterpretNote:
    "OBSERVE FIRST. INTERPRET SECOND. What you can see is not the same as what it meant.",

  interpretationQuestion: "Why do you think prehistoric people created cave art?",
  interpretationOptions: [
    {
      key: "hunting",
      label: "HUNTING / TEACHING",
      description:
        "Perhaps paintings helped people teach others about animals or hunting.",
    },
    {
      key: "storytelling",
      label: "STORYTELLING",
      description:
        "Perhaps images helped communities tell stories and pass knowledge between generations.",
    },
    {
      key: "rituals",
      label: "RITUALS / BELIEFS",
      description: "Perhaps some images had spiritual or ceremonial meaning.",
    },
    {
      key: "communication",
      label: "COMMUNICATION / IDENTITY",
      description:
        "Perhaps images communicated ideas or represented a group's identity.",
    },
  ],
  evidencePrompt: "What evidence or observations support your interpretation?",

  uncertaintyNote: `We don't know for certain.

Archaeologists can use evidence to develop interpretations, but without written explanations from the artists, the exact meaning of many prehistoric paintings remains uncertain.`,
};
