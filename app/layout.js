// app/layout.js
import './globals.css';

export const metadata = {
  title: 'StackCode Career Quiz',
  description: 'Take the StackCode career quiz and earn your participation certificate.',
  openGraph: {
    title: 'StackCode Career Quiz',
    description: 'Discover if you are career-ready and earn your certificate.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
