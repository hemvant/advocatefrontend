import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../services/orgApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(getApiMessage(err, 'Verification failed or link expired.'));
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">AdvocateLearn</h1>
        {status === 'loading' && (
          <p className="text-gray-600">Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <p className="text-green-600 font-medium mb-4">{message}</p>
            <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 font-medium mb-4">{message}</p>
            <Link to="/login" className="text-accent font-medium hover:underline">Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}
