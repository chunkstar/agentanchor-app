/**
 * Database Schema Index
 *
 * Exports all schema definitions for use with Drizzle ORM.
 * This file is referenced by drizzle.config.ts for migrations.
 */

// Users
export * from './users'

// Agents & Trust
export * from './agents'

// Council Governance
export * from './council'

// Truth Chain (Immutable Audit)
export * from './truth-chain'

// Observer (Event Log)
export * from './observer'

// Marketplace & Acquisitions
export * from './marketplace'

// Academy (Training)
export * from './academy'
