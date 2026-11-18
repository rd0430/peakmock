const SEED_TESTS = [
  // ================= IELTS READING =================
  {
    id: "ielts-r-p1-01",
    exam: "IELTS",
    section: "Reading",
    part: "Passage 1",
    title: "The Architecture of Roman Aqueducts",
    durationMinutes: 20,
    passage: `The engineering prowess of ancient Rome is nowhere more evident than in its extensive network of aqueducts. Designed to transport fresh water from distant springs and mountain streams into densely populated urban centers, these structures relied almost exclusively on gravity rather than mechanical pumping. Roman surveyors, known as libratores, utilized precision instruments such as the chorobates—a twenty-foot wooden beam fitted with plumb lines and a water trough—to maintain a remarkably consistent downward gradient, often dropping by as little as thirty centimeters per kilometer over distances exceeding eighty kilometers.

Contrary to popular belief, the iconic stone arches that span valleys represented only a minor fraction of the total aqueduct system. Roughly eighty percent of the conduits were constructed beneath the earth's surface as stone-lined trenches or rock-cut tunnels. Subterranean routing insulated the water supply from extreme seasonal temperatures, prevented evaporation, and safeguarded vital civic infrastructure against sabotage during military conflicts. Periodic vertical shafts, called putei, were excavated at regular intervals along the underground channels to allow maintenance crews to descend, clear mineral deposits, and repair structural fractures.

Upon reaching the city perimeter, water entered a primary distribution reservoir termed the castellum divisorium. From this central basin, lead or terracotta pipes channeled water into three distinct municipal tiers: public fountains and basins, imperial bathhouses, and private residences belonging to wealthy citizens who paid substantial licensing fees. During periods of severe drought, engineers could selectively restrict flow to private estates while preserving access to public fountains, ensuring civic stability and public hygiene across all social strata.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. What primary physical principle enabled Roman aqueducts to transport water over long distances?",
        options: [
          "A. Hydraulic piston pumps stationed at intervals",
          "B. Continuous gravitational slope",
          "C. Pressurized bronze siphons",
          "D. Wind-driven water wheels"
        ],
        answer: "B",
        explanation: "The passage states that aqueducts 'relied almost exclusively on gravity rather than mechanical pumping'."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. Why were the majority of Roman aqueduct channels built underground?",
        options: [
          "A. Stone arches were too expensive to quarry",
          "B. Underground tunnels required no periodic maintenance",
          "C. Subterranean channels regulated temperature, reduced evaporation, and protected against attacks",
          "D. Roman law prohibited above-ground construction near farmland"
        ],
        answer: "C",
        explanation: "Paragraph 2 specifies insulation from extreme temperatures, prevention of evaporation, and protection against military sabotage."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "3. What was the function of 'putei' along the subterranean conduits?",
        options: [
          "A. Collecting rainwater from surface runoff",
          "B. Providing vertical access for inspection and cleaning",
          "C. Measuring water fees for private homeowners",
          "D. Filtering sediment before water entered the city"
        ],
        answer: "B",
        explanation: "Putei were vertical shafts allowing maintenance crews to descend, clear deposits, and repair fractures."
      },
      {
        id: "q4",
        type: "tfng",
        prompt: "4. True / False / Not Given: Public fountains were the first water tier to be shut off during droughts.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "FALSE",
        explanation: "Engineers restricted flow to private estates while preserving access to public fountains."
      },
      {
        id: "q5",
        type: "tfng",
        prompt: "5. True / False / Not Given: The chorobates used a water trough to verify horizontal leveling.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "Paragraph 1 explicitly describes the chorobates as 'fitted with plumb lines and a water trough'."
      }
    ]
  },
  {
    id: "ielts-r-p2-01",
    exam: "IELTS",
    section: "Reading",
    part: "Passage 2",
    title: "Mycorrhizal Networks and Forest Resource Sharing",
    durationMinutes: 20,
    passage: `Beneath the forest floor lies an intricate biological web composed of fungal hyphae intertwined with the root systems of vascular plants. Known as common mycorrhizal networks (CMNs), these symbiotic associations facilitate the bidirectional exchange of essential nutrients. In exchange for carbon-rich sugars synthesized by trees during photosynthesis, mycorrhizal fungi expand the effective surface area of plant roots by orders of magnitude, extracting scarce phosphorus, nitrogen, and trace minerals from tightly bound soil particles.

Recent isotopic tracing experiments conducted in temperate mixed forests have demonstrated that mature canopy trees—frequently termed 'hub trees'—transfer measurable quantities of carbon and defense-signaling compounds to shaded understory seedlings via shared fungal filaments. When a Douglas fir experiences defoliation by herbivorous insects, biochemical stress signals propagate through the mycorrhizal network within twenty-four hours, prompting neighboring pine trees to upregulate defensive resin production prior to direct insect contact.

Nevertheless, plant ecologists caution against overly anthropomorphic interpretations of cooperative forest altruism. Nutrient flux within CMNs is governed largely by source-sink concentration gradients and fungal resource allocation strategies rather than conscious botanical generosity. Fungi themselves retain substantial portions of translocated carbon and may preferentially direct phosphorus toward hosts offering higher carbohydrate returns, illustrating a dynamic equilibrium between mutualism and biological market competition.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. What do plants supply to mycorrhizal fungi in this symbiotic relationship?",
        options: [
          "A. Soil phosphorus and nitrogen",
          "B. Photosynthetically produced sugars",
          "C. Defensive insect resins",
          "D. Underground water reserves"
        ],
        answer: "B",
        explanation: "Paragraph 1 notes fungi receive 'carbon-rich sugars synthesized by trees during photosynthesis'."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. How do neighboring trees respond when a hub tree suffers insect attack?",
        options: [
          "A. They shed their leaves prematurely",
          "B. They sever their fungal root connections",
          "C. They increase defensive resin synthesis after receiving biochemical signals",
          "D. They transfer nitrogen back to the damaged tree"
        ],
        answer: "C",
        explanation: "Stress signals prompt neighboring pines 'to upregulate defensive resin production prior to direct insect contact'."
      },
      {
        id: "q3",
        type: "tfng",
        prompt: "3. True / False / Not Given: All plant ecologists agree that trees consciously choose which seedlings to support.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "FALSE",
        explanation: "Paragraph 3 states ecologists caution against anthropomorphic interpretations and attribute transfer to source-sink gradients and fungal strategies."
      },
      {
        id: "q4",
        type: "tfng",
        prompt: "4. True / False / Not Given: Mycorrhizal fungi can favor host plants that provide greater amounts of carbohydrates.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "Fungi 'may preferentially direct phosphorus toward hosts offering higher carbohydrate returns'."
      }
    ]
  },
  {
    id: "ielts-r-p3-01",
    exam: "IELTS",
    section: "Reading",
    part: "Passage 3",
    title: "Cognitive Load Theory and Instructional Architecture",
    durationMinutes: 20,
    passage: `Formulated by educational psychologist John Sweller in the late 1980s, Cognitive Load Theory (CLT) posits that instructional design must align with the architectural constraints of human working memory. Unlike long-term memory, which possesses virtually limitless storage capacity organized into complex cognitive schemas, working memory is severely bottlenecked, capable of processing only a handful of novel information elements simultaneously for brief durations.

Sweller categorized cognitive load into three additive components: intrinsic, extraneous, and germane. Intrinsic load reflects the inherent conceptual complexity of the subject matter and the degree of element interactivity required to comprehend it; solving a multi-variable differential equation inherently imposes higher intrinsic load than memorizing isolated vocabulary items. Extraneous load, conversely, arises from suboptimal instructional presentation—such as splitting explanatory diagrams across separate pages or embedding decorative animations that divert attentional resources without aiding schema acquisition.

Effective pedagogy seeks to minimize extraneous load so that finite working memory bandwidth remains available for germane load—the deliberate cognitive effort devoted to constructing and automating schemas in long-term memory. Paradoxically, empirical studies reveal an 'expertise reversal effect': instructional scaffolds such as worked examples substantially accelerate learning among novices, yet the very same guidance impedes advanced learners by forcing them to cross-reference redundant information against already automated mental schemas.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. According to CLT, what distinguishes long-term memory from working memory?",
        options: [
          "A. Long-term memory processes novel elements faster than working memory",
          "B. Long-term memory has vast storage structured into schemas, whereas working memory is strictly limited",
          "C. Working memory retains information permanently without rehearsal",
          "D. Working memory is unaffected by instructional design"
        ],
        answer: "B",
        explanation: "Paragraph 1 contrasts virtually limitless schema-based long-term memory with severely bottlenecked working memory."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. Which of the following is an example of 'extraneous load'?",
        options: [
          "A. The mathematical complexity of calculus",
          "B. Automating a problem-solving schema",
          "C. Distracting visual animations unrelated to the core concept",
          "D. High element interactivity in organic chemistry"
        ],
        answer: "C",
        explanation: "Decorative animations that divert attentional resources without aiding schema acquisition exemplify extraneous load."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "3. What does the 'expertise reversal effect' demonstrate?",
        options: [
          "A. Novices learn best without any worked examples",
          "B. Instructional scaffolds helpful to beginners can hinder experienced learners",
          "C. Intrinsic load disappears once a learner reaches mastery",
          "D. Working memory capacity doubles with age"
        ],
        answer: "B",
        explanation: "Worked examples accelerate novice learning but impede advanced learners due to redundant cross-referencing."
      },
      {
        id: "q4",
        type: "tfng",
        prompt: "4. True / False / Not Given: Reducing extraneous load frees cognitive capacity for schema construction.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "Minimizing extraneous load leaves finite working memory bandwidth available for germane load (schema construction)."
      }
    ]
  },

  // ================= IELTS LISTENING =================
  {
    id: "ielts-l-p1-01",
    exam: "IELTS",
    section: "Listening",
    part: "Part 1",
    title: "University Accommodation Office Inquiry",
    durationMinutes: 8,
    audioUrl: "",
    transcript: `Officer: Good morning, Northbridge University Housing Office. How can I assist you?
Student: Hello, I'm an incoming postgraduate student looking for on-campus studio accommodation starting this September. My name is Liam Vance.
Officer: Welcome, Liam. Let me check availability in St. Jude's Hall. We currently have two single studios left on the third floor. The weekly rent is £185, which includes electricity, heating, and high-speed fiber internet.
Student: Does that include a meal plan, or are the studios self-catered?
Officer: They are completely self-catered with a private kitchenette. However, you can purchase a dining hall pass separately for £45 per week. Also, please note there is a refundable security deposit of £350 due upon contract signing.
Student: That sounds reasonable. How close is St. Jude's Hall to the Engineering Faculty?
Officer: It's roughly a twelve-minute walk across the botanical courtyard, or four minutes by bicycle—we have covered cycle storage right behind the reception desk.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. What is the weekly rent for a studio in St. Jude's Hall?",
        options: ["A. £145", "B. £185", "C. £225", "D. £350"],
        answer: "B",
        explanation: "The officer states the weekly rent is £185 including utilities and internet."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. How much is the refundable security deposit?",
        options: ["A. £45", "B. £185", "C. £350", "D. £500"],
        answer: "C",
        explanation: "A refundable security deposit of £350 is due upon contract signing."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "3. How long does it take to walk from St. Jude's Hall to the Engineering Faculty?",
        options: ["A. 4 minutes", "B. 8 minutes", "C. 12 minutes", "D. 20 minutes"],
        answer: "C",
        explanation: "It is roughly a twelve-minute walk across the botanical courtyard."
      }
    ]
  },
  {
    id: "ielts-l-p2-01",
    exam: "IELTS",
    section: "Listening",
    part: "Part 2",
    title: "Orientation to the Maritime Heritage Museum",
    durationMinutes: 8,
    audioUrl: "",
    transcript: `Good afternoon everyone, and welcome to the Harborview Maritime Heritage Museum. Before you begin exploring, I'd like to outline our floor layout and today's scheduled demonstrations. On the ground floor, directly past the ticket atrium, you will find the Shipbuilding Gallery, which houses original nineteenth-century timber hull models and navigation sextants. Please note that flash photography is strictly prohibited in the Textile and Map Wing on the second floor due to light-sensitive parchment charts. At 2:30 PM, our master riggers will host a live knot-tying and sail-mending workshop on the Outdoor Pier. Finally, lockers for large backpacks are located beside the East Courtyard café and require a £1 coin, which is returned when you retrieve your items.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. Why is flash photography banned on the second floor?",
        options: [
          "A. To prevent crowding in narrow corridors",
          "B. Because parchment maps are sensitive to light",
          "C. Due to ongoing restoration scaffolding",
          "D. Because commercial filming is underway"
        ],
        answer: "B",
        explanation: "Light-sensitive parchment charts are housed in the second-floor Textile and Map Wing."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. Where will the 2:30 PM workshop take place?",
        options: [
          "A. The Ticket Atrium",
          "B. The Shipbuilding Gallery",
          "C. The Outdoor Pier",
          "D. The East Courtyard Café"
        ],
        answer: "C",
        explanation: "Master riggers host the live workshop on the Outdoor Pier at 2:30 PM."
      }
    ]
  },
  {
    id: "ielts-l-p3-01",
    exam: "IELTS",
    section: "Listening",
    part: "Part 3",
    title: "Seminar Discussion on Urban Heat Islands",
    durationMinutes: 8,
    audioUrl: "",
    transcript: `Tutor: Maya and Kenji, how is your joint presentation on urban heat island mitigation progressing?
Maya: Quite well, Dr. Foster. We compared surface temperature satellite datasets across four industrial districts before and after installing reflective white roof coatings.
Kenji: The albedo increase reduced afternoon rooftop temperatures by an average of 4.2 degrees Celsius. However, Maya noticed a methodological flaw when we tried to correlate that directly with pedestrian-level air temperature.
Maya: Exactly. Street-level temperatures depend heavily on canyon geometry and anthropogenic waste heat from vehicle traffic, not just roof reflectivity. So we decided to add a second dataset measuring street-tree canopy density to isolate the cooling variables properly.
Tutor: That's a very perceptive adjustment. Make sure you highlight that distinction in your methodology slide.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. By how much did reflective roof coatings lower afternoon rooftop temperatures?",
        options: ["A. 1.8°C", "B. 2.4°C", "C. 4.2°C", "D. 6.0°C"],
        answer: "C",
        explanation: "Kenji notes afternoon rooftop temperatures fell by an average of 4.2 degrees Celsius."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. Why did Maya and Kenji add a dataset on street-tree canopy density?",
        options: [
          "A. Their satellite data for rooftops was corrupted",
          "B. Street-level air temperature is influenced by traffic heat and street geometry",
          "C. Dr. Foster required at least three graphs",
          "D. White roofs proved ineffective in winter"
        ],
        answer: "B",
        explanation: "Street-level temperatures depend on canyon geometry and traffic waste heat, requiring canopy data to isolate variables."
      }
    ]
  },
  {
    id: "ielts-l-p4-01",
    exam: "IELTS",
    section: "Listening",
    part: "Part 4",
    title: "Academic Lecture: Deep-Sea Hydrothermal Vents",
    durationMinutes: 8,
    audioUrl: "",
    transcript: `In today's marine geochemistry lecture, we examine hydrothermal vent ecosystems along mid-ocean ridges. Discovered in 1977 near the Galapagos Rift at depths exceeding 2,500 meters, these vents discharge superheated mineral-laden water reaching up to 400 degrees Celsius—prevented from boiling only by immense hydrostatic pressure. Remarkably, entire biological communities thrive around these vents without sunlight. Instead of photosynthesis, primary production relies on chemosynthesis: specialized bacteria oxidize hydrogen sulfide dissolved in the vent fluid to synthesize organic carbon compounds. Giant tubeworms, Riftia pachyptila, lack a digestive tract entirely and depend on symbiotic chemosynthetic bacteria housed within an internal organ called the trophosome.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "1. What prevents 400°C vent water from boiling on the ocean floor?",
        options: [
          "A. High salinity levels",
          "B. Extreme hydrostatic pressure",
          "C. Rapid mixing with glacial currents",
          "D. Dissolved hydrogen sulfide"
        ],
        answer: "B",
        explanation: "The lecture states the water is prevented from boiling by immense hydrostatic pressure."
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "2. How do giant tubeworms obtain nutrition without a digestive tract?",
        options: [
          "A. By absorbing sunlight filtered through clear water",
          "B. By filtering microscopic plankton",
          "C. Through symbiotic chemosynthetic bacteria inside their trophosome",
          "D. By consuming mineral precipitates directly"
        ],
        answer: "C",
        explanation: "They depend on symbiotic chemosynthetic bacteria housed within the trophosome."
      }
    ]
  },

  // ================= IELTS WRITING =================
  {
    id: "ielts-w-t1-01",
    exam: "IELTS",
    section: "Writing",
    part: "Task 1",
    title: "Academic Task 1 — Global Renewable Electricity Generation (2010–2025)",
    durationMinutes: 20,
    minWords: 150,
    prompt: `You should spend about 20 minutes on this task.

The summary table below illustrates the share of total electricity generated from four renewable energy sources (Hydropower, Wind, Solar PV, and Bioenergy) across OECD countries between 2010 and 2025.

Data Summary:
- Hydropower: 2010 (13.2%) -> 2015 (12.8%) -> 2020 (13.0%) -> 2025 (12.6%)
- Wind Power: 2010 (2.8%) -> 2015 (5.6%) -> 2020 (9.4%) -> 2025 (14.8%)
- Solar PV: 2010 (0.4%) -> 2015 (2.1%) -> 2020 (5.3%) -> 2025 (11.2%)
- Bioenergy: 2010 (2.1%) -> 2015 (2.9%) -> 2020 (3.4%) -> 2025 (3.7%)

Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.`
  },
  {
    id: "ielts-w-t2-01",
    exam: "IELTS",
    section: "Writing",
    part: "Task 2",
    title: "Academic Task 2 — Automation, AI, and Higher Education Curricula",
    durationMinutes: 40,
    minWords: 250,
    prompt: `You should spend about 40 minutes on this task.

Write about the following topic:

As artificial intelligence and automation increasingly perform routine analytical and technical tasks, some educators argue that universities should shift their focus away from specialized technical training toward critical thinking, ethics, and interdisciplinary problem-solving.

To what extent do you agree or disagree with this view?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.`
  },

  // ================= IELTS SPEAKING =================
  {
    id: "ielts-s-p1-01",
    exam: "IELTS",
    section: "Speaking",
    part: "Part 1",
    title: "Part 1 — Introduction & Everyday Academic Habits",
    durationMinutes: 5,
    prompt: `Examiner Questions (Answer all 3 questions clearly and naturally):
1. Do you prefer studying in a quiet library or in a place with some background noise? Why?
2. How has the way you organize your daily schedule changed over the past few years?
3. What kind of technological tool or application do you rely on most for learning?`
  },
  {
    id: "ielts-s-p2-01",
    exam: "IELTS",
    section: "Speaking",
    part: "Part 2",
    title: "Part 2 — Long Turn Cue Card (1 Min Prep + 2 Min Talk)",
    durationMinutes: 3,
    prompt: `Describe a complex problem you solved or a challenging project you completed recently.

You should say:
- what the problem or project was
- how you approached planning and executing the solution
- what obstacles you encountered along the way
and explain what you learned from this experience.`
  },
  {
    id: "ielts-s-p3-01",
    exam: "IELTS",
    section: "Speaking",
    part: "Part 3",
    title: "Part 3 — Abstract Discussion on Innovation & Society",
    durationMinutes: 5,
    prompt: `Examiner Two-Way Discussion Questions:
1. Why do some societies adopt technological innovations much more rapidly than others?
2. Should governments regulate emerging technologies before their societal impacts are fully understood, or does regulation stifle progress?
3. How might the definition of 'expertise' change in a world where information is instantaneously accessible?`
  },

  // ================= DIGITAL SAT =================
  {
    id: "sat-rw-m1-01",
    exam: "SAT",
    section: "Reading & Writing",
    part: "Module 1",
    title: "Digital SAT — Reading & Writing Module 1",
    durationMinutes: 32,
    questions: [
      {
        id: "sat-rw-1",
        type: "mcq",
        passage: `In 1929, astronomer Edwin Hubble published measurements demonstrating a linear correlation between the distances of galaxies and their recessional velocities. Far from merely cataloguing stellar positions, Hubble's empirical findings _______ the prevailing cosmological consensus of a static, eternal universe, establishing observational foundations for modern expansion models.`,
        prompt: "Which choice completes the text with the most logical and precise word or phrase?",
        options: [
          "A. corroborated",
          "B. upended",
          "C. trivialized",
          "D. foreshadowed"
        ],
        answer: "B",
        explanation: "'Upended' accurately conveys that Hubble's findings overturned the existing belief in a static universe."
      },
      {
        id: "sat-rw-2",
        type: "mcq",
        passage: `Paleoclimatologists reconstructing Holocene monsoon variability often analyze oxygen isotope ratios (δ18O) preserved within stalagmites. Because calcite precipitation inside limestone caves records the isotopic signature of dripping rainwater over millennia, stalagmites provide continuous, high-resolution terrestrial archives that complement marine sediment cores.`,
        prompt: "Which choice best states the main purpose of the text?",
        options: [
          "A. To argue that marine sediment cores are less accurate than cave formations",
          "B. To explain how stalagmites serve as long-term records of historical rainfall patterns",
          "C. To describe the chemical erosion of limestone caves during the Holocene",
          "D. To compare oxygen isotopes with carbon dating techniques"
        ],
        answer: "B",
        explanation: "The passage explains why stalagmites preserve rainwater isotopic signatures and act as continuous terrestrial climate archives."
      },
      {
        id: "sat-rw-3",
        type: "mcq",
        passage: `While many nineteenth-century landscape painters idealized untouched wilderness, Winslow Homer frequently depicted the tense intersection between human labor and volatile coastal weather. In his late seascapes from Prouts Neck, Maine, crashing surf and darkened skies do not merely frame human figures; rather, they assert nature's formidable autonomy.`,
        prompt: "Based on the text, how does Homer's approach differ from that of many nineteenth-century landscape painters?",
        options: [
          "A. Homer avoided painting coastal regions in favor of urban industry",
          "B. Homer emphasized nature's raw power in relation to human effort rather than presenting an idealized scene",
          "C. Homer excluded all traces of human presence from his seascapes",
          "D. Homer relied exclusively on monochromatic palettes"
        ],
        answer: "B",
        explanation: "Unlike contemporaries who idealized wilderness, Homer portrayed the tense intersection of human labor and nature's formidable power."
      },
      {
        id: "sat-rw-4",
        type: "mcq",
        passage: `Dr. Elena Vance's team investigated whether urban songbirds adjust vocal frequencies to overcome low-frequency traffic noise. Recording white-crowned sparrows across twenty metropolitan parks, the researchers found that birds in high-decibel corridors consistently shifted their minimum song frequency upward by 350 Hz compared to conspecifics in quiet suburban reserves.`,
        prompt: "Which finding, if true, would most directly support the researchers' hypothesis that traffic noise drives the frequency shift?",
        options: [
          "A. Sparrows in noisy parks have larger wingspans than suburban sparrows",
          "B. When temporary road closures reduced traffic noise in a metropolitan park, resident sparrows lowered their minimum song frequencies within two weeks",
          "C. Suburban reserves contain fewer insect species than metropolitan parks",
          "D. Female sparrows prefer lower-frequency songs regardless of ambient noise"
        ],
        answer: "B",
        explanation: "Observing birds lower their song frequency once traffic noise is removed isolates ambient noise as the causal driver."
      },
      {
        id: "sat-rw-5",
        type: "mcq",
        passage: `Quantum error correction requires encoding logical qubits across multiple physical qubits so that local decoherence can be detected without collapsing the computational state. Consequently, scaling fault-tolerant quantum processors _______ substantial overhead in physical qubit counts alongside low-latency classical control electronics.`,
        prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
        options: [
          "A. necessitate",
          "B. necessitates",
          "C. have necessitated",
          "D. are necessitating"
        ],
        answer: "B",
        explanation: "The singular gerund subject 'scaling fault-tolerant quantum processors' requires the singular verb 'necessitates'."
      }
    ]
  },
  {
    id: "sat-rw-m2-01",
    exam: "SAT",
    section: "Reading & Writing",
    part: "Module 2",
    title: "Digital SAT — Reading & Writing Module 2 (Adaptive Upper)",
    durationMinutes: 32,
    questions: [
      {
        id: "sat-rw2-1",
        type: "mcq",
        passage: `Economists studying sovereign debt restructuring have noted that collective action clauses (CACs) streamline negotiations by binding dissenting minority bondholders to terms approved by a supermajority. Without CACs, opportunistic 'holdout' creditors can litigate for full principal repayment, thereby _______ timely debt relief for distressed nations.`,
        prompt: "Which choice completes the text with the most logical and precise word or phrase?",
        options: [
          "A. expediting",
          "B. impeding",
          "C. subsidizing",
          "D. ratifying"
        ],
        answer: "B",
        explanation: "Holdout litigation obstructs or slows down ('impeding') timely debt restructuring."
      },
      {
        id: "sat-rw2-2",
        type: "mcq",
        passage: `Text 1: Literary historian Marcus Thorne argues that modernist poetry's fragmentation mirrored the psychological dislocation caused by mechanized warfare in the early twentieth century.\nText 2: Critic Clara Lin contends that while war intensified modernist experimentation, formal fragmentation had already crystallized prior to 1914 through poets' engagement with urban journalism, cinema, and non-Western visual art.`,
        prompt: "How would Clara Lin (Text 2) most likely respond to Marcus Thorne's claim (Text 1)?",
        options: [
          "A. By denying that mechanized warfare had any influence on twentieth-century literature",
          "B. By arguing that modernist fragmentation originated in pre-war aesthetic and media developments rather than solely wartime trauma",
          "C. By asserting that modernist poets rejected cinema and urban journalism",
          "D. By agreeing that fragmentation appeared only after 1918"
        ],
        answer: "B",
        explanation: "Lin argues fragmentation had already crystallized before 1914 due to cinema, journalism, and visual art."
      },
      {
        id: "sat-rw2-3",
        type: "mcq",
        passage: `Synthesizing ammonia via the Haber-Bosch process accounts for roughly 1.4 percent of global carbon dioxide emissions because it relies on steam methane reforming for hydrogen feedstock. Researchers are therefore developing electrocatalytic nitrogen reduction reactors powered by renewable electricity _______ zero-carbon fertilizer production at ambient pressures.`,
        prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
        options: [
          "A. to enable",
          "B. enabled",
          "C. enables",
          "D. having enabled"
        ],
        answer: "A",
        explanation: "The infinitive 'to enable' properly expresses the purpose of developing the reactors."
      }
    ]
  },
  {
    id: "sat-math-m1-01",
    exam: "SAT",
    section: "Math",
    part: "Module 1",
    title: "Digital SAT — Math Module 1",
    durationMinutes: 35,
    questions: [
      {
        id: "sat-m-1",
        type: "mcq",
        passage: "Linear Systems & Algebra",
        prompt: "If 3x + 2y = 19 and 2x - y = 8, what is the value of x + y?",
        options: [
          "A. 5",
          "B. 7",
          "C. 9",
          "D. 11"
        ],
        answer: "B",
        explanation: "From 2x - y = 8, y = 2x - 8. Substituting into 3x + 2(2x - 8) = 19 gives 7x - 16 = 19 -> 7x = 35 -> x = 5, y = 2. Thus x + y = 7."
      },
      {
        id: "sat-m-2",
        type: "mcq",
        passage: "Quadratic Functions",
        prompt: "The function f(x) = 2(x - 4)^2 - 18 defines a parabola in the xy-plane. What is the positive x-intercept of the graph of y = f(x)?",
        options: [
          "A. 1",
          "B. 4",
          "C. 7",
          "D. 9"
        ],
        answer: "C",
        explanation: "Set 2(x - 4)^2 - 18 = 0 -> (x - 4)^2 = 9 -> x - 4 = ±3 -> x = 7 or x = 1. The positive x-intercept is 7."
      },
      {
        id: "sat-m-3",
        type: "mcq",
        passage: "Exponential Growth",
        prompt: "A bacterial culture triples in population every 4 hours. If the initial population is 250, which equation models the population P after t hours?",
        options: [
          "A. P = 250(3)^(4t)",
          "B. P = 250(3)^(t/4)",
          "C. P = 250(4)^(t/3)",
          "D. P = 750(3)^(t/4)"
        ],
        answer: "B",
        explanation: "Initial amount is 250, growth factor is 3, and one compounding period occurs every 4 hours, giving exponent t/4."
      },
      {
        id: "sat-m-4",
        type: "mcq",
        passage: "Geometry & Trigonometry",
        prompt: "In right triangle ABC, angle C is 90° and sin(A) = 5/13. What is the value of cos(B) + tan(A)?",
        options: [
          "A. 17/156",
          "B. 65/156",
          "C. 125/156",
          "D. 17/12"
        ],
        answer: "C",
        explanation: "Since A and B are complementary, cos(B) = sin(A) = 5/13. With opposite=5, hypotenuse=13, adjacent=12, so tan(A) = 5/12. 5/13 + 5/12 = (60 + 65)/156 = 125/156."
      },
      {
        id: "sat-m-5",
        type: "mcq",
        passage: "Data Analysis & Statistics",
        prompt: "Dataset A consists of {12, 14, 15, 17, 22}. If the value 22 is replaced by 47, which statistic remains unchanged?",
        options: [
          "A. Mean",
          "B. Median",
          "C. Range",
          "D. Standard deviation"
        ],
        answer: "B",
        explanation: "The ordered set has 5 elements; the middle (3rd) element is 15 in both cases, so the median remains 15."
      }
    ]
  },
  {
    id: "sat-math-m2-01",
    exam: "SAT",
    section: "Math",
    part: "Module 2",
    title: "Digital SAT — Math Module 2 (Adaptive Upper)",
    durationMinutes: 35,
    questions: [
      {
        id: "sat-m2-1",
        type: "mcq",
        passage: "Circle Equations",
        prompt: "A circle in the xy-plane has equation x^2 + y^2 - 6x + 8y - 11 = 0. What is the area of this circle?",
        options: [
          "A. 6π",
          "B. 11π",
          "C. 36π",
          "D. 64π"
        ],
        answer: "C",
        explanation: "Completing the square: (x - 3)^2 + (y + 4)^2 = 11 + 9 + 16 = 36. Thus r^2 = 36 and Area = πr^2 = 36π."
      },
      {
        id: "sat-m2-2",
        type: "mcq",
        passage: "Polynomial Remainders",
        prompt: "When polynomial P(x) = x^3 - kx^2 + 4x - 12 is divided by (x - 3), the remainder is 0. What is the value of k?",
        options: [
          "A. 2",
          "B. 3",
          "C. 4",
          "D. 5"
        ],
        answer: "B",
        explanation: "By the Remainder Theorem, P(3) = 27 - 9k + 12 - 12 = 0 -> 27 - 9k = 0 -> k = 3."
      },
      {
        id: "sat-m2-3",
        type: "mcq",
        passage: "Discriminant & Roots",
        prompt: "For what value of c does the quadratic equation 4x^2 - 12x + c = 0 have exactly one real solution?",
        options: [
          "A. 3",
          "B. 6",
          "C. 9",
          "D. 36"
        ],
        answer: "C",
        explanation: "Discriminant b^2 - 4ac = 0 -> (-12)^2 - 4(4)(c) = 0 -> 144 - 16c = 0 -> c = 9."
      }
    ]
  }
];

module.exports = { SEED_TESTS };
