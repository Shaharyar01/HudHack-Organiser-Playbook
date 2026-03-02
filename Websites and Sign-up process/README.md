# 🌐 Websites & The Sign-Up Pipeline

Everything you will need to make a website and the sign up process ( its harder than you think ).

---

## 🖥️ Part 1: The Websites

We used simple, single-page static HTML sites hosted on **GitHub Pages** (which is free and reliable). You do not need a heavy React app for a hackathon. 

### 🌍 Hosting & Custom Domain (`hudhack.com`)
To make the event look professional, we didn't just use the default GitHub URL. We bought a custom domain from **GoDaddy**.
* **How we set it up:** We linked our GitHub Pages repository to GoDaddy by updating the DNS settings on GoDaddy's dashboard (pointing the A records to GitHub's IP addresses and adding a CNAME record) and entering the custom domain into our repository's settings on GitHub.
* 🚨 **Domain Ownership for 2027:** I own the `hudhack.com` domain for the next year. If the next committee wants to keep using it for 2027, **you must contact me personally** so I can update the DNS records or transfer the domain over to you!

The website went through two distinct phases:

1. **`/Sign-up-Website` (Pre-Event):** * **Purpose:** To build hype, display the schedule, explain the theme, and drive traffic to our Google Form sign-up link. 
   * **Features:** A live countdown timer and interactive schedule.
2. **`/After-event-website` (Post-Event):** * **Purpose:** To act as a permanent archive of the event.
   * **Features:** A JS confetti cannon on load, event statistics, attendee demographics, and a "Podium" section showcasing the winning projects and organizers.

---

## 📝 Part 2: The Sign-Up Pipeline (Tutorial)

Managing 60+ hackers requires a strict, automated funnel. If you do this manually, you will lose your mind. Here is exactly how we handled it using Google Forms and Google Apps Script.

### Step 1: The Google Form
Users clicked "Sign Up" on the website and were taken to a Google Form. 
* 📄 *See `HudHack2026-sign-up-form.pdf` in this folder for the exact questions we asked.*
* Ensure you ask for **University Email** and **Student ID** so you can verify they are actual students.
* Ensure you ask for **Dietary Requirements** early so you can plan the food order.

### Step 2: The Google Sheet & Automation
We linked the Google Form to a Google Sheet. Then, we attached a custom JavaScript automation (Google Apps Script) to that sheet. 

**How the automation works:**
1. As soon as a user submits the form, the script automatically emails them a "Receipt" letting them know we got their application.
2. We added three custom columns to our Google Sheet: `Status`, `Ticket Sent`, and `Ticket ID`.
3. The script generated a custom **HUDHACK ADMIN** menu at the top of the Google Sheet. 
4. Organizers would review the list, type "YES", "WAITLIST", or "NO" into the `Status` column, and click the Admin menu to batch-send the official tickets.

**How to set up the code for next year:**
1. Open your Google Sheet > Click `Extensions` > `Apps Script`.
2. Open the **`Sign-Up-Script.gs`** file included in this folder, copy all the code, and paste it into the Apps Script editor.
3. Save the project (💾 icon).
4. Set up a "Trigger" (the clock icon on the left) to run the `sendSignupReceipt` function with the event type set to `On form submit`.

### Step 3: The Hub (Discord)
The "Official Ticket" email sent by the script contained the link to our Discord server. Hackers *had* to join the Discord to get announcements, find teams, and get help. Discord is your central command center.

---

## 🚨 PART 3: CRITICAL LESSON LEARNED (The Spam Issue) 🚨

**DO NOT RUN THE AUTOMATION SCRIPT FROM THE EXTERNAL SOCIETY GMAIL ACCOUNT.**

For HudHack 2026, we attached the Google Apps Script to our society email (`hudcybersoc@gmail.com`). Because we were an external `@gmail.com` address trying to send mass automated emails to `@hud.ac.uk` student addresses, the University's strict firewall flagged almost all of our tickets as **SPAM/JUNK**. 

Many students missed their acceptance emails because of this.

### ✅ The Fix for 2027:
You must run the Google Form, the Google Sheet, and the Apps Script from **one of the Lead Organizer's official University student accounts** (e.g., `U1234567@unimail.hud.ac.uk`). 

Because a student email is already inside the University's trusted network, the automated emails will bypass the spam filters and land directly in the attendees' primary inboxes!

---

## 🎫 Part 4: Day-Of Registration

On the morning of the event, the digital funnel turns into a physical one:
1. Set up a desk at the door.
2. Have the master Google Sheet open on a laptop.
3. Ask attendees for their **Student ID** to cross-reference with the list.
4. Hand them their name badge.
5. Point them to the screen to scan the "Attendance QR Code" to mark themselves as present.

*Note: Expect a 20-30% drop-off rate between people who sign up online and people who actually show up. If you want 50 people in the room, aim for 70 sign-ups!*
