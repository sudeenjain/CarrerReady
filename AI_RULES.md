# CareerReadyAI Development Rules & Tech Stack

## Tech Stack Overview
- **Framework**: React 19 (TypeScript) for a robust, type-safe UI.
- **Build Tool**: Vite for ultra-fast development and optimized production builds.
- **Styling**: Tailwind CSS with a custom "Prestige" design system (Dark #020617, Indigo #4f46e5).
- **Routing**: React Router 7 for client-side navigation and layout management.
- **AI Engine**: Google Gemini AI (via `@google/genai`) for resume scanning, roadmap generation, and live interviews.
- **Data Visualization**: Recharts for skill gap analysis and predictive "Digital Twin" forecasting.
- **Icons**: Lucide React for consistent, high-quality iconography.
- **Backend/Auth**: Firebase (Auth & Analytics) for secure user synchronization.

## Library Usage Rules

### 1. Styling & UI
- **Tailwind CSS**: Use utility classes for all styling. Avoid custom CSS files unless absolutely necessary.
- **Design System**: Adhere to the "Prestige" aesthetic:
  - Background: `#020617`
  - Primary Accent: `#4f46e5` (Indigo)
  - Cards: `#0f172a` with `backdrop-blur-xl` and `border-white/5`.
- **Animations**: Use Tailwind's `animate-in`, `fade-in`, and `slide-in` classes for transitions.

### 2. Iconography
- **Lucide React**: Exclusively use `lucide-react` for all icons. Do not import icons from other libraries to maintain visual consistency.

### 3. AI & Intelligence
- **Analysis Service**: All AI-related operations (Resume scanning, Roadmaps, Mentor advice) **MUST** be routed through `src/analysisService.ts`.
- **Provider Pattern**: Ensure new AI features are added to the `AnalysisProvider` interface and implemented in `GeminiProvider.ts` with a fallback in `RuleBasedProvider.ts`.

### 4. Data Visualization
- **Recharts**: Use `recharts` for all charts. Ensure charts are responsive using `ResponsiveContainer`.

### 5. State & Navigation
- **React Hooks**: Use standard hooks (`useState`, `useEffect`, `useMemo`) for local state.
- **Routing**: Use `Link` and `useNavigate` from `react-router-dom`. Keep all route definitions in `src/App.tsx`.

## Architectural Guidelines
- **Component Size**: Aim for components under 100 lines. Refactor into smaller sub-components in `src/components/` if they grow too large.
- **File Naming**: Use PascalCase for components (e.g., `ProfileCard.tsx`) and camelCase for utilities/services (e.g., `analysisService.ts`).
- **Type Safety**: Always define or extend types in `src/types.ts`. Avoid using `any`.
- **Persistence**: Use `localStorage` for persisting non-sensitive user progress (like roadmap completion) to ensure offline-ready functionality.