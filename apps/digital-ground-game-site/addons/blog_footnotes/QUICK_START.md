# Blog Footnotes - Quick Start Guide

## Installation

1. Go to Apps in Odoo
2. Search for "Blog Footnotes"
3. Click Install

That's it! You're ready to use footnotes.

## Adding Footnotes to Your Content

### Method 1: Drag & Drop (Easiest)

1. Open your blog post in edit mode
2. Click "Edit" in the Website Builder
3. Search for "Footnotes" in the building blocks
4. Drag it into your content
5. Click "Add Footnote" to add items
6. Edit the text in each footnote
7. Save and publish

### Method 2: Markdown Syntax (Fastest)

Use `[^1]`, `[^2]` anywhere in your text:

```html
<p>
  This is my content with a footnote reference.[^1]
  Here's another one.[^2]
</p>

<section class="s_footnotes">
  <ol class="s_footnotes_items">
    <li class="s_footnotes_item" data-footnote-id="1">
      <span class="s_footnotes_number">1</span>
      <div class="s_footnotes_content">
        <p>First footnote content here</p>
      </div>
    </li>
    <li class="s_footnotes_item" data-footnote-id="2">
      <span class="s_footnotes_number">2</span>
      <div class="s_footnotes_content">
        <p>Second footnote content here</p>
      </div>
    </li>
  </ol>
</section>
```

The module automatically converts `[^1]` and `[^2]` to interactive superscript links!

## Customization Options

Once you've added the Footnotes snippet, select it and you'll see options for:

| Option | Choices |
|--------|---------|
| **Title Display** | Show Title, Hide Title |
| **Number Style** | Numbers (1,2,3), Letters (a,b,c), Roman (i,ii,iii), Symbols (*, †, ‡) |
| **Layout** | Standard, Compact, Boxed |
| **Divider Style** | Solid Line, Dashed Line, No Divider |
| **Text Size** | Small, Normal, Large |

## Interactive Features

✓ **Click a reference** → Smoothly scrolls to the footnote with highlight  
✓ **Click back arrow** → Returns to where you were reading  
✓ **Keyboard navigation** → Tab through all references and footnotes  
✓ **Mobile friendly** → Works perfectly on all devices  

## Examples

### Named References (instead of numbers)

```html
<p>React[^react] and Vue[^vue] are popular.</p>

<section class="s_footnotes">
  <li class="s_footnotes_item" data-footnote-id="react">
    <div class="s_footnotes_content">
      <p>React is a JavaScript library for building UIs</p>
    </div>
  </li>
  <li class="s_footnotes_item" data-footnote-id="vue">
    <div class="s_footnotes_content">
      <p>Vue is a progressive JavaScript framework</p>
    </div>
  </li>
</section>
```

### With Links in Footnotes

```html
<p>According to research[^1], footnotes improve readability.</p>

<section class="s_footnotes">
  <li class="s_footnotes_item" data-footnote-id="1">
    <div class="s_footnotes_content">
      <p>Source: <a href="https://example.com">Research Study</a></p>
    </div>
  </li>
</section>
```

## Common Issues

**Q: The references aren't showing up**
- Make sure you have the Footnotes snippet added to your page
- Check that `[^1]` format is exactly correct (no spaces)
- The footnote item must have matching `data-footnote-id="1"`

**Q: Links don't work when clicked**
- Make sure footnote IDs match the reference IDs exactly
- `[^web]` must match `data-footnote-id="web"`

**Q: Styling doesn't look right**
- Clear your browser cache (Ctrl+Shift+Delete)
- Try a different browser to confirm

## Tips & Tricks

💡 **Use descriptive IDs** - `[^web]` is clearer than `[^1]`  
💡 **Order matters** - Footnotes are numbered in the order they appear  
💡 **Add links** - Footnotes can contain links, lists, and formatting  
💡 **Mobile test** - Always preview on mobile before publishing  
💡 **Keep it brief** - Long content belongs in main text, not footnotes  

## Need More Help?

See these files for detailed information:
- `FOOTNOTES_USAGE.md` - Complete documentation
- `FOOTNOTES_FEATURE_SUMMARY.md` - Technical details

Or visit: http://localhost:8069 (your local Odoo instance)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Tab** | Move to next footnote link |
| **Shift+Tab** | Move to previous footnote link |
| **Enter/Space** | Jump to footnote (when focused on reference) |
| **Escape** | Close highlight (on some browsers) |

## Supported ID Formats

✓ Numbers: `[^1]`, `[^2]`, `[^123]`  
✓ Letters: `[^a]`, `[^abc]`  
✓ Mixed: `[^web1]`, `[^react_v18]`  
✗ Spaces not allowed: `[^my note]` won't work  

## Security & Best Practices

- Footnotes support full HTML (links, formatting, etc.)
- Only website designers can add/edit footnotes (access controlled)
- Links in footnotes are safe - same as content links
- Always preview before publishing
- No sensitive information in footnotes if content is public

---

**Ready to add your first footnote? Start with Method 1 above!**
