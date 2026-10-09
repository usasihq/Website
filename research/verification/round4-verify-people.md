# Round 4 verification: people-facing explainers (`round4-verify-people`)

Checked on 2026-10-08. I fetched every source today, using curl (`-A "USASI-factcheck/0.3"`) or
WebFetch. I sent no email address, name, or other identifier in any URL, header, or payload. I
used no browser tools and solved or bypassed no bot checks.

- **Blocked to both curl and WebFetch (HTTP 403), so skipped:** help.openai.com and openai.com
  (privacy policy, consumer-privacy, enterprise-privacy, business-data).
- **BLS Occupational Outlook Handbook:** returned 403 to curl. WebFetch loaded it normally, so I
  checked BLS wording through WebFetch's verbatim quotes.
- **FTC Technology Blog:** returned 404 to curl. WebFetch loaded both posts.
- **Ashby postings (Cerebras, Crusoe):** read from the JSON embedded in each posting page.
- **CoreWeave posting:** read from the public Greenhouse boards API record for the same ID
  (4652977006). The official coreweave.com URL resolves to CoreWeave's careers page, which embeds
  that board.

Files checked:

- `content/pages/learn-ai-and-your-data.mdx`
- `content/pages/learn-careers-in-ai.mdx`
- takeaways for both pages in `research/notes/round4-people.md`

After my edits, both files compile with `@mdx-js/mdx` (`ok`). Both use `<h2 id>` headings, have
no Markdown tables, and end with the Sources section. Prose word counts before Sources:

- data page: 1,549, slightly over the brief's 1,500 guideline (about 30 words came from my
  corrections)
- careers page: 1,408

Every external link returned HTTP 200 and showed the page described, except the blocked OpenAI
links above. Internal links point to published records, existing hubs, explainers, or glossary
anchors:

- companies: openai, anthropic, google, microsoft, coreweave
- open: ollama, llama-cpp
- hubs: enterprise-ai, chips-and-compute, evaluation
- learn: hosted-or-local, policy-and-standards-sources, infrastructure-and-energy-claims,
  reading-evaluations
- glossary: hosted-api, self-hosting, accelerator, data-center, evaluation-harness, benchmark
- `/methodology/#jobs` and `/jobs/`

## learn-ai-and-your-data.mdx

### Checked and correct as written (other than the changes below)

- **Anthropic Privacy Policy:**
  - It is effective September 10, 2026 and links a "Previous Version".
  - It does not apply to content processed for customers of business offerings, which customer
    agreements govern.
- **Anthropic Privacy Center, "How long do you store my data?"** (consumer article, dated July 1,
  2026):
  - Deleted chats leave back-end storage within 30 days.
  - Data from users who allow training is kept de-identified for up to 5 years.
  - After an opt-out, data stays in training runs already in progress and in models already
    trained.
- **Anthropic commercial article** (dated August 18, 2026):
  - No training on commercial inputs or outputs by default.
  - Explicitly reported feedback may be used for training.
  - The Primary Owner or an Owner of a Team or Enterprise plan can turn off the thumbs up and down
    buttons ("Rate chats").
- **Claude Help Center, incognito chats:**
  - Incognito chats are not used for training.
  - They are kept for 30 days by default.
  - On Team and Enterprise plans they are included in the organizational data exports available
    to Owners.
- **Gemini Apps Privacy Hub** ("Last updated: September 24, 2026"):
  - A work or school account may have different terms.
  - With Keep Activity on, Google uses your activity to improve its services, including training
    generative AI models.
  - A subset of chats is reviewed by human reviewers.
  - Activity is auto-deleted after 18 months by default.
  - Reviewed chats are disconnected from your account and kept for up to 3 years, even after you
    delete your activity.
  - The hub asks you not to enter confidential information you would not want a reviewer to see.
  - Temporary chats, and chats with Keep Activity off and no feedback sent, are not used for
    training and are kept for 72 hours.
  - Audio, Gemini Live video, and screen shares are not used to improve Google services by
    default.
  - Even with Keep Activity off, Google uses chats to help protect Google, its users, and the
    public, including with help from human reviewers.
  - Feedback sent with Keep Activity off includes the last 24 hours of chats.
- **Google Workspace privacy hub** ("Last updated: October 6, 2026"; the site footer separately
  says "Last updated 2026-10-07 UTC"):
  - The phrases "outside of your domain" and "outside your domain" appear in several statements.
  - The page says this is ambiguous and does not interpret it. That is correct.
- **Microsoft, updated-app activity-history page:**
  - The updated app has been available as of August 18, 2026.
  - Prompts, responses, and file contents "aren't used to train foundation models".
  - "Foundation models" is not defined on the page.
- **Microsoft, older-app FAQ** (the page says it applies only to the older app):
  - It describes training on voice and conversation activity, including uploaded images or files,
    except for excluded or opted-out users.
  - Conversation activity is stored for 18 months by default.
  - "An opt-out of human review is not available" when a Code of Conduct violation is suspected.
- **Microsoft Copilot Chat for work or school:** prompts and responses are logged, and IT admins
  can view them with search and audit tools.
- **OpenAI API "Data controls in the OpenAI platform":**
  - API data is not used for training unless you opt in.
  - Abuse-monitoring logs may contain prompts and responses and are kept for up to 30 days by
    default.
  - Zero Data Retention requires approval.
- **FTC posts:**
  - The January 9, 2024 post is "By Staff in the Office of Technology".
  - The February 13, 2024 post is by staff in the Office of Technology and the Division of Privacy
    and Identity Protection.
  - Both are on the Technology Blog, and both quoted points match.
- **Ollama Privacy Policy** ("Last updated: March 2026"):
  - It does not collect, store, transmit, or have access to content you process locally.
  - It may collect limited device and usage metadata.
- **General information disclaimer:** present in the opening paragraph.
- **Dating:** the providers section is dated "as published on October 8, 2026".
- **Worked example:** Rae is labelled fictional.

### Changes (before → after, source)

1. **Opening paragraph, training:** "Turning training off does not delete anything" → "Turning
   training off is a separate step from deleting chats".
   - No verified source supports "anything".
   - Google's hub says turning off Keep Activity doesn't delete data in other Google services, and
     chats are still kept for 72 hours.
   - Anthropic says data stays in training runs already in progress and in models already trained.
2. **Opening paragraph, temporary chats:** "Temporary or incognito chats skip your history and
   training" → "Temporary or incognito chats are kept out of training".
   - The Gemini hub does not say temporary chats are kept out of history. It says they are
     "retained with your account for 72 hours".
3. **Anthropic, privacy policy sentence:** "may train on your inputs and outputs unless you opt
   out, and still uses chats flagged for safety review or material you report, such as feedback" →
   "may use your inputs and outputs to train its models unless you opt out, and that even after an
   opt-out it uses chats flagged for safety review, or material you explicitly report (for example
   through its feedback mechanisms), for model improvement".
   - Source (Anthropic Privacy Policy): "Even if you opt-out, we will use Inputs and Outputs for
     model improvement when … flagged for safety review … or … you've explicitly reported the
     materials to us (for example via our feedback mechanisms)".
4. **Microsoft:** "with a personal account" → "with a Microsoft account rather than a work or
   school account".
   - The page says it "applies only when you sign in with a Microsoft account" and not with a
     "work, school, or organizational (Microsoft Entra) account".
5. **FTC:** "Staff in the FTC's Office of Technology have written that AI model providers may be
   liable if they break privacy commitments, such as promises not to use customer data for secret
   purposes like training models" → "FTC staff have written that companies offering AI models as a
   service may be liable under laws the FTC enforces if they break privacy commitments, including
   promises not to use customer data for secret purposes such as training or updating their
   models".
   - The post's term is "Model-as-a-service companies … may be liable under the laws enforced by
     the FTC".
   - The February post has a second author group, so the attribution is now broader.
6. **Work and school, "Training controls":** "OpenAI says API organization owners can turn on data
   sharing" → "OpenAI's API documentation says data sent to its API is not used to train or improve
   its models unless you explicitly opt in to share it".
   - The API page does not mention organization owners.
   - Source: "data sent to the OpenAI API is not used to train or improve OpenAI models (unless you
     explicitly opt in to share data with us)".
7. **Work and school, "Provider logs":** added ", with exceptions such as legal requirements"
   after "30 days by default".
   - Source: "retained for up to 30 days, unless longer retention is required by law, or is
     reasonably necessary to protect our services or any third party from harm".
8. **Work and school, "Contract wording":** "does not train on customer data without prior
   permission or instruction" → "does not use customer data for training models without the
   customer's prior permission or instruction". This is the hub's own wording.

### Could not verify (editor must decide)

All of the following rest on help.openai.com articles. Both curl and WebFetch got HTTP 403 there,
so I skipped them as instructed and left the sentences unchanged:

- The whole **OpenAI (ChatGPT)** paragraph:
  - training on services for individuals and the "Improve the model for everyone" setting
  - rating a response after an opt-out
  - an opt-out not deleting chats
  - deletion within 30 days
  - temporary chats kept for up to 30 days
  - Business, Enterprise, and Edu excluded by default. Only the API part of this is confirmed,
    from the API docs.
- In the opening paragraph, the OpenAI half of "two providers … up to 30 days". The Anthropic half
  is confirmed.
- "OpenAI's Help Center shows a relative date, such as 'Updated: 10 days ago.'"

openai.com policy pages were also blocked. I found no other reachable official OpenAI page
covering ChatGPT consumer data. The editor should either confirm these sentences without
automation bypass, or cut the OpenAI paragraph and the OpenAI parts of the opening.

Editor's resolution (2026-10-08): the OpenAI (ChatGPT) paragraph now points readers to OpenAI's
Help Center without summarizing it, the opening no longer relies on OpenAI's retention figure, and
the relative-date sentence was removed. The OpenAI API statements, which were verified, remain.

## learn-careers-in-ai.mdx

### Checked and correct as written (other than the changes below)

- **BLS OOH** (all pages show "Last modified date: August 27, 2026"). These match the "What they
  do" and "How to become one" text:
  - research scientists: "design innovative uses for new and existing technology"; experiments
    using data science and machine learning techniques; papers and presentations; at least a
    master's degree; federal government may hire with a bachelor's
  - software developers: "create the computer applications … and the underlying systems that run
    the devices or control networks"; QA analysts "design and execute software tests"; bachelor's
    degree
  - data scientists: "clean" raw data; collect, categorize, and analyze; create, validate, and test
    models; bachelor's degree
  - systems administrators: "install, configure, and maintain … operating systems, and servers";
    "Some employers require a postsecondary certificate or an associate's degree"
  - computer hardware engineers: "processors, circuit boards, and memory devices"
  - electrical and electronics engineers: design, develop, and test equipment and systems
  - electricians: power, communications, lighting, and control systems; "4- or 5-year
    apprenticeship"; most states require a license
  - lawyers: "a law degree and a state license, which usually requires passing a bar examination"
- **O*NET:**
  - O*NET is published by the DOL Employment and Training Administration.
  - Database Architects lists Data Engineer as a sample title and designs databases and data
    warehouses.
  - Data Scientists lists Data Scientist and Machine Learning Data Curator as DOL-approved
    Registered Apprenticeship titles.
- **Apprenticeship.gov:**
  - The program offers paid work with a mentor, classroom instruction, and a nationally
    recognized credential.
  - You apply through the employer or program sponsor.
  - The AI in Registered Apprenticeship Innovation Portal exists.
- **NSF ATE:** focuses on two-year institutions and "supports the education of technicians for
  the high-technology fields".
- **NIST AIRC:** collects the AI RMF, the Playbook, and a glossary. The site menu now reads
  "AIRMF NIST SI Resource Center", but the page body still says "NIST AI Resource Center". No
  change made.
- **MIT OCW About:**
  - It is free and open.
  - No enrollment is needed and there is no requirement to create an account.
  - MIT offers no credit or certification.
  - The 6.036 Fall 2020 course page resolves.
- **Google MLCC:**
  - The prerequisites ask for algebra and statistics comfort and say "You should be a good
    programmer", ideally in Python.
  - No Google account is needed except for the Colab programming exercises.
  - Google offers badges, not formal certification.
  - No Google page I read calls the course free, and the explainer does not call it free.
- **Postings** (all open and present in `data/jobs/current.json` on 2026-10-08):
  - Ai2 robotics and product designer: match.
  - Anthropic data engineer, safeguards policy, and evaluations: match.
  - Cerebras RTL: collaborates with design verification, physical design, software, and system
    teams.
  - Cerebras SRE: releases, capacity changes, and cluster upgrades; Kubernetes, Python or Go, and
    Prometheus; "Required" and "Nice-to-Have" lists.
  - Crusoe electrician: Manufacturing team; Colorado Journeyman license.
  - CoreWeave: diagnostics, repairs, installing, scripts, on-call, "fully onsite", and "You don't
    need to check every box".
- **Anthropic careers page:**
  - "We care about what you can do, not where you learned to do it".
  - It suggests putting independent research, writing, or open-source work at the top of a
    resume.
  - "engineers here do lots of research, and researchers do lots of engineering".
- **Ai2 careers page:** lists Lead Product Designer and Senior Product Manager roles beside
  research roles, internships, and the Predoctoral Young Investigators program.
- **Jobs page description:** checked against the methodology `#jobs` section and
  `components/JobsDirectory.tsx` and `components/OrganizationJobs.tsx` (read only).
- **Scope:** no salaries, pay, growth projections, or job counts appear in the explainer. The
  postings and BLS pages show pay, but none is used. `/companies/coreweave/` is published.
- **Worked example:** Sam is labelled fictional.

### Changes (before → after, source)

1. **O*NET search:** "returns Data Scientists, Computer Systems Engineers/Architects, and Computer
   and Information Research Scientists as its closest matches" → "lists … first among its closest
   matches".
   - O*NET's "Closest" view has 20 occupations. Those three are first, followed by unrelated
     entries such as Special Education Teachers and Machinists.
2. **Google MLCC:** "combines lessons, videos, interactive exercises, and optional programming
   exercises" → "features animated videos, interactive visualizations, and hands-on practice
   exercises".
   - Source (MLCC landing page): "featuring a series of animated videos, interactive
     visualizations, and hands-on practice exercises".
   - No page I read calls the programming exercises optional.
3. **Anthropic education minimum:** "Two Anthropic postings list a minimum of a bachelor's degree
   or an equivalent mix" → "The three Anthropic postings cited here list a minimum of …".
   - All three cited postings carry the "Minimum education: Bachelor's degree or an equivalent
     combination of education, training, and/or experience" line.
4. **CoreWeave:** link text "CoreWeave posting" → "CoreWeave posting inviting interest in
   technician roles".
   - Source: "This interest form is for individuals who would like to be considered for future or
     upcoming Data Center Technician opportunities".

### Could not verify

Nothing material.

## Takeaways (`research/notes/round4-people.md`)

- **ai-and-your-data, takeaway 2:** "Turning training off does not delete chats, …" → "Turning
  training off is separate from deleting chats, …". This matches the corrected opening; 159
  characters.
- **Other takeaways:** takeaways 1 and 3, and all three careers-in-ai takeaways, restate what the
  pages say. Unchanged.
