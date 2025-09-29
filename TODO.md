# TODO: Update Backend APIs in Axios

## Admin Dashboard APIs
- [x] Update AnnouncementForm.jsx: Implement push announcement (POST /pushannocement), fetch announcements (POST /fetchannocementforadmin with optional filters), edit announcement (POST /editannouncementforadmin), integrate send notifications to students (POST /sendnotificationforstudents after push). Added loading states, success messages, and refactored fetchAnnouncements for reusability.
- [x] Update Departments.jsx: Add delete department functionality (POST /deletedepartment).
- [x] Create Promotion.jsx: Implement promotion API (POST /promotion) with form for email and isdeletefinalyear.

## Student Dashboard APIs
- [x] Update Notifications.jsx: Implement fetch notifications (POST /fetchnotificationforstudents), dismiss notification (POST /dismissnotificationforstudent).

## Testing
- [ ] Run `npm run dev` to test implementations.
- [ ] Verify API responses match documentation.
