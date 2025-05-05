
# MoneyX - Personal Finance Tracker

## Project Overview

MoneyX is a comprehensive personal finance management application that helps users track their expenses, income, bills, and savings goals. The application provides visualization tools, budgeting features, and insights to help users make informed financial decisions.

## Features

- **Dashboard**: Overview of financial status including account balances, recent transactions, and spending insights
- **Accounts Management**: Add, edit, and delete financial accounts
- **Transaction Tracking**: Record and categorize income and expenses
- **Bills Management**: Track recurring and one-time bills with payment reminders
- **Savings Goals**: Set and track progress toward financial goals
- **Data Export**: Export transaction data as CSV or PDF with custom date filters
- **Category Management**: Create and manage custom categories for income and expenses
- **Budget Planning**: Create and track monthly budgets by category

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Database**: MySQL (production)

## Database Setup

The application is designed to use MySQL as the database backend. Currently, the application uses mock data, but it's ready to be connected to a MySQL database.

### Database Configuration

To configure the database connection, you'll need to set the following environment variables:

```
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

These values can be set in a `.env` file in the root directory of your project.

### Database Schema

The database schema includes tables for:

- Users
- Accounts
- Categories
- Transactions
- Bills
- Savings Goals
- Budgets
- Notifications
- User Preferences

The full SQL schema is provided in `src/config/database.ts`.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your database configuration
4. Run the development server:
   ```
   npm run dev
   ```

## Future Improvements

- Authentication system
- Multi-currency support
- Receipt image scanning
- Financial reports
- Mobile application
- API integration with banks
- Advanced analytics and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
