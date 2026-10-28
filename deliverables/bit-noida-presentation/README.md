# The Believing Room: BIT Noida presentation

Nine-slide, 16:9, editable PowerPoint with native animations and transitions. Target 6 to 8 minutes.

## Files
| File | What it is |
|---|---|
| `The_Believing_Room_BIT_Noida.pptx` | The deck. Native text, shapes and animations; speaker notes on every slide |
| `The_Believing_Room_BIT_Noida.pdf` | Static backup (final state of every slide) |
| `previews/slide-01..09.png` | Full-size slide renders (2560 x 1440) from PowerPoint |
| `presentation_contact_sheet.png` | All nine slides on one sheet |
| `SPEAKER_NOTES.md` | Same talking points as the PowerPoint notes |
| `QA_REPORT.md` | What was tested, what passed, what could not be verified |
| `audit/BRANDING_AUDIT.md` | What was taken from the website and what was left out |
| `audit/powerpoint_timeline.txt` | Every animation and transition as PowerPoint itself parsed it |

## Presenting
- Advance with click or arrow key. Slide 1 builds by itself (about 6 s). Click-driven builds: slide 2 (1 click), 3 (1), 4 (1, the "16" reveal), 5 (1), 6 (2), 7 (1), 8 (1 for the second line). Slide 9 builds by itself and then holds.
- Transitions: Morph into slides 2, 4, 6 and 9 (shared ribbons, glows and spotlight move between slides), Doors into slide 3, Fade into 5, 7 and 8. Morph needs PowerPoint 2019 or later or Microsoft 365; older versions fall back to a fade automatically.
- Fonts are Georgia, Cambria and Calibri (installed with Office on Windows and macOS), so nothing needs embedding.
- Keep the PDF open in another window as the emergency fallback. It shows every slide in its finished state.

## Regenerate
```
pip install -r requirements.txt
powershell -File build_all.ps1
```
That runs, in order: `src/build_deck.py` (writes the PPTX and `SPEAKER_NOTES.md`), PowerPoint export of PNGs and PDF (`src/ppt_inspect.ps1`, needs desktop PowerPoint on Windows), the contact sheet, a dump of PowerPoint's parsed animation timeline, and `src/verify.py` (package checks, link check, QR decode).

To rebuild only the PPTX and notes on any OS: `python src/build_deck.py`.

## Source layout
- `src/ooxml.py`: small PresentationML writer (shapes, Bezier geometry, gradients with alpha, groups, pictures, animation timing trees, transitions, notes).
- `src/build_deck.py`: slide content, palette, copy, notes, QR generation. Change copy, colours, fonts and the apply URL here.
- `assets/`: the three brand images embedded in the deck, copied from the website repo.
- `fonts/`: Space Grotesk and DM Sans (SIL OFL) variable files and static cuts, optional.

## Editing notes
Ribbons, glows and the spotlight cone are named `!!rib1`, `!!glow1`, `!!cone` and so on. PowerPoint's Morph matches objects by name, so keep the `!!` prefix if you edit or duplicate them. The QR code is a native vector shape generated from `APPLY_URL` in `src/build_deck.py`; changing the URL there regenerates it.
