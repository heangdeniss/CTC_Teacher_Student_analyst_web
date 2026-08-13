# Community Tech Center (CTC) Analytics Dashboard

**Authors:** Liza SROY, Denis HEANG

## Overview
The CTC Analytics Dashboard is a comprehensive web-based platform designed to visualize survey data and feedback from both **Teachers** and **Students** using Community Tech Centers (CTCs). The platform provides data-driven insights to help the MPTC leadership refine budget allocations, improve infrastructure, and optimize operational timetables for maximum CTC utilization.

## Key Features
- **Bilingual Interface:** Full support for both English and Khmer languages, accessible globally via an intuitive toggle.
- **Dual Dashboards:** 
  - **Teacher Analyst Portal:** Insights into teacher demographics, tech adaptation, resource utilization, digital safety, and direct qualitative feedback on CTC advantages and challenges.
  - **Student Analyst Portal:** Metrics on student profiles, the positive impact of CTCs on academic performance, and digital well-being.
- **Interactive Data Visualizations:** Built with Recharts to provide dynamic bar charts, pie charts, and radial graphs.
- **Mobile Responsive:** Carefully designed to work seamlessly on both desktop and mobile devices.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Custom CSS & Tailwind CSS
- **Data Visualization:** Recharts
- **Icons:** Lucide-React
- **Data Parsing:** PapaParse

## Project Objectives
1. Evaluate the direct impacts of CTCs on students' academic performance and teachers' daily instruction.
2. Assess technology equity and the reliance on school-provided CTC equipment.
3. Track technology engagement and digital skills growth for both students and educators.
4. Analyze practical resource utilization and awareness of digital safety.
5. Gather direct qualitative feedback to pinpoint specific advantages and operational challenges of CTCs.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/heangdeniss/CTC_teacher_analyst_web.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "CTC_teacher_analyst_web/frontend"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server, run:
```bash
npm run dev
```
The app will be accessible at `http://localhost:5173`.

### Building for Production
To create a production build:
```bash
npm run build
```
The optimized production files will be generated in the `dist` directory, ready to be deployed to platforms like Vercel, Netlify, or GitHub Pages.

## Deployment Notes
If deploying to a platform like Vercel or Netlify, ensure that the **Root Directory** in your project settings is set to `frontend`, as the `package.json` and build configurations are located within this folder.