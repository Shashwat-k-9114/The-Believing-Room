# Regenerates every deliverable. Needs: Python 3.10+, `pip install -r requirements.txt`, Microsoft PowerPoint (Windows).
#   powershell -File build_all.ps1
# (If your execution policy blocks scripts, run it from an already-open PowerShell session with: & .\build_all.ps1)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python src\build_deck.py                                   # writes the PPTX, speaker notes (SPEAKER_NOTES.md)
& .\src\ppt_inspect.ps1 -Path The_Believing_Room_BIT_Noida.pptx -ExportDir previews -Pdf The_Believing_Room_BIT_Noida.pdf
python src\contact_sheet.py previews presentation_contact_sheet.png
& .\src\timeline_dump.ps1                                  # PowerPoint's own reading of animations/transitions
python src\verify.py                                       # package integrity, hyperlink, QR decode
