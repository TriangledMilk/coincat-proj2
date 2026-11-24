# Coin collection

A public, shared coin collection that demonstrates creating, reading, updating, and deleting coin records with a native HTML form, an Express API on Netlify Functions, and MongoDB Atlas. Anyone who can access the site can manage entries. There is no login or abuse protection.

## Prerequisites

- Node.js 22 or newer and npm.
- A MongoDB Atlas cluster, a database user with permission to read and write the intended database, and network access configured to permit connections from your development environment and Netlify Functions.
- A MongoDB connection string that includes the intended database name. See MongoDB's documentation for URL-encoding special characters in credentials.

## Run locally

1. Copy `.env.example` to `.env` (do not overwrite an existing file) and set `MONGODB_URI` to your Atlas connection string. Do not commit or share credentials.
2. Run `npm install` and then `npm run dev`. The dev script runs the latest Netlify CLI through `npx`; the first run may ask to install it. Netlify CLI loads variables from `.env` for local development. Open the local URL printed by the CLI.
3. Enter a coin's details and submit it. Enter weight once and choose grams or troy ounces; changing units converts the displayed number using 31.1034768 grams per troy ounce. When saving, the app stores both weight units and calculates actual metal weight from troy ounces multiplied by purity. The shared collection beneath the form will reload from MongoDB.

## API

The API uses JSON. The `SDP2_coin_collection` collection is chosen explicitly; no additional index is created.

- `GET /api/coin-collection` returns the retrieved MongoDB documents as an array, including MongoDB-generated fields.
- `POST /api/coin-collection` and `PUT /api/coin-collection/:id` accept `name`, `circulation_or_bullion`, `gold_or_silver`, `purity`, `count`, `weight_g`, `weight_toz`, `AMW_toz`, `number`, `production_run`, and `description`. `circulation_or_bullion` must be `circulation` or `bullion`; `gold_or_silver` must be `gold` or `silver`; `purity` must be between 0 and 1; `count` and `number` must be non-negative integers. Required text fields are trimmed and limited to 120 characters for `name` and `production_run`, and 2,000 for `description`. A valid create returns HTTP 201; invalid input returns HTTP 400.
- `DELETE /api/coin-collection/:id` deletes the matching coin and returns HTTP 204.

Example request body:

```json
{
  "name": "American Morgan Dollar",
  "circulation_or_bullion": "circulation",
  "gold_or_silver": "silver",
  "purity": 0.925,
  "count": 2,
  "weight_g": 26.73,
  "weight_toz": 0.85944,
  "AMW_toz": 0.79498,
  "number": 2,
  "production_run": "1878-1904, 1921",
  "description": "A United States dollar coin minted from 1878 to 1904, and again in 1921."
}
```

## Deploy on Netlify

Push the project to GitHub and connect the repository in the Netlify dashboard. The checked-in `netlify.toml` supplies the publish directory, function directory, and API rewrite; no build command is needed. In Netlify's environment-variable settings, configure `MONGODB_URI` for the relevant deployment contexts with a scope available to Functions, then deploy. A local `.env` file is not deployed. Use a dedicated least-privileged database user, and ensure Atlas network access permits Netlify's function infrastructure. After deployment, add a coin and reload the page to confirm that it persists. Consider appropriate abuse controls before using this public API for anything beyond a demo.

Automated tests are intentionally outside this demo's scope.
