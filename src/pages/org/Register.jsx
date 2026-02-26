import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orgRegister } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getApiMessage } from '../../services/apiHelpers';
import PasswordInput from '../../components/PasswordInput';

export default function Register() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [advocateName, setAdvocateName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useOrgAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!accountType) {
      setError('Please select an account type');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        account_type: accountType,
        advocate_name: advocateName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim() || undefined,
        password
      };
      if (accountType === 'ORGANIZATION') payload.organization_name = organizationName.trim();
      const { data } = await orgRegister(payload);
      loginSuccess(data.user);
      success('Account created. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = getApiMessage(err, 'Registration failed');
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-bottom safe-area-top">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-primary mb-2">AdvocateLearn</h1>
          <p className="text-gray-600 mb-6">
            {step === 1 ? 'Create your account' : 'Account details'}
          </p>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}
              <p className="text-sm font-medium text-gray-700 mb-2">Account type</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="accountType"
                    value="ORGANIZATION"
                    checked={accountType === 'ORGANIZATION'}
                    onChange={(e) => setAccountType(e.target.value)}
                  />
                  <span>Organisation (Law Firm)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="accountType"
                    value="SOLO"
                    checked={accountType === 'SOLO'}
                    onChange={(e) => setAccountType(e.target.value)}
                  />
                  <span>Individual (Solo Advocate)</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent disabled:opacity-50 transition-colors"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}
              {accountType === 'ORGANIZATION' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    required
                    placeholder="Law firm name"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advocate name</label>
                <input
                  type="text"
                  value={advocateName}
                  onChange={(e) => setAdvocateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  required
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile (optional)</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 number"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
