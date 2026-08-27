> 有关中文版本，请参阅 [简体中文](README_CN.md)

# Custom Stack Cards

[![Release](https://img.shields.io/github/v/release/PraxiGEN/custom-stack-cards)](https://github.com/PraxiGEN/custom-stack-cards/releases)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/custom-stack-cards/blob/main/LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Default-blue.svg)](https://github.com/hacs/plugin)

**Custom Stack Cards** is a custom card library for Home Assistant, providing three types of cards: **Vertical**, **Horizontal**, and **Grid**. It allows stacking multiple cards within a single `<ha-card>`, supports custom styling, and preserves the native UI editor functionality. Compared to the official stack cards, it removes extra borders and shadows, resulting in a cleaner interface.

---

![AdGuardHome](img/AdGuardHome.jpeg)
![Portainer](img/Portainer.jpeg)

## Features

- Vertical stack: `custom:vertical-stack-in-card`  
- Horizontal stack: `custom:horizontal-stack-in-card`
- Grid Stack: `custom:grid-stack-in-card`
- Supports `styles:` custom styling, with CSS property support 
- Full compatibility with the native UI editor  
- Removes default borders and shadows
- Default support for `Sections` view  

---

## Installation

### Using [HACS](https://hacs.xyz/) (Recommended)

 One-click installation from HACS: 

[![Open your Home Assistant instance and open the Custom Stack Cards inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=PraxiGEN&repository=custom-stack-cards&category=plugin)

**Or manually:**

1. Open Home Assistant
2. Go to HACS
3. In the search box, type **"Custom Stack Cards"**
4. Click "Download"

### Manual Installation

1. Download the `custom-stack-cards.js` file  
2. Copy to Home Assistant:

  - Move the downloaded file to your Home Assistant configuration directory:
  ```yaml
  <config>/www/
  ```
  - If the folder doesn't exist, create it first `www`

3. Add the resource:

[![Open your Home Assistant instance and show your dashboard resources.](https://my.home-assistant.io/badges/lovelace_resources.svg)](https://my.home-assistant.io/redirect/lovelace_resources/)

  - Go to Settings → Dashboards
  - Click ⋮ (three dots menu) in the top right,and pick Resources.
  - Click the + Add Resource button
  - Enter:  
    - URL: /local/custom-stack-cards.js?v=0.0.1  
    - Resource type: JavaScript Module
  - Click Create

4. Restart Home Assistant Frontend:
  - Refresh your browser cache
  - If issues persist, restart Home Assistant

---

## Configuration Options

| Parameter     | Type   | Default | Description                                                          |
| ------------- | ------ | ------- | -------------------------------------------------------------------- |
| type          | string | —       | `custom:vertical-stack-in-card` or `custom:horizontal-stack-in-card` |
| title         | string | —       | Card title                                                           |
| cards         | array  | —       | Array of cards to stack                                              |
| grid\_options | object | —       | Layout options, supports `columns` and `rows`       |
| styles        | object | —       | Custom styles (⚠️ YAML only, not supported in the visual editor)     |

---

## Examples

### Stack
```yaml
type: custom:vertical-stack-in-card  # 或 custom:horizontal-stack-in-card / custom:grid-stack-in-card
title: My Stack
cards:
  - type: sensor
    entity: sensor.time
  - type: sensor
    entity: sensor.date
```

---

## Notes
`styles:` only applies to the root card; for child cards, please use `card_mod`.

## Links
- Repository：[PraxiGEN/custom-stack-cards](https://github.com/PraxiGEN/custom-stack-cards)
- Original project:[ofekashery/vertical-stack-in-card ](https://github.com/ofekashery/vertical-stack-in-card) —— Thanks to the original author [ofekasher](https://github.com/ofekasher) for the open-source contribution.
