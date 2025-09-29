# API Integration TODO

## 1. Update src/registration/api.js
- [x] Expand axios instance to auto-attach Authorization header from localStorage (accessToken or studentToken)
- [x] Add loginAdmin and loginStudent functions
- [x] Add attendance functions: markAttendance, markAbsent, changeAttendanceForAdmin, exportAttendance
- [x] Add complaints functions: fetchComplaintsForStudents, fetchComplaintsForAdmins, registerComplaint, editComplaint, changeComplaintStatusForAdmin, resolveComplaints
- [x] Add announcements functions: pushAnnouncement, fetchAnnouncementsForAdmin, editAnnouncementForAdmin
- [x] Add notifications functions: fetchNotificationsForStudents, dismissNotificationForStudent
- [x] Add promotion function: promoteStudent
- [x] Add department functions: deleteDepartment
- [x] Migrate forgot password functions from forgotPasswordApi.js to api.js using axios
- [x] Update existing functions to match docs (e.g., GET for fetchStudents, fetchDepartments)

## 2. Migrate Auth and Password Reset
- [x] Update src/Login.jsx to use centralized login functions
- [x] Update src/registration/ForgotPasswordModal.jsx to use centralized forgot password functions
- [x] Delete src/registration/forgotPasswordApi.js after migration

## 3. Update Attendance Modules
- [x] Update src/admin Dashboard/Attendance/Attendance.jsx: Add changeAttendanceForAdmin and exportAttendance integrations
- [x] Update src/student Dashboard/Attendance/Attendance.jsx: Use markAttendance/markAbsent from api.js, integrate showAttends for history

## 4. Update Complaints Modules
- [x] Update src/student Dashboard/Complaints/Complaints.jsx: Use centralized fetch/register/edit functions
- [x] Update src/admin Dashboard/Complaints/Complaints.jsx and ComplaintList.jsx: Add fetch/change/resolve functions, real data
- [x] Update src/student Dashboard/Complaints/ComplaintModal.jsx: Use centralized registerComplaint function
- [x] Update src/admin Dashboard/Students/Students.jsx: Use centralized student management functions

## 5. Implement Missing Features
- [x] Update src/admin Dashboard/Messaging/AnnouncementForm.jsx: Integrate push/fetch/edit announcements
- [ ] Update src/admin Dashboard/Messaging/Messaging.jsx: Integrate push/fetch/edit announcements
- [x] Update src/student Dashboard/Notifications/Notifications.jsx: Integrate fetch/dismiss notifications
- [x] Update src/admin Dashboard/Departments/Departments.jsx: Add deleteDepartment
- [x] Update src/admin Dashboard/Promotion.jsx: Integrate promotion API
- [x] Ensure src/registration/Register.jsx uses fetchDepartments properly

## 6. Test and Fix
- [ ] Run `npm run dev` and test key flows: login, attendance, complaints, announcements, notifications
- [ ] Use browser_action if needed to verify UI/API interactions
- [ ] Fix any errors (e.g., token issues, response mismatches)
