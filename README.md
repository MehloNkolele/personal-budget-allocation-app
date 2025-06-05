# Personal Budget Allocation App

🚀 **APK Build Test** - Testing GitHub Actions APK generation

A secure, mobile-first budget allocation application with Firebase authentication that allows users to input income, create custom budget categories (with subcategories), allocate amounts, and track remaining balances.

## Features

### 🔐 Authentication
- **Email/Password Registration & Login**: Secure account creation and sign-in
- **Google Sign-In**: Quick authentication with Google accounts
- **Password Reset**: Forgot password functionality via email
- **User Profile**: Display user information and sign-out option
- **Protected Routes**: Budget app is only accessible to authenticated users

### 💰 Budget Management
- Income tracking and allocation
- Custom budget categories with subcategories
- Real-time balance calculations
- Currency support (USD, EUR, GBP, ZAR, JPY)
- Amount visibility controls
- Progress tracking for subcategories

### 🛡️ Security & Data Features
- Firebase Authentication integration
- **User Data Isolation**: Each user has completely separate data storage
- **Automatic Data Migration**: Existing data is automatically migrated to user accounts
- **Data Management**: Users can clear all their data from settings
- Secure token management
- Input validation and sanitization
- Error handling for auth operations
- User-friendly error messages

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173/`

## Authentication Setup

The app is configured with Firebase Authentication using the following features:
- Email/Password authentication
- Google OAuth provider
- Password reset functionality
- Secure user session management

### First Time Setup
1. Visit the app in your browser
2. You'll be presented with the authentication page
3. Choose to either:
   - **Sign Up**: Create a new account with email/password or Google
   - **Sign In**: Log in with existing credentials
   - **Forgot Password**: Reset your password via email

### Using the App
Once authenticated, you can:
- View your user profile in the top section
- Set your total income
- Create budget categories and subcategories
- Track your spending and remaining balances
- Access user settings to manage your profile and data
- Sign out securely when done

### User Data Isolation
Each user has completely isolated data storage:
- **Personal Data**: Your budget data is completely separate from other users
- **Automatic Migration**: If you had data before user accounts, it's automatically migrated to your account
- **Data Switching**: When you switch between user accounts, you only see your own data
- **Data Management**: You can clear all your data from the user settings if needed
- **Privacy**: No user can access another user's budget information

## Security Notes

- All authentication is handled securely through Firebase
- User sessions are managed automatically
- Passwords are never stored locally
- Google sign-in uses secure OAuth 2.0 flow
- Password reset emails are sent securely through Firebase

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Modern CSS with responsive design
- **Authentication**: Firebase Auth
- **Build Tool**: Vite
- **State Management**: React Context API
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel

## 🚀 Deployment

This app is ready for deployment to Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Steps:
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy automatically with zero configuration
4. Add your Vercel domain to Firebase authorized domains

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to Vercel (requires Vercel CLI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
