# What PowerPoint itself parsed: every animation effect (target, type, trigger, delay, duration) and every transition.
# Also round-trips the deck through PowerPoint (SaveCopyAs) and re-counts effects to prove nothing was dropped.
param([string]$Path = "The_Believing_Room_BIT_Noida.pptx", [string]$Out = "audit\powerpoint_timeline.txt")
$full = (Resolve-Path $Path).Path
$trig = @{1="on click"; 2="with previous"; 3="after previous"}
$eff  = @{10="Fade"; 22="Wipe"; 39="Ascend (float in)"; 48="Faded Zoom"}
$names = @{3849="Fade (smooth)"; 3954="Morph"; 3884="Doors"; 0="none"}
$lines = @()
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($full, $true, $false, $false)
  foreach ($s in $pres.Slides) {
    $t = $s.SlideShowTransition
    $tn = if ($names.ContainsKey([int]$t.EntryEffect)) { $names[[int]$t.EntryEffect] } else { "code " + $t.EntryEffect }
    $lines += ("SLIDE {0}  transition-in: {1} ({2}s)  advance-on-click: {3}  auto-advance: {4}" -f $s.SlideIndex, $tn, $t.Duration, $t.AdvanceOnClick, $t.AdvanceOnTime)
    foreach ($e in $s.TimeLine.MainSequence) {
      $et = if ($eff.ContainsKey([int]$e.EffectType)) { $eff[[int]$e.EffectType] } else { "type " + $e.EffectType }
      $lines += ("    {0,-34} {1,-18} {2,-15} delay {3,4:N2}s  dur {4,4:N2}s  exit={5}" -f $e.Shape.Name, $et, $trig[[int]$e.Timing.TriggerType], $e.Timing.TriggerDelayTime, $e.Timing.Duration, $e.Exit)
    }
  }
  $copy = Join-Path $env:TEMP "tbr_roundtrip.pptx"
  $pres.SaveCopyAs($copy)
  $pres.Close()
  $p2 = $app.Presentations.Open($copy, $true, $false, $false)
  $a = 0; $b = 0
  foreach ($s in $p2.Slides) { $b += $s.TimeLine.MainSequence.Count }
  $p2.Close()
  $p1 = $app.Presentations.Open($full, $true, $false, $false)
  foreach ($s in $p1.Slides) { $a += $s.TimeLine.MainSequence.Count }
  $p1.Close()
  $lines += ""
  $lines += ("Round-trip through PowerPoint SaveCopyAs: effects before = {0}, after = {1}" -f $a, $b)
  Remove-Item $copy -Force -ErrorAction SilentlyContinue
} finally { $app.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null }
New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null
$lines | Out-File -Encoding utf8 $Out
$lines | ForEach-Object { Write-Host $_ }
