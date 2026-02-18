import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { Squad, SquadConnection, SquadStatus } from '@/types';

function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  return path.resolve(process.cwd(), '..', '..');
}

function formatName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function countFiles(dir: string, ext: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(ext)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

async function readSquadConfig(
  squadPath: string
): Promise<Record<string, unknown> | null> {
  // Try squad.yaml first (v2), then config.yaml (legacy)
  for (const filename of ['squad.yaml', 'config.yaml']) {
    try {
      const content = await fs.readFile(
        path.join(squadPath, filename),
        'utf-8'
      );
      return yaml.load(content) as Record<string, unknown>;
    } catch {
      continue;
    }
  }
  return null;
}

function extractDependencies(
  squadName: string,
  config: Record<string, unknown>
): SquadConnection[] {
  const connections: SquadConnection[] = [];
  const deps = config.dependencies as Record<string, unknown> | undefined;
  if (!deps) return connections;

  // Handle array of dependency objects or string references
  if (Array.isArray(deps)) {
    for (const dep of deps) {
      if (typeof dep === 'string' && dep !== 'aios-core') {
        connections.push({ from: squadName, to: dep, type: 'required' });
      } else if (typeof dep === 'object' && dep !== null) {
        const d = dep as Record<string, unknown>;
        const name = (d.name || d.squad) as string;
        if (name && name !== 'aios-core') {
          const type =
            (d.type as string) === 'optional' ? 'optional' : 'required';
          connections.push({
            from: squadName,
            to: name,
            type,
            reason: d.reason as string | undefined,
          });
        }
      }
    }
  } else if (typeof deps === 'object') {
    // Handle { squads: [...], optional: [...] } format
    const squads = (deps as Record<string, unknown>).squads;
    const optional = (deps as Record<string, unknown>).optional;

    if (Array.isArray(squads)) {
      for (const s of squads) {
        const name = typeof s === 'string' ? s : (s as Record<string, unknown>)?.name as string;
        if (name && name !== 'aios-core') {
          connections.push({ from: squadName, to: name, type: 'required' });
        }
      }
    }
    if (Array.isArray(optional)) {
      for (const s of optional) {
        const name = typeof s === 'string' ? s : (s as Record<string, unknown>)?.name as string;
        if (name && name !== 'aios-core') {
          connections.push({
            from: squadName,
            to: name,
            type: 'optional',
            reason:
              typeof s === 'object'
                ? ((s as Record<string, unknown>)?.reason as string)
                : undefined,
          });
        }
      }
    }
  }

  return connections;
}

interface RegistrySquad {
  path: string;
  version: string;
  description: string;
  counts: {
    agents: number;
    tasks: number;
    workflows: number;
    templates: number;
    checklists: number;
    data_files: number;
  };
  agent_names: string[];
  domain: string;
  keywords: string[];
  has_readme: boolean;
}

interface RegistryData {
  metadata: { total_squads: number };
  squads: Record<string, RegistrySquad>;
  domain_index: Record<string, string[]>;
  summary: {
    total_agents: number;
    total_tasks: number;
    total_workflows: number;
    total_templates: number;
    total_checklists: number;
    total_data_files: number;
  };
}

export async function GET() {
  try {
    const projectRoot = getProjectRoot();
    const registryPath = path.join(
      projectRoot,
      'squads',
      'squad-creator',
      'data',
      'squad-registry.yaml'
    );

    let registry: RegistryData | null = null;
    try {
      const content = await fs.readFile(registryPath, 'utf-8');
      registry = yaml.load(content) as RegistryData;
    } catch {
      // Registry not available, will fall back to directory scan
    }

    const squads: Squad[] = [];
    const allConnections: SquadConnection[] = [];

    if (registry?.squads) {
      // Primary path: read from registry
      for (const [name, data] of Object.entries(registry.squads)) {
        const squadDir = path.join(projectRoot, data.path);

        // Read config for dependencies
        const config = await readSquadConfig(squadDir);
        const deps = config ? extractDependencies(name, config) : [];
        allConnections.push(...deps);

        // Determine status from config metadata
        let status: SquadStatus = 'active';
        if (config) {
          const meta = config.metadata as Record<string, unknown> | undefined;
          const rawStatus = (meta?.status || config.status) as string | undefined;
          if (rawStatus && ['active', 'draft', 'beta', 'planned'].includes(rawStatus)) {
            status = rawStatus as SquadStatus;
          }
        }

        const meta = config?.metadata as Record<string, unknown> | undefined;

        squads.push({
          name,
          displayName:
            (meta?.display_name as string) ||
            formatName(name),
          description: data.description || '',
          version: data.version || 'unknown',
          domain: data.domain || 'other',
          status,
          path: data.path,
          agentCount: data.counts?.agents || 0,
          taskCount: data.counts?.tasks || 0,
          workflowCount: data.counts?.workflows || 0,
          checklistCount: data.counts?.checklists || 0,
          agentNames: data.agent_names || [],
          dependencies: deps,
          keywords: data.keywords || [],
        });
      }
    } else {
      // Fallback: scan squads/ directory
      const squadsDir = path.join(projectRoot, 'squads');
      try {
        const entries = await fs.readdir(squadsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (
            !entry.isDirectory() ||
            entry.name.startsWith('.') ||
            entry.name === 'node_modules'
          )
            continue;

          const squadDir = path.join(squadsDir, entry.name);
          const config = await readSquadConfig(squadDir);
          const agentsDir = path.join(squadDir, 'agents');

          let agentNames: string[] = [];
          try {
            const agentEntries = await fs.readdir(agentsDir);
            agentNames = agentEntries
              .filter((f) => f.endsWith('.md'))
              .map((f) => f.replace('.md', ''));
          } catch {
            // No agents dir
          }

          const taskCount = await countFiles(
            path.join(squadDir, 'tasks'),
            '.md'
          );
          const workflowCount = await countFiles(
            path.join(squadDir, 'workflows'),
            '.yaml'
          );
          const checklistCount = await countFiles(
            path.join(squadDir, 'checklists'),
            '.md'
          );

          const deps = config ? extractDependencies(entry.name, config) : [];
          allConnections.push(...deps);

          const meta = config?.metadata as Record<string, unknown> | undefined;

          squads.push({
            name: entry.name,
            displayName:
              (meta?.display_name as string) ||
              formatName(entry.name),
            description:
              (config?.description as string) ||
              (meta?.description as string) ||
              '',
            version: (meta?.version as string) || (config?.version as string) || 'unknown',
            domain: (meta?.domain as string) || (config?.domain as string) || 'other',
            status: 'active',
            path: `squads/${entry.name}/`,
            agentCount: agentNames.length,
            taskCount,
            workflowCount,
            checklistCount,
            agentNames,
            dependencies: deps,
            keywords: [],
          });
        }
      } catch {
        // squads dir doesn't exist
      }
    }

    // Build domain index from the data
    const domainIndex: Record<string, string[]> = {};
    for (const squad of squads) {
      if (!domainIndex[squad.domain]) {
        domainIndex[squad.domain] = [];
      }
      domainIndex[squad.domain].push(squad.name);
    }

    // Sort squads naturally
    squads.sort((a, b) => a.name.localeCompare(b.name));

    // Filter connections to only include valid squad-to-squad references
    const squadNames = new Set(squads.map((s) => s.name));
    const validConnections = allConnections.filter(
      (c) => squadNames.has(c.from) && squadNames.has(c.to)
    );

    return NextResponse.json({
      squads,
      domainIndex,
      connections: validConnections,
      summary: registry?.summary || {
        total_agents: squads.reduce((s, q) => s + q.agentCount, 0),
        total_tasks: squads.reduce((s, q) => s + q.taskCount, 0),
        total_workflows: squads.reduce((s, q) => s + q.workflowCount, 0),
      },
    });
  } catch (error) {
    console.error('Error in /api/squads:', error);
    return NextResponse.json(
      { squads: [], domainIndex: {}, connections: [], error: 'Failed to load squads' },
      { status: 500 }
    );
  }
}
