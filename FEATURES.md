# Jamia Tul Mastwaar - Institute Management System

## Project Overview
A comprehensive web-based management system for Jamia Tul Mastwaar (Makhdoom Pur Sharif, Chakwal), designed to streamline administrative operations, student management, financial tracking, and academic monitoring.

---

## Technology Stack

### Backend
- **Node.js & Express.js** - RESTful API server
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Express-async-handler** - Async error handling

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **TailwindCSS** - Styling framework
- **Heroicons** - Icon library
- **Recharts** - Data visualization
- **jsPDF** - PDF generation
- **Axios** - HTTP client

---

## Core Modules & Features

### 1. Authentication & Authorization Module

#### Features
- **User Login System**
  - CNIC-based authentication
  - Role-based access control (RBAC)
  - JWT token generation and validation
  - Persistent sessions via localStorage
  - Secure password handling

#### User Roles
- **Admin** - Full system access
- **Teacher** - Academic and student management
- **Student** - Personal records and academic data
- **Accountant** - Financial management
- **Cook/Cleaner** - Staff portal access

#### Access Control
- Route-level protection
- Component-level authorization
- Role-based feature visibility
- Unauthorized access handling

---

### 2. Student Management Module

#### Student Registration & Profile
- **Personal Information**
  - Name, Father's Name, CNIC, Date of Birth
  - Gender, Address, Email
  - Guardian & Additional Contact Numbers
  - Admission Date, Roll Number
  - Profile Picture Upload

- **Academic Information**
  - Class Type (Class, BS, Almiya, Hifaz)
  - Class Number (for regular classes)
  - Degree Name & Semester (for BS students)
  - Major Subject
  - Current Juz & Surah (for Hifaz students)

- **Financial Information**
  - Fee Per Month
  - Fee Status (Paid, Unpaid, Partial Paid)
  - Deposited Amount
  - Other Dues
  - Admission Fee Status

- **Status Management**
  - Student Status (Regular, Withdrawn, Expelled, Graduated)
  - Reason for status change
  - Soft delete functionality

- **Document Management**
  - CNIC Front & Back
  - B-Form
  - Character Certificate
  - Previous Class Result
  - Class 10 & 12 Results

#### Student Operations
- Add new students
- Edit student information
- View student profiles
- Search & filter students
- Bulk operations support
- Export student data

---

### 3. Staff Management Module

#### Staff Profile
- **Personal Details**
  - Name, CNIC, Employee ID
  - Contact, Email, Address
  - Date of Birth, Gender
  - Joining Date
  - Profile Picture

- **Professional Details**
  - Staff Type (admin, teacher, accountant, cook, cleaner)
  - Designation
  - Department
  - Salary
  - Contract Type (Permanent, Contract, Part-time)

- **Class Assignments**
  - Assigned Classes (Class, BS, Almiya, Hifaz)
  - Class Numbers
  - Degree Names & Semesters
  - Subject Assignments

- **Document Management**
  - CNIC Documents
  - Educational Certificates
  - Experience Certificates

#### Staff Operations
- Add/Edit staff members
- View staff profiles
- Assign classes to teachers
- Track staff assignments
- Staff status management

---

### 4. Fee Management Module

#### Fee Collection
- **Fee Records**
  - Student selection
  - Monthly fee tracking
  - Multiple payment methods (Cash, Bank Transfer, Deposited Cash, Online)
  - Admission fee handling
  - Partial payment support
  - Due amount calculation

- **Payment Processing**
  - Paid By & Received By tracking
  - Payment date recording
  - Bill screenshot upload
  - Automatic due calculation
  - Deposited amount utilization

#### Fee Receipts
- **PDF Receipt Generation**
  - Institute branding
  - Student details
  - Payment information
  - Deposited amount display
  - Other dues display
  - Computer-generated notice

- **Print Functionality**
  - 2x2 receipt layout (4 copies)
  - Professional formatting
  - Logo and branding
  - Print-optimized design

#### Fee Reports
- Monthly collection summaries
- Payment method breakdown
- Admission fee tracking
- Outstanding dues tracking
- Year/Month filtering
- Visual charts and graphs

---

### 5. Attendance Management Module

#### Student Attendance
- **Attendance Marking**
  - Date-based recording
  - Class/Degree-based filtering
  - Status options (Present, Absent, Leave, Holiday)
  - Bulk marking support
  - Teacher authorization checks

- **Attendance Tracking**
  - Daily attendance records
  - Monthly summaries
  - Attendance percentage
  - Leave integration
  - Historical records

#### Staff Attendance
- Daily attendance marking
- Status tracking
- Leave management
- Personal attendance view
- Admin oversight

#### Attendance Reports
- **Student Reports**
  - Type filtering (Student/Staff)
  - Year/Month filtering
  - Daily summaries
  - Monthly trends
  - Attendance charts

- **Analytics**
  - Present/Absent/Leave counts
  - Attendance rate calculations
  - Trend analysis
  - Visual representations

---

### 6. Leave Management Module

#### Student Leave Requests
- **Leave Application**
  - Start & End dates
  - Leave reason
  - Destination address
  - Picker details (Name, Relation, Phone, CNIC)
  - Leave time & Expected return time
  - Class Incharge approval

- **Leave Processing**
  - Auto-approval for Admin/Teacher submissions
  - Manual approval workflow
  - Status tracking (Pending, Approved, Rejected)
  - Return confirmation
  - Remarks system

#### Staff Leave Requests
- Similar workflow as student leaves
- Staff-specific fields
- Admin approval required
- Leave history tracking

#### Leave Reports
- Pending leave requests
- Approved/Rejected history
- Search & filter options
- Date range filtering
- Status-based filtering

---

### 7. Marks & Academic Module

#### Marks Management
- **Marks Entry**
  - Subject-wise marks
  - Exam type selection
  - Maximum marks configuration
  - Obtained marks entry
  - Automatic percentage calculation

- **Student Marks View**
  - Subject-wise performance
  - Exam history
  - Grade calculations
  - Performance trends

#### Teacher Features
- **My Students**
  - View assigned students
  - Class-wise filtering
  - Quick access to student profiles

- **My Subjects**
  - Assigned subject list
  - Class-wise subjects
  - Marks entry access

#### Marks Reports
- Class-wise reports
- Student performance analysis
- Subject-wise analytics
- Exam comparisons

---

### 8. Salary Management Module

#### Salary Processing
- **Salary Records**
  - Staff selection
  - Monthly salary tracking
  - Salary per month (from staff profile)
  - Paid amount
  - Payment method
  - Bonus & Overtime
  - Advanced salary tracking
  - Deduction calculation

- **Salary Status**
  - Paid, Unpaid, Partial Paid
  - Auto-status calculation
  - Payment history

#### Salary Reports
- Monthly salary summaries
- Role-wise salary distribution
- Bonus & Overtime tracking
- Payment method analysis
- Year/Month filtering

#### Staff Salary View
- Personal salary history
- Monthly breakdowns
- Payment details
- Download receipts

---

### 9. Billing & Expense Management

#### Bill Management
- **Bill Recording**
  - Title & Category
  - Amount tracking
  - Bill date
  - Payment date (for paid bills)
  - Payment method
  - Paid to information
  - Remarks
  - Attachment upload

- **Bill Categories**
  - Kitchen expenses
  - Utilities
  - Repairs
  - Stationery
  - Other categories

- **Bill Status**
  - Paid
  - Unpaid
  - Pending

#### Expense Reports
- Monthly expense summaries
- Category-wise breakdown
- Payment method analysis
- Year/Month filtering
- Visual charts

#### Bill Receipts
- PDF download
- Print functionality
- Detailed bill summary
- Attachment viewing

---

### 10. Donation Management Module

#### Donation Recording
- **Donation Details**
  - Donor name
  - Organization name
  - Contact number & Email
  - CNIC
  - Donation amount
  - Donation purpose
  - Donation date
  - Payment method
  - Receipt upload

#### Donation Reports
- Monthly donation summaries
- Purpose-wise analysis
- Donor tracking
- Payment method breakdown
- Year/Month filtering

---

### 11. Reports & Analytics Module

#### Financial Reports
- **Fee Reports**
  - Total collected vs dues
  - Monthly trends
  - Payment method distribution
  - Admission fee tracking
  - Year/Month filtering

- **Salary Reports**
  - Total salary paid
  - Bonus & Overtime
  - Role-wise distribution
  - Monthly trends

- **Billing Reports**
  - Total expenses
  - Category breakdown
  - Monthly trends

- **Donation Reports**
  - Total donations
  - Purpose-wise analysis
  - Monthly trends

#### Attendance Reports
- Student attendance analytics
- Staff attendance analytics
- Monthly summaries
- Daily summaries (last 7 days)
- Type/Year/Month filtering

#### Visual Analytics
- **Charts & Graphs**
  - Line charts for trends
  - Bar charts for comparisons
  - Pie charts for distributions
  - Recharts integration

---

### 12. Dashboard Modules

#### Admin Dashboard
- **KPI Cards**
  - Total Students
  - Total Staff
  - Fees Collected (Current Month)
  - Outstanding Dues (Current Month)
  - Attendance Today (%)
  - Pending Leave Requests

- **Analytics**
  - Fee Trend Chart (Yearly)
  - Payment Method Distribution
  - Recent Pending Leaves
  - Quick Action Links

#### Teacher Dashboard
- Assigned classes overview
- Student count
- Quick access to attendance
- My subjects
- Pending tasks

#### Student Dashboard
- Personal information
- Fee status
- Attendance summary
- Marks view
- Leave requests

#### Accountant Dashboard
- Financial summaries
- Quick access to financial modules
- Pending transactions
- Reports access

#### Staff Dashboard
- Personal information
- Attendance records
- Salary history
- Leave requests

---

### 13. Academic Structure Module

#### Class Management
- **Class Configuration**
  - Class type setup (Class, BS, Almiya, Hifaz)
  - Class number definition
  - Degree programs
  - Semester structure

#### Subject Management
- Subject creation
- Subject assignment to classes
- Teacher-subject mapping

---

### 14. User Management Module

#### User Accounts
- **Account Creation**
  - CNIC-based usernames
  - Password generation
  - Role assignment
  - Profile linking (Student/Staff)

- **Access Control**
  - Role-based permissions
  - Feature access management
  - Route protection

#### User Operations
- Create new users
- Edit user roles
- Reset passwords
- Disable/Enable accounts
- View user activity

---

### 15. Theme & Customization

#### Theme System
- **Multiple Themes**
  - Green (Default)
  - General Dark
  - Deep Blue
  - Royal Purple
  - Sunset Orange
  - Black & Teal
  - Vibrant Magenta

- **Theme Features**
  - Dynamic color schemes
  - Sidebar customization
  - Text color adaptation
  - Background variations
  - Persistent theme storage

---

### 16. UI/UX Features

#### Responsive Design
- Mobile-friendly layouts
- Tablet optimization
- Desktop full experience
- Hamburger menu for mobile
- Adaptive components

#### Navigation
- Sidebar navigation
- Breadcrumb support
- Quick action buttons
- Search functionality
- Dropdown menus

#### Forms & Validation
- Client-side validation
- Server-side validation
- Error messaging
- Success notifications
- Auto-save features

#### Data Tables
- Sortable columns
- Search & filter
- Pagination
- Export functionality
- Bulk actions

#### Modals & Dialogs
- Confirmation dialogs
- Form modals
- View modals
- Delete confirmations
- Custom modals

---

### 17. File Management

#### Upload Features
- Profile pictures (Students & Staff)
- Document uploads (CNIC, Certificates)
- Bill screenshots
- Donation receipts
- Attachment management

#### File Operations
- Upload validation
- File size limits
- Type restrictions
- Secure storage
- URL generation
- File deletion

---

### 18. Security Features

#### Authentication Security
- JWT tokens
- Token expiration
- Secure password storage
- CNIC validation
- Role verification

#### Data Protection
- Soft delete functionality
- Access control lists
- Input sanitization
- XSS prevention
- CORS configuration

---

### 19. Utility Features

#### Date & Time
- Date utilities
- Month range calculations
- Year generators
- Date formatting
- Timezone handling

#### Formatting
- Currency formatting (PKR)
- Number formatting
- Date formatting
- Text truncation
- Case conversion

#### Helpers
- Validation helpers
- Calculation utilities
- PDF generation
- Receipt formatting
- Data transformation

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id` - Get student by ID

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `GET /api/staff/:id` - Get staff by ID

### Fees
- `GET /api/fees` - Get all fee records
- `POST /api/fees` - Create fee record
- `PUT /api/fees/:id` - Update fee record
- `DELETE /api/fees/:id` - Delete fee record
- `GET /api/fees/student/:studentId` - Get fees by student
- `GET /api/fees/reports` - Get fee reports

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/student/:id` - Get student attendance
- `GET /api/attendance/staff/:id` - Get staff attendance
- `GET /api/attendance/reports` - Get attendance reports
- `GET /api/attendance/:date` - Get attendance by date

### Leave Requests (Student)
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id` - Update leave request
- `DELETE /api/leave/:id` - Delete leave request
- `PUT /api/leave/:id/status` - Update leave status

### Staff Leave Requests
- `GET /api/staff-leave` - Get staff leave requests
- `POST /api/staff-leave` - Create staff leave request
- `PUT /api/staff-leave/:id` - Update staff leave request
- `DELETE /api/staff-leave/:id` - Delete staff leave request
- `PUT /api/staff-leave/:id/status` - Update staff leave status

### Marks
- `GET /api/marks` - Get marks records
- `POST /api/marks` - Create marks record
- `PUT /api/marks/:id` - Update marks record
- `DELETE /api/marks/:id` - Delete marks record
- `GET /api/marks/student/:studentId` - Get marks by student

### Salary
- `GET /api/salary/all` - Get all salary records
- `POST /api/salary` - Create/Update salary record
- `GET /api/salary/my-salaries` - Get my salaries
- `GET /api/salary/:id` - Get salary by ID
- `DELETE /api/salary/:id` - Delete salary record
- `GET /api/salary/reports` - Get salary reports

### Billing
- `GET /api/billing` - Get all bills
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id` - Update bill
- `DELETE /api/billing/:id` - Delete bill
- `GET /api/billing/:id` - Get bill by ID
- `GET /api/billing/reports` - Get billing reports
- `GET /api/billing/:id/receipt` - Download bill receipt

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/:id` - Get donation by ID
- `GET /api/donations/reports` - Get donation reports
- `GET /api/donations/:id/receipt` - Download donation receipt

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/password` - Change password

### Academic Structure
- `GET /api/academic-structure` - Get academic structure
- `POST /api/academic-structure` - Create/Update structure

---

## Key Workflows

### Student Admission Workflow
1. Create student record with personal info
2. Upload required documents
3. Set fee structure
4. Generate user account (optional)
5. Assign to class/program
6. Record admission fee payment

### Fee Collection Workflow
1. Select student
2. System auto-fills fee amount
3. Enter payment details
4. Select payment method
5. Upload bill screenshot (optional)
6. Calculate due amount
7. Generate receipt
8. Update student financial status

### Attendance Workflow
1. Select date and class/program
2. Load student/staff list
3. Mark attendance status
4. Add remarks if needed
5. Submit attendance
6. Generate reports

### Leave Request Workflow
1. Student/Staff submits leave request
2. Admin/Teacher reviews request
3. Approve or reject with remarks
4. Notify requester
5. Track return status
6. Update attendance records

### Marks Entry Workflow
1. Teacher selects subject
2. Choose exam type
3. Select students
4. Enter marks
5. Calculate percentages
6. Submit marks
7. Students can view results

---

## Future Enhancement Opportunities

1. **SMS/Email Notifications**
   - Fee reminders
   - Leave approval notifications
   - Attendance alerts
   - Exam schedules

2. **Mobile Application**
   - Native iOS/Android apps
   - Push notifications
   - Offline support

3. **Advanced Analytics**
   - Predictive analytics
   - Student performance forecasting
   - Financial forecasting
   - Attendance prediction

4. **Parent Portal**
   - View student progress
   - Fee payment
   - Communication with teachers
   - Attendance monitoring

5. **Exam Management**
   - Exam scheduling
   - Question bank
   - Online exams
   - Result processing

6. **Library Management**
   - Book inventory
   - Issue/Return tracking
   - Fine management

7. **Transport Management**
   - Route planning
   - Vehicle tracking
   - Fee collection

8. **Hostel Management**
   - Room allocation
   - Mess management
   - Attendance tracking

---

## Technical Features

### Performance
- Lazy loading
- Code splitting
- Image optimization
- Caching strategies
- Database indexing

### Error Handling
- Global error boundary
- API error handling
- Validation errors
- User-friendly messages
- Logging system

### Data Management
- Real-time updates
- Optimistic UI updates
- Data caching
- State management
- Local storage

### Code Quality
- Modular architecture
- Reusable components
- Clean code practices
- Comment documentation
- Consistent naming

---

## Deployment Considerations

### Backend
- Environment variables
- MongoDB connection
- CORS configuration
- Upload directory structure
- Port configuration

### Frontend
- Build optimization
- Asset management
- API base URL configuration
- Theme persistence
- Browser compatibility

### Security
- Environment-based configs
- Secure file uploads
- Rate limiting (future)
- Input validation
- SQL injection prevention

---

## Documentation & Support

### Code Documentation
- Inline comments
- Function descriptions
- API documentation
- Component documentation

### User Guides (Future)
- Admin manual
- Teacher guide
- Student handbook
- Accountant guide

---

**Last Updated:** December 21, 2025  
**Version:** 1.0  
**Institute:** Jamia Tul Mastwaar, Makhdoom Pur Sharif, Chakwal
