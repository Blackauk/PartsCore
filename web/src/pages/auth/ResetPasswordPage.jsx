import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../../lib/auth.js';
import AuthLayout from '../../components/AuthLayout.jsx';
import FormField from '../../components/FormField.jsx';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const brand = { name: 'Core Stock', logoUrl: '/brand.svg' };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenValid(false);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    if (!token) {
      setError('Reset token is missing');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword(token, data.password);
      setIsSubmitted(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <AuthLayout brand={brand}>
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-zinc-400 mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AuthLayout brand={brand}>
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="text-green-500" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Password Reset Successful</h2>
          <p className="text-sm text-zinc-400">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout brand={brand}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Reset Password</h2>
          <p className="text-sm text-zinc-400">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="New Password"
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
                aria-label="New Password"
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
            label="Confirm New Password"
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
                aria-label="Confirm New Password"
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
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <p className="text-center text-sm text-zinc-400">
            <Link to="/login" className="text-brand-orange hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

