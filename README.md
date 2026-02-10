# StudyMate 📚

**StudyMate** is a comprehensive, web-based productivity and study management application designed to help students organize their academic life. Its primary purpose is to provide a centralized platform for tracking study sessions, managing assignments, and visualizing academic progress.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🚀 Features

* **Smart Dashboard:** A real-time overview of pending tasks, daily study time, and active subjects, featuring a greeting that changes based on the time of day.
* **Subject Management:** Create, edit, and color-code subjects (e.g., "Artificial Intelligence" in Orange, "Data Structures" in Blue) to keep studies organized.
* **Task Manager:** A robust to-do list that allows users to add tasks with due dates, link them to specific subjects, and filter by status (Pending/Completed).
* **Focus Timer:** A built-in study timer with "Study" and "Break" modes (25/5 minutes), featuring a visual circular progress ring and live session statistics.
* **Notes System:** A dedicated space for creating and managing quick study notes, searchable by title or content.
* **Progress Analytics:** Visual charts and progress bars track study time distribution across different subjects and the last 7 days of activity.
* **Data Persistence:** All data is saved automatically to the browser's **Local Storage**, ensuring users never lose progress even if they close the tab.
* **Customization:** Features a Dark Mode toggle and Theme Color picker (Blue, Red, Green, Purple, etc.) to personalize the UI.
* **Export Reports:** One-click generation of detailed Excel (.xls) reports summarizing all study sessions and task statuses.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** Custom CSS with Flexbox/Grid and CSS Variables for theming.
* **Data Storage:** Browser LocalStorage (No backend required).
* **Icons:** SVG Icons & Google Fonts (Inter).

---

## 📂 Project Structure

```text
StudyMate/
├── index.html       # Main HTML structure
├── style.css        # Global styles and responsive design
├── script.js        # Core logic (DOM, LocalStorage, Timer, Charts)
├── svgIcons/        # Folder containing SVG icons
└── README.md        # Project documentation