{  # noqa: B018  # pyright: ignore[reportUnusedExpression]
    "name": "Blog Footnotes",
    "version": "18.0.1.0.0",
    "category": "Website/Website",
    "summary": "Add footnotes content block for blog articles and dynamic content",
    "description": """
        Blog Footnotes Module
        =====================

        This module adds a custom footnotes content block for use in blog articles
        and other dynamic content areas.

        Features:
        ---------
        * Custom footnotes snippet for website builder
        * Support for dynamic content blocks
        * Easy-to-use drag-and-drop interface
        * Automatic footnote numbering
        * Responsive design
        * Markdown-style footnote parsing ([^1] format)

        Usage:
        ------
        1. Go to Website → Edit
        2. Drag the "Footnotes" block from the building blocks panel
        3. Add your footnote content
        4. Or use markdown-style references [^1], [^2], etc.
        5. Save and publish
    """,
    "author": "Your Name",
    "website": "https://github.com/yourusername/blog_footnotes",
    "license": "LGPL-3",
    "depends": [
        "base",
        "website",
        "website_blog",
        "web_editor",
    ],
    "data": [
        # Security
        "security/ir.model.access.csv",
        # Views and Snippets
        "views/snippets/s_footnotes.xml",
        "views/snippets/snippets.xml",
    ],
    "demo": [
        "demo/demo_data.xml",
    ],
    "images": [
        "static/description/icon.png",
        "static/src/img/snippets_thumbs/s_footnotes.svg",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}
