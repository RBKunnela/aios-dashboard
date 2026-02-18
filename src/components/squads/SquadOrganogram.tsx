'use client';

import { cn } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/section-label';
import { SquadCard } from './SquadCard';
import type { Squad } from '@/types';

interface SquadOrganogramProps {
  squads: Squad[];
  domainIndex: Record<string, string[]>;
  onSquadClick: (name: string) => void;
}

const DOMAIN_LABELS: Record<string, string> = {
  business_strategy: 'Business Strategy',
  business_ops: 'Business Operations',
  content_marketing: 'Content & Marketing',
  technical: 'Technical',
  meta_frameworks: 'Meta Frameworks',
  brand: 'Brand',
  franchise: 'Franchise',
  movimento: 'Movimento',
  'marketing-ideologico': 'Marketing Ideologico',
  'design-system': 'Design System',
};

const DOMAIN_ORDER = [
  'business_strategy',
  'content_marketing',
  'technical',
  'business_ops',
  'meta_frameworks',
  'brand',
  'franchise',
  'movimento',
  'marketing-ideologico',
  'design-system',
];

export function SquadOrganogram({
  squads,
  domainIndex,
  onSquadClick,
}: SquadOrganogramProps) {
  const squadMap = new Map(squads.map((s) => [s.name, s]));
  const usedSquads = new Set<string>();

  const mainDomains = ['business_strategy', 'content_marketing', 'technical', 'business_ops', 'meta_frameworks'];
  const domainGroups: { domain: string; squads: Squad[] }[] = [];

  for (const domain of mainDomains) {
    const squadNames = domainIndex[domain] || [];
    if (squadNames.length === 0) continue;

    const groupSquads: Squad[] = [];
    for (const name of squadNames) {
      const squad = squadMap.get(name);
      if (squad) {
        groupSquads.push(squad);
        usedSquads.add(name);
      }
    }

    if (groupSquads.length > 0) {
      groupSquads.sort((a, b) => a.name.localeCompare(b.name));
      domainGroups.push({ domain, squads: groupSquads });
    }
  }

  const remaining = squads.filter((s) => !usedSquads.has(s.name));
  const remainingByDomain = new Map<string, Squad[]>();
  for (const squad of remaining) {
    if (!remainingByDomain.has(squad.domain)) {
      remainingByDomain.set(squad.domain, []);
    }
    remainingByDomain.get(squad.domain)!.push(squad);
  }

  const remainingDomains = [...remainingByDomain.keys()].sort((a, b) => {
    const ia = DOMAIN_ORDER.indexOf(a);
    const ib = DOMAIN_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const domain of remainingDomains) {
    const groupSquads = remainingByDomain.get(domain)!;
    groupSquads.sort((a, b) => a.name.localeCompare(b.name));
    domainGroups.push({ domain, squads: groupSquads });
  }

  return (
    <div className="space-y-8">
      {domainGroups.map(({ domain, squads: groupSquads }) => (
        <div key={domain}>
          <SectionLabel withLine className="mb-4">
            {DOMAIN_LABELS[domain] || domain.replace(/[-_]/g, ' ')}
          </SectionLabel>

          <div
            className={cn(
              'grid gap-3',
              'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            )}
          >
            {groupSquads.map((squad) => (
              <SquadCard
                key={squad.name}
                squad={squad}
                onClick={() => onSquadClick(squad.name)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
