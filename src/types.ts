export interface Repository {
  id: string;
  name: string;
  path: string;
  addedAt: Date;
}

export interface Worktree {
  path: string;
  branch: string;
  commit: string;
  bare?: boolean;
  detached?: boolean;
  locked?: boolean;
  prunable?: boolean;
}

export interface GitWorktreeListOutput {
  worktrees: Worktree[];
  mainWorktree: Worktree;
}
