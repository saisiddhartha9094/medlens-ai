$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git -or -not (Test-Path $git)) {
  $git = "C:\Users\Dell\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
}

Write-Host "Staging Vercel deployment files..."
& $git add vercel.json api/ package.json backend/src/server.js backend/src/data/db.json

Write-Host "Committing updates..."
& $git commit -m "feat(deploy): Configure full-stack Vercel deployment and serverless API

- Added vercel.json with Vite build configuration and /api route rewrites
- Created api/index.js Vercel serverless function entry point
- Configured npm workspaces in root package.json
- Enabled Vercel environment checks and .vercel.app CORS support in server.js"

Write-Host "Pushing to remote origin main..."
& $git push origin main

Write-Host "Git push complete!"
