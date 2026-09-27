const ALLOWED: Record<string, string[]> = {
  Submitted: ['Under Scrutiny', 'Deficiency'],
  'Under Scrutiny': ['Eligible', 'Ineligible', 'Deficiency', 'Rejected'],
  Deficiency: ['Under Scrutiny'],
  Eligible: ['Shortlisted', 'Selected'],
  Shortlisted: ['Selected', 'Rejected', 'Hold'],
  Hold: ['Shortlisted', 'Selected', 'Rejected'],
  Ineligible: [],
  Rejected: [],
  Selected: []
};

export const ALLOWED_STATUSES = Object.keys(ALLOWED);

export function canTransition(from: string, to: string): boolean {
  return (ALLOWED[from] || []).includes(to);
}

export function officerCanSet(to: string): boolean {
  return ['Under Scrutiny', 'Deficiency', 'Eligible', 'Ineligible', 'Rejected'].includes(to);
}

export function committeeCanSet(to: string): boolean {
  return ['Selected', 'Rejected', 'Hold'].includes(to);
}
