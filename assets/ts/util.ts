import jQuery from "jquery";

interface PanelConfig {
  delay: number;
  hideOnClick: boolean;
  hideOnEscape: boolean;
  hideOnSwipe: boolean;
  resetScroll: boolean;
  resetForms: boolean;
  side: "left" | "right" | "top" | "bottom" | null;
  target: JQuery | string;
  visibleClass: string;
}

declare global {
  interface JQuery {
    navList(): string;
    panel(config?: Partial<PanelConfig>): JQuery;
    placeholder(): JQuery;
    _hide(event?: JQuery.Event): void;
    touchPosX: number | null;
    touchPosY: number | null;
  }
  interface JQueryStatic {
    prioritize($elements: JQuery | string, condition: boolean): void;
  }
}

(function ($: JQueryStatic) {
  $.fn.navList = function () {
    const $this = $(this);
    const $a = $this.find("a");
    const b: string[] = [];

    $a.each(function () {
      const $el = $(this);
      const indent = Math.max(0, $el.parents("li").length - 1);
      const href = $el.attr("href");
      const target = $el.attr("target");

      b.push(
        `<a class="link depth-${indent}" ${
          target ? `target="${target}"` : ""
        } ${href ? `href="${href}"` : ""}>` +
          `<span class="indent-${indent}"></span>${$el.text()}</a>`
      );
    });

    return b.join("");
  };

  $.fn.panel = function (userConfig?: Partial<PanelConfig>) {
    if (this.length === 0) return this;
    if (this.length > 1) {
      this.each(function () {
        $(this).panel(userConfig);
      });
      return this;
    }

    const $this = $(this);
    const $body = $("body");
    const id = $this.attr("id");

    const config: PanelConfig = $.extend(
      {
        delay: 0,
        hideOnClick: false,
        hideOnEscape: false,
        hideOnSwipe: false,
        resetScroll: false,
        resetForms: false,
        side: null,
        target: $this,
        visibleClass: "visible",
      },
      userConfig
    );

    if (typeof config.target === "string") {
      config.target = $(config.target);
    }

    $this._hide = function (event) {
      const target = config.target as JQuery;
      if (!target.hasClass(config.visibleClass)) return;

      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      target.removeClass(config.visibleClass);

      window.setTimeout(() => {
        if (config.resetScroll) $this.scrollTop(0);
        if (config.resetForms)
          $this.find("form").each(function () {
            (this as HTMLFormElement).reset();
          });
      }, config.delay);
    };

    $this.on("click", "a", function (event) {
      const $a = $(this);
      const href = $a.attr("href");
      if (!href || href === "#" || href === "" || href === "#" + id) return;

      event.preventDefault();
      event.stopPropagation();
      $this._hide();

      window.setTimeout(() => {
        window.location.href = href;
      }, config.delay + 10);
    });

    return $this;
  };

  $.prioritize = function ($elements, condition) {
    const key = "__prioritize";
    const $els = typeof $elements !== "string" ? $elements : $($elements);

    $els.each(function () {
      const $e = $(this);
      const $parent = $e.parent();
      if ($parent.length === 0) return;

      if (!$e.data(key)) {
        if (!condition) return;
        const $p = $e.prev();
        if ($p.length === 0) return;
        $e.prependTo($parent);
        $e.data(key, $p);
      } else {
        if (condition) return;
        const $p = $e.data(key);
        $e.insertAfter($p);
        $e.removeData(key);
      }
    });
  };
})(jQuery);