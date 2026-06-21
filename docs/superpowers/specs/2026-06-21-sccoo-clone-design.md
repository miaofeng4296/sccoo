# 秀酷纹身之家 (sccoo.cn) 克隆版 — 完整设计文档

> **日期**: 2026-06-21 | **状态**: 已确认
>
> 纹身行业垂直分类信息门户，功能对标 sccoo.cn，视觉全面现代化。

---

## 1. 项目概述

**定位**：纹身行业的 58同城/赶集网 — 集分类信息发布、商家黄页、新闻资讯、问答社区于一体。

**目标**：在完整复刻原站所有功能的基础上，采用现代技术栈重构，提供更好的用户体验（PC + 移动H5 + 微信小程序）。

**参考网站**：https://www.sccoo.cn/

---

## 2. 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| **框架** | Next.js 14+ (App Router) | SSR/SSG/ISR，SEO 友好 |
| **UI** | TailwindCSS + shadcn/ui | 原子化CSS + 可定制组件库 |
| **状态管理** | React Query + Zustand | 服务端状态 + 客户端状态 |
| **API** | Next.js API Routes + tRPC | 端到端类型安全 |
| **ORM** | Prisma | 类型安全的数据库操作 |
| **数据库** | PostgreSQL | 初期使用 Supabase 免费版 |
| **认证** | NextAuth.js v5 | 邮箱/手机/QQ/微信多方式登录 |
| **小程序** | Taro 3.x + React | 一套 React 语法编译到微信小程序 |
| **图片存储** | OSS 预留接口 | 初期使用本地/Supabase Storage |
| **搜索** | PostgreSQL Full Text Search | 初期够用，后期可换 Elasticsearch |
| **构建** | Turborepo + pnpm workspace | Monorepo 管理 |

---

## 3. 项目结构

```
📦 sccoo/
├── 📁 apps/
│   ├── 📁 web/              # Next.js 主站 (PC + H5 响应式)
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/      # App Router 页面
│   │   │   ├── 📁 components/ # UI 组件
│   │   │   ├── 📁 lib/      # 工具函数
│   │   │   └── 📁 styles/
│   │   └── 📄 next.config.js
│   └── 📁 miniapp/          # Taro 微信小程序
│       ├── 📁 src/
│       │   ├── 📁 pages/
│       │   ├── 📁 components/
│       │   └── 📁 utils/
│       └── 📄 app.config.ts
├── 📁 packages/
│   ├── 📁 shared/           # 共享类型、常量、工具函数
│   ├── 📁 db/               # Prisma schema + 数据库操作
│   ├── 📁 api/              # tRPC routers (前后端共享)
│   └── 📁 ui/               # 共享 UI 组件
├── 📁 docs/                 # 文档
├── 📄 package.json
├── 📄 pnpm-workspace.yaml
└── 📄 turbo.json
```

---

## 4. 数据库设计

### 4.1 核心表

#### users — 用户表
| 字段 | 类型 | 说明 |
|---|---|---|
| id, email, phone, password_hash | VARCHAR | 邮箱/手机号登录 |
| name, avatar | VARCHAR | 昵称和头像 |
| role | ENUM(USER, ADMIN) | 用户角色 |
| wechat_unionid, qq_openid | VARCHAR? | 第三方登录预留 |
| created_at, updated_at | TIMESTAMP | 时间戳 |

#### cities — 城市表
| 字段 | 类型 | 说明 |
|---|---|---|
| id, name, slug, subdomain | VARCHAR | 城市名/标识/子域名前缀 |
| parent_id | FK? | 上级省份（可选） |
| sort_order, is_active | INT/BOOLEAN | 排序和启用状态 |

#### categories — 分类表
| 字段 | 类型 | 说明 |
|---|---|---|
| id, name, slug | VARCHAR | 分类名称和标识 |
| parent_id | FK? | 上级分类（可选，用于二级分类） |
| sort_order, post_count | INT | 排序和关联信息数 |
| icon | VARCHAR? | 图标 |

#### posts — 分类信息表（核心）
| 字段 | 类型 | 说明 |
|---|---|---|
| id, title, content | TEXT | 标题和内容 |
| type | ENUM | JOB, SEEK, SHOP_TRANSFER, SECONDHAND, TRAINING, MODEL, BOOKING, SERVICE |
| category_id | FK → categories | 分类关联 |
| city_id | FK → cities | 城市关联 |
| user_id | FK → users | 发布者 |
| business_id | FK → businesses? | 关联商家（可选） |
| price_min, price_max | INT? | 薪资范围/转让价格 |
| contact_name, contact_phone, contact_wechat | VARCHAR | 联系方式 |
| is_pinned | BOOLEAN | 是否置顶 |
| pin_type | ENUM | LARGE_TOP, MEDIUM_TOP, SMALL_TOP |
| pin_expires_at | DATE? | 置顶过期时间 |
| view_count | INT | 浏览次数 |
| status | ENUM | PENDING, PUBLISHED, REJECTED, EXPIRED |
| expires_at | DATE | 信息有效期 |
| created_at, updated_at | TIMESTAMP | 时间戳 |

#### post_images — 信息图片
| 字段 | 类型 | 说明 |
|---|---|---|
| id, post_id, url, sort_order | FK/VARCHAR/INT | 关联信息、图片URL、排序 |

#### businesses — 纹身店
| 字段 | 类型 | 说明 |
|---|---|---|
| id, user_id, name, logo | FK/VARCHAR | 关联用户、店铺名、Logo |
| phone, address, city_id | VARCHAR/FK | 联系方式 |
| description, website | TEXT/VARCHAR? | 描述和网址 |
| is_verified | BOOLEAN | 是否认证 |
| created_at, updated_at | TIMESTAMP | 时间戳 |

#### artists — 纹身师
| 字段 | 类型 | 说明 |
|---|---|---|
| id, user_id, name, avatar | FK/VARCHAR | 关联用户、姓名、头像 |
| city_id, business_id | FK? | 所在城市和店铺 |
| specialty, experience_years | VARCHAR/INT | 专长和年限 |
| created_at, updated_at | TIMESTAMP | 时间戳 |

#### articles — 新闻资讯
| 字段 | 类型 | 说明 |
|---|---|---|
| id, title, content | TEXT | 标题和内容（Markdown） |
| category_id | FK → categories | 分类：公告/知识/趣闻/大师 |
| cover_image, author | VARCHAR? | 封面图和作者 |
| view_count | INT | 浏览计数 |
| is_published | BOOLEAN | 发布状态 |
| created_at, updated_at | TIMESTAMP | 时间戳 |

#### qa_questions / qa_answers — 问答
| 字段 | 类型 | 说明 |
|---|---|---|
| qa_questions: id, title, content, user_id, view_count, answer_count, is_resolved | — | 问题表 |
| qa_answers: id, question_id, content, user_id, is_accepted | — | 回答表 |

#### favorites — 收藏
| 字段 | 类型 | 说明 |
|---|---|---|
| id, user_id, post_id, created_at | FK/TIMESTAMP | 收藏关系 |

#### payments — 支付订单（预留）
| 字段 | 类型 | 说明 |
|---|---|---|
| id, order_no, amount, pay_method, status | VARCHAR/ENUM | 订单信息 |
| post_id, user_id, pin_type, pin_days | FK/ENUM/INT | 关联信息和置顶参数 |
| paid_at, created_at | TIMESTAMP? | 支付时间 |

#### banners — 轮播广告
| 字段 | 类型 | 说明 |
|---|---|---|
| id, title, image_url, link_url, sort_order | VARCHAR/INT | Banner配置 |

### 4.2 关键索引

```sql
-- 高频查询
posts(city_id, type, status, created_at DESC)    -- 城市+类型筛选
posts(category_id, status)                        -- 分类筛选
posts(user_id, status)                            -- 用户信息管理
posts(is_pinned, pin_expires_at)                  -- 置顶排序
businesses(city_id, is_verified)                  -- 城市商家查询
articles(category_id, is_published, created_at)   -- 文章列表
qa_questions(is_resolved, created_at DESC)        -- 问答列表
```

---

## 5. 模块与页面

### 5.1 首页与导航 (`/`)
- 顶部工具栏：天气（iframe 嵌入或API）、登录状态、注册/登录入口
- Header：Logo、搜索框+热门搜索词、发布信息按钮、商家入驻按钮
- 主导航：10个分类入口
- 快速导航：公告/纹身大师/资讯/周边服务/微信群/QQ群
- Banner轮播：3-5张广告图，后台可配置
- 新闻区块：最新文章列表 + 头条推荐
- 网站公告：文字 + 联系方式
- 热门商家：纹身店Logo墙（名称+电话）
- 分类+地区筛选：Tab切换 + 省份列表 + 显示模式切换（网格/列表）
- 信息列表：置顶信息（大/小格）+ 普通信息 + 分页
- 便民服务 + 友情链接 + Footer

### 5.2 分类信息系统
- **列表页** `/xinxi/`：分类筛选 + 地区筛选 + 显示模式 + 搜索 + 分页
- **详情页** `/xinxi/[id]`：内容/图片/价格/联系方式/收藏/举报
- **发布/编辑页** `/post/`：选分类 → 填表单 → 上传图片 → 提交审核

### 5.3 商家黄页
- **纹身店大全** `/biz119/`：卡片列表，Logo/名称/电话，城市筛选
- **商家详情** `/biz/[id]`：主页，含关联纹身师、该店发布的信息
- **纹身师大全** `/biz123/`：头像/姓名/专长/年限，城市筛选

### 5.4 新闻资讯
- **新闻列表** `/news/`：按分类，封面/标题/摘要/时间
- **文章详情** `/news/[id]`：富文本内容 + 相关文章 + 浏览计数

### 5.5 纹身问答
- **问答列表** `/wenda/`：标题/回答数/是否解决/搜索
- **问答详情** `/wenda/[id]`：问题+回答+最佳答案+发布回答

### 5.6 用户系统
- **注册** `/reg/`：邮箱+手机号注册
- **登录** `/login/`：邮箱/手机/QQ/微信登录
- **个人中心** `/user/`：个人信息、我的发布、我的收藏、消息通知、商家管理

### 5.7 管理后台 (`/admin/`)
- **仪表盘**：今日新增信息/用户/待审核数
- **信息管理**：审核(通过/拒绝)/删除/置顶管理/批量操作
- **用户管理**：列表/禁用/启用/角色管理
- **商家管理**：审核/认证/编辑
- **文章管理**：CRUD + 富文本编辑器 + 发布/草稿
- **系统配置**：Banner/分类/城市/友情链接/SEO

### 5.8 微信小程序
- **首页** (Tab1)：Banner + 分类图标导航 + 城市切换 + 信息流 + 下拉刷新 + 上拉加载
- **分类** (Tab2)：全部分类入口 + 地区筛选
- **发布** (Tab3)：选分类 → 填信息 → 上传图片 → 提交（需登录）
- **消息** (Tab4)：系统通知、审核结果
- **我的** (Tab5)：登录/个人信息/我的发布/收藏/设置
- **子页面**：信息详情、商家详情、新闻详情、问答详情、搜索页

---

## 6. 关键设计决策

1. **子域名城市路由**：Next.js Middleware 检测 Host header → 提取城市标识 → 注入请求上下文 → 所有页面自动按城市过滤数据
2. **PC + H5 同一套代码**：Next.js 响应式 + TailwindCSS breakpoints，桌面端多栏布局，移动端单栏卡片布局
3. **小程序独立开发**：Taro 独立项目，通过共享 API 包调用后端，UI 按微信规范设计
4. **第三方登录预留**：OAuth 流程预留给 QQ/微信，先实现邮箱+手机号注册登录
5. **支付预留**：付费置顶前端+后端逻辑完整实现，支付环节抽象为接口，初期管理员手动确认
6. **部署路线**：初期 Cloudflare Pages + Supabase 免费版 → 后期迁移阿里云/腾讯云

---

## 7. 非功能需求

- **SEO**：所有信息页/商家页/文章页 SSR 渲染，语义化 HTML，sitemap 自动生成
- **性能**：首页 LCP < 2.5s，ISR 定期重新生成热门页面
- **安全**：输入验证与消毒，CSRF 防护，API 限流，XSS 防护
- **移动适配**：所有页面 320px - 1920px 完美适配
- **可维护性**：Monorepo 结构，共享类型和组件，完善的代码注释

---

## 8. 不在本期范围

- 实际支付对接（预留接口，后续接入）
- QQ/微信 OAuth 对接（预留 Provider，后续配置）
- Elasticsearch 搜索（初期用 PostgreSQL 全文搜索）
- 实际短信/邮件发送服务
- CI/CD 流水线搭建
- 真实 OSS 对接（初期本地/Supabase Storage）
