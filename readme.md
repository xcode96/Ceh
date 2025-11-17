# CEHV13AI - AI-Powered Cybersecurity Training Platform

An interactive, AI-enhanced web application designed for cybersecurity training. This platform provides modules for certifications like **CEH v13** and **CISSP**, leveraging Google's Gemini AI to create a dynamic and engaging learning experience.

## Key Features

- **Dynamic Quiz Generation**: Quizzes are generated on-the-fly by the Gemini AI, providing a unique set of questions every time.
- **Multiple Certifications**: Comes pre-loaded with comprehensive training modules for CEH v13 and CISSP.
- **Granular Quizzing**: Users can take quizzes at multiple levels:
  - Broad module overviews.
  - Specific sub-topics.
  - Laser-focused individual content points (e.g., "CIA Triad").
- **AI-Powered Learning Aids**:
  - **Explain Question**: Get a hint or conceptual explanation before answering, without revealing the solution.
  - **Personalized Feedback**: After answering, receive a tailored explanation that reinforces correct answers or clarifies mistakes.
  - **Dynamic Tags**: AI-generated hashtags for each question provide better context and categorization.
- **User Progress Tracking**: The platform tracks completed modules, showing visual progress for non-admin users.
- **Comprehensive Admin Panel**: A password-protected admin mode unlocks powerful content management capabilities.

---

## Admin Features

The admin panel allows for complete control over the training content.

**Login**: Use `admin` / `password` to log in.

- **Content Curation**:
  - Create, edit, and delete custom questions for any topic.
  - Provide manual explanations for questions, which override AI-generated ones.
- **Content Management**:
  - Add or edit entire exam folders (e.g., add a new certification).
  - Add, edit, or hide modules, sub-topics, and individual content points.
- **Import & Export**:
  - Export the entire question bank to a single JSON file.
  - Import a complete question bank from a JSON file.
  - Export/Import questions for specific topics, allowing for modular content sharing.
- **AI-Assisted Creation**: Get AI-generated question suggestions directly within the question manager to speed up content creation.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`)
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
- **Data Persistence**: Browser `localStorage` for saving progress, visibility settings, and the custom question bank.

---

## Getting Started

This project is built to run directly in the browser without a complex build setup, using ES modules and an import map.

1.  **API Key**: The application requires a Google Gemini API key. This should be set as an environment variable (`process.env.API_KEY`) in the execution context where the app is hosted.
2.  **Running Locally**: Serve the `index.html` file using a simple local web server. The application will initialize and run from there.

---

## Author

**XCODE96**

- **GitHub**: [github.com/xcode96](https://github.com/xcode96/)
- **LinkedIn**: [linkedin.com/in/manibharathi96](https://www.linkedin.com/in/manibharathi96)
