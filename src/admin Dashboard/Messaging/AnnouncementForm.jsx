import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../Common/Button';

const AnnouncementForm = () => {
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'Normal',
    targetAudience: 'All Students',
    scheduledDate: '',
    scheduledTime: ''
  });

  const [sendOptions, setSendOptions] = useState({
    dashboardNotification: false,
    email: false,
    studentsDashboard: false
  });

  const [sendStatus, setSendStatus] = useState({
    dashboardNotification: null,
    email: null,
    studentsDashboard: null
  });

  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [errorAnnouncements, setErrorAnnouncements] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getAudienceFromTarget = (target) => {
    switch (target) {
      case 1: return 'First Year';
      case 2: return 'Second Year';
      case 3: return 'Third Year';
      case 4: return 'Fourth Year';
      default: return 'All Students';
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://finalbackend-mauve.vercel.app/fetchannocementforadmin',
        {
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
        const fetchedAnnouncements = response.data.data || response.data.announcements || [];
        const mappedAnnouncements = fetchedAnnouncements.map(ann => ({
          ...ann,
          status: new Date(ann.scheduled_date) > new Date() ? 'Scheduled' : 'Sent',
          sentDate: ann.scheduled_date ? ann.scheduled_date.split('T')[0] : null,
          scheduledDate: ann.scheduled_date ? ann.scheduled_date.split('T')[0] : null,
          priority: ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1), // Capitalize
          targetAudience: ann.targetAudience || getAudienceFromTarget(ann.target)
        }));
        setAnnouncements(mappedAnnouncements);
      } else {
        setErrorAnnouncements(response.data.message || 'No announcements found');
      }
    } catch (err) {
      console.error(err);
      setErrorAnnouncements('Error fetching announcements');
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOptionChange = (e) => {
    const { name, checked } = e.target;
    setSendOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const sendToDashboardNotification = async (announcement) => {
    // Mock function for sending to dashboard notification
    // Replace with actual API call later
    console.log('Sending to dashboard notification:', announcement);
    return new Promise((resolve) => setTimeout(() => resolve('success'), 1000));
  };

  const sendEmail = async (announcement) => {
    // Mock function for sending email
    // Replace with actual API call later
    console.log('Sending email:', announcement);
    return new Promise((resolve) => setTimeout(() => resolve('success'), 1000));
  };

  const sendAnnouncementAPI = async (data) => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      'https://finalbackend-mauve.vercel.app/pushannocement',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
      }
    );
    return response.data;
  };

  const sendToStudentsDashboard = async (announcement) => {
    const priority = announcement.priority.toLowerCase();
    const targets = announcement.targetAudience === 'All Students' ? [1, 2, 3, 4] : [getTargetNumber(announcement.targetAudience)];
    const scheduledDate = announcement.scheduledDate;
    const scheduledTime = announcement.scheduledTime;
    const scheduled_date = scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00Z` : new Date().toISOString();

    for (const target of targets) {
      const data = {
        title: announcement.title,
        message: announcement.message,
        priority,
        target,
        scheduled_date,
        ...(localStorage.getItem('accessToken') && { token: localStorage.getItem('accessToken') })
      };
      const pushResponse = await sendAnnouncementAPI(data);

      // After successful push, send notification to students
      if (pushResponse.success) {
        try {
          await axios.post(
            'https://finalbackend-mauve.vercel.app/sendnotificationforstudents',
            {
              title: announcement.title,
              message: announcement.message,
              priority,
              target,
              ...(localStorage.getItem('accessToken') && { token: localStorage.getItem('accessToken') })
            },
            {
              headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('accessToken') && { Authorization: `Bearer ${localStorage.getItem('accessToken')}` })
              },
              withCredentials: true
            }
          );
        } catch (notificationError) {
          console.error('Error sending notification to students:', notificationError);
          // Don't throw error to avoid breaking the flow
        }
      }
    }
  };

  const getTargetNumber = (audience) => {
    if (audience === 'All Students') return 0;
    switch (audience) {
      case 'First Year': return 1;
      case 'Second Year': return 2;
      case 'Third Year': return 3;
      case 'Fourth Year': return 4;
      default: return 0;
    }
  };

  const openEditModal = (ann) => {
    setEditingAnnouncement({
      id: ann.id,
      title: ann.title,
      message: ann.message,
      priority: ann.priority,
      targetAudience: ann.targetAudience || getAudienceFromTarget(ann.target),
      originalTarget: ann.target || 1,
      scheduledDate: ann.scheduledDate || '',
      scheduledTime: ann.scheduledTime || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAnnouncement(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement.title.trim() || !editingAnnouncement.message.trim()) {
      alert('Title and message are required');
      return;
    }

    if (editingAnnouncement.targetAudience === 'All Students') {
      alert('Cannot change target audience to "All Students" during edit. Please create a new announcement for all students or select a specific year.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Please login to edit announcements');
      return;
    }

    setEditSubmitting(true);
    try {
      let editPayload = {
        announcement_id: editingAnnouncement.id,
        title: editingAnnouncement.title.trim(),
        message: editingAnnouncement.message.trim(),
        priority: editingAnnouncement.priority.toLowerCase(),
        target: getTargetNumber(editingAnnouncement.targetAudience),
        token
      };

      const hasSchedule = editingAnnouncement.scheduledDate && editingAnnouncement.scheduledTime;
      if (hasSchedule) {
        editPayload.scheduled_date = `${editingAnnouncement.scheduledDate}T${editingAnnouncement.scheduledTime}:00Z`;
      } else {
        editPayload.scheduled_date = new Date().toISOString();
      }

      const response = await axios.post(
        'https://finalbackend-mauve.vercel.app/editannouncementforadmin',
        editPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Update local state
        setAnnouncements(announcements.map(ann =>
          ann.id === editingAnnouncement.id
            ? { 
                ...ann, 
                ...editingAnnouncement, 
                priority: editingAnnouncement.priority.charAt(0).toUpperCase() + editingAnnouncement.priority.slice(1),
                scheduledDate: hasSchedule ? editingAnnouncement.scheduledDate : ann.scheduledDate,
                sentDate: !hasSchedule ? new Date().toISOString().split('T')[0] : ann.sentDate,
                status: hasSchedule ? 'Scheduled' : 'Sent'
              }
            : ann
        ));
        closeEditModal();
        setSuccessMessage('Announcement edited successfully!');
      } else {
        alert(response.data.message || 'Failed to edit announcement');
      }
    } catch (err) {
      console.error('Error editing announcement:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      alert(`Failed to edit announcement: ${errorMsg}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const anySendOptionSelected = sendOptions.dashboardNotification || sendOptions.email || sendOptions.studentsDashboard;
    if (!anySendOptionSelected) {
      alert('Please select at least one send method.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setSendStatus({
      dashboardNotification: null,
      email: null,
      studentsDashboard: null
    });

    let hasError = false;
    let announcementPushed = false;

    const newAnnouncement = {
      ...announcement,
      status: announcement.scheduledDate ? 'Scheduled' : 'Sent',
      sentDate: announcement.scheduledDate ? null : new Date().toISOString().split('T')[0]
    };

    // Send to selected destinations
    if (sendOptions.dashboardNotification) {
      try {
        await sendToDashboardNotification(newAnnouncement);
        setSendStatus(prev => ({ ...prev, dashboardNotification: 'success' }));
      } catch (error) {
        setSendStatus(prev => ({ ...prev, dashboardNotification: 'error' }));
        hasError = true;
      }
    }

    if (sendOptions.email) {
      try {
        await sendEmail(newAnnouncement);
        setSendStatus(prev => ({ ...prev, email: 'success' }));
      } catch (error) {
        setSendStatus(prev => ({ ...prev, email: 'error' }));
        hasError = true;
      }
    }

    if (sendOptions.studentsDashboard) {
      try {
        await sendToStudentsDashboard(newAnnouncement);
        setSendStatus(prev => ({ ...prev, studentsDashboard: 'success' }));
        announcementPushed = true;
      } catch (error) {
        setSendStatus(prev => ({ ...prev, studentsDashboard: 'error' }));
        hasError = true;
      }
    }

    // Refetch announcements only if announcement was pushed to backend
    if (announcementPushed) {
      await fetchAnnouncements();
    }

    setAnnouncement({
      title: '',
      message: '',
      priority: 'Normal',
      targetAudience: 'All Students',
      scheduledDate: '',
      scheduledTime: ''
    });
    setSendOptions({
      dashboardNotification: false,
      email: false,
      studentsDashboard: false
    });

    if (!hasError) {
      setSuccessMessage('Announcement sent successfully!');
    }

    setIsSubmitting(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-400';
      case 'Normal':
        return 'text-yellow-400';
      case 'Low':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent':
        return 'bg-green-500 bg-opacity-20 text-green-400';
      case 'Scheduled':
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
      default:
        return 'bg-slate-500 bg-opacity-20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Send Announcement</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Form */}
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={announcement.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={announcement.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your announcement message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={announcement.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={announcement.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All Students">All Students</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Fourth Year">Fourth Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Schedule Date (Optional)
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={announcement.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Schedule Time (Optional)
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={announcement.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Send To
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="dashboardNotification"
                    checked={sendOptions.dashboardNotification}
                    onChange={handleSendOptionChange}
                    className="mr-2"
                  />
                  <span className="text-slate-300">Dashboard Notification</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="email"
                    checked={sendOptions.email}
                    onChange={handleSendOptionChange}
                    className="mr-2"
                  />
                  <span className="text-slate-300">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="studentsDashboard"
                    checked={sendOptions.studentsDashboard}
                    onChange={handleSendOptionChange}
                    className="mr-2"
                  />
                  <span className="text-slate-300">Students Dashboard</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (announcement.scheduledDate ? 'Scheduling...' : 'Sending...') : (announcement.scheduledDate ? 'Schedule Announcement' : 'Send Announcement')}
            </Button>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-700 bg-opacity-20 border border-green-500 rounded-lg">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Send Status Feedback */}
            {(sendStatus.dashboardNotification || sendStatus.email || sendStatus.studentsDashboard) && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Send Status</h4>
                <div className="space-y-1">
                  {sendStatus.dashboardNotification && (
                    <div className="flex items-center text-sm">
                      <span className="text-slate-400 mr-2">Dashboard Notification:</span>
                      <span className={sendStatus.dashboardNotification === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {sendStatus.dashboardNotification === 'success' ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  )}
                  {sendStatus.email && (
                    <div className="flex items-center text-sm">
                      <span className="text-slate-400 mr-2">Email:</span>
                      <span className={sendStatus.email === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {sendStatus.email === 'success' ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  )}
                  {sendStatus.studentsDashboard && (
                    <div className="flex items-center text-sm">
                      <span className="text-slate-400 mr-2">Students Dashboard:</span>
                      <span className={sendStatus.studentsDashboard === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {sendStatus.studentsDashboard === 'success' ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Recent Announcements */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-white">Recent Announcements</h4>
            <button
              onClick={fetchAnnouncements}
              disabled={loadingAnnouncements}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAnnouncements ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loadingAnnouncements ? (
              <p className="text-slate-400">Loading announcements...</p>
            ) : errorAnnouncements ? (
              <p className="text-red-400">{errorAnnouncements}</p>
            ) : announcements.length === 0 ? (
              <p className="text-slate-400">No announcements found.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-white">{ann.title}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ann.status)}`}>
                      {ann.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{ann.message}</p>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className={getPriorityColor(ann.priority)}>{ann.priority} Priority</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(ann)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <span>{ann.sentDate || ann.scheduledDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingAnnouncement.title}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={editingAnnouncement.message}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={editingAnnouncement.priority}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                  <select
                    name="targetAudience"
                    value={editingAnnouncement.targetAudience}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All Students">All Students</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Schedule Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={editingAnnouncement.scheduledDate}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Schedule Time</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={editingAnnouncement.scheduledTime}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAnnouncement}
                disabled={editSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementForm;
