# Curve Courier

Shape a cubic Bézier easing curve, preview its motion and copy the CSS for your interface.

## Comparing motion

Drag either numbered graph handle with a mouse or touch, or tab to it and use the arrow keys. Each arrow press moves 0.01. Hold Shift for steps of 0.1 or Alt for 0.001. Enter or Space takes you to the corresponding X slider. Coordinates and copied CSS update as you edit.

Choose a preset or adjust the control points. **Pin current curve** keeps a dashed reference on the plot. Change the current curve and use **Play motion** to watch both lanes run for the same 900 milliseconds. Reduced-motion mode shows the end positions immediately.

**Copy CSS** copies the current declaration. Under **Import easing CSS**, paste a single cubic-bezier() value or a transition-timing-function or animation-timing-function declaration, then select **Apply curve**. The canvas supports horizontal controls from 0 to 1 and vertical controls from −0.5 to 1.5. A failed import preserves both curves.

## Run locally

Use Node.js 22 or newer to run `node scripts/verify.mjs`. To launch a local preview, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory public` and open http://127.0.0.1:8080.

## Deployment

Vercel serves `public/` directly. The application uses browser platform APIs and ships with no package dependencies.

## Git dates

The initial commits use retrospective author dates from October–November 2026. Their committer timestamps record when this repository was assembled.
