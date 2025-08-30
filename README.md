# Daily Sweat - AI Personal Workout Planner

**Daily Sweat** is a modern web application designed to be your personal fitness companion. Leveraging the power of generative AI, this app creates customized daily workout plans tailored to your specific goals, available equipment, and fitness level.

![Daily Sweat Screenshot](httpshttps://storage.googleapis.com/aip-dev-images-public-fusion/apps/dailysweat.png)

## ✨ Core Features

- **🤖 AI Workout Generator**: Get personalized workout plans by specifying your desired muscle groups, available time, equipment (from full gym to just bodyweight), and difficulty level (Beginner, Intermediate, Advanced).
- **🏃 Interactive Workout Modal**: When you start a workout, a focused modal view guides you through each exercise, minimizing distractions.
- **⏱️ Exercise & Rest Timers**: For time-based exercises like planks, a built-in timer with pause/resume functionality keeps you on track. After each set, you can launch a dedicated rest timer.
- **📈 Difficulty Feedback & Adjustment**: Rate your workout as "Too Easy," "Just Right," or "Too Hard," and the AI will adjust the plan for your next session.
- **🌐 Fully Internationalized (i18n)**: The user interface is available in English, French, Spanish, Italian, and Chinese. The AI also generates the workout content (exercise names, descriptions) in your selected language.
- **💬 AI Fitness Chatbot**: Have a question about fitness or nutrition? An integrated AI chatbot is available to provide helpful and encouraging answers.
- **📂 Workout History**: Your previously generated workouts are automatically saved to your browser's local storage, allowing you to revisit and repeat them.
- **🌗 Light & Dark Mode**: A sleek, modern interface that supports both light and dark themes.

## 🛠️ Tech Stack

This project is built with a modern, type-safe, and performant technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Generative AI**: [Google AI](https://ai.google/) via [Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks
- **Internationalization**: `next/server` Middleware with JSON dictionaries

## 🚀 Getting Started

To get the project running locally:

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a `.env` file in the root of the project.
    - Add your Google AI (Gemini) API key:
      ```
      GEMINI_API_KEY=your_api_key_here
      ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on [http://localhost:9002](http://localhost:9002).
