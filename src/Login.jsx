import React from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, loginStudent } from "./service/api";
import ForgotPasswordModal from "./registration/ForgotPasswordModal";

function Login({ onClose, onOpenRegister, loginType }) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { email, password } = formData;
      let data;

      if (loginType === "admin") {
        data = await loginAdmin(email, password);
      } else {
        data = await loginStudent(email, password);
      }

      if (!data.success) {
        throw new Error(data.message || "Invalid login credentials");
      }

      // Check if the user's role matches the login type they selected
      if (data.role && data.role !== loginType) {
        throw new Error(`You are not authorized to access the ${loginType} portal. Please use the ${data.role} login.`);
      }

      // For student logins: ensure the account is active/approved before proceeding.
      // Different backends use different field names/types for status, so check commonly used ones.
      const userData = data.data || {};
      const rawStatus = userData.status ?? userData.isActive ?? userData.active ?? userData.accountStatus ?? userData.account_status ?? userData.approved ?? userData.approvalStatus;
      const normalizeIsActive = (val) => {
        if (val === undefined || val === null) return true; // assume active if backend didn't provide a status
        if (typeof val === 'boolean') return Boolean(val);
        if (typeof val === 'number') return val === 1;
        const s = String(val).toLowerCase().trim();
        return ['active', 'approved', 'true', '1', 'yes'].includes(s);
      };

      if (loginType === 'student' && !normalizeIsActive(rawStatus)) {
        // Don't proceed with storing tokens or navigation.
        setIsLoading(false);
        setError('Your account is not active yet. Please wait until an administrator approves your account.');
        return;
      }

      console.log("Login successful!");
      console.log("User Role:", data.role);
      console.log("Access Token:", data.token);
      console.log("User Data:", data.data);
      console.log("Session Info:", {
        expires_at: data.session?.expires_at,
        user_id: data.session?.user?.id
      });

      // Determine user role
      const userRole = data.role || loginType;

      // Store authentication data - standardize to accessToken for both
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        // Set cookie for backend authentication
        document.cookie = `token=${data.token}; path=/; max-age=86400; secure; samesite=lax`;
      }
      if (data.data) {
        localStorage.setItem("userData", JSON.stringify(data.data));
        if (data.data.id) {
          localStorage.setItem("studentId", data.data.id);
        }
      }
      if (data.session) {
        localStorage.setItem("sessionData", JSON.stringify(data.session));
      }
      if (data.role) {
        localStorage.setItem("userRole", data.role);
      }

      // Redirect based on user role from API response
      if (userRole === "admin") {
        navigate("/admin-dashboard", { state: { data } });
      } else {
        // Pass the student data to the student dashboard profile
        navigate("/dashboard", { state: { studentData: data.data || data } });
      }

    } catch (err) {
      console.error("Login error:", err);

      // Friendly error mapping for axios responses
      let userMessage = "Something went wrong. Please try again.";

      // If this is an axios error with a response from server
      if (err && err.response) {
        const status = err.response.status;
        const serverMsg = err.response.data?.message || err.response.data?.error || null;

        if (serverMsg) {
          const s = String(serverMsg).toLowerCase();
          if (s.includes('password') || s.includes('invalid') || status === 401) {
            userMessage = 'Incorrect email or password.';
          } else if (s.includes('inactive') || s.includes('not active') || status === 403) {
            userMessage = 'Your account is not active yet. Please wait until an administrator approves your account.';
          } else if (status === 404 || s.includes('not found') || s.includes('no user')) {
            userMessage = 'No account found with this email.';
          } else {
            // Use server message if it's descriptive enough
            userMessage = serverMsg;
          }
        } else {
          // Fallback mapping based on status code
          if (status === 401) userMessage = 'Incorrect email or password.';
          else if (status === 403) userMessage = 'Your account is not active yet. Please wait until an administrator approves your account.';
          else if (status === 404) userMessage = 'No account found with this email.';
          else if (status >= 500) userMessage = 'Server error. Please try again later.';
          else userMessage = `Request failed with status code ${status}`;
        }

      } else if (err && err.request) {
        // Request was made but no response (network error)
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err && err.message) {
        userMessage = err.message;
      }

      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="loginModal"
      className="fixed inset-0 bg-black bg-opacity-60 login-modal z-50 flex items-center justify-center p-4"
    >
      <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all professional-shadow relative">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-xl sm:text-2xl">
                {loginType === "admin" ? "⚙️" : "🎓"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {loginType === "student" ? "Student Portal" : loginType === "admin" ? "Admin Portal" : "Login"}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Secure access to your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0 text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0 text-sm sm:text-base"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900 bg-opacity-20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <label className="flex items-center text-slate-300">
                  <input
                    type="checkbox"
                    className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors text-center sm:text-right"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  isLoading
                    ? 'bg-blue-600 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-400">
              {loginType === "admin" ? "New admin?" : "New student?"}{" "}
              <button
                onClick={onOpenRegister}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline"
              >
                Register here
              </button>
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Need assistance?{" "}
              <button
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onLogin={() => {
          setShowForgotPassword(false);
          // Optionally refresh the login form or redirect
        }}
      />
    </div>
  );
}

export default Login;
