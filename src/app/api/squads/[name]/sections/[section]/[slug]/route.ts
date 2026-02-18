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

function extractTitle(content: string, filename: string, isYaml: boolean): string {
  if (!isYaml) {
    const match = content.match(/^#\s+(.+)/m);
    if (match) return match[1].trim();
  }
  return formatName(filename);
}

const CONTENT_EXTENSIONS = ['.md', '.yaml', '.yml'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string; section: string; slug: string }> }
) {
  try {
    const { name, section, slug } = await params;
    const projectRoot = getProjectRoot();
    const sectionDir = path.join(projectRoot, 'squads', name, section);

    // Try each extension to find the file
    let content: string | null = null;
    let filePath = '';
    let isYaml = false;

    for (const ext of CONTENT_EXTENSIONS) {
      const fullPath = path.join(sectionDir, `${slug}${ext}`);
      try {
        content = await fs.readFile(fullPath, 'utf-8');
        filePath = `${slug}${ext}`;
        isYaml = ext === '.yaml' || ext === '.yml';
        break;
      } catch {
        // Try next extension
      }
    }

    if (content === null) {
      return NextResponse.json(
        { error: `Item '${slug}' not found in ${section}` },
        { status: 404 }
      );
    }

    const title = extractTitle(content, filePath, isYaml);

    return NextResponse.json({ title, content, filePath, isYaml });
  } catch (error) {
    console.error('Error in /api/squads/[name]/sections/[section]/[slug]:', error);
    return NextResponse.json({ error: 'Failed to load item content' }, { status: 500 });
  }
}
