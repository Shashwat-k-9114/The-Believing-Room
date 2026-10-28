param([string]$Path, [string]$ExportDir = "", [string]$Pdf = "")
$ErrorActionPreference = "Stop"
$full = (Resolve-Path $Path).Path
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($full, $true, $false, $false)   # ReadOnly, Untitled:false, WithWindow:false
  Write-Host ("OPENED: {0} slides, size {1}x{2}" -f $pres.Slides.Count, $pres.PageSetup.SlideWidth, $pres.PageSetup.SlideHeight)
  foreach ($s in $pres.Slides) {
    $t = $s.SlideShowTransition
    $seq = $s.TimeLine.MainSequence
    $kinds = @(); foreach ($e in $seq) { $kinds += ("{0}:{1}" -f $e.EffectType, $e.Timing.TriggerType) }
    Write-Host ("slide {0}: shapes={1} entryEffect={2} dur={3} effects={4}" -f $s.SlideIndex, $s.Shapes.Count, $t.EntryEffect, $t.Duration, $seq.Count)
    if ($kinds.Count) { Write-Host ("   " + ($kinds -join " ")) }
  }
  if ($ExportDir) {
    New-Item -ItemType Directory -Force $ExportDir | Out-Null
    $dir = (Resolve-Path $ExportDir).Path
    foreach ($s in $pres.Slides) { $s.Export((Join-Path $dir ("slide-{0:d2}.png" -f $s.SlideIndex)), "PNG", 2560, 1440) }
    Write-Host "exported PNGs to $dir"
  }
  if ($Pdf) {
    $out = if ([IO.Path]::IsPathRooted($Pdf)) { $Pdf } else { Join-Path (Get-Location).Path $Pdf }
    $pres.SaveAs($out, 32)   # ppSaveAsPDF
    Write-Host "pdf: $out"
  }
  $pres.Close()
} finally { $app.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null }
