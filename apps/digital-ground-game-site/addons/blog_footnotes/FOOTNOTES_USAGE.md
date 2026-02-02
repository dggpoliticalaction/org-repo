# Blog Footnotes Module - Usage Guide

## Overview

The Blog Footnotes module adds comprehensive footnote functionality to your Odoo website. It supports both manual footnote creation through the UI and automatic markdown-style footnote parsing.

## Features

- **Manual Footnotes**: Create footnotes directly through the snippet interface
- **Markdown Support**: Automatically parse markdown-style footnote references (`[^1]`, `[^2]`, etc.)
- **Interactive Navigation**: Click footnotes to jump to content and back
- **Customizable Styling**: Multiple layout, numbering, and divider options
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and screen reader support

## Installation

1. Activate the `blog_footnotes` module in Odoo
2. The module will automatically register the "Footnotes" snippet in the Website Builder
3. Access it from: Website → Edit → Building Blocks → Content section

## Quick Start

### Method 1: Manual Footnotes via UI

1. Open your blog post or page in edit mode
2. Go to the Website Builder
3. Search for or navigate to the "Footnotes" snippet in the Content group
4. Drag it into your content area
5. Add footnote items by clicking "Add Footnote"
6. Edit each footnote's text content
7. Reference numbers are automatic

### Method 2: Markdown Footnote References

The module automatically parses markdown-style footnote references anywhere in your content:

#### Basic Syntax

```html
<p>This is some text with a footnote reference.[^1]</p>

<p>Here's another reference.[^2]</p>

<!-- Footnotes Section -->
<section class="s_footnotes">
  <ol class="s_footnotes_items">
    <li class="s_footnotes_item" data-footnote-id="1">
      <span class="s_footnotes_number">1</span>
      <div class="s_footnotes_content">
        <p>This is the content of the first footnote.</p>
      </div>
    </li>
    <li class="s_footnotes_item" data-footnote-id="2">
      <span class="s_footnotes_number">2</span>
      <div class="s_footnotes_content">
        <p>This is the content of the second footnote.</p>
      </div>
    </li>
  </ol>
</section>
```

#### How It Works

1. **Reference Parsing**: The module scans your content for `[^id]` patterns
2. **Automatic Linking**: References are converted to clickable superscript links
3. **ID Mapping**: Each reference is linked to a corresponding footnote item by ID
4. **Back Navigation**: Footnotes include "back to reference" links for easy navigation

#### Example

```html
<!-- Content with markdown references -->
<p>
  Web development has evolved dramatically.[^web] 
  React is widely adopted.[^react]
</p>

<!-- Footnotes block will automatically recognize [^web] and [^react] -->
<section class="s_footnotes">
  <ol class="s_footnotes_items">
    <li class="s_footnotes_item" data-footnote-id="web">
      <span class="s_footnotes_number">1</span>
      <div class="s_footnotes_content">
        <p>Web development has evolved dramatically over the past decade.</p>
      </div>
    </li>
    <li class="s_footnotes_item" data-footnote-id="react">
      <span class="s_footnotes_number">2</span>
      <div class="s_footnotes_content">
        <p>React holds approximately 42% market share as of 2024.</p>
      </div>
    </li>
  </ol>
</section>
```

## Customization Options

### Title Display

- **Show Title** (default): Displays "Footnotes" header
- **Hide Title**: Removes the header section

### Number Style

- **Numbers** (default): 1, 2, 3...
- **Letters**: a, b, c...
- **Roman**: i, ii, iii...
- **Symbols**: *, †, ‡, §, ¶

### Layout

- **Standard** (default): Full-width footnotes with numbers
- **Compact**: Reduced spacing and smaller text
- **Boxed**: Contained in a styled box with background

### Divider Style

- **Solid Line** (default): Separates footnotes from content
- **Dashed Line**: Uses dashed separator
- **No Divider**: Removes separator

### Text Size

- **Small**: Reduced font size (0.8rem)
- **Normal** (default): Standard size (0.9rem)
- **Large**: Larger text (1rem)

## Styling and CSS Classes

### Key CSS Classes

```css
/* Main container */
.s_footnotes

/* Footnotes list */
.s_footnotes_items
.s_footnotes_item

/* Individual footnote parts */
.s_footnotes_number      /* Number/letter marker */
.s_footnotes_content     /* Footnote text */
.s_footnote_back_link    /* Back-to-reference link */

/* Inline references */
.s_footnote_ref          /* Superscript reference */
.s_footnote_link         /* Reference link */
.s_footnote_ref_number   /* Reference number */

/* Style variant classes */
.s_footnotes_alpha       /* Alphabetic numbering */
.s_footnotes_roman       /* Roman numerals */
.s_footnotes_symbols     /* Symbol markers */
.s_footnotes_compact     /* Compact layout */
.s_footnotes_boxed       /* Boxed layout */
.s_footnotes_dashed      /* Dashed divider */
.s_footnotes_no_divider  /* No divider */
.s_footnotes_small       /* Small text */
.s_footnotes_large       /* Large text */
.s_footnotes_no_title    /* Hidden title */
```

### Customizing Appearance

Edit the SCSS file at:
```
addons/blog_footnotes/static/src/scss/s_footnotes.scss
```

Common customizations:

```scss
/* Change footnote background color */
.s_footnotes_item::before {
  background-color: #e3f2fd;
}

/* Change highlight animation color */
@keyframes footnote-highlight {
  0% {
    background-color: rgba(255, 193, 7, 0.5);
  }
  100% {
    background-color: transparent;
  }
}

/* Change link color */
.s_footnote_link {
  color: #1976d2;
}

/* Change boxed background */
.s_footnotes.s_footnotes_boxed {
  background-color: #f5f5f5;
}
```

## JavaScript API

The module exports the `MarkdownFootnoteParser` class for advanced use cases:

```javascript
import { MarkdownFootnoteParser } from 'blog_footnotes/static/src/js/s_footnotes';

// Parse an element for markdown footnotes
const result = MarkdownFootnoteParser.parse(document.querySelector('.content'));

// result.references - Map of found references
// result.definitions - Map of found definitions
```

## Interactive Features

### Smooth Scrolling

- Click on a footnote reference to smoothly scroll to the footnote
- Click the back arrow in a footnote to return to the reference
- Current target is highlighted with a yellow background

### Keyboard Navigation

- **Tab**: Navigate through all footnote links
- **Enter/Space**: Trigger scroll to footnote
- **Shift+Tab**: Navigate backwards

### Mobile Support

- Footnotes are fully responsive
- Touch-friendly link sizes
- Adaptive layout on small screens

## Troubleshooting

### Footnotes Not Appearing

1. **Check the snippet is added**: Ensure the Footnotes snippet is in your page
2. **Verify IDs match**: Footnote references must have `data-footnote-ref` attributes matching footnote IDs
3. **Check CSS loading**: Ensure `/blog_footnotes/static/src/scss/s_footnotes.scss` is loaded

### References Not Linking

1. **Verify markdown format**: Use exact format `[^1]`, `[^2]`, etc.
2. **Check footnote exists**: Each reference must have a corresponding footnote item
3. **Clear browser cache**: Old cached assets may cause issues

### Styling Issues

1. **Check color variables**: Footnotes use Odoo color system (`o-cc1`, `o-cc2`)
2. **Override in custom CSS**: Add styles after footnotes.scss loads
3. **Inspect with browser tools**: Check what classes are actually applied

## Best Practices

1. **Keep footnotes brief**: Long footnotes should be secondary content
2. **Use clear IDs**: When manually creating footnotes, use simple numeric IDs (1, 2, 3...)
3. **Order matters**: Footnotes are numbered in document order
4. **Mobile first**: Test on mobile devices to ensure readability
5. **Accessibility**: Always add meaningful content, not just citations
6. **Link validation**: Check that links in footnotes are working
7. **Backup content**: Important information shouldn't only be in footnotes

## Performance

- **Lightweight**: < 5KB minified CSS and JS combined
- **No dependencies**: Uses vanilla JavaScript and Odoo APIs
- **Lazy loaded**: Assets only loaded when snippet is used
- **Fast parsing**: Markdown parsing happens on page load, not on input

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (use footnotes without markdown)

## Accessibility

The module is built with accessibility in mind:

- Proper ARIA labels for screen readers
- Keyboard navigation fully supported
- High contrast for footnote references
- Focus indicators for keyboard users
- Semantic HTML structure

## Advanced: Custom Numbering Schemes

To create custom numbering (beyond the built-in options), add custom CSS:

```scss
.s_footnotes.my-custom-numbering {
  .s_footnotes_items {
    .s_footnotes_item::before {
      content: 'Note ' counter(footnote-counter) ':';
    }
  }
}
```

Then apply the `my-custom-numbering` class to your footnotes section.

## Development

### File Structure

```
addons/blog_footnotes/
├── __init__.py
├── __manifest__.py
├── models/
│   └── footnote.py           # Data model
├── views/
│   └── snippets/
│       ├── s_footnotes.xml    # Snippet template
│       └── snippets.xml       # Registration & options
├── static/src/
│   ├── js/
│   │   ├── s_footnotes.js     # Frontend logic
│   │   └── s_footnotes_options.js
│   └── scss/
│       └── s_footnotes.scss   # Styles
├── security/
│   └── ir.model.access.csv
└── demo/
    └── demo_data.xml
```

### Extending the Module

To add custom functionality:

1. Override the `FootnotesSnippet` widget in `s_footnotes.js`
2. Add custom SCSS variables in your theme
3. Create custom snippet templates extending `s_footnotes.xml`

## License

This module is licensed under LGPL-3.0. See the LICENSE file for details.

## Support

For issues, questions, or feature requests, please contact the module maintainer or refer to the Odoo documentation.
