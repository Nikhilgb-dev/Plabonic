import React, { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    const el = document.getElementById(hash.substring(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Plabonic User Agreement
          </h1>
          <p className="text-sm text-gray-600 mt-2">Last updated: 16/12/2025</p>
        </header>

        <section className="space-y-6 text-gray-800 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Introduction & Acceptance</h2>
            <p>
              Welcome to Plabonic, an online job search and recruitment platform
              designed to facilitate connections between employers seeking
              talent and individuals seeking employment opportunities.
            </p>
            <p className="mt-3">
              By accessing, registering for, or using Plabonic's website,
              applications, or related services (collectively, the "Services"),
              you confirm that you have read, understood, and agree to be
              legally bound by this User Agreement (the "Agreement"). If you do
              not agree to these terms, you must not access or use the Services.
            </p>
            <p className="mt-3">
              This Agreement constitutes a legally binding contract between you
              and Plabonic, governing your access to and use of the Services,
              including all features, tools, and functionalities offered through
              the platform.
            </p>
            <p className="mt-3">This Agreement applies to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Job Seekers who create accounts, build profiles, upload resumes,
                and apply for job listings
              </li>
              <li>
                Employers who create accounts, post job opportunities, and
                review candidate applications
              </li>
              <li>Visitors who access publicly available content without registering</li>
            </ul>
            <p className="mt-3">
              Plabonic operates solely as a technology platform. We do not act
              as an employer, recruitment agency, staffing firm, or agent for
              any user. We do not participate in hiring decisions, employment
              negotiations, or employment relationships formed through the
              Services.
            </p>
            <p className="mt-3">
              Your use of the Services is also subject to our Privacy Policy,
              which explains how we collect, process, store, and protect your
              personal data. By using Plabonic, you acknowledge that you have
              reviewed and understood the Privacy Policy and consent to the
              collection and use of your data in accordance with it.
            </p>
            <p className="mt-3">
              We reserve the right to update or modify this Agreement at any
              time. Continued use of the Services after changes are published
              constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Eligibility & Account Responsibilities</h2>
            <h3 className="text-lg font-semibold mt-3">2.1 Eligibility</h3>
            <p>To access or use Plabonic, you represent and warrant that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into this Agreement</li>
              <li>All information you provide is accurate, complete, and up to date</li>
              <li>You are using the Services for lawful purposes only</li>
            </ul>
            <p className="mt-3">
              Plabonic does not permit the use of its Services by minors. Any
              account found to be created by a person under the age of 18 may be
              terminated immediately.
            </p>

            <h3 className="text-lg font-semibold mt-4">2.2 Account Registration</h3>
            <p>To access certain features of the Services, you must create an account.</p>
            <p className="mt-2">You agree that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You will create only one account unless explicitly permitted by Plabonic</li>
              <li>You will not impersonate any person or entity</li>
              <li>You will not create an account on behalf of another person without authorization</li>
              <li>You will not use false, misleading, or incomplete information</li>
            </ul>
            <p className="mt-3">
              Plabonic reserves the right to verify account information and to
              suspend or terminate accounts that violate this Agreement.
            </p>

            <h3 className="text-lg font-semibold mt-4">2.3 Account Security</h3>
            <p>You are solely responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
            </ul>
            <p className="mt-3">
              You agree to notify Plabonic immediately of any unauthorized
              access or suspected security breach. Plabonic is not liable for
              any loss or damage arising from your failure to secure your
              account.
            </p>

            <h3 className="text-lg font-semibold mt-4">2.4 Account Ownership</h3>
            <p>
              Your Plabonic account is personal to you and may not be
              transferred, sold, or shared. Employers who provide access to team
              members remain fully responsible for all actions performed through
              those accounts.
            </p>

            <h3 className="text-lg font-semibold mt-4">2.5 Account Suspension or Termination</h3>
            <p>Plabonic reserves the right, at its sole discretion, to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Suspend or terminate your account</li>
              <li>Restrict access to the Services</li>
              <li>Remove content associated with your account</li>
            </ul>
            <p className="mt-3">This may occur if we determine that you have:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violated this Agreement or applicable laws</li>
              <li>Engaged in fraudulent, misleading, or abusive conduct</li>
              <li>Misused the platform or harmed other users</li>
            </ul>
            <p className="mt-3">
              Account termination may occur without prior notice where legally
              permitted.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. User Conduct & Prohibited Activities</h2>
            <p>
              You agree to use Plabonic in a lawful, honest, and professional
              manner. You are solely responsible for all activity conducted
              through your account.
            </p>
            <h3 className="text-lg font-semibold mt-3">3.1 Acceptable Use</h3>
            <p>You agree that you will:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Services only for legitimate job searching or recruitment purposes</li>
              <li>Provide accurate, truthful, and non-misleading information</li>
              <li>Comply with all applicable local, national, and international laws</li>
              <li>Respect the rights, privacy, and safety of other users</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">3.2 Prohibited Activities</h3>
            <p>You agree not to engage in any of the following activities:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Posting false, misleading, fraudulent, or deceptive job listings</li>
              <li>Creating fake profiles, impersonating individuals or organizations, or misrepresenting your identity</li>
              <li>Requesting money, fees, personal financial information, or sensitive documents from users outside legitimate hiring processes</li>
              <li>Using the platform for scams, phishing, or fraudulent schemes</li>
              <li>Harvesting, scraping, copying, or collecting user data without consent</li>
              <li>Using bots, scripts, crawlers, or automated tools to access or manipulate the Services</li>
              <li>Circumventing security features or access controls</li>
              <li>Uploading viruses, malware, or harmful code</li>
              <li>Harassing, threatening, abusing, or discriminating against other users</li>
              <li>Posting content that is illegal, offensive, defamatory, or violates third-party rights</li>
              <li>Using Plabonic for marketing, solicitation, or advertising unrelated to job opportunities</li>
              <li>Reverse engineering or attempting to extract source code or platform logic</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">3.3 Enforcement</h3>
            <p>Plabonic reserves the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Investigate suspected violations</li>
              <li>Remove content without notice</li>
              <li>Suspend or permanently terminate accounts</li>
              <li>Restrict access to features or services</li>
            </ul>
            <p className="mt-3">
              These actions may be taken at Plabonic's sole discretion and
              without liability.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Job Seekers' Responsibilities</h2>
            <p>As a job seeker using Plabonic, you agree to the following obligations:</p>
            <h3 className="text-lg font-semibold mt-3">4.1 Profile and Application Accuracy</h3>
            <p>You are solely responsible for the accuracy, completeness, and truthfulness of:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your profile information</li>
              <li>Resumes, qualifications, experience, and certifications</li>
              <li>Job applications and communications with employers</li>
            </ul>
            <p className="mt-3">
              Plabonic does not verify the accuracy of candidate information and
              is not responsible for inaccuracies or misrepresentations made by
              job seekers.
            </p>

            <h3 className="text-lg font-semibold mt-4">4.2 Job Applications</h3>
            <p>By applying for a job through Plabonic, you acknowledge that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your application information will be shared directly with the employer</li>
              <li>Employers may contact you outside the platform</li>
              <li>Application outcomes are solely determined by employers</li>
            </ul>
            <p className="mt-3">
              Plabonic does not guarantee interviews, job offers, or employment
              outcomes.
            </p>

            <h3 className="text-lg font-semibold mt-4">4.3 Independent Judgment</h3>
            <p>You agree to exercise independent judgment when interacting with employers. Plabonic is not responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Employer conduct</li>
              <li>Interview processes</li>
              <li>Job offers, rejections, or employment terms</li>
            </ul>
            <p className="mt-3">
              You are responsible for verifying the legitimacy of job postings
              before engaging further.
            </p>

            <h3 className="text-lg font-semibold mt-4">4.4 Prohibited Conduct for Job Seekers</h3>
            <p>Job seekers must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Apply to jobs using false or misleading information</li>
              <li>Misrepresent qualifications or identity</li>
              <li>Engage in spam applications or automated submissions</li>
              <li>Solicit money or benefits from employers</li>
              <li>Use Plabonic for purposes unrelated to job searching</li>
            </ul>
            <p className="mt-3">Violation may result in account suspension or termination.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Employers' Responsibilities</h2>
            <p>If you use Plabonic as an employer or recruiter, you agree to the following obligations:</p>
            <h3 className="text-lg font-semibold mt-3">5.1 Job Posting Accuracy</h3>
            <p>You are solely responsible for the content of job postings, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Job descriptions</li>
              <li>Eligibility criteria</li>
              <li>Compensation details (if provided)</li>
              <li>Location and employment type</li>
            </ul>
            <p className="mt-3">
              All job listings must be accurate, lawful, and made in good faith.
              Posting misleading, fake, or deceptive job opportunities is
              strictly prohibited.
            </p>
            <p className="mt-3">
              Plabonic does not verify job postings and is not responsible for
              inaccuracies or misrepresentations made by employers.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.2 Compliance with Laws</h3>
            <p>Employers agree to comply with all applicable laws, including but not limited to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Employment and labor laws</li>
              <li>Anti-discrimination laws</li>
              <li>Data protection and privacy laws</li>
            </ul>
            <p className="mt-3">
              Employers must not post content or make hiring decisions that are
              discriminatory, unlawful, or unethical.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.3 Use of Candidate Information</h3>
            <p>Candidate data obtained through Plabonic:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>May be used only for recruitment purposes</li>
              <li>Must not be sold, shared, or misused</li>
              <li>Must be handled in compliance with applicable data protection laws</li>
            </ul>
            <p className="mt-3">
              Plabonic is not responsible for how employers handle candidate
              data outside the platform.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.4 Recruitment Process</h3>
            <p>Plabonic does not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Participate in interviews</li>
              <li>Negotiate employment terms</li>
              <li>Verify candidate qualifications</li>
              <li>Guarantee candidate suitability</li>
            </ul>
            <p className="mt-3">
              All recruitment decisions and communications are solely between
              employers and job seekers.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.5 Employer Misconduct</h3>
            <p>Employers must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request payment, deposits, or fees from candidates</li>
              <li>Engage in harassment, intimidation, or misleading conduct</li>
              <li>Use the platform for marketing unrelated to job recruitment</li>
            </ul>
            <p className="mt-3">
              Plabonic reserves the right to remove job postings or suspend
              employer accounts for violations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. User Content</h2>
            <h3 className="text-lg font-semibold mt-3">6.1 User Content Ownership</h3>
            <p>
              You retain ownership of any content you submit, post, upload, or
              display on Plabonic, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Profiles</li>
              <li>Resumes</li>
              <li>Job postings</li>
              <li>Messages and communications</li>
            </ul>
            <p className="mt-3">Plabonic does not claim ownership over user-generated content.</p>

            <h3 className="text-lg font-semibold mt-4">6.2 License Granted to Plabonic</h3>
            <p>
              By submitting content to Plabonic, you grant us a non-exclusive,
              royalty-free, limited license to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Host, store, process, display, and transmit your content</li>
              <li>
                Use the content solely for operating, maintaining, and
                improving the Services
              </li>
            </ul>
            <p className="mt-3">
              This license exists only for as long as your content remains on
              the platform or as required for legal or operational purposes.
            </p>

            <h3 className="text-lg font-semibold mt-4">6.3 Content Removal</h3>
            <p>
              You may remove or update your content at any time through your
              account settings. Upon account deletion, we will remove your
              content within a reasonable timeframe, except where:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Retention is required by law</li>
              <li>
                Content has already been shared with other users (e.g., submitted
                applications)
              </li>
            </ul>
            <p className="mt-3">
              Plabonic is not responsible for content copied or retained by
              other users prior to deletion.
            </p>

            <h3 className="text-lg font-semibold mt-4">6.4 Content Standards</h3>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You have the legal right to submit the content</li>
              <li>Your content does not violate any laws or third-party rights</li>
              <li>Your content is not misleading, fraudulent, or harmful</li>
            </ul>
            <p className="mt-3">
              Plabonic reserves the right to remove content that violates this
              Agreement without notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              7. Third-Party Interactions & No Employment Relationship
            </h2>
            <h3 className="text-lg font-semibold mt-3">7.1 Platform Role</h3>
            <p>
              Plabonic operates solely as an online platform that enables
              employers and job seekers to connect. Plabonic:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Is not an employer, recruiter, staffing agency, or agent</li>
              <li>Does not participate in hiring decisions</li>
              <li>Does not guarantee employment, interviews, or job offers</li>
            </ul>
            <p className="mt-3">
              Any employment relationship formed through the Services is strictly
              between the employer and the job seeker.
            </p>

            <h3 className="text-lg font-semibold mt-4">7.2 User Interactions</h3>
            <p>
              All communications, interviews, negotiations, and agreements occur
              directly between users. Plabonic is not responsible or liable for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>User conduct</li>
              <li>Employment terms or conditions</li>
              <li>Disputes between employers and job seekers</li>
              <li>Misrepresentation by either party</li>
            </ul>
            <p className="mt-3">Users interact at their own risk.</p>

            <h3 className="text-lg font-semibold mt-4">7.3 No Background Checks</h3>
            <p>
              Plabonic does not conduct background checks, credential
              verification, or identity verification unless explicitly stated.
              Users are responsible for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Verifying the authenticity of job postings</li>
              <li>Exercising due diligence during recruitment interactions</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">7.4 Off-Platform Activity</h3>
            <p>Plabonic is not responsible for interactions that occur:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Outside the platform</li>
              <li>
                Through external communication channels (email, phone, messaging
                apps)
              </li>
            </ul>
            <p className="mt-3">
              Once users leave the platform, Plabonic has no control or liability
              over such interactions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              8. Service Availability & Modifications
            </h2>
            <h3 className="text-lg font-semibold mt-3">8.1 Availability of Services</h3>
            <p>
              Plabonic strives to provide reliable access to its Services but
              does not guarantee that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Services will be available at all times</li>
              <li>Access will be uninterrupted, timely, secure, or error-free</li>
            </ul>
            <p className="mt-3">
              Temporary interruptions may occur due to maintenance, system
              upgrades, technical issues, or factors beyond our control.
            </p>

            <h3 className="text-lg font-semibold mt-4">8.2 Modifications to Services</h3>
            <p>Plabonic reserves the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Modify, update, or discontinue any feature or functionality</li>
              <li>Add or remove services</li>
              <li>Change platform structure or offerings</li>
            </ul>
            <p className="mt-3">
              Such changes may be made at any time, with or without notice, and
              without liability.
            </p>

            <h3 className="text-lg font-semibold mt-4">8.3 No Data Storage Obligation</h3>
            <p>
              Plabonic is not a data storage service. While we take reasonable
              measures to protect user data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>We do not guarantee long-term storage of content</li>
              <li>
                Users are responsible for maintaining copies of their resumes,
                job postings, and other information
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              9. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <h3 className="text-lg font-semibold mt-3">9.1 Disclaimer of Warranties</h3>
            <p>
              Plabonic provides the Services on an "as is" and "as available"
              basis. To the fullest extent permitted by law, Plabonic disclaims
              all warranties, express or implied, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Accuracy or reliability of job listings or candidate information</li>
              <li>Availability, continuity, or performance of the Services</li>
              <li>Employment outcomes, hiring decisions, or job suitability</li>
            </ul>
            <p className="mt-3">
              Plabonic does not guarantee that the Services will meet your
              expectations or requirements. You acknowledge that any reliance on
              information obtained through the Services is at your own risk.
            </p>

            <h3 className="text-lg font-semibold mt-4">9.2 Limitation of Liability</h3>
            <p>To the maximum extent permitted by applicable law, Plabonic shall not be liable for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of employment opportunities</li>
              <li>Loss of data, business, revenue, reputation, or profits</li>
              <li>Disputes between users</li>
            </ul>
            <p className="mt-3">
              Plabonic's total liability, if any, arising out of or related to
              the Services shall not exceed the amount paid by you to Plabonic in
              the preceding 12 months, or INR 5,000, whichever is lower.
            </p>

            <h3 className="text-lg font-semibold mt-4">9.3 Basis of the Bargain</h3>
            <p>
              You acknowledge that the limitations of liability set forth in
              this section are a fundamental basis of the agreement between you
              and Plabonic. Without these limitations, Plabonic would not be
              able to provide the Services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              10. Termination, Governing Law & Contact Information
            </h2>
            <h3 className="text-lg font-semibold mt-3">10.1 Termination</h3>
            <p>
              You may terminate this Agreement at any time by closing your
              Plabonic account and discontinuing use of the Services.
            </p>
            <p className="mt-3">
              Plabonic reserves the right, at its sole discretion, to suspend or
              terminate your access to the Services, with or without notice, if:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You violate this Agreement</li>
              <li>You engage in unlawful, fraudulent, or abusive conduct</li>
              <li>Your actions harm other users or the integrity of the platform</li>
            </ul>
            <p className="mt-3">Upon termination:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your right to access or use the Services immediately ceases</li>
              <li>Plabonic may delete or restrict access to your account and content</li>
            </ul>
            <p className="mt-3">
              Sections relating to disclaimers, limitation of liability, and
              governing law shall survive termination.
            </p>

            <h3 className="text-lg font-semibold mt-4">10.2 Governing Law & Jurisdiction</h3>
            <p>
              This Agreement shall be governed by and construed in accordance
              with the laws of India, without regard to conflict of law
              principles. Any dispute arising out of or relating to this
              Agreement or the Services shall be subject to the exclusive
              jurisdiction of the competent courts in India.
            </p>

            <h3 className="text-lg font-semibold mt-4">10.3 Contact Information</h3>
            <p>
              If you have any questions, complaints, or legal notices regarding
              this Agreement, you may contact us at:
            </p>
            <p className="mt-2">Plabonic</p>
            <p>Email: reachus@plabonic.com</p>
            <a href="https://www.plabonic.com">Website: https://www.plabonic.com</a>
          </div>
        </section>

        <section
          id="privacy-policy"
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Plabonic Privacy Policy
            </h2>
            <p className="text-sm text-gray-600 mt-2">Last updated: [Add Date]</p>
          </header>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p>
              Plabonic ("we", "our", "us") respects your privacy and is committed
              to protecting the personal information of users who access or use
              our platform ("Services"). This Privacy Policy explains how we
              collect, use, store, share, and protect your information when you
              use Plabonic.
            </p>
            <p>
              By accessing or using the Services, you consent to the practices
              described in this Privacy Policy.
            </p>

            <div>
              <h3 className="text-lg font-semibold">1. Information We Collect</h3>
              <h4 className="text-base font-semibold mt-3">1.1 Information You Provide Directly</h4>
              <p>We collect personal information that you voluntarily provide, including but not limited to:</p>
              <p className="mt-2 font-semibold">For Job Seekers:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Full name</li>
                <li>Email address and phone number</li>
                <li>Resume/CV, education, experience, skills</li>
                <li>Profile information and job applications</li>
              </ul>
              <p className="mt-3 font-semibold">For Employers:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Company name</li>
                <li>Contact details</li>
                <li>Job postings and recruitment-related information</li>
              </ul>
              <p className="mt-3 font-semibold">For All Users:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Account login credentials</li>
                <li>Communications sent through the platform</li>
              </ul>

              <h4 className="text-base font-semibold mt-4">1.2 Information Collected Automatically</h4>
              <p>When you use Plabonic, we may automatically collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>IP address</li>
                <li>Device type and browser information</li>
                <li>Log files and usage data</li>
                <li>Pages visited and interactions with the platform</li>
              </ul>
              <p className="mt-3">
                This data is used to improve performance, security, and user
                experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Create and manage user accounts</li>
                <li>Enable job applications and recruitment processes</li>
                <li>Facilitate communication between employers and job seekers</li>
                <li>Improve platform functionality and security</li>
                <li>Respond to inquiries and provide support</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p className="mt-3">We do not sell personal data.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Sharing of Information</h3>
              <p>We may share information in the following circumstances:</p>
              <h4 className="text-base font-semibold mt-3">3.1 Between Users</h4>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Job seeker profiles and applications are shared with employers when applying for jobs</li>
                <li>Employers may contact job seekers directly</li>
              </ul>

              <h4 className="text-base font-semibold mt-4">3.2 Service Providers</h4>
              <p>We may share data with trusted third-party service providers who assist in:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Hosting and infrastructure</li>
                <li>Email or notification services</li>
                <li>Analytics and security</li>
              </ul>
              <p className="mt-3">
                These providers are contractually obligated to protect your
                information.
              </p>

              <h4 className="text-base font-semibold mt-4">3.3 Legal Requirements</h4>
              <p>We may disclose information if required to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Comply with legal obligations</li>
                <li>Respond to lawful requests by authorities</li>
                <li>Protect the rights, safety, and security of Plabonic or users</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Data Retention</h3>
              <p>We retain personal information only for as long as:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Necessary to provide the Services</li>
                <li>Required to comply with legal obligations</li>
                <li>Legitimate business purposes exist</li>
              </ul>
              <p className="mt-3">
                You may request deletion of your account and associated data,
                subject to legal or operational retention requirements.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Data Security</h3>
              <p>We implement reasonable technical and organizational measures to protect personal data from:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Unauthorized access</li>
                <li>Loss or misuse</li>
                <li>Disclosure or alteration</li>
              </ul>
              <p className="mt-3">
                However, no system is completely secure. You acknowledge and
                accept this risk.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Your Rights and Choices</h3>
              <p>Depending on applicable law, you may have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Update or correct information</li>
                <li>Delete your account and personal data</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="mt-3">Requests can be made by contacting us using the details below.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. Cookies and Tracking Technologies</h3>
              <p>Plabonic may use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Maintain user sessions</li>
                <li>Improve performance and analytics</li>
                <li>Enhance user experience</li>
              </ul>
              <p className="mt-3">
                You may control cookie preferences through your browser
                settings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Third-Party Links</h3>
              <p>
                Plabonic may contain links to third-party websites or services.
                We are not responsible for the privacy practices or content of
                such third parties. Users are encouraged to review their privacy
                policies independently.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Children's Privacy</h3>
              <p>
                Plabonic is not intended for individuals under the age of 18. We
                do not knowingly collect personal data from minors. If such data
                is identified, it will be deleted.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">10. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be effective upon posting. Continued use of the Services
                constitutes acceptance of the revised policy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">11. Contact Information</h3>
              <p>For questions, concerns, or requests related to this Privacy Policy, contact:</p>
              <p className="mt-2">Plabonic</p>
              <p>Email: privacy@plabonic.com</p>
              <p>Website: https://www.plabonic.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;
