# Design

Design conventions and implementation details for the website. Project setup
and commands are documented in [README.md](README.md).

## Appearance preferences

The footer's **Appearance** menu contains **Theme**, with **Use device theme**
(`auto`), **Dark theme**, and **Light theme**. Device theme follows system changes
while the page is open, with light as the fallback.
Without JavaScript, the site uses Classic and the device theme.

The build-time `enableCustomPalettes` flag in
[features.ts](src/config/features.ts) defaults to `false`. While disabled, the
site always uses Classic, omits the **Color palette** controls, and ignores
palette changes without reading or overwriting saved palette preferences.
Theme selection and device-theme updates are unaffected. Set the flag to `true`
and rebuild and deploy to restore **Classic (Default)** and **Sea Glass** choices
and apply saved palettes again. Verify both flag states when changing this behavior.

Selections are stored under `seafoam-appearance` and `seafoam-palette`.
Unrecognized values fall back to the defaults; legacy `starlight-theme` values
are ignored. If browser storage is unavailable, a changed preference still
applies to the current page and the footer reports that it could not be saved.
The empty status region remains exposed before an update, with polite, atomic
feedback that does not take focus.

[appearance.ts](src/data/appearance.ts) supplies the option labels and allowed
values to both the provider and controls.
[ThemeProvider.astro](src/components/overrides/ThemeProvider.astro) restores
preferences before first paint and owns state updates, persistence, and system
theme changes. [SitePreferences.astro](src/components/SitePreferences.astro)
renders one disclosure with a visibly labeled theme fieldset and, when enabled,
a palette fieldset, and handles its positioning, dismissal, and focus behavior.
A native popover places the panel above Starlight's fixed header and isolated
content pane. The default Starlight selector remains suppressed.

The root's `data-appearance` stores the choice (`auto`, `light`, or `dark`);
`data-theme` stores only the resolved `light` or `dark` value for Starlight.
`data-palette` selects the palette. CSS sets `color-scheme` from the appearance
choice so palette colors and native controls agree.

## Color palettes

[global.css](src/styles/global.css) imports both
[Classic](src/styles/themes/classic.css) and
[Sea Glass](src/styles/themes/sea-glass.css). Classic defines the fallback roles
on `:root`; Sea Glass overrides them within `:root[data-palette="sea-glass"]`.
Each `light-dark(light, dark)` pair follows the active `color-scheme`.
Typography, spacing, and layout stay outside palette files, and `global.css`
maps shared color roles to Starlight's properties.

| Color roles                                                                                                       | Responsibility                                                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--sf-canvas`, `--sf-surface`                                                                                     | Page background and shared panels                             |
| `--sf-text`, `--sf-text-muted`                                                                                    | Primary and supporting text                                   |
| `--sf-action`, `--sf-on-action`, `--sf-action-hover`, `--sf-action-pressed`                                       | Action fill, foreground, and interaction states               |
| `--sf-link`, `--sf-link-hover`, `--sf-focus`, `--sf-boundary`                                                     | Links, focus indicators, and control boundaries               |
| `--sf-shelly-surface`, `--sf-starfish-surface`, `--sf-aqueous-surface`, `--sf-pearl-surface`, `--sf-pori-surface` | Project-card backgrounds, named independently of their colors |
| `--sf-card-ink`, `--sf-card-border`                                                                               | Project-card text and borders                                 |
| `--sf-card-action-hover`, `--sf-card-action-pressed`, `--sf-on-card-action`                                       | Project-card action states                                    |
| `--sf-hero-seafoam`, `--sf-hero-labs`                                                                             | The two hero-title color roles                                |

New components consume these roles rather than hard-coded theme colors. Keep
link and focus roles distinct even when their values match. Sea Glass assigns
amethyst to Shelly and Pearl, honey to Starfish and Pori, and rose to Aqueous;
Classic uses the canvas with a card border. These choices belong to the palette.

Filled action states derive from each palette's normal fill: hover mixes 90%
of `--sf-action` with 10% black, and press mixes 80% with 20% black, in sRGB.
This darkens the fill while preserving its hue and follows future palette
changes automatically. The label keeps `--sf-on-action` at full opacity;
check its contrast in every state when changing a palette's base colors.

The older product-page gradients and Devario showcase still use the legacy
Tailwind colors in `global.css`, so changing the palette does not yet recolor
every existing treatment.

### Adding a palette

Create a file under `src/styles/themes/` defining the same roles within
`:root[data-palette="your-palette"]`, import it in `global.css`, and add its
value and label to `paletteOptions` in `appearance.ts`. The provider and
controls then accept it without separate value lists. Check text, action, focus,
and boundary contrast in both appearances, including hover and pressed states.

## Actions and links

Shared treatments in `global.css` apply to native elements. Use an anchor with
`href` for navigation and a button for an action; set `type="button"` unless it
submits a form. The existing Starlight `LinkButton` variants use these same
treatments, including hero actions on documentation and product pages.

| Classes                          | Treatment                                                           |
| -------------------------------- | ------------------------------------------------------------------- |
| `sf-action sf-action--secondary` | Outlined action on a neutral surface                                |
| `sf-action sf-action--card`      | Outlined action using the project-card color roles                  |
| `sf-icon-control`                | Icon-only link or button with an accessible name                    |
| `sf-link`                        | Underlined contextual link                                          |
| `sf-nav-link`                    | Navigation link, underlined on hover and when `aria-current="page"` |

Normal actions have a minimum height of 3rem and 1.5rem horizontal padding.
Icon controls have a minimum 2.75rem square target; glyphs are 1.25rem with a
0.5rem gap to labels. Keep at least 0.75rem between adjacent controls in the
owning layout.
Labels wrap and controls grow with their content.

Focus adds a separate 2px outline with a 3px offset, preserving the current fill
and space around the control. Card actions use the card ink for focus.
Keep that outline clear of clipping containers. Contextual links retain their
color after a visit; hover thickens the underline. Shared action and icon buttons
transition their background, text, and border colors over 140ms with `ease-out`
when entering and leaving hover. Press feedback uses 75ms. Footer appearance
triggers use the same color timing. Focus outlines remain immediate, and
reduced-motion preferences disable these transitions.

Use native `disabled` only for an unavailable button, with a visible explanation
at the call site. Disabled buttons do not receive hover or pressed treatments.
Navigation links remain usable; do not simulate a disabled link with these styles.
Unclassed links and buttons keep their existing component or framework styling.

## Typography and icons

Headings use Space Grotesk 600; body text and controls use DM Sans 400/500/600.
The WOFF2 files are self-hosted in [src/assets/fonts/](src/assets/fonts/), with
each family's SIL Open Font License retained alongside the fonts.

The footer's appearance control uses the local
[starfish-and-pearl SVG](src/assets/icons/starfish-pearl.svg) as a 24px alpha
mask. It inherits the control's current color in both themes and palettes,
including hover, focus, and open states. The pearl's curved highlight is a
transparent cutout, so it works on each control background.

## Verification

Run `pnpm run test:theme` to check preference initialization, persistence, and
device-theme updates.

When checking the controls in a browser, select options by clicking the radio,
the label text, and the row padding. All three targets must apply and save the
choice without dismissing the panel, and all use the pointer cursor. Also check
Tab departure and Escape, including after clicking empty panel padding.
