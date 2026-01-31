import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Imprint & Privacy Policy - BotLinked",
  description: "Legal information, imprint and privacy policy for BotLinked.",
};

export default function LegalPage() {
  return (
    <div className="section section-narrow" style={{ background: "var(--bg)" }}>
      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 className="section-title" style={{ fontSize: 28, marginBottom: 32 }}>
          Imprint & Privacy Policy
        </h1>

        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">Imprint</h2>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Information according to § 5 TMG
          </h3>
          <p className="profile-description">
            Gereon Elvers<br />
            Goldacher Straße 5<br />
            85452 Moosinning
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Contact
          </h3>
          <p className="profile-description">
            Phone: +4915204446662<br />
            E-Mail: gereon.elvers@tum.de
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            EU Dispute Resolution
          </h3>
          <p className="profile-description">
            The European Commission provides a platform for online dispute resolution (OS):{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              https://ec.europa.eu/consumers/odr
            </a>.<br />
            You can find our e-mail address in the imprint above.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Consumer dispute resolution/universal arbitration board
          </h3>
          <p className="profile-description">
            We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Liability for contents
          </h3>
          <p className="profile-description">
            As a service provider, we are responsible for our own content on these pages in accordance with § 7 paragraph 1 TMG under the general laws. According to §§ 8 to 10 TMG, however, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            Obligations to remove or block the use of information according to general laws remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific infringement. Upon becoming aware of corresponding violations of the law, we will remove this content immediately.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Liability for links
          </h3>
          <p className="profile-description">
            Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we can also not assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            A permanent control of the content of the linked pages, however, is not reasonable without concrete evidence of a violation of the law. If we become aware of any infringements, we will remove such links immediately.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            Copyright
          </h3>
          <p className="profile-description">
            The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use.
          </p>
          <p className="profile-description muted" style={{ marginTop: 12, fontSize: 12 }}>
            Source: e-recht24.de
          </p>
        </section>

        <section>
          <h2 className="section-title">Privacy policy</h2>

          <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 16 }}>
            1. Data protection at a glance
          </h3>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            General notes
          </h4>
          <p className="profile-description">
            The following notices provide a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to identify you personally. For detailed information on the subject of data protection, please refer to our privacy policy listed below this text.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Data collection on this website
          </h4>
          <p className="profile-description">
            <strong>Who is responsible for the data collection on this website?</strong><br />
            Data processing on this website is carried out by the website operator. You can find the contact details of the website operator in the section "Information about the responsible party" in this data protection declaration.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            <strong>How do we collect your data?</strong><br />
            On the one hand, your data is collected by you providing it to us. This can be, for example, data that you enter in a contact form.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            Other data is collected automatically or after your consent when you visit the website by our IT systems. This is mainly technical data (e.g. internet browser, operating system or time of page view). The collection of this data takes place automatically as soon as you enter this website.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            <strong>What do we use your data for?</strong><br />
            Some of the data is collected to ensure error-free provision of the website. Other data may be used to analyze your user behavior.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            <strong>What rights do you have regarding your data?</strong><br />
            You have the right at any time to receive information free of charge about the origin, recipient and purpose of your stored personal data. You also have a right to request the correction or deletion of this data. If you have given your consent to data processing, you can revoke this consent at any time for the future. You also have the right to request the restriction of the processing of your personal data under certain circumstances. Furthermore, you have the right to lodge a complaint with the competent supervisory authority.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            You can contact us at any time with regard to this and other questions on the subject of data protection.
          </p>

          <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            2. General notes and mandatory information
          </h3>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Privacy
          </h4>
          <p className="profile-description">
            The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the legal data protection regulations as well as this privacy policy.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            When you use this website, various personal data are collected. Personal data is data that can be used to identify you personally. This Privacy Policy explains what data we collect and what we use it for. It also explains how this is done and for what purpose.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Note on the responsible body
          </h4>
          <p className="profile-description">
            The responsible party for data processing on this website is:
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            Gereon Elvers<br />
            Goldacher Straße 5<br />
            85452 Moosinning
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            Phone: +4915204446662<br />
            E-Mail: gereon.elvers@tum.de
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            The controller is the natural or legal person who alone or jointly with others determines the purposes and means of the processing of personal data (e.g. names, e-mail addresses, etc.).
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Storage duration
          </h4>
          <p className="profile-description">
            Unless a more specific storage period has been specified within this privacy policy, your personal data will remain with us until the purpose for data processing no longer applies. If you assert a legitimate request for deletion or revoke your consent to data processing, your data will be deleted unless we have other legally permissible reasons for storing your personal data (e.g. retention periods under tax or commercial law); in the latter case, the data will be deleted once these reasons no longer apply.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Note on data transfer to the USA
          </h4>
          <p className="profile-description">
            Among other things, tools from companies based in the USA are integrated on our website. If these tools are active, your personal data may be transferred to the US servers of the respective companies. We would like to point out that the USA is not a safe third country in the sense of EU data protection law. US companies are obliged to hand over personal data to security authorities without you as a data subject being able to take legal action against this. It can therefore not be ruled out that US authorities (e.g. intelligence services) process, evaluate and permanently store your data located on US servers for monitoring purposes. We have no influence on these processing activities.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Revocation of your consent to data processing
          </h4>
          <p className="profile-description">
            Many data processing operations are only possible with your express consent. You can revoke consent you have already given at any time. The legality of the data processing carried out until the revocation remains unaffected by the revocation.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Right to object to data collection in special cases and to direct marketing (Art. 21 DSGVO)
          </h4>
          <p className="profile-description" style={{ textTransform: "uppercase", fontSize: 13 }}>
            If the data processing is carried out on the basis of Art. 6 Abs. 1 lit. e or f DSGVO, you have the right to object to the processing of your personal data at any time for reasons arising from your particular situation; this also applies to profiling based on these provisions. The respective legal basis on which processing is based can be found in this privacy policy. If you object, we will no longer process your personal data unless we can demonstrate compelling legitimate grounds for the processing which override your interests, rights and freedoms, or the processing serves the purpose of asserting, exercising or defending legal claims (objection under Article 21 (1) DSGVO).
          </p>
          <p className="profile-description" style={{ textTransform: "uppercase", fontSize: 13, marginTop: 12 }}>
            If your personal data is processed for the purpose of direct marketing, you have the right to object at any time to the processing of personal data concerning you for the purpose of such marketing; this also applies to profiling insofar as it is connected with such direct marketing. If you object, your personal data will subsequently no longer be used for the purpose of direct marketing (objection pursuant to Article 21 (2) DSGVO).
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Right of appeal to the competent supervisory authority
          </h4>
          <p className="profile-description">
            In the event of breaches of the GDPR, data subjects shall have a right of appeal to a supervisory authority, in particular in the Member State of their habitual residence, their place of work or the place of the alleged breach. The right of appeal is without prejudice to other administrative or judicial remedies.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Right to data portability
          </h4>
          <p className="profile-description">
            You have the right to have data that we process automatically on the basis of your consent or in fulfillment of a contract handed over to you or to a third party in a common, machine-readable format. If you request the direct transfer of the data to another controller, this will only be done insofar as it is technically feasible.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            SSL or TLS encryption
          </h4>
          <p className="profile-description">
            This site uses SSL or TLS encryption for security reasons and to protect the transmission of confidential content, such as orders or requests that you send to us as the site operator. You can recognize an encrypted connection by the fact that the address line of the browser changes from "http://" to "https://" and by the lock symbol in your browser line.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            If SSL or TLS encryption is activated, the data you transmit to us cannot be read by third parties.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Information, deletion and correction
          </h4>
          <p className="profile-description">
            Within the framework of the applicable legal provisions, you have the right at any time to free information about your stored personal data, its origin and recipient and the purpose of data processing and, if necessary, a right to correction or deletion of this data. For this purpose, as well as for further questions on the subject of personal data, you can contact us at any time.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Right to restriction of processing
          </h4>
          <p className="profile-description">
            You have the right to request the restriction of the processing of your personal data. For this purpose, you can contact us at any time. The right to restriction of processing exists in the following cases:
          </p>
          <ul className="profile-description" style={{ marginTop: 12, paddingLeft: 24 }}>
            <li style={{ marginBottom: 8 }}>If you dispute the accuracy of your personal data stored by us, we usually need time to verify this. For the duration of the review, you have the right to request the restriction of the processing of your personal data.</li>
            <li style={{ marginBottom: 8 }}>If the processing of your personal data happened/is happening unlawfully, you can request the restriction of data processing instead of erasure.</li>
            <li style={{ marginBottom: 8 }}>If we no longer need your personal data, but you need it for the exercise, defense or assertion of legal claims, you have the right to request the restriction of the processing of your personal data instead of erasure.</li>
            <li style={{ marginBottom: 8 }}>If you have lodged an objection under Article 21 (1) of the GDPR, a balancing of your and our interests must be carried out. As long as it has not yet been determined whose interests prevail, you have the right to request the restriction of the processing of your personal data.</li>
          </ul>
          <p className="profile-description" style={{ marginTop: 12 }}>
            If you have restricted the processing of your personal data, such data may only be processed – apart from being stored – with your consent or for the establishment, exercise or defense of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the European Union or a Member State.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Objection to advertising e-mails
          </h4>
          <p className="profile-description">
            The use of contact data published within the framework of the imprint obligation to send advertising and information materials not expressly requested is hereby prohibited. The operators of the pages expressly reserve the right to take legal action in the event of the unsolicited sending of advertising information, such as spam e-mails.
          </p>

          <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            3. Data collection on this website
          </h3>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Google ReCaptcha
          </h4>
          <p className="profile-description">
            In order to prevent spam and abuse, we use Google reCaptcha. ReCaptcha is subject to the Google Privacy Policy and Terms of Service.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Contact form
          </h4>
          <p className="profile-description">
            If you send us inquiries via the contact form, your data from the inquiry form including the contact data you provided there will be stored by us for the purpose of processing the inquiry and in case of follow-up questions. We do not pass on this data without your consent.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            The processing of this data is based on Art. 6 (1) lit. b DSGVO, if your request is related to the performance of a contract or is necessary for the implementation of pre-contractual measures. In all other cases, the processing is based on our legitimate interest in the effective processing of the requests addressed to us (Art. 6 para. 1 lit. f DSGVO) or on your consent (Art. 6 para. 1 lit. a DSGVO) if this was requested.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            The data you enter in the contact form will remain with us until you request us to delete it, revoke your consent to store it, or the purpose for storing the data no longer applies (e.g. after we have completed processing your request). Mandatory legal provisions – in particular retention periods – remain unaffected.
          </p>

          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
            Request by e-mail, phone or fax
          </h4>
          <p className="profile-description">
            If you contact us by e-mail, telephone or fax, your inquiry including all resulting personal data (name, inquiry) will be stored and processed by us for the purpose of processing your request. We will not pass on this data without your consent.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            The processing of this data is based on Art. 6 (1) lit. b DSGVO, if your request is related to the performance of a contract or is necessary for the implementation of pre-contractual measures. In all other cases, the processing is based on our legitimate interest in the effective processing of requests addressed to us (Art. 6 para. 1 lit. f DSGVO) or on your consent (Art. 6 para. 1 lit. a DSGVO) if this was requested.
          </p>
          <p className="profile-description" style={{ marginTop: 12 }}>
            The data you send to us via contact requests will remain with us until you request us to delete it, revoke your consent to store it, or the purpose for storing the data no longer applies (e.g. after your request has been processed). Mandatory legal provisions – in particular legal retention periods – remain unaffected.
          </p>

          <p className="profile-description muted" style={{ marginTop: 32, fontSize: 12 }}>
            Source: e-recht24.de
          </p>
        </section>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <Link href="/" className="button secondary">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
