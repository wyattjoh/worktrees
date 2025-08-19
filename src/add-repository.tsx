import { ActionPanel, Action, Form, showToast, Toast, popToRoot, Icon } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useState } from "react";
import { Repository } from "./types";
import { isGitRepository, getRepositoryName } from "./utils/git";
import { STORAGE_KEYS, serializeRepositories, deserializeRepositories } from "./utils/storage";
import crypto from "node:crypto";

interface FormValues {
  path: string;
  name?: string;
}

export default function AddRepository() {
  const [pathError, setPathError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();

  const { value: repositoriesData, setValue: setRepositoriesData } = useLocalStorage<string>(
    STORAGE_KEYS.REPOSITORIES,
    "[]",
  );

  function validatePath(value: string | undefined): string | undefined {
    if (!value || value.trim().length === 0) {
      return "Path is required";
    }

    if (!isGitRepository(value.trim())) {
      return "Path must be a valid Git repository";
    }

    const repositories = deserializeRepositories(repositoriesData || "[]");
    const pathExists = repositories.some((repo) => repo.path === value.trim());
    if (pathExists) {
      return "Repository already exists";
    }

    return undefined;
  }

  function validateName(value: string | undefined): string | undefined {
    if (value && value.trim().length === 0) {
      return "Name cannot be empty if provided";
    }
    return undefined;
  }

  async function handleSubmit(values: FormValues) {
    const pathValidation = validatePath(values.path);
    const nameValidation = validateName(values.name);

    if (pathValidation) {
      setPathError(pathValidation);
      return;
    }

    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }

    try {
      const path = values.path.trim();
      const name = values.name?.trim() || getRepositoryName(path);

      const repositories = deserializeRepositories(repositoriesData || "[]");

      const newRepository: Repository = {
        id: crypto.randomUUID(),
        name,
        path,
        addedAt: new Date(),
      };

      repositories.push(newRepository);
      await setRepositoriesData(serializeRepositories(repositories));

      await showToast({
        style: Toast.Style.Success,
        title: "Repository Added",
        message: `${name} has been added successfully`,
      });

      popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Add Repository",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Repository" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="path"
        title="Repository Path"
        placeholder="/path/to/your/git/repository"
        error={pathError}
        onChange={() => setPathError(undefined)}
        onBlur={(event) => {
          const error = validatePath(event.target.value);
          setPathError(error);
        }}
      />
      <Form.TextField
        id="name"
        title="Custom Name (Optional)"
        placeholder="Leave empty to auto-detect from repository"
        error={nameError}
        onChange={() => setNameError(undefined)}
        onBlur={(event) => {
          const error = validateName(event.target.value);
          setNameError(error);
        }}
      />
      <Form.Description text="Add a Git repository to manage its worktrees. The path must point to a valid Git repository." />
    </Form>
  );
}
