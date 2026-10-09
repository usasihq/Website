# Round 4 — people-facing explainers (label `round4-people`, 2026-10-08)

Files written: `content/pages/learn-ai-and-your-data.mdx`, `content/pages/learn-careers-in-ai.mdx`, and this notes file. No other files were edited.

Request method: `curl -A "USASI-catalog-research/0.3"`, WebFetch, and, where a site returned 403 or 404 to curl, the browser pane (normal page load, no sign-in). No email address, name, or other identifier was sent in any URL, header, or payload. No CAPTCHA or bot check was attempted; openai.com stayed on a Cloudflare "Just a moment..." page and was skipped.

---

slug: ai-and-your-data
title: What happens to what you type into an AI service
question: Does an AI service keep my conversations or use them to train its models?
topic: policy
level: Beginner
takeaways:
  - Consumer AI apps often let the provider train on your chats unless you opt out; business, school, and API versions usually exclude your content by default.
  - Turning training off is separate from deleting chats, and temporary or incognito chats are still kept for 72 hours to 30 days in this page's consumer examples.
  - Terms differ by product, plan, account, and app version and they change, so note the date and scope of any policy page you rely on.
sources fetched: 22 pages read; 17 cited. Read but not cited: Anthropic Privacy Center "Is my data used for model training?" (consumer) and "How do I change my model improvement privacy settings?"; Anthropic "How long do you store my organization's data?" (cut for length); Microsoft Copilot overview and privacy-controls pages. Not reached: OpenAI Privacy Policy (openai.com/policies/privacy-policy/), blocked by a Cloudflare challenge for curl, WebFetch, and the browser pane, so the page relies on OpenAI Help Center articles and API docs instead. FTC Technology Blog posts returned 404 to curl but loaded normally in the browser pane. Uncertain or ambiguous, and flagged on the page rather than interpreted: (1) Microsoft's updated-app page says prompts, responses, and file contents are not used to train "foundation models" and does not define the term; (2) several Google Workspace hub statements carry the qualifier "outside of your domain"; (3) OpenAI Help Center articles show only relative dates ("Updated: 10 days ago" for data controls and model improvement, 16 days for retention, 19 days for temporary chat). The Gemini hub does not state whether Keep Activity is on by default, so the page does not say. Microsoft's pages for the updated Copilot app give no retention period, so the 18-month figure is attributed only to the older-app FAQ.

slug: careers-in-ai
title: Careers in AI: roles, skills, and paths
question: What kinds of jobs exist around AI, and how do people prepare for them?
topic: industry
level: Beginner
takeaways:
  - AI work includes research, software, data, chip design, infrastructure, data-center, electrical, product, policy, legal, safety, and evaluation roles.
  - AI job titles rarely match one official occupation, so compare a posting's duties with the BLS Occupational Outlook Handbook and O*NET.
  - Routes in include degrees, registered apprenticeships, and two-year college programs; separate a posting's requirements from its preferences.
sources fetched: 42 pages read (including two Google help navigation pages); 32 cited. BLS Occupational Outlook Handbook (8 pages, all showing "Last modified date: August 27, 2026") returned 403 to curl and was read in the browser pane and with WebFetch; only the "What they do" and "How to become one" tabs were used, never pay or outlook. Read but not cited: O*NET 15-1221.00; apprenticeship.gov AI Next Steps and Technology industry pages; NSF Super Intelligence focus-area page (nsf.gov/focus-areas/ai now redirects there and says NSF is updating its terminology under a September 29, 2026 executive order; not used); NIST AI RMF page; Crusoe careers page; Google ML Education help "About" answer; a Cloudflare "Senior Machine Learning Engineer" posting (not used: its title says Senior but its body says Lead). Not reached: an Abridge legal posting on jobs.ashbyhq.com rendered only "You need to enable JavaScript", so the legal bullet uses BLS only. The CoreWeave posting's official URL (coreweave.com/careers/job?...gh_jid=4652977006) embeds the Greenhouse posting in an iframe; its text was read from the Greenhouse boards API record and the Greenhouse embed for the same posting ID. Job postings are transient; the Sources list says they were open when read. Google's Machine Learning Crash Course pages do not say the course is free, so the page does not call it free (it says no Google account is needed except for Colab exercises). The definition of RTL (register-transfer level) is a plain-language gloss, not taken from the Cerebras posting. The description of the Jobs page and company records comes from this repository's own files (app/jobs/page.tsx, components/JobsDirectory.tsx, components/OrganizationJobs.tsx, and the methodology page's #jobs section), read but not edited.

---

## Self-check

I re-read every factual sentence in both files against the saved source text.

Fixed during the check (explainer 1):
- OpenAI: training scope now reads "ChatGPT and its other services for individuals" (source: "services for individuals, such as ChatGPT and Codex"); deletion exceptions shortened to "such as legal obligations" (source lists de-identified data and security or legal obligations).
- Anthropic: flagged-chat retention cut for length; incognito retention ("30 days by default") added from the Claude Help Center; feedback/owner control reworded so the page does not claim a causal link the source does not make.
- Google: human review was originally attached to the training sentence; now stated separately ("a subset of chats are reviewed by human reviewers"). Workspace hub link changed to its final URL (support.google.com/a/answer/15706919 redirects to knowledge.workspace.google.com).
- Microsoft: "released on August 18" changed to "available since August 18, 2026" to match the page's wording. "Two pages disagree" changed to "separate live pages ... describe different training practices", since each page covers a different app version.
- FTC: the January 2024 post is about liability for breaking privacy commitments, including promises not to use customer data "for secret purposes, such as to train or update their models"; the sentence now says that rather than "must keep their commitments".
- Opening: "a deleted chat can take up to 30 days" narrowed to the two providers that say so (OpenAI, Anthropic).

Fixed during the check (explainer 2):
- BLS wording aligned: research scientists "design innovative uses for new and existing technology"; software developers "create" (not "design") applications and underlying systems.
- Systems administrators: "employers accept a certificate" changed to "some employers ask for a postsecondary certificate or associate's degree", matching the OOH.
- Data engineers: replaced an unsourced general definition with O*NET's Database Architects entry, which lists Data Engineer as a sample title.
- Google MLCC prerequisites: "some programming" changed to "solid programming skills, ideally in Python" (source: "You should be a good programmer").
- Anthropic minimum education: limited to "two Anthropic postings", the two where I saw the line.
- Worked example: CoreWeave's "hands-on OR education-based" list covers hardware, data centers, networking, and scripting; Linux is listed separately, so it was moved out of that list.

Rules check: no funding, prices, salaries (several postings and BLS pages show pay; none is used), staff or user counts, benchmark scores, rankings, or superlatives; no gendered pronouns for real people; no named individuals. Direct quotations from company pages are limited to UI labels and short phrases ("Improve the model for everyone", "Keep Activity", "foundation models", "outside of your domain", "Updated: 10 days ago"). Internal links checked: every /companies/ and /open/ slug linked has `publication_status: published`; glossary anchors are from the brief's list; hub and explainer slugs exist in content/hubs and lib/learn.ts. Both files compile with @mdx-js/mdx and produce no unintended emphasis from the asterisk in "O*NET".

Suggested glossary terms: model training (on user data), data retention, zero data retention, temporary or incognito chat, human review, registered apprenticeship, site reliability engineering, RTL design.
