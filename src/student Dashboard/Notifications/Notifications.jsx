import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      const studentId = localStorage.getItem('studentId'); // Assume stored during login

      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        return;
      }

      const response = await axios.post(
        'https://finalbackend-mauve.vercel.app/fetchnotificationforstudents',
        {
          id: studentId,
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
        const fetchedNotifications = response.data.data || [];
        // Filter out dismissed notifications (assume dismiss sets a flag or removes)
        const activeNotifications = fetchedNotifications.filter(n => !n.dismissed);
        setNotifications(activeNotifications);
      } else {
        setError(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://finalbackend-mauve.vercel.app/dismissnotificationforstudent',
        {
          notification_id: notificationId,
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
        // Remove from local state
        setNotifications(notifications.filter(n => n.id !== notificationId));
      } else {
        alert(response.data.message || 'Failed to dismiss notification');
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
      alert('Failed to dismiss notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'bill': return '🍽️';
      case 'complaint': return '📝';
      case 'attendance': return '✅';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'bill': return 'bg-red-500';
      case 'complaint': return 'bg-blue-500';
      case 'attendance': return 'bg-emerald-500';
      case 'announcement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Notifications & Messages</h2>
        <button
          onClick={fetchNotifications}
          className="btn-secondary text-white px-4 py-2 rounded-lg font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No notifications available.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-item glass-card rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 ${getBgColor(notification.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm">{getIcon(notification.type)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{notification.title}</h4>
                  <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
