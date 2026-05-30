package controllers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

// ── Gemini API types ────────────────────────────────────────────────────────

type geminiPart struct {
	Text       string          `json:"text,omitempty"`
	InlineData *geminiInline   `json:"inlineData,omitempty"`
}

type geminiInline struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiRequest struct {
	Contents []geminiContent `json:"contents"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// ── Parsed grade item ────────────────────────────────────────────────────────

type ParsedGrade struct {
	Subject  string  `json:"subject"`
	ExamName string  `json:"examName"`
	Score    float64 `json:"score"`
	MaxScore float64 `json:"maxScore"`
}

// ── Handler ──────────────────────────────────────────────────────────────────

// ParseMarksheet accepts a multipart file upload, sends it to Gemini, and
// returns a JSON array of { subject, examName, score, maxScore }.
func ParseMarksheet(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		http.Error(w, `{"error":"GEMINI_API_KEY is not configured on the server"}`, http.StatusServiceUnavailable)
		return
	}

	// 32 MB max file size
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, `{"error":"Failed to parse multipart form"}`, http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error":"No file uploaded. Field name must be 'file'"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, `{"error":"Failed to read uploaded file"}`, http.StatusInternalServerError)
		return
	}

	// Detect MIME type
	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" || mimeType == "application/octet-stream" {
		mimeType = detectMIME(header.Filename, fileBytes)
	}

	b64Data := base64.StdEncoding.EncodeToString(fileBytes)

	// Build Gemini request
	prompt := `You are an academic grade extractor. Analyze this marksheet document and extract ALL student exam grades.

Return ONLY a valid JSON array. Each element must have exactly these keys:
- "subject": string (e.g. "Mathematics", "Physics", "English")
- "examName": string (e.g. "Midterm", "Final Exam", "Unit Test 2")
- "score": number (the marks obtained)
- "maxScore": number (the maximum possible marks; default 100 if not shown)

Rules:
- Do NOT wrap output in markdown code fences.
- Do NOT include explanatory text.
- If a subject appears multiple times with different exams, include each as a separate entry.
- Infer maxScore from context (e.g. "90/100" → score=90, maxScore=100).
- If only a score is visible with no max, use maxScore=100.

Example output:
[{"subject":"Mathematics","examName":"Midterm","score":87,"maxScore":100},{"subject":"Physics","examName":"Final","score":72,"maxScore":100}]`

	reqBody := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
					{InlineData: &geminiInline{MimeType: mimeType, Data: b64Data}},
				},
			},
		},
	}

	bodyJSON, err := json.Marshal(reqBody)
	if err != nil {
		http.Error(w, `{"error":"Failed to build Gemini request"}`, http.StatusInternalServerError)
		return
	}

	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=%s",
		apiKey,
	)
	resp, err := http.Post(url, "application/json", bytes.NewReader(bodyJSON))
	if err != nil {
		http.Error(w, `{"error":"Failed to contact Gemini API"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)

	var geminiResp geminiResponse
	if err := json.Unmarshal(respBytes, &geminiResp); err != nil {
		http.Error(w, `{"error":"Failed to parse Gemini response"}`, http.StatusInternalServerError)
		return
	}

	if geminiResp.Error != nil {
		errMsg, _ := json.Marshal(map[string]string{"error": geminiResp.Error.Message})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		w.Write(errMsg)
		return
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		http.Error(w, `{"error":"Gemini returned no content"}`, http.StatusBadGateway)
		return
	}

	rawText := geminiResp.Candidates[0].Content.Parts[0].Text

	// Strip accidental markdown fences
	cleanText := strings.TrimSpace(rawText)
	if strings.HasPrefix(cleanText, "```") {
		cleanText = strings.TrimPrefix(cleanText, "```json")
		cleanText = strings.TrimPrefix(cleanText, "```")
		cleanText = strings.TrimSuffix(cleanText, "```")
		cleanText = strings.TrimSpace(cleanText)
	}

	// Validate it is a JSON array of grades
	var grades []ParsedGrade
	if err := json.Unmarshal([]byte(cleanText), &grades); err != nil {
		// Return raw text so front-end can surface the issue
		http.Error(w, fmt.Sprintf(`{"error":"AI response was not valid JSON: %s"}`, err.Error()), http.StatusUnprocessableEntity)
		return
	}

	// Sanitise values
	for i := range grades {
		if grades[i].Subject == "" {
			grades[i].Subject = "General"
		}
		if grades[i].ExamName == "" {
			grades[i].ExamName = "Assessment"
		}
		if grades[i].MaxScore <= 0 {
			grades[i].MaxScore = 100
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(grades)
}

// detectMIME guesses a MIME type from the file name extension and file magic bytes.
func detectMIME(filename string, data []byte) string {
	lower := strings.ToLower(filename)
	switch {
	case strings.HasSuffix(lower, ".pdf"):
		return "application/pdf"
	case strings.HasSuffix(lower, ".xlsx"):
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case strings.HasSuffix(lower, ".xls"):
		return "application/vnd.ms-excel"
	case strings.HasSuffix(lower, ".csv"), strings.HasSuffix(lower, ".txt"):
		return "text/plain"
	case strings.HasSuffix(lower, ".png"):
		return "image/png"
	case strings.HasSuffix(lower, ".jpg"), strings.HasSuffix(lower, ".jpeg"):
		return "image/jpeg"
	case strings.HasSuffix(lower, ".webp"):
		return "image/webp"
	}
	// Fall back to sniffing first 512 bytes
	return http.DetectContentType(data[:min512(data)])
}

func min512(b []byte) int {
	if len(b) < 512 {
		return len(b)
	}
	return 512
}
