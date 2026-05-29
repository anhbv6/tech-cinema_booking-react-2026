# Features Architecture

This project uses domain-first feature modules split by audience scope:

- `admin/`: admin-only business logic and UI
- `client/`: end-user business logic and UI
- `shared/`: reusable logic used by both admin and client

## Folder Flow

```text
src/features/
  admin/
    <domain>/
      components/
      schemas/
      services/      # optional
      hooks/         # optional
      types.ts       # optional
      index.ts
    index.ts

  client/
    <domain>/
      components/
      schemas/
      services/      # optional
      hooks/         # optional
      types.ts       # optional
      index.ts
    index.ts

  shared/
    <domain>/
      components/
      schemas/
      services/      # optional
      hooks/         # optional
      types.ts       # optional
      index.ts
    index.ts

  index.ts
```

## Rules

1. `app/*/page.tsx` should stay thin and only compose feature modules.
2. New admin screens must have a matching module under `features/admin/<domain>`.
3. New client screens must have a matching module under `features/client/<domain>`.
4. If a module is reused by both sides, move it to `features/shared/<domain>`.
5. Prefer importing through domain barrels:
   - `@/features/admin/<domain>`
   - `@/features/client/<domain>`
   - `@/features/shared/<domain>`
6. Avoid placing feature-specific code in generic folders like `src/components` or `src/config`.
7. Keep API route handlers in `src/app/api/*`, but schemas and business-facing types should live in `features/*`.

## Import Direction

- `admin` can import from `shared`, but not from `client`.
- `client` can import from `shared`, but not from `admin`.
- `shared` must not import from `admin` or `client`.

## Naming

- Components: `kebab-case.tsx` (file), `PascalCase` (export).
- Schema files: `<domain>.schema.ts`.
- Domain entrypoint: `index.ts`.
