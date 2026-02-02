/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

/**
 * Footnotes Snippet Options
 *
 * Provides editing capabilities for the footnotes snippet in the website builder:
 * - Add footnotes with empty placeholder text
 * - Delete only the last footnote
 * - Configure display options (title, numbering, layout, etc.)
 */
options.registry.FootnotesOptions = options.Class.extend({
  events: Object.assign({}, options.Class.prototype.events || {}, {
    "click [data-add-footnote]": "_onAddFootnoteClick",
    "click [data-delete-last-footnote]": "_onDeleteLastFootnoteClick",
  }),

  /**
   * @override
   */
  start: function () {
    this._super.apply(this, arguments);
    this._initializeFootnotes();
    return this._super.apply(this, arguments);
  },

  /**
   * @override
   */
  onBuilt: function () {
    this._renumberFootnotes();
    return this._super.apply(this, arguments);
  },

  //--------------------------------------------------------------------------
  // Event Handlers
  //--------------------------------------------------------------------------

  /**
   * Handle add footnote button click
   *
   * @private
   */
  _onAddFootnoteClick: function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const $list = this.$target.find(".s_footnotes_items");
    const currentCount = $list.find(".s_footnotes_item").length;
    const newNumber = currentCount + 1;

    // Create new empty footnote item with placeholder text
    const $newItem = $(`
      <li class="s_footnotes_item" data-footnote-id="${newNumber}">
        <span class="s_footnotes_number">${newNumber}</span>
        <div class="s_footnotes_content" contenteditable="true">
          <p>Enter your footnote text here...</p>
        </div>
      </li>
    `);

    // Append to list
    $list.append($newItem);

    // Trigger change and renumber
    this._renumberFootnotes();
    // Signal content change to Odoo by marking the snippet as modified
    this.$target[0].classList.add("o_modified");
  },

  /**
   * Handle delete last footnote button click
   *
   * @private
   */
  _onDeleteLastFootnoteClick: function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const $list = this.$target.find(".s_footnotes_items");
    const $items = $list.find(".s_footnotes_item");

    // Only delete if there's more than one footnote
    if ($items.length > 1) {
      const $lastItem = $items.last();
      $lastItem.remove();

      // Trigger change and renumber
      this._renumberFootnotes();
      // Signal content change to Odoo by marking the snippet as modified
      this.$target[0].classList.add("o_modified");
    }
  },

  //--------------------------------------------------------------------------
  // Private Methods
  //--------------------------------------------------------------------------

  /**
   * Initialize footnotes by setting up proper IDs and numbering
   *
   * @private
   */
  _initializeFootnotes: function () {
    const $items = this.$target.find(".s_footnotes_item");

    $items.each((index, item) => {
      const $item = $(item);
      const footnoteId = index + 1;

      // Set unique ID for the footnote
      $item.attr("id", `footnote-${footnoteId}`);
      $item.attr("data-footnote-id", footnoteId);

      // Update the number in the content if needed
      const $number = $item.find(".s_footnotes_number");
      if ($number.length && !$number.text()) {
        $number.text(footnoteId);
      }
    });
  },

  /**
   * Renumber all footnotes sequentially
   *
   * @private
   */
  _renumberFootnotes: function () {
    const $list = this.$target.find(".s_footnotes_items");
    const $items = $list.find(".s_footnotes_item");

    $items.each((index, item) => {
      const $item = $(item);
      const newNumber = index + 1;

      // Update data attribute
      $item.attr("data-footnote-id", newNumber);

      // Update ID
      $item.attr("id", `footnote-${newNumber}`);

      // Update visible number
      const $number = $item.find(".s_footnotes_number");
      if ($number.length) {
        $number.text(newNumber);
      }
    });

    // Also update any references in the page
    this._updateReferences();
  },

  /**
   * Update footnote references throughout the page
   *
   * @private
   */
  _updateReferences: function () {
    const $items = this.$target.find(".s_footnotes_item");
    const footnoteMap = {};

    // Build a map of old to new numbers
    $items.each((index, item) => {
      const $item = $(item);
      const oldId = $item.data("original-id") || index + 1;
      const newId = index + 1;
      footnoteMap[oldId] = newId;
    });

    // Update all references in the document
    const $references = $(".s_footnote_ref");
    $references.each((index, ref) => {
      const $ref = $(ref);
      const refId = $ref.attr("data-footnote-ref");

      if (refId && footnoteMap[refId]) {
        const newId = footnoteMap[refId];
        $ref.attr("data-footnote-ref", newId);

        const $number = $ref.find(".s_footnote_ref_number");
        if ($number.length) {
          $number.text(newId);
        }

        const $link = $ref.find(".s_footnote_link");
        if ($link.length) {
          $link.attr("href", `#footnote-${newId}`);
        }
      }
    });
  },

  /**
   * Clean up snippet when removed
   *
   * @override
   */
  onRemove: function () {
    // Optionally remove orphaned references
    const footnoteSection = this.$target;
    const footnoteIds = [];

    footnoteSection.find(".s_footnotes_item").each((index, item) => {
      footnoteIds.push($(item).attr("data-footnote-id"));
    });

    // Find and mark orphaned references
    $(".s_footnote_ref").each((index, ref) => {
      const $ref = $(ref);
      const refId = $ref.attr("data-footnote-ref");

      if (!footnoteIds.includes(refId)) {
        $ref.addClass("s_footnote_orphaned");
      }
    });

    return this._super.apply(this, arguments);
  },
});

/**
 * Footnote Reference Options
 *
 * Options for inline footnote references
 */
options.registry.FootnoteReferenceOptions = options.Class.extend({
  events: Object.assign({}, options.Class.prototype.events || {}, {
    "change we-select": "_onFootnoteSelectionChange",
  }),

  /**
   * @override
   */
  start: function () {
    this._super.apply(this, arguments);
    this._populateFootnoteOptions();
    return this._super.apply(this, arguments);
  },

  //--------------------------------------------------------------------------
  // Event Handlers
  //--------------------------------------------------------------------------

  /**
   * Handle footnote selection change
   *
   * @private
   */
  _onFootnoteSelectionChange: function (ev) {
    const $select = $(ev.currentTarget);
    const footnoteId = $select.find("we-button.active").data("select-name");

    if (footnoteId) {
      this._updateFootnoteReference(footnoteId);
    }
  },

  //--------------------------------------------------------------------------
  // Private Methods
  //--------------------------------------------------------------------------

  /**
   * Populate the footnote selection dropdown with available footnotes
   *
   * @private
   */
  _populateFootnoteOptions: function () {
    const $footnotes = $(".s_footnotes_item");
    const $select =
      this.$target.closest("we-select") ||
      this.$target.find("we-select").first();

    if (!$select.length) {
      return;
    }

    // Clear existing options
    $select.find("we-button").remove();

    // Add button for each available footnote
    $footnotes.each((index, item) => {
      const $item = $(item);
      const id = $item.attr("data-footnote-id");
      const content = $item
        .find(".s_footnotes_content")
        .text()
        .substring(0, 50);

      const $button = $(`
        <we-button data-select-name="selectFootnote" data-select-label="[${id}] ${content}...">
          [${id}] ${content}...
        </we-button>
      `);

      $select.append($button);
    });
  },

  /**
   * Update the footnote reference with selected footnote ID
   *
   * @private
   */
  _updateFootnoteReference: function (footnoteId) {
    this.$target.attr("data-footnote-ref", footnoteId);

    // Update the number display
    const $number = this.$target.find(".s_footnote_ref_number");
    if ($number.length) {
      $number.text(footnoteId);
    }

    // Update the link
    const $link = this.$target.find(".s_footnote_link");
    if ($link.length) {
      $link.attr("href", `#footnote-${footnoteId}`);
    }

    // Mark as modified
    this.$target[0].classList.add("o_modified");
  },
});

/**
 * Inline Text Footnote Insertion
 *
 * Allows users to insert footnote references directly into text content
 */
options.registry.InlineTextFootnoteInsertion = options.Class.extend({
  events: Object.assign({}, options.Class.prototype.events || {}, {
    "click [data-insert-footnote]": "_onInsertFootnoteClick",
  }),

  //--------------------------------------------------------------------------
  // Event Handlers
  //--------------------------------------------------------------------------

  /**
   * Handle footnote reference insertion button click
   *
   * @private
   */
  _onInsertFootnoteClick: function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    // Get the currently selected text or cursor position
    const selection = window.getSelection();

    if (!selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const $footnotes = $(".s_footnotes_item");

    if (!$footnotes.length) {
      alert(
        "Please add footnotes to the page first before inserting references.",
      );
      return;
    }

    // Get the next footnote ID
    const lastFootnoteId = Math.max(
      ...$footnotes
        .map((i, el) => parseInt($(el).attr("data-footnote-id")) || 0)
        .get(),
    );
    const nextFootnoteId = lastFootnoteId + 1 || 1;

    // Create the footnote reference element
    const refEl = document.createElement("sup");
    refEl.className = "s_footnote_ref";
    refEl.setAttribute("data-footnote-ref", nextFootnoteId);

    const link = document.createElement("a");
    link.className = "s_footnote_link";
    link.href = `#footnote-${nextFootnoteId}`;
    link.setAttribute("aria-label", `Footnote ${nextFootnoteId}`);
    link.textContent = `[${nextFootnoteId}]`;

    refEl.appendChild(link);

    // Insert the reference at the cursor position
    range.insertNode(refEl);

    // Move cursor after the inserted element
    range.setStartAfter(refEl);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Mark the content as modified
    this.$target[0].classList.add("o_modified");
  },
});

export default {
  FootnotesOptions: options.registry.FootnotesOptions,
  FootnoteReferenceOptions: options.registry.FootnoteReferenceOptions,
  InlineTextFootnoteInsertion: options.registry.InlineTextFootnoteInsertion,
};
