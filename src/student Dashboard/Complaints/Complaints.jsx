import React, { useState, useEffect } from 'react';
import { fetchComplaintsForStudents } from '@/service/api';
import ComplaintModal from './ComplaintModal';

const Complaints = () => {
  const [showModal, setShowModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'inProgress', 'resolved'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug token presence
      console.log('Fetching complaints with tokens:');
      console.log('localStorage studentToken:', localStorage.getItem('studentToken'));
      console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
      console.log('sessionStorage studentToken:', sessionStorage.getItem('studentToken'));

      const response = await fetchComplaintsForStudents();

      console.log('Fetch complaints response:', response);

      if (response.success) {
        const complaintsData = Array.isArray(response.data) ? response.data : [];
        setComplaints(complaintsData);

        const total = complaintsData.length;
        const pending = complaintsData.filter(c => c.status && c.status.toLowerCase() === 'pending').length;
        const inProgress = complaintsData.filter(c => c.status && c.status.toLowerCase() === 'in progress').length;
        const resolved = complaintsData.filter(c => c.status && c.status.toLowerCase() === 'resolved').length;

        setStats({ total, pending, inProgress, resolved });
      } else {
        setError(response.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints based on active filter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(complaint => {
        switch (activeFilter) {
          case 'pending':
            return complaint.status && complaint.status.toLowerCase() === 'pending';
          case 'inProgress':
            return complaint.status && complaint.status.toLowerCase() === 'in progress';
          case 'resolved':
            return complaint.status && complaint.status.toLowerCase() === 'resolved';
          default:
            return true;
        }
      });
      setFilteredComplaints(filtered);
    }
  }, [complaints, activeFilter]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchComplaints();
  };

  const debugAuth = () => {
    console.log('=== AUTH DEBUG INFO ===');
    
    // Check all possible token locations
    const tokenLocations = {
      'localStorage studentToken': localStorage.getItem('studentToken'),
      'localStorage accessToken': localStorage.getItem('accessToken'),
      'sessionStorage studentToken': sessionStorage.getItem('studentToken')
    };
    
    Object.entries(tokenLocations).forEach(([location, token]) => {
      console.log(`${location}:`, token ? 'Present' : 'Missing');
      if (token) {
        const decoded = decodeJWT(token);
        console.log(`  Decoded ${location}:`, decoded);
        if (decoded) {
          console.log(`  Role: ${decoded.role}`);
          console.log(`  ID: ${decoded.id}`);
          console.log(`  Exp: ${new Date(decoded.exp * 1000).toLocaleString()}`);
        }
      }
    });

    // Check student data
    const studentDataStr = localStorage.getItem('studentData') || 
                          sessionStorage.getItem('studentData');
    if (studentDataStr) {
      try {
        const studentData = JSON.parse(studentDataStr);
        console.log('Student data:', studentData);
      } catch (e) {
        console.log('Error parsing student data:', e);
      }
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('studentToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('studentData');
    sessionStorage.removeItem('studentToken');
    sessionStorage.removeItem('studentData');
    
    // Redirect to login (you might need to adjust this based on your routing)
    window.location.href = '/login';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 max-w-full relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Complaint Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              if (error) {
                console.warn('Button enabled despite error:', error);
              }
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto transition-all duration-200 relative z-20"
            // Temporarily enable button even if error exists
            disabled={false}
          >
            📝 Raise New Complaint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className={`glass-card rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
            activeFilter === 'all' ? 'ring-2 ring-blue-400 bg-blue-900 bg-opacity-20' : ''
          }`}
          onClick={() => handleFilterClick('all')}
        >
          <div className="text-2xl font-bold text-white mb-2">{stats.total}</div>
          <div className="text-slate-400 text-sm">Total Complaints</div>
        </div>
        <div
          className={`glass-card rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
            activeFilter === 'pending' ? 'ring-2 ring-yellow-400 bg-yellow-900 bg-opacity-20' : ''
          }`}
          onClick={() => handleFilterClick('pending')}
        >
          <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
          <div className="text-slate-400 text-sm">Pending</div>
        </div>
        <div
          className={`glass-card rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
            activeFilter === 'inProgress' ? 'ring-2 ring-blue-400 bg-blue-900 bg-opacity-20' : ''
          }`}
          onClick={() => handleFilterClick('inProgress')}
        >
          <div className="text-2xl font-bold text-blue-400 mb-2">{stats.inProgress}</div>
          <div className="text-slate-400 text-sm">In Progress</div>
        </div>
        <div
          className={`glass-card rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
            activeFilter === 'resolved' ? 'ring-2 ring-emerald-400 bg-emerald-900 bg-opacity-20' : ''
          }`}
          onClick={() => handleFilterClick('resolved')}
        >
          <div className="text-2xl font-bold text-emerald-400 mb-2">{stats.resolved}</div>
          <div className="text-slate-400 text-sm">Resolved</div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            My Complaints
            {activeFilter !== 'all' && (
              <span className="ml-2 text-sm text-slate-400">
                ({activeFilter === 'pending' ? 'Pending' :
                  activeFilter === 'inProgress' ? 'In Progress' :
                  activeFilter === 'resolved' ? 'Resolved' : 'All'})
              </span>
            )}
          </h3>
          <div className="text-sm text-slate-400">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading complaints...</div>
        ) : error ? (
          <div className="text-center p-6">
            <div className="text-red-400 text-lg font-semibold mb-4">{error}</div>
            <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Possible Solutions:</h4>
              <ul className="text-sm text-yellow-300 list-disc pl-5 space-y-1">
                <li>Your account might not have the correct student role assigned</li>
                <li>Your authentication token might be corrupted or expired</li>
                <li>Try logging out and back in using the button above</li>
                <li>Contact your administrator if the issue persists</li>
              </ul>
            </div>
            <button
              onClick={fetchComplaints}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              🔄 Retry
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center text-slate-400">
            No complaints found. Ready to submit your first complaint!
            <button
              onClick={fetchComplaints}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Refresh
            </button>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center text-slate-400">
            No {activeFilter === 'pending' ? 'pending' :
                activeFilter === 'inProgress' ? 'in progress' :
                activeFilter === 'resolved' ? 'resolved' : ''} complaints found.
            <button
              onClick={() => setActiveFilter('all')}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Show All
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.complaint_id} className={`glass-effect rounded-lg p-4 border-l-4 ${
                complaint.status && complaint.status.toLowerCase() === 'pending' ? 'border-yellow-400' :
                complaint.status && complaint.status.toLowerCase() === 'in progress' ? 'border-blue-400' :
                complaint.status && complaint.status.toLowerCase() === 'resolved' ? 'border-emerald-400' : 'border-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{
                      complaint.category === 'Maintenance' ? '🔧' :
                      complaint.category === 'Mess' ? '🍽️' :
                      complaint.category === 'Infrastructure' ? '🏗️' : '📋'
                    }</span>
                    <div>
                      <h4 className="text-white font-medium">{complaint.title}</h4>
                      <p className="text-slate-400 text-sm">ID: #{complaint.complaint_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                    complaint.status && complaint.status.toLowerCase() === 'pending' ? 'bg-yellow-500 bg-opacity-20' :
                    complaint.status && complaint.status.toLowerCase() === 'in progress' ? 'bg-blue-500 bg-opacity-20' :
                    complaint.status && complaint.status.toLowerCase() === 'resolved' ? 'bg-emerald-500 bg-opacity-20' : 'bg-gray-500 bg-opacity-20'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">{complaint.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-slate-400">{complaint.category}</span>
                </div>
                {complaint.admin_response && (
                  <div className="mt-3 p-3 bg-emerald-900 bg-opacity-20 rounded">
                    <p className="text-emerald-400 text-sm font-medium">Admin Response:</p>
                    <p className="text-slate-300 text-sm">{complaint.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ComplaintModal onClose={handleModalClose} />}
    </div>
  );
};

export default Complaints;