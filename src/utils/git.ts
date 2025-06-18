import { execSync } from "child_process";
import { existsSync, statSync } from "fs";
import { Worktree, GitWorktreeListOutput } from "../types";

export function isGitRepository(path: string): boolean {
  try {
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      return false;
    }

    execSync("git rev-parse --git-dir", {
      cwd: path,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function getRepositoryName(path: string): string {
  try {
    const remoteName = execSync("git remote get-url origin", {
      cwd: path,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    const match = remoteName.match(/\/([^/]+?)(?:\.git)?$/);
    if (match) {
      return match[1];
    }
  } catch {
    // Fallback to directory name if no remote
  }

  return path.split("/").pop() || "Unknown Repository";
}

export function listWorktrees(repositoryPath: string): GitWorktreeListOutput {
  try {
    const output = execSync("git worktree list --porcelain", {
      cwd: repositoryPath,
      encoding: "utf8",
    });

    const worktrees: Worktree[] = [];
    let currentWorktree: Partial<Worktree> = {};
    let mainWorktree: Worktree | null = null;

    const lines = output.trim().split("\n");

    for (const line of lines) {
      if (line.startsWith("worktree ")) {
        if (currentWorktree.path) {
          const worktree = currentWorktree as Worktree;
          worktrees.push(worktree);
          if (!mainWorktree) {
            mainWorktree = worktree;
          }
        }
        currentWorktree = { path: line.substring(9) };
      } else if (line.startsWith("HEAD ")) {
        currentWorktree.commit = line.substring(5);
      } else if (line.startsWith("branch ")) {
        currentWorktree.branch = line.substring(7);
      } else if (line === "bare") {
        currentWorktree.bare = true;
      } else if (line === "detached") {
        currentWorktree.detached = true;
      } else if (line.startsWith("locked")) {
        currentWorktree.locked = true;
      } else if (line === "prunable") {
        currentWorktree.prunable = true;
      }
    }

    if (currentWorktree.path) {
      const worktree = currentWorktree as Worktree;
      worktrees.push(worktree);
      if (!mainWorktree) {
        mainWorktree = worktree;
      }
    }

    return {
      worktrees,
      mainWorktree: mainWorktree || worktrees[0],
    };
  } catch (error) {
    throw new Error(`Failed to list worktrees: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function openInCursor(path: string): void {
  try {
    execSync(`cursor "${path}"`, { stdio: "ignore" });
  } catch (error) {
    throw new Error(`Failed to open in Cursor: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
