# Restore the aside nav at every width

## Why
The rail only materialises from 1904px up, so on every screen the household
actually uses there is no sidebar — a fixed bottom bar carries navigation
instead. The owner never wanted that bar; losing the aside behind a 1904px
stop was an accident of an earlier story.

## Acceptance Criteria
- [x] No bottom navigation bar exists at any viewport width, mobile included —
      the component is gone from the codebase, not hidden by CSS.
- [x] From 768px up the rail sits in the layout expanded, and the header
      hamburger still collapses it to the icon strip and back.
- [x] Below 768px the same rail opens as an overlay drawer over the content
      from the header hamburger, and closes on Esc, on a backdrop click and on
      navigating to another screen.
- [x] The header shows the hamburger at every width; its brand mark is gone
      (the rail head already carries the brand).
- [x] Every destination in the nav is reachable at 375px and at 1440px.
- [x] No horizontal overflow at 375 / 767 / 768 / 1024 / 1440px.

## Definition of Done
- [x] `npm run lint` clean and `npm run test` green (both tasks).
- [x] `npm run dev` + browser preview at 375px and 1440px: drawer opens and
      closes at 375, rail collapses and expands at 1440, no bottom bar at
      either.

## Tasks
- [x] tasks/01-rail-at-md-drop-bottom-nav.md — delete BottomNav, move the rail
      from the 1904px stop to `md`, header hamburger at every width
- [x] tasks/02-mobile-nav-drawer.md — below `md` the rail opens as an overlay
      drawer from the header hamburger
