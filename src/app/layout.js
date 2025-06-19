import "./globals.css";


export const metadata = {
  title: "Learning Journey",
  description: "View your lesson progress so far",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
