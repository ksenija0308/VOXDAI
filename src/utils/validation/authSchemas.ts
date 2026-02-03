import { z } from 'zod';

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password',
  'password1',
  'password123',
  '12345678',
  'qwerty',
  'qwerty123',
  'abc123',
  'letmein',
  'welcome',
  'monkey'
];

// Email validation schema
export const emailSchema = z.string().default('').transform(val => val || '').refine((val) => val.length > 0, 'Email is required')
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase()
  .refine((val: string) => val.length <= 255, 'Email is too long');

// Password validation schema with comprehensive rules
export const passwordSchema = z
  .string()
  .default('')
  .transform(val => val || '')
  .refine((val) => val.length > 0, 'Password is required')
  .refine(
    (password) => password.length >= 8,
    'Password must be at least 8 characters'
  )
  .refine(
    (password) => password.length <= 128,
    'Password must be less than 128 characters'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[^a-zA-Z0-9]/.test(password),
    'Password must contain at least one special character (!@#$%^&*)'
  )
  .refine(
    (password) => {
      if (password.length === 0) return true;
      const lowerPassword = password.toLowerCase();
      return !COMMON_PASSWORDS.some(common => common && lowerPassword.includes(common));
    },
    'This password is too common. Please choose a stronger password'
  )
  .refine(
    (password) => {
      if (password.length === 0) return true;
      return !/^(.)\1+$/.test(password);
    },
    'Password cannot contain only repeating characters'
  );

// Sign up form schema
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .default('')
      .transform(val => val || '')
      .refine((val) => val.length > 0, 'Please confirm your password'),
    acceptTerms: z.boolean().default(false).refine((val) => val === true, {
      message: 'You must accept the Terms and Conditions'
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

// Sign in form schema (simpler validation)
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .default('')
    .transform(val => val || '')
    .refine((val) => val.length > 0, 'Password is required')
});

// Type inference for TypeScript
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Helper function to get password strength
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
  percentage: number;
} => {
  if (!password) {
    return { score: 0, label: '', color: '#e5e7eb', percentage: 0 };
  }

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Complexity bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score++;

  // Penalty for common patterns
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
    score = Math.max(0, score - 2);
  }

  // Map score to strength label
  if (score <= 2) {
    return { score, label: 'Weak', color: '#d4183d', percentage: 25 };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: '#f59e0b', percentage: 50 };
  } else if (score <= 6) {
    return { score, label: 'Good', color: '#10b981', percentage: 75 };
  } else {
    return { score, label: 'Strong', color: '#059669', percentage: 100 };
  }
};

// Helper function to get detailed password requirements status
export const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
    notCommon: !COMMON_PASSWORDS.some(common =>
      password.toLowerCase().includes(common)
    )
  };
};
