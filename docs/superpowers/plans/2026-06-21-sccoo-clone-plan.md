# 秀酷纹身之家 (sccoo.cn) 克隆版 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零构建纹身行业垂直分类信息门户，完整复刻 sccoo.cn 功能，现代化 UI，覆盖 PC + 移动H5 + 微信小程序。

**Architecture:** Next.js 14+ App Router 全栈应用，Monorepo 结构（apps/web + apps/miniapp + packages/*），Prisma + PostgreSQL 数据层，tRPC 端到端类型安全 API，TailwindCSS + shadcn/ui 响应式 UI。

**Tech Stack:** Next.js 14+ / React 18 / TypeScript / TailwindCSS / shadcn/ui / Prisma / PostgreSQL / NextAuth.js v5 / tRPC / React Query / Zustand / Taro 3.x / Turborepo / pnpm

**Spec:** `docs/superpowers/specs/2026-06-21-sccoo-clone-design.md`

---

## 总览

| 阶段 | 内容 | 任务数 |
|---|---|---|
| Phase 1 | 项目脚手架搭建 | 8 |
| Phase 2 | 数据库 Schema + 共享包 | 7 |
| Phase 3 | 核心布局与 UI 基础 | 8 |
| Phase 4 | 用户认证系统 | 8 |
| Phase 5 | 首页 | 10 |
| Phase 6 | 分类信息系统（核心） | 12 |
| Phase 7 | 商家黄页 | 6 |
| Phase 8 | 新闻资讯 | 5 |
| Phase 9 | 纹身问答 | 5 |
| Phase 10 | 用户中心 | 5 |
| Phase 11 | 管理后台 | 8 |
| Phase 12 | 城市子域名路由 | 4 |
| Phase 13 | SEO、搜索与优化 | 5 |
| Phase 14 | 微信小程序 | 10 |
| **合计** | | **101** |

---

## Phase 1: 项目脚手架搭建

### Task 1.1: 初始化 Monorepo 根目录

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建根 package.json**

```bash
cd D:/DingDan/sccoo
pnpm init
```

- [ ] **Step 2: 编辑 package.json 为 workspace root**

```json
{
  "name": "sccoo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:push": "pnpm --filter @sccoo/db db:push",
    "db:generate": "pnpm --filter @sccoo/db db:generate",
    "db:seed": "pnpm --filter @sccoo/db db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "db:push": {},
    "db:generate": {},
    "db:seed": {}
  }
}
```

- [ ] **Step 5: 创建 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 6: 创建 .gitignore**

```
node_modules/
.next/
dist/
.env
.env.local
.env*.local
*.tsbuildinfo
.next/
.turbo/
```

- [ ] **Step 7: 安装依赖并验证**

```bash
pnpm install
```

Expected: `pnpm install` 成功完成，无错误。

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .gitignore
git commit -m "chore: initialize monorepo with pnpm workspace and turborepo"
```

---

### Task 1.2: 创建 shared 共享包

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/constants.ts`

- [ ] **Step 1: 创建 packages/shared/package.json**

```json
{
  "name": "@sccoo/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "@sccoo/tsconfig": "workspace:*",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: 创建 packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 packages/shared/src/types.ts — 定义核心枚举和类型**

```typescript
// 信息类型枚举
export enum PostType {
  JOB = 'JOB',               // 招聘
  SEEK = 'SEEK',             // 求职
  SHOP_TRANSFER = 'SHOP_TRANSFER', // 纹身店转让
  SECONDHAND = 'SECONDHAND', // 二手设备
  TRAINING = 'TRAINING',     // 纹身培训
  MODEL = 'MODEL',           // 纹身模特
  BOOKING = 'BOOKING',       // 预约纹身
  SERVICE = 'SERVICE',       // 周边服务
}

// 信息状态
export enum PostStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// 置顶类型
export enum PinType {
  LARGE_TOP = 'LARGE_TOP',
  MEDIUM_TOP = 'MEDIUM_TOP',
  SMALL_TOP = 'SMALL_TOP',
}

// 用户角色
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// 文章分类
export enum ArticleCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT', // 公告
  KNOWLEDGE = 'KNOWLEDGE',       // 纹身知识
  FUN = 'FUN',                   // 趣闻
  MASTER = 'MASTER',             // 纹身大师
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}
```

- [ ] **Step 4: 创建 packages/shared/src/constants.ts**

```typescript
export const POST_TYPE_LABELS: Record<string, string> = {
  JOB: '我要招聘',
  SEEK: '我要求职',
  SHOP_TRANSFER: '纹身店转让',
  SECONDHAND: '二手设备转让',
  TRAINING: '纹身培训',
  MODEL: '纹身模特',
  BOOKING: '预约纹身',
  SERVICE: '周边服务',
};

export const PAGE_SIZE = 20;

export const PIN_PRICES = {
  LARGE_TOP: { price: 3000, days: 365, label: '超大格置顶' },
  MEDIUM_TOP: { price: 1000, days: 180, label: '大格置顶' },
  SMALL_TOP: { price: 200, days: 30, label: '小格置顶' },
};
```

- [ ] **Step 5: 创建 packages/shared/src/index.ts**

```typescript
export * from './types';
export * from './constants';
```

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared package with types and constants"
```

---

### Task 1.3: 创建 db 数据库包

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/.env.example`

- [ ] **Step 1: 创建 packages/db/package.json**

```json
{
  "name": "@sccoo/db",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.15.0"
  },
  "devDependencies": {
    "prisma": "^5.15.0",
    "tsx": "^4.15.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: 创建 Prisma Schema — `packages/db/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(cuid())
  email         String?    @unique
  phone         String?    @unique
  passwordHash  String?
  name          String?
  avatar        String?
  role          String     @default("USER") // USER | ADMIN
  wechatUnionid String?    @unique
  qqOpenid      String?    @unique
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  posts      Post[]
  businesses Business[]
  favorites  Favorite[]
  questions  QaQuestion[]
  answers    QaAnswer[]
  payments   Payment[]

  @@map("users")
}

model City {
  id        Int       @id @default(autoincrement())
  name      String
  slug      String    @unique
  subdomain String    @unique
  parentId  Int?      @map("parent_id")
  sortOrder Int       @default(0) @map("sort_order")
  isActive  Boolean   @default(true) @map("is_active")

  parent    City?     @relation("CityHierarchy", fields: [parentId], references: [id])
  children  City[]    @relation("CityHierarchy")
  posts     Post[]
  businesses Business[]
  artists   Artist[]

  @@map("cities")
}

model Category {
  id        Int       @id @default(autoincrement())
  name      String
  slug      String    @unique
  parentId  Int?      @map("parent_id")
  sortOrder Int       @default(0) @map("sort_order")
  icon      String?
  postCount Int       @default(0) @map("post_count")

  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  posts    Post[]

  @@map("categories")
}

model Post {
  id             Int       @id @default(autoincrement())
  title          String
  content        String    @db.Text
  type           String    // JOB | SEEK | SHOP_TRANSFER | SECONDHAND | TRAINING | MODEL | BOOKING | SERVICE
  categoryId     Int       @map("category_id")
  cityId         Int       @map("city_id")
  userId         String    @map("user_id")
  businessId     Int?      @map("business_id")
  priceMin       Int?      @map("price_min")
  priceMax       Int?      @map("price_max")
  contactName    String?   @map("contact_name")
  contactPhone   String?   @map("contact_phone")
  contactWechat  String?   @map("contact_wechat")
  isPinned       Boolean   @default(false) @map("is_pinned")
  pinType        String?   @map("pin_type") // LARGE_TOP | MEDIUM_TOP | SMALL_TOP
  pinExpiresAt   DateTime? @map("pin_expires_at")
  viewCount      Int       @default(0) @map("view_count")
  status         String    @default("PENDING") // PENDING | PUBLISHED | REJECTED | EXPIRED
  expiresAt      DateTime  @map("expires_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  user     User        @relation(fields: [userId], references: [id])
  city     City        @relation(fields: [cityId], references: [id])
  category Category    @relation(fields: [categoryId], references: [id])
  business Business?   @relation(fields: [businessId], references: [id])
  images   PostImage[]
  favorites Favorite[]
  payments  Payment[]

  @@index([cityId, type, status, createdAt])
  @@index([categoryId, status])
  @@index([userId, status])
  @@index([isPinned, pinExpiresAt])
  @@map("posts")
}

model PostImage {
  id        Int    @id @default(autoincrement())
  postId    Int    @map("post_id")
  url       String
  sortOrder Int    @default(0) @map("sort_order")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("post_images")
}

model Business {
  id          Int       @id @default(autoincrement())
  userId      String    @map("user_id")
  name        String
  logo        String?
  phone       String?
  address     String?
  cityId      Int       @map("city_id")
  description String?   @db.Text
  website     String?
  isVerified  Boolean   @default(false) @map("is_verified")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user    User     @relation(fields: [userId], references: [id])
  city    City     @relation(fields: [cityId], references: [id])
  posts   Post[]
  artists Artist[]

  @@index([cityId, isVerified])
  @@map("businesses")
}

model Artist {
  id              Int       @id @default(autoincrement())
  userId          String    @map("user_id")
  name            String
  avatar          String?
  cityId          Int       @map("city_id")
  businessId      Int?      @map("business_id")
  specialty       String?
  experienceYears Int?      @map("experience_years")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id])
  city     City      @relation(fields: [cityId], references: [id])
  business Business? @relation(fields: [businessId], references: [id])

  @@map("artists")
}

model Article {
  id          Int       @id @default(autoincrement())
  title       String
  content     String    @db.Text
  categoryId  Int       @map("category_id")
  coverImage  String?   @map("cover_image")
  author      String?
  viewCount   Int       @default(0) @map("view_count")
  isPublished Boolean   @default(false) @map("is_published")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  category Category @relation(fields: [categoryId], references: [id])

  @@index([categoryId, isPublished, createdAt])
  @@map("articles")
}

model QaQuestion {
  id          Int       @id @default(autoincrement())
  title       String
  content     String    @db.Text
  userId      String    @map("user_id")
  viewCount   Int       @default(0) @map("view_count")
  answerCount Int       @default(0) @map("answer_count")
  isResolved  Boolean   @default(false) @map("is_resolved")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user    User        @relation(fields: [userId], references: [id])
  answers QaAnswer[]

  @@index([isResolved, createdAt])
  @@map("qa_questions")
}

model QaAnswer {
  id         Int       @id @default(autoincrement())
  questionId Int       @map("question_id")
  content    String    @db.Text
  userId     String    @map("user_id")
  isAccepted Boolean   @default(false) @map("is_accepted")
  createdAt  DateTime  @default(now()) @map("created_at")

  question QaQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User       @relation(fields: [userId], references: [id])

  @@map("qa_answers")
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id")
  postId    Int      @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("favorites")
}

model Payment {
  id        Int       @id @default(autoincrement())
  orderNo   String    @unique @map("order_no")
  amount    Int
  payMethod String?   @map("pay_method") // WECHAT | ALIPAY | MANUAL
  status    String    @default("PENDING") // PENDING | PAID | CANCELLED
  postId    Int       @map("post_id")
  userId    String    @map("user_id")
  pinType   String    @map("pin_type")
  pinDays   Int       @map("pin_days")
  paidAt    DateTime? @map("paid_at")
  createdAt DateTime  @default(now()) @map("created_at")

  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@map("payments")
}

model Banner {
  id        Int      @id @default(autoincrement())
  title     String
  imageUrl  String   @map("image_url")
  linkUrl   String?  @map("link_url")
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("banners")
}
```

- [ ] **Step 3: 创建 packages/db/.env.example**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/sccoo"
```

- [ ] **Step 4: 创建 packages/db/src/index.ts**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
```

- [ ] **Step 5: 创建 seed 脚本 — `packages/db/prisma/seed.ts`**

```typescript
import { prisma } from '../src';

async function main() {
  // 创建省份和城市
  const provinces = [
    { name: '直辖市', slug: 'zhixiashi', cities: [
      { name: '北京', subdomain: 'beijing' },
      { name: '上海', subdomain: 'shanghai' },
      { name: '天津', subdomain: 'tianjin' },
      { name: '重庆', subdomain: 'chongqing' },
    ]},
    { name: '山东', slug: 'shandong', cities: [
      { name: '济南', subdomain: 'jinan' },
      { name: '青岛', subdomain: 'qingdao' },
    ]},
    { name: '江苏', slug: 'jiangsu', cities: [
      { name: '南京', subdomain: 'nanjing' },
      { name: '苏州', subdomain: 'suzhou' },
    ]},
    { name: '浙江', slug: 'zhejiang', cities: [
      { name: '杭州', subdomain: 'hangzhou' },
      { name: '宁波', subdomain: 'ningbo' },
    ]},
    { name: '广东', slug: 'guangdong', cities: [
      { name: '广州', subdomain: 'guangzhou' },
      { name: '深圳', subdomain: 'shenzhen' },
      { name: '东莞', subdomain: 'dongguan' },
    ]},
    { name: '湖南', slug: 'hunan', cities: [
      { name: '长沙', subdomain: 'changsha' },
      { name: '岳阳', subdomain: 'yueyang' },
    ]},
    { name: '湖北', slug: 'hubei', cities: [
      { name: '武汉', subdomain: 'wuhan' },
    ]},
    { name: '四川', slug: 'sichuan', cities: [
      { name: '成都', subdomain: 'chengdu' },
    ]},
  ];

  for (const prov of provinces) {
    const parent = await prisma.city.create({
      data: { name: prov.name, slug: prov.slug, subdomain: prov.slug, isActive: true },
    });
    for (const city of prov.cities) {
      await prisma.city.create({
        data: { name: city.name, slug: city.subdomain, subdomain: city.subdomain, parentId: parent.id, isActive: true },
      });
    }
  }

  // 创建分类
  const categories = [
    { name: '我行我秀', slug: 'show' },
    { name: '我要招聘', slug: 'job' },
    { name: '我要求职', slug: 'seek' },
    { name: '纹身店转让', slug: 'shop-transfer' },
    { name: '纹身模特', slug: 'model' },
    { name: '预约纹身', slug: 'booking' },
    { name: '纹身培训', slug: 'training' },
    { name: '二手设备转让', slug: 'secondhand' },
    { name: '周边服务', slug: 'service' },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.create({
      data: { ...categories[i]!, sortOrder: i },
    });
  }

  // 创建公告和知识文章分类
  const articleCategories = [
    { name: '本站公告', slug: 'announcement', sortOrder: 0 },
    { name: '纹身知识', slug: 'knowledge', sortOrder: 1 },
    { name: '纹身趣闻', slug: 'fun', sortOrder: 2 },
    { name: '纹身大师', slug: 'master', sortOrder: 3 },
  ];

  for (const ac of articleCategories) {
    await prisma.category.create({ data: ac });
  }

  // 创建管理员
  await prisma.user.create({
    data: {
      email: 'admin@sccoo.cn',
      name: '管理员',
      role: 'ADMIN',
      passwordHash: 'CHANGE_ME', // 实际使用时通过注册流程设置密码
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 6: 安装依赖并生成 Prisma Client**

```bash
pnpm install
pnpm --filter @sccoo/db db:generate
```

Expected: Prisma Client 生成成功。

- [ ] **Step 7: Commit**

```bash
git add packages/db/
git commit -m "feat: add database package with Prisma schema and seed data"
```

---

### Task 1.4: 创建 Next.js Web 应用

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`

- [ ] **Step 1: 使用 create-next-app 初始化**

```bash
cd D:/DingDan/sccoo
pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: 安装额外依赖**

```bash
cd D:/DingDan/sccoo/apps/web
pnpm add @sccoo/shared @sccoo/db
pnpm add @tanstack/react-query zustand next-auth@beta @t3-oss/env-nextjs
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-navigation-menu
pnpm add lucide-react date-fns clsx tailwind-merge
pnpm add -D @types/node
```

- [ ] **Step 3: 配置 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sccoo/shared', '@sccoo/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: 验证 dev server 能启动**

```bash
pnpm dev --filter @sccoo/web
```

Expected: Next.js dev server 在 http://localhost:3000 成功启动。

- [ ] **Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: scaffold Next.js web application"
```

---

### Task 1.5: 配置 shadcn/ui

- [ ] **Step 1: 初始化 shadcn/ui**

```bash
cd D:/DingDan/sccoo/apps/web
pnpm dlx shadcn-ui@latest init
```

选择: TypeScript / Default style / Slate base color / CSS variables: yes

- [ ] **Step 2: 安装常用组件**

```bash
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add navigation-menu
pnpm dlx shadcn-ui@latest add sheet
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add separator
pnpm dlx shadcn-ui@latest add pagination
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add textarea
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add carousel
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add label
pnpm dlx shadcn-ui@latest add checkbox
pnpm dlx shadcn-ui@latest add radio-group
pnpm dlx shadcn-ui@latest add switch
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add skeleton
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ui/ apps/web/components.json
git commit -m "feat: setup shadcn/ui components"
```

---

### Task 1.6: 创建 tRPC API 包

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/trpc.ts`
- Create: `packages/api/src/routers/`

- [ ] **Step 1: 创建 packages/api/package.json**

```json
{
  "name": "@sccoo/api",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@sccoo/db": "workspace:*",
    "@sccoo/shared": "workspace:*",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@trpc/next": "^11.0.0",
    "superjson": "^2.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: 创建 packages/api/src/trpc.ts**

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from 'next-auth';

export interface TRPCContext {
  session: Session | null;
  cityId?: number;
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// 需要登录的 procedure
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: { session: { ...ctx.session, user: ctx.session.user } },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// 需要管理员的 procedure
const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  // 这里简化处理，实际应查数据库验证角色
  return next({ ctx });
});

export const adminProcedure = t.procedure.use(isAdmin);
```

- [ ] **Step 3: 创建 packages/api/src/index.ts**

```typescript
export { router, publicProcedure, protectedProcedure, adminProcedure } from './trpc';
export type { TRPCContext } from './trpc';
```

- [ ] **Step 4: 安装依赖**

```bash
pnpm install
```

- [ ] **Step 5: Commit**

```bash
git add packages/api/
git commit -m "feat: add tRPC API package with auth middleware"
```

---

### Task 1.7: 创建 UI 共享组件包

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: 创建 packages/ui/package.json**

```json
{
  "name": "@sccoo/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@sccoo/shared": "workspace:*",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: 创建 packages/ui/src/cn.ts — 工具函数**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: 创建 packages/ui/src/index.ts**

```typescript
export { cn } from './cn';
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/
git commit -m "feat: add shared UI package with cn utility"
```

---

### Task 1.8: 验证完整 Monorepo 构建

- [ ] **Step 1: 安装所有依赖**

```bash
cd D:/DingDan/sccoo
pnpm install
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
pnpm --filter @sccoo/shared lint
pnpm --filter @sccoo/db lint
pnpm --filter @sccoo/api lint
pnpm --filter @sccoo/ui lint
```

Expected: 全部通过，无类型错误。

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "chore: finalize monorepo setup, all packages compiling"
```

---

## Phase 2: 数据库迁移与种子数据

### Task 2.1: 配置数据库连接

**Files:**
- Create: `apps/web/.env.local`

- [ ] **Step 1: 配置 Supabase PostgreSQL 连接**

```bash
# 在 apps/web/.env.local 中配置
echo 'DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"' > apps/web/.env.local
echo 'NEXTAUTH_SECRET="your-secret-here"' >> apps/web/.env.local
echo 'NEXTAUTH_URL="http://localhost:3000"' >> apps/web/.env.local
```

- [ ] **Step 2: 执行数据库迁移**

```bash
pnpm db:push
```

Expected: Prisma 成功创建所有表。

- [ ] **Step 3: 运行种子脚本**

```bash
pnpm db:seed
```

Expected: 所有种子数据（城市、分类）创建成功。

- [ ] **Step 4: Commit**

```bash
git add apps/web/.env.local
git commit -m "chore: configure database connection and run initial migration"
```

---

### Task 2.2: 创建 tRPC Post Router（核心 CRUD）

**Files:**
- Create: `packages/api/src/routers/post.ts`
- Create: `packages/api/src/routers/root.ts`

- [ ] **Step 1: 创建 packages/api/src/routers/post.ts**

```typescript
import { z } from 'zod';
import { prisma } from '@sccoo/db';
import { PostStatus, PostType, PAGE_SIZE } from '@sccoo/shared';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = router({
  // 获取信息列表（公开）
  list: publicProcedure
    .input(z.object({
      type: z.string().optional(),
      categoryId: z.number().optional(),
      cityId: z.number().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(PAGE_SIZE),
    }))
    .query(async ({ input }) => {
      const where: any = { status: PostStatus.PUBLISHED };
      if (input.type) where.type = input.type;
      if (input.categoryId) where.categoryId = input.categoryId;
      if (input.cityId) where.cityId = input.cityId;

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            city: { select: { name: true } },
            category: { select: { name: true } },
          },
          orderBy: [
            { isPinned: 'desc' },
            { pinExpiresAt: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.post.count({ where }),
      ]);

      return { posts, total, totalPages: Math.ceil(total / input.pageSize) };
    }),

  // 获取信息详情（公开）
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await prisma.post.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          city: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
      });
      return post;
    }),

  // 创建信息（需登录）
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(2).max(200),
      content: z.string().min(10),
      type: z.string(),
      categoryId: z.number(),
      cityId: z.number(),
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      contactWechat: z.string().optional(),
      images: z.array(z.string()).optional(),
      expiresAt: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const post = await prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          type: input.type,
          categoryId: input.categoryId,
          cityId: input.cityId,
          userId: ctx.session.user.id,
          priceMin: input.priceMin,
          priceMax: input.priceMax,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          contactWechat: input.contactWechat,
          status: PostStatus.PUBLISHED,
          expiresAt: input.expiresAt,
          images: input.images ? {
            create: input.images.map((url, i) => ({ url, sortOrder: i })),
          } : undefined,
        },
      });
      return post;
    }),

  // 置顶信息（需登录，预留支付接口）
  pin: protectedProcedure
    .input(z.object({
      postId: z.number(),
      pinType: z.enum(['LARGE_TOP', 'MEDIUM_TOP', 'SMALL_TOP']),
      pinDays: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.pinDays);

      const post = await prisma.post.update({
        where: { id: input.postId, userId: ctx.session.user.id },
        data: {
          isPinned: true,
          pinType: input.pinType,
          pinExpiresAt: expiresAt,
        },
      });
      return post;
    }),
});
```

- [ ] **Step 2: 创建 packages/api/src/routers/root.ts**

```typescript
import { router } from '../trpc';
import { postRouter } from './post';

export const appRouter = router({
  post: postRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 3: 提交**

```bash
git add packages/api/src/routers/
git commit -m "feat: add post router with list, detail, create, and pin"
```

---

---

## Phase 3: 核心布局与 UI 基础

### Task 3.1: 创建全局布局 Layout

**Files:**
- Create: `apps/web/src/components/layout/Header.tsx`
- Create: `apps/web/src/components/layout/Footer.tsx`
- Create: `apps/web/src/components/layout/TopBar.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: 创建 TopBar 组件**

```typescript
// apps/web/src/components/layout/TopBar.tsx
'use client';

import Link from 'next/link';

export function TopBar() {
  return (
    <div className="hidden md:flex items-center justify-between bg-gray-50 text-xs text-gray-600 px-4 py-1 border-b">
      <div className="flex items-center gap-2">
        {/* 天气预留 iframe */}
        <span>天气加载中...</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/reg/" className="hover:text-blue-600">注册</Link>
        <span>/</span>
        <Link href="/login/" className="hover:text-blue-600">登录</Link>
        <span className="mx-1">|</span>
        <Link href="/qqlogin/" className="hover:text-blue-600">QQ登录</Link>
        <Link href="/wxLogin/" className="hover:text-blue-600">微信登录</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 Header 组件**

```typescript
// apps/web/src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Search, PlusCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-red-600">秀酷纹身之家</span>
          </Link>

          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px] max-w-xl relative">
            <Input
              placeholder="搜索纹身信息..."
              className="pr-16"
            />
            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* 热门搜索 */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <strong>热门搜索：</strong>
            <Link href="/xinxi/?q=纹身师招聘" className="hover:text-blue-600">纹身师招聘</Link>
            <Link href="/xinxi/?q=纹身培训" className="hover:text-blue-600">纹身培训</Link>
            <Link href="/xinxi/?q=转让" className="hover:text-blue-600">店铺转让</Link>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/post/">
              <Button variant="destructive" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                发布信息
              </Button>
            </Link>
            <Link href="/login/?jump=/user/biz">
              <Button variant="outline" size="sm">
                <Store className="h-4 w-4 mr-1" />
                商家入驻
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 创建主导航组件**

```typescript
// apps/web/src/components/layout/MainNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/info122/', label: '招聘求职' },
  { href: '/info153/', label: '我行我秀' },
  { href: '/info4/', label: '纹身店转让' },
  { href: '/info1/', label: '二手转让' },
  { href: '/wenda/', label: '纹身问答' },
  { href: '/info149/', label: '我要纹身' },
  { href: '/info20/', label: '纹身培训' },
  { href: '/biz119/', label: '纹身店大全' },
  { href: '/biz123/', label: '纹身师大全' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block px-4 py-3 text-sm hover:bg-red-700 transition-colors',
                  pathname === item.href && 'bg-red-700 font-bold'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: 创建 SubNav 快速导航**

```typescript
// apps/web/src/components/layout/SubNav.tsx
import Link from 'next/link';

const quickLinks = [
  { href: '/news/news_s6_t0_p1.html', label: '本站公告' },
  { href: '/news/news_s4_t0_p1.html', label: '纹身大师' },
  { href: '/news/news_s1_t0_p1.html', label: '纹身资讯' },
  { href: '/info28/', label: '纹身周边服务' },
  { href: '/about/join.html', label: '加入微信群>>' },
  { href: '#', label: '加入纹身两千人QQ群>>' },
];

export function SubNav() {
  return (
    <div className="bg-gray-100 border-b text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
        <strong className="text-gray-700">快速导航：</strong>
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 创建 Footer 组件**

```typescript
// apps/web/src/components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-3">关于我们</h4>
            <ul className="space-y-1">
              <li><Link href="/about/about.html" className="hover:text-white">关于我们</Link></li>
              <li><Link href="/about/contact.html" className="hover:text-white">联系我们</Link></li>
              <li><Link href="/about/guanggao.html" className="hover:text-white">广告服务</Link></li>
              <li><Link href="/about/links.html" className="hover:text-white">友情链接</Link></li>
              <li><Link href="/about/join.html" className="hover:text-white">合作加盟</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">商家服务</h4>
            <ul className="space-y-1">
              <li><Link href="/login/?jump=/user/biz" className="hover:text-white">商家入驻</Link></li>
              <li><Link href="/login/?jump=/user/mywebsite" className="hover:text-white">企业建站服务</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">信息服务</h4>
            <ul className="space-y-1">
              <li><Link href="/post/" className="hover:text-white">发布信息</Link></li>
              <li><Link href="/about/infopay.html" className="hover:text-white">信息置顶/加红</Link></li>
              <li><Link href="/about/infodel.html" className="hover:text-white">删除信息</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">联系方式</h4>
            <p>QQ：4883699</p>
            <p>微信：sccoocn</p>
            <p>电话：0730-8280318</p>
            <div className="flex gap-4 mt-2">
              <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center text-xs">
                公众号二维码
              </div>
              <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center text-xs">
                小程序二维码
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs space-y-1">
          <p>Copyright © 2026 <Link href="/" className="hover:text-white">秀酷纹身之家</Link> 版权所有</p>
          <p>
            <Link href="https://beian.miit.gov.cn" className="hover:text-white">湘ICP备18003118号-5</Link>
            {' | '}
            湘公网安备 43060202000114号
          </p>
          <p className="text-gray-600">网页内的所有信息均为用户自由发布，交易时请注意识别信息的虚假，交易风险自负！</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: 更新 apps/web/src/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { SubNav } from '@/components/layout/SubNav';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '秀酷纹身之家 - 纹身信息网|纹身师招聘|纹身培训学校|纹身店转让信息',
  description: '纹身行业信息平台 - 纹身师招聘求职、纹身店转让、二手设备、纹身培训、纹身店大全',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <TopBar />
        <Header />
        <MainNav />
        <SubNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/layout/ apps/web/src/app/layout.tsx
git commit -m "feat: add global layout with Header, Navigation, and Footer"
```

---

*(由于篇幅限制，Phase 4-14 将在后续任务中继续详细展开)*

---

## 后续阶段概览

| Phase | 内容 | 关键产出 |
|---|---|---|
| **Phase 4** | 用户认证系统 | NextAuth.js 配置、登录/注册页面、session管理 |
| **Phase 5** | 首页 | Banner轮播、新闻摘要、热门商家、分类/地区筛选、信息列表、分页 |
| **Phase 6** | 分类信息系统 | 列表页(网格/列表切换)、详情页、发布/编辑页、图片上传 |
| **Phase 7** | 商家黄页 | 纹身店大全、商家详情、纹身师大全、商家入驻 |
| **Phase 8** | 新闻资讯 | 新闻列表、文章详情(富文本)、按分类筛选 |
| **Phase 9** | 纹身问答 | 问答列表、提问、回答、最佳答案 |
| **Phase 10** | 用户中心 | 个人资料、我的发布、我的收藏、消息通知 |
| **Phase 11** | 管理后台 | 仪表盘、信息审核、用户管理、商家管理、系统配置 |
| **Phase 12** | 城市子域名 | Next.js Middleware 域名检测、城市上下文注入 |
| **Phase 13** | SEO与性能 | sitemap、metadata、ISR、全文搜索 |
| **Phase 14** | 微信小程序 | Taro 初始化、TabBar 页面、详情页、API对接 |

---

*本文档为实施计划的第一部分（Phase 1-3），包含项目脚手架、数据库、核心布局的完整任务。后续阶段将在各阶段开始时细化。*
