import { SimulationResult } from '../types/index.js';

// Standard Normal random variate generator using Box-Muller transform
function standardNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper === lower) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function runSimulation(
  initial: number,
  contribution: number,
  annualReturn: number,
  volatility: number,
  years: number,
  simulations: number = 5000,
  goalTarget: number | null = null
): SimulationResult {
  const months = Math.max(1, Math.round(years * 12));
  const simCount = Math.min(20000, Math.max(100, Math.round(simulations)));
  const monthlyReturn = annualReturn / 100 / 12;
  const monthlyVolatility = (volatility / 100) / Math.sqrt(12);

  const finalValues: number[] = new Array(simCount);
  const maxSamplePaths = Math.min(30, simCount);
  const stepInterval = Math.max(1, Math.floor(months / 50));
  const sampleStepsCount = Math.floor(months / stepInterval) + 1;
  const samplePaths: number[][] = Array.from({ length: maxSamplePaths }, () => new Array(sampleStepsCount));

  for (let s = 0; s < simCount; s++) {
    let current = initial;
    const isSample = s < maxSamplePaths;
    if (isSample) {
      samplePaths[s][0] = Math.round(current);
    }

    let sampleIdx = 1;
    for (let m = 1; m <= months; m++) {
      const z = standardNormal();
      const periodicReturn = monthlyReturn + monthlyVolatility * z;
      current = current * (1 + periodicReturn) + contribution;
      if (current < 0) current = 0;

      if (isSample && (m % stepInterval === 0 || m === months)) {
        if (sampleIdx < sampleStepsCount) {
          samplePaths[s][sampleIdx++] = Math.round(current);
        }
      }
    }
    finalValues[s] = current;
  }

  // Sort final values for percentile extraction
  const sorted = [...finalValues].sort((a, b) => a - b);
  const p10 = Math.round(percentile(sorted, 10));
  const p25 = Math.round(percentile(sorted, 25));
  const median = Math.round(percentile(sorted, 50));
  const p75 = Math.round(percentile(sorted, 75));
  const p90 = Math.round(percentile(sorted, 90));

  // Goal achievement probability
  let goalProbability: number | null = null;
  if (goalTarget && goalTarget > 0) {
    const achievedCount = finalValues.filter((v) => v >= goalTarget).length;
    goalProbability = Math.round((achievedCount / simCount) * 1000) / 10;
  }

  // 20-bin histogram distribution
  const numBins = 20;
  const minVal = sorted[0];
  const maxVal = sorted[sorted.length - 1];
  const binWidth = (maxVal - minVal) / numBins || 1;
  const bins: number[] = [];
  const distribution: number[] = new Array(numBins).fill(0);

  for (let b = 0; b <= numBins; b++) {
    bins.push(Math.round(minVal + b * binWidth));
  }

  for (const v of finalValues) {
    let binIndex = Math.floor((v - minVal) / binWidth);
    if (binIndex >= numBins) binIndex = numBins - 1;
    if (binIndex < 0) binIndex = 0;
    distribution[binIndex]++;
  }

  return {
    percentiles: { p10, p25, median, p75, p90 },
    goal_probability: goalProbability,
    sample_paths: samplePaths,
    distribution,
    bins,
    disclaimer: 'Monte Carlo simulations are statistical estimates based on historical stochastic variance and do not guarantee future portfolio returns.'
  };
}
