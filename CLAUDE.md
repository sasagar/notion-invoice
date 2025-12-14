# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BKTSK Notion Invoice is a Japanese-language invoice management system built with Next.js 16 (App Router). It integrates with Notion as the data source and Supabase for authentication and credential storage. The app generates printable PDF invoices and estimates with Japanese formatting, tax calculations, and withholding tax computations.

## Development Commands

```bash
pnpm dev          # Start dev server with Turbo (port 3000)
pnpm build        # Production build
pnpm start        # Start production server (port 3080)
pnpm lint         # Run ESLint
```

## Architecture

### Route Groups (App Router)

- `app/(screen)/` - Main authenticated application routes
- `app/(print)/` - Print-only routes for PDF generation (invoice/estimate)
- `app/(callback)/` - OAuth callback handler for Supabase auth
- `app/api/` - API routes for Puppeteer PDF generation

### Parallel Routes Pattern

The app uses Next.js parallel routes (`@segment`) extensively:

- `invoice/@sidebar` - Dynamic sidebar navigation
- `invoice/(item)/@invoiceHeader`, `@invoiceDetail`, `@invoiceInfo` - Invoice detail segments
- `user/@notion`, `@profile` - User settings segments

### Key Utilities (`app/(screen)/_utils/`)

- `crypto/` - AES-256-CFB encryption for Notion credentials (uses `CRYPTO_KEY`, `CRYPTO_IV` env vars)
- `notion/` - Notion API integration and data fetching
- `supabase/` - Supabase client setup (SSR pattern)
- `properties/` - Notion property extractors and formatters

### Data Flow

1. User authenticates via Supabase (email/password + Turnstile CAPTCHA)
2. Encrypted Notion credentials stored in Supabase `notion` table
3. Credentials decrypted server-side for Notion API calls
4. Invoice data fetched from Notion, processed through `invoiceSanitizer()`
5. Print routes render invoice HTML, Puppeteer generates PDF via `/api/print/`

### Invoice Calculations (`invoiceSanitizer.js`)

- Tax modes: 10%, 8%, or non-taxable per line item
- Tax inclusion logic for both included and excluded pricing
- Withholding tax: 10.21% deduction for non-exempt invoices
- Formula: `invoice_sum = sum + tax + withholding`

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase
- `CRYPTO_KEY`, `CRYPTO_IV` - Credential encryption (AES-256-CFB)
- `PUPPETEER_API_KEY` - PDF API route security
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare CAPTCHA

Optional:

- `NEXT_PUBLIC_PER_PAGE` - Pagination size (default in code)

## Configuration Notes

- Revalidation: 30 seconds for invoice pages (ISR)
- Remote images: AWS S3 and Gravatar patterns allowed
- Server Actions: Allowed from localhost:3000 and invoice.bktsk.com
- Production port: 3080

## Styling

Uses Tailwind CSS v4 with CSS-based configuration:

- Custom colors defined in `@theme` blocks (e.g., `kent-blue-*`)
- `@reference "tailwindcss"` required in CSS files using `@apply`
- Print styles in separate `print.css` files

## Language

- UI and code comments are in Japanese
- Uses `M_PLUS_1` Google font for Japanese typography
- Date formatting with `date-fns` Japanese locale
