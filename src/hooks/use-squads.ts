import useSWR from 'swr';
import { useEffect } from 'react';
import { useSquadStore } from '@/stores/squad-store';
import type { Squad, SquadConnection, SquadTier } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SquadsResponse {
  squads: Squad[];
  domainIndex: Record<string, string[]>;
  connections: SquadConnection[];
  summary: {
    total_agents: number;
    total_tasks: number;
    total_workflows: number;
  };
}

interface SquadDetailResponse {
  squad: Squad & {
    tiers?: SquadTier[];
    objectives?: string[];
    keyCapabilities?: string[];
  };
}

export function useSquads() {
  const { data, error, isLoading, mutate } = useSWR<SquadsResponse>(
    '/api/squads',
    fetcher,
    { revalidateOnFocus: false }
  );

  const { setSquads, setConnections, setDomainIndex, setSummary } =
    useSquadStore();

  useEffect(() => {
    if (data) {
      setSquads(data.squads);
      setConnections(data.connections);
      setDomainIndex(data.domainIndex);
      setSummary(data.summary);
    }
  }, [data, setSquads, setConnections, setDomainIndex, setSummary]);

  return {
    squads: data?.squads ?? [],
    domainIndex: data?.domainIndex ?? {},
    connections: data?.connections ?? [],
    summary: data?.summary ?? { total_agents: 0, total_tasks: 0, total_workflows: 0 },
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}

export function useSquadDetail(name: string | null) {
  const { data, error, isLoading } = useSWR<SquadDetailResponse>(
    name ? `/api/squads/${name}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    squad: data?.squad ?? null,
    isLoading,
    isError: !!error,
  };
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  category: string;
  agent: string;
  inputs: string[];
  outputs: string[];
  responsibilities: string[];
  antiPatterns: string[];
  tools: string[];
  estimatedDuration: string;
}

export interface AgentDetailData {
  id: string;
  name: string;
  title: string;
  icon: string;
  role: string;
  tier: string;
  description: string;
  principles: string[];
  tools: string[];
  commands: string[];
  tasks: AgentTask[];
  handoffs: { agent: string; when: string; squad?: string }[];
}

interface AgentDetailResponse {
  agent: AgentDetailData;
}

export function useSquadAgentDetail(squadName: string | null, agentId: string | null) {
  const { data, error, isLoading } = useSWR<AgentDetailResponse>(
    squadName && agentId ? `/api/squads/${squadName}/agents/${agentId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    agent: data?.agent ?? null,
    isLoading,
    isError: !!error,
  };
}
