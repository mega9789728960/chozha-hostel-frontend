import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Common/Card';
import Button from '../Common/Button';
import StudentTable from './StudentTable';
import EditStudentModal from './EditStudentModal';
import { fetchStudents as fetchStudentsAPI, approveStudent, rejectStudent, editStudentDetails } from '../../service/api';

const Students = ({ isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);
  const [studentToReject, setStudentToReject] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchStudentsAPI();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message);
      // Fallback to mock data if API fails
      setStudents([
        {
          id: 14,
          name: 'mega',
          email: 'benmega500@gmail.com',
          room_number: '130',
          status: 'inactive',
          registration_number: 'REG030',
          department: 'Computer Science',
          academic_year: '2023-24',
          created_at: '2024-01-15'
        },
        {
          id: 15,
          name: 'SARAN S',
          email: '9788saran@gmail.com',
          room_number: '410',
          status: 'pending',
          registration_number: '822722104045',
          department: 'Electrical Engineering',
          academic_year: '2023-24',
          created_at: '2024-01-16'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    console.log('Add student clicked');
  };

  const handleExport = () => {
    console.log('Export students clicked');
  };

  const handleApproveClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToApprove(student);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmApprove = async () => {
    if (!studentToApprove) return;

    const studentId = studentToApprove.id;
    setShowConfirmDialog(false);

    // Show full screen loading overlay
    setLoading(true);

    try {
      console.log('Approving student:', studentToApprove.name, 'with registration number:', studentToApprove.registration_number);

      const responseData = await approveStudent(studentToApprove.registration_number);
      console.log('Approval response:', responseData);

      // Update local state with response data
      setStudents(students.map(student => {
        if (student.id === studentId) {
          // If response contains student details, use them; otherwise just update status
          if (responseData && responseData.student) {
            return {
              ...student,
              ...responseData.student,
              status: 'active' // Ensure status is set to active
            };
          } else {
            // Fallback to just updating status if no student details in response
            return { ...student, status: 'active' };
          }
        }
        return student;
      }));

      // Use response message if available, otherwise default message
      const successMsg = responseData && responseData.message
        ? responseData.message
        : `Student ${studentToApprove.name} has been approved successfully!`;

      setSuccessMessage(successMsg);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error approving student:', err);
      alert(`Failed to approve student: ${err.message}`);
    } finally {
      setLoading(false);
      setStudentToApprove(null);
    }
  };

  const handleCancelApprove = () => {
    setShowConfirmDialog(false);
    setStudentToApprove(null);
  };

  const handleRejectClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToReject(student);
      setRejectionReason('');
      setShowRejectDialog(true);
    }
  };

  const handleConfirmReject = async () => {
    if (!studentToReject) return;

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    const studentId = studentToReject.id;
    setShowRejectDialog(false);

    // Show full screen loading overlay
    setLoading(true);

    try {
      console.log('Rejecting student:', studentToReject.name, 'with registration number:', studentToReject.registration_number, 'reason:', rejectionReason.trim());

      const responseData = await rejectStudent(studentToReject.registration_number, rejectionReason.trim());
      console.log('Rejection response:', responseData);

      // Update local state with response data
      setStudents(students.map(student => {
        if (student.id === studentId) {
          // If response contains student details, use them; otherwise just update status
          if (responseData && responseData.student) {
            return {
              ...student,
              ...responseData.student,
              status: 'not approved' // Set status to "not approved" as per API documentation
            };
          } else {
            // Fallback to just updating status if no student details in response
            return { ...student, status: 'not approved' };
          }
        }
        return student;
      }));

      // Use response message if available, but override if it's incorrect for reject operation
      let successMsg;
      if (responseData && responseData.message) {
        // If API returns "approved" message for reject operation, override it
        if (responseData.message.toLowerCase().includes('approved') && responseData.message.toLowerCase().includes('successfully')) {
          successMsg = `Student ${studentToReject.name} has been rejected successfully!`;
        } else {
          successMsg = responseData.message;
        }
      } else {
        successMsg = `Student ${studentToReject.name} has been rejected successfully!`;
      }

      setSuccessMessage(successMsg);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error rejecting student:', err);
      alert(`Failed to reject student: ${err.message}`);
    } finally {
      setLoading(false);
      setStudentToReject(null);
    }
  };

  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setStudentToReject(null);
    setRejectionReason('');
  };

  const handleRejectStudent = async (studentId) => {
    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`https://finalbackend-mauve.vercel.app/admin/students/${studentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject student');
      }

      // Update local state
      setStudents(students.map(student =>
        student.id === studentId
          ? { ...student, status: 'rejected' }
          : student
      ));

      alert('Student rejected successfully!');
    } catch (err) {
      console.error('Error rejecting student:', err);
      alert('Failed to reject student');
    }
  };

  const handleEdit = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToEdit(student);
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (studentId, updatedStudentData) => {
    if (!studentToEdit) return;

    setLoading(true);

    try {
      console.log('Editing student:', studentToEdit.name, 'with data:', updatedStudentData);

      const responseData = await editStudentDetails(studentId, updatedStudentData);
      console.log('Edit response:', responseData);

      // Update local state with response data
      setStudents(students.map(student => {
        if (student.id === studentId) {
          // If response contains student details, use them; otherwise use the updated data
          if (responseData && responseData.student) {
            return { ...student, ...responseData.student };
          } else {
            return { ...student, ...updatedStudentData };
          }
        }
        return student;
      }));

      // Use response message if available, otherwise default message
      const successMsg = responseData && responseData.message
        ? responseData.message
        : `Student ${studentToEdit.name} has been updated successfully!`;

      setSuccessMessage(successMsg);
      setShowSuccessModal(true);
      setShowEditModal(false);
      setStudentToEdit(null);
    } catch (err) {
      console.error('Error editing student:', err);
      alert(`Failed to update student: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setStudentToEdit(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Student Management
        </h2>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline" isDarkMode={isDarkMode}>
            Export
          </Button>
          <Button onClick={handleAddStudent} variant="primary" isDarkMode={isDarkMode}>
            Add Student
          </Button>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
          <p>Error: {error}</p>
          <Button 
            onClick={fetchStudents} 
            variant="outline" 
            isDarkMode={isDarkMode}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <Card isDarkMode={isDarkMode}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold">All Students ({students.length})</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage student information and approval status
              </p>
            </div>
            <div className="flex items-center space-x-2 min-w-0">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 min-w-0 px-3 py-2 border rounded-md text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-auto px-3 py-2 border rounded-md text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Students</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="not approved">Not Approved</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentTable
            isDarkMode={isDarkMode}
            searchTerm={searchTerm}
            filter={filter}
            students={students}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onEdit={handleEdit}
            onRefresh={fetchStudents}
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && studentToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Approve Student
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to approve <span className="font-semibold">{studentToApprove.name}</span>?
                <br />
                Registration: <span className="font-mono">{studentToApprove.registration_number}</span>
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleCancelApprove}
                  variant="outline"
                  isDarkMode={isDarkMode}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmApprove}
                  variant="primary"
                  isDarkMode={isDarkMode}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {showRejectDialog && studentToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl shadow-xl max-w-lg w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Reject Student
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to reject <span className="font-semibold">{studentToReject.name}</span>?
                <br />
                Registration: <span className="font-mono">{studentToReject.registration_number}</span>
              </p>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleCancelReject}
                  variant="outline"
                  isDarkMode={isDarkMode}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReject}
                  variant="danger"
                  isDarkMode={isDarkMode}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Success!
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {successMessage}
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="primary"
                isDarkMode={isDarkMode}
                className="w-full"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && studentToEdit && (
        <EditStudentModal
          isDarkMode={isDarkMode}
          student={studentToEdit}
          onSave={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};

export default Students;