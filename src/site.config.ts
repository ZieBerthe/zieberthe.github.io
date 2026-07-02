/**
 * Central site configuration.
 * Edit these values to personalize the whole site in one place.
 */
export const site = {
  /** Your name — shown in the header, footer, and page titles. */
  name: 'Zié Aziz Berthé',
  /** Short role/headline shown in the hero. */
  role: 'Last year engineering AI student',
  /** One or two sentence intro shown on the home page. */
  intro:
   "I am currently a final-year engineering student at École Polytechnique, specializing in Artificial Intelligence. I am particularly interested in mathematics and its applications to machine learning and statistical inference. My current research focuses on sparse learning methods, wavelet representations, and variable selection techniques for signal reconstruction. I enjoy bridging rigorous mathematical ideas with practical algorithms. I hope to pursue work that combines theory with real-world impact in AI and data science." , 
  /** Absolute production URL (used for SEO/Open Graph tags). */
  url: 'https://zieberthe.github.io',
  /** Default social image (place the file in /public/images).
   *  Note: replace with a 1200×630 PNG/JPG — some platforms ignore SVG. */
  ogImage: '/images/og.svg',
  /** Contact + social links. Leave a value empty ('') to hide that link. */
  social: {
    email: 'aziz.berthe.ab@gmail.com',
    github: 'https://github.com/zieberthe',
    linkedin: 'https://www.linkedin.com/in/aziz-berth%C3%A9/',
    twitter: '', // e.g. 'https://x.com/your-handle'
  },
  /** Path to your downloadable CV (place the file in /public/cv). */
  cvPdf: '/cv/zie-berthe-cv.pdf',
  cvPdfFr: '/cv/zie-berthe-cv.pdf',
  cvPdfEn: '/cv/zie-berthe-cv-en.pdf',
};

/** Top navigation links. */
export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/cv', label: 'CV' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
];

/** Skills / tools shown as a row on the home page. */
export const skills = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'scikit-learn',
  'NumPy',
  'Pandas',
  'SQL',
  'Docker',
  'Git',
  'TypeScript',
];
