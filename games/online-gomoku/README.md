# 在线五子棋

GitHub Pages 静态页面 + Firebase 托管 GitHub App 用户授权 + 玩家 token 直连 GitHub GraphQL。不申请 `public_repo`；App 仅配置 Discussions 读写及必需 Metadata 只读，安装到本站仓库。无自有生产服务器、云函数、代理或 Firebase 数据库；游戏数据存于仓库 Discussion #5。Firebase public config 在 `config.js`；GitHub App Client secret 仅存于 Firebase 控制台，私钥不进入仓库或前端。

GitHub App 为公开的 `ztgeng-online-gomoku`（App ID `5341603`，Client ID `Iv23ct8v5Ck2bBxEOt8B`）；公开可见性允许普通玩家授权，不要求玩家安装。Firebase 继续使用原项目 `ztgeng-online-gomoku` 和原回调地址，配置已由用户切换。

## 运行

在仓库根目录执行（Node.js 20+，无需 npm 安装）：

```powershell
node games/online-gomoku/dev-server.cjs
```

打开 `http://localhost:8766/games/online-gomoku/`。此辅助脚本仅用于电脑上的本地预览，替换 Jekyll 页眉/页脚为简单预览导航，不提供游戏 API。正式网站仍由 GitHub Pages 构建共享导航。可添加命令行参数指定其他端口；Firebase Authorized domains 需包含 `localhost`。不要通过 `file://` 双击打开。

原始诊断页为 `/games/online-gomoku/verify.html`，无需 Jekyll 构建。

提交并发布到 GitHub Pages 后，游戏地址为 `https://ztgeng.com/games/online-gomoku/`。当前文件创建并不表示已经发布。

## 使用

- 大厅不使用 giscus。留言区复用游戏登录，独立保存于 Discussion #6：最新 20 条、加载更早、手动刷新、纯文本发表（最多 1000 字符）、按 GitHub 实际权限删除。没有编辑、嵌套回复和自动轮询。留言保留，不受棋局清理影响。普通失败仅影响留言区，登录失效统一重新授权。
- 留言读取在大厅空闲时开始，游戏操作开始时取消；留言写入复用游戏的写锁和 API 限流。返回大厅复用已加载列表，刷新才重置分页。发表评论遇到超时或响应错误，不自动重发；未确认提交按用户和帖子保存于 sessionStorage，刷新后可继续逐页核对 UUID；核对后才可明确放弃。离开登录会话丢弃普通草稿及列表，保留未确认发表供本人下次登录查证。
- 所有读写包括旁观均需登录。默认 token 保存于 sessionStorage，勾选记住登录后使用 localStorage；存储失败时仅保存在页面内存。新缓存键为 `online-gomoku-github-app-token-v2`，启动移除两种存储中的旧 `online-gomoku-token-v1`，但保留未确认棋局写入数据。仅接受 GitHub App 用户 token，恢复后重新查询 GitHub 验证身份。token 默认约 8 小时过期，401 后退出、重新授权并恢复棋局；Firebase 身份或 Firebase token 刷新不代替 GitHub token。未加载 Analytics。
- 初始化、恢复会话与大厅刷新先显示加载页，根据结果进入登录、大厅或恢复的对局；网络失败显示重新加载入口，不闪现登录表单。
- 大厅读取并分页扫描完整评论，本人的等待/进行中棋局优先并高亮，其余按最后活动时间排序，显示前 12 局并可展开。大厅不显示已确认结束或已取消的棋局；对方已确认、己方未确认时，本人仍会看到待同步棋局并自动恢复。大厅手动刷新。有唯一未结束的本人有效对局时自动进入；有多局时在大厅选择。
- 卡片按等待、进行中和结束显示不同背景，每张卡片只有一个操作，整张可点击或用 Enter/空格打开。有未结束的本人棋局时，本人棋局为“进入”，其他为“旁观”；没有时，等待房间为“加入”，其他为“旁观”。
- 创建按钮打开原生对话框，选择是否启用黑方禁手，确定后才创建，取消不写入。房主执黑并保持房间页面打开，前端每 5 秒读取房主及新增申请，确认最早有效申请。申请者被确认后才能开始；房主离线不自动配对。
- 轮到对手或旁观时每 5 秒一次查询读取双方评论；轮到自己暂停普通轮询，提交前重读。回到页面、恢复网络时同步，后台页暂停。读写均串行；不承诺跨设备原子互斥。
- 棋谱必须能按前缀合并，双方正常相差一手。发现分叉、异常差距或已确认历史回退就暂停落子。每方只编辑本人评论。
- 对局页用状态标记显示等待中、进行中或已结束；落子从提交前读取到写入确认期间显示棋盘 spinner 遮罩，期间禁止重复落子，失败后也会解除遮罩。管理员清理区仅在大厅。
- 玩家等待时只能取消房间/撤回申请并返回，直接删除己方记录；进行中没有返回大厅按钮，只可认负。认负后停留在最终棋盘，终局确认写入成功后才显示返回大厅。旁观者始终可返回。刷新后，已确认终局的玩家进入大厅。
- 获胜落子、和棋或认负同次写入 `acknowledged: true`、`winner`、`reason`。接收结果的一方自动确认并显示一次非阻塞提示对话框；产生结果的一方和旁观者不弹窗。关闭对话框与数据确认无关；确认写入失败时禁止返回并提供重试，不重复弹窗。
- 加载大厅时仅清理本人的安全可删数据：双方确认同一结果、己方确认且对方已不存在、失效的未接受申请、旧版已取消房间。删除前重读确认；失败下次重试。已确认结果但对方未确认时保留记录。普通缺失/损坏、结果冲突的数据保留为异常。没有独立历史库，清理后的终局无法再旁观。
- 所有写入超时均先读取查证，不自动重发。未确认操作会存储非敏感的目标记录并阻止后续写入；“核对未确认提交”重新扫描，仍找不到时须用户明确放弃该操作才能继续。
- 管理员身份按 GitHub node ID 配置，实际权限由 GitHub 决定。先预览，再确认清理：双方已确认的终局、安全残留/失效申请可立即清理；其他协议记录仍按整组最大活动时间筛选超过 30 天的数据。逐条间隔至少 1 秒删除，过程中重新读取，部分失败下次可再次预览。清理仅在页面开着时运行。

## 规则与协议

15×15、黑先、无交换开局。无禁手时双方五连或长连获胜。可选黑方三三、四四、长连禁手，按 RIF 定义递归排除不能合法形成直四的假活三；恰好五连优先，白方无禁手。不实现比赛开局制度或申诉判罚，参见 [RIF 规则](https://www.renju.net/rifrules/)。

每方一条顶层评论，以 `<!-- gomoku-v1 -->` 开头，后接 JSON code block。字段为 `protocol/gameId/userId/role/forbidden/hostCommentId/opponentCommentId/status/resigned/moves/acknowledged/winner/reason`。旧 v1 缺少终局字段时按未确认读取，后续编辑补齐。`moves` 是完整黑白交替坐标列表，`0..14`；作者 ID 以 API author 为准。黑方快照末手为黑，白方末手为白；认负或确认不复制对方最后一手，不改变本人棋谱快照。`winner` 为 black/white/null，`reason` 为 five/resign/draw/null。房主 `opponentCommentId` 是唯一配对依据。未知或非法协议记录不会当作游戏加载，也不会纳入清理。

`rules.js`：规则纯函数；`protocol.js`：解析、聚合、配对、清理筛选；`github.js`：分页、按 ID 读写、额度和 HTTP/GraphQL 错误；`client.js`：写入和异常查证；`sync.js`：轮询；`auth.js`：登录与会话；`app.js`：双语界面和页面状态。

留言状态模块为 `../../shared/discussion-comments.js`，通过传入 API、用户和目标帖子复用，不引用游戏代码。`messages.js` 为双语界面与生命周期适配，`messageConfig` 指定帖子；GitHub 适配器拒绝把留言写进棋谱 Discussion #5。详情见 `../../docs/online-gomoku-comments-plan.md`。

## 点数

每次读取一并取得额度，不额外发送额度查询。稳定对局和等待房间通常一次轮询一次 query；若单次 cost 为 1，持续 5 秒轮询约 720 点/小时。分页、配对确认、提交前读取、写入和同账号其他应用另计。显示的是最近读取响应的额度，不是精确实时账单。主额度耗尽等待 resetAt；次级限流至少等 60 秒，尊重 Retry-After 并指数退避。

## 自动验证

```powershell
node --experimental-default-type=module --test games/online-gomoku/tests/game.test.mjs games/online-gomoku/tests/messages.test.mjs
```

可选浏览器测试：需环境中可用的 Playwright 包及 Edge（或通过 `PLAYWRIGHT_CHANNEL` 指定已安装浏览器）。先启动本地预览，再运行 `node games/online-gomoku/tests/browser.cjs`。此测试模拟 Firebase 和 GitHub，验证按钮流程、多人同步、获胜、刷新恢复、旁观、手机宽度和语言切换；不会写入真实 Discussion。

## 原始诊断页验证

1. 阅读授权说明，勾选同意，点击 GitHub 登录。确认弹窗显示预期 GitHub App。
2. 检查 `viewer.login`、`viewer.id`、Discussion 标题、额度。登录后自动读取一次，可以手动再次读取。
3. 点击创建测试评论，检查页面与 Discussion #5 中的评论。
4. 点击编辑，确认正文追加编辑验证时间。
5. 删除前可让第二个非协作者账号在独立浏览器配置文件中登录此页，读取第一人的评论及 `viewerCanUpdate` / `viewerCanDelete`，应无权编辑或删除。管理员另行检查删除权限。
6. 返回第一账号页面删除测试评论，并在 GitHub 确认。不要关闭或刷新第一账号页面，token 和评论引用仅在内存中；若已关闭，可在 GitHub 手动清理。

诊断页不自动轮询，不保存 token，不加载 Analytics，不发起真实游戏。每次页面会话仅允许一次创建尝试，遇到超时先在 GitHub 核查，避免重复写入。错误信息可用于诊断，但不要分享浏览器网络请求中的 Authorization。

游戏和诊断页均不主动申请 OAuth scopes，权限由 GitHub App 注册配置决定。诊断页仅显示 token 类型、不显示其值。GitHub API 直接使用当前玩家的 provider access token，不使用 Firebase ID token。普通玩家不必安装 App；若其他账号授权时出现 404，应检查 App 是否设为 public。旧 OAuth App 授权不会因清除浏览器缓存自动撤销，用户可在 GitHub 应用设置中单独撤销旧授权。

## 已验证与待验证

- 用户已用当前账号完成真实 Firebase 登录、GitHub 身份/额度读取、Discussion #5 测试评论创建、编辑、删除，以及游戏创建、刷新恢复、取消；并已用第二个授权账号完成一局真实对局。
- 本地规则/协议/API/恢复/终局清理测试，以及模拟服务的浏览器多人流程已通过，包括双方确认、缺一方补清理、确认失败重试、认负留在棋盘和接收方非阻塞弹窗。用户随后确认新的终局规则已验证；模拟测试与用户实际验收分别记录。
- 迁移后 30 项核心测试及浏览器流程通过，新增覆盖：不调用 `addScope`、拒绝 OAuth App token、旧 token 缓存清理、记住登录与刷新恢复、401 清除凭据及重新登录。浏览器测试使用模拟 token，不代替迁移后的真实游戏验收。
- 两个实际测试账号是否均为非仓库协作者未单独确认。第三人真实旁观、线上浏览器 token 恢复、管理员删除其他用户评论仍待验证。
- GitHub App 迁移和 UI 调整已提交为 `af0a573`，尚未推送；当前留言实现为后续未提交改动。用户已用主账号及另一账号完成真实 App token 登录和评论 CRUD。迁移后的完整真实双人对局、过期重新授权及 Discussion #6 的真实留言仍待验收。未使用用户的真实 token 自动创建游戏、发送留言或执行清理。
