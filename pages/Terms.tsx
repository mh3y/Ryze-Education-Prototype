
import React, { useEffect } from 'react';

const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20 font-sans bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white pt-24 pb-24 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-sans font-bold mb-6 text-slate-900 tracking-tight">Terms and Conditions</h1>
          <p className="text-slate-500 font-medium">Last Updated: November 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
          
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">1. About These Terms</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms and Conditions (together with our Privacy Policy) constitute a legally binding agreement between you (the "Client"), Ryze Education (the "Company," "we," "us," or "our"), and govern your use of our tutoring services and interactions with our platform.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Who these terms apply to:</strong> These terms apply to parents, guardians, or legal representatives ("Parents") who engage our services on behalf of primary or secondary school students ("Students"). By accepting these terms, you represent that you have authority to bind the Student to this agreement.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Our Services</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Ryze Education provides direct tutoring services to primary and secondary school students in Australia. Our services are tailored to each Student's learning needs and curriculum requirements. We may use data collected during tutoring sessions to improve our teaching methods, curriculum design, and personalised learning systems specific to each Student.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">What we don't guarantee:</strong> We do not guarantee specific academic outcomes, exam results, grade improvements, or admission to particular schools or programs. Academic success depends on numerous factors beyond our control, including the Student's effort, home study, school factors, and external circumstances.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Eligibility and Parental Authority</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              By engaging our services, you confirm that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>You are a parent, guardian, or legal representative with authority to consent to tutoring services on behalf of the Student</li>
              <li>The Student is enrolled in a primary or secondary school in Australia</li>
              <li>All information you provide is accurate and current</li>
              <li>You will maintain this accuracy and promptly notify us of changes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">4. How Our Services Work</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Personalised Learning:</strong> We collect observational data during tutoring sessions—including the Student's performance, progress, learning patterns, and engagement—to personalise the Student's learning experience. This data is primarily used to benefit each individual Student and optimise their own educational journey with us.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Curriculum Design:</strong> Tutors, curriculum designers, and our team may access your Student's data to continuously improve our teaching methods, content, and systems. This access is strictly for improving the Student's experience and the quality of our tutoring.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Future Collective Use:</strong> While your Student's data is collected primarily for their individual benefit, we may in the future anonymise and aggregate this data (with your consent) to strengthen our AI systems and improve tutoring for future students. Any such use will be clearly optional, and you retain the right to request exclusion at any time.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">5. Payment Terms</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Fees:</strong> Payment terms, pricing, and any applicable packages will be confirmed in writing before services commence.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Refund Policy:</strong> Fees are non-refundable except where required by Australian Consumer Law or as otherwise agreed in writing.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Payment Methods:</strong> We accept Credit Card and Direct Debit via our secure invoicing platform. Payment must be made by the due date specified in your invoice.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Non-Payment:</strong> If payment is not received by the due date, we reserve the right to suspend services until payment is made in full.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">6. Cancellation and Termination</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Cancellation by you:</strong> You may cancel services by providing written notice to <a href="mailto:ryzeeducation@outlook.com" className="text-[#FFB000] font-bold hover:underline">ryzeeducation@outlook.com</a>. Your cancellation notice should specify whether you wish to retain or request deletion of the Student's data.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Termination by us:</strong> We reserve the right to terminate services if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>Payment is not received</li>
              <li>You breach these terms or our policies</li>
              <li>Circumstances make it unsafe or impractical to continue (at our sole discretion)</li>
              <li>The Student or Parent engages in abusive, threatening, or inappropriate conduct</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-4">
              We will provide 2 weeks' written notice where reasonably practicable.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">7. Student and Parent Conduct</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              You and the Student agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>Use our services for any unlawful purpose</li>
              <li>Harass, abuse, or disrespect tutors or staff</li>
              <li>Attempt to access or use systems without authorisation</li>
              <li>Share login credentials or access information with unauthorised parties</li>
              <li>Record sessions without prior written consent</li>
              <li>Disrupt or interfere with our platform or services</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-4">
              Breach of this section may result in immediate termination.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">8. Intellectual Property</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              All materials provided by Ryze Education—including curriculum content, teaching materials, lesson plans, and platform features—remain our exclusive property. You may use these materials solely for the Student's tutoring and learning purposes. You may not copy, distribute, republish, or commercialise any materials without our written consent.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">9. Limitation of Liability</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">To the maximum extent permitted by Australian law:</strong>
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              We provide services "as is." We do not warrant that services will be uninterrupted, error-free, or meet all expectations. We disclaim all implied warranties, including merchantability and fitness for a particular purpose.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Except where prohibited by Australian Consumer Law, our liability is limited to the amount paid for services in the 12 months preceding the claim.</strong> We are not liable for indirect, incidental, consequential, or punitive damages arising from use of our services, even if advised of the possibility of such damages.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Australian Consumer Law:</strong> Nothing in these terms excludes, restricts, or modifies any condition, warranty, or guarantee, or any right you have under the Australian Consumer Law where such exclusion is prohibited.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">10. Indemnity</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Ryze Education, its staff, tutors, and agents from any claims, losses, damages, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>Your breach of these terms</li>
              <li>Your or the Student's use of services</li>
              <li>Your violation of any applicable law</li>
              <li>Any injury, loss, or damage to third parties caused by the Student or arising from services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">11. Disputes and Governing Law</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Governing Law:</strong> These terms are governed by the laws of Australia, specifically the jurisdiction in which Ryze Education operates (NSW).
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Dispute Resolution:</strong> Before initiating formal proceedings, we encourage you to contact us to resolve disputes informally. If informal resolution fails, disputes will be subject to the laws and court system of Australia.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to These Terms</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We may update these terms at any time by posting the updated version on our website or providing notice to you. Your continued use of services constitutes acceptance of updated terms. If you do not agree to changes, you must cease using services and may cancel as outlined in Section 6.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">13. Entire Agreement</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and Ryze Education regarding our services. Any prior agreements or understandings are superseded.
            </p>
          </section>

          <hr className="my-12 border-slate-200" />
          
          <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-[#FFB000]">
            <h4 className="font-bold text-slate-900 mb-2">Acknowledgment</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              By enrolling your Student in Ryze Education's tutoring services, you acknowledge that you have read, understood, and agree to be bound by both the Terms and Conditions and Privacy Policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
