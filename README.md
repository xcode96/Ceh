# Cybersecurity Training Platform

An interactive web application designed for cybersecurity training. This platform provides modules for certifications like **CEH v13** and **CISSP**, allowing for custom quiz creation and progress tracking.

## Key Features

- **Custom Quizzes**: Admins can create and manage a comprehensive question bank for any topic.
- **Multiple Certifications**: Comes pre-loaded with training modules for CEH v13 and CISSP.
- **Topic-based Quizzing**: Users can take quizzes on specific sub-topics or even individual content points.
- **Manual Explanations**: Admins can provide detailed explanations for questions to aid in learning.
- **User Progress Tracking**: The platform tracks completed modules, showing visual progress for non-admin users.
- **Comprehensive Admin Panel**: A password-protected admin mode unlocks powerful content management capabilities.

---

## Admin Features

The admin panel allows for complete control over the training content.

**Login**: Use `admin` / `password` to log in.

- **Content Curation**:
  - Create, edit, and delete custom questions for any topic.
  - Provide manual explanations for questions.
- **Content Management**:
  - Add or edit entire exam folders (e.g., add a new certification).
  - Add, edit, or hide modules, sub-topics, and individual content points.
- **Import & Export**:
  - Export the entire question bank to a single JSON file.
  - Import a complete question bank from a JSON file.
  - Export/Import questions for specific topics, allowing for modular content sharing.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
- **Data Persistence**: Browser `localStorage` for saving progress, visibility settings, and the custom question bank.

---

## Getting Started

This project is built to run directly in the browser without a complex build setup, using ES modules and an import map.

1.  **Running Locally**: Serve the `index.html` file using a simple local web server. The application will initialize and run from there.

---

## Author

**XCODE96**

- **GitHub**: [github.com/xcode96](https://github.com/xcode96/)
- **LinkedIn**: [linkedin.com/in/manibharathi96](https://www.linkedin.com/in/manibharathi96)

---
Developed by XCODE96