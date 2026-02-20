# E-Shop - E-commerce Web Application

A modern, responsive e-commerce web application built with Next.js, TypeScript, and Shadcn UI.

## Frontend Design Instructions

### Design System & Guidelines

#### Color Scheme
- **Primary Color**: `#168e2d` (Logo Green)
- **Primary Hover**: `#137a26` (Darker Green)
- **Secondary Colors**: Use neutral grays and whites for backgrounds
- **Accent Colors**: Red for discounts, Green for savings badges

#### Typography
- **Primary Font**: Geist Sans (loaded via Next.js)
- **Mono Font**: Geist Mono
- **Font Weights**: Use font-medium, font-semibold, font-bold appropriately
- **Text Sizes**: Follow Tailwind's text scale (text-xs, text-sm, text-base, text-lg, etc.)

#### Component Guidelines

1. **Shadcn UI Components Only**
   - Use only Shadcn UI components throughout the application
   - If a component is not available, install it first using `npx shadcn@latest add [component-name]`
   - Maintain consistency with the design system

2. **Responsive Design**
   - Mobile-first approach
   - Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
   - Ensure all components work on mobile, tablet, and desktop
   - Test on various screen sizes

3. **Loading States**
   - Always implement skeleton loading animations for data fetching
   - Use the Skeleton component from Shadcn UI
   - Show loading states for:
     - Product cards
     - Category lists
     - Search results
     - Any async operations

4. **Product Cards**
   - Image aspect ratio: 1:1 (square)
   - Show discount badges in top-right corner (red background)
   - Truncate product names with ellipsis
   - Display current price prominently
   - Show regular price (crossed out) if higher than current price
   - Calculate and show "upto" price based on weight discounts
   - Add to cart button with primary color
   - Hover effects for better UX

5. **Navigation & Layout**
   - Sticky header with search functionality
   - Mobile-responsive navigation menu
   - Footer with comprehensive links
   - Breadcrumbs for category navigation

6. **Hero Section**
   - Full-width carousel with slides
   - Overlay text with proper contrast
   - Call-to-action buttons
   - Smooth transitions between slides

7. **Category Products Section**
   - Smooth overlap with hero section
   - Category filter buttons
   - Grid/List view toggle
   - Load more functionality
   - Empty state handling

#### File Structure
```
src/
├── components/
│   ├── ui/           # Shadcn UI components
│   ├── Header.tsx    # Main navigation header
│   ├── Footer.tsx    # Site footer
│   ├── ProductCard.tsx # Product display component
│   ├── HeroSlides.tsx # Hero carousel section
│   └── CategoryProducts.tsx # Product listing section
├── app/
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
└── lib/
    └── utils.ts      # Utility functions
```

#### Performance Guidelines
- Use Next.js Image component for all images
- Implement proper image optimization
- Use lazy loading for below-the-fold content
- Minimize bundle size
- Optimize for Core Web Vitals

#### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus indicators

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## Development Guidelines

1. Always use TypeScript for type safety
2. Follow the established component patterns
3. Implement proper error handling
4. Write clean, maintainable code
5. Test on multiple devices and browsers
6. Follow the color scheme and design system
7. Ensure all components are fully responsive
