export interface SpeakerProfile { id: string; personName: string; embedding: number[]; confidenceThreshold: number; enabled: boolean; }

export function matchSpeaker(profiles: SpeakerProfile[], embedding: number[]): { personName: string; confidence: number } | null {
  let best: { profile: SpeakerProfile; confidence: number } | null = null;
  for (const profile of profiles.filter((item) => item.enabled)) {
    const confidence = cosineSimilarity(profile.embedding, embedding);
    if (confidence >= profile.confidenceThreshold && (!best || confidence > best.confidence)) best = { profile, confidence };
  }
  return best ? { personName: best.profile.personName, confidence: best.confidence } : null;
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (!left.length || left.length !== right.length) return 0;
  let dot = 0; let leftMagnitude = 0; let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) { dot += left[index] * right[index]; leftMagnitude += left[index] ** 2; rightMagnitude += right[index] ** 2; }
  return leftMagnitude && rightMagnitude ? dot / Math.sqrt(leftMagnitude * rightMagnitude) : 0;
}
