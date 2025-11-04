import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../../lib/auth.js';
import AuthLayout from '../../components/AuthLayout.jsx';
import FormField from '../../components/FormField.jsx';
import { Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const brand = { name: 'Core Stock', logoUrl: '/brand.svg' };

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      // Generic error message (non-enumerating)
      setError('If an account exists with this email, a password reset link has been sent.');
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
            If an account exists with this email, we've sent a password reset link. Please check your inbox and follow the instructions.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 text-sm text-brand-orange hover:underline"
          >
            Back to login
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout brand={brand}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Forgot Password</h2>
          <p className="text-sm text-zinc-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Remember your password?{' '}
            <a href="/login" className="text-brand-orange hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

