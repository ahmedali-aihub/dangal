import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dangal Gym collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

// Drafted with India's Digital Personal Data Protection Act, 2023 in mind. Have it reviewed by a legal professional before launch.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      updated="7 November 2026"
      intro={`This policy explains how ${SITE.legalName} ("Dangal Gym", "we", "us"), located at ${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.city} – ${SITE.address.postalCode}, collects and uses your personal data when you visit our website, contact us or become a member. We process personal data in accordance with the Digital Personal Data Protection Act, 2023 and other applicable Indian law.`}
      sections={[
        {
          h: "Data we collect",
          p: [
            "We only collect what we need to respond to you and to provide our services:",
            [
              "Contact details you submit through our forms: name, mobile number, email address (optional), the program you are interested in, preferred time and any message you write.",
              "Membership information, if you join: date of birth, emergency contact, health declaration (PAR-Q), body measurements and progress records you choose to share with your coach.",
              "Technical data: anonymous usage statistics (pages viewed, device type) and security logs such as IP address, retained to protect the website against abuse.",
            ],
          ],
        },
        {
          h: "How we use your data",
          p: [
            [
              "To contact you about your enquiry or free-trial booking by phone, WhatsApp or email.",
              "To manage your membership, schedule sessions and track your progress.",
              "To keep you and other members safe — for example, health information helps our coaches adapt exercises.",
              "To prevent spam, fraud and misuse of our website.",
              "To send offers or updates, only where you have agreed. You can opt out at any time.",
            ],
            "We do not sell or rent your personal data to anyone.",
          ],
        },
        {
          h: "Legal basis and consent",
          p: [
            "We process your data on the basis of your consent (for example, when you tick the consent box on our enquiry form) and for legitimate uses permitted by law, such as fulfilling your membership. You may withdraw consent at any time by contacting us; this will not affect processing already carried out.",
          ],
        },
        {
          h: "Sharing",
          p: [
            "We share data only with trusted service providers who help us run the gym and this website, under confidentiality obligations — for example, our database and hosting providers, email delivery and the WhatsApp Business platform used to notify our team of new enquiries. We may disclose data where required by law.",
          ],
        },
        {
          h: "Storage and security",
          p: [
            "Data is stored with reputable cloud providers using encryption in transit (HTTPS) and access controls. Only authorised staff, protected by two-factor authentication, can access enquiry records. Enquiries that do not convert into memberships are deleted or anonymised within 24 months.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "You have the right to access, correct, update or erase your personal data, to withdraw consent and to nominate another person to exercise your rights in the event of death or incapacity. You also have the right to grievance redressal.",
            `To exercise any right, email ${SITE.email} or call ${SITE.phone}. We will respond within 30 days.`,
          ],
        },
        {
          h: "Children",
          p: [
            "For the I AM THE FITTEST KID program, we collect children's data only with verifiable consent from a parent or guardian, and only for the purpose of safe training and communicating with the parent.",
          ],
        },
        {
          h: "Cookies",
          p: [
            "This website uses only essential cookies needed for security and to remember simple preferences (such as dismissing an offer banner). Embedded content — Google Maps, YouTube and Vimeo — may set their own cookies under their respective privacy policies; we use privacy-enhanced embed modes where available.",
          ],
        },
        {
          h: "Grievance officer & contact",
          p: [
            `Grievance Officer: The Manager, Dangal Gym, ${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.city} – ${SITE.address.postalCode}. Email: ${SITE.email}. Phone: ${SITE.phone}.`,
            "We may update this policy from time to time. The latest version will always be available on this page.",
          ],
        },
      ]}
    />
  );
}
