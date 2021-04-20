## Guide to working with Semantic-UI styles/themes

_Initial draft_

Styles in Semantic-UI are defined in [Less](<https://en.wikipedia.org/wiki/Less_(stylesheet_language)>) format and compiled to a single .css file for build/dev.

Semantic UI style definitions are found in `./semantic/src`, with the following main files and folders:

- `semantic.less` -- the "root" CSS/LESS file, which imports style definitions from everywhere else. Currently, many component imports are commented out, so we must remember to re-enable them if we use them.
- `theme.less` -- Imports for files containing Less variables **(Don't change)**
- `theme.config` -- A list of components and the theme used to style them (all currently set to "default", we shouldn't need to change this)
- `definitions` -- folder containing primary .less definitions for all components (organised by type). We **DO NOT** edit these files directly.
- `themes` -- folder of available themes. Currently only "default" is present, all others have been zipped into "other_themes.zip"
- `site` -- this is where we edit our customisations. There is a `.variables` and `.overrides` file for each component, as well as global ones.

(From my understanding) The CSS is compiled in the following order, with later definitions taking priority (i.e. they extend or replace prior definitions):

- `definitions/[components (.less)]`
- `definitions/globals/[components (.less)]`
- `themes/[components]/[overrides]`
- `themes/globals/[components]/[overrides]`
- `sites/[components]/[overrides]`
- `sites/globals/[overrides]`

So anything defined in `sites/globals` will take priority and replace any lower/earlier definitions.

**Note**:

1. `[components]` are organised into `collections`, `elements`, `modules` and `views` subfolders.
2. `[overrides]` refers to both the `.overrides` file and `.variables` file. They both "over-ride" their respective values, but `.variables` is for variables and `.overrides` is for CSS/Less definitions.

**VSCode tip:** To get syntax highlighting and auto-complete for `.variables` and `.overrides` files:

- When open, click the “Plain Text” label on the bottom right footer bar
- From the menu that pops up, select “Configure file associations for….”
- Select “LESS”

  These file types will now continue to be interpreted as Less files when opened.

### Less variables

Variables are defined with the `@` prefix, e.g.:

```
@h2 : { font-size: 16px }
@red: { color: #ff0000}
```

They can then be used in place of values anywhere else, e.g.:

```
h2: @h2

.alert: @red
```

There is no restriction about having to define variables before they're used. CSS definitions deep in the component tree seem to be able to refer to variables defined in the parent elements (or later in the same files) quite happily.

Semantic-UI has dozens of built-in variables (global, per-component, and per-theme) with a complex heirarchy, so most of the time over-riding a pre-existing variable value is the best approach.

### Approach to styling

When making changes to styles, it's best to approach it with the following priority:

1. Over-ride variable values (with either a literal or a reference to a new variable)
2. Over-ride or extend pre-existing tag and class definitions
3. (Last resort) create a custom class

For the most part, it's best to put changes at the same "level" as the definition or variable you're over-riding or extending. So, if you're over-riding a definition for a component (i.e. it's originally defined in `definitions/components`), put them in the appropriate component over-ride file (i.e. `site/[components]/[overrides]`).

### Progressive Truthfulness

This from the [Semantic-UI theming docs](https://semantic-ui.com/usage/theming.html), and summarises the way of thinking about styling very nicely:

> [Progressive truthfulness] is perhaps a better way to build models of physical objects...Start with a model that is fully detailed but only resembles what is wanted. Then, one adjusts one attribute after another, bringing the result ever closer to the mental vision of the new creation, or to the real properties of a real-world object ...starting with exemplars that themselves have consistency of style ensures that such consistency is the designer's to lose.

> **Frederick Brooks - The Design of Design**
