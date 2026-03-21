import React, { useEffect } from 'react';

const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ryze-page">
      <div className="ryze-page-hero border-b border-[var(--border)] px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="ryze-page-title">Privacy Policy</h1>
          <p className="ryze-page-lead mt-6">Last Updated: November 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="ryze-page-card p-8 md:p-12">
          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">1. Our Commitment to Privacy</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              Ryze Education is committed to protecting your privacy and complying with the <em>Privacy Act 1988 (Cth)</em> and the Australian Privacy Principles (APPs). This Privacy Policy explains how we collect, use, disclose, and protect personal information about Students and Parents.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">2. What Information We Collect</h3>

            <div className="mb-6">
              <p className="mb-2 font-bold text-[var(--primary)]">From Parents:</p>
              <ul className="list-disc space-y-2 pl-6 text-[var(--muted)]">
                <li>Name, contact details (phone, email, address)</li>
                <li>Payment information (credit/debit card details, billing address)</li>
                <li>Student&apos;s name, age, school, year level, and academic subjects</li>
                <li>Educational background and learning goals</li>
                <li>Any health or accessibility information relevant to tutoring (e.g., learning difficulties, medical conditions)</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="mb-2 font-bold text-[var(--primary)]">From Students (during tutoring):</p>
              <ul className="list-disc space-y-2 pl-6 text-[var(--muted)]">
                <li>Academic performance data (test scores, quiz results, assignment progress)</li>
                <li>Learning patterns, strengths, and areas for improvement</li>
                <li>Engagement level, attendance, and participation</li>
                <li>Tutors&apos; observational notes on progress and learning style</li>
                <li>Session notes, homework completion, and curriculum coverage</li>
                <li>Any communication between the Student and tutor (via email, platform, or otherwise)</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="mb-2 font-bold text-[var(--primary)]">How we collect it:</p>
              <ul className="list-disc space-y-2 pl-6 text-[var(--muted)]">
                <li>Directly from you (enrollment forms, conversations, emails)</li>
                <li>From tutors during sessions (notes, observations, assessments)</li>
                <li>From our platform or systems (login information, session records)</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">3. How We Use Your Information</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Primary purpose - Personalised learning:</strong> Your Student&apos;s data is collected and used primarily to personalise their tutoring experience, optimise their individual learning path, and track their progress. This is our core commitment: each Student&apos;s data exists to benefit <em>that Student</em>.
            </p>

            <div className="mb-4">
              <strong className="text-[var(--primary)]">Internal use:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-6 text-[var(--muted)]">
                <li>Tutors use data to plan and deliver personalised lessons</li>
                <li>Curriculum designers and staff use data to improve teaching methods and course content</li>
                <li>Our founders and management team review data to strengthen systems and ensure quality</li>
                <li>We use Parent contact information to communicate about the Student&apos;s progress, billing, and service updates</li>
              </ul>
            </div>

            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Marketing and communications:</strong> We may use Parent contact information to send updates about our services, new offerings, or educational resources. You can opt out of marketing communications at any time by contacting us.
            </p>

            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Optional future use - Collective benefit:</strong> In the future, we may anonymise and aggregate individual Student data (removing all identifying information) to improve our Ryze AI systems and tutoring methods for all future students. <strong>This is entirely optional.</strong> You may:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li>Consent to this use</li>
              <li>Opt out of this use</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              Any decision you make about future collective use will not affect your Student&apos;s access to current tutoring services.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">4. Legal Basis for Collection</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              We collect personal information (including information about minors) under the Australian Privacy Act because:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li>It is necessary to provide you with tutoring services (APP 3)</li>
              <li>You have consented to collection, or a parent/guardian has consented on the Student&apos;s behalf (APP 3)</li>
              <li>It is required or authorised by law (APP 3)</li>
              <li>It is reasonably expected in the course of our business (APP 3)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">5. Who We Share Your Information With</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">We do NOT sell, rent, lease, or transfer your information to third parties for marketing or commercial purposes.</strong>
            </p>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">We may share information with:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li><strong className="text-[var(--primary)]">Tutors and staff</strong> who work directly with the Student</li>
              <li><strong className="text-[var(--primary)]">Curriculum designers and management</strong> to improve our services</li>
              <li><strong className="text-[var(--primary)]">Payment processors</strong> (securely encrypted) to process payments</li>
              <li><strong className="text-[var(--primary)]">Service providers</strong> (only as necessary, with confidentiality agreements) - such as IT support, data storage providers, or communication platforms</li>
              <li><strong className="text-[var(--primary)]">Legal authorities</strong> if required by law or to protect safety</li>
            </ul>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Future integrations:</strong> As we scale and add integrations (e.g., learning management platforms), we will only share data necessary for those integrations and will update this policy with details. We will seek your consent before sharing data with new third parties.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">6. Data Security</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">We take data security seriously. Your information is:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li>Stored on secure servers with access restricted to authorised staff</li>
              <li>Protected by encryption during transmission (HTTPS)</li>
              <li>Kept confidential and only accessed by those who need it for their role</li>
            </ul>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">What we cannot guarantee:</strong> We cannot guarantee absolute security against all cyber threats. No online system is 100% secure. We encourage you to protect your login credentials and promptly report any security concerns.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">7. How Long We Keep Your Data</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">While the Student is with us:</strong> We retain all Student data for the duration of your engagement with Ryze Education to maintain continuity and personalisation.
            </p>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">After services end:</strong> Upon termination or cancellation, we retain data for 12 months to manage any outstanding matters (billing, disputes, feedback). You may request immediate deletion at any time (see Section 8).
            </p>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Anonymous/aggregated data:</strong> Anonymised data used for collective benefit may be retained indefinitely for system improvement.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">8. Your Rights and How to Exercise Them</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              Under the <em>Privacy Act 1988 (Cth)</em>, you have the right to:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li><strong className="text-[var(--primary)]">Access:</strong> Request access to the personal information we hold about your Student. We will provide this within 30 days.</li>
              <li><strong className="text-[var(--primary)]">Correction:</strong> Request that we correct inaccurate or out-of-date information.</li>
              <li><strong className="text-[var(--primary)]">Deletion:</strong> Request that we delete your Student&apos;s personal data. We will do so within 30 days, except where we are required by law to retain it or where retention is necessary for legal claims or disputes. Deletion does not apply to anonymised or aggregated data.</li>
              <li><strong className="text-[var(--primary)]">Opt-out of future collective use:</strong> Request that we exclude your Student&apos;s data from being used (in anonymised form) to improve Ryze AI and collective systems.</li>
            </ul>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">How to exercise these rights:</strong> Contact us at <a href="mailto:ryzeeducation@outlook.com" className="font-bold text-[var(--accent)] hover:underline">ryzeeducation@outlook.com</a> with your request. Include the Student&apos;s name and sufficient detail for us to locate your information. We will respond within 30 days. If we refuse your request, we will explain why.
            </p>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">No cost:</strong> We will not charge you to exercise these rights (unless your request is manifestly unfounded or excessive, in which case we may charge a reasonable fee).
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">9. Minors&apos; Privacy</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              Your Student is a minor, and we take their privacy seriously. We do not require the Student to directly provide personal information; instead, we collect it from Parents and tutors.
            </p>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--primary)]">Parental consent:</strong> By accepting these terms, you give explicit consent for us to:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--muted)]">
              <li>Collect personal information about your Student</li>
              <li>Use that information to personalise their tutoring</li>
              <li>Allow tutors, curriculum designers, and staff to access that information</li>
              <li>Retain the information for the period you remain a client</li>
            </ul>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">If you do not consent, we cannot provide services.</p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">10. Overseas Disclosure</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              We do not currently transfer personal information outside Australia. If this changes - for example, if we use overseas cloud storage or third-party services - we will update this policy and seek your consent where required.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">11. Complaints and Contact</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              If you believe we have breached the <em>Privacy Act</em> or your privacy rights, you may:
            </p>
            <div className="mb-4">
              <p className="mb-2 leading-relaxed text-[var(--muted)]">
                <strong className="text-[var(--primary)]">Contact us first:</strong> Email us at <a href="mailto:ryzeeducation@outlook.com" className="font-bold text-[var(--accent)] hover:underline">ryzeeducation@outlook.com</a> with details of your concern. We will investigate and respond within 30 days.
              </p>
            </div>
            <div className="mb-4">
              <p className="mb-2 leading-relaxed text-[var(--muted)]">
                <strong className="text-[var(--primary)]">Escalate to the Privacy Commissioner:</strong> If you are not satisfied with our response, you may lodge a complaint with the <strong>Office of the Australian Information Commissioner (OAIC)</strong>:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li>Website: <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">www.oaic.gov.au</a></li>
                <li>Phone: 1300 363 424</li>
                <li>Email: enquiries@oaic.gov.au</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">12. Changes to This Privacy Policy</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">
              We may update this policy to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by email or by posting the updated policy on our website. Your continued use of services constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="mb-4 text-2xl font-bold text-[var(--primary)]">13. Contact Us</h3>
            <p className="mb-4 leading-relaxed text-[var(--muted)]">For questions about this Privacy Policy or to exercise your rights, contact:</p>
            <div className="inline-block rounded-[1.6rem] border border-[rgba(184,132,30,0.16)] bg-[rgba(243,231,201,0.52)] p-6 pr-12">
              <p className="mb-1 text-lg font-bold text-[var(--primary)]">Ryze Education</p>
              <p className="text-[var(--muted)]">Sydney, NSW Australia</p>
              <p className="mt-2 text-[var(--muted)]">Email: <a href="mailto:ryzeeducation@outlook.com" className="font-bold text-[var(--accent)] hover:underline">ryzeeducation@outlook.com</a></p>
              <p className="text-[var(--muted)]">Phone: +61 413 885 839</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
