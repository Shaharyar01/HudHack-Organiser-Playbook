// =========================================================
// PART 1: AUTOMATIC TRIGGER (Runs when Form is Submitted)
// =========================================================

function sendSignupReceipt(e) {
  // 1. SETUP - Exact match to your sheet headers
  const emailColumnName = "University email address"; 
  const nameColumnName = "Full name";

  try {
    const responses = e ? e.namedValues : null;
    
    // SAFETY CHECK: Did you click "Run" manually?
    if (!responses) {
      console.log("⚠️ STOP: You clicked the 'Run' button.");
      console.log("This script ONLY works when you submit the actual Google Form.");
      return;
    }

    // Access the data
    const userEmail = responses[emailColumnName] ? responses[emailColumnName][0] : null;
    const userName = responses[nameColumnName] ? responses[nameColumnName][0] : "Hacker";

    // CHECK: Did we find the email?
    if (!userEmail) {
      console.log("❌ ERROR: Could not find email column.");
      console.log("Available keys:", JSON.stringify(Object.keys(responses)));
      return;
    }

    const subject = "HUDHACK 2026: Application Received 📝";
    
    // HTML Body (The 'Receipt' Email)
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Courier New', monospace; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px 20px;">
          <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 30px; margin-bottom: 30px;">
             <div style="line-height: 1; margin-bottom: 10px;">
               <span style="font-size: 32px; font-weight: 900; color: #f1f5f9; letter-spacing: -1px;">HUD</span><span style="font-size: 32px; font-weight: 900; color: #41c2d5; letter-spacing: -1px;">HACK</span>
             </div>
             <div style="background-color: rgba(65, 194, 213, 0.1); color: #41c2d5; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 11px; font-weight: bold; border: 1px solid #41c2d5; letter-spacing: 1px;">:: APPLICATION RECEIVED ::</div>
          </div>
          <p>Hi ${userName},</p>
          <p>We have received your sign-up for <strong>HUDHACK 2026</strong>.</p>
          <div style="background-color: #1e293b; border-left: 4px solid #41c2d5; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 12px; color: #41c2d5; font-weight: bold; letter-spacing: 1px;">STATUS: PENDING</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #f1f5f9; line-height: 1.5;">
              This email confirms we have your details. Due to limited venue capacity, we review applications in batches. 
              You will receive a separate email ("Official Ticket") if you are selected.
            </p>
          </div>
          <p style="font-size: 10px; color: #64748b; text-align: center; margin-top: 40px;">// University of Huddersfield Cyber Security Society</p>
        </div>
      </body>
      </html>
    `;

    MailApp.sendEmail({ to: userEmail, subject: subject, htmlBody: htmlBody, name: "HUDHACK Bot" });
    console.log("✅ SUCCESS: Receipt sent to " + userEmail);

  } catch (error) {
    console.log("❌ CRITICAL ERROR: " + error.toString());
  }
}

// =========================================================
// PART 2: MANUAL ADMIN MENU
// =========================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('HUDHACK ADMIN')
      .addItem('🚀 Send Tickets (Status: YES)', 'sendYesEmails')
      .addSeparator()
      .addItem('⏳ Send Waitlist (Status: WAITLIST)', 'sendWaitlistEmails')
      .addItem('🛑 Send Rejection (Status: NO)', 'sendNoEmails')
      .addToUi();
}

function sendYesEmails() { processEmails("YES"); }
function sendWaitlistEmails() { processEmails("WAITLIST"); }
function sendNoEmails() { processEmails("NO"); }

function processEmails(targetStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // 1. GET HEADERS (Lowercase & Trimmed for safe matching)
  const headers = data[0].map(h => String(h).toLowerCase().trim());
  
  // 2. FIND COLUMNS (STRICT MODE + EXCLUSIONS)
  
  const NAME_COL = headers.findIndex(h => h.includes("full name") || h.includes("name"));
  const EMAIL_COL = headers.findIndex(h => h.includes("email"));
  
  // Strict matching for Admin columns
  let STATUS_COL = headers.findIndex(h => h === "status");
  let SENT_COL = headers.findIndex(h => h === "ticket sent");
  let TICKET_ID_COL = headers.findIndex(h => h === "ticket id");

  // Fallback: If exact match fails, try fuzzy but EXCLUDE "consent" or "completing"
  // This prevents it from finding the "By completing this..." column
  if (SENT_COL === -1) {
    SENT_COL = headers.findIndex(h => h.includes("ticket") && h.includes("sent") && !h.includes("completing") && !h.includes("consent"));
  }

  // SAFETY CHECK
  if (NAME_COL === -1 || EMAIL_COL === -1 || STATUS_COL === -1 || SENT_COL === -1) {
    const missing = [];
    if (NAME_COL === -1) missing.push("Full Name");
    if (EMAIL_COL === -1) missing.push("Email");
    if (STATUS_COL === -1) missing.push("Status");
    if (SENT_COL === -1) missing.push("Ticket Sent");
    
    SpreadsheetApp.getUi().alert("❌ ERROR: Could not find columns.\nMissing: " + missing.join(", ") + "\n\nPlease ensure your headers are exactly 'Status', 'Ticket Sent', and 'Ticket ID'");
    return;
  }

  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[EMAIL_COL];
    const name = row[NAME_COL] || "Hacker";
    const status = String(row[STATUS_COL] || "").toUpperCase().trim();
    const sentValue = String(row[SENT_COL] || "");

    // Only process if Status matches AND we haven't sent it yet
    if (status === targetStatus && !sentValue.includes(targetStatus)) {
      try {
        if (targetStatus === "YES") {
          // Generate ID based on Row Number (e.g. Row 2 -> HUD-1002)
          const ticketID = "HUD-" + (1000 + (i + 1)); 
          
          sendOfficialTicket(email, name, ticketID);
          
          // UPDATE SHEET
          sheet.getRange(i + 1, SENT_COL + 1).setValue("SENT_YES");
          
          if (TICKET_ID_COL !== -1) {
            sheet.getRange(i + 1, TICKET_ID_COL + 1).setValue(ticketID); 
          }
          
        } else if (targetStatus === "WAITLIST") {
          sendWaitlistEmail(email, name);
          sheet.getRange(i + 1, SENT_COL + 1).setValue("SENT_WAITLIST");
        } else if (targetStatus === "NO") {
          sendRejectionEmail(email, name);
          sheet.getRange(i + 1, SENT_COL + 1).setValue("SENT_NO");
        }
        count++;
        SpreadsheetApp.flush(); 
      } catch (e) {
        console.log("Error sending to " + email + ": " + e.toString());
      }
    }
  }
  
  const ui = SpreadsheetApp.getUi();
  ui.alert(count > 0 ? `Success! Sent ${count} emails.` : `No new rows found for status: ${targetStatus}`);
}

// =========================================================
// PART 3: EMAIL TEMPLATES
// =========================================================

function sendOfficialTicket(email, name, ticketID) {
  const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:'Courier New',monospace;color:#f1f5f9;"><div style="max-width:600px;margin:0 auto;background-color:#0f172a;padding:40px 20px;"><div style="text-align:center;border-bottom:1px solid #334155;padding-bottom:30px;margin-bottom:30px;"><div style="line-height:1;margin-bottom:15px;"><span style="font-size:40px;font-weight:900;color:#f1f5f9;letter-spacing:-2px;">HUD</span><span style="font-size:40px;font-weight:900;color:#41c2d5;letter-spacing:-2px;">HACK</span></div><div style="background-color:#41c2d5;color:#0f172a;display:inline-block;padding:6px 16px;border-radius:4px;font-weight:900;letter-spacing:1px;">ACCESS GRANTED</div></div><p style="font-size:16px;">Hi ${name},</p><p style="color:#cbd5e1;line-height:1.6;">We received many applications for this year's event, and we are excited to confirm that <strong>you have been selected</strong> to attend HudHack 2026.</p><div style="background-color:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:15px;margin:20px 0;"><p style="margin:0;color:#ef4444;font-weight:bold;font-size:13px;">⚠️ ENTRY REQUIREMENT</p><p style="margin:5px 0 0 0;font-size:14px;color:#f1f5f9;">You <strong>MUST</strong> bring your University Student ID card. Student ID is required.</p></div><div style="background-color:#1e293b;border:2px solid #41c2d5;border-radius:12px;padding:20px;margin:30px 0;text-align:center;"><p style="color:#94a3b8;font-size:10px;letter-spacing:2px;margin:0 0 5px 0;">YOUR TICKET ID</p><p style="color:#f1f5f9;font-size:28px;font-weight:900;margin:0;font-family:monospace;">${ticketID}</p></div><table style="width:100%;border-collapse:collapse;margin-bottom:30px;background-color:#1e293b;border-radius:8px;border:1px solid #334155;"><tr><td style="padding:15px;border-bottom:1px solid #334155;width:30%;vertical-align:top;"><span style="font-size:10px;color:#41c2d5;font-weight:bold;letter-spacing:1px;display:block;margin-bottom:4px;">DATE</span><span style="font-size:14px;color:#f1f5f9;font-weight:bold;">26 FEB 2026</span><span style="font-size:12px;color:#94a3b8;display:block;margin-top:2px;">Thursday</span></td><td style="padding:15px;border-bottom:1px solid #334155;vertical-align:top;"><span style="font-size:10px;color:#41c2d5;font-weight:bold;letter-spacing:1px;display:block;margin-bottom:4px;">TIME</span><span style="font-size:14px;color:#f1f5f9;font-weight:bold;">10:00 – 18:00</span><span style="font-size:12px;color:#94a3b8;display:block;margin-top:2px;">Arrive by 09:45</span></td></tr><tr><td colspan="2" style="padding:15px;"><span style="font-size:10px;color:#41c2d5;font-weight:bold;letter-spacing:1px;display:block;margin-bottom:4px;">LOCATION</span><span style="font-size:14px;color:#f1f5f9;font-weight:bold;">Haslett Building (HA4/04)</span><span style="font-size:12px;color:#94a3b8;display:block;margin-top:2px;">University of Huddersfield</span></td></tr></table><div style="margin-bottom:20px;"><p style="color:#f1f5f9;font-weight:bold;border-bottom:1px solid #334155;padding-bottom:10px;">📋 CHECKLIST</p><ul style="list-style:none;padding:0;margin:0;color:#cbd5e1;font-size:14px;"><li style="padding:8px 0;border-bottom:1px dashed #334155;">✅ <strong>Student ID Card</strong> (REQUIRED)</li><li style="padding:8px 0;border-bottom:1px dashed #334155;">✅ <strong>Laptop & Charger</strong></li><li style="padding:8px 0;border-bottom:1px dashed #334155;">✅ <strong>Ticket ID</strong> (This email)</li></ul></div><p style="text-align:center;font-size:12px;color:#64748b;margin-bottom:30px;">If you can no longer attend, please email us at <a href="mailto:hudcybersoc@gmail.com" style="color:#41c2d5;text-decoration:none;">hudcybersoc@gmail.com</a>.</p><div style="text-align:center;border-top:1px solid #334155;padding-top:30px;"><p style="font-size:14px;color:#94a3b8;margin-bottom:20px;">Join the community:</p><a href="https://discord.gg/MpJk8bGSRV" style="background-color:#c084fc;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:bold;font-size:12px;text-transform:uppercase;">Join Discord</a><p style="font-size:10px;color:#64748b;margin-top:30px;">// University of Huddersfield Cyber Security Society</p></div></div></body></html>`;
  MailApp.sendEmail({ to: email, subject: "HUDHACK 2026: OFFICIAL TICKET CONFIRMED 🎟️", htmlBody: htmlBody, name: "HUDHACK Bot" });
}

function sendWaitlistEmail(email, name) {
  const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:'Courier New',monospace;color:#f1f5f9;"><div style="max-width:600px;margin:0 auto;background-color:#0f172a;padding:40px 20px;"><div style="text-align:center;border-bottom:1px solid #334155;padding-bottom:30px;margin-bottom:30px;"><div style="line-height:1;margin-bottom:15px;"><span style="font-size:32px;font-weight:900;color:#f1f5f9;letter-spacing:-1px;">HUD</span><span style="font-size:32px;font-weight:900;color:#f59e0b;letter-spacing:-1px;">HACK</span></div><div style="border:1px solid #f59e0b;color:#f59e0b;display:inline-block;padding:6px 16px;border-radius:50px;font-weight:bold;font-size:11px;letter-spacing:1px;">WAITLISTED</div></div><p>Hi ${name},</p><div style="background-color:rgba(245,158,11,0.1);border-left:4px solid #f59e0b;padding:15px;margin:20px 0;"><p style="margin:0;color:#f59e0b;font-weight:bold;font-size:14px;">STATUS: PRIORITY WAITLIST</p><p style="margin:8px 0 0 0;font-size:14px;color:#f1f5f9;line-height:1.5;">We have reached our capacity. You have been added to our priority waitlist.</p></div><p style="color:#cbd5e1;"><strong>What happens next?</strong></p><p style="color:#cbd5e1;font-size:14px;">Spots often open up as people change their plans. If a ticket becomes available, we will email you immediately.</p><p style="font-size:10px;color:#64748b;text-align:center;margin-top:40px;">// University of Huddersfield Cyber Security Society</p></div></body></html>`;
  MailApp.sendEmail({ to: email, subject: "HUDHACK 2026: Added to Waitlist ⏳", htmlBody: htmlBody, name: "HUDHACK Bot" });
}

function sendRejectionEmail(email, name) {
  const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:'Courier New',monospace;color:#f1f5f9;"><div style="max-width:600px;margin:0 auto;background-color:#0f172a;padding:40px 20px;"><div style="text-align:center;border-bottom:1px solid #334155;padding-bottom:30px;margin-bottom:30px;"><div style="line-height:1;margin-bottom:15px;"><span style="font-size:32px;font-weight:900;color:#505560;letter-spacing:-1px;">HUD</span><span style="font-size:32px;font-weight:900;color:#94a3b8;letter-spacing:-1px;">HACK</span></div><div style="background-color:#334155;color:#f1f5f9;display:inline-block;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:11px;">CAPACITY REACHED</div></div><p>Hi ${name},</p><p style="color:#cbd5e1;">Thank you for your interest in HudHack 2026.</p><div style="background-color:#1e293b;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #334155;"><p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">We received an overwhelming number of applications this year. Unfortunately, we have reached our capacity, so we are unable to offer you a spot at this time.</p></div><p style="font-size:14px;color:#94a3b8;">We run regular workshops throughout the year. Please join our Discord to stay updated on future events.</p><div style="text-align:center;margin-top:30px;"><a href="https://discord.gg/MpJk8bGSRV" style="color:#c084fc;text-decoration:none;font-weight:bold;font-size:12px;">JOIN DISCORD</a></div></div></body></html>`;
  MailApp.sendEmail({ to: email, subject: "HUDHACK 2026: Application Status", htmlBody: htmlBody, name: "HUDHACK Bot" });
}