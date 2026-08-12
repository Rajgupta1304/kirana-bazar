import React, { useState } from 'react';
import { KeyRound, ShieldCheck, ArrowRight, CheckCircle2, Lock, X, RefreshCw, Mail, Phone } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, onSendOTP, onResetPassword, isDarkMode = false, targetRole = 'User' }) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset, 3: Success
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your registered email or phone number.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await onSendOTP(emailOrPhone.trim());
      if (res && res.otp) {
        setGeneratedOtp(res.otp);
      } else {
        setGeneratedOtp('123456');
      }
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'No account found matching this email or phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please check again.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await onResetPassword(emailOrPhone.trim(), otpCode.trim(), newPassword);
      setStep(3);
      setSuccessMsg('Your password has been reset successfully! You can now log in.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmailOrPhone('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedOtp('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  const containerBg = isDarkMode 
    ? 'bg-gray-900 text-white border border-gray-800' 
    : 'bg-white text-gray-900 border border-gray-100';

  const inputBg = isDarkMode 
    ? 'bg-gray-800 border-gray-700 text-white focus:border-yellow-400' 
    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-600';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${containerBg} space-y-0 relative`}>
        
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-800 bg-gray-950/60' : 'border-gray-100 bg-amber-50/60'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black shadow">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">2-Step Password Reset</h3>
              <p className="text-[11px] opacity-70">For {targetRole} accounts (Admin, Shopkeeper & User)</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 pb-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
              step >= 1 ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400'
            }`}>1</div>
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
              step >= 2 ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400'
            }`}>2</div>
            <div className={`h-1 w-12 rounded-full ${step === 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
              step === 3 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>✓</div>
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier & Request 2FA Code */}
          {step === 1 && (
            <form onSubmit={handleSendOtpSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold block">Enter Registered Email or Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. shopkeeper@kiranabazar.com or +91 98765 43210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none font-medium text-xs ${inputBg}`}
                />
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-2xl text-[11px] text-blue-300 space-y-1">
                <p className="font-bold flex items-center gap-1 text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Two-Step Verification Security
                </p>
                <p>We will generate a 6-digit verification security code for your account credentials.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send 2-Step Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
              
              {/* Generated OTP Live Simulation Toast */}
              {generatedOtp && (
                <div className="bg-emerald-950/90 border-2 border-emerald-500/80 p-3.5 rounded-2xl text-emerald-200 space-y-1 text-center animate-bounce-short shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    📲 2-Step Verification Code Received:
                  </span>
                  <div className="font-black text-2xl text-yellow-300 tracking-widest font-mono py-0.5">
                    {generatedOtp}
                  </div>
                  <span className="text-[10px] text-emerald-300/80">Enter this 6-digit code below to verify ownership</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold block">Enter 6-Digit Verification Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none font-black text-center text-lg tracking-widest ${inputBg}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min 4 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none font-medium ${inputBg}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none font-medium ${inputBg}`}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-gray-700 font-bold hover:bg-black/20 text-gray-300"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-green-600 hover:bg-green-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Reset Password</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Password Reset Success View */}
          {step === 3 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto text-3xl border-2 border-green-500 shadow-xl">
                ✓
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-lg text-green-400">Password Reset Complete!</h4>
                <p className="text-xs opacity-80 max-w-xs mx-auto">
                  {successMsg || 'Your account password has been updated securely.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-xl transition"
              >
                Back to Sign In
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
