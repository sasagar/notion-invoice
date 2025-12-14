# Code Style and Conventions

## Language & Format

- **Language**: JavaScript (ES Modules)
- **File Extension**: `.js` for components and utilities
- **Config Files**: `.mjs` for ESM config (e.g., `eslint.config.mjs`)

## Biome Configuration

Biomeをフォーマッター兼リンターとして使用:

### Formatter Settings

- **Indent**: 2 spaces
- **Line Width**: 80
- **Quote Style**: Single quotes (`'`)
- **JSX Quote Style**: Single quotes
- **Trailing Commas**: All
- **Semicolons**: Always
- **Arrow Parentheses**: As needed

### Linter

- All rules enabled
- `noDefaultExport`: off（Next.js App Router requires default exports）
- `useNamingConvention`: off
- `noConsoleLog`: off

## ESLint

- `eslint-config-next/core-web-vitals`を拡張

## Tailwind CSS v4

- CSS-based configuration（`tailwind.config.js`は使用しない）
- Custom colors: `@theme`ブロックで定義（e.g., `kent-blue-*`）
- CSSファイルで`@apply`使用時は`@reference "tailwindcss"`が必要
- Print styles: 別ファイル`print.css`に分離

## Naming Conventions

- **Components**: PascalCase（e.g., `InvoiceListRowItem.js`）
- **Utilities**: camelCase（e.g., `invoiceSanitizer.js`）
- **Directories**: lowercase, hyphen-separated for route groups

## File Organization

- Route-specific components: `_components/`ディレクトリ
- Shared utilities: `_utils/`ディレクトリ
- Parallel routes: `@segment`prefix

## Comments & UI Language

- UIおよびコードコメントは日本語
- `M_PLUS_1` Google fontを日本語タイポグラフィに使用
- `date-fns`日本語ロケールで日付フォーマット
