import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "E-2 Market — Buy & Sell Products Online",
  description:
    "E-2 Market is your one-stop marketplace. Buy and sell products easily with price comparison, order tracking, and a secure checkout.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
