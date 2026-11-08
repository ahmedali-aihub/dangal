import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Membership terms, gym rules and website terms of use for Dangal Gym, Hyderabad.",
  alternates: { canonical: "/terms" },
};

// Owner: confirm refund, freeze and transfer rules match your actual policy before launch.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      path="/terms"
      updated="7 November 2026"
      intro={`These terms apply to memberships, trial sessions and use of the facilities of ${SITE.legalName}, and to use of this website. By booking a trial, purchasing a membership or using the website you agree to them.`}
      sections={[
        {
          h: "Membership",
          p: [
            [
              "Memberships are personal and may not be shared. Your membership card or app check-in must be used on every visit.",
              "Fees are payable in advance for the full plan duration. Prices shown on the website are indicative and the price at the time of payment applies.",
              "Annual memberships may be frozen for up to 30 days in total with prior written notice. Other plans cannot be frozen unless agreed in writing for medical reasons.",
              "Memberships may be transferred to another person once, subject to an administrative fee, with approval from management.",
            ],
          ],
        },
        {
          h: "Fees and refunds",
          p: [
            "Membership fees are non-refundable except where required by law or where Dangal Gym is unable to provide the service (for example, permanent closure). In case of a documented medical condition that prevents training, we will offer a freeze or transfer at our discretion.",
          ],
        },
        {
          h: "Free trial",
          p: [
            "One free trial session per person. Trials are subject to availability and must be booked in advance. Visitors must complete a health declaration before training.",
          ],
        },
        {
          h: "Health and safety",
          p: [
            [
              "You confirm that you are in good health and have disclosed any medical condition, injury or pregnancy to our staff. Consult your doctor before starting any exercise program.",
              "Follow coaches' instructions, use equipment correctly and return weights after use.",
              "Stop exercising and inform staff immediately if you feel unwell.",
              "Members under 18 require the written consent of a parent or guardian. Children in the KID program must be dropped off and collected by an authorised adult.",
            ],
          ],
        },
        {
          h: "Gym rules",
          p: [
            [
              "Wear clean training shoes and appropriate clothing; carry a towel.",
              "Treat other members and staff with respect. Harassment of any kind will lead to immediate termination without refund.",
              "Photography or filming of other members without their consent is not allowed.",
              "Lockers are for use during your session only. Dangal Gym is not responsible for loss of personal belongings.",
            ],
          ],
        },
        {
          h: "Liability",
          p: [
            "To the extent permitted by law, Dangal Gym is not liable for injury, loss or damage arising from your use of the facilities, except where caused by our negligence. Nothing in these terms limits liability that cannot be limited under Indian law.",
          ],
        },
        {
          h: "Changes to timings and services",
          p: [
            "We may change class timings, trainers or facilities with reasonable notice, and may close on public holidays or for maintenance. Notices are displayed at the gym and on our social media.",
          ],
        },
        {
          h: "Website use",
          p: [
            "Content on this website is for general information and does not constitute medical or nutritional advice. Calculators provide estimates only. You may not misuse the website, attempt to gain unauthorised access, or submit false or spam enquiries.",
            "All content, logos and images are the property of Dangal Gym or used with permission.",
          ],
        },
        {
          h: "Governing law",
          p: [`These terms are governed by the laws of India. Courts in Hyderabad, Telangana have exclusive jurisdiction. Questions? Contact ${SITE.email} or ${SITE.phone}.`],
        },
      ]}
    />
  );
}
