"""Footnote model for blog articles and dynamic content blocks."""

from typing import Any

from odoo import api, fields, models
from odoo.tools.translate import _


class BlogFootnote(models.Model):
    """Model for managing footnotes in blog posts and content blocks.

    This model stores individual footnotes that can be referenced within
    blog articles and other dynamic content areas.
    """

    _name = "blog.footnote"
    _description = "Blog Footnote"
    _order = "sequence, id"
    _rec_name = "reference_text"

    # Basic fields
    reference_text = fields.Char(
        string="Reference Text",
        required=True,
        help="The text that will appear as a superscript reference (e.g., '[1]')",
    )

    content = fields.Html(
        string="Footnote Content",
        required=True,
        sanitize=False,
        help="The actual footnote content that appears at the bottom",
    )

    sequence = fields.Integer(
        string="Sequence",
        default=10,
        help="Order in which footnotes appear",
    )

    # Relational fields
    blog_post_id = fields.Many2one(
        "blog.post",
        string="Blog Post",
        ondelete="cascade",
        index=True,
        help="The blog post this footnote belongs to",
    )

    # Display fields
    active = fields.Boolean(
        default=True,
        help="If unchecked, the footnote will be hidden without deleting it",
    )

    # Computed fields
    display_name_custom = fields.Char(
        string="Display Name",
        compute="_compute_display_name_custom",
        store=True,
    )

    @api.depends("reference_text", "sequence")
    def _compute_display_name_custom(self) -> None:
        """Compute a readable display name for the footnote."""
        for record in self:
            if record.reference_text:
                record.display_name_custom = f"Footnote {record.sequence}: {record.reference_text}"
            else:
                record.display_name_custom = f"Footnote {record.sequence}"

    def name_get(self) -> list[tuple[int, str]]:
        """Return custom name for the record."""
        result = []
        for record in self:
            name = record.display_name_custom or record.reference_text or f"Footnote {record.id}"
            result.append((record.id, name))
        return result

    @api.model_create_multi
    def create(self, vals_list: list[dict[str, Any]]) -> "BlogFootnote":
        """Override create to auto-assign sequence if not provided."""
        for vals in vals_list:
            if "sequence" not in vals and "blog_post_id" in vals:
                # Auto-assign next sequence number for this blog post
                last_footnote = self.search(
                    [("blog_post_id", "=", vals["blog_post_id"])],
                    order="sequence desc",
                    limit=1,
                )
                vals["sequence"] = (last_footnote.sequence + 10) if last_footnote else 10

        return super().create(vals_list)

    def copy(self, default: dict[str, Any] | None = None) -> "BlogFootnote":
        """Override copy to handle footnote duplication."""
        default = dict(default or {})
        if "reference_text" not in default:
            default["reference_text"] = _("%s (copy)") % self.reference_text
        return super().copy(default)


class BlogPost(models.Model):
    """Extend blog.post model to add footnotes support."""

    _inherit = "blog.post"

    footnote_ids = fields.One2many(
        "blog.footnote",
        "blog_post_id",
        string="Footnotes",
        help="Footnotes for this blog post",
    )

    footnote_count = fields.Integer(
        string="Number of Footnotes",
        compute="_compute_footnote_count",
        store=True,
    )

    @api.depends("footnote_ids")
    def _compute_footnote_count(self) -> None:
        """Compute the number of footnotes for this post."""
        for post in self:
            post.footnote_count = len(post.footnote_ids)
