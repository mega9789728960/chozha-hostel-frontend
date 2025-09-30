import axios from "axios";

const API_BASE = "https://finalbackend-mauve.vercel.app";

// Axios instance with auto token attachment
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // include cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("studentToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== API CALLS ======

// Send OTP
export const sendOTP = async (email) => {
  if (!email) return { success: false, error: "Email is required", status: 400 };

  try {
    const emailPushResponse = await api.post("/emailpush", { email });
    const emailPushData = emailPushResponse.data;

    let result;
    switch (emailPushResponse.status) {
      case 200:
        result = {
          success: true,
          message: emailPushData.message || "Email already exists, pending verification",
          data: emailPushData.data || { email },
        };
        break;
      case 201:
        result = {
          success: true,
          message: emailPushData.message || "Email record initialized, waiting for verification code",
          data: emailPushData.data || { email },
        };
        break;
      default:
        result = { success: false, error: emailPushData.error || "Unexpected error" };
    }

    if (!result.success) return result;

    const sendCodeResponse = await api.post("/sendcode", { email });
    const sendCodeData = sendCodeResponse.data;

    if (sendCodeResponse.status === 200) {
      return {
        ...result,
        sendCodeMessage: sendCodeData.message || "Verification code sent to email",
        expiringtime: sendCodeData.expiringtime || null,
      };
    }

    return { success: false, message: sendCodeData.message || "Unexpected error sending verification code" };
  } catch (error) {
    return { success: false, error: "Error sending OTP: " + (error.response?.data?.message || error.message) };
  }
};

// Verify OTP
export const verifyOTP = async (email, code) => {
  if (!email || !code) return { success: false, message: "Email and code are required" };

  try {
    const response = await api.post("/emailverify", { email, code });
    return { success: true, message: response.data.message || "Email verified successfully" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Error verifying OTP" };
  }
};

// Register User
export const registerUser = async (payload) => {
  try {
    const response = await api.post("/register", payload);
    return {
      success: true,
      message: response.data.message || "User registered successfully",
      user: response.data.user || {},
      token: response.data.token,
    };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Error during registration" };
  }
};

// Fetch Students
export const fetchStudents = async (filters = {}) => {
  try {
    const token = localStorage.getItem("accessToken");
    const requestBody = { token, ...filters }; // Include token in body as per docs

    const response = await api.post("/fetchstudents", requestBody, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    const data = response.data;
    if (data.success && Array.isArray(data.students)) return data.students;
    if (Array.isArray(data)) return data;
    if (data.students) return data.students;
    if (data.studentsdata) return data.studentsdata;

    return [];
  } catch (err) {
    console.error("Error fetching students:", err);
    return [];
  }
};

// Approve Student
export const approveStudent = async (registrationNumber) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(
      "/approve",
      { registerno: registrationNumber, token }, // ✅ token in body
      { headers: { Authorization: `Bearer ${token}` } } // ✅ token in headers
    );

    return response.data;
  } catch (error) {
    console.error("Error approving student:", error);
    throw error;
  }
};

// Add Department
export const addDepartment = async (departmentName) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(
      "/adddepartments",
      { department: departmentName, token }, // ✅ token in body
      { headers: { Authorization: `Bearer ${token}` } } // ✅ token in headers
    );

    return response.data;
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// Fetch Departments
export const fetchDepartments = async () => {
  try {
    const response = await api.get("/fetchdepartments");

    if (response.data.success && Array.isArray(response.data.result)) return response.data.result;
    throw new Error("Invalid response format from API");
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// Edit Department
export const editDepartment = async (oldDepartment, newDepartment) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await api.put(
      "/editdepartment",
      { oldDepartment, newDepartment, token }, // ✅ token in body
      { headers: { Authorization: `Bearer ${token}` } } // ✅ token in headers
    );

    return response.data;
  } catch (error) {
    console.error("Error editing department:", error);
    throw error;
  }
};

// Reject Student
export const rejectStudent = async (registrationNumber, reason) => {
  try {
    const authToken = localStorage.getItem("accessToken");
    if (!authToken) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const response = await api.post(
      "/adminreject",
      { registerno: registrationNumber, reason },
      { headers: { Authorization: `Bearer ${authToken}` }, withCredentials: true }
    );

    // Update token if provided
    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error rejecting student:", error);
    throw error;
  }
};

// Edit Student Details
export const editStudentDetails = async (studentId, studentData) => {
  try {
    const authToken = localStorage.getItem("accessToken");
    if (!authToken) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const response = await api.put(
      "/editstudentsdetails",
      { id: studentId, token: authToken, ...studentData },
      { headers: { Authorization: `Bearer ${authToken}` }, withCredentials: true }
    );

    // Update token if provided
    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error editing student:", error);
    throw error;
  }
};

// Show Attendance Records
export const showAttends = async (filters = {}) => {
  try {
    const authToken = localStorage.getItem("accessToken");
    if (!authToken) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const requestBody = { token: authToken };

    const response = await api.post("/showattends", requestBody, {
      headers: { Authorization: `Bearer ${authToken}` },
      withCredentials: true, // ✅ ensures cookies are included
    });
    console.log(response);

    if (response.status !== 200) {
      throw new Error(response.data.message || `Failed to fetch attendance: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

// Login Admin
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post("/adminslogin", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Login Student
export const loginStudent = async (email, password) => {
  try {
    const response = await api.post("/studentslogin", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark Attendance (Student)
export const markAttendance = async (lat, lng) => {
  try {
    const response = await api.post("/attendance", { lat, lng });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark Absent (Student)
export const markAbsent = async (lat, lng) => {
  try {
    const response = await api.post("/absent", { lat, lng });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change Attendance for Admin
export const changeAttendanceForAdmin = async (studentId, date, status) => {
  try {
    const response = await api.post("/changeattendanceforadmin", { student_id: studentId, date, status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export Attendance
export const exportAttendance = async (from, to, email, delete1 = false) => {
  try {
    const response = await api.post("/exportattendance", { from, to, email, delete1 });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fetch Complaints for Students
export const fetchComplaintsForStudents = async () => {
  try {
    const response = await api.get("/fetchcomplaintsforstudents");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fetch Complaints for Admins
export const fetchComplaintsForAdmins = async () => {
  try {
    const response = await api.get("/fetchcomplaintforadmins");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Register Complaint
export const registerComplaint = async (title, description, category, priority) => {
  try {
    const response = await api.post("/registercomplaint", { title, description, category, priority });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Edit Complaint
export const editComplaint = async (complaintId, title, description, category, priority) => {
  try {
    const response = await api.post("/editcomplaint", { complaint_id: complaintId, title, description, category, priority });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change Complaint Status for Admin
export const changeComplaintStatusForAdmin = async (complaintId, status) => {
  try {
    const response = await api.post("/complaintstatuschangeforadmin", { complaint_id: complaintId, status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Resolve Complaints
export const resolveComplaints = async (complaintId, resolution) => {
  try {
    const response = await api.post("/resolvecomplaints", { complaint_id: complaintId, resolution });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Forgot Password Email Push
export const forgotPasswordEmailPush = async (email) => {
  try {
    const response = await api.post("/forgotpasswordemailpush", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Forgot Password Send Code
export const forgotPasswordSendCode = async (email, token) => {
  try {
    const response = await api.post("/forgotpasswordsendcode", { email, token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify Forgot Password Code
export const verifyForgotPasswordCode = async (email, code, token) => {
  try {
    const response = await api.post("/veriycodeforgot", { email, code, token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change Password
export const changePassword = async (email, newPassword, token) => {
  try {
    const response = await api.post("/changepassword", { email, new_password: newPassword, token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete Department
export const deleteDepartment = async (id) => {
  try {
    const response = await api.post("/deletedepartment", { id });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Promote Student
export const promoteStudent = async (studentId, newYear) => {
  try {
    const response = await api.post("/promotion", { student_id: studentId, new_year: newYear });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Push Announcement
export const pushAnnouncement = async (title, content) => {
  try {
    const response = await api.post("/pushannocement", { title, content });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fetch Announcements for Admin
export const fetchAnnouncementsForAdmin = async () => {
  try {
    const response = await api.get("/fetchannocementforadmin");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Edit Announcement for Admin
export const editAnnouncementForAdmin = async (id, title, content) => {
  try {
    const response = await api.post("/editannouncementforadmin", { id, title, content });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fetch Notifications for Students
export const fetchNotificationsForStudents = async () => {
  try {
    const response = await api.get("/fetchnotificationforstudents");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Dismiss Notification for Student
export const dismissNotificationForStudent = async (notificationId) => {
  try {
    const response = await api.post("/dismissnotificationforstudent", { notification_id: notificationId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
