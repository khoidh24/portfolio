# 💕 Portfolio Motion

> _Where Code Meets Choreography & Logic Meets Zen._

<p align="center">
  <img src="https://i.ibb.co/TDLg7j76/og-image.jpg" alt="Portfolio Motion" />
</p>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![GSAP](https://img.shields.io/badge/GSAP_3-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

<br />

## 👋 Hello, World!

Welcome to **Portfolio Motion**, a digital playground where I experiment with the boundaries of web interaction. This isn't just a portfolio; it's a performance.

Built with the latest **Next.js 15** and powered by **GSAP**, this project demonstrates that a website can be fast, SEO-friendly, and absolutely stunning at the same time. I believe that browsing a website should feel like a gentle breeze—smooth, natural, and delightful.

> _"Static websites are cool, but have you tried making them dance?"_ 💃

---

## ✨ The "VIP" Features

This project is packed with interactions that make you go _"Ooh, shiny!"_:

- **🖱️ Inertia Custom Cursor**: A custom-built cursor with a "tail" effect that follows your movement with natural inertia. It knows when you're hovering over something important (links, buttons, inputs) and reacts accordingly. It's polite, it's smooth, and it respects your content (disappears when reading articles!).
- **🧲 Magnetic Elements**: Buttons and links that feel "sticky" and playful, drawn to your cursor like magic.
- **🌊 Smooth Scrolling**: Integrated `ScrollSmoother` for that buttery-smooth scroll experience that native browsers just can't match.
- **📄 Page Transitions**: Seamless transitions between pages because hard cuts are for horror movies, not portfolios.
- **📝 Markdown Blog**: A fully functional blog system powered by `react-markdown`, `rehype-highlight`, and `katex` for rendering beautiful code snippets and math equations.
- **⚡ Performance First**: Built with `Turbopack`, optimized images, and `SpeedInsights` to ensure we stay in the green zone.

---

## 🛠️ The Engine Room (Tech Stack)

Under the hood, we're running a V12 engine:

| Category       | Technology                                      | Why?                                                                |
| :------------- | :---------------------------------------------- | :------------------------------------------------------------------ |
| **Core**       | [Next.js 15](https://nextjs.org/)               | The React Framework for the Web. Server Components ftw!             |
| **UI Library** | [React 19](https://react.dev/)                  | The library for web and native user interfaces.                     |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/)     | Rapidly build modern websites without ever leaving your HTML.       |
| **Animation**  | [GSAP](https://gsap.com/)                       | The standard for modern web animation. Robust, performant, and fun. |
| **State**      | [Zustand](https://github.com/pmndrs/zustand)    | A small, fast and scalable bearbones state-management solution. 🐻  |
| **Database**   | [Supabase](https://supabase.com/)               | The Open Source Firebase alternative.                               |
| **Forms**      | [React Hook Form](https://react-hook-form.com/) | Performant, flexible and extensible forms with easy validation.     |
| **Validation** | [Zod](https://zod.dev/)                         | TypeScript-first schema declaration and validation.                 |
| **Icons**      | [Lucide React](https://lucide.dev/)             | Beautiful & consistent icons.                                       |

---

## 📂 Project Structure

A clean home is a happy home. Here's how we organize our chaos:

```bash
📦 public
├── 🎬 motion/                 # Motion assets (videos, lotties)
├── 🖼 og-image.jpg             # Open Graph image for social sharing

📦 src
├── 📂 app
│   ├── 🏠 (homepage)/         # Homepage components and layout
│   ├── 📡 api/
│   │   └── ✉️ contact/
│   │       └── 🗂 route.ts    # API route handling contact form submissions
│   ├── 📝 articles/           # Articles page components and content
│   ├── ✉️ contact/            # Contact page components and form
│   ├── 🌐 favicon.ico         # Favicon for the site
│   ├── 🎨 globals.css         # Global CSS styles (Tailwind v4)
│   ├── 🧩 layout.tsx          # Layout wrapper component (header/footer)
│   ├── 🧩 template.tsx        # Page template component (animations)
│   ├── 🚫 not-found.tsx       # 404 Page
│   ├── 🤖 robots.ts           # Robots.txt configuration
│   └── 🗺️ sitemap.ts          # Sitemap configuration
│
├── 📂 components/             # Reusable UI components
│   ├── 🖱️ CustomCursor.tsx    # Custom cursor with tail & inertia effect
│   ├── 🔗 LinkAnimation.tsx   # Animated link component
│   ├── 🧲 MagneticElement.tsx # Magnetic hover effect component
│   ├── 🪟 Modal.tsx           # Modal component
│   ├── 🧭 Navigation.tsx      # Main navigation component
│   └── 🔄 TransitionLink.tsx  # Link with page transition
│
├── 📂 constants/              # Constant values, enums, static data
├── 📂 lib/                    # Library configurations (Supabase, etc.)
├── 📂 stores/                 # State management (Zustand)
└── 📂 utils/                  # Utility functions and helpers
```

---

## 🚀 Getting Started

Want to take this for a spin? Buckle up!

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/portfolio-motion.git
    ```

2.  **Install dependencies:**
    We use `bun` because speed matters. 🐇

    ```bash
    bun install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file and add your secrets (Supabase keys, etc.).

    ```bash
    NEXT_PUBLIC_SITE_URL=your_url
    NEXT_PUBLIC_BASE_BLOB_URL=your_img_container_url

    NEXT_PUBLIC_MAIL_USERNAME=your_email
    MAIL_PASSWORD=your_password
    NEXT_PUBLIC_MAIL_TO=your_email

    NEXT_PUBLIC_SUPABASE_URL=your_url
    SUPABASE_ANON_KEY=your_key

    NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=your_key
    NEXT_SECRET_GOOGLE_RECAPTCHA_SECRET_KEY=your_key
    ```

4.  **Run the development server:**

    ```bash
    bun dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) and enjoy the show! 🎉

---

## 💌 Contact

Created with ❤️, ☕, and a lot of `console.log` by **Volunote**.

- **Website:** [portfolio.veinz.blog](https://portfolio.veinz.blog)
- **Email:** [hoangkhoiduong24@gmail.com](mailto:hoangkhoiduong24@gmail.com)

> _"Code is poetry, and motion is the rhythm."_

---

<p align="center">
  <sub>© 2025 Portfolio Motion. All rights reserved. No pixels were harmed in the making of this website.</sub>
</p>
