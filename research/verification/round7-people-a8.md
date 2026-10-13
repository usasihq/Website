# A8 fact-check (2026-10-13)

I checked all 21 files in `people/`. Every cited source was fetched today, without authentication, using curl with `-A "USASI-factcheck/0.3"`. That includes 31 arXiv abstract pages, the GitHub READMEs, homepages and official pages. Each statement was checked against the text of its source.

For every file, I confirmed four things:
- the arXiv author lists and dates;
- the license lines in the READMEs;
- that each GitHub profile in `links` names the same person;
- that no statement touches a privacy topic.

No he/she pronouns turned up; the only hits were the surname "He". There are no superlatives, counts or money.

## Per file

### Checked OK

| File | Notes |
|---|---|
| alexander-kirillov | The Thinking Machines role comes from Kirillov's own homepage, which presents it as current. The page was last modified in Feb 2025. Thinking Machines' own pages list no individual staff, and nothing fetched contradicts the role. |
| piotr-dollar | Homepage, Meta AI profile and SAM 3 README († project lead) all confirm. |
| nikhila-ravi | The homepage (updated Oct 2026) states the MSL Director role. |
| yuxin-wu | Confirmed by the homepage and the Detectron2 citation. |
| saining-xie | The homepage states the AMI Labs CSO role, NYU assistant professor and the past GDM/FAIR roles. |
| xinlei-chen | The homepage (updated Oct 2026) states OpenAI; the GitHub org field still says xAI, so the homepage wins. |
| christoph-feichtenhofer | Confirmed by the homepage, Meta profile and PySlowFast contributors. |
| trevor-darrell | Confirmed by the homepage and the Caffe README. |
| alexei-a-efros | Confirmed by the homepage and the pix2pix/CycleGAN READMEs. |
| andrea-vedaldi | The homepage news dated 17/09/2026 records the start as an Amazon Scholar. The RAEng page lists the Meta role. The VGGT README lists Vedaldi as an author. |
| joao-carreira | The Simons and ICIST 2026 bios confirm the role. The kinetics-i3d and perception_test READMEs (Apache 2.0 / CC-BY data) confirm the work. |
| cordelia-schmid | The homepage confirms the Inria research director role and the joint Google Research appointment since 2018. |
| josef-sivic | The homepage confirms "Consulting: Adobe Research", the MIT CSAIL postdoc and Tolion Health AI. |

### Corrected

**ross-girshick**
- Bio: "works on visual perception…" became "research interests include algorithms for visual perception…". The homepage states interests, and no current role is documented. Source: rossgirshick.info.

**kaiming-he**
- Bio: "is also known for Faster R-CNN" became "Kaiming He's site also lists Faster R-CNN among this work on visual perception". Source: the homepage.
- MAE work item: "the official repository" became "the facebookresearch/mae repository, a PyTorch re-implementation of the paper". The README says it is a re-implementation of the TensorFlow original.

**tsung-yi-lin**
- Bio: "recent focus on" became "recent interest in", which matches the homepage.
- Added the source `nvidia-profile` (research.nvidia.com/person/tsung-yi-lin) to the Cosmos work item. It lists Cosmos-Reason 1 (2025) among Lin's publications, which ties the NVIDIA Research person to the Cosmos author.

**jitendra-malik**
- Bio: "teaches courses including CS 280… and Robots That Learn" became "homepage lists recent teaching of CS 280 Computer Vision (Spring 2025) and CS 294-277 Robots That Learn (Spring 2026)". Source: the homepage.

**david-forsyth**
- Specialties: `[vision, education]` became `[vision, generative-media]`. Teaching courses alone does not make education a specialty. The cited Generative Blocks World paper is generative image editing, and the arXiv HTML confirms D.A. Forsyth's UIUC affiliation.

### Corrected and still draft

**karen-simonyan**
- Bio: "Oxford publication page links these papers to project pages and released ConvNet models" was overstated, because the two-stream entry has only arXiv and poster links. It now reads "both papers appear on Simonyan's Oxford publication page, which links the VGG paper to a project page with the ILSVRC ConvNet models".
- The profile stays draft. No Microsoft page newer than the March 2024 announcement was found (microsoft.ai pages fetched; searches returned only aggregators), so Microsoft AI is still recorded as `current: false`.

**michael-black**
- "Senior author" of SMPL-X became "last-listed author" in the bio. The headline became "Co-author of the SMPL-X body model".
- The profile stays draft. The is.mpg.de profile pages return a "Bot Detection" page, which I did not bypass.
- For the editor: 2026 arXiv papers (2606.30598, 2610.12435, 2603.15975) list Black with a Max Planck Institute for Intelligent Systems affiliation, but they give no title, so no current role was added.
- The Amazon tie, Distinguished Amazon Scholar (past), is documented by Amazon's 2017 release and the 2020 Amazon Science article.
- Slug note: the public name is "Michael J. Black", but the roster slug `michael-black` was kept.

### Set to draft

**francisco-massa**
- The `current: true` Meta role rests only on the GitHub company field. Its text, "Facebook AI Reseach", uses the pre-2022 brand name with a typo, which suggests it is old.
- No Meta people page exists; ai.meta.com/people returns 404 and nothing turned up in searches.
- The newest arXiv papers listing Massa date from Aug–Sep 2025 (DINOv3, CWM).
- Every other fact checks out: the emeritus TorchVision listing, the DINOv3 authorship under "Meta AI Research, FAIR", DETR second author and the Detectron2 citation.
- Editor: confirm the current role before publishing.

### Deleted

None.

## Totals

- Files checked: 21
- Checked OK, no change: 13
- Corrected: 7 (ross-girshick, kaiming-he, tsung-yi-lin, jitendra-malik, david-forsyth, karen-simonyan, michael-black). Karen Simonyan and Michael Black stay draft.
- Set to draft by this check: 1 (francisco-massa)
- Drafts in total: 3 (karen-simonyan, michael-black, francisco-massa)
- Deleted: 0
- Validator: `21 batch file(s): 0 error(s), 0 warning(s)`
