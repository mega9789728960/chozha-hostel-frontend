import React, { useState, useEffect } from 'react';
import { markAttendance, markAbsent, showAttends } from '../service/api';

const Attendance = () => {

  const [attendanceStatus, setAttendanceStatus] = useState(null); // null, 'present', 'absent'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await showAttends({});
      if (response.success) {
        setAttendanceHistory(response.data || []);
      } else {
        console.error('Failed to fetch attendance history:', response.message);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
  };

  const markAttendance = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await markAttendance({ lat, lng, status: 'present' });

          if (response.success) {
            setMessage('Attendance marked as present successfully!');
            setAttendanceStatus('present');
            fetchAttendanceHistory(); // Refresh history after marking
          } else {
            setMessage(response.message || 'Attendance already marked for today.');
          }
        } catch (err) {
          setError(err.message || 'An error occurred.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  const markAbsent = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await markAbsent({ lat, lng, status: 'absent' });

          if (response.success) {
            setMessage('Attendance marked as absent successfully!');
            setAttendanceStatus('absent');
            fetchAttendanceHistory(); // Refresh history after marking
          } else {
            setMessage(response.message || 'Attendance already marked for today.');
          }
        } catch (err) {
          setError(err.message || 'An error occurred.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 max-w-full relative z-10">
        <h2 className="text-2xl font-bold text-white mb-3 md:mb-0">Attendance Management</h2>


        <div className="w-full md:w-auto md:flex-shrink-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <button
            onClick={markAttendance}
            disabled={loading || attendanceStatus !== null}
            className="w-full md:inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-all duration-200 relative z-20"
          >
            {loading ? 'Marking...' : attendanceStatus === 'present' ? "Present Marked" : "✅ Mark Present"}
          </button>
          <button
            onClick={markAbsent}
            disabled={loading || attendanceStatus !== null}
            className="w-full md:inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-all duration-200 relative z-20"
          >
            {loading ? 'Marking...' : attendanceStatus === 'absent' ? "Absent Marked" : "❌ Mark Absent"}
          </button>
        </div>
      </div>

      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="relative w-36 h-36 mx-auto mb-4 md:w-32 md:h-32">
            <svg className="progress-circle w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none"/>
              <circle cx="60" cy="60" r="50" stroke="#10b981" strokeWidth="8" fill="none"
                      strokeDasharray="314" strokeDashoffset="39.25"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">87.5%</div>
                <div className="text-xs text-slate-400">Overall</div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Attendance Percentage</h3>
          <p className="text-slate-400 text-sm">175 out of 200 days</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Present Days</span>
              <span className="text-emerald-400 font-semibold">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Absent Days</span>
              <span className="text-red-400 font-semibold">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Late Entries</span>
              <span className="text-yellow-400 font-semibold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Days</span>
              <span className="text-white font-semibold">30</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Status</h3>
          <div className="text-center">
            <div className={`w-16 h-16 ${attendanceStatus === 'present' ? 'bg-emerald-500' : attendanceStatus === 'absent' ? 'bg-red-500' : 'bg-gray-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-2xl">{attendanceStatus === 'present' ? '✅' : attendanceStatus === 'absent' ? '❌' : '⏳'}</span>
            </div>
            <p className={`${attendanceStatus === 'present' ? 'text-emerald-400' : attendanceStatus === 'absent' ? 'text-red-400' : 'text-gray-400'} font-semibold mb-2`}>
              {attendanceStatus === 'present' ? 'Present' : attendanceStatus === 'absent' ? 'Absent' : 'Not Marked'}
            </p>
            <p className="text-slate-400 text-sm">Marked at {attendanceStatus ? new Date().toLocaleTimeString() : '-'}</p>
            <p className="text-slate-400 text-sm">Status: {attendanceStatus ? 'Confirmed' : 'Pending'}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Attendance History</h3>

        {/* Desktop/Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Self Marked</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Admin Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-700">
                  <td className="py-3 px-4 text-white">{row.date}</td>
                  <td className="py-3 px-4"><span className={row.self === 'Present' ? 'status-paid' : 'status-unpaid'}>{row.self}</span></td>
                  <td className="py-3 px-4"><span className={row.admin === 'Confirmed' ? 'status-paid' : 'status-unpaid'}>{row.admin}</span></td>
                  <td className="py-3 px-4 text-slate-400">{row.time}</td>
                  <td className="py-3 px-4 text-slate-400">{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked list */}
        <div className="md:hidden space-y-4">
          {attendanceHistory.map((row, idx) => (
            <div key={idx} className="p-4 bg-slate-900 bg-opacity-20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">{row.date}</div>
                <div className="text-sm text-slate-400">{row.time}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm">Self</div>
                  <div className={row.self === 'Present' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{row.self}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Admin</div>
                  <div className={row.admin === 'Confirmed' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{row.admin}</div>
                </div>
              </div>
              {row.remarks && <div className="text-slate-400 text-sm mt-2">Remarks: {row.remarks}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default Attendance;
