import { db } from "../lib/db";

async function checkStatus() {
    const email = "yasirnoordev@gmail.com";

    console.log("--- Checking Status for:", email, "---");

    const user = await db.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log("User found:");
        console.log("- ID:", user.id);
        console.log("- Email Verified:", user.emailVerified);
    } else {
        console.log("User NOT found.");
    }

    const tokens = await db.verificationToken.findMany({
        where: { identifier: email }
    });

    console.log("\nVerification Tokens found:", tokens.length);
    tokens.forEach(t => {
        console.log("- Token:", t.token);
        console.log("- Expires:", t.expires);
    });
}

checkStatus();
