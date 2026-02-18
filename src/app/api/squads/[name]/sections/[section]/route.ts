import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  return path.resolve(process.cwd(), '..', '..');
}

function formatName(filename: string): string {
  return filename
    .replace(/\.(md|yaml|yml)$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const VALID_SECTIONS = ['agents', 'tasks', 'workflows', 'checklists', 'templates', 'data'];
const CONTENT_EXTENSIONS = ['.md', '.yaml', '.yml'];

function isContentFile(filename: string): boolean {
  return CONTENT_EXTENSIONS.some((ext) => filename.endsWith(ext));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string; section: string }> }
) {
  try {
    const { name, section } = await params;

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section '${section}'. Valid: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const projectRoot = getProjectRoot();
    const sectionDir = path.join(projectRoot, 'squads', name, section);

    let filenames: string[];
    try {
      filenames = await fs.readdir(sectionDir);
    } catch {
      return NextResponse.json({ items: [] });
    }

    const items = filenames
      .filter(isContentFile)
      .map((filename) => ({
        slug: filename.replace(/\.(md|yaml|yml)$/, ''),
        name: formatName(filename),
        relativePath: filename,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/squads/[name]/sections/[section]:', error);
    return NextResponse.json({ error: 'Failed to list section items' }, { status: 500 });
  }
}
