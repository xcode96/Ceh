# 🛡️ Cyber Security Training Platform

An advanced, AI-powered interactive web application designed to help professionals prepare for cybersecurity certifications like **CEH v13**, **CISSP**, and more. 

This platform utilizes **Google's Gemini AI** to dynamically generate questions, explain complex concepts, and categorize content, providing an infinite resource for study materials.

---

## 🚀 Key Features

### 👨‍🎓 For Learners
*   **Multi-Certification Support**: Pre-loaded structure for CEH v13 and CISSP, with the ability to add custom exams.
*   **Granular Learning**: Drill down from Exam -> Module -> Sub-Topic -> Content Point.
*   **Two Quiz Modes**:
    *   **Study Mode**: Reveal answers immediately after selection with detailed explanations.
    *   **Exam Mode**: Simulate a real test environment (no immediate feedback, results at the end).
*   **Visual Progress Tracking**:
    *   Detailed dashboards showing performance by Domain.
    *   Track speed, accuracy, and total study time.
    *   **PDF Export**: Download professional quiz result reports.
*   **Review System**: specific section to review incorrect answers with AI-generated explanations.
*   **Privacy First**: All progress data is stored locally in your browser.

### 👮‍♂️ For Admins
*   **Content Management**: Add, edit, or hide Exams, Modules, and Sub-topics.
*   **Question Bank Management**:
    *   Create/Edit/Delete questions manually.
    *   **AI Generation**: Generate distinct questions for specific topics using Gemini AI.
*   **Import/Export**: 
    *   Backup the entire question bank to JSON.
    *   Share specific topic questions with other users.
*   **Visibility Control**: Toggle visibility of specific modules or topics for learners.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: React 19
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash`
*   **PDF Generation**: `html2canvas` + `jspdf`
*   **Icons**: Custom SVG Icon set
*   **Persistence**: Browser LocalStorage

---

## ⚙️ Configuration & Setup

### Prerequisites
To utilize the AI features (Question Generation and Explanations), you must have a valid **Google Gemini API Key**.

### Environment Variables
The application expects the API key to be available in the process environment:
`process.env.API_KEY`

### Running the Project
This project uses a standard React setup (Vite recommended).

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

---

## 🔐 Admin Access

To access the Admin Dashboard for managing content and generating questions:

1.  Click the **"Admin Login"** button on the sidebar.
2.  Use the following default credentials:
    *   **Username**: `admin`
    *   **Password**: `password`

*(Note: In a production environment, replace the hardcoded credentials in `LoginView.tsx` with a secure authentication service.)*

---

## 🧠 AI Features

The platform leverages **Google Gemini 2.5 Flash** for:
1.  **Question Generation**: Creating 4-option multiple-choice questions based on specific content points.
2.  **Tutor Explanations**: Generating "Why is this correct?" or "Why is this wrong?" explanations dynamically in Study Mode.
3.  **Tagging**: Automatically generating relevant hashtags for questions.

---

## 📂 Project Structure

*   **`App.tsx`**: Main application controller and state manager.
*   **`components/`**: UI components (Dashboard, QuizView, Results, etc.).
*   **`services/geminiService.ts`**: Interface with Google GenAI API.
*   **`constants.ts`**: Static curriculum data (CEH/CISSP modules).
*   **`types.ts`**: TypeScript interfaces for Exams, Questions, and Results.

---

## 📝 License

This project is open-source and available for educational purposes.

**Developed by XCODE96**
