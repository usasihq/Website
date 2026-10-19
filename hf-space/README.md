---
title: USASI AI Jobs
emoji: 💼
colorFrom: blue
colorTo: red
sdk: static
app_file: index.html
pinned: false
license: mit
short_description: Search AI jobs from the USASI jobs board
tags:
  - jobs
  - usasi
  - career
  - united-states
---

# USASI AI Jobs

A free static explorer for AI job listings from the
[USASI jobs board](https://unitedstatesofamericasuperintelligence.com/jobs/).
It runs entirely in the browser and reads the public Hugging Face dataset
[`usasihq/usasi-ai-jobs`](https://huggingface.co/datasets/usasihq/usasi-ai-jobs).
Every row links back to that job's page on
[unitedstatesofamericasuperintelligence.com](https://unitedstatesofamericasuperintelligence.com/).

USASI (United States of America Superintelligence) is an independent project and is not a United States government website.

This Space is `sdk: static` so it stays on Hugging Face's free Static Spaces
tier. Gradio and Docker Spaces on `cpu-basic` need a PRO subscription.

## Run locally

```bash
cd hf-space
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765 — the page loads the live dataset from the Hub.
