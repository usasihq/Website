/** Network access happens here only. Ordinary builds keep the last snapshot if a state fails. */
import { EMPTY_WARN_DATASET, LAYOFFS_PATH, readLayoffs, writeLayoffs } from "../lib/jobs/layoffs";
import { mergeLayoffRefresh } from "../lib/jobs/layoffs-refresh";

const previous = readLayoffs();
const today = (process.env.USASI_TODAY ?? new Date().toISOString().slice(0, 10));
const { dataset, counts, kept, skipped } = await mergeLayoffRefresh(previous.states.length ? previous : EMPTY_WARN_DATASET, today);
writeLayoffs(dataset);
const summary = Object.entries(counts)
  .map(([code, n]) => `${code}=${n}`)
  .join(" ");
console.log(`layoffs: ${dataset.states.length} states written (${summary}).`);
if (kept.length) console.log(`layoffs: kept previous notices for ${kept.join(", ")} after a fetch failure.`);
if (skipped.length) console.log(`layoffs: skipped ${skipped.join(", ")} (fetch failed and no previous notices).`);
console.log(`layoffs: snapshot ${LAYOFFS_PATH}`);
