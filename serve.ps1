# serve.ps1
# Start a simple Python HTTP server in a new process and open the default browser
param(
    [int]$Port = 8000
)

Write-Host "Starting simple HTTP server on port $Port..."
Start-Process -FilePath "python" -ArgumentList "-m","http.server","$Port"
Start-Sleep -Seconds 1
Write-Host "Opening http://localhost:$Port/taskSite.html"
Start-Process "http://localhost:$Port/taskSite.html"

Write-Host "Server started (background). Use Ctrl+C in the Python process window to stop it, or stop the process via Task Manager."
