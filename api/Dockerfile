# --- Builder Stage ---
FROM docker.m.daocloud.io/node:22-slim AS builder

WORKDIR /app
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

# 复制 pnpm workspace 的核心配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有项目的 package.json，以便 pnpm 正确解析工作区
COPY api/package.json ./api/
COPY shared/package.json ./shared/

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制项目源代码
COPY api/src ./api/src
COPY api/rolldown.config.ts ./api/rolldown.config.ts
COPY shared ./shared
COPY api/tsconfig.json ./api/

# 构建 'api' 应用
RUN pnpm -C api build


# --- Production Stage ---
FROM docker.m.daocloud.io/node:22-slim

WORKDIR /app
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

# 从构建阶段复制生产环境所需的 package.json 和锁文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/api/package.json ./api/
COPY --from=builder /app/shared/package.json ./shared/

# 仅安装生产环境的依赖
RUN pnpm install --frozen-lockfile

# 从构建阶段复制已构建好的应用代码
COPY --from=builder /app/api/dist ./api/dist

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3100

# 暴露端口
EXPOSE 3100

# 切换到 api 目录并启动应用
WORKDIR /app/api
CMD ["node", "dist/index.js"]
