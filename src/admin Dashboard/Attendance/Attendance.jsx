import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import { showAttends, changeAttendanceForAdmin, exportAttendance } from '../../service/api';

const Attendance = ({ isDarkMode }) => {
  const [filters, setFilters] = useState({
    student_id: '',
    department: '',
    academic_year: '',
    date: '',
    status: ''
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key].trim()) {
          activeFilters[key] = filters[key].trim();
        }
      });

      const response = await showAttends(activeFilters);

      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch attendance records');
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAttendanceRecords();
  };

  const handleClearFilters = () => {
    setFilters({
      student_id: '',
      department: '',
      academic_year: '',
      date: '',
      status: ''
    });
    fetchAttendanceRecords();
  };

  const handleExport = async () => {
    try {
      const response = await exportAttendance(filters);
      if (response.success) {
        // Assuming the API returns a download URL or blob
        // For now, we'll create a download link
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'attendance_records.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(response.message || 'Failed to export attendance records');
      }
    } catch (err) {
      console.error('Error exporting attendance records:', err);
      setError(err.message || 'Failed to export attendance records');
    }
  };

  const handleChangeAttendance = async (attendanceId, newStatus) => {
    try {
      const response = await changeAttendanceForAdmin({ attendance_id: attendanceId, status: newStatus });
      if (response.success) {
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.attendance_id === attendanceId 
              ? { ...record, status: newStatus } 
              : record
          )
        );
        // Optionally show success message
        alert('Attendance status updated successfully');
      } else {
        setError(response.message || 'Failed to update attendance status');
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err.message || 'Failed to update attendance status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between select-none">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Attendance Records
        </h2>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline" isDarkMode={isDarkMode}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
        <div className="mb-6 select-none">
          <h3 className="text-lg font-semibold">Filter Attendance Records</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Search and filter attendance records by various criteria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Student ID */}
          <div>
            <label htmlFor="student_id" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Student ID
            </label>
            <input
              id="student_id"
              type="text"
              name="student_id"
              value={filters.student_id}
              onChange={handleFilterChange}
              placeholder="Enter student ID"
              className={`w-full px-3 py-2 border rounded-md text-sm select-text ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Department
            </label>
            <input
              id="department"
              type="text"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              placeholder="Enter department"
              className={`w-full px-3 py-2 border rounded-md text-sm select-text ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Academic Year
            </label>
            <input
              id="academic_year"
              type="text"
              name="academic_year"
              value={filters.academic_year}
              onChange={handleFilterChange}
              placeholder="e.g., 2025"
              className={`w-full px-3 py-2 border rounded-md text-sm select-text ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-md text-sm select-text ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-md text-sm select-text ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end space-x-2">
            <Button onClick={handleSearch} variant="primary" isDarkMode={isDarkMode} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button onClick={handleClearFilters} variant="outline" isDarkMode={isDarkMode}>
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <div className={`p-4 rounded-md mb-4 select-none ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
            <p>Error: {error}</p>
          </div>
        )}

        <div className="overflow-x-auto select-none">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {['Attendance ID','Date','Status','Student ID','Name','Department','Academic Year'].map((title) => (
                  <th
                    key={title}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {loading ? 'Loading records...' : 'No attendance records found'}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.attendance_id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.attendance_id}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={record.status}
                        onChange={(e) => handleChangeAttendance(record.attendance_id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)} border-0 bg-transparent`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.student_id}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.department}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.academic_year}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {attendanceRecords.length > 0 && (
          <div className="flex justify-between items-center text-sm mt-4 select-none">
            <div className={`flex space-x-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Present: {attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length}</span>
              <span>Absent: {attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length}</span>
              <span>Late: {attendanceRecords.filter(r => r.status?.toLowerCase() === 'late').length}</span>
            </div>
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Total Records: {attendanceRecords.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
