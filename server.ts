import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Email notification endpoint for new testimonial submissions
  app.post("/api/notify-review", (req, res) => {
    const { name, company, email, rating, review, submissionDate, status } = req.body || {};
    console.log("==========================================");
    console.log("📧 NEW TESTIMONIAL EMAIL NOTIFICATION DISPATCHED TO ADMIN");
    console.log(`Subject: New Testimonial Submitted`);
    console.log(`Name: ${name}`);
    console.log(`Company: ${company}`);
    console.log(`Email: ${email || 'N/A'}`);
    console.log(`Rating: ${rating} / 5 Stars`);
    console.log(`Review: ${review}`);
    console.log(`Submission Date: ${submissionDate || new Date().toISOString()}`);
    console.log(`Status: ${status || 'Pending Approval'}`);
    console.log("==========================================");

    res.json({ success: true, message: "Admin email notification logged successfully" });
  });

  // Vite development vs production asset handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
