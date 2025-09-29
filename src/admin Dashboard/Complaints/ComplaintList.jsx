import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import { fetchStudents, fetchComplaintsForAdmins, changeComplaintStatusForAdmin } from '../../service/api';

const ComplaintList = ({ isDarkMode, searchTerm, filter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch complaints
        const complaintsResponse = await fetchComplaintsForAdmins();

        // Fetch students
        const studentsData = await fetchStudents();

        if (complaintsResponse.success) {
          // Map API data to component's expected structure
          const mappedComplaints = complaintsResponse.data.map((item) => {
            // Find student info by student_id
            const student = studentsData.find(s => s.id === item.student_id);
            return {
              id: item.id,
              studentName: student ? student.name : `Student ID: ${item.student_id}`,
              room: student ? student.room_number : 'N/A',
              title: item.title,
              description: item.description,
              category: item.category,
              priority: item.priority,
              status: item.status,
              dateSubmitted: item.created_at,
              lastUpdated: item.created_at,
            };
          });
          setComplaints(mappedComplaints);
          setStudents(studentsData);
        } else {
          setComplaints([]);
          setError(complaintsResponse.message || 'Failed to fetch complaints');
        }
      } catch (err) {
        setError(err.message || 'Error fetching complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (complaintId) => {
    console.log('View complaint details:', complaintId);
  };

  const handleUpdateStatus = (complaintId, newStatus) => {
    // Call admin complaint status change API
    (async () => {
      try {
        const response = await changeComplaintStatusForAdmin(complaintId, newStatus);

        if (response.success) {
          // Update local state
          setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: response.status || newStatus } : c));
          alert(response.message || 'Updated successfully');
        } else {
          const message = response.message || response.error || 'Failed to update status';
          alert(message);
        }
      } catch (err) {
        console.error('Error updating complaint status:', err);
        alert('Network error. Please try again.');
      }
    })();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         complaint.status.toLowerCase().replace(' ', '-') === filter ||
                         complaint.priority.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading complaints...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className={`text-red-500 text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          Error loading complaints
        </div>
        <div className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: stacked complaint cards */}
      <div className="space-y-3 sm:hidden">
        {paginatedComplaints.length > 0 ? (
          paginatedComplaints.map((complaint) => {
            return (
              <div key={complaint.id} className={isDarkMode ? 'p-3 rounded-lg bg-gray-800 border border-gray-700' : 'p-3 rounded-lg bg-white border border-gray-200'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={isDarkMode ? 'text-sm font-medium text-white' : 'text-sm font-medium text-gray-900'}>
                      {complaint.title}
                    </div>
                    <div className={isDarkMode ? 'text-xs text-gray-400 mt-1' : 'text-xs text-gray-600 mt-1'}>
                      {complaint.description}
                    </div>
                    <div className="mt-2 text-sm">
                      <div><strong>Student:</strong> {complaint.studentName}</div>
                      <div><strong>Room:</strong> {complaint.room}</div>
                      <div><strong>Category:</strong> {complaint.category}</div>
                      <div><strong>Priority:</strong> <span className={'inline-block px-2 py-1 rounded ' + getPriorityColor(complaint.priority)}>{complaint.priority}</span></div>
                      <div><strong>Status:</strong> <span className={'inline-block px-2 py-1 rounded ' + getStatusColor(complaint.status)}>{complaint.status}</span></div>
                      <div><strong>Date:</strong> {new Date(complaint.dateSubmitted).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <div className="flex flex-col space-y-2">
                      <Button onClick={() => handleViewDetails(complaint.id)} variant="outline" size="small" isDarkMode={isDarkMode}>View</Button>
                      {complaint.status !== 'resolved' && (
                        <select onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)} className={isDarkMode ? 'px-2 py-1 text-sm border rounded bg-gray-700 border-gray-600 text-white' : 'px-2 py-1 text-sm border rounded bg-white border-gray-300 text-gray-900'} defaultValue="">
                          <option value="" disabled>Update</option>
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={isDarkMode ? 'px-4 py-3 text-center text-gray-400' : 'px-4 py-3 text-center text-gray-600'}>No complaints found</div>
        )}
      </div>

      {/* Desktop/tablet: show table on sm+ */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto block w-full" style={{ position: 'relative', zIndex: 1 }}>
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Complaint
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Student
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Priority
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {paginatedComplaints.map((complaint) => (
                <tr key={complaint.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {complaint.title}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate max-w-xs`}>
                        {complaint.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {complaint.studentName}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Room {complaint.room}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {complaint.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(complaint.dateSubmitted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <Button
                      onClick={() => handleViewDetails(complaint.id)}
                      variant="outline"
                      size="small"
                      isDarkMode={isDarkMode}
                    >
                      View
                    </Button>
                    {complaint.status !== 'resolved' && (
                      <select
                        onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
                        className={`px-3 py-2 text-sm border rounded relative z-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        defaultValue=""
                      >
                        <option value="" disabled>Update</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mt-4">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="small"
              isDarkMode={isDarkMode}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="small"
              isDarkMode={isDarkMode}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;