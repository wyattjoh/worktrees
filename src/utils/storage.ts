import { Repository } from "../types";

export const STORAGE_KEYS = {
  REPOSITORIES: "repositories",
} as const;

export function serializeRepositories(repositories: Repository[]): string {
  return JSON.stringify(
    repositories.map((repo) => ({
      ...repo,
      addedAt: repo.addedAt.toISOString(),
    })),
  );
}

export function deserializeRepositories(data: string): Repository[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((repo: { id: string; name: string; path: string; addedAt: string }) => ({
      ...repo,
      addedAt: new Date(repo.addedAt),
    }));
  } catch {
    return [];
  }
}

export function sortRepositoriesByName(repositories: Repository[]): Repository[] {
  return [...repositories].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}
