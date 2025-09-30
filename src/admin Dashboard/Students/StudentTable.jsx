import React, { useState } from 'react';
import Button from '../Common/Button';
import StudentPreviewModal from './StudentPreviewModal';

// Add custom styles for status badges and action buttons
const styles = `
  .status-active { color: #10b981; }
  .status-pending { color: #f59e0b; }
  .status-rejected { color: #ef4444; }
  .status-inactive { color: #6b7280; }
  .action-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
  }
  .action-btn:hover {
    transform: scale(1.05);
  }
  .data-table {
    border-collapse: separate;
    border-spacing: 0;
  }
  .data-table th {
    background: rgba(255, 255, 255, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .data-table tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StudentTable = ({ isDarkMode, searchTerm, filter, students, onApprove, onReject, onEdit, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || student.status?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (studentId) => {
    console.log('Edit student:', studentId);
    if (onEdit) {
      onEdit(studentId);
    }
  };

  const handleDelete = (studentId) => {
    console.log('Delete student:', studentId);
    // TODO: Implement delete functionality
  };

  const handlePreview = (student) => {
    console.log('Preview button clicked for student:', student);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleApprove = (studentId) => {
    console.log('Approve student:', studentId);
    if (onApprove) {
      onApprove(studentId);
    }
  };

  const handleReject = (studentId) => {
    console.log('Reject student:', studentId);
    if (onReject) {
      onReject(studentId);
    }
  };

  const handleRejectClick = (studentId) => {
    console.log('Reject click student:', studentId);
    // This will be passed as a prop from Students component
    if (window.handleRejectClick) {
      window.handleRejectClick(studentId);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') return 'status-inactive';

    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-inactive';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-4 relative z-10">
      <div className="flex justify-between items-center">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="small"
          isDarkMode={isDarkMode}
        >
          Refresh
        </Button>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {paginatedStudents.length > 0 ? (
          paginatedStudents.map(student => (
            <div key={student.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {student.profile_photo ? (
                    <img src={student.profile_photo} alt={`${student.name} profile`} className="w-12 h-12 rounded-md object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{student.name ? student.name.charAt(0).toUpperCase() : 'N'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name || 'N/A'}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{student.email || 'N/A'}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{student.registration_number || 'N/A'}</div>
                      <div className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{getStatusColor(student.status).replace('status-', '')}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    <div><strong>Dept:</strong> {student.department || 'N/A'}</div>
                    <div><strong>Year:</strong> {student.academic_year || 'N/A'}</div>
                    <div><strong>Room:</strong> {student.room_number || 'N/A'}</div>
                    <div><strong>Joined:</strong> {formatDate(student.created_at)}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.status === 'inactive' && (
                      <>
                        <button onClick={() => handleApprove(student.id)} className="px-2 py-1 text-xs rounded bg-emerald-500 text-white">Approve</button>
                        <button onClick={() => handleReject(student.id)} className="px-2 py-1 text-xs rounded bg-red-500 text-white">Reject</button>
                      </>
                    )}
                    <button onClick={() => handleEdit(student.id)} className="px-2 py-1 text-xs rounded bg-blue-500 text-white">Edit</button>
                    <button onClick={() => handlePreview(student)} className="px-2 py-1 text-xs rounded bg-purple-500 text-white">Preview</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`px-4 py-3 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No students found matching your criteria</div>
        )}
      </div>

      {/* Desktop/tablet: show table on sm+ */}
      <div className="hidden sm:block overflow-x-auto">
        <table className={`data-table w-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Student
              </th>
              <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Reg. No.
              </th>
              {/* Hide less important columns on very small screens */}
              <th className={`text-left py-3 px-4 hidden sm:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Department
              </th>
              <th className={`text-left py-3 px-4 hidden sm:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Year
              </th>
              <th className={`text-left py-3 px-4 hidden md:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Room
              </th>
              <th className={`text-left py-3 px-4 hidden lg:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                createdat
              </th>
              <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Status
              </th>
              <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <tr key={student.id} className={`border-b ${isDarkMode ? 'border-slate-700 hover:bg-white hover:bg-opacity-5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative group">
                        {student.profile_photo ? (
                          <>
                            <img
                              src={student.profile_photo}
                              alt={`${student.name || 'Student'} profile`}
                              className="w-8 h-8 rounded-full object-cover border border-gray-300 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-blue-400"
                            />
                            {/* Modern tooltip positioned to the right */}
                            <div className="absolute z-50 left-full top-0 ml-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
                              <div className="relative">
                                {/* Tooltip content with glassmorphism effect */}
                                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-3 min-w-40 max-w-xs">
                                  <div className="flex items-center space-x-3">
                                    {/* Passport-size photo */}
                                    <div className="relative flex-shrink-0">
                                      <img
                                        src={student.profile_photo}
                                        alt={`${student.name || 'Student'} profile`}
                                        className="w-16 h-20 object-cover rounded-xl border-2 border-white dark:border-gray-600 shadow-lg"
                                      />
                                      {/* Online status indicator */}
                                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                    </div>

                                    {/* Student details */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                        {student.name || 'Student'}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {student.email || 'No email'}
                                      </p>
                                      <div className="flex flex-col space-y-1 mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-fit">
                                          {student.department || 'N/A'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 w-fit">
                                          Room {student.room_number || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-blue-400`}>
                            <span className="text-xs font-bold text-white">
                              {student.name ? student.name.charAt(0).toUpperCase() : 'N'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {student.name || 'N/A'}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {student.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {student.registration_number || 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm hidden sm:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {student.department || 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm hidden sm:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {student.academic_year || 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm hidden md:table-cell ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {student.room_number || 'N/A'}
                  </td>
                  <td className={`py-3 px-4 text-sm hidden lg:table-cell ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {formatDate(student.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`status-${getStatusColor(student.status)} bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium`}>
                      {student.status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {/* Visible quick actions */}
                      <div className="hidden sm:flex space-x-2">
                        {student.status === 'inactive' && (
                          <>
                            <button
                              onClick={() => handleApprove(student.id)}
                              className="action-btn bg-emerald-500 bg-opacity-20 text-emerald-400 hover:bg-opacity-30"
                              title="Approve student"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => handleReject(student.id)}
                              className="action-btn bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30"
                              title="Reject student"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(student.id)}
                          className="action-btn bg-blue-500 bg-opacity-20 text-blue-400 hover:bg-opacity-30"
                          title="Edit student"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handlePreview(student)}
                          className="action-btn bg-purple-500 bg-opacity-20 text-purple-400 hover:bg-opacity-30"
                          title="Preview student details"
                        >
                          👁️
                        </button>
                      </div>

                      {/* Compact 'More' menu for small screens to show hidden data/actions */}
                      <div className="sm:hidden relative">
                        <details className="relative">
                          <summary className={`list-none cursor-pointer action-btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 p-2 rounded-md`}>
                            ⋯
                          </summary>
                          <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50`}
                               role="menu">
                            <div className="text-sm mb-2">
                              <div><strong>{student.name}</strong></div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{student.email}</div>
                            </div>
                            <div className="text-xs divide-y divide-gray-100 dark:divide-gray-700">
                              <div className="py-1">Reg: {student.registration_number || 'N/A'}</div>
                              <div className="py-1">Dept: {student.department || 'N/A'}</div>
                              <div className="py-1">Year: {student.academic_year || 'N/A'}</div>
                              <div className="py-1">Room: {student.room_number || 'N/A'}</div>
                              <div className="py-1">Joined: {formatDate(student.created_at)}</div>
                              <div className="py-2 flex space-x-2">
                                {student.status === 'inactive' && (
                                  <>
                                    <button onClick={() => handleApprove(student.id)} className="px-2 py-1 text-xs rounded bg-emerald-500 text-white">Approve</button>
                                    <button onClick={() => handleReject(student.id)} className="px-2 py-1 text-xs rounded bg-red-500 text-white">Reject</button>
                                  </>
                                )}
                              <button onClick={() => handleEdit(student.id)} className="px-2 py-1 text-xs rounded bg-blue-500 text-white">Edit</button>
                              <button onClick={() => handlePreview(student)} className="px-2 py-1 text-xs rounded bg-purple-500 text-white">Preview</button>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No students found matching your criteria
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Page {currentPage} of {totalPages}
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
      )}

      {/* Student Preview Modal */}
      <StudentPreviewModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={closeModal}
        isDarkMode={isDarkMode}
      />
      </div>
    </>
  );
};

export default StudentTable;