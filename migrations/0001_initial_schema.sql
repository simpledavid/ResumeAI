-- Migration: Initial Schema
-- Created: 2026-02-16
-- Description: Create User and UserDashboard tables for D1

-- User table
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    avatarUrl TEXT,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
);

-- UserDashboard table
CREATE TABLE IF NOT EXISTS UserDashboard (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT UNIQUE NOT NULL,
    bio TEXT,
    widgets TEXT, -- JSON stored as TEXT
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON User(username);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_userId ON UserDashboard(userId);
