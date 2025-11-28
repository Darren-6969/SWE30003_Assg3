// Singleton-style configuration shared across services.
export const systemConfiguration = {
  systemName: "National Parks Online Portal (NPOP)",
  maxTicketsPerOrder: 10,
  refundAllowedDays: 7,
} as const;
