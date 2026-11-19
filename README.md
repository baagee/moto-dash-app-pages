# Moto Dash · 项目介绍页

Moto Dash 的独立静态介绍站：产品说明、16 套主题预览、功能演示、APK 下载与作者支持。

纯 HTML / CSS / 原生 JavaScript，无构建步骤、无外部 CDN、无追踪。整目录就是发布产物。

## 在线地址

- GitHub Pages：<https://baagee.github.io/moto-dash-app-pages/>
- Cloudflare Pages：部署后填写实际域名
- APK 稳定下载：<https://github.com/baagee/moto-dash-app-pages/releases/latest/download/moto-dash.apk>

> 本仓库只放站点与发布产物，不包含 Flutter 应用源码。应用源码在另一个仓库维护。

## 本地预览

在仓库根目录执行：

```bash
python3 -m http.server 4173
```

打开 <http://localhost:4173/>。

截图或一次性查看全部区块时加 `?static=1`：

```text
http://localhost:4173/?static=1
```

该参数会跳过滚动揭示，并把懒加载图片改为立即加载，适合全页截图工具。正常访问不受影响。

## 目录

```text
.
├── index.html
├── css/
│   ├── base.css        令牌、字体、重置、页头、首屏、页脚、灯箱
│   ├── sections.css    数据链、核心能力、主题墙、横竖屏、兼容、下载、支持
│   ├── features.css    特色功能 Bento 与交互演示
│   └── responsive.css  响应式收口
├── js/
│   └── main.js         导航、滚动进度、筛选、灯箱翻页、演示、下载占位
└── assets/
    ├── previews/       16 套正式主题横屏预览（webp）
    ├── portraits/      横竖屏与日夜对比截图（webp）
    ├── features/       冷车红区截图（webp）
    ├── support/        抖音主页码、微信赞赏码（webp）
    ├── brand/          图标、OG 分享图
    └── fonts/          Barlow Condensed + IBM Plex Mono
```

## 更新站点

1. 修改 `index.html`、`css/` 或 `js/`。
2. 本地预览确认。
3. 提交并推送：

```bash
git add .
git commit -m "feat: update landing page"
git push
```

GitHub Pages 与 Cloudflare Pages 会各自从 `main` 重新发布，不需要额外构建。

### 替换主题截图

主题预览来自应用仓库的 Golden 截图，保持尺寸：

- 横屏预览：`844 × 390`
- 竖屏截图：`390 × 844`

```bash
cwebp -q 82 -m 6 input.png -o assets/previews/<theme>.webp
```

### 文案与下载卡

- 下载地址：`js/main.js` 顶部的 `DOWNLOAD_URL`
- 版本号、build、APK 大小：`index.html` 的下载卡
- 官方抖音号 / 抖音 ID / 赞赏说明：`index.html` 对应文案

## 发布新版本 APK

站点使用 **GitHub Releases 的 latest 重定向**，下载地址永远不变：

```text
https://github.com/baagee/moto-dash-app-pages/releases/latest/download/moto-dash.apk
```

发布步骤：

1. 在应用仓库构建 `arm64-v8a` release APK。
2. 打开本仓库的 **Releases → Draft a new release**。
3. Tag 使用版本号，例如 `v0.1.3-51`。
4. 上传 APK，资源文件名必须是 `moto-dash.apk`。
5. 发布后，上面的 latest 链接自动指向这个版本。
6. 同步更新 `index.html` 下载卡里的版本号、build 与大小。

> 不要把 APK 直接提交进仓库。Releases 适合放二进制产物，也不会让 git 历史越来越重。

如果安装了 `gh`，也可以命令行发布：

```bash
gh release create v0.1.3-51 \
  /path/to/moto-dash.apk#moto-dash.apk \
  --repo baagee/moto-dash-app-pages \
  --title "Moto Dash v0.1.3 (51)" \
  --notes "更新说明"
```

## GitHub Pages

本仓库已按「从分支发布」的目录结构组织，站点文件在根目录。

1. 打开仓库 **Settings → Pages**。
2. Source 选择 **Deploy from a branch**。
3. Branch 选择 `main`，目录选择 `/ (root)`。
4. 保存后等待构建，访问 <https://baagee.github.io/moto-dash-app-pages/>。

仓库根目录的 `.nojekyll` 用于跳过 Jekyll 处理。

## Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**。
2. 选择本仓库。
3. Framework preset 选择 **None**。
4. Build command 留空。
5. Build output directory 填 `/`。
6. 保存并部署。

之后每次推送 `main`，Cloudflare Pages 会自动重新部署。需要自定义域名时，在 Cloudflare Pages 的 **Custom domains** 里绑定。

所有资源使用相对路径，因此 GitHub Pages 的 `/moto-dash-app-pages/` 子路径和 Cloudflare 的根路径都能正常访问。

## 注意

- 不加入统计、分析、Cookie 或第三方脚本。
- 不把 APK 提交进仓库，使用 GitHub Releases。
- 抖音码与微信赞赏码是公开图片；赞赏为个人自愿支持，不参与任何功能门控。
- 修改 `index.html` 的 `og:image` 时，如启用自定义域名，记得同步换成最终域名。
