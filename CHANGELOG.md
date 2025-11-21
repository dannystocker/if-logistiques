# Changelog

## 2025-11-21
- Upgraded `lucide-react` to `^0.554.0` to satisfy React 19 peer requirements and allow clean installs.
- Updated the import map in `index.html` to pull React 19.2.0 and the matching `lucide-react` CDN build so dev server uses the same versions.
- Regenerated `package-lock.json` from a fresh `npm install`; verified `npm run build` succeeds.
