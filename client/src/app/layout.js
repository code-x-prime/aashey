import "./globals.css";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Poppins,
  Cormorant_SC,
} from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-sc",
  display: "swap",
});

export const metadata = {
  title: "AASHEY | Pure A2 Cow Ghee — Traditionally Bilona Crafted",
  description:
    "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method. 100% pure, lab tested, no preservatives. Free shipping on orders above ₹999.",
  keywords:
    "aashey, A2 cow ghee, bilona ghee, pure ghee, traditional ghee, desi ghee, Indian ghee, organic ghee, lab tested ghee",
  authors: [{ name: "AASHEY" }],
  openGraph: {
    title: "AASHEY | Pure A2 Cow Ghee — Traditionally Bilona Crafted",
    description:
      "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method. 100% pure, lab tested, no preservatives.",
    type: "website",
    locale: "en_IN",
    siteName: "AASHEY",
  },
  twitter: {
    card: "summary_large_image",
    title: "AASHEY | Pure A2 Cow Ghee",
    description:
      "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method.",
  },
  verification: {
    google: "aLdiwKXl0n9Cq8bqfU_CbBlN8mjCLLV0Wz5y0EGHYjk",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${cormorant.variable} ${playfair.variable} 
          ${poppins.variable} ${cormorantSC.variable}
          font-sans antialiased bg-[#FDF6E3]
        `}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen ">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
