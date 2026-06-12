# Static Personal Blog Website Report

**Student Name**: 龚科市  
**Student ID**: ZY2557102  

## 1. Project Overview & Framework Choice
For this assignment, I decided to aim for the advanced framework bonus by building my static personal blog using **React** and **Vite**. 

* **Vite**: Provides an ultra-fast development environment and optimized static builds.
* **React**: Allows for a component-based architecture, making the UI interactive and scalable.
* **react-markdown**: Used to dynamically parse and render Markdown files (such as the Task 1 Report) directly within the React application.

The design implements modern glassmorphism (translucent backgrounds with blur effects), responsive layouts, and dynamic CSS gradients for a premium aesthetic.

## 2. Git Version Control & Commit History
Git was used extensively to manage the project workflow. Below is the logical progression of my commits, satisfying the requirement of at least 5 meaningful commits:

1. **`Initial commit: Set up Vite + React template`**
   - Initialized the repository.
   - Scaffolded the base application structure using `create-vite`.
2. **`Add react-markdown for displaying reports`**
   - Installed the `react-markdown` dependency.
   - Updated `package.json` and `package-lock.json`.
3. **`Add Task1_Report.md to public directory`**
   - Integrated the work from Task 1 by placing the generated Markdown report into the `public/` folder so it can be fetched by the frontend.
4. **`Implement modern Glassmorphism UI and Markdown renderer`**
   - Added custom CSS (`index.css`) with CSS variables, animations, and typography.
   - Built the `App.jsx` component with state management to toggle between the Home view and the Report view.
5. **`Add Task2 Website Documentation`**
   - Created this `Task2_Website_Report.md` file documenting the setup process and architectural decisions.

## 3. Integration of Task 1
To integrate the first assignment into the website:
- I placed `Task1_Report.md` inside the `public/` directory.
- Built a specific tab ("Task 1 Report") in the React app.
- Used the JavaScript `fetch` API to retrieve the raw markdown content at runtime.
- Passed the fetched text to the `<ReactMarkdown>` component to render it with beautiful, custom-styled CSS specifically targeted at the `.markdown-body` class.

## 4. Deployment Strategy
The website is structured as a static Single Page Application (SPA). By running:
```bash
npm run build
```
Vite generates a highly optimized `dist/` directory containing static HTML, CSS, and JS. This directory can be effortlessly deployed to platforms like **GitHub Pages**, **Vercel**, or **Netlify**. Since it requires no backend server, it perfectly satisfies the static website deployment requirement.
