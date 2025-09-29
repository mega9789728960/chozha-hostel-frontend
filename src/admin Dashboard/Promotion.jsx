import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from './Common/Card';
import Button from './Common/Button';

const Promotion = ({ isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [isDeleteFinalYear, setIsDeleteFinalYear] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Email is required');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://finalbackend-mauve.vercel.app/promotion',
        {
          email: email.trim(),
          isdeletefinalyear: isDeleteFinalYear,
          token
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setMessage(response.data.message || 'Promotion processed successfully');
        setMessageType('success');
        setEmail('');
        setIsDeleteFinalYear(false);
      } else {
        setMessage(response.data.message || 'Failed to process promotion');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error processing promotion:', err);
      setMessage(err.response?.data?.message || 'Failed to process promotion');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Student Promotion
        </h2>
      </div>

      <Card isDarkMode={isDarkMode}>
        <CardHeader>
          <h3 className="text-lg font-semibold">Promote Student</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter the student's email to promote them to the next year or delete final year records.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Student Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter student email"
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDeleteFinalYear"
                checked={isDeleteFinalYear}
                onChange={(e) => setIsDeleteFinalYear(e.target.checked)}
                className="mr-2"
              />
              <label
                htmlFor="isDeleteFinalYear"
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Delete Final Year Records
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              isDarkMode={isDarkMode}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Process Promotion'}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              messageType === 'success'
                ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700')
                : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700')
            }`}>
              <p>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotion;
