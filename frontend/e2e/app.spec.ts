import { expect, test } from "@playwright/test";

test.describe("ANDRITZ Billing Web App E2E Tests", () => {
  test("should login, submit expense, verify approvals list, check reports, update profile, and use AI assistant", async ({ page }) => {
    // 1. Authentication Flow
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Secure sign in");

    // Input email and password (already prefilled but we explicitly fill for correctness)
    await page.fill('input[type="email"]', "admin@andritz.example");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button:has-text("Sign in")');

    // Confirm navigation to Dashboard
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("text=Total Trips")).toBeVisible();
    await expect(page.locator("text=Monthly Expenses")).toBeVisible();

    // 2. Expense Submission Page
    await page.goto("/expenses/new");
    await expect(page.locator("h1")).toContainText("Expense Submission");

    // Fill form fields using adjacent sibling selector for custom UI components
    await page.fill('label:has-text("Travel Purpose") + textarea', "Client onsite audit and validation project.");
    await page.fill('label:has-text("From") + input', "Delhi");
    await page.fill('label:has-text("To") + input', "Mumbai");
    await page.fill('label:has-text("Start Date") + input', "2026-06-01");
    await page.fill('label:has-text("End Date") + input', "2026-06-05");
    await page.fill('label:has-text("Booking Code") + input', "ANDRITZ-9823");

    // Populate expense category values
    await page.fill('label:has-text("Flight Cost") + input', "15000");
    await page.fill('label:has-text("Hotel Cost") + input', "12000");
    await page.fill('label:has-text("Taxi Cost") + input', "2500");
    await page.fill('label:has-text("GST") + input', "3150");

    // Drag-and-drop / upload receipt file simulation (using a test buffer file)
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('label:has-text("Drop PDF, JPG, JPEG, or PNG receipt")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "hotel_receipt.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-data")
    });

    // Check that receipt processing notification was fired
    await expect(page.locator("text=Receipt processed with OCR")).toBeVisible();
    await expect(page.locator("text=OCR Confidence:").first()).toBeVisible();

    // Click submit for approval
    await page.click('button:has-text("Submit for Approval")');
    await expect(page.locator("text=Expense submitted for approval")).toBeVisible();

    // 3. Expense Listing Page
    await page.goto("/expenses");
    await expect(page.locator("h1")).toContainText("Expenses");
    await expect(page.locator("text=Expense Records")).toBeVisible();

    // 4. Approvals Page
    await page.goto("/approvals");
    await expect(page.locator("h1")).toContainText("Approval Workflow");
    await expect(page.locator("text=Manager and finance review queue")).toBeVisible();

    // 5. Reports & Analytics Page
    await page.goto("/reports");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Report Preview")).toBeVisible();

    // 6. Profile Page
    await page.goto("/profile");
    await expect(page.locator("h1")).toContainText("Profile & Settings");
    await expect(page.locator("text=Total Trips")).toBeVisible();
    await page.getByRole("button", { name: "Edit Profile" }).click();
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();
    await page.fill('label:has-text("Phone Number") + input', "+91 98888 77777");
    await page.fill('label:has-text("Location") + input', "Chennai, India");
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator("text=Profile updated successfully")).toBeVisible();
    await page.click('button:has-text("Travel History")');
    await expect(page.locator("text=Expense Amount")).toBeVisible();
    await page.click('button:has-text("Settings")');
    await expect(page.locator("text=Security Settings")).toBeVisible();

    // 7. floating Copilot AI Assistant
    const botToggle = page.locator('button[title="Open AI assistant"]');
    await expect(botToggle).toBeVisible();
    await botToggle.click();

    // Verify Copilot panel appeared
    await expect(page.locator("text=Enterprise Copilot")).toBeVisible();

    // Chat with AI Copilot
    const chatInput = page.locator('input[placeholder="Ask about expenses..."]');
    await chatInput.fill("What is my monthly spend?");
    await page.click('form:has(input[placeholder="Ask about expenses..."]) button');

    // Confirm Response
    await expect(page.getByText(/Your travel spend this month is INR/)).toBeVisible();

    // Close Assistant
    await page.click('button[title="Close assistant"]');
    await expect(page.locator("text=Enterprise Copilot")).not.toBeVisible();
  });
});
