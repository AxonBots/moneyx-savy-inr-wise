
/**
 * Database Configuration
 * 
 * This file is used to configure the MySQL database connection.
 * In a real production environment, these values should be set
 * as environment variables.
 */

// Database configuration
export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "moneyx",
};

/**
 * In a real application, you would use a proper MySQL client like mysql2
 * For example:
 * 
 * ```
 * import mysql from 'mysql2/promise';
 * 
 * export const dbPool = mysql.createPool({
 *   host: dbConfig.host,
 *   port: dbConfig.port,
 *   user: dbConfig.user,
 *   password: dbConfig.password,
 *   database: dbConfig.database,
 *   waitForConnections: true,
 *   connectionLimit: 10,
 *   queueLimit: 0
 * });
 * ```
 * 
 * You would need to install the mysql2 package:
 * npm install mysql2
 */

/**
 * Example of a database initializer that would create the tables:
 * 
 * export async function initializeDatabase() {
 *   const connection = await dbPool.getConnection();
 *   
 *   try {
 *     // Create users table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS users (
 *         id VARCHAR(36) PRIMARY KEY,
 *         email VARCHAR(255) NOT NULL UNIQUE,
 *         firstName VARCHAR(255),
 *         lastName VARCHAR(255),
 *         phone VARCHAR(20),
 *         password VARCHAR(255) NOT NULL,
 *         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *       )
 *     `);
 *     
 *     // Create accounts table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS accounts (
 *         id VARCHAR(36) PRIMARY KEY,
 *         name VARCHAR(255) NOT NULL,
 *         type ENUM('Checking', 'Savings', 'Credit', 'Investment', 'Cash', 'Other') NOT NULL,
 *         balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         userId VARCHAR(36) NOT NULL,
 *         color VARCHAR(20),
 *         icon VARCHAR(50),
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create categories table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS categories (
 *         id VARCHAR(36) PRIMARY KEY,
 *         name VARCHAR(255) NOT NULL,
 *         type ENUM('income', 'expense') NOT NULL,
 *         color VARCHAR(20) NOT NULL,
 *         icon VARCHAR(50),
 *         userId VARCHAR(36),
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create transactions table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS transactions (
 *         id VARCHAR(36) PRIMARY KEY,
 *         date TIMESTAMP NOT NULL,
 *         amount DECIMAL(15, 2) NOT NULL,
 *         description VARCHAR(255) NOT NULL,
 *         categoryId VARCHAR(36) NOT NULL,
 *         accountId VARCHAR(36) NOT NULL,
 *         type ENUM('income', 'expense', 'transfer') NOT NULL,
 *         isRecurring BOOLEAN DEFAULT FALSE,
 *         toAccountId VARCHAR(36),
 *         fee DECIMAL(10, 2),
 *         userId VARCHAR(36) NOT NULL,
 *         FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT,
 *         FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE,
 *         FOREIGN KEY (toAccountId) REFERENCES accounts(id) ON DELETE SET NULL,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create bills table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS bills (
 *         id VARCHAR(36) PRIMARY KEY,
 *         name VARCHAR(255) NOT NULL,
 *         amount DECIMAL(15, 2) NOT NULL,
 *         dueDate DATE NOT NULL,
 *         isRecurring BOOLEAN NOT NULL DEFAULT FALSE,
 *         recurrenceType ENUM('weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannually', 'annually'),
 *         categoryId VARCHAR(36),
 *         isPaid BOOLEAN NOT NULL DEFAULT FALSE,
 *         accountId VARCHAR(36),
 *         userId VARCHAR(36) NOT NULL,
 *         FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
 *         FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE SET NULL,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create savings_goals table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS savings_goals (
 *         id VARCHAR(36) PRIMARY KEY,
 *         name VARCHAR(255) NOT NULL,
 *         targetAmount DECIMAL(15, 2) NOT NULL,
 *         currentAmount DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         targetDate DATE,
 *         color VARCHAR(20),
 *         userId VARCHAR(36) NOT NULL,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create budgets table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS budgets (
 *         id VARCHAR(36) PRIMARY KEY,
 *         month INT NOT NULL,
 *         year INT NOT NULL,
 *         totalAllocated DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         totalSpent DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         userId VARCHAR(36) NOT NULL,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create budget_categories table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS budget_categories (
 *         id VARCHAR(36) PRIMARY KEY,
 *         budgetId VARCHAR(36) NOT NULL,
 *         categoryId VARCHAR(36) NOT NULL,
 *         allocated DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
 *         FOREIGN KEY (budgetId) REFERENCES budgets(id) ON DELETE CASCADE,
 *         FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create notifications table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS notifications (
 *         id VARCHAR(36) PRIMARY KEY,
 *         type ENUM('bill', 'balance', 'transaction', 'insight') NOT NULL,
 *         message TEXT NOT NULL,
 *         read BOOLEAN NOT NULL DEFAULT FALSE,
 *         date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *         userId VARCHAR(36) NOT NULL,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *     
 *     // Create user_preferences table
 *     await connection.query(`
 *       CREATE TABLE IF NOT EXISTS user_preferences (
 *         userId VARCHAR(36) PRIMARY KEY,
 *         currency VARCHAR(10) NOT NULL DEFAULT 'INR',
 *         dateFormat VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
 *         darkMode BOOLEAN NOT NULL DEFAULT FALSE,
 *         lowBalanceNotifications BOOLEAN NOT NULL DEFAULT TRUE,
 *         billReminderNotifications BOOLEAN NOT NULL DEFAULT TRUE,
 *         largeTransactionNotifications BOOLEAN NOT NULL DEFAULT TRUE,
 *         weeklySummaryNotifications BOOLEAN NOT NULL DEFAULT FALSE,
 *         aiInsightNotifications BOOLEAN NOT NULL DEFAULT TRUE,
 *         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
 *       )
 *     `);
 *   
 *     console.log('Database tables created successfully');
 *   } catch (error) {
 *     console.error('Error creating database tables:', error);
 *     throw error;
 *   } finally {
 *     connection.release();
 *   }
 * }
 */
