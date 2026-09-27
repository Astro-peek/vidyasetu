/**
 * Rules Engine — pure, side-effect-free evaluator.
 * Operators: ==, !=, <, <=, >, >=, in, not_in, between, exists
 * Groups: all, any, not (nestable)
 */

type Operator = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not_in' | 'between' | 'exists' | 'EQUALS' | 'NOT_EQUALS' | 'LESS_THAN' | 'LESS_THAN_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_EQUAL';

interface Rule {
  id: string;
  field: string;
  op?: Operator;
  type?: Operator; // legacy alias
  value?: unknown;
  values?: unknown[];
  source?: string;
  description?: string;
}

interface RuleGroup {
  id?: string;
  all?: (Rule | RuleGroup)[];
  any?: (Rule | RuleGroup)[];
  not?: Rule | RuleGroup;
}

type SchemaRule = Rule | RuleGroup;

export interface RuleResult {
  id: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  source?: string;
  description?: string;
}

export interface EvaluationResult {
  overallResult: 'eligible' | 'ineligible' | 'needs_review';
  results: RuleResult[];
}

function getField(formData: Record<string, unknown>, field: string): unknown {
  return formData[field] ?? formData[field.replace(/([A-Z])/g, '_$1').toLowerCase()];
}

function evalOp(op: Operator, actual: unknown, value: unknown, values?: unknown[]): boolean {
  const normalOp = op.toUpperCase();
  switch (normalOp) {
    case '==':
    case 'EQUALS':
      return actual == value;
    case '!=':
    case 'NOT_EQUALS':
      return actual != value;
    case '<':
    case 'LESS_THAN':
      return Number(actual) < Number(value);
    case '<=':
    case 'LESS_THAN_EQUAL':
      return Number(actual) <= Number(value);
    case '>':
    case 'GREATER_THAN':
      return Number(actual) > Number(value);
    case '>=':
    case 'GREATER_THAN_EQUAL':
      return Number(actual) >= Number(value);
    case 'IN':
      return Array.isArray(values) ? values.includes(actual) : (Array.isArray(value) ? (value as unknown[]).includes(actual) : false);
    case 'NOT_IN':
      return Array.isArray(values) ? !values.includes(actual) : (Array.isArray(value) ? !(value as unknown[]).includes(actual) : true);
    case 'BETWEEN':
      if (Array.isArray(values) && values.length === 2) return Number(actual) >= Number(values[0]) && Number(actual) <= Number(values[1]);
      return false;
    case 'EXISTS':
      return actual !== undefined && actual !== null && actual !== '';
    default:
      return false;
  }
}

function isRuleGroup(r: SchemaRule): r is RuleGroup {
  return 'all' in r || 'any' in r || 'not' in r;
}

function evalSingle(rule: Rule, formData: Record<string, unknown>): RuleResult {
  const actual = getField(formData, rule.field);
  const op = (rule.op || rule.type) as Operator;
  const passed = actual === undefined || actual === null || actual === ''
    ? false // missing data → fails for now; caller should set needs_review
    : evalOp(op, actual, rule.value, rule.values as unknown[]);

  return {
    id: rule.id || `${rule.field}_${op}`,
    passed,
    actual,
    expected: rule.value ?? rule.values,
    source: rule.source,
    description: rule.description
  };
}

function evalGroup(group: RuleGroup, formData: Record<string, unknown>, results: RuleResult[]): boolean {
  if (group.all) {
    return group.all.every(child => evalAny(child, formData, results));
  }
  if (group.any) {
    return group.any.some(child => evalAny(child, formData, results));
  }
  if (group.not) {
    return !evalAny(group.not, formData, results);
  }
  return true;
}

function evalAny(node: SchemaRule, formData: Record<string, unknown>, results: RuleResult[]): boolean {
  if (isRuleGroup(node)) {
    return evalGroup(node, formData, results);
  }
  const result = evalSingle(node as Rule, formData);
  results.push(result);
  return result.passed;
}

export function evaluateRules(rules: SchemaRule[], formData: Record<string, unknown>): EvaluationResult {
  const results: RuleResult[] = [];
  let allPassed = true;
  let hasNullField = false;

  for (const rule of rules) {
    if (isRuleGroup(rule)) {
      const passed = evalGroup(rule, formData, results);
      if (!passed) allPassed = false;
    } else {
      const r = evalSingle(rule as Rule, formData);
      results.push(r);
      if (!r.passed) allPassed = false;
      if (r.actual === undefined || r.actual === null || r.actual === '') hasNullField = true;
    }
  }

  let overallResult: EvaluationResult['overallResult'];
  if (hasNullField && allPassed) {
    overallResult = 'needs_review';
  } else if (allPassed) {
    overallResult = 'eligible';
  } else {
    overallResult = 'ineligible';
  }

  return { overallResult, results };
}
