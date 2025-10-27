# Task Site (Simple Tasks App)

Small browser-based task app that stores tasks in localStorage. This workspace contains a simple static HTML+CSS+JS app you can open locally.

Files
- `taskSite.html` — main UI. Open this in a browser to use the app.
- `taskSite.css` — styles.
- `taskSite.js` — application logic (validation, persistence, rendering).
- `dateUtils.js` — shared date/time parsing and validation utilities (works in browser and Node).
- `serve.ps1` — small PowerShell helper to start a local static server and open the page.

How to run

Option A — Open the file directly (quick)
- Double-click `taskSite.html` in File Explorer or run from PowerShell:

Option B — Run a simple local static server (recommended)
- Using Python (works if Python is installed):

```powershell
# from the project root
python -m http.server 8000
# then open http://localhost:8000/taskSite.html in your browser
```

- Or use the provided PowerShell helper which launches a Python server in a new process and opens the page:

```powershell
# From the project root
.\serve.ps1
```

serve.ps1 (what it does)
- Starts `python -m http.server 8000` in a new background process and then opens the default browser at `http://localhost:8000/taskSite.html`.

Notes for developers
- Tests: Unit tests for `dateUtils.js` are planned but not yet added (see `tests/` todo).
- The app stores tasks in localStorage under the key `simple_app_tasks_v1`.
- If you edit JS/CSS, refresh the browser to load changes.

Troubleshooting
- If `python` is not found, install Python (3.x) or run a different static server (Node's `http-server`, VS Code Live Server extension, etc.).

License
- None specified — use as you like.
