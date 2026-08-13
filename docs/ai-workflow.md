# AI workflow notes

This build was done with an agentic coding tool driving the terminal, with me
directing and reviewing. Notes on what that actually looked like, since the
interesting part isn't "I used AI" but where it earned its keep and where it
didn't.

## What I delegated

**Everything mechanical about reading the source.** The 148 KB prototype is one
file with two stylesheets, ~1,700 lines of markup and fourteen base64 SVGs.
Rather than scroll it, the agent ran scripts over it: extract both `<style>`
blocks and the script, decode every product image to a real `.svg`, count the
cards per section, list every breakpoint, diff element ids for duplicates.
Several of the findings about the original file — the duplicate `cg`/`wf`/`wf2`
ids, the 18 breakpoints, the four cards with no image above 760px — came out of
that pass rather than out of reading. Grep-shaped questions are exactly what an
agent should be doing.

**The CSS port, one section at a time.** Flattening V1+V2 into a single light
stylesheet is mechanical but long, and it is where a human silently drops a
rule. Doing it per section with the original open next to it kept each diff
reviewable.

**The schema and locale plumbing.** Section schemas, `en.default.json` and
`en.default.schema.json` entries are repetitive and easy to get subtly wrong.
Worth noting: the first attempt rewrote `en.default.schema.json` wholesale with
a JSON serialiser and produced a 110-line diff of pure reformatting on Dawn's
own strings. That is the sort of thing that makes a reviewer stop trusting the
rest of the diff, so it was redone as a targeted insertion — 62 lines added,
one changed.

## Where it failed me

**It invents Liquid that looks right.** Filters inside filter arguments —
`class: 'a-' | append: forloop.index` or `t: amount: x | money` — read fine and
are not valid. Theme Check caught them; without it in the loop they would have
been runtime surprises on a live store.

**It over-fixes.** Twice it improved something the brief asked me to reproduce:
it stretched the bundle tier feature lists so all three CTAs aligned, and it
"fixed" a mobile overflow. The first is a redesign, which the brief calls an
automatic no. The second was worse — the overflow didn't exist. Headless Chrome
clamps the window to ~476px, so `--window-size=375` renders a 476px viewport,
and both the prototype and the build looked broken in the same way. Re-rendering
each inside a 375px iframe showed neither overflows. An agent will happily fix a
bug your measurement invented.

**It writes CSS that works in isolation.** The scoped reset `.pl p { margin: 0 }`
looks harmless and quietly out-specifies every single-class component rule.
That one only surfaced because the rendered output was compared to the original
side by side, not because anyone read the CSS again.

## What made it work

**A verification loop it couldn't talk its way past.** Theme Check after every
section, and headless Chrome screenshots of the prototype (cut down to one
section per page, reveal animations forced on) against a static harness loading
the real theme stylesheets. Three real mismatches came out of that comparison,
none of which would have been found by reading code.

**Specifying before building.** The section list, the data model, and which
things are metaobjects versus section blocks were decided up front and written
down. When the model is settled, the agent's output is reviewable; when it
isn't, it invents a model per section and you get five inconsistent ones.

**Small commits.** Every section is one commit that runs clean. It keeps the
blast radius of a bad suggestion to one reviewable diff.

## What I'd systematise for twenty more of these

1. **A pinned house style, loaded as context.** `pl-` namespacing, `:where()`
   resets, section-scoped ids, `shopify:section:load`/`unload` teardown,
   metafields over hardcoding. Most of the corrections above were the agent not
   knowing a convention that could have been stated once.
2. **Theme Check as a hard gate, not a step.** Nothing gets committed until it
   passes. It catches the specific failure mode agents have with Liquid.
3. **Screenshot diffing as a standard rig.** Per-section reference extraction,
   animations forced on, iframe-pinned viewports at 375/768/1440, images diffed
   rather than eyeballed. This is the single highest-value piece to build once —
   the "pixel-accurate" criterion is otherwise unfalsifiable.
4. **A prototype audit prompt.** The dead-stylesheet, duplicate-id,
   global-id, hardcoded-price, blanket-reduced-motion findings are the same
   findings on every design prototype. That is a checklist an agent can run on
   day one of a project and hand you a list.
5. **Guard the "don't fix it" boundary explicitly.** Tell the agent which
   defects are in scope (semantics, a11y, performance, breakpoints) and which
   are the client's decision (anything visual). Left implicit, it redesigns.
