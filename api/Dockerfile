# --- Builder Stage ---
FROM docker.m.daocloud.io/node:22-slim AS builder

WORKDIR /app
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

# 复制 pnpm workspace 的核心配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制所有项目的 package.json，以便 pnpm 正确解析工作区
COPY api/package.json ./api/
# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制项目源代码
COPY api/src ./api/src
COPY api/rolldown.config.ts ./api/rolldown.config.ts
COPY api/tsconfig.json ./api/

WORKDIR /app/api
# 删除 dist 目录
RUN rm -rf dist
RUN pnpm build

FROM docker.m.daocloud.io/node:22-slim
WORKDIR /app/api
COPY --from=builder /app/api/dist ./dist

CMD ["node", "dist/index.js"]

