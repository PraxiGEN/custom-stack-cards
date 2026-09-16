import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";
const VERSION = "v1.1.3-lit";

console.log(
  `%cCustom Stack Cards ${VERSION}`,
  "color: #1976d2; font-weight: bold; background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 2px 6px;"
);

class BaseStackInCard extends LitElement {
  static properties = {
    config: { attribute: false },
    hass: { attribute: false },
    _refCards: { state: true }
  };

  static styles = css`
    :host { -webkit-tap-highlight-color: transparent;}
    ha-card { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .card-title { font-size: 1.2em; font-weight: bold; padding: 12px 16px 0; margin: 0; }
    .stack { display: flex; flex: 1; align-items: center; width: 100%;
      --ha-card-border-width: 0px !important;
      --ha-card-box-shadow: none !important;
      --ha-card-border-radius: 0px !important;
      --ha-card-border-color: rgba(0,0,0,0) !important;
      --ha-card-background: none !important;
      --ha-card-box-shadow: none !important;
    }
    .stack.vertical { flex-direction: column; }
    .stack.horizontal { flex-direction: row; }
    .stack.grid { display: grid; gap: 8px; width: 100%; }
    /* 内部子卡片的容器，强制过渡动画关闭 */
    .stack > * { flex: 1 1 auto; min-height: auto; min-width: 0; width: 100%; transition: none !important; }
  `;

  constructor() {
    super();
    this.config = { cards: [] };
    this._refCards = [];
    this._helpers = null;
    this._hass = null;
    this._styleCache = new WeakSet();
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.cards)) {
      throw new Error('Card config incorrect: "cards" must be an array');
    }
    this.config = { ...config };
    this._createCards();
  }

  async _loadHelpers() { if (!this._helpers) this._helpers = await window.loadCardHelpers(); }

  async _createCards() {
    await this._loadHelpers();
    this._refCards = this.config.cards.map(c => {
      const el = c.type === "divider" ? this._helpers.createRowElement(c) : this._helpers.createCardElement(c);
      if (this._hass) el.hass = this._hass;
      el.addEventListener("ll-rebuild", () => this._createCards(), { once: true });
      // 尽早注入样式
      this._applyBaselineStyle(el);
      // 按子卡 grid_options 控制其在父卡内的宽/高占比
      this._applyChildGridOptions(el, c);
      return el;
    });
    this.requestUpdate();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._refCards?.length) this._refCards.forEach(c => { try { c.hass = hass; } catch(e){} });
  }
  get hass() { return this._hass; }

  _applyBaselineStyle(el) {
    if (!el) return;

    const apply = (root) => {
      if (!root || this._styleCache.has(root)) return false;

      const styleTag = document.createElement("style");
      styleTag.textContent = `
        ha-card {
          box-shadow: none !important;
          border: none !important;
          background: none !important;
          border-radius: 0 !important;
          transition: none !important;
        }
      `;
      root.appendChild(styleTag);
      this._styleCache.add(root);
      return true;
    };

    if (!apply(el.shadowRoot)) {
      if (el.updateComplete) {
        el.updateComplete.then(() => apply(el.shadowRoot));
      } else {
        setTimeout(() => apply(el.shadowRoot), 50);
      }
    }
  }

  _applyChildGridOptions(el, childConfig) {
    if (!el || !childConfig) return;
    const go = childConfig.grid_options;
    const mode = this._layoutMode();

    if (mode === "grid") {
      const trackCount = this.config?.columns ?? 1;
      const spanCols = Math.min(go?.columns ?? 1, trackCount);
      const spanRows = go?.rows ?? 1;
      el.style.gridColumn = `span ${spanCols}`;
      el.style.gridRow = `span ${spanRows}`;
      return;
    }

    if (mode === "horizontal") {
      const cols = go?.columns ?? 1;
      el.style.flex = `${cols} ${cols} 0`;
      el.style.minWidth = "0";
    } else {
      // vertical
      const rows = go?.rows;
      el.style.flex = rows ? `${rows} ${rows} 0` : "0 0 auto";
    }
  }

  _rootCardStyleString() {
    const styles = this.config?.styles?.card;
    if (!styles) return "";
    return Object.entries(styles).map(([k,v])=>`${k.replace(/_/g,"-")}:${v}`).join("; ");
  }

  _renderStack(mode) {
    const extraStyle = mode === "grid" ? this._gridStyleString?.() : "";
    return html`
      <div class="stack ${mode}" style="${extraStyle}">
        ${repeat(
          this._refCards || [],
          (c, i) => i,
          (c) => c
        )}
      </div>
    `;
  }

  render() {
    const mode = this._layoutMode();
    const cardStyle = this._rootCardStyleString();
    const title = this.config?.title;

    return html`
      <ha-card style="${cardStyle}">
        ${title ? html`<h1 class="card-title">${title}</h1>` : ""}
        ${this._renderStack(mode)}
      </ha-card>
    `;
  }

  async getCardSize() {
    if (!this._refCards?.length) return 1;
    const sizes = await Promise.all(this._refCards.map(c => typeof c.getCardSize === "function" ? c.getCardSize() : 1));
    return sizes.reduce((a,b)=>a+b,0);
  }

  getGridOptions() {
    const mode = this._layoutMode();
    let min_columns = 6;
    if (mode === "vertical") min_columns = 3;
    return { min_columns };
  }

  _layoutMode() { return "vertical"; }

  updated(changedProps) {
    super.updated(changedProps);
    if (this._refCards) {
      this._refCards.forEach(c => this._applyBaselineStyle(c));
    }
  }
  
  static getStubConfig() { return { cards: [] };}

  static async _getHelperElement(_type, tag) {
    if (!customElements.get(tag)) {
      const helpers = await window.loadCardHelpers();
      await helpers.createCardElement({ type: _type, cards: [] });
      await customElements.whenDefined(tag);
    }
    const cls = customElements.get(tag);
    return cls?.getConfigElement?.() || document.createElement("div");
  }
}

/** Vertical Stack Card */
class VerticalStackInCard extends BaseStackInCard {
  _layoutMode() { return "vertical"; }
  static async getConfigElement() {
    return this._getHelperElement("vertical-stack", "hui-vertical-stack-card");
  }
}
customElements.define("vertical-stack-in-card", VerticalStackInCard);

/** Horizontal Stack Card */
class HorizontalStackInCard extends BaseStackInCard {
  _layoutMode() { return "horizontal"; }
  static async getConfigElement() {
    return this._getHelperElement("horizontal-stack", "hui-horizontal-stack-card");
  }
}
customElements.define("horizontal-stack-in-card", HorizontalStackInCard);

/** Grid Stack Card */
class GridStackInCard extends BaseStackInCard {
  _layoutMode() { return "grid"; }

  _gridStyleString() {
    const cols = this.config?.columns;
    const square = this.config?.square;
    let style = "";
    if (cols) style += `grid-template-columns: repeat(${cols}, 1fr);`;
    if (square) style += `grid-auto-rows: 1fr;`;
    return style;
  }

  static async getConfigElement() {
    return this._getHelperElement("grid", "hui-grid-card");
  }
}
customElements.define("grid-stack-in-card", GridStackInCard);

/** 注册 customCards（支持多语言：注册时按语言选文案，默认回退 en） */
const CARD_I18N = {
  en: {
    vertical:   { name: "Vertical Stack In Card",   description: "Combine multiple cards into one vertical card" },
    horizontal: { name: "Horizontal Stack In Card",  description: "Combine multiple cards into one horizontal card" },
    grid:       { name: "Grid Stack In Card",        description: "Combine multiple cards into one grid card" },
  },
  "zh-Hans": {
    vertical:   { name: "垂直堆叠卡片",   description: "将多张卡片合并为一张垂直卡片" },
    horizontal: { name: "水平堆叠卡片",   description: "将多张卡片合并为一张水平卡片" },
    grid:       { name: "网格堆叠卡片",   description: "将多张卡片合并为一张网格卡片" },
  },
};

// 模块加载时读取 HA 已设好的 <html lang>；命中 zh* 用中文，否则回退 en。
// 注意：customCards 注册为一次性，切换语言需 reload 前端才会更新显示。
function _pickCardLang() {
  const lang = (document.documentElement.lang || "").toLowerCase();
  return lang.startsWith("zh") ? "zh-Hans" : "en";
}
const _cardT = CARD_I18N[_pickCardLang()];

window.customCards = window.customCards || [];
[
  { type: "vertical-stack-in-card",   key: "vertical" },
  { type: "horizontal-stack-in-card", key: "horizontal" },
  { type: "grid-stack-in-card",       key: "grid" },
].forEach(({ type, key }) =>
  window.customCards.push({
    type,
    name: _cardT[key].name,
    description: _cardT[key].description,
    preview: false,
    documentationURL: "https://github.com/PraxiGEN/custom-stack-cards"
  })
);