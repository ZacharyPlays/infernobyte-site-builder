# InfernoByte Site Builder Runtime

Next.js template deployed by the Forge agent. Renders published page schema from the InfernoByte panel.

## Setup

1. Push this folder to its own GitHub repo (e.g. `ZacharyPlays/infernobyte-site-builder`)
2. Register the repo on the **Site Builder** product in Admin → Products
3. Customers purchase, complete the setup wizard, design in the **Design** tab, and **Publish**

## Local dev

```bash
npm install
SITE_SCHEMA_URL=http://localhost:3000/api/site-builder/schema \
SITE_ORDER_ID=... \
SITE_SCHEMA_SECRET=... \
npm run dev
```
