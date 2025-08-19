# Worktrees

A [Raycast](https://www.raycast.com/) extension for managing Git repositories and their worktrees with ease.

## Features

- **Repository Management**: Add and organize your Git repositories in one place
- **Worktree Browsing**: View all worktrees for each repository with detailed status information
- **Quick Actions**: Open worktrees in your favorite editor, copy paths, or browse in Finder
- **Status Indicators**: Visual indicators for bare, detached, locked, and prunable worktrees
- **Keyboard Shortcuts**: Fast navigation with standard Raycast shortcuts

## Commands

### List Repositories
Browse and manage your tracked Git repositories. View repository details and access worktrees.

### Add Repository
Add new Git repositories to track and manage their worktrees.

## Installation

1. Install the extension from the [Raycast Store](https://www.raycast.com/store)
2. Or install manually:
   ```bash
   git clone https://github.com/wyattjoh/worktrees.git
   cd worktrees
   npm install
   npm run build
   ```

## Usage

1. Use `List Repositories` to view your tracked repositories
2. Add new repositories with `Add Repository`
3. Select a repository to view its worktrees
4. Use keyboard shortcuts for quick actions:
   - `⌘O` - Open in editor
   - `⌘C` - Copy path
   - `⌘⌫` - Remove repository

## Requirements

- [Raycast](https://www.raycast.com/)
- Git repositories with worktrees

## Development

```bash
npm run dev    # Start development mode
npm run build  # Build extension  
npm run lint   # Check code style
```

## License

MIT © [Wyatt Johnson](https://github.com/wyattjoh)