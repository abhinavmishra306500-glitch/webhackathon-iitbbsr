import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { UserRole, UserSession } from '../types';
import { ROLES_DATA, authenticateUser, getQuickCredentials } from '../services/authService';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginCardProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // GSAP animation refs
  const cardRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Set default credentials on mount
  useEffect(() => {
    const creds = getQuickCredentials('admin');
    setIdentifier(creds.identifier);
    setPassword(creds.password);
  }, []);

  // Initial load animation with GSAP
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Login card slides in gently from the right
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          x: isReducedMotion ? 0 : 35,
          scale: isReducedMotion ? 1 : 0.98,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.1,
          delay: 0.4,
          ease: 'power3.out',
        }
      );

      // Form fields appear with subtle sequential stagger
      if (formRef.current) {
        const animElements = formRef.current.querySelectorAll('.animate-field');
        gsap.fromTo(
          animElements,
          {
            opacity: 0,
            y: isReducedMotion ? 0 : 12,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.65,
            stagger: 0.06,
            ease: 'power2.out',
          }
        );
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  // Quick fill handler when clicking a role tab
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const creds = getQuickCredentials(role);
    setIdentifier(creds.identifier);
    setPassword(creds.password);
    setErrorMessage(null);
    setFieldErrors({});
  };

  // Form validation
  const validateForm = () => {
    const errors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      errors.identifier = 'Registration ID or Email is required.';
    } else if (
      identifier.includes('@') &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())
    ) {
      errors.identifier = 'Enter a valid institutional email format.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: -5 },
          { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.3)' }
        );
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await authenticateUser(identifier, password, selectedRole);

      if (response.success && response.session) {
        gsap.to(cardRef.current, {
          scale: 0.97,
          opacity: 0,
          y: -15,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            onLoginSuccess(response.session!);
          },
        });
      } else {
        setIsLoading(false);
        setErrorMessage(response.error || 'Authentication rejected by CIT Gateway.');

        if (errorRef.current) {
          gsap.fromTo(
            errorRef.current,
            { x: -8 },
            { x: 0, duration: 0.35, ease: 'elastic.out(1.2, 0.2)' }
          );
        }
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network connection lost to CIT server. Please retry.');
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="w-full max-w-[410px] mx-auto lg:ml-auto select-none z-20"
      >
        <div className="relative rounded-2xl glass-panel p-6 sm:p-7 backdrop-blur-xl shadow-glass transition-shadow duration-300">
          {/* Subtle top edge specular highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Clean Card Header */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold tracking-tight text-white font-display">
              Welcome Back
            </h3>
            <p className="text-xs sm:text-sm text-slate-200/90 mt-1 font-normal">
              Sign in to access your campus workspace.
            </p>
          </div>

          {/* Clean Role Switcher Tabs */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                Portal Role
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-white/5 border border-white/20">
              {(Object.keys(ROLES_DATA) as UserRole[]).map((roleKey) => {
                const role = ROLES_DATA[roleKey];
                const isSelected = selectedRole === roleKey;
                // Compact role labels for clean 4-tab bar
                const shortLabel =
                  roleKey === 'admin'
                    ? 'Admin'
                    : roleKey === 'coordinator'
                    ? 'Coord'
                    : roleKey === 'faculty'
                    ? 'Faculty'
                    : 'Club';

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleSelectRole(roleKey)}
                    title={role.label}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 text-center truncate ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              ref={errorRef}
              className="mb-3.5 p-2.5 rounded-xl bg-rose-950/60 border border-rose-400/30 text-rose-200 text-xs flex items-start gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium leading-tight block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Field: Registration ID / Email */}
            <div className="animate-field space-y-1">
              <label
                htmlFor="regIdOrEmail"
                className="block text-[11px] font-semibold text-slate-200 tracking-wider uppercase"
              >
                Registration ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="regIdOrEmail"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: undefined });
                  }}
                  disabled={isLoading}
                  placeholder="CIT-ADM-001 or name@cit.ac.in"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm placeholder:text-slate-400/80 outline-none ${
                    fieldErrors.identifier ? 'border-rose-400/80' : ''
                  }`}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-[11px] text-rose-300 font-medium pl-1">
                  {fieldErrors.identifier}
                </p>
              )}
            </div>

            {/* Field: Password */}
            <div className="animate-field space-y-1">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold text-slate-200 tracking-wider uppercase"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  disabled={isLoading}
                  placeholder="Enter security password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm placeholder:text-slate-400/80 outline-none ${
                    fieldErrors.password ? 'border-rose-400/80' : ''
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-300 font-medium pl-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Additional Elements: Remember Me & Forgot Password */}
            <div className="animate-field flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-white/30 bg-white/10 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-200 group-hover:text-white transition-colors">
                  Remember Me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs text-blue-300 hover:text-blue-200 font-medium transition-colors hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button with Subtle Glow */}
            <div className="animate-field pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-2.5 sm:py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white overflow-hidden transition-all duration-200 shadow-md bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Subtle Divider and "Authorized access only" */}
            <div className="animate-field pt-2.5">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/15" />
                </div>
                <div className="relative px-3 bg-black/20 backdrop-blur-md text-[10px] font-medium text-slate-200 tracking-wider uppercase flex items-center gap-1.5 rounded-full border border-white/20 py-0.5">
                  <Lock className="w-3 h-3 text-slate-300" />
                  <span>Authorized access only</span>
                </div>
              </div>

              {/* Compliance footer info */}
              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300/80">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    256-bit Encrypted
                  </span>
                  <span>•</span>
                  <span>Chilika Institute of Technology</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={identifier}
      />
    </>
  );
};
