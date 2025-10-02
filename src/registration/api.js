import axios from 'axios';

const API_BASE_URL = 'https://finalbackend-mauve.vercel.app';

export const sendOTP = async (email) => {
  if (!email) {
    return { success: false, error: 'Email is required' };
  }
  try {
    // First call emailpush to initialize or check email status
    const emailPushResponse = await axios.post(`${API_BASE_URL}/emailpush`, { email });
    const emailPushData = emailPushResponse.data;

    if (!emailPushData.success) {
      console.error('Email push failed:', emailPushData);
      return { success: false, message: emailPushData.message || emailPushData.error || 'Email push failed' };
    }

    // Then call sendcode to send the verification code
    const sendCodeResponse = await axios.post(`${API_BASE_URL}/sendcode`, { email });
    const sendCodeData = sendCodeResponse.data;

    if (!sendCodeData.success) {
      console.error('Send code failed:', sendCodeData);
      return { success: false, message: sendCodeData.message || 'Failed to send verification code' };
    }

    return {
      success: true,
      message: emailPushData.message || 'Verification code sent to email',
      data: emailPushData.data || { email },
      expiringtime: sendCodeData.expiringtime || null,
    };
  } catch (error) {
    console.error('Error in sendOTP:', error.response?.data || error.message || error);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to send OTP' };
  }
};

export const verifyOTP = async (email, code) => {
  if (!email || !code) {
    return { success: false, message: 'Email and code are required' };
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/emailverify`, { email, code });
    return {
      success: response.data.success,
      message: response.data.message || 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error verifying OTP',
    };
  }
};

export const registerUser = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetchdepartments`);
    if (response.data.success && Array.isArray(response.data.result)) {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch departments');
  }
};

export const addDepartment = async (departmentName) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/adddepartments`,
      { department: departmentName, token },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      }
    );
    // Update token if refreshed
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add department');
  }
};

export const editDepartment = async (oldName, newName) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/editdepartment`,
      { oldDepartment: oldName, newDepartment: newName, token },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      }
    );
    // Update token if refreshed
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to edit department');
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/deletedepartment`,
      { department_id: departmentId, token },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      }
    );
    // Update token if refreshed
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete department');
  }
};

export const promoteStudent = async (email, isDeleteFinalYear) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/promotion`,
      {
        email,
        isdeletefinalyear: isDeleteFinalYear,
        token,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to process promotion');
  }
};

// Approve Student (Admin)
export const approveStudent = async (registrationNumber) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/approve`,
      { registerno: registrationNumber },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve student');
  }
};

// Reject Student (Admin)
export const rejectStudent = async (registrationNumber, reason) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/adminreject`,
      { registerno: registrationNumber, reason },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject student');
  }
};

// Edit Student Details (Admin)
export const editStudentDetails = async (studentId, updatedData) => {
  try {
    const token = localStorage.getItem('accessToken');
    const requestBody = { id: studentId, ...updatedData, token };
    const response = await axios.put(
      `${API_BASE_URL}/editstudentsdetails`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to edit student details');
  }
};
