import SignInForm from './SignInForm';
import { useNavigate } from 'react-router-dom'; // If using react-router

/**
 * Example usage of SignInForm component
 *
 * This demonstrates how to integrate the SignInForm with your app flow.
 * The form handles all authentication via Supabase automatically.
 */
export default function SignInFormExample() {
  // Example 1: Simple usage with callbacks
  const handleSignInSuccess = () => {
    console.log('User signed in successfully!');
    // Navigate to dashboard or redirect as needed
    // window.location.href = '/dashboard';
  };

  const handleNavigateToSignUp = (userType: 'organizer' | 'speaker') => {
    console.log('Navigate to sign up as:', userType);
    // Set user type and navigate to sign up screen
    // window.location.href = `/signup?type=${userType}`;
  };

  return (
    <SignInForm
      onSignInSuccess={handleSignInSuccess}
      onNavigateToSignUp={handleNavigateToSignUp}
    />
  );
}

/**
 * Example 2: Integration with App.tsx flow
 *
 * To integrate with the existing wizard flow in App.tsx:
 *
 * 1. Add a new screen index for sign-in (e.g., -1 or separate from the main flow)
 * 2. Create a conditional render in App.tsx:
 *
 * if (showSignIn) {
 *   return (
 *     <SignInForm
 *       onSignInSuccess={() => {
 *         // Load user profile and navigate to appropriate screen
 *         loadUserProfile();
 *         setShowSignIn(false);
 *       }}
 *       onNavigateToSignUp={(userType) => {
 *         // User selected their type in the modal
 *         setFormData(prev => ({ ...prev, userType }));
 *         setShowSignIn(false);
 *         setCurrentScreen(1); // Go to SignUpScreen
 *       }}
 *     />
 *   );
 * }
 *
 * 3. Update the "Sign in" button in WelcomeScreen to set showSignIn to true
 *
 * Note: The SignInForm now includes a user type selection modal that appears
 * when clicking "Sign up". Users choose between organizer or speaker before
 * being directed to the sign-up form.
 */
