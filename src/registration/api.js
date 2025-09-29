import axios from 'axios';

const API_BASE_URL = 'https://finalbackend-mauve.vercel.app';

export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sendotp`, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send OTP');
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verifyotp`, { email, otp });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to verify OTP');
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
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_BASE_URL}/fetchdepartments`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
    });
    return response.data.departments || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch departments');
  }
};

export const addDepartment = async (departmentName) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/adddepartment`,
      { department: departmentName },
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
    throw new Error(error.response?.data?.message || 'Failed to add department');
  }
};

export const editDepartment = async (oldName, newName) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/editdepartment`,
      { old_department: oldName, new_department: newName },
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
    throw new Error(error.response?.data?.message || 'Failed to edit department');
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_BASE_URL}/deletedepartment`,
      { department_id: departmentId },
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
