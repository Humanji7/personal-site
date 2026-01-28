# Content Card Schema (Post‑Void)

## Minimal fields

- `id`: string (stable identifier)
- `title`: string
- `type`: `"thought" | "photo" | "video" | "project" | "artifact"`
- `size`: `"xl" | "l" | "m" | "s" | "text"`
- `locked`: boolean
- `stage`: `{ "x": number, "y": number, "z": number }`
  - `x,y`: stage space `[-1..1]` (NDC)
  - `z`: depth `[0..1]` (0 near, 1 far)
- `href`: string (optional)
- `preview`: `{ "image": string }` (optional)

## Notes

- Stage placement is editorial: avoid overlaps at rest.
- Locking is enforced by entitlement (backend); UI may show a soft lock if unknown.

