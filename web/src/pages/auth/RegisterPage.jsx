import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { register } from '../../lib/auth.js';
import AuthLayout from '../../components/AuthLayout.jsx';
import FormField from '../../components/FormField.jsx';
import { Mail, Lock, User, CheckCircle, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const brand = { name: 'Core Stock', logoUrl: '/brand.svg' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);

    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setIsSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout brand={brand}>
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Check Your Email</h2>
          <p className="text-sm text-zinc-400">
            We've sent a verification email to your address. Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-xs text-zinc-500 mt-4">
            Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout brand={brand}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Create Account</h2>
          <p className="text-sm text-zinc-400">
            Join Core Stock to manage inventory and bookings.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Full Name"
            error={form.formState.errors.name?.message}
          >
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
              <input
                type="text"
                id="name"
                {...form.register('name')}
                className="input w-full pl-9"
                placeholder="John Doe"
                autoComplete="name"
                aria-label="Full Name"
              />
            </div>
          </FormField>

          <FormField
            label="Email Address"
            error={form.formState.errors.email?.message}
          >
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
              <input
                type="email"
                id="email"
                {...form.register('email')}
                className="input w-full pl-9"
                placeholder="you@example.com"
                autoComplete="email"
                aria-label="Email Address"
              />
            </div>
          </FormField>

          <FormField
            label="Password"
            hint="Must be at least 8 characters"
            error={form.formState.errors.password?.message}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...form.register('password')}
                className="input w-full pl-9 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirm Password"
            error={form.formState.errors.confirmPassword?.message}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                {...form.register('confirmPassword')}
                className="input w-full pl-9 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-label="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(s => !s)}
                className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <a href="/login" className="text-brand-orange hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

