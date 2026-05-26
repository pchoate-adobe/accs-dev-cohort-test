# Promo Banner Block

Custom commerce block (Module 2, Activity 2-2). Fetches products from Catalog Service GraphQL by category and renders a product grid. No drop-in component.

## Block configuration (DA.live)

Add a key-value table to any page:

| Promo Banner | |
|---|---|
| Category ID | `2` |
| Heading | Summer Essentials |
| Max Products | 4 |

- **Category ID** — Commerce category ID. If omitted, defaults to `2` (root category from `config.json`).
- **Heading** — Section title (default: Featured Products).
- **Max Products** — Number of product cards (default: 4).

## Demo

1. Run `npm start` in `eds-site`.
2. Add the block table above to a page in DA.live and save.
3. Open the page locally; confirm product cards load with image, name, price, and PDP links.

## Integration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `category-id` | string | `2` | Category filter for `productSearch` |
| `heading` | string | Featured Products | Section heading |
| `max-products` | number | 4 | Max products to fetch |

Uses `CS_FETCH_GRAPHQL` and `getProductLink` from `scripts/commerce.js`.
