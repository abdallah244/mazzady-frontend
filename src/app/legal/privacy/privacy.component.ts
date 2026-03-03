import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="legal-page">
      <div class="legal-container">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last updated: March 3, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Mazzady. We respect your privacy and are committed to protecting your
            personal data. This privacy policy explains how we collect, use, and safeguard your
            information when you use our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, phone number, and national
              ID when you register.
            </li>
            <li>
              <strong>Profile Information:</strong> Profile picture, nickname, and other details you
              provide.
            </li>
            <li>
              <strong>Authentication Data:</strong> When you sign in with Google or Facebook, we
              receive your public profile and email address from those services.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our platform, including
              auction activity, bids, and browsing history.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, IP address, and device identifiers.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To facilitate auctions, bids, and transactions</li>
            <li>To send notifications about your activity</li>
            <li>To improve our platform and user experience</li>
            <li>To ensure security and prevent fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul>
            <li>Other users (public profile information, auction activity)</li>
            <li>Service providers who help us operate the platform</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal data, including
            encryption, secure authentication, and regular security audits.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2>7. Third-Party Authentication</h2>
          <p>
            When you use Google or Facebook to sign in, we only access basic profile information
            (name, email, profile picture). We do not post on your behalf or access your contacts.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, contact us at:
            <a href="mailto:abdallahhfares&#64;gmail.com">abdallahhfares&#64;gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
.legal-page
  min-height: 100vh
  background: #161616
  color: #e0e0e0
  padding: 40px 20px

.legal-container
  max-width: 800px
  margin: 0 auto

h1
  color: #d4af37
  font-size: 2rem
  margin-bottom: 8px

.last-updated
  color: #888
  margin-bottom: 32px
  font-size: 0.9rem

h2
  color: #d4af37
  font-size: 1.3rem
  margin-top: 28px
  margin-bottom: 12px

p, li
  line-height: 1.7
  font-size: 0.95rem

ul
  padding-left: 20px
  margin-bottom: 12px

li
  margin-bottom: 6px

a
  color: #d4af37
  text-decoration: none
  &:hover
    text-decoration: underline

section
  margin-bottom: 16px
    `,
  ],
})
export class PrivacyComponent {}
