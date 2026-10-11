/**
 * "AI and Super Intelligence for Kids": short lessons for readers about 8 to 12,
 * meant to be read with a grown-up. Every statement restates something in the
 * site's sourced explainers or an official document listed under "For grown-ups";
 * nothing here is new research. Text supports **bold** and [label](/path) only.
 * Kid-facing text is held to short sentences by tests/unit/kids.test.ts.
 */

export type KidIcon = "sparkles" | "brain" | "rocket" | "scale" | "lock" | "shield" | "compass";

export type KidQuestion = { prompt: string; choices: string[]; answer: number; explanation: string };

export type KidLesson = {
  slug: string;
  number: number;
  title: string;
  /** The question the lesson answers, shown on cards. */
  question: string;
  icon: KidIcon;
  minutes: number;
  bigIdea: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  tryThis: { title: string; steps: string[] };
  remember: string[];
  quiz: KidQuestion[];
  grownUps: { note: string; links: { label: string; href: string }[] };
};

export const KIDS_REVIEWED = "2026-10-11";
export const KIDS_AGES = "about 8 to 12";

export const KID_LESSONS: KidLesson[] = [
  {
    slug: "what-is-ai",
    number: 1,
    title: "What is AI?",
    question: "What is AI, and where do you see it?",
    icon: "sparkles",
    minutes: 4,
    bigIdea: "AI is a computer program that learns from lots of examples. Then it can make guesses, suggestions, and choices.",
    sections: [
      {
        heading: "A computer that learns from examples",
        paragraphs: [
          "Most computer programs follow steps that a person wrote down, one at a time. Many of today's AI programs work differently. People show them many, many examples, and they find patterns in them.",
          "AI stands for **artificial intelligence**. Artificial means made by people. Intelligence means being able to learn and solve problems.",
        ],
      },
      {
        heading: "AI is already around you",
        paragraphs: ["You might use AI every day without noticing. Here are some places it can show up:"],
        bullets: [
          "A phone that turns your voice into words on the screen.",
          "A computer voice that reads words out loud.",
          "A tool that turns words into another language.",
          "An app that can tell what is in a picture, like a dog or a bike.",
          "A chatbot that answers questions in writing.",
        ],
      },
      {
        heading: "What the law says",
        paragraphs: [
          "A United States law, the National Artificial Intelligence Initiative Act of 2020, explains AI in grown-up words. Here is what it means: AI is a computer system that works on goals people give it. It makes predictions, suggestions, or decisions. These can affect the real world or a world made by computers.",
        ],
      },
    ],
    tryThis: {
      title: "Be an AI detective",
      steps: [
        "Look around your home or classroom for things that might use AI.",
        "For each one, ask: what is it guessing or choosing?",
        "Make a list with a grown-up. How many did you find?",
      ],
    },
    remember: [
      "AI is a computer program that learns from examples.",
      "It makes guesses, suggestions, and choices.",
      "You probably use AI already, maybe every day.",
    ],
    quiz: [
      {
        prompt: "What does the A in AI stand for?",
        choices: ["Amazing", "Artificial", "Automatic"],
        answer: 1,
        explanation: "AI stands for artificial intelligence. Artificial means made by people.",
      },
      {
        prompt: "How does AI learn?",
        choices: ["From lots of examples", "By going to school", "It already knows everything"],
        answer: 0,
        explanation: "People show AI many examples, and it finds patterns in them.",
      },
      {
        prompt: "Which of these might use AI?",
        choices: ["A pencil", "An app that turns your voice into words", "A paper book"],
        answer: 1,
        explanation: "Speech tools use AI to turn spoken words into text.",
      },
    ],
    grownUps: {
      note: "The \"What the law says\" section paraphrases the federal definition of artificial intelligence in 15 U.S.C. 9401(3), from the National Artificial Intelligence Initiative Act of 2020, which was enacted on January 1, 2021. The statute's words are \"real or virtual environments.\" Not all AI learns from examples; older systems followed rules people wrote, so the lesson says \"many of today's\" AI programs. The everyday examples are kinds of tools described in the multimodal explainer: speech to text, text to speech, translation, and image understanding.",
      links: [
        { label: "15 U.S.C. 9401, definitions (Legal Information Institute)", href: "https://www.law.cornell.edu/uscode/text/15/9401" },
        { label: "Multimodal models: text, images, audio, and video", href: "/learn/multimodal-models/" },
        { label: "How large language models work", href: "/learn/how-language-models-work/" },
        { label: "A short history of AI in the United States", href: "/learn/ai-history/" },
      ],
    },
  },
  {
    slug: "how-ai-learns",
    number: 2,
    title: "How does AI learn?",
    question: "How does AI learn, and why can it be wrong?",
    icon: "brain",
    minutes: 5,
    bigIdea: "AI learns by practicing on huge piles of examples. It is a little like how you get better at something by practicing over and over.",
    sections: [
      {
        heading: "Learning from examples",
        paragraphs: [
          "Imagine teaching a friend to spot cats. You show them lots of cat pictures. Soon they notice patterns, like pointy ears, whiskers, and a tail.",
          "AI learns in a similar way, but it often uses far more examples. One famous collection of pictures for training AI held more than 3 million images!",
        ],
      },
      {
        heading: "Guess, check, adjust",
        paragraphs: [
          "Learning time for an AI is called **training**. The AI makes a guess and checks if it was right. Then it changes its numbers a tiny bit to do better next time. It does this again and again, a huge number of times.",
          "What it learns is saved as a giant list of numbers called a **model**. One open model, Olmo 3 7B from a research lab called Ai2, has more than 7 billion of these numbers!",
        ],
      },
      {
        heading: "How chatbots write",
        paragraphs: [
          "Chatbots learned from huge amounts of writing. When you ask a question, the chatbot guesses the next word or piece of a word. Then it guesses the next one, and the next, until its answer is done.",
          "So a chatbot can sound very sure and still be wrong. It picks words that fit. It is not looking up the truth.",
        ],
      },
    ],
    tryThis: {
      title: "Play \"guess the next word\"",
      steps: [
        "Ask someone to say the start of a sentence, like \"Peanut butter and...\"",
        "Guess the next word. Was it easy? Why?",
        "Now try \"The purple elephant flew to...\" That one is harder!",
        "Chatbots guess like this, one word at a time.",
      ],
    },
    remember: [
      "AI learns by practicing on lots of examples.",
      "What it learns is saved as a model, a huge list of numbers.",
      "Chatbots guess one word at a time, so they can be wrong even when they sound sure.",
    ],
    quiz: [
      {
        prompt: "What is training?",
        choices: ["When AI practices on examples and gets better", "When a robot lifts weights", "When you turn a computer off"],
        answer: 0,
        explanation: "In training, the AI guesses, checks, and adjusts, again and again.",
      },
      {
        prompt: "How does a chatbot write an answer?",
        choices: ["It copies a whole answer from one book", "It guesses the next word, again and again", "A person types every answer"],
        answer: 1,
        explanation: "A chatbot builds its answer one word or piece of a word at a time.",
      },
      {
        prompt: "A chatbot sounds very sure. Does that mean it is right?",
        choices: ["Yes, always", "No, it can still be wrong", "Only on weekends"],
        answer: 1,
        explanation: "Sounding sure is not the same as being right. Check important facts.",
      },
    ],
    grownUps: {
      note: "The training and next-token description, the Olmo 3 7B weight count (7,298,011,136), and the point that fluent answers can be wrong all come from the language-model explainer below. The picture collection is ImageNet, which held 3.2 million images in 2009, as the AI history explainer describes.",
      links: [
        { label: "How large language models work", href: "/learn/how-language-models-work/" },
        { label: "Pretraining, fine-tuning, and post-training", href: "/learn/pretraining-and-post-training/" },
        { label: "Tokens and context windows", href: "/learn/tokens-and-context-windows/" },
        { label: "A short history of AI in the United States", href: "/learn/ai-history/#data-and-transformers" },
      ],
    },
  },
  {
    slug: "what-is-super-intelligence",
    number: 3,
    title: "What does \"super intelligence\" mean?",
    question: "What does super intelligence mean?",
    icon: "rocket",
    minutes: 5,
    bigIdea: "People use \"super intelligence\" in two ways. It is the new name U.S. government agencies use for AI. It is also an idea about future AI that could be far more capable than today's.",
    sections: [
      {
        heading: "Meaning 1: a new name for AI",
        paragraphs: [
          "On September 29, 2026, the President signed an order called \"Inaugurating the Era of Super Intelligence.\" It tells federal government agencies to say **Super Intelligence**, or **SI**, instead of artificial intelligence, or AI. This is for their websites, reports, and other papers.",
          "The order does not create a new kind of computer. For now, it uses the same meaning as the law from lesson 1. So when a government page says SI, it means the AI you learned about in lesson 1. The order also asks for ideas for a new meaning, so this could change.",
          "You may start to see SI on government websites. One example is NIST, a government science agency.",
        ],
      },
      {
        heading: "Meaning 2: an idea about the future",
        paragraphs: [
          "Some people use the word in a bigger way. They imagine an AI much smarter than the best people at almost everything. A philosopher named Nick Bostrom described it that way in 1998.",
          "Some companies talk about this goal. A company called Safe Superintelligence Inc. says its one goal is to build safe superintelligence. Meta has a team called Meta Superintelligence Labs.",
          "Nobody knows if or when AI like that will exist. People disagree about it. That makes it a great question to think about!",
        ],
      },
      {
        heading: "Why people care",
        paragraphs: [
          "More capable AI could help scientists, doctors, and inventors. It could also be used to hurt people, or make mistakes that matter. That is why people work hard to keep AI safe. You will learn about that in lesson 6.",
        ],
      },
    ],
    tryThis: {
      title: "Talk it over",
      steps: [
        "With a grown-up or friends, talk about this: what would you want a super-smart AI to help with?",
        "What rules should it follow?",
        "Who should get to decide those rules?",
      ],
    },
    remember: [
      "U.S. government agencies now call AI \"Super Intelligence,\" or SI.",
      "Some people also use the word for a possible future AI that is far smarter than today's.",
      "Nobody knows if or when that kind of AI will exist.",
    ],
    quiz: [
      {
        prompt: "In U.S. government agency writing since September 2026, what does SI stand for?",
        choices: ["Super Intelligence", "Space Invaders", "Science Ideas"],
        answer: 0,
        explanation: "An order signed on September 29, 2026, tells agencies to say Super Intelligence, or SI, instead of AI.",
      },
      {
        prompt: "Did that order create a brand-new kind of computer?",
        choices: ["Yes", "No, it is a new name for the same technology", "Only for robots"],
        answer: 1,
        explanation: "For now, the order uses the same meaning the law gives for AI.",
      },
      {
        prompt: "Does anyone know for sure when AI smarter than people at everything will exist?",
        choices: ["Yes, it will be next year", "No, nobody knows for sure", "It already lives inside every phone"],
        answer: 1,
        explanation: "People disagree about whether and when that could happen.",
      },
    ],
    grownUps: {
      note: "Meaning 1 is Executive Order 14434, signed September 29, 2026 (91 FR 63129). To the extent the law allows, it applies to executive-branch documents, and it defines its terms by 15 U.S.C. 9401(3) unless and until that definition is superseded; it also asks for proposed legislative language for a federal definition within 60 days. Statutes themselves still say \"artificial intelligence.\" Meaning 2 follows Nick Bostrom's 1998 paper, which defines a superintelligence as \"an intellect that is much smarter than the best human brains in practically every field.\"",
      links: [
        { label: "Executive Order 14434 in the policy tracker", href: "/policy/#eo-14434" },
        { label: "Finding AI policy and standards sources", href: "/learn/policy-and-standards-sources/" },
        { label: "How Long Before Superintelligence? (Nick Bostrom, 1998)", href: "https://nickbostrom.com/superintelligence" },
        { label: "Safe Superintelligence Inc. in the catalog", href: "/companies/ssi/" },
        { label: "Meta in the catalog", href: "/companies/meta/" },
      ],
    },
  },
  {
    slug: "what-ai-can-and-cannot-do",
    number: 4,
    title: "What can AI do, and what can't it?",
    question: "What is AI good at, and where does it fall short?",
    icon: "scale",
    minutes: 4,
    bigIdea: "AI is great at finding patterns in lots of information. But it does not know things the way you do, and it makes mistakes.",
    sections: [
      {
        heading: "Things AI can be good at",
        paragraphs: ["Here are some jobs that AI tools are built to help with:"],
        bullets: [
          "Turning speech into text, and text into speech.",
          "Translating between languages.",
          "Spotting things in pictures, like animals or objects.",
          "Writing, summing up, and answering questions.",
          "Helping scientists study proteins, the tiny parts that help living things work.",
        ],
      },
      {
        heading: "Things to be careful about",
        paragraphs: ["AI also has limits. Keep these in mind:"],
        bullets: [
          "AI makes mistakes, and sometimes it makes things up.",
          "It may not know about things that happened after its training, unless it can search for new information.",
          "Sounding smart is not the same as being right.",
          "AI is not your family or friend. It does not know you the way they do.",
          "People, not AI, are responsible for important choices.",
        ],
      },
      {
        heading: "Why AI gets things wrong",
        paragraphs: [
          "AI learns from examples. Sometimes those examples are wrong, missing pieces, or unfair. Then the AI can learn the wrong patterns.",
          "That is one reason people test AI carefully before trusting it.",
        ],
      },
    ],
    tryThis: {
      title: "Fact or fake?",
      steps: [
        "With a grown-up, ask a chatbot a question you already know the answer to. Try \"How many legs does a spider have?\"",
        "Check the answer in a book or a trusted website.",
        "Was the chatbot right? How could you tell?",
      ],
    },
    remember: [
      "AI is good at patterns in words, pictures, sounds, and numbers.",
      "AI can be wrong and can make things up, so check important facts.",
      "People, not AI, are responsible for important choices.",
    ],
    quiz: [
      {
        prompt: "Which job is AI often good at?",
        choices: ["Turning speech into text", "Knowing exactly how you feel", "Never making a mistake"],
        answer: 0,
        explanation: "Speech models turn spoken words into text. AI still makes mistakes, though.",
      },
      {
        prompt: "A chatbot tells you a fact for a school report. What should you do?",
        choices: ["Copy it right away", "Check it with a trusted source", "Ask the chatbot if it is sure, then copy it"],
        answer: 1,
        explanation: "Chatbots can be wrong. Check facts in a trusted book or website, or ask a teacher.",
      },
      {
        prompt: "Why might AI learn something unfair?",
        choices: ["Its examples were unfair or incomplete", "Computers are mean", "AI cannot learn anything"],
        answer: 0,
        explanation: "AI learns from its examples. Unfair or incomplete examples can teach it unfair patterns.",
      },
    ],
    grownUps: {
      note: "The \"good at\" list matches kinds of tools in the catalog, such as speech recognition models and protein models used in research. The cautions come from the explainers on how language models work and how models use tools such as search.",
      links: [
        { label: "Why fluent answers can still be wrong", href: "/learn/how-language-models-work/#fluent-but-wrong" },
        { label: "How AI models use tools", href: "/learn/how-models-use-tools/" },
        { label: "Speech, vision, and multimodal AI hub", href: "/hubs/speech-vision-and-multimodal/" },
        { label: "AI for science hub", href: "/hubs/science/" },
      ],
    },
  },
  {
    slug: "using-ai-safely",
    number: 5,
    title: "Using AI safely and kindly",
    question: "How can you use AI safely and kindly?",
    icon: "lock",
    minutes: 5,
    bigIdea: "Ask a grown-up before you use an AI app. Keep private things private, check what AI tells you, and never use AI to trick or hurt anyone.",
    sections: [
      {
        heading: "Ask a grown-up first",
        paragraphs: [
          "AI apps and services have rules about who may use them. Some are only for grown-ups. A parent, caregiver, or teacher can help you choose one that fits your age. They can also help you set it up safely.",
        ],
      },
      {
        heading: "Keep private things private",
        paragraphs: [
          "What you type into an AI app may be saved. Some companies use chats to train their AI. Sometimes people who work there can read chats too. So never type these things:",
        ],
        bullets: [
          "Your full name, home address, or school.",
          "Your phone number or passwords.",
          "Photos of you or your friends.",
          "Anything you would not want a stranger to read.",
        ],
      },
      {
        heading: "Check, then trust",
        paragraphs: [
          "AI can be wrong. For homework or anything important, check facts in a trusted book or website. You can also ask your teacher.",
          "Good questions to ask: How do I know this is true? Where did this come from?",
        ],
      },
      {
        heading: "Be kind and honest",
        paragraphs: [
          "AI can make fake pictures, videos, and voices that look and sound real. These are sometimes called **deepfakes**.",
          "Never make fake pictures or voices of real people. Never use AI to bully, trick, or embarrass anyone.",
          "If you see something online that seems fake or makes you uncomfortable, tell a trusted grown-up.",
          "If you use AI for schoolwork, follow your teacher's rules. Say when you used it.",
        ],
      },
    ],
    tryThis: {
      title: "Make a family AI plan",
      steps: [
        "With a grown-up, write three rules for using AI at home.",
        "Here is an example: \"We ask before trying a new AI app.\"",
        "Put your plan somewhere you will see it.",
      ],
    },
    remember: [
      "Ask a grown-up before using an AI app.",
      "Never share private information like your address, school, or passwords.",
      "Use AI kindly and honestly, and tell a grown-up if something online upsets you.",
    ],
    quiz: [
      {
        prompt: "A chatbot asks for your home address. What do you do?",
        choices: ["Type it in", "Don't share it, and tell a grown-up", "Share only your street name"],
        answer: 1,
        explanation: "Your address is private. Keep it to yourself and tell a grown-up.",
      },
      {
        prompt: "What is a deepfake?",
        choices: ["A fake picture, video, or voice made to look real", "A very deep swimming pool", "A kind of fish"],
        answer: 0,
        explanation: "Deepfakes are made with AI to look or sound real, even though they are not.",
      },
      {
        prompt: "You used AI to help brainstorm a story for school. What is the honest thing to do?",
        choices: ["Follow your teacher's rules and say you used AI", "Hide it", "Say you made everything alone"],
        answer: 0,
        explanation: "Being honest about using AI is part of using it well.",
      },
    ],
    grownUps: {
      note: "Data use differs by product and settings: consumer chat apps often train on chats unless you opt out, and providers' staff may read some chats. Check each service's terms for its minimum age before a child uses it; for example, Google's Gemini API terms require users to be 18 or older. There is no single reliable test for AI-made images, which is why the lesson stresses asking and checking.",
      links: [
        { label: "What happens to what you type into an AI service", href: "/learn/ai-and-your-data/" },
        { label: "Labels, watermarks, and content credentials", href: "/learn/ai-content-provenance/" },
        { label: "Google in the catalog (Gemini API terms)", href: "/companies/google/" },
      ],
    },
  },
  {
    slug: "keeping-ai-safe",
    number: 6,
    title: "How do people keep AI safe?",
    question: "Who keeps AI safe, and how?",
    icon: "shield",
    minutes: 4,
    bigIdea: "Companies, scientists, and the government test AI to find problems before people get hurt. They also write rules for how AI is built and used.",
    sections: [
      {
        heading: "Testing, testing",
        paragraphs: [
          "Before a new AI is shared, the people who made it often test it. Some testers try hard to make the AI misbehave, on purpose, so the problems can be fixed. This is called **red teaming**.",
          "Some companies publish reports about how they built and tested their AI. These reports are called system cards or model cards.",
        ],
      },
      {
        heading: "Looking for big dangers",
        paragraphs: [
          "Testers check whether an AI could help someone do something very harmful, like break into computers. Some companies have written plans for what they will do if an AI gets too risky in ways like this.",
          "A government science agency called NIST also tests some AI systems. It looks for risks to the country's safety, like help with computer attacks.",
        ],
      },
      {
        heading: "Rules for AI",
        paragraphs: [
          "Governments make laws and rules about AI. Companies also write rules for how their AI may be used. These rules often list harmful uses that are not allowed.",
        ],
      },
      {
        heading: "You can help too",
        paragraphs: ["You help keep AI safe when you ask questions, report problems to a grown-up, and use AI kindly."],
      },
    ],
    tryThis: {
      title: "Be a red teamer, on paper",
      steps: [
        "Pretend you are testing a robot helper for a school.",
        "Write down three ways it could go wrong, like giving a wrong answer.",
        "For each one, write a rule that would help.",
      ],
    },
    remember: [
      "People test AI to find problems before they cause harm.",
      "Some testers try to make AI misbehave on purpose so problems get fixed.",
      "Companies and governments write rules for AI.",
    ],
    quiz: [
      {
        prompt: "What is red teaming?",
        choices: ["Testers trying on purpose to make AI misbehave so problems get fixed", "Painting computers red", "A soccer team"],
        answer: 0,
        explanation: "Red teamers look for problems on purpose, so the problems can be fixed before people get hurt.",
      },
      {
        prompt: "Which U.S. government agency tests some AI systems for safety risks?",
        choices: ["NIST, a science agency", "The National Park Service", "The Postal Service"],
        answer: 0,
        explanation: "NIST runs a center that tests some AI systems for risks such as help with computer attacks.",
      },
      {
        prompt: "How can you help keep AI safe?",
        choices: ["Tell a grown-up about problems and use AI kindly", "Share your password with the AI", "Believe everything AI says"],
        answer: 0,
        explanation: "Asking questions, reporting problems, and using AI kindly all help.",
      },
    ],
    grownUps: {
      note: "Red teaming, system cards, dangerous-capability evaluations, and frontier safety frameworks are explained in the explainer below. NIST's center page describes voluntary agreements with developers and evaluations focused on demonstrable risks such as cybersecurity, biosecurity, and chemical weapons. These are developers' and agencies' own accounts; USASI does not judge whether any test is adequate.",
      links: [
        { label: "How AI developers test models for safety", href: "/learn/safety-testing-and-frameworks/" },
        { label: "AI safety, security, and trust hub", href: "/hubs/safety-and-security/" },
        { label: "NIST in the catalog", href: "/companies/nist/" },
        { label: "U.S. AI policy tracker", href: "/policy/" },
      ],
    },
  },
  {
    slug: "ai-and-your-future",
    number: 7,
    title: "AI and your future",
    question: "What jobs work with AI, and how can you start learning?",
    icon: "compass",
    minutes: 4,
    bigIdea: "Lots of different jobs work with AI, not just coding. Reading, math, curiosity, and kindness all help.",
    sections: [
      {
        heading: "Many kinds of AI jobs",
        paragraphs: ["People with many different skills work with AI. For example:"],
        bullets: [
          "Scientists who invent new kinds of AI.",
          "Engineers who build apps, chips, and computers.",
          "Electricians and technicians who keep giant computer buildings, called data centers, running.",
          "Designers who make AI tools easy to use.",
          "Lawyers and policy experts who help write rules for AI.",
          "Testers who look for problems and help keep AI safe.",
        ],
      },
      {
        heading: "Skills that help",
        paragraphs: ["You can start building these skills now:"],
        bullets: [
          "Reading and writing clearly.",
          "Math, especially patterns and numbers.",
          "Asking good questions and checking answers.",
          "Working with others and being kind.",
          "Coding, if you like building things.",
        ],
      },
      {
        heading: "Start now",
        paragraphs: [
          "You don't need to wait to learn about AI. Ask questions, read, build things, and talk with grown-ups about what you notice. You get to decide how you use AI.",
        ],
      },
    ],
    tryThis: {
      title: "Dream job card",
      steps: [
        "Draw a picture of a job you would like that uses AI.",
        "Write one way AI might help in that job.",
        "Write one rule you would follow to use AI well.",
      ],
    },
    remember: [
      "Many different jobs work with AI.",
      "Reading, math, curiosity, and kindness all help.",
      "You can start learning now by asking good questions.",
    ],
    quiz: [
      {
        prompt: "Which of these jobs can involve AI?",
        choices: ["Only computer coders", "Scientists, electricians, designers, lawyers, and more", "Nobody works with AI"],
        answer: 1,
        explanation: "AI work needs people with many different skills, not only coders.",
      },
      {
        prompt: "What is a data center?",
        choices: ["A big building full of computers", "A library for numbers only", "A video game"],
        answer: 0,
        explanation: "Data centers are buildings full of computers. Many AI systems run in them.",
      },
      {
        prompt: "Which habit helps with AI jobs?",
        choices: ["Asking good questions and checking answers", "Never asking questions", "Guessing without checking"],
        answer: 0,
        explanation: "Asking good questions and checking answers help in many AI jobs.",
      },
    ],
    grownUps: {
      note: "The roles listed come from the careers explainer, which draws on Department of Labor occupational guides and employer postings, and from the Jobs page's tracks. The explainer does not discuss pay or hiring outlook, and neither does this lesson.",
      links: [
        { label: "Careers in AI", href: "/learn/careers-in-ai/" },
        { label: "Internships and early-career roles", href: "/jobs/?track=early-career" },
        { label: "Chips, cloud, and compute hub", href: "/hubs/chips-and-compute/" },
      ],
    },
  },
];

export type KidWord = { id: string; term: string; meaning: string; lesson?: string };

/** Kid-friendly word list, linked from lessons as /kids/words/#id. */
export const KID_WORDS: KidWord[] = [
  { id: "ai", term: "AI (artificial intelligence)", meaning: "A computer program that learns from examples. Then it can make guesses, suggestions, and choices.", lesson: "what-is-ai" },
  { id: "bias", term: "Bias", meaning: "When AI treats some people or things unfairly. It can happen when the AI learned from unfair or incomplete examples.", lesson: "what-ai-can-and-cannot-do" },
  { id: "chatbot", term: "Chatbot", meaning: "An AI app you type or talk to. It answers you in words.", lesson: "how-ai-learns" },
  { id: "data", term: "Data", meaning: "Information, like words, numbers, pictures, and sounds." },
  { id: "data-center", term: "Data center", meaning: "A big building full of computers. Many AI systems and websites run in data centers.", lesson: "ai-and-your-future" },
  { id: "deepfake", term: "Deepfake", meaning: "A fake picture, video, or voice made with AI to look or sound real.", lesson: "using-ai-safely" },
  { id: "fact-check", term: "Fact-check", meaning: "Making sure something is true by checking a trusted source, like a good book or website.", lesson: "using-ai-safely" },
  { id: "made-up-answer", term: "Made-up answer", meaning: "When an AI gives an answer that sounds real but is not true. Grown-ups sometimes call this a hallucination.", lesson: "how-ai-learns" },
  { id: "model", term: "Model", meaning: "What an AI learned during training, saved as a giant list of numbers.", lesson: "how-ai-learns" },
  { id: "nist", term: "NIST", meaning: "A U.S. government science agency. It tests some AI systems for safety risks.", lesson: "keeping-ai-safe" },
  { id: "pattern", term: "Pattern", meaning: "Something that repeats or follows a rule, like the stripes on a zebra or the days of the week.", lesson: "what-is-ai" },
  { id: "personal-information", term: "Personal information", meaning: "Facts about you, like your name, address, school, phone number, or passwords. Keep it private.", lesson: "using-ai-safely" },
  { id: "prediction", term: "Prediction", meaning: "A guess about what will happen or what comes next.", lesson: "what-is-ai" },
  { id: "prompt", term: "Prompt", meaning: "The question or instructions you give to an AI." },
  { id: "red-teaming", term: "Red teaming", meaning: "Testing an AI by trying, on purpose, to make it misbehave, so the problems can be fixed.", lesson: "keeping-ai-safe" },
  { id: "robot", term: "Robot", meaning: "A machine that can move and do jobs in the real world. Some robots use AI." },
  { id: "super-intelligence", term: "Super Intelligence (SI)", meaning: "The name U.S. government agencies use for AI since September 2026. Some people also use \"superintelligence\" for a possible future AI that is far smarter than people at almost everything.", lesson: "what-is-super-intelligence" },
  { id: "training", term: "Training", meaning: "When an AI practices on lots of examples to get better.", lesson: "how-ai-learns" },
];

export const kidLesson = (slug: string) => KID_LESSONS.find((l) => l.slug === slug);
export const kidNeighbors = (slug: string) => {
  const i = KID_LESSONS.findIndex((l) => l.slug === slug);
  return { prev: i > 0 ? KID_LESSONS[i - 1] : undefined, next: i >= 0 && i < KID_LESSONS.length - 1 ? KID_LESSONS[i + 1] : undefined };
};

/** All kid-facing sentences in a lesson (not the grown-ups note), for readability checks. */
export function kidText(l: KidLesson): string[] {
  return [
    l.bigIdea,
    ...l.sections.flatMap((s) => [...s.paragraphs, ...(s.bullets ?? [])]),
    ...l.tryThis.steps,
    ...l.remember,
    ...l.quiz.flatMap((q) => [q.prompt, ...q.choices, q.explanation]),
  ];
}
