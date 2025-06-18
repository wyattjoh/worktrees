import { ActionPanel, Action, Icon, List, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useState, useEffect } from "react";
import { Repository } from "./types";
import { STORAGE_KEYS, deserializeRepositories, serializeRepositories, sortRepositoriesByName } from "./utils/storage";
import { openInCursor } from "./utils/git";
import WorktreeList from "./worktree-list";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const { value: repositoriesData, setValue: setRepositoriesData } = useLocalStorage<string>(
    STORAGE_KEYS.REPOSITORIES,
    "[]",
  );

  const repositories = sortRepositoriesByName(deserializeRepositories(repositoriesData || "[]"));

  useEffect(() => {
    setIsLoading(false);
  }, []);

  async function handleDeleteRepository(repository: Repository) {
    try {
      const updatedRepositories = repositories.filter((repo) => repo.id !== repository.id);
      await setRepositoriesData(serializeRepositories(updatedRepositories));

      await showToast({
        style: Toast.Style.Success,
        title: "Repository Removed",
        message: `${repository.name} has been removed`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Remove Repository",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async function handleOpenInCursor(repository: Repository) {
    try {
      openInCursor(repository.path);
      await showToast({
        style: Toast.Style.Success,
        title: "Opened in Cursor",
        message: `${repository.name} - ${repository.path}`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Open in Cursor",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (repositories.length === 0 && !isLoading) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Folder}
          title="No Repositories Added"
          description="Add a Git repository to start managing worktrees"
          actions={
            <ActionPanel>
              <Action.Push title="Add Repository" icon={Icon.Plus} target={<AddRepository />} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search repositories...">
      {repositories.map((repository) => (
        <List.Item
          key={repository.id}
          icon={Icon.Folder}
          title={repository.name}
          subtitle={repository.path.replace(process.env.HOME || "", "~")}
          accessories={[
            {
              date: repository.addedAt,
              tooltip: `Added on ${repository.addedAt.toLocaleDateString()}`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Worktrees"
                icon={Icon.Branch}
                target={<WorktreeList repository={repository} />}
              />
              <Action
                title="Open in Cursor"
                icon={Icon.Code}
                onAction={() => handleOpenInCursor(repository)}
                shortcut={{ modifiers: ["cmd"], key: "o" }}
              />
              <ActionPanel.Section>
                <Action.Push
                  title="Add Repository"
                  icon={Icon.Plus}
                  target={<AddRepository />}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action.CopyToClipboard
                  title="Copy Path"
                  content={repository.path}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.ShowInFinder path={repository.path} shortcut={{ modifiers: ["cmd"], key: "f" }} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title="Remove Repository"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => handleDeleteRepository(repository)}
                  shortcut={{ modifiers: ["cmd"], key: "delete" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// Import the AddRepository component dynamically to avoid circular imports
import AddRepository from "./add-repository";
