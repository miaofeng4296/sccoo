// 信息类型枚举
export enum PostType {
  JOB = 'JOB',
  SEEK = 'SEEK',
  SHOP_TRANSFER = 'SHOP_TRANSFER',
  SECONDHAND = 'SECONDHAND',
  TRAINING = 'TRAINING',
  MODEL = 'MODEL',
  BOOKING = 'BOOKING',
  SERVICE = 'SERVICE',
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
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  KNOWLEDGE = 'KNOWLEDGE',
  FUN = 'FUN',
  MASTER = 'MASTER',
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}
