# QA Test Plan - FundFlow CRM
## תוכנית בדיקות מקיפה לפני העלייה ל-Production

### תאריך: 26 יוני 2025
### גרסה: Production Ready Testing

---

## 1. סקירה כללית

מטרת התוכנית: לוודא תקינות מלאה של המערכת לפני העלייה ל-Production
היקף הבדיקות: AI Functionality, Database Connections, API Integration, Frontend-Backend Communication, End-to-End User Flows

---

## 2. תרחישי בדיקה (Test Cases)

### 2.1 בדיקות פונקציונליות AI

#### 2.1.1 בדיקת צ'אטבוט
- [ ] **TC-AI-001**: בדיקת תקשורת בסיסית עם הצ'אטבוט
  - צעדים: פתיחת דף הצ'אטבוט ושליחת הודעה פשוטה
  - תוצאה צפויה: הבוט מגיב בתוך 5 שניות
  - סטטוס: ⏳ לא נבדק
  
- [ ] **TC-AI-002**: בדיקת שימוש בקונטקסט מבסיס הנתונים
  - צעדים: שאלה על נתונים ספציפיים שקיימים ב-DB
  - תוצאה צפויה: הבוט מחזיר מידע מדויק מה-DB
  - סטטוס: ⏳ לא נבדק

- [ ] **TC-AI-003**: בדיקת טיפול בשגיאות AI
  - צעדים: שליחת בקשה כשה-API key לא תקין
  - תוצאה צפויה: הודעת שגיאה ידידותית למשתמש
  - סטטוס: ⏳ לא נבדק

#### 2.1.2 בדיקת AI Agents
- [ ] **TC-AI-004**: בדיקת Document Analysis Agent
- [ ] **TC-AI-005**: בדיקת Risk Scoring Agent  
- [ ] **TC-AI-006**: בדיקת Contract Generation Agent
- [ ] **TC-AI-007**: בדיקת Intake Parser Agent
- [ ] **TC-AI-008**: בדיקת Communication Drafting Agent

### 2.2 בדיקות בסיס נתונים (Database)

#### 2.2.1 CRUD Operations - Plaintiffs
- [ ] **TC-DB-001**: יצירת תובע חדש
- [ ] **TC-DB-002**: קריאת נתוני תובע
- [ ] **TC-DB-003**: עדכון נתוני תובע
- [ ] **TC-DB-004**: מחיקת תובע

#### 2.2.2 CRUD Operations - Employees  
- [ ] **TC-DB-005**: יצירת עובד חדש
- [ ] **TC-DB-006**: קריאת נתוני עובד
- [ ] **TC-DB-007**: עדכון נתוני עובד
- [ ] **TC-DB-008**: מחיקת עובד

#### 2.2.3 CRUD Operations - Documents
- [ ] **TC-DB-009**: העלאת מסמך חדש
- [ ] **TC-DB-010**: קריאת מסמך
- [ ] **TC-DB-011**: עדכון מטא-דאטה של מסמך
- [ ] **TC-DB-012**: מחיקת מסמך

#### 2.2.4 CRUD Operations - Communications
- [ ] **TC-DB-013**: יצירת תקשורת חדשה
- [ ] **TC-DB-014**: קריאת היסטוריית תקשורת
- [ ] **TC-DB-015**: עדכון סטטוס תקשורת
- [ ] **TC-DB-016**: מחיקת תקשורת

#### 2.2.5 CRUD Operations - Law Firms
- [ ] **TC-DB-017**: יצירת משרד עורכי דין חדש
- [ ] **TC-DB-018**: קריאת נתוני משרד עורכי דין
- [ ] **TC-DB-019**: עדכון נתוני משרד עורכי דין
- [ ] **TC-DB-020**: מחיקת משרד עורכי דין

### 2.3 בדיקות API Endpoints

#### 2.3.1 Plaintiffs API
- [ ] **TC-API-001**: GET /api/plaintiffs (קבלת רשימת תובעים)
- [ ] **TC-API-002**: POST /api/plaintiffs (יצירת תובע חדש)
- [ ] **TC-API-003**: PUT /api/plaintiffs/{id} (עדכון תובע)
- [ ] **TC-API-004**: DELETE /api/plaintiffs/{id} (מחיקת תובע)
- [ ] **TC-API-005**: בדיקת validation errors

#### 2.3.2 Documents API
- [ ] **TC-API-006**: POST /api/documents (העלאת מסמך)
- [ ] **TC-API-007**: GET /api/documents/{id} (הורדת מסמך)
- [ ] **TC-API-008**: GET /api/documents (רשימת מסמכים)
- [ ] **TC-API-009**: DELETE /api/documents/{id} (מחיקת מסמך)

#### 2.3.3 AI Agents API
- [ ] **TC-API-010**: POST /api/ai-agents/chatbot (צ'אטבוט)
- [ ] **TC-API-011**: POST /api/ai-agents/document-analysis (ניתוח מסמכים)
- [ ] **TC-API-012**: POST /api/ai-agents/risk-scoring (ניקוד סיכונים)

#### 2.3.4 Communications API
- [ ] **TC-API-013**: GET /api/communications (רשימת תקשורות)
- [ ] **TC-API-014**: POST /api/communications (יצירת תקשורת חדשה)
- [ ] **TC-API-015**: PUT /api/communications/{id} (עדכון תקשורת)

### 2.4 בדיקות End-to-End

#### 2.4.1 תרחיש משתמש מלא - Client Intake
- [ ] **TC-E2E-001**: מילוי טופס קליטת לקוח חדש
- [ ] **TC-E2E-002**: העלאת מסמכים רלוונטיים
- [ ] **TC-E2E-003**: ניתוח אוטומטי של המסמכים
- [ ] **TC-E2E-004**: יצירת דוח סיכונים
- [ ] **TC-E2E-005**: שליחת הודעת אישור ללקוח

#### 2.4.2 תרחיש Case Management
- [ ] **TC-E2E-006**: יצירת תיק חדש
- [ ] **TC-E2E-007**: הקצאת תיק לעובד
- [ ] **TC-E2E-008**: עדכון סטטוס התיק
- [ ] **TC-E2E-009**: יצירת תקשורת עם הלקוח
- [ ] **TC-E2E-010**: יצירת חוזה אוטומטי

#### 2.4.3 תרחיש Communication Hub
- [ ] **TC-E2E-011**: שליחת הודעה ללקוח
- [ ] **TC-E2E-012**: קבלת תגובה מהלקוח
- [ ] **TC-E2E-013**: עדכון היסטוריית התקשורת
- [ ] **TC-E2E-014**: יצירת תזכורת מעקב

### 2.5 בדיקות ביצועים ויציבות

#### 2.5.1 בדיקות עומס
- [ ] **TC-PERF-001**: טעינת דף ראשי תחת עומס
- [ ] **TC-PERF-002**: ביצועי API תחת מספר בקשות מקבילות
- [ ] **TC-PERF-003**: זמן תגובת צ'אטבוט תחת עומס

#### 2.5.2 בדיקות זיכרון ומשאבים
- [ ] **TC-PERF-004**: ניטור זיכרון בעת עבודה ממושכת
- [ ] **TC-PERF-005**: בדיקת דליפות זיכרון ב-Frontend
- [ ] **TC-PERF-006**: ביצועי בסיס הנתונים

### 2.6 בדיקות אבטחה

#### 2.6.1 Authentication & Authorization
- [ ] **TC-SEC-001**: בדיקת הגנה על endpoints מוגנים
- [ ] **TC-SEC-002**: בדיקת תוקף טוקנים
- [ ] **TC-SEC-003**: בדיקת הרשאות משתמשים

#### 2.6.2 Input Validation
- [ ] **TC-SEC-004**: בדיקת SQL Injection
- [ ] **TC-SEC-005**: בדיקת XSS
- [ ] **TC-SEC-006**: בדיקת CSRF Protection

---

## 3. Environment Setup & Prerequisites

### 3.1 סביבת הבדיקה
- Frontend URL: [לקבוע]
- Backend URL: [לקבוע]  
- Database: Supabase Production/Staging
- AI Services: OpenAI API, Google AI

### 3.2 נתונים לבדיקה
- משתמשי בדיקה
- נתוני דמה
- מסמכים לבדיקה
- API Keys

---

## 4. Exit Criteria

המערכת תיחשב מוכנה ל-Production כאשר:
- [ ] 100% מהבדיקות הקריטיות עברו בהצלחה
- [ ] 95% מכלל הבדיקות עברו בהצלחה
- [ ] כל הבאגים בחומרה High/Critical תוקנו
- [ ] בדיקות הביצועים עומדות בדרישות
- [ ] בדיקות האבטחה עברו בהצלחה

---

## 5. סיכום ביצוע הבדיקות

### התקדמות כללית
- סה"כ בדיקות: 0/66
- עברו בהצלחה: 0
- נכשלו: 0
- לא נבדקו: 66

### בעיות שנמצאו
[יתעדכן במהלך הבדיקות]

### המלצות
[יתעדכן בסיום הבדיקות]

---

*מעודכן לאחרונה: 26/06/2025*
