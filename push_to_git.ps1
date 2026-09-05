$git = "C:\Users\DHARMA TEJA\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

Write-Host "Staging all files..."
& $git add .

Write-Host "Committing updates..."
& $git commit -m "fix: Resilient apiFetch fallback and static dist hosting on port 5000

- Built resilient apiFetch utility with automatic failover to direct backend on http://127.0.0.1:5000
- Enabled Express static asset serving and SPA fallback for frontend/dist on port 5000
- Added preview proxy configuration to vite.config.js for port 4173
- Rebuilt frontend production bundle with resilient apiFetch"

Write-Host "Pushing to remote origin main..."
& $git push origin main

Write-Host "Git push complete!"
