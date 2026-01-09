/**
 * 特性开关配置
 * 通过环境变量控制企业级功能的启用/禁用
 * MVP 阶段默认禁用所有企业功能，需要时通过 .env.local 启用
 */

// 服务端特性开关（Node.js 环境）
export const FEATURES = {
  // 发票系统（企业级功能）
  INVOICE: process.env.ENABLE_INVOICE === 'true',

  // 组织架构（企业级功能）
  ORG_STRUCTURE: process.env.ENABLE_ORG_STRUCTURE === 'true',

  // 群组管理（企业级功能）
  GROUP_MANAGE: process.env.ENABLE_GROUP_MANAGE === 'true',

  // 审计日志（企业级功能）
  AUDIT_LOG: process.env.ENABLE_AUDIT_LOG === 'true',

  // SSO 单点登录（企业级功能）
  SSO: process.env.ENABLE_SSO === 'true',

  // 自定义域名（企业级功能）
  CUSTOM_DOMAIN: process.env.ENABLE_CUSTOM_DOMAIN === 'true',

  // 推广活动（营销功能）
  PROMOTION: process.env.ENABLE_PROMOTION === 'true',

  // 优惠券系统（营销功能）
  COUPON: process.env.ENABLE_COUPON === 'true',

  // OAuth 登录（微信、GitHub 等）
  OAUTH_LOGIN: process.env.ENABLE_OAUTH_LOGIN === 'true',

  // 邀请链接系统（协作功能）
  INVITATION_LINK: process.env.ENABLE_INVITATION_LINK === 'true'
};

// 客户端特性开关（浏览器环境，必须使用 NEXT_PUBLIC_ 前缀）
export const CLIENT_FEATURES = {
  // 发票系统
  INVOICE: process.env.NEXT_PUBLIC_ENABLE_INVOICE === 'true',

  // 组织架构
  ORG_STRUCTURE: process.env.NEXT_PUBLIC_ENABLE_ORG_STRUCTURE === 'true',

  // 群组管理
  GROUP_MANAGE: process.env.NEXT_PUBLIC_ENABLE_GROUP_MANAGE === 'true',

  // 审计日志
  AUDIT_LOG: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOG === 'true',

  // 自定义域名
  CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_DOMAIN === 'true',

  // 推广活动
  PROMOTION: process.env.NEXT_PUBLIC_ENABLE_PROMOTION === 'true',

  // 优惠券系统
  COUPON: process.env.NEXT_PUBLIC_ENABLE_COUPON === 'true',

  // OAuth 登录
  OAUTH_LOGIN: process.env.NEXT_PUBLIC_ENABLE_OAUTH_LOGIN === 'true',

  // 邀请链接系统
  INVITATION_LINK: process.env.NEXT_PUBLIC_ENABLE_INVITATION_LINK === 'true'
};

/**
 * 检查是否启用了任何企业功能
 */
export const hasAnyEnterpriseFeature = () => {
  return (
    FEATURES.INVOICE ||
    FEATURES.ORG_STRUCTURE ||
    FEATURES.GROUP_MANAGE ||
    FEATURES.AUDIT_LOG ||
    FEATURES.SSO ||
    FEATURES.CUSTOM_DOMAIN
  );
};

/**
 * 获取当前启用的功能列表（用于调试）
 */
export const getEnabledFeatures = () => {
  const enabled: string[] = [];
  Object.entries(FEATURES).forEach(([key, value]) => {
    if (value) enabled.push(key);
  });
  return enabled;
};
