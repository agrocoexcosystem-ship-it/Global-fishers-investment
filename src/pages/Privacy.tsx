import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Shield size={36} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-slate-400">Last updated: March 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {[
              {
                title: '1. Information We Collect',
                content: `We collect information you provide directly, including your full name, email address, phone number, government-issued identification, and financial information necessary for account management and regulatory compliance. We also automatically collect usage data, IP addresses, browser type, and device information when you interact with our platform.`
              },
              {
                title: '2. How We Use Your Information',
                content: `Your information is used to provide and maintain our investment services, process transactions and withdrawals, verify your identity for KYC/AML compliance, communicate account updates and important notices, improve our platform and user experience, and comply with legal and regulatory requirements.`
              },
              {
                title: '3. Data Sharing & Third Parties',
                content: `We do not sell your personal information to third parties. We may share data with regulatory authorities as required by law, payment processors to facilitate transactions, identity verification services for KYC compliance, and cloud service providers for secure data storage. All third-party service providers are contractually obligated to protect your information.`
              },
              {
                title: '4. Data Security',
                content: `We employ AES-256 encryption for data at rest and TLS 1.3 for data in transit. Access to personal information is restricted to authorized personnel only. We conduct regular security audits and penetration testing to ensure the integrity of our systems.`
              },
              {
                title: '5. Data Retention',
                content: `We retain your personal information for as long as your account is active and for a period of five years thereafter, as required by financial regulations. Transaction records are retained for a minimum of seven years. You may request deletion of non-essential data at any time.`
              },
              {
                title: '6. Your Rights',
                content: `You have the right to access, correct, or delete your personal information. You may request a copy of all data we hold about you. You have the right to withdraw consent for data processing. You can file a complaint with the relevant data protection authority. To exercise these rights, contact our Data Protection Officer at privacy@global-fishers.com.`
              },
              {
                title: '7. Cookies & Tracking',
                content: `We use essential cookies for platform functionality and security. Analytics cookies help us improve our services. You can manage cookie preferences through your browser settings. Third-party cookies from our live chat provider (Smartsupp) and language translation service (Google Translate) may also be used.`
              },
              {
                title: '8. Changes to This Policy',
                content: `We may update this Privacy Policy periodically. Significant changes will be communicated via email and platform notifications. Continued use of our services after changes constitutes acceptance of the updated policy.`
              },
            ].map((section, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
                <h2 className="text-xl font-bold mb-3 font-sans text-emerald-400">{section.title}</h2>
                <p className="text-slate-300 leading-relaxed text-sm">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-slate-500">
            <p>For privacy inquiries, contact: <span className="text-emerald-400">privacy@global-fishers.com</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
