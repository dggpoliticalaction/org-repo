/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * Markdown Footnote Parser
 *
 * Converts markdown-style footnote references [^1] to proper footnote markup
 */
class MarkdownFootnoteParser {
  /**
   * Check if we're in edit mode
   *
   * @static
   * @returns {boolean} - True if in WYSIWYG editor mode
   */
  static isInEditMode() {
    const inEditMode =
      document.body.classList.contains("editor_mode") ||
      document.querySelector(".o_editable") !== null ||
      document.querySelector(".odoo-editor-rnw") !== null;

    if (inEditMode) {
      console.debug("[Footnotes] In edit mode - skipping parser");
    }

    return inEditMode;
  }

  /**
   * Parse markdown footnote references in text
   * Converts [^1], [^2], etc. to proper footnote markers
   *
   * @static
   * @param {HTMLElement} element - Container element to parse
   * @returns {Object} - Object with { references: Map, definitions: Map }
   */
  static parse(element) {
    console.debug("[Footnotes] Starting parse");

    // Skip parsing in edit mode to avoid conflicts with WYSIWYG editor
    if (this.isInEditMode()) {
      return { references: new Map(), definitions: new Map() };
    }

    const references = new Map();
    const definitions = new Map();

    console.debug("[Footnotes] Parsing for definitions and references");

    // First pass: find all footnote definitions at the end
    this._extractDefinitions(element, definitions);

    // Second pass: convert footnote references in content
    this._convertReferences(element, references, definitions);

    console.debug("[Footnotes] Parse complete");

    return { references, definitions };
  }

  /**
   * Extract footnote definitions from the element
   *
   * @private
   */
  static _extractDefinitions(element, definitions) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    const nodesToRemove = [];

    while ((node = walker.nextNode())) {
      const text = node.textContent;
      // Match [^id]: definition
      const defRegex = /\[\^(\w+)\]:\s*(.+?)(?=\[\^|$)/gs;
      let match;

      while ((match = defRegex.exec(text)) !== null) {
        const id = match[1];
        const definition = match[2].trim();
        definitions.set(id, definition);
        nodesToRemove.push({
          node,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    // Remove definition text from DOM
    nodesToRemove.reverse().forEach(({ node, start, end }) => {
      if (node.textContent.length === end - start) {
        node.parentNode.removeChild(node);
      } else {
        node.textContent =
          node.textContent.substring(0, start) +
          node.textContent.substring(end);
      }
    });
  }

  /**
   * Convert markdown footnote references to proper markup
   *
   * @private
   */
  static _convertReferences(element, references, definitions) {
    console.debug("[Footnotes] Converting references");

    // Additional check: skip if element is in edit mode
    if (element.closest(".o_editable")) {
      return;
    }

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    const nodesToProcess = [];

    while ((node = walker.nextNode())) {
      // Skip text inside code blocks or pre tags
      if (this._isInCodeBlock(node)) {
        continue;
      }

      const text = node.textContent;
      if (/\[\^(\w+)\]/g.test(text)) {
        nodesToProcess.push(node);
      }
    }

    // Process nodes in reverse to maintain correct DOM order
    nodesToProcess.reverse().forEach((textNode) => {
      this._replaceReferencesInNode(textNode, references, definitions);
    });
  }

  /**
   * Replace footnote references in a specific text node
   *
   * @private
   */
  static _replaceReferencesInNode(textNode, references, definitions) {
    // Skip if text node is in edit mode
    if (
      textNode.parentElement &&
      textNode.parentElement.closest(".o_editable")
    ) {
      return;
    }

    const text = textNode.textContent;
    const refRegex = /\[\^(\w+)\]/g;
    let lastIndex = 0;
    let match;
    const fragment = document.createDocumentFragment();

    while ((match = refRegex.exec(text)) !== null) {
      const id = match[1];

      // Add text before the reference
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, match.index)),
        );
      }

      // Create footnote reference element
      const refElement = document.createElement("sup");
      refElement.className = "s_footnote_ref";
      refElement.setAttribute("data-footnote-ref", id);

      const link = document.createElement("a");
      link.className = "s_footnote_link";
      link.href = "#footnote-" + id;
      link.setAttribute("aria-label", "Footnote " + id);

      link.appendChild(document.createTextNode("[" + id + "]"));

      refElement.appendChild(link);
      fragment.appendChild(refElement);

      references.set(id, {
        element: refElement,
        definition: definitions.get(id) || "Footnote " + id,
      });

      lastIndex = refRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    // Replace the text node with the fragment
    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  /**
   * Check if a text node is inside a code block
   *
   * @private
   */
  static _isInCodeBlock(node) {
    let parent = node.parentNode;
    while (parent) {
      if (parent.tagName === "CODE" || parent.tagName === "PRE") {
        return true;
      }
      // Also skip if inside editable mode
      if (parent.classList && parent.classList.contains("o_editable")) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
}

/**
 * Footnotes Snippet Frontend Widget
 *
 * Handles the interactive behavior of footnotes on the frontend
 */
publicWidget.registry.FootnotesSnippet = publicWidget.Widget.extend({
  selector: ".s_footnotes",
  events: {
    "click .s_footnote_link": "_onFootnoteLinkClick",
    "click .s_footnotes_item": "_onFootnoteItemClick",
  },

  /**
   * @override
   */
  start: function () {
    this._super.apply(this, arguments);
    // Markdown parsing disabled - was causing infinite loop
    // this._parseMarkdownFootnotes();
    this._initializeFootnotes();
    this._setupBackReferences();
    return this._super.apply(this, arguments);
  },

  //--------------------------------------------------------------------------
  // Private
  //--------------------------------------------------------------------------

  /**
   * Parse markdown-style footnotes in the page content
   * DISABLED: Was causing infinite loop due to DOM mutations
   *
   * @private
   */
  _parseMarkdownFootnotes: function () {
    // Markdown parsing disabled - will be re-enabled with proper safeguards
    return;
  },

  /**
   * Add a footnote that was parsed from markdown
   * DISABLED: This method is not used while markdown parsing is disabled
   *
   * @private
   * @param {String} id - Footnote ID
   * @param {String} definition - Footnote text content
   */
  _addParsedFootnote: function (id, definition) {
    // Not used while markdown parsing is disabled
    return;
  },

  /**
   * Initialize footnotes by assigning IDs and updating numbers
   *
   * @private
   */
  _initializeFootnotes: function () {
    console.debug("[Footnotes Widget] Initializing footnotes");

    const $items = this.$el.find(".s_footnotes_item");

    $items.each((index, item) => {
      const $item = $(item);
      const footnoteId = $item.attr("data-footnote-id") || index + 1;

      // Set unique ID for the footnote
      $item.attr("id", "footnote-" + footnoteId);
      $item.attr("data-footnote-id", footnoteId);

      // Update the number in the content if needed
      const $number = $item.find(".s_footnotes_number");
      if ($number.length && !$number.text()) {
        $number.text(footnoteId);
      }
    });
  },

  /**
   * Set up back-to-reference links in footnotes
   *
   * @private
   */
  _setupBackReferences: function () {
    console.debug("[Footnotes Widget] Setting up back references");

    const $items = this.$el.find(".s_footnotes_item");

    $items.each((index, item) => {
      const $item = $(item);
      const footnoteId = $item.attr("data-footnote-id");
      const $content = $item.find(".s_footnotes_content");

      // Find corresponding reference in the document
      const $ref = $('[data-footnote-ref="' + footnoteId + '"]');

      if ($ref.length && !$content.find(".s_footnote_back_link").length) {
        // Add back-to-reference link
        const backLink = $("<a>", {
          class: "s_footnote_back_link",
          href: "#footnote-ref-" + footnoteId,
          html: ' <i class="fa fa-level-up" aria-hidden="true"></i>',
          title: "Back to reference",
          "aria-label": "Back to reference",
        });

        $content.append(backLink);

        // Set ID on reference for back navigation
        $ref.attr("id", "footnote-ref-" + footnoteId);
      }
    });
  },

  /**
   * Smooth scroll to an element
   *
   * @private
   */
  _smoothScrollTo: function ($target, offset) {
    offset = offset || 100;

    if (!$target.length) {
      return;
    }

    const targetOffset = $target.offset().top - offset;

    $("html, body").animate(
      { scrollTop: targetOffset },
      {
        duration: 500,
        easing: "swing",
        complete: () => {
          this._highlightElement($target);
        },
      },
    );
  },

  /**
   * Highlight an element with animation
   *
   * @private
   */
  _highlightElement: function ($element) {
    if (!$element.length) {
      return;
    }

    // Add highlight class
    $element.addClass("s_footnote_highlighted");

    // Focus the element for accessibility
    $element.attr("tabindex", "-1").focus();

    // Remove highlight after animation
    setTimeout(() => {
      $element.removeClass("s_footnote_highlighted");
      $element.removeAttr("tabindex");
    }, 2000);
  },

  //--------------------------------------------------------------------------
  // Handlers
  //--------------------------------------------------------------------------

  /**
   * Handle click on footnote reference link
   *
   * @private
   */
  _onFootnoteLinkClick: function (ev) {
    ev.preventDefault();

    const $link = $(ev.currentTarget);
    const href = $link.attr("href");

    if (href && href.startsWith("#footnote-")) {
      const $target = $(href);

      if ($target.length) {
        this._smoothScrollTo($target);
      }
    }
  },

  /**
   * Handle click on footnote item (for back navigation)
   *
   * @private
   */
  _onFootnoteItemClick: function (ev) {
    // Only handle clicks on back links
    if (
      !$(ev.target).hasClass("s_footnote_back_link") &&
      !$(ev.target).parent().hasClass("s_footnote_back_link")
    ) {
      return;
    }

    ev.preventDefault();

    const $backLink = $(ev.target).closest(".s_footnote_back_link");
    const href = $backLink.attr("href");

    if (href && href.startsWith("#footnote-ref-")) {
      const $target = $(href);

      if ($target.length) {
        this._smoothScrollTo($target);
      }
    }
  },
});

/**
 * Footnote Reference Widget
 */
publicWidget.registry.FootnoteReference = publicWidget.Widget.extend({
  selector: ".s_footnote_ref",

  /**
   * @override
   */
  start: function () {
    this._initializeReference();
    return this._super.apply(this, arguments);
  },

  //--------------------------------------------------------------------------
  // Private
  //--------------------------------------------------------------------------

  /**
   * Initialize the reference with proper numbering
   *
   * @private
   */
  _initializeReference: function () {
    const refId = this.$el.attr("data-footnote-ref");

    if (refId) {
      const $number = this.$el.find(".s_footnote_ref_number");
      if ($number.length) {
        $number.text(refId);
      }

      const $link = this.$el.find(".s_footnote_link");
      if ($link.length) {
        $link.attr("href", "#footnote-" + refId);
      }
    }
  },
});

/**
 * Auto-sync footnotes numbering when content changes
 */
publicWidget.registry.FootnotesAutoSync = publicWidget.Widget.extend({
  selector: ".s_footnotes",

  /**
   * @override
   */
  start: function () {
    console.debug("[Footnotes AutoSync] Starting");

    // DISABLED: Mutation observer was causing performance issues
    // Re-sync on DOM changes (useful in edit mode)
    // this._observer = new MutationObserver(() => {
    //   this._syncFootnotes();
    // });
    //
    // this._observer.observe(this.el, {
    //   childList: true,
    //   subtree: true,
    // });

    this._syncFootnotes();

    return this._super.apply(this, arguments);
  },

  /**
   * @override
   */
  destroy: function () {
    // Mutation observer is disabled
    // if (this._observer) {
    //   this._observer.disconnect();
    // }
    return this._super.apply(this, arguments);
  },

  //--------------------------------------------------------------------------
  // Private
  //--------------------------------------------------------------------------

  /**
   * Synchronize footnote numbering
   *
   * @private
   */
  _syncFootnotes: function () {
    const $items = this.$el.find(".s_footnotes_item");

    $items.each((index, item) => {
      const $item = $(item);
      const newNumber = index + 1;

      // Update data attribute
      $item.attr("data-footnote-id", newNumber);

      // Update ID
      $item.attr("id", "footnote-" + newNumber);

      // Update visible number if present
      const $number = $item.find(".s_footnotes_number");
      if ($number.length) {
        $number.text(newNumber);
      }
    });
  },
});

export default {
  FootnotesSnippet: publicWidget.registry.FootnotesSnippet,
  FootnoteReference: publicWidget.registry.FootnoteReference,
  FootnotesAutoSync: publicWidget.registry.FootnotesAutoSync,
  MarkdownFootnoteParser: MarkdownFootnoteParser,
};
