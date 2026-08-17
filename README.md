Smart Attendance System Using Face Recognition

A web-based employee attendance management system that uses real-time face recognition to automate attendance marking, employee management, and attendance reporting.

📌 Project Overview

The Smart Attendance System is designed to reduce manual attendance work by using a camera-based face recognition system.

The application allows an administrator to:

- Register and manage employees
- Register employee face images
- Detect and recognize faces through a webcam
- Automatically mark employee check-in
- Automatically mark employee check-out
- Identify late arrivals
- Track attendance records
- View attendance statistics
- Generate attendance reports
- Configure office attendance timings
- Manage administrator authentication

The system is designed for organizations where attendance needs to be recorded quickly and digitally.

---

✨ Key Features

👤 Employee Management

- Add new employees
- Store employee information
- Manage employee status
- View employee records
- Register employee face data

📷 Face Recognition

- Real-time webcam-based face detection
- Face recognition using stored employee face data
- Multiple faces can be detected in the camera frame
- Automatically identifies registered employees
- Reduces the need for manual attendance marking

🕐 Attendance Management

The system automatically handles:

- Check-In
- Check-Out
- Present status
- Late status
- Late minutes
- Working hours
- Daily attendance records

The first successful recognition of an employee on a day can create the check-in record, while a later scan can complete the check-out.

📊 Dashboard

The dashboard provides an overview of attendance information such as:

- Total Employees
- Present Today
- Absent Today
- Late Today
- Recent Attendance

⚙️ Attendance Settings

The administrator can configure:

- Office start time
- Office end time
- Late-after duration
- Working-time related settings

🔐 Authentication

The system includes administrator authentication and protected application pages.

It also supports:

- Login
- Logout
- Password change
- Session-based authentication

📑 Attendance Reports

Attendance records can be viewed and used for reporting and administrative purposes.

---

🛠️ Technology Stack

Backend

- Node.js
- Express.js
- MySQL
- mysql2

Frontend

- HTML
- CSS
- JavaScript

Face Recognition / Computer Vision

- face-api.js
- TensorFlow.js
- MediaPipe Tasks Vision

Authentication & Security

- Express Session
- Cookie Parser
- bcrypt

Other Technologies

- Multer
- CORS
- dotenv
- Nodemon

---

🏗️ Project Structure

smart-attendance/
│
├── config/
│   └── Database and application configuration
│
├── controllers/
│   └── Application/business logic
│
├── database/
│   └── Database setup and SQL files
│
├── middleware/
│   └── Authentication and middleware functions
│
├── models/
│   └── Database models and queries
│
├── public/
│   └── Frontend assets
│
├── routes/
│   └── API routes
│
├── utils/
│   └── Utility/helper functions
│
├── views/
│   └── Application pages
│
├── server.js
├── package.json
└── .gitignore

---

🔄 System Workflow

Administrator Login
        ↓
Dashboard
        ↓
Employee Registration
        ↓
Face Registration
        ↓
Camera Starts
        ↓
Face Detection
        ↓
Face Recognition
        ↓
Employee Identified
        ↓
Check Existing Attendance
        ↓
 ┌───────────────┐
 │ No Record?    │
 └───────┬───────┘
         ↓
      Check-In
         ↓
   Present / Late
         
Later Recognition
         ↓
      Check-Out
         ↓
   Working Hours
         ↓
 Attendance Database
         ↓
 Dashboard / Reports

---

🗄️ Database

The system uses MySQL for storing application data.

Attendance records include information such as:

- Employee ID
- Attendance date
- Check-in time
- Check-out time
- Attendance status
- Late minutes
- Working hours

Employee information and attendance settings are also maintained in the database.

---

⏱️ Attendance Logic

The system uses configured office timing to determine attendance status.

For example:

Office Start:       09:00
Late After:         15 minutes

09:00 - 09:15  → Present
After 09:15     → Late

When an employee checks in after the configured late threshold, the system calculates the late duration and stores it with the attendance record.

---

🚀 Installation

1. Clone the Repository

git clone https://github.com/shahilgautam/smart-attendance-system.git
cd smart-attendance-system

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a ".env" file and configure the required database and application settings.

Example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_attendance
SESSION_SECRET=your_secret_key

Use the actual variable names required by your project's database configuration.

4. Configure MySQL

Create the required MySQL database and execute the project's database setup/SQL files.

Make sure MySQL is running before starting the application.

5. Start the Application

For development:

npm run dev

For normal execution:

npm start

The application can then be accessed through the local server configured by the project.

---

📷 Face Registration

Before an employee can be recognized:

1. Create the employee record.
2. Open Face Registration.
3. Select the employee.
4. Capture/register the employee's face.
5. Store the face image/data.
6. The recognition system can then use the registered face during attendance.

---

🎯 Attendance Process

Check-In

Camera
   ↓
Face Detection
   ↓
Face Recognition
   ↓
Employee Identification
   ↓
Check Today's Attendance
   ↓
No Existing Record
   ↓
Create Check-In

Check-Out

Camera
   ↓
Face Recognition
   ↓
Employee Identification
   ↓
Existing Check-In Found
   ↓
Check-Out
   ↓
Calculate Working Hours

The system also prevents repeated completion of an already completed attendance record.

---

📈 Dashboard

The dashboard provides administrators with a quick overview of the current attendance situation.

Example information:

Total Employees       5
Present Today         5
Absent Today          0
Late Today            0

Recent attendance records can also be displayed with employee, department, check-in, check-out and status information.

---

🔒 Security Considerations

The application includes authentication and protected routes.

Passwords are handled using password hashing, while authenticated sessions are used to control access to protected pages and APIs.

Sensitive configuration such as database credentials should be stored in ".env" and should not be committed to GitHub.

---

📌 Current Capabilities

The current implementation provides:

- Web-based attendance management
- Employee management
- Face registration
- Real-time face recognition
- Automatic check-in/check-out
- Late attendance calculation
- Working-hour calculation
- Attendance dashboard
- Attendance settings
- Administrator authentication
- MySQL data storage
- Attendance reporting functionality

---

🔮 Future Improvements

Possible future enhancements include:

- Improved recognition accuracy under difficult lighting
- Advanced liveness detection
- Multi-camera support
- Advanced attendance analytics
- Excel/PDF report generation
- Email notifications
- Role-based administrator access
- Cloud deployment
- Backup and restore functionality
- Mobile application
- Improved large-scale face recognition performance

---

👨‍💻 Project Team

Group 2 (CSE)

- Shahil
- Sachin
- Himanshi
- Devesh Kumar

Internship

510 Army Base Workshop, Meerut Cantt

---

📄 Project Type

Industrial Internship Project

Project: Smart Attendance System Using Face Recognition

Group: Group 2 (CSE)

---

⚠️ Disclaimer

This project is developed as an internship/academic project for demonstrating automated attendance management using face recognition and web technologies.

Performance and recognition accuracy may vary depending on camera quality, lighting, face position, hardware, and the number of registered employees.
