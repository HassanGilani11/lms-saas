import { sendVerificationEmail } from "../lib/mail";
import { config } from "dotenv";
import path from "path";

// Load .env explicitly for the script
config({ path: path.resolve(__dirname, "../../.env") });

async function testMail() {
    console.log("Testing email sending with Mailtrap Sandbox...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_USER:", process.env.SMTP_USER);

    const result = await sendVerificationEmail("yasirnoordev@gmail.com", "test-token-123");

    if (result.success) {
        console.log("✅ Success! Email sent to Mailtrap Sandbox.");
    } else {
        console.error("❌ Failed:", result.error);
    }
}

testMail();
