import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { orgLogin } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getApiMessage } from '../../services/apiHelpers';
import PasswordInput from '../../components/PasswordInput';

export default function OrgLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useOrgAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await orgLogin({ email, password });
      loginSuccess(data.user);
      success('Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getApiMessage(err, 'Login failed');
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
          <p className="text-gray-600 mb-6">Sign in to your organization</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
            )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Super Admin? <Link to="/super-admin/login" className="text-accent font-medium hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
