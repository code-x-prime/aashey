import ContactContent from "./ContactContent";

export const metadata = {
    title: "Contact Us | Aashey - Get in Touch for Pure A2 Ghee",
    description: "Have questions about our A2 Bilona Ghee? Contact Aashey today. We're here to help with your orders, bulk inquiries, and product questions.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Us | Aashey",
        description: "Get in touch with Aashey for the purest A2 Cow Ghee inquiries.",
        type: "website",
    },
};

export default function ContactPage() {
    return <ContactContent />;
}

