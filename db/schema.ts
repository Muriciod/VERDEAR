import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  requestKey: text('request_key').notNull(),
  name: text('name').notNull(),
  company: text('company').notNull().default(''),
  phone: text('phone').notNull(),
  space: text('space').notNull(),
  interest: text('interest').notNull().default(''),
  message: text('message').notNull(),
  diagnostic: text('diagnostic'),
  status: text('status').notNull().default('new'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  consentAt: text('consent_at').notNull(),
}, t => [uniqueIndex('inquiries_request_key_unique').on(t.requestKey), index('inquiries_created_idx').on(t.createdAt), index('inquiries_status_idx').on(t.status)]);

export const submissionLimits = sqliteTable('submission_limits', {
  bucket: text('bucket').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, t => [index('submission_limits_expiry_idx').on(t.expiresAt)]);
