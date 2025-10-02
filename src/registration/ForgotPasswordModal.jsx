import React, { useState } from 'react';
import {
  forgotPasswordEmailPush,
  forgotPasswordSendCode,
  verifyForgotPasswordCode,
  changePassword
} from '../service/api';
import { validateField } from './validations';

const ForgotPasswordModal = ({ isOpen, onClose, onLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInitiateReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await forgotPasswordEmailPush(formData.email);

    setIsLoading(false);

    if (result.success) {
      setToken(result.token);
      setCurrentStep(2);
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await forgotPasswordSendCode(formData.email, token);

    setIsLoading(false);

    if (result.success) {
      setToken(result.token);
      setCurrentStep(3);
      setSuccess(result.message);
      startCountdown(300); // 5 minutes
    } else {
      setError(result.message);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await verifyForgotPasswordCode(formData.email, formData.code, token);

    setIsLoading(false);

    if (result.success) {
      setToken(result.token);
      setCurrentStep(4);
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const passwordError = validateField('password', formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(formData.email, formData.newPassword, token);

      setIsLoading(false);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onClose();
          onLogin(); // Redirect to login
        }, 2000);
      } else {
        setError(result.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error?.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      console.error('Change password error:', error);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    });
    setToken('');
    setError('');
    setSuccess('');
    setCountdown(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all professional-shadow relative">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {currentStep === 1 && "Forgot Password"}
              {currentStep === 2 && "Send Verification Code"}
              {currentStep === 3 && "Verify Code"}
              {currentStep === 4 && "Set New Password"}
            </h2>
            <p className="text-slate-400 text-sm">
              Step {currentStep} of 4
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900 bg-opacity-20 rounded-lg mb-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900 bg-opacity-20 rounded-lg mb-4">
              <p className="text-green-400 text-sm font-medium">{success}</p>
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleInitiateReset}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                    placeholder="Enter your registered email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? 'bg-blue-600 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-3 glass-effect rounded-lg text-slate-400 border-0"
                  disabled
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={isLoading || countdown > 0}
                className={`w-full text-white py-3 rounded-lg font-semibold transition-all ${
                  isLoading || countdown > 0
                    ? 'bg-blue-600 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Send Verification Code'}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? 'bg-blue-600 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? 'bg-blue-600 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
