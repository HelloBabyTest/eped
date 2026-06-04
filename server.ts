import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Express server...");
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Request logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  const getAdminSupabase = () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration (URL or Service Role Key) missing on server.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  };

  // API Routes
  
  // In-memory chat storage
  const chatStore: Record<string, any[]> = {};

  app.get("/api/chat/messages/:userId", (req, res) => {
    res.json(chatStore[req.params.userId] || []);
  });

  app.post("/api/chat/messages/:userId", (req, res) => {
    const userId = req.params.userId;
    const { message } = req.body;
    if (!chatStore[userId]) {
      chatStore[userId] = [];
    }
    chatStore[userId].push(message);
    res.json(chatStore[userId]);
  });
  
  app.post("/api/chat/messages/:userId/read", (req, res) => {
    const userId = req.params.userId;
    const { readerRole } = req.body; // 'admin' or 'user'
    if (chatStore[userId]) {
      chatStore[userId] = chatStore[userId].map((msg: any) => {
        if (msg.sender !== readerRole && msg.status !== 'read') {
          return { ...msg, status: 'read' };
        }
        return msg;
      });
    }
    res.json({ success: true });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { query, systemInstruction } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/create-user", async (req, res) => {
    try {
      const { email, password, full_name, role } = req.body;
      const supabase = getAdminSupabase();

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role }
      });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error("Server creation error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/setup-defaults", async (req, res) => {
    try {
      const supabase = getAdminSupabase();

      const defaultUsers = [
        { email: 'editor@gmail.com', password: 'Bilmayman', full_name: 'Kafedra Mudiri (Editor)', role: 'tahrirlovchi' },
        { email: 'approv@gmail.com', password: 'Bilmayman', full_name: 'Mas\'ul Xodim (Approver)', role: 'tasdiqlovchi' }
      ];

      const results = [];
      for (const user of defaultUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            role: user.role
          }
        });
        
        if (error && !error.message.includes('already registered')) {
          results.push({ email: user.email, success: false, error: error.message });
        } else {
          // Ensure profile is active for default staff
          const userId = data?.user?.id;
          if (userId) {
            await supabase
              .from('profiles')
              .update({ status: 'active' })
              .eq('id', userId);
          }
          results.push({ email: user.email, success: true });
        }
      }

      res.json({ results });
    } catch (error: any) {
       console.error("Server setup error:", error);
       res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/update-password", async (req, res) => {
    try {
      const { userId, password } = req.body;
      const supabase = getAdminSupabase();

      const { data, error } = await supabase.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/delete-user", async (req, res) => {
    try {
      const { userId } = req.body;
      const supabase = getAdminSupabase();

      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error("FATAL: Failed to start server:", error);
});
