$file = "c:\Users\Bharathi\Desktop\-Security-Training-Platform-main\constants.ts"
$content = Get-Content -Path $file -Raw

$content = $content.Replace('"title": "CEH v13",', '"title": "CEH v13", "icon": "ceh",')
$content = $content.Replace('"title": "CISSP",', '"title": "CISSP", "icon": "cissp",')
$content = $content.Replace('"title": "CompTIA CySA+ (CS0-003)",', '"title": "CompTIA CySA+ (CS0-003)", "icon": "cysa",')

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Icons updated successfully."
