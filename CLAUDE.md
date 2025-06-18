# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension for managing Git worktrees. It's built using TypeScript and React with the Raycast API framework.

## Development Commands

- **Development**: `npm run dev` - Start development mode with hot reload
- **Build**: `npm run build` - Build the extension for production
- **Lint**: `npm run lint` - Check code style and quality
- **Fix Lint**: `npm run fix-lint` - Auto-fix linting issues
- **Publish**: `npm run publish` - Publish to Raycast Store

## Architecture

- **Entry Point**: `src/list-worktrees.tsx` - Main command component
- **Framework**: Raycast API with React JSX
- **Language**: TypeScript with strict mode enabled
- **Styling**: Uses Raycast's built-in components and styling system

## Key Components

- Uses `@raycast/api` components: `List`, `ActionPanel`, `Action`, `Icon`
- Commands are defined in `package.json` under the `commands` array
- Each command maps to a TypeScript file in the `src/` directory

## Development Notes

- The extension follows Raycast's extension schema and conventions
- ESLint configuration extends `@raycast/eslint-config`
- TypeScript configuration targets ES2023 with React JSX support
- All source files should be placed in the `src/` directory