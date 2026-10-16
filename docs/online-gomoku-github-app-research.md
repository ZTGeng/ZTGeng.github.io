# 在线五子棋迁移 GitHub App 可行性研究

研究日期：2026-10-15。以下研究结论记录最初的待验证事项；后续验证进展以本段为准。

实施更新：用户注册 GitHub App（ID `5341603`），安装于本站仓库，原 Firebase 项目已改配该 App。主账号及第二个账号均在验证页完成真实 App 用户 token 登录及评论 CRUD；证实 Firebase 托管流程可用，无需额外邮箱权限。第二账号初次遇到 404，经将 App 从 private 改为 public 后通过。正式游戏已移除 OAuth scopes、升级缓存键并更新授权说明；完整真实对局和 token 过期重登仍待验收。GitHub App 不要求玩家在自己的账号安装。

## 结论

GitHub App 的权限与用户身份模型适合本项目：以用户 access token 读写 Discussions，不必申请 OAuth App 的 `public_repo`。但“继续由 Firebase 托管 GitHub App 登录并返回用户 token”尚未验证，因此目前不能承诺端到端迁移已可行。

优先做隔离的 Firebase + GitHub App 登录概念验证。如果成功，迁移主要影响认证层和授权说明，棋局协议与存储无需迁移。如果失败，不增加自建服务器/云函数/代理来弥补，也不发布私钥；保留现有 OAuth App，另行评估有明确 GitHub App 支持的托管认证服务。

## 已确认：GitHub 侧具备所需能力

- GitHub App 可取得用户 access token（通常 `ghu_`），以用户身份操作。不要采用代表 bot 的 installation access token，以免改变评论作者和额度归属。
- 配置仓库 `Discussions: Read and write`，Metadata 为必需的基础权限；不授予 Contents、Issues、Pull requests 等额外写权限。站长仅将 App 安装到 `ZTGeng/ZTGeng.github.io`。
- 玩家授权 App，与站长安装 App 是两件事。预期玩家只需授权，不需要在自己的仓库安装；必须用非仓库协作者验证普通玩家发表评论的实际权限。giscus 采用的就是仓库安装配合用户授权的模式。
- 权限粒度是 Discussions 类别，不是单个 Discussion；即使迁移，也不能声称 token 只能写游戏 Discussion #5。公开资源读取可能存在额外允许范围，不将仓库安装选择描述成所有公开读取的绝对边界。
- 用户 token 使用用户 GraphQL 额度，一般 5000 点/小时，与该用户其他 API 使用共享；不会得到安装 token 的独立额度。5 秒轮询与现有限流策略仍然需要。
- 用户 token 默认 8 小时过期。可配置关闭过期，但推荐先保留过期，失效时重新授权；不假定 Firebase 会刷新 GitHub token。Firebase 自己的 ID token 刷新与 GitHub token 刷新不同。

## 待验证：Firebase 是否能作为 GitHub App 的登录中介

Firebase 官方 GitHub 登录指南提供 Client ID / Client secret 配置、托管回调，以及 `GithubAuthProvider.credentialFromResult(result).accessToken`。Flutter 官方指南明确描述 OAuth App。未找到明确说明标准 GitHub provider 支持 GitHub App 注册的官方保证，也没有找到足以断言它完全不支持的依据。

GitHub App 的用户授权也使用 `github.com/login/oauth/authorize` 和 `/login/oauth/access_token`。因此将 GitHub App 的 Client ID/secret 配进 Firebase 是值得尝试的候选方案，但“端点相同”不是兼容性证明。Firebase SDK 源码只证明它能提取服务端返回的 access token，不能证明托管服务端会接受 GitHub App。

重点检查：

1. Firebase 控制台是否接受 GitHub App 的 Client ID/secret。
2. 托管授权流程是否附带不兼容的 OAuth scopes。移除本项目 `provider.addScope("public_repo")`；不能假定移除这一行便取消 Firebase 所有默认行为。GitHub App 权限由 App 设置决定，不能用 `public_repo` 或 `user:email` 来配置。
3. Firebase 是否需要额外读取邮箱来建立身份。如确有需要，评估 App 的用户 `Email addresses: Read-only` 权限；这是登录兼容性候选，不是游戏本身需要，不预先授予写权限。
4. `credentialFromResult` 是否得到可用的 GitHub App 用户 token，并能通过 `viewer { id login }` 验证；不要输出或分享原始 token。
5. token 过期后的重新授权能否稳定取得新 token。Firebase 登录仍有效不代表 GitHub token 仍有效。

## 其他认证路径

| 路径 | 评估 |
| --- | --- |
| Firebase 托管 GitHub App OAuth | 最值得先验证，可能保留现有结构；尚未证实兼容 |
| 浏览器直接做授权码 + PKCE | GitHub 已支持 PKCE，但官方 token 交换文档仍要求 client secret，且需要验证 token 端点 CORS；不能推导出“PKCE 就能去掉 Firebase” |
| 浏览器直接做 Device Flow | GitHub App 支持且 token 请求无需 client secret，但面向 CLI/设备，用户需输入验证码，浏览器 CORS 尚未通过；不作为已可用的备选 |
| 由安装 token 供所有玩家调用 | 不符合本人身份/本人额度模型，还需安全生成安装 token；不采用 |
| 自建 token 交换服务、云函数或代理 | 超出本项目约束，不纳入迁移方案 |

补充探测：用无效的虚构 client ID、无用户凭据，从 Node 向两个登录端点发送带 `Origin: https://ztgeng.com` 的 OPTIONS/POST。此次响应均为 404 且无 `Access-Control-Allow-Origin`。这只能记录无效客户端错误路径的表现，不能替代有效 App 下的浏览器跨域测试，也不足以证明所有正常响应都不支持 CORS。未调用真实授权、未读取用户 token。

## 最小概念验证

1. 新建专用 GitHub App，关闭不需要的 webhook，授予 Discussions 读写，安装到本网站仓库。不需要为用户 token 流程生成或分发 App 私钥。
2. 新建隔离的 Firebase 测试项目，启用 GitHub provider，将新的 Firebase handler URL 填入 GitHub App 回调，将 Client ID/secret 存入 Firebase 控制台。保留当前生产项目配置以便原游戏继续使用。
3. 创建独立静态验证页，引用测试 Firebase 配置；不申请 `public_repo`，只在内存持有测试 token。可以使用临时 GitHub Pages 路径验证，无需启动本地服务器。
4. 先测登录及身份/额度，再由普通玩家在一个测试 Discussion 创建、编辑、删除自己的测试评论。另一个普通账号验证互读、不能编辑对方评论。
5. 验证授权页面不含公共仓库代码写权限；检查 App 只被安装到目标仓库，且未请求额外仓库权限。仅凭 token 前缀或一次成功读请求不能代替写权限测试。
6. 验证过期/撤销后可重新登录、刷新恢复正常。通过之后再决定替换正式配置。

## 概念验证成功后的代码改动

- `auth.js`：移除 `public_repo`，调整 token 存储版本以清除旧 OAuth token，保留会话/记住登录/退出同步；过期重新授权。
- `config.js`：切换到通过验证的 Firebase 配置。若最终复用生产 Firebase 项目，则安排一次配置切换而非立即替换。
- `index.html` / `verify.html` / `verify.js`：更新授权说明和诊断逻辑，不再宣称需要 `public_repo`。
- `github.js`：继续使用玩家 Bearer token 和现有 GraphQL；逐项验证 CRUD，不按 App 类型重写查询。规则、棋谱协议和 Discussion ID 保持。
- 玩家身份以 GitHub node ID 为准，原评论属于同一 GitHub 用户，预期可延续；通过迁移前后的相同账号 CRUD 验证。Firebase UID 不作为棋局身份。
- 切换前先核对未确认写入，再清除旧登录；保留非敏感待核对信息，重新授权后继续查证，不因为迁移盲目重发。
- 验收完成后提示旧用户重新授权，旧 OAuth App 授权不会自动消失；需要撤销旧授权才能消除旧 token 带来的宽权限。旧 App 保留至回滚窗口结束。
- 更新 README、方案及开发日志；当前开发日志写的是实际已采用的 OAuth App，不在验证前改写成已完成 GitHub App 迁移。

## 来源

- [GitHub App 用户 token 与授权流程](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)
- [GitHub App 最佳实践与 token 类型](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)
- [GraphQL 额度](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [GitHub App token 过期及刷新](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- [GitHub PKCE 支持公告](https://github.blog/changelog/2025-07-14-pkce-support-for-oauth-and-github-app-authentication/)
- [Firebase Web GitHub 登录](https://firebase.google.com/docs/auth/web/github-auth)
- [Firebase Flutter GitHub 登录](https://firebase.google.com/docs/auth/flutter/federated-auth)
- [Firebase SDK GithubAuthProvider 源码](https://github.com/firebase/firebase-js-sdk/blob/main/packages/auth/src/core/providers/github.ts)
- [giscus 的 GitHub App 权限及安装配置](https://github.com/giscus/giscus/blob/main/SELF-HOSTING.md)
