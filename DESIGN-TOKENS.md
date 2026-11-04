# Design Tokens and Motion Spec

A complete specification for rebuilding this site's look and animation for any brand. It contains no brand content: every name, photo, link and line of copy is yours to supply.

**The idea in one line:** a black and crimson page that appears to be built live by a small team of cursors, the way collaborators build a page in a design tool.

Replace anything shown like `{THIS}` with your own content.

---

## 1. Design principles

1. **Black canvas, one loud colour.** Crimson does almost all the work. Other colours appear only as small accents on individual cards.
2. **Huge condensed type.** Headings are oversized, uppercase and tightly set. Type is the main visual.
3. **Cursors are the signature.** Five cursors draw and fill the page on load and on scroll, changing into the right tool for each job.
4. **Text never waits for a cursor in lists.** In long lists, content animates as soon as it enters the screen, and a cursor draws alongside it.
5. **Text, buttons and boxes each get their own tool.** Text gets an I-beam and a text box, buttons get a measuring tape, and boxes are drawn by size. See sections 6 to 8.
6. **Sparse on screen.** Keep to five cursors at most, block-level boxes only, and remove cursors as soon as their work is done.

---

## 2. Colour tokens

```css
:root {
  --bg: #050608;        /* page background */
  --panel: #0b0d12;     /* card base */
  --panel-2: #12151c;   /* card highlight */
  --edge: #20242e;      /* borders and rules */
  --text: #f2f3f5;      /* primary text */
  --body: #c3c7cf;      /* paragraphs */
  --muted: #9298a5;     /* labels and secondary text */
  --red: #e5233b;       /* brand crimson: headings, accents, footer */
  --red-btn: #d01a2f;   /* buttons with white text (passes contrast) */
  --red-deep: #7a0b16;  /* deep shade */
  --blue: #4aa8ff;      /* system diagram lines */
  color-scheme: dark;
}
```

| Use | Value |
|---|---|
| Button hover | `#b9142a` |
| Ink on the crimson footer | `#0a0b0e` |
| Wireframe blue (cursor boxes, handles) | `#2f9bff` |
| Wireframe fill | `rgba(47,155,255,.09)` |
| Word selection fill | `rgba(47,155,255,.42)` |
| Size tag background, active tool | `#1a86e8` |
| Measuring tape, its ink | `#ffd24a`, `#16120a` |
| Modal surface | `#0d0f15`, border `#2a2e39` |
| Tile surface | `#13161e` |
| Status: success, warning | `#1f9d55`, `#b7791f` |
| Form error | `#ff8593` |

**Hero word gradient:**
`linear-gradient(180deg, #f6293f 8%, #d71d33 46%, #6d0a14 82%, #2a0509 100%)`, clipped to the text.

**Card gradient:** `linear-gradient(165deg, #12151c, #0a0c10 70%)`

**Cursor colours, in order:** `#56e0ff`, `#ffd24a`, `#ff6bb0`, `#9b7bff`, `#ffffff`

**Example card accents, one per card:** `#4f9dff`, `#f5814d`, `#c8f542`, `#3ddc84`, `#c15cff`, `#56e0ff`

---

## 3. Typography

All three fonts are free on Google Fonts. Self-host them as `woff2` with `font-display: swap`, and preload the display font.

| Role | Font | Notes |
|---|---|---|
| Display | **Anton** 400 | Always uppercase |
| Body and UI | **Inter Tight** 400 to 700 | Variable font |
| Accent | **Kaushan Script** 400 | Greeting line and footer signature only |
| Highlights | System mono stack | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` |

| Token | Size / line height |
|---|---|
| Body | `clamp(16px, 1.15vw, 18px)` / 1.5 |
| Hero background word | `min(25vw, 50svh)` / 1.05 |
| Hero name | `clamp(68px, 8.6vw, 148px)` / 1.06 |
| Hero role | `clamp(21px, 2vw, 34px)` / 1.16, crimson |
| Greeting (script) | `clamp(28px, 2.9vw, 48px)` / 1.1 |
| Section heading | `clamp(48px, 6.4vw, 110px)` / 1.04 |
| Closing statement | `min(18.6vw, 34svh)` / 1.03 |
| Accordion label | `clamp(46px, 7.4vw, 124px)` / 1.08 |
| Timeline big year | `clamp(96px, 13vw, 220px)` / 1.04 |
| Card title | `clamp(28px, 2.5vw, 40px)` / 1.1 |
| Stat number | `clamp(52px, 5vw, 76px)` / 1.05 |
| Findings mark | `clamp(32px, 3.1vw, 48px)` / 1.1 |
| Findings heading | `clamp(38px, 4.2vw, 66px)` / 1.04 |
| Small label | 15px, weight 500, muted, sentence case |
| Logo | 25px Anton, followed by a crimson full stop |

**Heading pattern:** one white line, then the second line or final words in crimson. Short statements end with a crimson full stop.

---

## 4. Layout and spacing

| Token | Value |
|---|---|
| Page gutter | `clamp(18px, 5vw, 88px)` |
| Section top padding | `clamp(84px, 14svh, 160px)` |
| Card grid | 3 columns, gap `clamp(12px, 1.3vw, 18px)` |
| Split sections | `5fr 7fr`, gap `clamp(30px, 5vw, 90px)` |
| Sticky offset | 96px |

| Radius | Value |
|---|---|
| Buttons | 8px |
| Small buttons | 7px |
| Tags and chips | 5 to 6px |
| Screenshots | 9px |
| Tiles | 12px |
| Cards | 16 to 18px |
| Modal | 18px |
| Page bottom corners | `clamp(24px, 4vw, 56px)` |
| Footer pills | 999px |

**Breakpoints:** 900px (tablet: 2-column cards, nav links hidden), 620px (phone: 1 column), 1700px (wide: card screens become 2:1). Below 900px wide or 760px tall, the footer curtain turns off.

---

## 5. Page structure

Rename the sections to suit the content.

1. **Fixed nav.** Logo, section links, and a "talk" button with a small crimson cursor icon. Turns solid on scroll: `rgba(5,6,8,.86)` with a 12px blur.
2. **Hero, full screen.** A giant word behind a transparent-background portrait, with greeting, name, role, intro and button at bottom left, and three interactive stats at bottom right.
3. **Work.** Three-column cards, each with a mini browser frame.
4. **Also.** A two-column text list of smaller items.
5. **Timeline.** Sticky heading and giant year on the left, rows on the right.
6. **Findings.** A compact bench: a short list on the left, and the chosen item drawn live on a dotted plate on the right.
7. **Capabilities.** Full-width accordion with huge labels.
8. **Closing statement.** Two giant lines and a large round button.
9. **Footer.** Crimson panel revealed behind the page.

**Portrait:** a cut-out on a transparent background, height `104svh`, anchored `-9svh` below the fold and centred, fading out from 72% to 90% of its height. Light it with a soft front key and a thin crimson rim on both sides so it blends with the giant word.

---

## 6. The cursor system

This is the signature effect. Draw it on one full-screen, click-through `<canvas>` above the page (`z-index: 60`, `pointer-events: none`).

### Cursors
- **Count:** 5 on desktop, 3 on phones.
- **Shape:** a small arrow, 15px tall, with a coloured fill and a 1.1px white outline. It rotates to point along its flight path once moving faster than 80px/s.
- **Label:** while working, each cursor shows a small rounded tag in its own colour (700 10px type). Use short role names that suit your team, such as `Copy`, `Design`, `Ads`, `SEO`, `Data`.
- **Movement:** eased chase towards the target, with gain 8, a top speed of 2100px/s, and velocity smoothing of `dt * 14`.
- **Entering and leaving:** cursors enter from the nearest edge. When they have no work, they leave the screen rather than hover over content.

### Page start
1. The page starts blank, and a small pill at the bottom centre reads `Building page 3 of 9` with a **Skip** button.
2. Cursors orbit a small centred monogram for a short scan: 330ms on desktop, 220ms on phones.
3. Thin rulers appear along the top and left edges (12px, ticks every 50px) and fade out once the hero is finished.
4. The hero builds in about 3.5 seconds, with box and fill speed at 1.25×.
5. Other sections build when they scroll into view, at 1.7×.

### Cursors change into tools
A real design tool changes the pointer for each job, so these do too. Every change is a 110ms scale between the arrow and the tool.

**Text: I-beam and text box**
1. The arrow flies to the top-left of the text and becomes a white I-beam with a dark outline.
2. It drags a text box from corner to corner, 6px outside the text sideways and 3px vertically, so the line never cuts a letter. The box has a 1px blue outline, white handles and a `W × H` tag while growing. Duration: `sqrt(width × height) × 1.4`, between 170 and 300ms.
3. A small ripple marks the click, and the text starts typing.
4. It holds 130ms, turns back into an arrow and moves on. The box fades 160ms after the typing ends, over 240ms.

**Buttons: measuring tape**
1. The arrow flies to the button's bottom-left and becomes a small yellow tape dispenser.
2. It pulls a 9px yellow tape along the bottom edge, with ticks every 5px, a longer tick every 25px and a live `N px` reading. The button is revealed behind the tape using `clip-path: inset(-14px Y% -14px -2px)`. Duration: `width × 1.9`, between 240 and 480ms.
3. The tape fades over 220ms, and the cursor holds 90ms, turns back and moves on.

If no cursor is free, a button wipes in by itself with a CSS ruler, so nothing ever waits. One cursor takes at most six of these jobs per block.

### Optional: tools panel
For extra theatre on the first screen only. Hide it on phones and with reduced motion.

- **Panel:** a centred dock 70px above the bottom, on `rgba(13,15,21,.94)` with a 14px radius. Tools: Move, Frame, Text, Image, Shape, Pen, Ruler, Comment. Each is 60px wide, with a 20px line icon over an 11px label. It sits under the cursor canvas and ignores the pointer.
- **Picking up:** before building each hero part, a cursor flies to the matching tool (top speed 2700px/s, at most 560ms). The tool lights `#1a86e8` and lifts 3px for 260ms, and its icon then rides beside the cursor on a small blue square. Text parts use Text, images use Image, the nav and stats use Frame, and button groups use Ruler.
- **Leaving:** it drops away 450ms after the last hero part finishes, on Skip, or as soon as the visitor scrolls past 40px. It does not come back until the page reloads or Replay is pressed.

### Build states
Each block moves through: `waiting → claimed → drawing box → painting → done`.

### Rules that keep it feeling fast
- A cursor only works on blocks that are on screen.
- If the visitor scrolls past a block, drop it and free the cursor.
- A claimed block that has not started painting after 1.3s simply appears.
- A visible block no cursor has claimed after 1.8s simply appears.
- Long lists use "rides": the row animates immediately and a cursor draws around it at the same time, so nothing waits. A ride that cannot start within 500ms is skipped.

---

## 7. Text animations

Split text into spans only when the animation will run. When an animation finishes, restore the plain text, and remove the animation so it costs nothing while scrolling.

**All text types in**, one letter at a time with a thin blue caret, after a cursor has made its text box (section 6). Total typing time scales with length:

| Text | Time per letter | Total |
|---|---|---|
| Large headings | 40ms | 260 to 560ms |
| Everything else | 13ms | 155 to 450ms |

| Other text | Effect | Timing |
|---|---|---|
| Hero giant word | Curtain reveal from bottom to top | up to 460ms |
| Coloured heading words | A cursor drags a blue text selection across them, then they turn from white to crimson. They wait until their heading starts typing | 170ms drag, `.25s` colour |
| Stat numbers | Count up from 0, ease-out cubic, 80ms apart | 650ms |
| Findings mark | Decodes from random characters each time it is chosen | 850ms |
| Timeline year | Rolling digit columns like an odometer | `.7s`, 50ms between digits |

**Stagger:** inside any block, each element starts 55ms after the one before it.

```css
@keyframes chrise  { from { transform: translateY(112%) rotate(5deg); } to { transform: none; } }
@keyframes chslide { from { opacity: 0; transform: translateX(-.35em); } to { opacity: 1; transform: none; } }
@keyframes wdin    { from { opacity: 0; transform: translateY(.5em); } to { opacity: 1; transform: none; } }
@keyframes chtype  { from { opacity: 0; } to { opacity: 1; } }
@keyframes rise    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes typecaret { 0%, 99% { box-shadow: 2px 0 0 #2f9bff; } 100% { box-shadow: 2px 0 0 transparent; } }

/* Letter mask: each word clips the letters rising inside it. */
.word { display: inline-block; overflow: hidden; vertical-align: top; padding: .06em .012em; margin: -.06em -.012em; }
.char { display: inline-block; }
```

---

## 8. Box animations, by size

Choose the treatment from the block's on-screen area.

| Size | Area | Cursor does | Fill |
|---|---|---|---|
| **Large** | 70,000px² or more | Drags from top-left to bottom-right, with blue outline, white corner handles, faint blue fill and a `W × H` tag. The largest hero blocks add full-width guide lines | Wipe, then settle from `scale(.985)` over `.45s` |
| **Medium** | 6,000 to 70,000px² | Traces the perimeter with a thin outline, 260ms, no fill or tag | Fades in over 240ms |
| **Small** | Under 6,000px² | One tap with an expanding ripple ring | Pops from `scale(.6)` to `1.08` to `1`, `.28s` |
| **Text group** | Any block with no background | Fast faint trace, 130ms | The text animates instead |

**Large wipe variations:**

| Block | Reveal | Clip |
|---|---|---|
| Cards | Diagonal | `polygon(0 0, X% 0, 0 X%)`, X runs 0 to 200 |
| Screens and images | Top to bottom | `inset(0 0 Y% 0)` |
| Round buttons | Circle from the corner where the cursor finished | `circle(R% at 100% 100%)`, R runs 0 to 150 |
| Accordion rows, findings plate | Left to right, with a 3px crimson leading edge and a soft glow behind it | `inset(0 Y% 0 0)` |

**Small elements inside a box** each have their own entrance, once the box is done:

| Element | Entrance |
|---|---|
| Chips | Pop: `.42s` |
| Tags | Clip opens from the left: `.38s` |
| Number marks | Rotate from `-14deg` and scale from `.7`: `.5s` |
| Nav links | Drop from `-10px`: `.38s` |

---

## 9. Section choreography

### Hero
- **Pointer depth, desktop only**, with `.09` smoothing. Pointer position runs from `-0.5` to `0.5`:

| Layer | X movement | Y movement | On scroll (0 to 1 screen) |
|---|---|---|---|
| Giant word | -18px | -9px | moves down 150px |
| Portrait | +14px | +7px | moves down 46px |
| Text | -7px | none | moves up 90px, fades out |
| Stats | none, so they hold still under the pointer | none | moves up 130px, fades out |

- When the build finishes, the crimson glow flashes once: `brightness(2.4)` easing back to normal over 1.5s.

### Hero stats
No box. Three outlined numbers in a row, above a 1px rule.

- **Width:** `clamp(300px, 26vw, 400px)`. Below the rule sits a reserved space for one detail, stacking all details in one grid cell, so nothing moves when the choice changes.
- **Choosing:** hover, focus or tap picks one. Its number fills crimson from the bottom like a tank (`background-size` 0 to 100%, `.5s`, clipped to the text), and a 2px crimson bar slides under it with a slight overshoot (`.45s`).
- **Taking turns:** they cycle every 3.6s until someone touches them, and only while on screen.
- **Details:** make each one show what the number means, using real data. For example, a notch per year filling in order, names dropping in 50ms apart, or the latest activity linking out.
- **Build:** starts when the left column's role line is picked up. A cursor traces the box, then the numbers rise 80ms apart and count up, the rule draws (`.4s`), and at about `.6s` the first number fills, followed by the bar and its detail at `.75s`. Everything finishes within 1.5s.

### Work cards
- **Card:** a 2px accent line on top, an outlined number at top right, and an accent-tinted tag.
- **Browser frame:** three small dots, the site address, and a **System** button.
- **Screen and diagram:** hovering a screen wipes it left to right over 480ms to reveal a simple diagram (inputs, centre, outputs) with accent-coloured dots moving along the lines. It wipes back in 380ms. On touch screens, the System button toggles it.
- **Card hover:** glow follows the pointer (`radial-gradient(320px circle at pointer, accent 26%, transparent 70%)`), accent border, corner handles fade in, tilt up to 5° and 6° with a 5px lift, and the screenshot scales to 1.04.
- **Build order:** one cursor does the whole card: frame, screen, then each line of text and each button in turn.

### Also list
- Rows arrive in a wave, 130ms apart. Side-by-side rows start 70ms apart.
- Each row rises 34px from `scale(.97)`, while a 2px crimson top line draws across and a crimson sweep passes through, over `.95s`.
- A cursor traces the row while it arrives (900ms).
- **Hover:** content indents 16px and a 3px crimson bar grows down the left edge.

### Timeline
- **Left column:** sticky heading, giant rolling year, and the current role.
- **Right column:** a 2px rail fills crimson with scroll, and a glowing 12px dot rides it. Each row gets a small crimson tick connecting it to the rail.
- **Active row:** full opacity, shifted 10px right, with its year scaled to 1.18. Other rows sit at 42% opacity.
- **Row entrance:** slides in from 70px right at full brightness with a crimson sweep, the year slides in from 60px at 1.25 scale, then the row dims if not active. A cursor traces it at the same time.

### Findings bench
Keep it to about 480px tall, so the whole section reads at once.

- **Layout:** `1fr 1.55fr`, gap `clamp(28px, 5vw, 88px)`, stacking below 900px.
- **Left:** a small heading, then a list of items between 1px rules. Each has an outlined display mark and a small title. The chosen one fills crimson with a 2px crimson bar on its left, and its mark decodes.
- **Right:** the plate has a dot grid (1px dots every 22px), a 1px border and two crimson corner brackets at top left and bottom right. All panes share one grid cell, so nothing moves on change.
- **Drawings:** give each item an SVG specific to its subject, such as branches, a grid of cells or a node graph, using `pathLength="1"` so lines can draw themselves. Lines draw `.4s` to `.5s` staggered 90 to 120ms, dots pop from `scale(0)` with a 1.25 overshoot, and rows slide in 170ms apart. They replay each time an item is chosen. Mark any drawing that is a concept rather than real data as `Illustration`.
- **Below the drawing:** one sentence, chips and an optional link.
- **Choosing:** hover, focus or tap. They cycle every 6.5s while the section is in view, and pause while hovered.

### Capabilities accordion
- One row is open at a time, opening on hover on desktop and on tap on touch.
- The open row's label turns from `#565b68` to white, with a crimson gradient background: `linear-gradient(90deg, rgba(229,35,59,.32), rgba(229,35,59,.03) 80%)`.
- Height animates via `grid-template-rows: 0fr → 1fr` over `.35s`.
- Chips pop one by one, 40ms apart.

### Closing statement
- Both lines are written letter by letter by a cursor.
- The round button opens as a circle, then pulses a ring continuously: scale 1 to 1.32, fading out, every 2.6s.
- **Magnetic:** it moves 28% of the distance towards a nearby pointer. Hover adds `scale(1.06) rotate(-4deg)`.

### Crimson footer
- **Curtain reveal:** the page has rounded bottom corners, `z-index: 1` and a heavy shadow (`0 30px 70px rgba(0,0,0,.65)`). The footer sits behind it with `position: sticky; bottom: 0; z-index: 0`, so the page lifts away to uncover it. Its content drifts from -90px to 0 as it opens.
- **Marquee:** a giant black uppercase strip between 2px black rules, reading `{WHAT YOU DO} ✦ {WHAT YOU DO} ✦`. It runs at 70px/s and speeds up with scroll velocity, decaying by `.92` per frame.
- **Signature:** your name in white script, written left to right by a cursor over about 1.5s with a small hand wobble.
- **Pills:** 2px black outline. On hover, black fills from the point where the pointer entered: a circle scaling from 0, `.5s`. Pills lean slightly towards a pointer within 90px.
- **Bottom row:** copyright, a live local clock with seconds and a pulsing dot, and a back-to-top button whose ring shows scroll progress.
- **Entrance:** starts when the footer is 18% revealed. The signature writes first, then the pills and text land 50ms apart with a slight overshoot. The page tools hide once the footer is 45% revealed.

### Contact window
- The "talk" button opens a modal, and the cursors build it live, 1.7× faster than page blocks.
- The page behind dims to `rgba(3,4,6,.78)` with a 5px blur.
- **Options view:** a highlighted "send a message" tile, then tiles for email, phone, and links.
- **Form view:** choosing to send a message rebuilds the window around the form.
- **Status view:** pressing send rebuilds it again as a live checklist that reports what really happened: request sent, saved, notification sent. Each row shows a spinner, then a tick, a warning or a cross.

---

## 10. Global interactions

- **Scroll progress:** a 2px crimson line across the very top of the screen.
- **Nav underline:** a 2px crimson line draws under the active section's link, `.3s`. The active section is whichever crosses the middle of the screen.
- **Page tools:** small **Inspect** and **Replay** buttons at bottom right. Inspect shows a crimson outline, guide lines and a size tag on whatever is hovered. Replay rebuilds the page.
- **Keyboard:** `Esc` skips the build or closes the window, `R` replays, `I` toggles Inspect.

---

## 11. Easing reference

| Name | Value | Use |
|---|---|---|
| Soft out | `cubic-bezier(.2,.8,.2,1)` | Most hover and UI movement |
| Strong out | `cubic-bezier(.16,1,.3,1)` | Row entrances |
| Overshoot | `cubic-bezier(.2,1.2,.3,1)` | Buttons, number marks |
| Letter rise | `cubic-bezier(.2,.9,.25,1)` | Heading letters, settle |
| In and out | `cubic-bezier(.65,0,.35,1)` | Lines, tag opening |
| Roll | `cubic-bezier(.7,0,.2,1)` | Text roll on buttons |

---

## 12. Accessibility and performance rules

These are part of the design, not optional extras.

- **Reduced motion:** with `prefers-reduced-motion`, skip the build entirely and show the finished page.
- **Search crawlers:** skip the build and text splitting, so all content is immediately readable.
- **Failure safety:** if the script fails or has not started within 4 seconds, remove the hidden state and show the content. The page must never stay blank.
- **Contrast:** use `--red-btn` under white button text, because white on `--red` falls short of 4.5:1.
- **Focus:** every control gets a visible focus outline (2px white, or black on the footer).
- **Screen readers:** when splitting a heading into letters, keep its full text in an `aria-label`.
- **Modal:** trap focus, close on `Esc`, make the page behind inert, and return focus on close.
- **Motion cost:** animate `transform`, `opacity` and `clip-path` only. Never set a frequently changing CSS variable on a parent of lots of text, because it forces every child to recalculate. Write directly to the element that moves.
- **Loading:** self-host fonts, use WebP images with explicit width and height, lazy-load below the fold, and pause moving diagram dots while hidden.
- **Touch:** turn off pointer parallax, tilt, magnetic effects and Inspect.

---

## 13. Content checklist

Before building, gather:

- [ ] Name, logo text, role and a one-sentence intro
- [ ] Transparent-background portrait or product image
- [ ] A giant hero word
- [ ] Three stats, each with a real detail behind it
- [ ] Up to six work items: title, one line, three tags, screenshot, link, accent colour
- [ ] Diagram content for each work item: inputs, centre, outputs, caption
- [ ] Smaller list items
- [ ] Timeline: role, organisation, year, one sentence each
- [ ] Three findings, each with a short big mark, a title, one sentence, chips and an idea for a drawing
- [ ] Capability groups with chips and one sentence
- [ ] Contact details, social links and a downloadable file if needed
- [ ] Marquee phrases and the name for the signature
- [ ] Five short cursor labels

---

## 14. Prompt for building from this file

> Build a single-page website from `DESIGN-TOKENS.md`. Follow every token, timing and rule exactly, and use vanilla HTML, CSS and JavaScript with no animation libraries. Draw the cursors on one full-screen canvas. Use only the content I provide below, and ask me for anything on the checklist in section 13 that is missing. Test on desktop and phone, with reduced motion on, and make sure content can never stay hidden.
>
> {PASTE YOUR CONTENT HERE}
