import { ActionPanel, Action, Icon, List, showToast, Toast, Color } from "@raycast/api";
import { useState, useEffect } from "react";
import { Repository, Worktree } from "./types";
import { listWorktrees, openInCursor } from "./utils/git";

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

  async function handleOpenInCursor(worktree: Worktree) {
    try {
      openInCursor(worktree.path);
      await showToast({
        style: Toast.Style.Success,
        title: "Opened in Cursor",
        message: `${worktree.branch || "Detached HEAD"} - ${worktree.path}`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Open in Cursor",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  function getWorktreeIcon(worktree: Worktree): Icon {
    if (worktree.bare) return Icon.Folder;
    if (worktree.locked) return Icon.Lock;
    if (worktree.detached) return Icon.Warning;
    return Icon.Branch;
  }

  function getWorktreeIconColor(worktree: Worktree): Color | undefined {
    if (worktree.locked) return Color.Red;
    if (worktree.detached) return Color.Orange;
    if (worktree.prunable) return Color.Yellow;
    return undefined;
  }

  function getWorktreeSubtitle(worktree: Worktree): string {
    const parts: string[] = [];

    if (worktree.bare) parts.push("bare");
    if (worktree.detached) parts.push("detached");
    if (worktree.locked) parts.push("locked");
    if (worktree.prunable) parts.push("prunable");

    return parts.length > 0 ? `(${parts.join(", ")})` : "";
  }

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
          icon={Icon.Branch}
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
                <Action title="Open in Cursor" icon={Icon.Code} onAction={() => handleOpenInCursor(worktree)} />
                <Action.CopyToClipboard
                  title="Copy Path"
                  content={worktree.path}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.ShowInFinder path={worktree.path} shortcut={{ modifiers: ["cmd"], key: "f" }} />
                <Action.CopyToClipboard
                  title="Copy Branch Name"
                  content={worktree.branch || worktree.commit}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
