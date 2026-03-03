import { Component } from '@angular/core';

@Component({
  selector: 'app-data-deletion',
  standalone: true,
  template: `
    <div class="legal-page">
      <div class="legal-container">
        <h1>Data Deletion Instructions</h1>
        <p class="last-updated">Last updated: March 3, 2026</p>

        <section>
          <h2>How to Delete Your Data</h2>
          <p>
            If you wish to delete your account and all associated data from Mazzady, you can do so
            by following these steps:
          </p>
        </section>

        <section>
          <h2>Option 1: Through Your Account</h2>
          <ol>
            <li>Log in to your Mazzady account</li>
            <li>Go to your Profile page</li>
            <li>Contact our support team through the Customer Service page</li>
            <li>Request account deletion</li>
          </ol>
        </section>

        <section>
          <h2>Option 2: Via Email</h2>
          <p>
            Send an email to
            <a href="mailto:abdallahhfares&#64;gmail.com">abdallahhfares&#64;gmail.com</a> with the
            subject line "Data Deletion Request" and include:
          </p>
          <ul>
            <li>Your registered email address</li>
            <li>Your account nickname</li>
            <li>Reason for deletion (optional)</li>
          </ul>
        </section>

        <section>
          <h2>What Gets Deleted</h2>
          <p>When you request data deletion, the following data will be permanently removed:</p>
          <ul>
            <li>Your account profile and personal information</li>
            <li>Your auction history and bid records</li>
            <li>Your uploaded images and documents</li>
            <li>Your wallet and transaction history</li>
            <li>Your notification and chat history</li>
            <li>Any data obtained through Facebook or Google login</li>
          </ul>
        </section>

        <section>
          <h2>Processing Time</h2>
          <p>
            Data deletion requests are processed within <strong>30 days</strong>. You will receive a
            confirmation email once your data has been deleted.
          </p>
        </section>

        <section>
          <h2>Facebook Users</h2>
          <p>
            If you signed up using Facebook, you can also request data deletion through Facebook's
            settings. Go to <strong>Settings &gt; Apps and Websites</strong>, find Mazzady, and
            click <strong>Remove</strong>. This will trigger a data deletion request on our end.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            For any questions about data deletion, reach us at:
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

ul, ol
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
export class DataDeletionComponent {}
