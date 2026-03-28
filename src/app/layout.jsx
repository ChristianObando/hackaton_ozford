import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "Hackaton Ozford",
  description: "proyecto hackaton",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="flex-1 flex flex-col w-full relative">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
