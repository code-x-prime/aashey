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
  variable: "--font-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans",
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
  variable: "--font-sans-sc",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://aashey.com"),
  title: {
    default: "AASHEY | Pure A2 Cow Ghee â€” Traditionally Bilona Crafted",
    template: "%s | AASHEY",
  },
  description:
    "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method. 100% pure, lab tested, no preservatives. Free shipping on orders above â‚¹999.",
  keywords: [
    "aashey",
    "A2 cow ghee",
    "bilona ghee",
    "pure ghee",
    "traditional ghee",
    "desi ghee",
    "Indian ghee",
    "organic ghee",
    "lab tested ghee",
    "buy ghee online",
    "pure A2 ghee India",
  ],
  authors: [{ name: "AASHEY" }],
  creator: "AASHEY",
  publisher: "AASHEY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AASHEY | Pure A2 Cow Ghee â€” Traditionally Bilona Crafted",
    description:
      "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method. 100% pure, lab tested, no preservatives.",
    url: "https://aashey.com",
    siteName: "AASHEY",
    images: [
      {
        url: "/og-image.jpg", // Make sure this exists in public folder or use a dynamic one
        width: 1200,
        height: 630,
        alt: "AASHEY Pure A2 Cow Ghee",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AASHEY | Pure A2 Cow Ghee",
    description:
      "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "aLdiwKXl0n9Cq8bqfU_CbBlN8mjCLLV0Wz5y0EGHYjk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

