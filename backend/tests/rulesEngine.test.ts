import { evaluateRules } from '../src/services/rulesEngine';
import { describe, it, expect } from 'vitest';

describe('Rules Engine', () => {
  it('should evaluate EQUALS rule correctly', () => {
    const rules = [{ id: '1', field: 'category', type: 'EQUALS' as any, value: 'ST' }];
    const result = evaluateRules(rules, { category: 'ST' });
    expect(result.overallResult).toBe('eligible');
    expect(result.results[0].passed).toBe(true);
  });

  it('should evaluate LESS_THAN_EQUAL rule correctly', () => {
    const rules = [{ id: '1', field: 'income', op: '<=', value: 600000 } as any];
    const result = evaluateRules(rules, { income: 500000 });
    expect(result.overallResult).toBe('eligible');

    const failResult = evaluateRules(rules, { income: 700000 });
    expect(failResult.overallResult).toBe('ineligible');
  });

  it('should evaluate IN rule correctly', () => {
    const rules = [{ id: '1', field: 'state', op: 'in', values: ['DL', 'MH'] } as any];
    const result = evaluateRules(rules, { state: 'DL' });
    expect(result.overallResult).toBe('eligible');

    const failResult = evaluateRules(rules, { state: 'UP' });
    expect(failResult.overallResult).toBe('ineligible');
  });

  it('should handle missing data fields', () => {
    const rules = [{ id: '1', field: 'income', op: '<=', value: 600000 } as any];
    // income is missing
    const result = evaluateRules(rules, { category: 'ST' });
    expect(result.overallResult).toBe('ineligible');
    expect(result.results[0].passed).toBe(false);
  });
});
