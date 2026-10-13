# A11 fact-check (2026-10-13)

Fact-checked independently. I fetched every cited source today with curl (`-A "USASI-factcheck/0.3"`, unauthenticated) and confirmed each statement against it. For arXiv I used the abstract page plus the PDF first page, and for GitHub the public profile pages and the unauthenticated api.github.com user endpoint. I also fetched these extra primary sources to check current roles and identity:
- arXiv PDFs 2202.03555, 2410.00037, 2511.09690, 2609.03992, 2610.08902 and 2605.11299;
- the export.arxiv.org author search for Sartran;
- Harwath's CV;
- the WAVLab home page;
- shijt.site.

All 23 files are in `people/`.

## Per file

- **abdelrahman-mohamed**: checked OK. The homepage supports the FAIR (Sept 2018), Amazon Alexa AI and MSR 2014–2017 roles. Its news ends in 2018, so recording FAIR as past is appropriate.
- **alexandre-defossez**: corrected.
  - "Core-team author of the MusicGen paper" was cited only to the arXiv abstract page, which has no core-team marker. I added the `musicgen-pdf` source (arxiv.org/pdf/2306.05284), which marks the core team (♢).
  - Privacy: changed "FAIR Paris" to "FAIR" in the bio, the affiliation name and the role, to keep a city off the profile.
  - The Kyutai Head of Research role is confirmed on kyutai.org/team. The Moshi and AudioCraft licenses are confirmed in the READMEs.
- **alexei-baevski**: corrected. The data2vec work item ("models and code are available in the fairseq repository") was cited only to the arXiv abstract page, which does not say this. I added `data2vec-pdf` (arxiv.org/pdf/2202.03555), which says it and also lists Baevski at Meta AI. The wav2vec 2.0 PDF clearly lists all four authors at Facebook AI with fb.com addresses, so the Meta tie is acceptable. Google is the company on the public GitHub profile.
- **david-harwath**: checked OK. Assistant Professor at UT Austin, SALT Lab, and MIT CSAIL research scientist 2018–2020 are confirmed by the homepage and the UTCS page. The current title is also confirmed by the CV linked from the homepage ("August 2020 – Present").
- **emmanuel-dupoux**: checked OK.
  - The GSLM PDF lists all authors under Facebook AI Research, with Dupoux footnoted "Also at EHESS", so the paper clearly lists the affiliation.
  - The LSCP page confirms Professor (EHESS) in the Cognitive machine learning team. The CoML description matches cognitive-ml.fr.
- **gabriel-synnaeve**: corrected.
  - Re-sourced the MusicGen core-team claim to the MusicGen PDF.
  - "Both released through the MIT-licensed AudioCraft repository" became "part of the AudioCraft repository, which releases its code under the MIT license and its model weights under CC-BY-NC 4.0" (AudioCraft README).
  - The newest paper (arXiv 2610.08902, 2026-10-06) lists Synnaeve at Meta Superintelligence Labs, not FAIR. The headline changed from "Research scientist at Meta FAIR" to "Research scientist at Meta". The bio and affiliation now say the Meta people page places Synnaeve on FAIR (joined 2015) and that an October 2026 paper lists Meta Superintelligence Labs. I added the `plasticity-pdf` source. The Meta tie stays current.
- **heiga-zen**: checked OK. Every statement matches the Google Research people page: Principal Scientist at Google DeepMind from June 2023, the Speech and Brain teams, the IBM intern/co-op, Toshiba, HTS, and ISCA/IEEE fellow. The HTS license statement matches the HTS site.
- **jade-copet**: checked OK.
  - The EnCodec PDF lists Copet individually as "Meta AI, FAIR Team" with a meta.com address, and marks Défossez and Copet as equal contribution.
  - The MusicGen PDF marks Copet as equal contribution and core team.
  - The GitHub profile lists @facebookresearch.
- **jiatong-shi**: corrected.
  - "The lab led by Shinji Watanabe" is not stated on the cited members page. It now reads "WAVLab, Shinji Watanabe's Audio and Voice Lab at Carnegie Mellon University's Language Technologies Institute", and I added the `wavlab-home` source (wavlab.org).
  - The PhD alumni dates 2019.09–2025.12 are confirmed.
  - Identity is confirmed: the person's own homepage (shijt.site, http-only, so not cited) links github.com/ftshijt and names Anuttacon as current employer.
- **jonathan-shen**: checked OK. The official Google Research blog byline ("Software Engineers, on behalf of the Google Brain and Machine Perception Teams", 2017-12-19) documents the Google tie. The Tacotron 2 description matches the abstract.
- **ju-chieh-chou**: checked OK. The homepage and CV (updated 2026-10-01) confirm the TTIC PhD role under Livescu, the Meta 2022 and 2025 and Microsoft 2024 internships, the Mila/SpeechBrain internship, and that the 2022 Meta work produced the joint LM paper (CV reference [7]).
- **karen-livescu**: checked OK. The homepage confirms Professor at TTIC, UChicago courtesy faculty, and MIT EECS post-doctoral lecturer 2005–2007. WAVLab lists Livescu as visiting faculty 2023.09–2024.06. The Meta Auli page lists the joint LM paper.
- **laurent-sartran**: **set to draft** (identity doubtful).
  - Every statement checks out. In the Transformer Grammars PDF, Sartran carries superscript 1 (DeepMind) and a deepmind.com address. The repositories are google-deepmind, Apache-2.0.
  - The roster files this name under audio/speech, but the profile describes a DeepMind language-model researcher. An arXiv author search (au:Sartran) returns 7 papers, all DeepMind work on language models, MT, diffusion, RL and vision-language, and none in audio. The name is not on the Kyutai team page, and no current role is documented.
  - I can't confirm this is the person the roster meant. The editor should confirm before publishing.
- **michael-auli**: corrected.
  - The Meta FAIR role was `current: true`, based on the homepage ("Last updated April 11, 2024") and the Meta people page. The newer Omnilingual ASR paper (arXiv 2511.09690, Nov 2025, FAIR at Meta) marks Auli with "Work conducted while at FAIR at Meta".
  - Set `current: false` and changed `sector` from `corporate` to `null`.
  - The headline changed from "Principal Research Scientist/Director at Meta FAIR; behind wav2vec, fairseq, and Massively Multilingual Speech" to "Former Principal Research Scientist/Director at Meta FAIR; last author of wav2vec 2.0, fairseq, and MMS".
  - The bio now attributes the title to the dated homepage and notes the 2025 marker. I added the `omnilingual-pdf` source.
  - The last-author claims and MMS figures match the arXiv pages and the homepage.
- **neil-zeghidour**: corrected. "Other Kyutai researchers" and "paper from Kyutai" were cited only to the Moshi abstract page, which does not name Kyutai. I added `moshi-pdf` (arxiv.org/pdf/2410.00037), which lists the authors at Kyutai. Audio Research Advisor is confirmed on kyutai.org/team and in the GitHub bio. The Google tie is confirmed by the blog bylines ("Research Scientist, Google Research").
- **r-j-skerry-ryan**: checked OK. The Google Research people page lists RJ Skerry-Ryan with Google publications from 2017 to 2025 and a Speech Processing research area. The Tacotron PDF lists Google, Inc.
- **ronan-collobert**: checked OK. The homepage and GitHub support Apple MLR and the earlier FAIR, Idiap and NEC roles. The Torch, SENNA, wav2letter and flashlight details and the MIT/BSD licenses match. A May 2026 arXiv paper also lists Collobert at Apple.
- **sanyuan-chen**: checked OK. The GitHub bio says "Research Scientist @ Meta FAIR", and a Sept 2026 FAIR at Meta paper (arXiv 2609.03992) corroborates it. The MSRA internship and the VALL-E joint-first marker (*) are on the homepage. The MSR WavLM page confirms authorship.
- **shinji-watanabe**: checked OK. The homepage supports Associate Professor at CMU, the prior roles, and ESPnet, VERSA and OWSM. Both repositories are Apache-2.0.
- **wei-ning-hsu**: corrected. The data2vec fairseq-availability claim was cited to the abstract page and the homepage, neither of which says it. I added `data2vec-pdf`. The current Meta role is corroborated by a Sept 2026 FAIR at Meta paper (arXiv 2609.03992, Hsu as senior author).
- **xu-tan**: corrected. "Muzic … names Tan as its contact" was overstated, because the Muzic README names Tan only as the contact for a hiring notice. I cut the contact claim from the bio and the work item and kept "README lists Tan as a co-author of several of its papers". The Moonshot AI and MSRA roles match the homepage.
- **yao-qian**: checked OK. The MSR profile confirms Principal Researcher in the Speech and Dialog Research Group. The MSR publication pages for WavLM and UniSpeech-SAT link people/yaoqian, which ties the author to this person.
- **yi-ren**: checked OK. The homepage supports the HeyGen role, joining TikTok in 2023, the MSRA machine learning group internship (2018.08–2019.02), FastSpeech deployed in Azure TTS, and the DiffSinger co-authorship. The GitHub company field is HeyGen.

The scans found no he/she pronouns, no personal data, no superlatives, and no follower, star, user, staff or money figures. The only location, "FAIR Paris", has been removed.

## Totals

- Files checked: 23
- Checked OK: 14
- Corrected: 8 (alexandre-defossez, alexei-baevski, gabriel-synnaeve, jiatong-shi, michael-auli, neil-zeghidour, wei-ning-hsu, xu-tan)
- Set to draft: 1 (laurent-sartran)
- Deleted: 0
- Validator: `23 batch file(s): 0 error(s), 0 warning(s)`
