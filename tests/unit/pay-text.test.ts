import { describe, expect, it } from "vitest";
import { payFromText } from "@/lib/jobs/pay-text";
import { Salary } from "@/lib/jobs/schema";

const pay = (text: string) => payFromText(text).map((p) => [p.min, p.max, p.period, p.label]);

describe("pay ranges from an employer's description", () => {
  it("reads the audit's samples", () => {
    // SpaceX: levels, cents, no period after the second level.
    expect(pay("COMPENSATION AND BENEFITS: Pay range: Level 1: $125,000.00 - $160,000.00 Level 2: $145,000.00 - $195,000.00 Your actual level and base salary will be determined")).toEqual([
      [125000, 160000, "year", "Level 1"],
      [145000, 195000, "year", "Level 2"],
    ]);
    // Red Hat: a target incentive mentioned after the range does not change the range.
    expect(pay("The salary range for this position is $150,910.00 - $241,440.00 (inclusive of base pay + target incentive).")).toEqual([[150910, 241440, "year", null]]);
    // ServiceNow: second amount without "$".
    expect(pay("For positions in this location, we offer a base pay of $171,900 - 300,800, plus equity (when applicable)")).toEqual([[171900, 300800, "year", null]]);
    // Hourly with a stated unit.
    expect(pay("US Hourly Range Materials Associate: $25.48 - $33.65/hour Senior Materials Associate: $28.36 - $38.46/hour Your job level")).toEqual([
      [25.48, 33.65, "hour", "Materials Associate"],
      [28.36, 38.46, "hour", "Senior Materials Associate"],
    ]);
    // K shorthand.
    expect(pay("Compensation: $180K–$250K per year plus equity")).toEqual([[180000, 250000, "year", null]]);
    expect(pay("The US base salary range for this full-time position is: $ 265-310K + equity + benefits.")).toEqual([[265000, 310000, "year", null]]);
  });

  it("reads stated periods and labels", () => {
    expect(pay("The US base salary range for this full-time position is $150,000 to $225,000 per year.")).toEqual([[150000, 225000, "year", null]]);
    expect(pay("Pay range: Level I: $125,000.00 - $145,000.00/per year Level II: $145,000.00 - $175,000.00/per year Your actual level")).toEqual([
      [125000, 145000, "year", "Level I"],
      [145000, 175000, "year", "Level II"],
    ]);
    expect(pay("Zone 1 Pay Range $228,600—$314,250 USD Zone 2 Pay Range $205,700—$282,800 USD")).toEqual([
      [228600, 314250, "year", "Zone 1"],
      [205700, 282800, "year", "Zone 2"],
    ]);
    expect(pay("Starting pay varies by location. If a location of interest is not listed, please speak with a recruiter. Zone A: $180,000—$270,000 USD Zone B: $171,000—$256,600 USD")).toEqual([
      [180000, 270000, "year", "Zone A"],
      [171000, 256600, "year", "Zone B"],
    ]);
    expect(pay("Pay Range $43.55 - $63.97 Hourly $43.55 - $53.36 Hourly for the 534.2 level")).toEqual([
      [43.55, 63.97, "hour", null],
      [43.55, 53.36, "hour", "534.2 level"],
    ]);
    expect(pay("Compensation may be adjusted depending on work location. For Denver based hires: Estimated annual salary of $132,000 - $182,000.")).toEqual([[132000, 182000, "year", "Denver"]]);
    expect(pay("Compensation & Benefits: The standard on target earnings for this position is $300,000 - $360,000 annually.")).toEqual([[300000, 360000, "year", "On-target earnings"]]);
    expect(pay("US Hourly Range $32—$42 USD The salary range for this role is an estimate")).toEqual([[32, 42, "hour", null]]);
    expect(pay("Ability to work extended hours. Propulsion Engineer/Level I: $100,000.00 - $115,000.00/per year Your actual level and base salary will be determined")).toEqual([[100000, 115000, "year", "Propulsion Engineer/Level I"]]);
  });

  it("skips what is not a stated U.S.-dollar pay range", () => {
    // Funding and spend.
    expect(pay("We raised $100 - $200 million in Series C funding. Competitive compensation.")).toEqual([]);
    expect(pay("Compensation is competitive. Managed $50K-$250K/month in spend and scaled budgets")).toEqual([]);
    // A single amount is not a range.
    expect(pay("Compensation: up to $250,000 per year depending on experience.")).toEqual([]);
    expect(pay("Benefits and pay: $5,000 401k match and a $2,000 learning stipend.")).toEqual([]);
    // Other currencies.
    expect(pay("Salary range: €60,000 - €80,000 per year")).toEqual([]);
    expect(pay("Salary range: £60,000 - £80,000 per year")).toEqual([]);
    expect(pay("Zone A: $222,900—$334,300 CAD. Base salary only.")).toEqual([]);
    expect(pay("The on target earnings (OTE) pay range for this role is $280,000 - $350,000 AUD.")).toEqual([]);
    expect(pay("Salary range: CA$120,000 - CA$150,000 per year")).toEqual([]);
    // No pay word nearby.
    expect(pay("Our customers range from $100,000 - $500,000 in annual contract value.")).toEqual([]);
    // No period and too small to be a yearly salary.
    expect(pay("US Salary Range $40—$55 USD The salary range for this role is an estimate")).toEqual([]);
    expect(pay("The anticipated annual base salary range for this role is: $175—$200 USD")).toEqual([]);
    // Implausible spreads.
    expect(pay("Zone 1 Pay Range $311—$325,000 USD")).toEqual([]);
    expect(pay("Zone 4 Pay Range $380,000—$4,200,000 USD")).toEqual([]);
    expect(pay("Stipend $9,700 - $19,000, based on academic experience.")).toEqual([]);
  });

  it("keeps at most six ranges and dedupes repeats", () => {
    const text = Array.from({ length: 9 }, (_, i) => `Zone ${i + 1} Pay Range $${100 + i},000—$${150 + i},000 USD`).join(" ");
    expect(payFromText(text)).toHaveLength(6);
    expect(pay("Salary: $100,000 - $150,000. Salary: $100,000 - $150,000.")).toEqual([[100000, 150000, "year", null]]);
  });

  it("produces valid stored salaries", () => {
    for (const s of payFromText("Pay range: Level 1: $125,000.00 - $160,000.00 Level 2: $145,000.00 - $195,000.00")) expect(Salary.parse(s)).toEqual(s);
  });
});
