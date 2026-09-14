> For English version, see [English](README.md)

# Custom Stack Cards

[![Release](https://img.shields.io/github/v/release/PraxiGEN/custom-stack-cards)](https://github.com/PraxiGEN/custom-stack-cards/releases)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/custom-stack-cards/blob/main/LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Default-blue.svg)](https://github.com/hacs/plugin)

**Custom Stack Cards** 是 Home Assistant 的自定义卡片库，提供 **Vertical**  **Horizontal** **Grid** 三种卡片类型。它允许在单个 `<ha-card>` 内堆叠多个卡片，支持自定义样式，并保留原生 UI 编辑器功能。相比官方堆叠卡片，它去掉了多余的边框与阴影，让界面更简洁。

---

![AdGuardHome](img/AdGuardHome.jpeg)
![Portainer](img/Portainer.jpeg)

## 特性

- 垂直堆叠：`custom:vertical-stack-in-card`  
- 水平堆叠：`custom:horizontal-stack-in-card`
- 网格堆叠：`custom:grid-stack-in-card`
- 支持 `styles: ` 自定义样式, 支持CSS属性  
- 保留原生 UI 编辑器兼容性  
- 去除默认边框和阴影
- 默认支持 `Sections` 视图 

---

## 安装

### 使用 [HACS](https://hacs.xyz/) (推荐)

 One-click installation from HACS: 

[![在 Home Assistant 社区商店中打开 Custom Stack Cards。](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=PraxiGEN&repository=custom-stack-cards&category=plugin)

**或者手动操作：**

1. 打开 Home Assistant
2. 前往 **HACS**
3. 在搜索框中输入 **"Custom Stack Cards"**
4. 点击 **“下载 (Download)”**

### 手动安装

1. 下载 `custom-stack-cards.js` 文件。
2. 复制到 Home Assistant：

  - 将下载的文件移动到 Home Assistant 的配置目录（`<config>`）下的 `www` 文件夹中：
  ```yaml
  <config>/www/
  ```
  - 如果该文件夹不存在，请先手动创建 www 文件夹。

3. 添加资源引用：

[![打开你的 Home Assistant 实例并查看你的仪表板资源。](https://my.home-assistant.io/badges/lovelace_resources.svg)](https://my.home-assistant.io/redirect/lovelace_resources/)

  - 进入 设置 → 仪表盘
  - 点击右上角的 ⋮（三个点菜单），然后选择 资源。
  - 点击右下角的 + 添加资源 按钮。
  - 在弹窗中输入以下内容：
    - URL: /local/custom-stack-cards.js?v=1.1.3
    - Resource type: JavaScript Module
  - 点击 创建。

4. 重启 Home Assistant 前端：
  - 刷新浏览器缓存
  - 如果问题仍然存在，请尝试重启 Home Assistant 实例。

---

## 配置参数

| 参数            | 类型     | 默认值 | 说明                                                                  |
| ------------- | ------ | --- | ------------------------------------------------------------------- |
| type          | string | —   | `custom:vertical-stack-in-card` 或 `custom:horizontal-stack-in-card` |
| title         | string | —   | 卡片标题                                                                |
| cards         | array  | —   | 要堆叠的卡片数组                                                            |
| grid\_options | object | —   | 布局选项，支持 columns 和 rows                                             |
| styles        | object | —   | 自定义样式（⚠️ 仅 YAML 配置，不支持可视化编辑器）                             |

---

## 使用示例

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

## 子卡尺寸控制

> 自 `v1.1.x` 起支持。灵感来自 [`nested-lovelace-card`](https://github.com/Liquidmasl/nested-lovelace-card#child-card-sizing-with-grid_options)。

通过在**子卡自己的 config** 里写 `grid_options`，可以控制该子卡在父卡内占的**宽/高比例**（写在子卡上，不是写在父堆叠卡上）。字段命名对齐 HA sections 视图的 `grid_options`，但语义是**相对权重**，并非 12 列制。

> **重要提示（相对权重，非 12 列制）**：这里的 `columns` / `rows` 是**比例权重**，不是 HA sections 视图的「12 列制」绝对列数。  
> 例如 `columns: 3` + `columns: 1` 表示 **3:1 比例**（子卡分别占 75% / 25% 宽），而不是「占 3 列 + 1 列」。想凑 1/4 + 3/4，写成 `columns: 1` + `columns: 3` 即可。单独一张子卡无论 `columns` 写几，都会占满整张外卡宽度（flex-basis: 0 + 独自 grow）。

### 垂直堆叠 — `rows`

```yaml
type: custom:vertical-stack-in-card
cards:
  - type: entities
    entities: [...]
    grid_options:
      rows: 2        # 纵向：占两倍高度（按比例分配剩余高度）
  - type: gauge
    entity: sensor.temperature
    grid_options:
      rows: 1
```

> 纵向 `rows` 的比例效果仅在**父卡被分配固定高度**时（sections 视图拖高行数、或 `styles.card.height` 写死）才显现；masonry / panel 等自适应高度场景下退化为内容高度。

### 水平堆叠 — `columns`

```yaml
type: custom:horizontal-stack-in-card
cards:
  - type: weather-forecast
    grid_options:
      columns: 3     # 横向：占 3 份宽（columns 为相对 flex 权重，缺省 1）
  - type: custom:mini-graph-card
    # 无 columns → 占 1 份宽（与上面 3:1）
```

### 网格堆叠 — `columns` / `rows`（span 跨轨）

```yaml
type: custom:grid-stack-in-card
columns: 12          # 网格轨道数（缺省 1）
cards:
  - type: entities
    grid_options:
      columns: 6     # 横跨 6 条轨道（= 半宽）；rows 同理控制跨行数
  - type: gauge
    grid_options:
      columns: 6
```

#### 各模式映射

| 模式 | 子卡 `grid_options` | 效果 |
| --- | --- | --- |
| vertical | `rows` | 有 `rows` 的子卡按比例共享剩余高度；无则按内容高 |
| horizontal | `columns` | 作为相对 flex 权重控制宽度（缺省 1 = 等宽） |
| grid | `columns` / `rows` | 作为 `grid-column` / `grid-row` 的 span 值（缺省 1；`columns` 取卡片自身 `columns` 为轨道数上限） |

---

## 注意事项
`styles: `只支持根卡片，子卡片请使用`uix / card_mod`。

## 链接
- 仓库地址：[PraxiGEN/custom-stack-cards](https://github.com/PraxiGEN/custom-stack-cards)
- 原始项目：[ofekashery/vertical-stack-in-card ](https://github.com/ofekashery/vertical-stack-in-card) —— 感谢原作者 [ofekasher](https://github.com/ofekasher) 的开源贡献
