# 喜人图鉴

独立 React 单页应用，直接部署到 GitHub Pages 的 `/xiren/` 即可，不依赖 Jekyll 模板或后端。

## 本地预览

在项目根目录运行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

访问 <http://127.0.0.1:8765/xiren/>。页面通过 `fetch` 加载 JSON，不能直接双击 HTML 用 `file://` 运行。

## 文件

- `index.html`：页面入口。
- `app.jsx`：React 源码；`app.js`：已生成的浏览器脚本，包含筛选模块。
- `styles.css`：响应式样式。
- `filters.mjs`：纯筛选逻辑。
- `data.json`：**页面实际加载的数据，请在这里手动修改性别、头像、自定义标签等。**
- `sources.json`：四季百科的节目表、人员表文本快照，用于核对来源行。
- `supplemental.json`：补齐一喜、二喜初舞台名单的事实记录及逐项来源。
- `scripts/import_baike.py`：抓取并整理脚本，处理表格合并单元格、别名、节目署名。
- `vendor/`：React / ReactDOM 18.3.1 的本地生产包及 MIT 许可证。

## 数据维护

`people` 中每人一条记录，字段如下：

```json
{
  "id": "p-示例姓名",
  "name": "示例姓名",
  "aliases": [],
  "gender": "男",
  "baike": null,
  "avatar": null,
  "tags": ["演员", "一喜", "我的收藏"],
  "participations": [
    {
      "seasonId": "yixi",
      "roles": ["演员"],
      "roleDetails": [],
      "teams": [],
      "groups": [],
      "works": [{ "workId": "yixi-1-1", "creditType": "个人署名" }]
    }
  ]
}
```

- `gender` 已人工校对，可改为“男”“女”或自定义值，筛选会自动读取。
- `tags` 可以直接增删，标签栏会汇总所有人的标签。节目与身份匹配使用 `participations`，自定义标签筛选只使用 `tags`。
- `baike` 是兼容已有数据的历史字段名，保存人物资料链接，可以是百度百科、豆瓣人物或其他网址；页面会按网址来源显示名称。
- `avatar` 可为空、图片路径字符串，或 `{ "url": "图片路径", "sourceUrl": "图片来源页面" }`。当前使用人物资料页的照片 URL，图片加载失败自动显示笑脸占位图。
- `works` 顶层保存作品；每人每季通过 `workId` 关联。作品中保留原始署名、节目期数和来源网址。
- `roles` 允许同季同时具有“演员”和“嘉宾”（例如回归助演的喜人）。主持人归在“嘉宾”，具体身份保存在 `roleDetails`。
- `teams` / `groups` 是当季小队 / 大团，数组兼容多重归属。未列出的队名留空，不虚构名称。

## 收录边界与来源

主要来源为用户指定的四季百度百科；主站直接请求返回 403，抓取使用百度同词条的 `bkso.baidu.com` 入口。

一喜、二喜百科只列举部分完整播出的初舞台。为避免遗漏选手，一喜额外参考维基百科的 25 组初舞台列表，二喜参考当贝市场 2022-09-23 公布的 25 组节目单。补充记录单独维护，不冒充百科原始记录。

- [一喜补充名单](https://zh.wikipedia.org/zh-cn/一年一度喜剧大赛)
- [二喜补充名单](https://www.sohu.com/a/587350023_213569)
- [壮哈兄弟及《搬家疑云》的节目官方名单](https://k.sina.cn/article_7607525144_p1c5719f1802701a9qg.html)
- [周铁男正确百科词条](https://baike.baidu.com/item/周铁男/6180197)：一喜原页面“铁男”的链接指向另一个同名词条，已纠正。

作品分为“个人署名”“小队署名”“大团署名”。后两者是由节目表的小队或大团与其正式成员关联，**不等于节目逐一确认了这些人的实际出场**，也未补推未列出的助演者。喜一合作赛只列喜团和嘉宾时，导入时默认假设该大团全员参演，将作品以“大团署名”关联到每位成员；括号内明确列出的嘉宾保留为“个人署名”。人工确认某位成员未参演后，可以从其个人记录中删除对应作品。

别名合并包括铁男→周铁男、冠朝→单冠朝、鑫仔→詹鑫、刘大锁→大锁、娜娜→张娜娜。百科中的小队写法差异也集中在抓取脚本中处理。头像可继续人工校对。

## 刷新抓取数据

```powershell
python -m pip install beautifulsoup4
python xiren/scripts/import_baike.py --portraits
python xiren/scripts/fill_missing_avatars.py
```

导入脚本只写 `data.generated.json` 和 `sources.json`，**不会覆盖手工维护的 `data.json`**。对比、核对后再合并需要更新的字段。`--cached` 复用系统临时目录中的 HTML；`--portraits` 尝试从已关联的人物百科读取照片。`fill_missing_avatars.py` 只为 `data.json` 中已有资料链接但头像为空的人补充头像，保留现有头像和其他人工修改。网络失败或页面排版变更时，应核对输出。

## 修改页面与验证

修改 JSX 或筛选模块后，在仓库根目录运行：

```powershell
npx --yes esbuild@0.25.10 xiren/app.jsx --bundle --outfile=xiren/app.js --format=iife
node --test xiren/tests/filters.test.mjs
```

部署不需要运行这两条命令；提交已生成的 `app.js` 即可。根目录不引入 npm 构建工程。

节目筛选为一个模式切换器：单季、交集、并集。未选节目表示不限；切回单季保留第一个已选节目。身份按所选季内匹配；性别、自定义标签和搜索再与节目结果取交集。详情支持关闭按钮、点击遮罩、Escape、Tab 焦点循环及关闭后返回原卡片。
