package controllers

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"time"

	"github.com/thekripaverse/student-analyzer-backend/config"
)

// EmailPayload — generic body for any notification email
type EmailPayload struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

// buildHTML wraps a plain text body in a minimal branded HTML template
func buildHTML(subject, body string) string {
	year := time.Now().Year()
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s</title>
<style>
  body{margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;}
  .wrapper{max-width:600px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);}
  .header{background:linear-gradient(135deg,#4361ee,#7c3aed);padding:36px 40px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px;}
  .header p{color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;}
  .body{padding:36px 40px;color:#e2e8f0;font-size:15px;line-height:1.7;}
  .body h2{color:#a5b4fc;margin-top:0;}
  .footer{padding:20px 40px;background:#0f172a;text-align:center;color:#475569;font-size:12px;}
  .btn{display:inline-block;margin:24px 0 0;padding:12px 28px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff!important;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🎓 APAIS — Academic Intelligence</h1>
    <p>Your personalized study companion</p>
  </div>
  <div class="body">
    <h2>%s</h2>
    <div>%s</div>
  </div>
  <div class="footer">&copy; %d APAIS — Academic Performance & AI Study System. All rights reserved.</div>
</div>
</body>
</html>`, subject, subject, body, year)
}

// loadSMTPConfig reads SMTP settings from config / env
func loadSMTPConfig() (host, port, user, pass string, err error) {
	cfg, e := config.LoadConfig()
	if e != nil {
		err = e
		return
	}
	host = cfg.SMTPHost
	port = cfg.SMTPPort
	user = cfg.SMTPUser
	pass = cfg.SMTPPass
	return
}

// sendMail is the internal helper used by all notification handlers
func sendMail(to, subject, htmlBody string) error {
	host, port, user, pass, err := loadSMTPConfig()
	if err != nil || host == "" {
		return fmt.Errorf("mail service not configured: %v", err)
	}

	// Support modern HTTP-based Resend service to completely bypass SMTP port blocks on Render!
	if host == "resend" || host == "api.resend.com" {
		return sendMailResend(to, subject, htmlBody, pass, user)
	}

	if user == "" {
		return fmt.Errorf("SMTP user not configured")
	}

	auth := smtp.PlainAuth("", user, pass, host)
	msg := fmt.Sprintf("From: APAIS Notifications <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		user, to, subject, htmlBody)

	addr := fmt.Sprintf("%s:%s", host, port)

	// Dial with a 3-second timeout so we don't hang if port is blocked by cloud provider (e.g. Render)
	conn, err := net.DialTimeout("tcp", addr, 3*time.Second)
	if err != nil {
		log.Printf("[SMTP] connection timeout/fail to %s: %v (Port is likely blocked on host)", addr, err)
		return fmt.Errorf("SMTP connection failed (port blocked): %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}
	defer client.Quit()

	if err = client.StartTLS(&tls.Config{ServerName: host}); err != nil {
		return err
	}

	if err = client.Auth(auth); err != nil {
		return err
	}

	if err = client.Mail(user); err != nil {
		return err
	}

	if err = client.Rcpt(to); err != nil {
		return err
	}

	w, err := client.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(msg))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	log.Printf("[SMTP] email sent → %s | %s", to, subject)
	return nil
}

// sendMailResend handles sending emails via Resend's HTTP API (port 443, never blocked)
func sendMailResend(to, subject, htmlBody, apiKey, fromUser string) error {
	if apiKey == "" {
		return fmt.Errorf("resend API key is missing")
	}
	from := fromUser
	if from == "" {
		from = "onboarding@resend.dev"
	}

	payload := map[string]interface{}{
		"from":    from,
		"to":      []string{to},
		"subject": subject,
		"html":    htmlBody,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResponse map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResponse)
		return fmt.Errorf("resend API returned status %d: %v", resp.StatusCode, errResponse)
	}

	log.Printf("[Resend] Email sent successfully to %s", to)
	return nil
}

// ─────────────────────────────────────────────
// HTTP Handlers
// ─────────────────────────────────────────────

// SendTaskReminderEmail — POST /api/notify/task
func SendTaskReminderEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		To    string `json:"to"`
		Tasks []struct {
			Title   string `json:"title"`
			Subject string `json:"subject"`
			DueDate string `json:"dueDate"`
		} `json:"tasks"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.To == "" {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	rows := ""
	for _, t := range body.Tasks {
		rows += fmt.Sprintf(`<tr style="border-bottom:1px solid #334155;">
  <td style="padding:10px 0;color:#e2e8f0;">%s</td>
  <td style="padding:10px;color:#a5b4fc;">%s</td>
  <td style="padding:10px;color:#f59e0b;">%s</td>
</tr>`, t.Title, t.Subject, t.DueDate)
	}

	htmlBody := fmt.Sprintf(`
<p>Hi there 👋 — here is a quick recap of your <strong>pending study tasks</strong>:</p>
<table width="100%%" style="border-collapse:collapse;margin-top:16px;">
  <thead>
    <tr style="border-bottom:2px solid #4361ee;">
      <th style="padding:8px 0;text-align:left;color:#a5b4fc;">Task</th>
      <th style="padding:8px;text-align:left;color:#a5b4fc;">Subject</th>
      <th style="padding:8px;text-align:left;color:#a5b4fc;">Due</th>
    </tr>
  </thead>
  <tbody>%s</tbody>
</table>
<p style="margin-top:24px;">Stay focused — you've got this! 💪</p>`, rows)

	subject := "📋 APAIS Task Reminder — Don't miss your deadlines!"
	if err := sendMail(body.To, subject, buildHTML(subject, htmlBody)); err != nil {
		http.Error(w, "Email send failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}

// SendGoalUpdateEmail — POST /api/notify/goal
func SendGoalUpdateEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		To    string `json:"to"`
		Goals []struct {
			Title    string `json:"title"`
			Category string `json:"category"`
			Progress int    `json:"progress"`
		} `json:"goals"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.To == "" {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	rows := ""
	for _, g := range body.Goals {
		bar := fmt.Sprintf(`<div style="height:8px;background:#1e293b;border-radius:4px;overflow:hidden;width:100%%;">
  <div style="height:8px;width:%d%%;background:linear-gradient(90deg,#4361ee,#7c3aed);border-radius:4px;"></div>
</div>`, g.Progress)
		rows += fmt.Sprintf(`<tr style="border-bottom:1px solid #334155;">
  <td style="padding:10px 0;color:#e2e8f0;">%s</td>
  <td style="padding:10px;color:#a5b4fc;">%s</td>
  <td style="padding:10px;min-width:120px;">%s<span style="color:#94a3b8;font-size:12px;">%d%%</span></td>
</tr>`, g.Title, g.Category, bar, g.Progress)
	}

	htmlBody := fmt.Sprintf(`
<p>Here is a progress update on your <strong>active goals</strong> 🎯</p>
<table width="100%%" style="border-collapse:collapse;margin-top:16px;">
  <thead>
    <tr style="border-bottom:2px solid #4361ee;">
      <th style="padding:8px 0;text-align:left;color:#a5b4fc;">Goal</th>
      <th style="padding:8px;text-align:left;color:#a5b4fc;">Category</th>
      <th style="padding:8px;text-align:left;color:#a5b4fc;">Progress</th>
    </tr>
  </thead>
  <tbody>%s</tbody>
</table>
<p style="margin-top:24px;">Keep pushing — every step counts! 🚀</p>`, rows)

	subject := "🎯 APAIS Goal Update — Your progress this week"
	if err := sendMail(body.To, subject, buildHTML(subject, htmlBody)); err != nil {
		http.Error(w, "Email send failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}

// SendResourceDigestEmail — POST /api/notify/resources
func SendResourceDigestEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		To     string `json:"to"`
		Major  string `json:"major"`
		Videos []struct {
			Title   string `json:"title"`
			Channel string `json:"channel"`
			URL     string `json:"url"`
		} `json:"videos"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.To == "" {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	cards := ""
	for _, v := range body.Videos {
		cards += fmt.Sprintf(`
<div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:12px;border-left:4px solid #4361ee;">
  <a href="%s" style="color:#a5b4fc;font-weight:600;text-decoration:none;font-size:15px;">▶ %s</a>
  <p style="color:#64748b;margin:6px 0 0;font-size:13px;">📺 %s</p>
</div>`, v.URL, v.Title, v.Channel)
	}

	htmlBody := fmt.Sprintf(`
<p>🌟 New high-quality resources curated for your <strong>%s</strong> major!</p>
<div style="margin-top:16px;">%s</div>
<p style="margin-top:24px;color:#64748b;font-size:13px;">These are hand-picked, high-view English-language educational videos to support your learning journey.</p>`,
		body.Major, cards)

	subject := "📚 APAIS Resource Digest — Top picks for " + body.Major
	if err := sendMail(body.To, subject, buildHTML(subject, htmlBody)); err != nil {
		http.Error(w, "Email send failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}
