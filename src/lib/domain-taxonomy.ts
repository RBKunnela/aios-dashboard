// Taxonomia fixa de dominios — source of truth para o AIOS Dashboard
// NUNCA adicionar domains ad-hoc; novos squads devem caber nas 6 categorias.

export const DOMAIN_TAXONOMY = {
  strategy:   { label: 'Strategy',            color: 'var(--agent-pm)' },
  marketing:  { label: 'Marketing & Content', color: 'var(--agent-po)' },
  technical:  { label: 'Technical',           color: 'var(--agent-dev)' },
  operations: { label: 'Operations',          color: 'var(--agent-analyst)' },
  brand:      { label: 'Brand & Design',      color: 'var(--agent-devops)' },
  meta:       { label: 'Meta & Frameworks',   color: 'var(--agent-architect)' },
} as const;

export type DomainKey = keyof typeof DOMAIN_TAXONOMY;

export const DOMAIN_ORDER: DomainKey[] = [
  'strategy',
  'marketing',
  'technical',
  'operations',
  'brand',
  'meta',
];

// Maps legacy/ad-hoc domain names to canonical domain keys
const LEGACY_DOMAIN_MAP: Record<string, DomainKey> = {
  business_strategy: 'strategy',
  business_ops: 'operations',
  content_marketing: 'marketing',
  technical: 'technical',
  meta_frameworks: 'meta',
  brand: 'brand',
  franchise: 'operations',
  movimento: 'marketing',
  'marketing-ideologico': 'marketing',
  'design-system': 'brand',
};

// Per-squad overrides when default domain mapping doesn't apply
const SQUAD_DOMAIN_OVERRIDES: Record<string, DomainKey> = {
  'c-level': 'strategy',
  'data': 'technical',
  'spy': 'marketing',
  'design': 'brand',
  'deep-research': 'technical',
};

export function resolveSquadDomain(squadName: string, rawDomain: string): DomainKey {
  if (squadName in SQUAD_DOMAIN_OVERRIDES) {
    return SQUAD_DOMAIN_OVERRIDES[squadName];
  }
  if (rawDomain in LEGACY_DOMAIN_MAP) {
    return LEGACY_DOMAIN_MAP[rawDomain];
  }
  if (rawDomain in DOMAIN_TAXONOMY) {
    return rawDomain as DomainKey;
  }
  return 'meta';
}

export function getDomainColor(domain: string): string {
  const entry = DOMAIN_TAXONOMY[domain as DomainKey];
  return entry ? entry.color : 'var(--text-muted)';
}

export function getDomainLabel(domain: string): string {
  const entry = DOMAIN_TAXONOMY[domain as DomainKey];
  return entry ? entry.label : domain.replace(/[-_]/g, ' ');
}
