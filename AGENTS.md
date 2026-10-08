# AGENTS.md

## SDK 与 server 发布

SDK 发布工作流见 `.github/workflows/sdk-release.yml`。

### 触发方式

- 推送 `v*` 版本标签（协议 + SDK 统一版本号），例如 `v1.3.0`。
- 手动通过 `workflow_dispatch` 指定标签，用于失败后重跑。

### 发布链路

```text
validate ─┬─ publish-bsr ── test-python ── publish-pypi ─┐
          └─ test-typescript ── publish-npm ─────────────┴─ release
```

BSR 必须最先推送：`sdk/py/pyproject.toml` 里 pin 的是「该版本标签对应的 BSR commit」所生成的包，只有先推送到 BSR，`uv sync` 才能解析到它。

代价是：若后续测试失败，协议已经推到 BSR 了。由于 BSR 是内容寻址且同一内容会被 squash 成同一个 commit，重跑是幂等的，因此可以接受；真正要拦住协议问题的是 `validate` 里的 `buf lint` / `buf breaking` 两道前置检查。

### 版本号约定

打标签之前，两个 SDK 的版本必须已同步为该标签版本。例如发布 `v1.3.0`：

```sh
cd sdk/ts && npm version 1.3.0 --no-git-tag-version
```

```sh
cd sdk/py && uv version 1.3.0
```

校验不通过时工作流会在第一步直接失败，避免把错误的版本发布出去。

### server 镜像发布顺序

server 镜像使用独立的 `server-v*` 标签（见 `.github/workflows/ts-server-publish.yml`），不再由 `v*` 触发。

`server/ts` 依赖 `@seerbp/petcode-sdk`，所以必须先推 `v*`，等 SDK 发布工作流把 SDK 发布到 npm，再推 `server-v*` 触发镜像构建，否则 server 的 `npm ci` 拉不到新版本。
