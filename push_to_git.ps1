$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git -or -not (Test-Path $git)) {
  $git = "C:\Users\Dell\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
}

Write-Host "Staging all files..."
& $git add -A

$status = & $git status --porcelain
if ($status) {
  Write-Host "Committing updates..."
  & $git commit -m "feat(clinical-intelligence): Complete implementation of Tier 1 clinical features"
}

Write-Host "Pushing to remote origin main..."
& $git push origin main

Write-Host "Git push complete!"
