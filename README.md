# Born Complete

A personal job application by **Marina Rudinsky Kaplan** for the Senior Product Designer
role at Oak, written in Oak's own visual language.

Independent and not affiliated with, endorsed by, or produced by Oak. Reading a brand
closely enough to speak it back is, more or less, the job being applied for.

## Running it

No build step, no dependencies. It is a static page.

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Layout

```
index.html        markup only
css/styles.css    one committed visual world; every colour is a token on :root
js/main.js        fronds, leopard-spot canvas, career graph, scroll reveals, the ask console
assets/           paper art (webp) and the watering-hole loop (mp4)
```

## Notes

- **Type** — Oak sets Gellix and Yowza D, both licensed. This page uses a geometric
  stand-in stack (Avenir Next → Futura → Poppins → system) rather than borrowing their faces.
- **Colour** — the palette is sampled from oak.id's computed styles. The paper art is
  white-balanced onto `#F7F7F2` so it dissolves into the page instead of sitting on it as
  a rectangle.
- **The skyline** is three-sliced: fixed left and right clusters with an 8px middle strip
  that stretches. Every column in that strip is identical, so the stretch cannot show.
- **The career graph** is drawn from the data in `js/main.js`, not screenshotted. The
  overlaps are the point.
- **The ask console** is scripted, not a language model. A static page cannot hold an API
  key, and pretending otherwise would undercut the argument the page is making.
- Motion respects `prefers-reduced-motion`. Reveals have a timeout fallback so the page
  is never blank if IntersectionObserver fails.
