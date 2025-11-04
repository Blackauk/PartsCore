import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { login, verifyMfa, getMe } from '../../lib/auth.js';
import { useAuth as useLegacyAuth } from '../../contexts/AuthContext.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { bypassAuth } from '../../auth/flags.js';
import AuthLayout from '../../components/AuthLayout.jsx';
import FormField from '../../components/FormField.jsx';
import { Lock, Mail, Shield, UserRound, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const mfaSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

const brand = { name: 'Core Stock', logoUrl: '/brand.svg' };

/**
 * Get role-based redirect path
 */
function getRedirectPath(roles) {
  if (roles.includes('admin')) return '/manage';
  if (roles.includes('stores')) return '/inventory';
  if (roles.includes('manager')) return '/reports';
  if (roles.includes('fitter')) return '/movements';
  return '/dashboard';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useLegacyAuth();
  const { login } = useAuth();
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-bypass on GH Pages or when env flag is set
  useEffect(() => {
    if (bypassAuth) {
      login();
      navigate('/', { replace: true });
    }
  }, [login, navigate]);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const mfaForm = useForm({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onLoginSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);

    try {
      // Bypass auth: Skip credential checks and log in immediately
      if (bypassAuth) {
        login();
        navigate('/', { replace: true });
        setIsSubmitting(false);
        return;
      }

      // Use mock auth in development or when API_URL is not set
      const API_URL = import.meta.env.VITE_API_URL || '';
      const useMockAuth = import.meta.env.DEV || !API_URL;
      
      let result;
      if (useMockAuth) {
        const { mockLoginApi } = await import('../../lib/auth.mock.js');
        const mockResult = await mockLoginApi({ identifier: data.identifier, password: data.password });
        if (mockResult.ok) {
          // Store token
          if (data.rememberMe) {
            localStorage.setItem('auth_token', mockResult.token);
          } else {
            sessionStorage.setItem('auth_token', mockResult.token);
          }
          // Mock getMe response
          const mockUserData = {
            id: 'demo-001',
            name: mockResult.user.name,
            email: mockResult.user.email,
            roles: mockResult.user.roles,
            permissions: mockResult.user.permissions,
            siteIds: []
          };
          // Set user in context manually
          await signIn();
          // Get redirect path
          const next = searchParams.get('next');
          if (next) {
            navigate(decodeURIComponent(next));
          } else {
            const redirectPath = getRedirectPath(mockUserData.roles);
            navigate(redirectPath);
          }
          return;
        } else {
          throw new Error(mockResult.message || 'Invalid credentials');
        }
      }
      
      result = await login(data.identifier, data.password);

      if (result.requiresMfa) {
        setRequiresMfa(true);
        setMfaToken(result.mfaToken);
      } else {
        // Store token if provided and remember me is checked
        if (result.token && data.rememberMe) {
          localStorage.setItem('auth_token', result.token);
        } else if (result.token) {
          sessionStorage.setItem('auth_token', result.token);
        }

        // Sign in and get user data
        await signIn();
        
        // Get user data to determine redirect (signIn already called getMe, but we need roles)
        const userData = await getMe();

        // Get redirect path - check for next param first, then role-based
        const next = searchParams.get('next');
        if (next) {
          navigate(decodeURIComponent(next));
        } else {
          // Role-based redirect
          const userRoles = userData.roles || [];
          const redirectPath = getRedirectPath(userRoles);
          navigate(redirectPath);
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMfaSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await verifyMfa(mfaToken, data.otp);

      // Store token if needed
      if (result.token) {
        sessionStorage.setItem('auth_token', result.token);
      }

      // Sign in and get user data
      await signIn();
      
      // Get user data to determine redirect (signIn already called getMe, but we need roles)
      const userData = await getMe();

      // Get redirect path - check for next param first, then role-based
      const next = searchParams.get('next');
      if (next) {
        navigate(decodeURIComponent(next));
      } else {
        // Role-based redirect
        const userRoles = userData.roles || [];
        const redirectPath = getRedirectPath(userRoles);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      mfaForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout brand={brand}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Sign In</h2>
          <p className="text-sm text-zinc-400">
            {requiresMfa ? 'Enter your verification code' : 'Enter your credentials to access your account'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {!requiresMfa ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              label="Email or Username"
              error={loginForm.formState.errors.identifier?.message}
            >
              <div className="relative">
                <UserRound className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
                <input
                  type="text"
                  id="identifier"
                  {...loginForm.register('identifier')}
                  className="input w-full pl-9"
                  placeholder="you@example.com"
                  autoComplete="username"
                  aria-label="Email or Username"
                />
              </div>
            </FormField>

            <FormField
              label="Password"
              error={loginForm.formState.errors.password?.message}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-60 pointer-events-none text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...loginForm.register('password')}
                  className="input w-full pl-9 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  {...loginForm.register('rememberMe')}
                  className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500/50"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-orange hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-4">
            <FormField
              label="Verification Code"
              hint="Enter the 6-digit code from your authenticator app"
              error={mfaForm.formState.errors.otp?.message}
            >
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  {...mfaForm.register('otp')}
                  className="input w-full pl-9 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  aria-label="Verification Code"
                />
              </div>
            </FormField>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequiresMfa(false);
                setMfaToken(null);
                mfaForm.reset();
              }}
              className="w-full py-2 px-4 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

