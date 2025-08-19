import { ActionPanel, Action, Icon, List, showToast, Toast, Color, Keyboard } from "@raycast/api";
import { useState, useEffect } from "react";
import { Repository, Worktree } from "./types";
import { listWorktrees } from "./utils/git";

function getWorktreeIcon(worktree: Worktree): Icon | string {
  if (worktree.bare) return Icon.Folder;
  if (worktree.locked) return Icon.Lock;
  if (worktree.detached) return Icon.Warning;
  return "git-branch.svg";
}

function getWorktreeIconColor(worktree: Worktree): Color | undefined {
  if (worktree.locked) return Color.Red;
  if (worktree.detached) return Color.Orange;
  if (worktree.prunable) return Color.Yellow;
  return Color.PrimaryText;
}

function getWorktreeSubtitle(worktree: Worktree): string {
  const parts: string[] = [];

  if (worktree.bare) parts.push("bare");
  if (worktree.detached) parts.push("detached");
  if (worktree.locked) parts.push("locked");
  if (worktree.prunable) parts.push("prunable");

  return parts.length > 0 ? `(${parts.join(", ")})` : "";
}

interface WorktreeListProps {
  repository: Repository;
}

export default function WorktreeList({ repository }: WorktreeListProps) {
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function loadWorktrees() {
      try {
        setIsLoading(true);
        const result = listWorktrees(repository.path);
        setWorktrees(result.worktrees);
        setError(undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load worktrees");
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to Load Worktrees",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadWorktrees();
  }, [repository.path]);

  if (error) {
    return (
      <List>
        <List.EmptyView icon={Icon.Warning} title="Error Loading Worktrees" description={error} />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`Worktrees - ${repository.name}`}
      searchBarPlaceholder="Search worktrees..."
    >
      {worktrees.length === 0 && !isLoading ? (
        <List.EmptyView
          icon="git-branch.svg"
          title="No Worktrees Found"
          description="This repository doesn't have any worktrees"
        />
      ) : (
        worktrees.map((worktree, index) => (
          <List.Item
            key={`${worktree.path}-${index}`}
            icon={{
              source: getWorktreeIcon(worktree),
              tintColor: getWorktreeIconColor(worktree),
            }}
            title={worktree.branch || "Detached HEAD"}
            subtitle={getWorktreeSubtitle(worktree)}
            accessories={[
              {
                text: worktree.path.replace(process.env.HOME || "", "~"),
                icon: Icon.Folder,
              },
            ]}
            actions={
              <ActionPanel>
                <Action.OpenWith
                  title="Open in Cursor"
                  icon={Icon.Code}
                  path={worktree.path}
                  shortcut={Keyboard.Shortcut.Common.OpenWith}
                />
                <Action.CopyToClipboard
                  title="Copy Path"
                  content={worktree.path}
                  shortcut={Keyboard.Shortcut.Common.Copy}
                />
                <Action.ShowInFinder path={worktree.path} shortcut={Keyboard.Shortcut.Common.Open} />
                <Action.CopyToClipboard
                  title="Copy Branch Name"
                  content={worktree.branch || worktree.commit}
                  shortcut={Keyboard.Shortcut.Common.Copy}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
