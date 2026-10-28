# QA report

Date: 2026-10-27. Tested with Microsoft PowerPoint 16.0.20527 (Home 2024) on Windows 11, driven through COM, plus Python checks. Nothing below is a self-assigned score; each line is either an observed result or a stated gap.

## Passed
**Opens and renders in real PowerPoint**
- The PPTX opens in PowerPoint via COM with no repair error: 9 slides, 13.333 x 7.5 in.
- All nine slides were exported from PowerPoint at 2560 x 1440 and inspected one by one; the PDF was produced by PowerPoint's own PDF export.
- Defects found on first render and fixed: slide 1 occasion line sat on a gold ribbon; slide 2 third line wrapped into a ribbon; slide 3 headline left a one-word last line; slide 4 "RECRUITERS" too close to the right edge and the qualifier clashed with a ribbon; slide 5 headline wrapped; slide 6 labels collided with the headline and path and "Opportunity" split mid-word; slide 7 headline broke as "More than / an / internship."; slide 9 button label was invisible (hyperlink colour on gold), fixed by linking the shape instead of the text. All re-rendered and re-inspected.

**Animations and transitions as PowerPoint parsed them** (`audit/powerpoint_timeline.txt`)
- 65 entrance effects across the deck, each read back with the intended target, type (Fade, Wipe, Faded Zoom, Ascend), trigger (click / with previous / after previous), delay and duration.
- Re-saving the deck through PowerPoint (`SaveCopyAs`) kept all 65 effects.
- Transitions read back as: none (slide 1), Morph (2, 4, 6, 9), Doors (3), Fade (5, 7, 8), with durations of 1.4 to 1.8 s.
- Transitions are slide-level and are reported separately from object animations; the two are not conflated in this report or in the notes.

**Package and content**
- Every XML part is well-formed; every internal relationship target exists; shape IDs are unique per slide; every animation target resolves to a shape (`src/verify.py`).
- Only external reference in the file: `https://www.thebelievingroom.com/register/candidate`. No external images or media; all three images are embedded.
- Apply URL returned HTTP 200 on 2026-10-27. (`/links`, `/register/candidate` and the apex domain were all checked; the apex redirects 308 to `www`, so the `www` form is used directly.) Slide 9 uses the candidate application route rather than `/links`, because it is the one-step destination.
- QR code: native vector shape generated from that URL (error correction Q). Decoded with OpenCV from the rendered slide image to exactly the apply URL, and still decodes after downscaling to 640 x 360.
- Speaker notes are present on all nine slides (about 830 words including stage directions; roughly 6 to 7 minutes at a normal pace with pauses).
- Claims check: no guaranteed internship, selection, interview or offer is stated; "16 recruiters secured" is not converted into companies, jobs or openings; no recruiter names or logos are shown; no fees, participant counts or financial figures; BIT Noida appears only as the venue and the founders' alma mater, with no logo and no partner, sponsor or endorsement wording.

## Could not be verified
1. **Live slideshow playback.** PowerPoint would not open a slideshow window under automation here (`SlideShowWindows.Count` stayed 0 in both full-screen and windowed modes), so animation and Morph playback were not watched. The evidence is PowerPoint's own parsed timeline and the round-trip described above. Please run the deck once in Slide Show mode (F5) on the presenting laptop before the talk, in particular the Morph transitions into slides 2, 4, 6 and 9 and the slide 4 reveal.
2. **Another machine.** Not opened on macOS, PowerPoint for the web, Keynote or Google Slides. Fonts used are standard Office fonts; Morph degrades to a fade outside PowerPoint 2019 and later, and other apps may ignore animations.
3. **QR scan with a phone.** Decoding was tested in software only. Test it from the back of the actual room, on the actual projector.
4. **Embedded fonts.** None are embedded, by choice: the deck uses Georgia, Cambria and Calibri, which ship with Office on Windows and macOS. Installing the brand fonts into the user's profile was not done, so the Space Grotesk / DM Sans option in `fonts/static/` is untested in a render.
5. **Morph and Doors visuals.** Confirmed as parsed transitions, not seen in motion. Morph has been set up with shared `!!`-named objects and no entrance animation on objects that arrive via Morph, which is the arrangement PowerPoint documents.
6. **Schema validation** against the ECMA XSDs was not run (the validator was not available in this environment); well-formedness, relationships and PowerPoint's own open and re-save were used instead.

## Open items for the founders (not defects in the file)
- The website still describes 16 as a "target" and calls the category "Finance & Accounting" (`src/config/site.ts`, `src/content/industries.ts`). The deck follows the brief. The site was not changed.
- The logo banner on slide 1 carries the line "Where Talent Meets Opportunity", while the site's tagline is "Where Opportunity Meets Belief." (used on slide 9).
- `docs/BRAND-ASSETS.md` records that rights to the emblem and wordmark artwork are not established. Confirm before wider distribution of the deck.
- Slide 4 does not name recruiters. If you want logos there once they are confirmed and permitted, there is room under the "secured." line.
