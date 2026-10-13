# B9 verification — 2026-10-13

Independent fact-check of the 18 files in `people/`. I fetched every cited URL today, either with curl (`-A "USASI-factcheck/0.3"`, unauthenticated) or with an unauthenticated api.github.com call. All of them returned HTTP 200. For each arXiv paper I also read the PDF to confirm the affiliation, equal-contribution and leadership claims. No browser tools were used, no logins, and no personal identifiers were sent in any request. The repository was not edited.

## Per file

- **alexander-toshev** — checked OK.
  - The PDFs of RLTL;DR (29 Sep 2026), Simulate to Generalize (v3, Sep 2026), DataComp-LM and MobileCLIP2 all list Toshev with Apple.
  - The abstracts match the bio.
- **bichen-wu** — corrected.
  - Identity: the Fairy project page links Bichen Wu to the same researcher profile as the FBNet and SqueezeSeg author, who is the GitHub user BichenWuUCB.
  - Bio, before: "whose published work centers on…", "written with collaborators at UC Berkeley and Facebook". After: the GitHub profile describes Wu as a research scientist in AI, and FBNet is listed with UC Berkeley, with the paper noting the work was done while interning at Facebook (FBNet PDF footnote).
  - Meta affiliation: `fbnet-paper` added as a second source documenting the Meta tie.
- **craig-federighi** — checked OK. The Apple leadership page (current) and the 1 Dec 2025 newsroom release support every statement.
- **david-grangier** — checked OK.
  - The homepage gives the current role (Machine Learning Group, Apple Research) and lists 2026 papers.
  - The vitae supports the Google Brain, FAIR and Microsoft Research dates and the fairseq work.
  - The fairseq PDF lists Grangier with Google Brain. The fairseq LICENSE is MIT.
- **john-duchi** — corrected.
  - Neither the JMLR page nor the CV uses the name "AdaGrad".
  - Fix: added the PyTorch 2.14 `torch.optim.Adagrad` documentation as a source, because it cites this paper for the algorithm, and changed the spelling to "Adagrad" in the headline, the work name and the bio.
  - The Stanford role is confirmed as current by the homepage, the CV (July 2025) and a September 2026 arXiv paper listing Duchi with Stanford.
- **john-giannandrea** — checked OK.
  - The 2018 and 2025 Apple newsroom releases support each statement, and their dates match.
  - The retirement is described neutrally, as Apple announced it. Giannandrea is no longer on the Apple leadership page.
- **johny-srouji** — checked OK. Everything is supported by the current Apple leadership page.
- **luke-melas-kyriazi** — checked OK.
  - The homepage says "building Cursor" and "Joined Anysphere", and the GitHub organization is Anysphere (Cursor).
  - The homepage also gives the part-time Meta visiting researcher role.
  - The IM-3D PDF shows equal contribution, with Meta and Oxford affiliations.
- **matthew-zeiler** — corrected.
  - Headline, before: "co-author of ZFNet". No fetched source uses that name, so I cut it.
  - Nebius role, before: "SVP, Research". After: "SVP, Research (announced by Nebius in May 2026)". The 12 May 2026 Nebius release says Zeiler "will join", and no newer official page confirms the start.
  - Bio narrowed to "alongside Clarifai's core engineering and research team".
  - Confirmed: the ADADELTA PDF has the Google intern footnote, and the 1311.2901 PDF lists Zeiler with the NYU Courant Institute.
- **misha-denil** — corrected.
  - Headline, before: "…working on data-driven robotics…". The homepage says Denil is "currently doing my own thing" and the robotics work ran 2019–2024. After: "…whose work includes…".
  - The learning-to-learn PDF lists Denil with Google DeepMind, and the RoboCat abstract matches.
- **myle-ott** — checked OK.
  - The homepage and the GitHub organization (Thinking Machines Lab, Inc.) support the current role.
  - The fairseq PDF shows Ott as first author with FAIR, with equal contribution. The OPT PDF lists Meta AI, and the author lists match.
- **nikhil-thorat** — corrected.
  - The GitHub *bio* says "Anthropic. Previously…", but the profile's organization field still says "Lilac".
  - Bio, before: "lists Anthropic as Thorat's current organization". After: "GitHub profile bio names Anthropic".
  - Role, before: "Works at Anthropic". After: "Named in Thorat's GitHub profile bio (role not stated)".
  - The TF.js PDF confirms equal contribution and Google Brain, and the tfjs license is Apache-2.0.
- **ruoming-pang** — checked OK.
  - The GitHub organization is Meta, and the ScaleAcross PDF (May 2026) lists Pang with Meta Platforms, Inc.
  - In the Apple FM report contributor list, Pang is "Ruoming Pang (overall lead)".
  - The AXLearn PDF says "Ruoming Pang is the corresponding author". The Parallel Track PDF says "Work done when authors were with Apple". The Conformer PDF lists Google Inc. The AXLearn license is Apache-2.0.
  - The GitHub handle `ruomingp` is the #2 contributor to apple/axlearn.
- **ruslan-salakhutdinov** — corrected.
  - The CMU homepage still gives the UPMC Professor role, and September 2026 papers list CMU.
  - A newer official source, arXiv 2609.38147 (29 Sep 2026), lists Salakhutdinov with Meta Superintelligence Labs.
  - Added a current Meta affiliation (organization `meta`), one bio sentence, and the source.
- **samy-bengio** — checked OK.
  - The homepage and CV give the current Apple Senior Director role and the adjunct role at EPFL.
  - The homepage covers Torch, TensorFlow and the MLX sponsorship, and the CV gives the Google years 2007–2021.
- **sergey-edunov** — checked OK.
  - The Genesis team page and the GitHub organization (Genesis Molecular AI) support the current CTO role.
  - The Meta and Llama 2/3 statements are attributed to the Genesis page.
  - The Llama 2 PDF lists Edunov under "Technical and Management Leadership", and Edunov is in the Llama 3 author list.
  - The fairseq PDF shows equal contribution with Ott, and the Meta people page covers Apache Giraph.
- **vaishaal-shankar** — corrected.
  - The GitHub link `github.com/Vaishaal` has no name, and no fetched source ties it to Shankar, so I removed it (`links: []`).
  - Headline, before: "Dataset researcher". After: "Machine learning researcher". The bio opening was narrowed the same way.
  - Confirmed: Apple and shared last author on DataComp-LM, "Work done while at Apple" on MobileCLIP2, and the Apple FM contributor section.
  - The OpenCLIP README "The Team" section supports both statements about Shankar, and the license is MIT.
- **yu-an-chung** — corrected.
  - Headline, before: "technical lead on the open-source Omnilingual ASR". The paper lists Chung under "Technical leadership and project management". After: "in the technical leadership of Omnilingual ASR".
  - Homepage and the June 2026 SONAR v3 (FAIR at Meta) confirm the current role.

## Not changed but noted

- Parameter and language figures (Apple FM, Omnilingual ASR, DCLM) are technical figures taken directly from the papers. They are not counts of popularity, staff or money, so I left them in.

## Totals

- Files checked: 18
- Checked OK: 10
- Corrected: 8 (bichen-wu, john-duchi, matthew-zeiler, misha-denil, nikhil-thorat, ruslan-salakhutdinov, vaishaal-shankar, yu-an-chung)
- Set to draft: 0
- Deleted: 0
- Validator: `18 batch file(s): 0 error(s), 0 warning(s)`
