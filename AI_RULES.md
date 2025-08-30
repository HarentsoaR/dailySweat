# AI Rules for Daily Sweat Application

This document outlines the core technologies used in the Daily Sweat application and provides clear guidelines on which libraries and frameworks to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

*   **Framework**: Next.js (with App Router) for server-rendered React applications.
*   **Language**: TypeScript for type safety and improved developer experience.
*   **Generative AI**: Google AI integrated via Genkit for personalized workout generation and chatbot functionality.
*   **UI Components**: ShadCN UI, a collection of reusable components built on Radix UI and styled with Tailwind CSS.
*   **Styling**: Tailwind CSS for utility-first CSS styling, ensuring responsive and consistent designs.
*   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`, etc.) for managing component-level and shared client-side state.
*   **Internationalization (i18n)**: Handled via `next/server` Middleware and JSON dictionaries for multi-language support.
*   **Icons**: `lucide-react` for a comprehensive set of SVG icons.
*   **Form Handling**: `react-hook-form` for efficient form management and `zod` for schema validation.
*   **Date & Time Utilities**: `date-fns` for parsing, formatting, and manipulating dates.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines when developing new features or modifying existing ones:

*   **UI Components**:
    *   **Always** use components from `shadcn/ui`.
    *   If a required component is not available in `shadcn/ui` or needs significant customization, create a **new, separate component** in `src/components/daily-sweat/` using Tailwind CSS and, if necessary, Radix UI primitives. **Do not modify existing `shadcn/ui` component files.**
*   **Styling**:
    *   **Exclusively** use Tailwind CSS classes for all styling. Avoid custom CSS files or inline styles unless absolutely unavoidable for very specific, complex scenarios (which should be rare).
*   **Icons**:
    *   **Always** use icons from the `lucide-react` library.
*   **Form Management**:
    *   For all forms, use `react-hook-form` for state management and `zod` for defining validation schemas.
*   **Date & Time**:
    *   Use `date-fns` for any operations involving dates, such as formatting, parsing, or calculations.
*   **AI Integration**:
    *   Interact with the generative AI models **only** through the defined Genkit flows located in `src/ai/flows/`. Do not make direct API calls to Google AI services from client-side code.
*   **State Management**:
    *   Prefer React's built-in hooks (`useState`, `useReducer`, `useContext`) for managing component and application state. Keep state management as simple as possible.
*   **Routing**:
    *   Utilize Next.js App Router for all navigation and page structures.
*   **Internationalization**:
    *   Leverage the existing `next/server` middleware and the dictionary system (`src/lib/dictionaries.ts` and `src/locales/*.json`) for all localized content.
*   **Notifications**:
    *   For user feedback and notifications (e.g., success messages, errors), use the `useToast` hook and `Toaster` component provided by `shadcn/ui`.