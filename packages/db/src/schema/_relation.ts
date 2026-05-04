import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import {
  transactions,
  transactionTags,
  transactionTagMapping,
  budgets,
  spendingInsights,
  bankAccounts,
} from "./transactions";

import { splits, splitParticipants, splitChatMessages } from "./splits";

import {
  vaults,
  vaultMembers,
  vaultContributions,
  vaultInvitations,
} from "./vaults";

import { chatSessions, chatMessages } from "./ai";

import { notifications, deviceTokens } from "./notifications";

// ========== Auth Relations ==========
export const userRelations = relations(user, ({ many }) => ({
  session: many(session),
  account: many(account),
  // Bank accounts (real)
  bankAccounts: many(bankAccounts),
  // Transactions
  transactions: many(transactions),
  // Tags
  tags: many(transactionTags),
  // Budgets
  budgets: many(budgets),
  // Spending insights
  spendingInsights: many(spendingInsights),
  // Splits (created)
  createdSplits: many(splits, { relationName: "creator" }),
  // Split participations
  splitParticipations: many(splitParticipants),
  // Split messages
  splitMessages: many(splitChatMessages),
  // Vaults (owned)
  ownedVaults: many(vaults, { relationName: "owner" }),
  // Vault memberships
  vaultMemberships: many(vaultMembers),
  // Vault contributions
  vaultContributions: many(vaultContributions),
  // Vault invitations sent
  vaultInvitationsSent: many(vaultInvitations, { relationName: "inviter" }),
  // Chat sessions
  chatSessions: many(chatSessions),
  // Chat messages
  chatMessages: many(chatMessages),
  // Notifications
  notifications: many(notifications),
  // Device tokens
  deviceTokens: many(deviceTokens),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const authAccountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ========== Transactions Relations ==========
export const bankAccountRelations = relations(
  bankAccounts,
  ({ one, many }) => ({
    user: one(user, {
      fields: [bankAccounts.userId],
      references: [user.id],
    }),
    transactions: many(transactions),
  }),
);

export const transactionRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [transactions.userId],
      references: [user.id],
    }),
    bankAccounts: one(bankAccounts, {
      fields: [transactions.bankAccountId],
      references: [bankAccounts.id],
    }),
    tags: many(transactionTagMapping),
  }),
);

export const transactionTagRelations = relations(
  transactionTags,
  ({ one, many }) => ({
    user: one(user, {
      fields: [transactionTags.userId],
      references: [user.id],
    }),
    mappings: many(transactionTagMapping),
  }),
);

export const transactionTagMappingRelations = relations(
  transactionTagMapping,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionTagMapping.transactionId],
      references: [transactions.id],
    }),
    tag: one(transactionTags, {
      fields: [transactionTagMapping.tagId],
      references: [transactionTags.id],
    }),
  }),
);

export const budgetRelations = relations(budgets, ({ one }) => ({
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
}));

export const spendingInsightRelations = relations(
  spendingInsights,
  ({ one }) => ({
    user: one(user, {
      fields: [spendingInsights.userId],
      references: [user.id],
    }),
  }),
);

// ========== Splits Relations ==========
export const splitRelations = relations(splits, ({ one, many }) => ({
  creator: one(user, {
    fields: [splits.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  paidBy: one(user, {
    fields: [splits.paidById],
    references: [user.id],
  }),
  participants: many(splitParticipants),
  messages: many(splitChatMessages),
}));

export const splitParticipantRelations = relations(
  splitParticipants,
  ({ one }) => ({
    split: one(splits, {
      fields: [splitParticipants.splitId],
      references: [splits.id],
    }),
    user: one(user, {
      fields: [splitParticipants.userId],
      references: [user.id],
    }),
  }),
);

export const splitChatMessageRelations = relations(
  splitChatMessages,
  ({ one }) => ({
    split: one(splits, {
      fields: [splitChatMessages.splitId],
      references: [splits.id],
    }),
    user: one(user, {
      fields: [splitChatMessages.userId],
      references: [user.id],
    }),
  }),
);

// ========== Vaults Relations ==========
export const vaultRelations = relations(vaults, ({ one, many }) => ({
  owner: one(user, {
    fields: [vaults.userId],
    references: [user.id],
    relationName: "owner",
  }),
  members: many(vaultMembers),
  contributions: many(vaultContributions),
  invitations: many(vaultInvitations),
}));

export const vaultMemberRelations = relations(vaultMembers, ({ one }) => ({
  vault: one(vaults, {
    fields: [vaultMembers.vaultId],
    references: [vaults.id],
  }),
  user: one(user, {
    fields: [vaultMembers.userId],
    references: [user.id],
  }),
}));

export const vaultContributionRelations = relations(
  vaultContributions,
  ({ one }) => ({
    vault: one(vaults, {
      fields: [vaultContributions.vaultId],
      references: [vaults.id],
    }),
    user: one(user, {
      fields: [vaultContributions.userId],
      references: [user.id],
    }),
  }),
);

export const vaultInvitationRelations = relations(
  vaultInvitations,
  ({ one }) => ({
    vault: one(vaults, {
      fields: [vaultInvitations.vaultId],
      references: [vaults.id],
    }),
    invitedBy: one(user, {
      fields: [vaultInvitations.invitedById],
      references: [user.id],
      relationName: "inviter",
    }),
  }),
);

// ========== AI Relations ==========
export const chatSessionRelations = relations(
  chatSessions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [chatSessions.userId],
      references: [user.id],
    }),
    messages: many(chatMessages),
  }),
);

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// ========== Notifications Relations ==========
export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const deviceTokenRelations = relations(deviceTokens, ({ one }) => ({
  user: one(user, {
    fields: [deviceTokens.userId],
    references: [user.id],
  }),
}));
