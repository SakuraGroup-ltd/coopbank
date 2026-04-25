/**
 * CoopBank Website Project Tracker - Google Apps Script
 * =====================================================
 *
 * HOW TO USE:
 * 1. Open Google Sheets → create new spreadsheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire file → Save
 * 4. Run → setupProjectTracker()
 * 5. Authorize when prompted
 *
 * FEATURES:
 * - Dashboard: Live summary with progress bars & milestone stats
 * - Tasks: Main tracker with status dropdowns, tags, dependencies
 * - Subtasks: Detailed checklist per task
 * - Gantt: Auto-generated timeline visualization
 * - Activity Log: Auto-tracks every status change with timestamp
 */

// ===== CONFIGURATION =====
const PROJECT_CODE = "SG-2026-0101";
const PROJECT_NAME = "CoopBank Website Redesign";
const CLIENT = "Cooperative Bank Tanzania Plc.";

// ===== MAIN SETUP =====
function setupProjectTracker() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename(`${PROJECT_CODE} — ${PROJECT_NAME}`);

  // Create sheets
  createDashboard(ss);
  createTasksSheet(ss);
  createSubtasksSheet(ss);
  createGanttSheet(ss);
  createActivityLog(ss);
  createStakeholders(ss);

  // Remove default Sheet1
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  // Set Dashboard as active
  ss.setActiveSheet(ss.getSheetByName("Dashboard"));

  // Install trigger for activity logging
  installTrigger();

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert("Project tracker built successfully!\n\nSheets created:\n• Dashboard\n• Tasks\n• Subtasks\n• Gantt\n• Activity Log\n• Stakeholders");
}

// ===== DASHBOARD =====
function createDashboard(ss) {
  let sheet = ss.getSheetByName("Dashboard");
  if (!sheet) sheet = ss.insertSheet("Dashboard", 0);
  sheet.clear();

  // Colors
  const navy = "#0D3875";
  const green = "#1A8A3A";
  const lightBg = "#F8FAFC";
  const headerBg = "#E2E8F0";

  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 200);

  // Title
  sheet.getRange("B1").setValue(PROJECT_NAME).setFontSize(18).setFontWeight("bold").setFontColor(navy);
  sheet.getRange("B2").setValue(`${PROJECT_CODE} | ${CLIENT}`).setFontSize(11).setFontColor("#64748B");
  sheet.getRange("B3").setValue(`Last updated: =NOW()`).setFontSize(9).setFontColor("#94A3B8");
  sheet.getRange("B3").setFormula('="Last updated: "&TEXT(NOW(),"dd MMM yyyy, HH:mm")');

  // Summary Cards Row
  const cardRow = 5;
  const cardLabels = ["Total Tasks", "Completed", "In Progress", "Blocked / Awaiting", "Completion %"];
  const cardFormulas = [
    '=COUNTA(Tasks!A3:A200)',
    '=COUNTIF(Tasks!E3:E200,"Complete")',
    '=COUNTIF(Tasks!E3:E200,"In Progress")',
    '=COUNTIF(Tasks!E3:E200,"Blocked")+COUNTIF(Tasks!E3:E200,"Awaiting Client")',
    '=IFERROR(ROUND(COUNTIF(Tasks!E3:E200,"Complete")/COUNTA(Tasks!E3:E200)*100,1)&"%","0%")'
  ];

  for (let i = 0; i < cardLabels.length; i++) {
    const col = i + 2;
    sheet.getRange(cardRow, col).setValue(cardLabels[i]).setFontSize(9).setFontColor("#64748B").setFontWeight("bold");
    sheet.getRange(cardRow + 1, col).setFormula(cardFormulas[i]).setFontSize(22).setFontWeight("bold").setFontColor(navy);
    sheet.getRange(cardRow, col, 2, 1).setBackground(lightBg);
  }

  // Milestone Progress Table
  const milestoneStart = 9;
  sheet.getRange(milestoneStart - 1, 2).setValue("Milestone Progress").setFontSize(14).setFontWeight("bold").setFontColor(navy);

  const milestoneHeaders = ["Milestone", "Total", "Done", "In Progress", "Blocked", "Progress", "Status"];
  sheet.getRange(milestoneStart, 2, 1, milestoneHeaders.length).setValues([milestoneHeaders])
    .setFontWeight("bold").setBackground(navy).setFontColor("white").setFontSize(10);

  const milestones = [
    "PM & Admin",
    "Discovery & Planning",
    "Design & Build",
    "Client Review & Revisions",
    "Content & Localization",
    "Testing & QA",
    "Go-Live & Handover"
  ];

  for (let i = 0; i < milestones.length; i++) {
    const row = milestoneStart + 1 + i;
    const ms = milestones[i];
    sheet.getRange(row, 2).setValue(ms);
    sheet.getRange(row, 3).setFormula(`=COUNTIF(Tasks!C3:C200,"${ms}")`);
    sheet.getRange(row, 4).setFormula(`=COUNTIFS(Tasks!C3:C200,"${ms}",Tasks!E3:E200,"Complete")`);
    sheet.getRange(row, 5).setFormula(`=COUNTIFS(Tasks!C3:C200,"${ms}",Tasks!E3:E200,"In Progress")`);
    sheet.getRange(row, 6).setFormula(`=COUNTIFS(Tasks!C3:C200,"${ms}",Tasks!E3:E200,"Blocked")+COUNTIFS(Tasks!C3:C200,"${ms}",Tasks!E3:E200,"Awaiting Client")`);
    sheet.getRange(row, 7).setFormula(`=IFERROR(ROUND(${getCellA1(row,4)}/${getCellA1(row,3)}*100,0)&"%","0%")`);
    sheet.getRange(row, 8).setFormula(`=IF(${getCellA1(row,7)}="100%","Done",IF(${getCellA1(row,5)}>0,"Active",IF(${getCellA1(row,6)}>0,"Blocked","Pending")))`);

    const bg = i % 2 === 0 ? "#F8FAFC" : "white";
    sheet.getRange(row, 2, 1, milestoneHeaders.length).setBackground(bg);
  }

  // Dependencies / Blockers Summary
  const depStart = milestoneStart + milestones.length + 3;
  sheet.getRange(depStart - 1, 2).setValue("Items Blocked on Client").setFontSize(14).setFontWeight("bold").setFontColor("#DC2626");
  sheet.getRange(depStart, 2, 1, 4).setValues([["Task", "Tag", "Status", "Blocker Description"]])
    .setFontWeight("bold").setBackground("#FEE2E2").setFontColor("#991B1B").setFontSize(10);

  // This will auto-populate from Tasks sheet via FILTER
  sheet.getRange(depStart + 1, 2).setFormula('=IFERROR(FILTER(Tasks!B3:B200, Tasks!E3:E200="Awaiting Client"), "No items awaiting client")');
  sheet.getRange(depStart + 1, 3).setFormula('=IFERROR(FILTER(Tasks!F3:F200, Tasks!E3:E200="Awaiting Client"), "")');
  sheet.getRange(depStart + 1, 4).setFormula('=IFERROR(FILTER(Tasks!E3:E200, Tasks!E3:E200="Awaiting Client"), "")');
  sheet.getRange(depStart + 1, 5).setFormula('=IFERROR(FILTER(Tasks!K3:K200, Tasks!E3:E200="Awaiting Client"), "")');

  sheet.setFrozenRows(0);
  sheet.setTabColor("#0D3875");
}

function getCellA1(row, col) {
  const colLetter = String.fromCharCode(64 + col);
  return `${colLetter}${row}`;
}

// ===== TASKS SHEET (Main Tracker) =====
function createTasksSheet(ss) {
  let sheet = ss.getSheetByName("Tasks");
  if (!sheet) sheet = ss.insertSheet("Tasks", 1);
  sheet.clear();

  const navy = "#0D3875";

  // Headers
  const headers = [
    "ID", "Task Name", "Milestone", "Owner", "Status", "Tags",
    "Priority", "Start Date", "Due Date", "Subtasks", "Dependencies / Notes"
  ];

  sheet.getRange(1, 1).setValue(`${PROJECT_CODE} — Task Tracker`).setFontSize(14).setFontWeight("bold").setFontColor(navy);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground(navy).setFontColor("white").setFontSize(10).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Column widths
  const widths = [45, 350, 200, 180, 130, 160, 80, 100, 100, 90, 350];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Task Data
  const tasks = [
    // PM & Admin
    [77, "Weekly Client Status Update (CoopBank)", "PM & Admin", "Neema", "Awaiting Feedback", "Recurring", "High", "2026-03-18", "2026-04-25", "", "Weekly cadence"],
    [78, "Invoice Preparation & Payment Follow-up", "PM & Admin", "Neema", "Not Started", "Finance", "High", "2026-03-20", "2026-04-25", "", "40% commencement due"],
    [79, "Project Timeline & Risk Management", "PM & Admin", "Neema", "Awaiting Feedback", "PM", "High", "2026-03-18", "2026-04-25", "", ""],
    [80, "Client Communication & Meeting Coordination", "PM & Admin", "Neema", "Awaiting Feedback", "PM", "High", "2026-03-18", "2026-04-25", "", ""],
    [81, "Contract & Scope Documentation", "PM & Admin", "Neema", "Awaiting Feedback", "Legal", "High", "2026-03-20", "2026-03-22", "", ""],

    // Discovery & Planning
    [48, "Discovery & Stakeholder Requirements", "Discovery & Planning", "Jumbe + Neema", "Complete", "Research", "Medium", "2026-03-06", "2026-03-08", "", ""],
    [49, "Competitor Analysis (NMB, CRDB, NBC, Stanbic)", "Discovery & Planning", "Jumbe + Neema", "Complete", "Research", "Medium", "2026-03-07", "2026-03-09", "", ""],
    [50, "Sitemap & Information Architecture", "Discovery & Planning", "Jumbe + Neema", "Complete", "UX", "Medium", "2026-03-08", "2026-03-10", "", ""],
    [51, "Brand Asset Collection", "Discovery & Planning", "Neema", "Complete", "Design", "Medium", "2026-03-08", "2026-03-11", "", ""],
    [52, "Content Audit & Copywriting", "Discovery & Planning", "Jumbe + Neema", "Complete", "Content", "Medium", "2026-03-09", "2026-03-14", "", ""],

    // Design & Build
    [53, "Next.js Project Setup & Architecture", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-12", "2026-03-13", "", ""],
    [54, "Homepage Build (Hero, Forex Ticker, Products, Stats)", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-13", "2026-03-15", "", ""],
    [55, "Personal Banking & Loan Products Pages", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-15", "2026-03-16", "", ""],
    [56, "Digital Banking Pages (CoopNet, CoopWakala, USSD, QR Pay)", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-16", "2026-03-17", "", ""],
    [57, "About Us, Board & Management Pages", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-17", "2026-03-18", "", ""],
    [58, "Tenders, Whistleblower, Careers Pages", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-17", "2026-03-17", "", ""],
    [59, "Navbar, Footer & Shared Components", "Design & Build", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-14", "2026-03-18", "", ""],
    [60, "Mshirika AI Chatbot Integration", "Design & Build", "Jumbe + Neema", "Complete", "AI", "Medium", "2026-03-18", "2026-03-18", "", ""],
    [61, "GA4 Analytics & Staging Deployment", "Design & Build", "Jumbe + Neema", "Complete", "DevOps", "Medium", "2026-03-17", "2026-03-18", "", ""],

    // Client Review & Revisions
    [62, "Submit First Draft to CoopBank Marketing", "Client Review & Revisions", "Jumbe + Neema", "Complete", "Milestone", "Medium", "2026-03-18", "2026-03-18", "", "Sent to Oscar Rubasha"],
    [63, "Collect Client Feedback (Round 1)", "Client Review & Revisions", "Neema", "Complete", "Client", "High", "2026-03-18", "2026-03-25", "", "Received 2026-03-26"],
    [64, "Implement Design Revisions (Round 1)", "Client Review & Revisions", "Jumbe + Neema", "Complete", "Dev", "Medium", "2026-03-25", "2026-03-29", "", "Colors, forex, products, cards, content"],
    [65, "Collect Client Feedback (Round 2)", "Client Review & Revisions", "Neema", "Not Started", "Client", "Medium", "2026-03-29", "2026-04-01", "", "After pending builds complete"],
    [109, "Implement Design Revisions (Round 2)", "Client Review & Revisions", "", "Not Started", "Dev", "Medium", "", "", "", "Depends on: Round 2 feedback"],
    [110, "Collect Client Feedback (Round 3 - Final)", "Client Review & Revisions", "", "Not Started", "Client", "Medium", "", "", "", "Final review before QA"],
    [111, "Implement Final Revisions (Round 3)", "Client Review & Revisions", "", "Not Started", "Dev", "Medium", "", "", "", "Last code changes before testing"],

    // Build tasks
    [82, "Build: Business Banking Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-25", "2026-03-27", "0/10", ""],
    [83, "Build: Contact Us Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-25", "2026-03-26", "0/10", "Needs: email domain confirmation (#113)"],
    [84, "Build: FAQs Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-26", "2026-03-27", "0/13", ""],
    [85, "Build: Blog / News & Updates Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-27", "2026-03-29", "0/10", ""],
    [86, "Build: Privacy Policy & Terms Pages", "Client Review & Revisions", "Neema", "Not Started", "Build, Legal", "Medium", "2026-03-27", "2026-03-28", "0/8", "Needs: approved legal content from CBT"],
    [87, "Build: Cookie Consent Banner", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-28", "2026-03-28", "0/9", ""],
    [89, "Figma Design System: Complete & Deliver", "Client Review & Revisions", "Jumbe", "Not Started", "Design", "Low", "2026-03-29", "2026-04-03", "", "Deliverable to client"],
    [90, "Figma: Component Library & Style Guide", "Client Review & Revisions", "Jumbe", "Not Started", "Design", "Medium", "2026-04-01", "2026-04-03", "", ""],

    // Awaiting Client items
    [112, "Awaiting: Official Product Master List", "Client Review & Revisions", "Oscar (CBT)", "Awaiting Client", "Blocker, Products", "Critical", "", "", "0/7", "Product names mismatch: Msomi vs Wanafunzi, Mafao etc."],
    [113, "Awaiting: Email Domain Confirmation", "Client Review & Revisions", "CBT IT", "Awaiting Client", "Blocker, Config", "Critical", "", "", "0/8", "@coopbank.co.tz vs @cbtbank.co.tz — blocks all email refs"],
    [114, "Awaiting: Brand Guide / Visual Reference", "Client Review & Revisions", "CBT Marketing", "Awaiting Client", "Blocker, Design", "High", "", "", "0/9", "Dashed white styling unclear without brand guide"],
    [115, "Awaiting: About Us Content (Bank-Approved)", "Client Review & Revisions", "Oscar (CBT)", "Awaiting Client", "Blocker, Content", "Critical", "", "", "0/11", "Mission, Vision, Values, Our Story — must be bank-approved"],
    [116, "Awaiting: Account Opening CTAs", "Client Review & Revisions", "CBT Ops", "Awaiting Client", "Blocker, UX", "Critical", "", "", "0/12", "Where do Open Account buttons link? URL/PDF/external?"],
    [117, "Awaiting: Agent Application Form", "Client Review & Revisions", "CBT Ops", "Awaiting Client", "Blocker, UX", "High", "", "", "0/7", "Apply to Become Agent destination unknown"],

    // Content & Localization
    [66, "Swahili Translation - All Pages", "Content & Localization", "Neema", "Not Started", "i18n", "Medium", "2026-04-01", "2026-04-07", "0/15", "i18n framework + all page translations"],
    [67, "Branch Directory with Google Maps", "Content & Localization", "Jumbe + Neema", "Not Started", "Build, Maps", "Medium", "2026-04-03", "2026-04-06", "0/10", "Needs: branch data from CBT"],
    [68, "Final Content Population & Media", "Content & Localization", "Neema", "Not Started", "Content", "Medium", "2026-04-05", "2026-04-08", "0/10", "All photos, copy, media finalized"],
    [69, "Blog/News Section Setup", "Content & Localization", "Jumbe + Neema", "Not Started", "Build", "Medium", "2026-04-07", "2026-04-09", "", ""],
    [88, "Branch Locator: Google Maps Integration", "Content & Localization", "Jumbe", "Not Started", "Build, Maps", "Medium", "2026-04-03", "2026-04-06", "", "Depends on: branch data + #67"],
    [91, "API Discovery: Map CoopBank Backend Endpoints", "Content & Localization", "Jumbe", "Not Started", "API", "High", "2026-04-01", "2026-04-05", "", "Critical path — unblocks all API integrations"],
    [92, "API Integration: Forex Rates (Live Feed)", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-05", "2026-04-07", "", "Depends on: #91 + forex data source (#120)"],
    [93, "API Integration: Loan Calculator Parameters", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-05", "2026-04-07", "", "Depends on: #91"],
    [94, "API Integration: Careers & Tenders (Dynamic)", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-07", "2026-04-09", "", "Depends on: #91"],
    [95, "API Integration: Branch Data (Dynamic)", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-06", "2026-04-08", "", "Depends on: #91 + #118"],

    // Awaiting Client - Content
    [118, "Awaiting: Agent Database for Wakala Locator", "Content & Localization", "CBT Ops", "Awaiting Client", "Blocker, Data", "Critical", "", "", "0/13", "Agent Name | Location | Contact — blocks Wakala locator"],
    [119, "Awaiting: POS Services List", "Content & Localization", "CBT Digital", "Awaiting Client", "Blocker, Content", "Critical", "", "", "0/9", "All Wakala POS services for display"],
    [120, "Awaiting: Forex Rate Data Source", "Content & Localization", "CBT Treasury", "Awaiting Client", "Blocker, API", "High", "", "", "0/11", "API endpoint or manual update process?"],
    [121, "Awaiting: Cards & Payments Specs", "Content & Localization", "CBT Marketing", "Awaiting Client", "Blocker, Content", "High", "", "", "0/10", "Visa Prepaid features, limits, fees"],
    [122, "Awaiting: Treasury/FX Page Decision", "Content & Localization", "CBT Mgmt", "Awaiting Client", "Blocker, Scope", "Medium", "", "", "0/7", "Separate page needed? Content?"],
    [123, "Awaiting: Investors/Corp Governance", "Content & Localization", "CBT Mgmt", "Awaiting Client", "Blocker, Scope", "Medium", "", "", "0/11", "Ready for launch? Annual reports?"],

    // Testing & QA
    [70, "Cross-Browser & Mobile Testing", "Testing & QA", "Jumbe + Neema", "Not Started", "QA", "Medium", "2026-04-10", "2026-04-12", "0/12", "Chrome, Safari, Firefox, Edge, Samsung Internet"],
    [71, "SEO & Performance Optimization", "Testing & QA", "Jumbe", "Not Started", "SEO", "Medium", "2026-04-10", "2026-04-13", "0/12", "Lighthouse 90+, Core Web Vitals, schema markup"],
    [72, "Security Hardening & BOT Compliance", "Testing & QA", "Jumbe", "Not Started", "Security", "High", "2026-04-13", "2026-04-15", "0/10", "OWASP, CSP, Bank of Tanzania compliance"],
    [73, "UAT with CoopBank IT & Marketing", "Testing & QA", "Jumbe + Neema", "Not Started", "UAT, Client", "High", "2026-04-15", "2026-04-17", "0/10", "Needs sign-off from both IT and Marketing"],

    // Go-Live & Handover
    [74, "DNS Migration & Production Go-Live", "Go-Live & Handover", "Jumbe", "Not Started", "DevOps", "Critical", "2026-04-17", "2026-04-19", "0/11", "Needs: DNS access from CBT IT"],
    [75, "Staff Training Session", "Go-Live & Handover", "Jumbe + Neema", "Not Started", "Training", "Medium", "2026-04-19", "2026-04-21", "0/10", "CMS, blog, forex updates, analytics"],
    [76, "Post-Launch Monitoring (30 Days)", "Go-Live & Handover", "Jumbe", "Not Started", "Support", "Medium", "2026-04-21", "2026-05-19", "0/11", "Uptime, errors, analytics, handover"],
  ];

  // Write data
  if (tasks.length > 0) {
    sheet.getRange(3, 1, tasks.length, headers.length).setValues(tasks);
  }

  // Data validation - Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Started", "In Progress", "Complete", "Awaiting Client", "Awaiting Feedback", "Blocked", "Testing", "On Hold"])
    .setAllowInvalid(false).build();
  sheet.getRange(3, 5, 100, 1).setDataValidation(statusRule);

  // Data validation - Priority dropdown
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Critical", "High", "Medium", "Low"])
    .setAllowInvalid(false).build();
  sheet.getRange(3, 7, 100, 1).setDataValidation(priorityRule);

  // Data validation - Milestone dropdown
  const milestoneRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["PM & Admin", "Discovery & Planning", "Design & Build", "Client Review & Revisions", "Content & Localization", "Testing & QA", "Go-Live & Handover"])
    .setAllowInvalid(false).build();
  sheet.getRange(3, 3, 100, 1).setDataValidation(milestoneRule);

  // Conditional formatting - Status colors
  const statusColors = [
    { status: "Complete", bg: "#DCFCE7", text: "#166534" },
    { status: "In Progress", bg: "#DBEAFE", text: "#1E40AF" },
    { status: "Not Started", bg: "#F1F5F9", text: "#475569" },
    { status: "Awaiting Client", bg: "#FEF3C7", text: "#92400E" },
    { status: "Awaiting Feedback", bg: "#FEF9C3", text: "#854D0E" },
    { status: "Blocked", bg: "#FEE2E2", text: "#991B1B" },
    { status: "Testing", bg: "#F3E8FF", text: "#6B21A8" },
    { status: "On Hold", bg: "#F1F5F9", text: "#64748B" },
  ];

  const statusRange = sheet.getRange("E3:E200");
  statusColors.forEach(({ status, bg, text }) => {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(bg)
      .setFontColor(text)
      .setRanges([statusRange])
      .build();
    const rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  });

  // Conditional formatting - Priority colors
  const priorityColors = [
    { priority: "Critical", bg: "#FEE2E2", text: "#991B1B" },
    { priority: "High", bg: "#FEF3C7", text: "#92400E" },
    { priority: "Medium", bg: "#F1F5F9", text: "#475569" },
    { priority: "Low", bg: "#F8FAFC", text: "#94A3B8" },
  ];

  const priorityRange = sheet.getRange("G3:G200");
  priorityColors.forEach(({ priority, bg, text }) => {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(priority)
      .setBackground(bg)
      .setFontColor(text)
      .setRanges([priorityRange])
      .build();
    const rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  });

  // Freeze header rows
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(2);

  // Alternating colors for readability
  sheet.getRange(3, 1, tasks.length, headers.length).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  sheet.setTabColor("#1A8A3A");
}

// ===== SUBTASKS SHEET =====
function createSubtasksSheet(ss) {
  let sheet = ss.getSheetByName("Subtasks");
  if (!sheet) sheet = ss.insertSheet("Subtasks", 2);
  sheet.clear();

  const navy = "#0D3875";

  const headers = ["Task ID", "Task Name", "Subtask", "Done?", "Assigned To", "Notes"];
  sheet.getRange(1, 1).setValue("Subtask Details").setFontSize(14).setFontWeight("bold").setFontColor(navy);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground(navy).setFontColor("white").setFontSize(10);

  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 450);
  sheet.setColumnWidth(4, 60);
  sheet.setColumnWidth(5, 140);
  sheet.setColumnWidth(6, 250);

  // Subtask data - all checklist items from CRM
  const subtasks = [
    // Task 66 - Swahili Translation
    [66, "Swahili Translation - All Pages", "Set up i18n framework (next-intl or custom EN/SW toggle)", false, "", ""],
    [66, "", "Translate Homepage content to Swahili", false, "", ""],
    [66, "", "Translate Personal Banking page to Swahili", false, "", ""],
    [66, "", "Translate Digital Banking page to Swahili", false, "", ""],
    [66, "", "Translate Loan Products page to Swahili", false, "", ""],
    [66, "", "Translate About Us page to Swahili", false, "", ""],
    [66, "", "Translate Business Banking page to Swahili", false, "", ""],
    [66, "", "Translate Contact, FAQs, Blog pages to Swahili", false, "", ""],
    [66, "", "Translate Careers, Tenders, Whistleblower pages to Swahili", false, "", ""],
    [66, "", "Translate Privacy Policy & Terms to Swahili", false, "", ""],
    [66, "", "Build language toggle component (EN/SW) in navbar", false, "", ""],
    [66, "", "Persist language preference in localStorage", false, "", ""],
    [66, "", "Test all pages in Swahili for layout issues", false, "", ""],
    [66, "", "Have native Swahili speaker review translations", false, "", ""],

    // Task 67 - Branch Directory
    [67, "Branch Directory with Google Maps", "Get complete branch list from CBT", false, "Neema", "BLOCKED on client"],
    [67, "", "Create branches data JSON file", false, "", ""],
    [67, "", "Build branch search by name, region, or city", false, "", ""],
    [67, "", "Build branch card component", false, "", ""],
    [67, "", "Integrate Google Maps with branch pins", false, "", ""],
    [67, "", "Add click-to-call phone numbers on mobile", false, "", ""],
    [67, "", "Add Get Directions link", false, "", ""],
    [67, "", "Add region filter dropdown", false, "", ""],
    [67, "", "Mobile responsive map and list view toggle", false, "", ""],
    [67, "", "Test with all branch locations plotted", false, "", ""],

    // Task 82 - Business Banking
    [82, "Build: Business Banking Page", "Design hero section with glassmorphism panel", false, "", ""],
    [82, "", "Build Business Current Account section (TZS, USD, EUR, GBP)", false, "", ""],
    [82, "", "Build Business Savings Account section", false, "", ""],
    [82, "", "Build Trade Finance section", false, "", ""],
    [82, "", "Build Cash Management section", false, "", ""],
    [82, "", "Build Payroll Services section", false, "", ""],
    [82, "", "Build Business Loans overview with CTA", false, "", ""],
    [82, "", "Add product comparison table", false, "", ""],
    [82, "", "Add Open Business Account CTA", false, "", "Pending: account opening destination"],
    [82, "", "Mobile responsive layout and testing", false, "", ""],

    // Task 83 - Contact Us
    [83, "Build: Contact Us Page", "Build hero section with contact cards", false, "", ""],
    [83, "", "Add phone: +255 27 275 4470", false, "", ""],
    [83, "", "Add email (pending domain confirmation)", false, "", "BLOCKED: #113"],
    [83, "", "Build contact form", false, "", ""],
    [83, "", "Add form validation and submission handler", false, "", ""],
    [83, "", "Embed Google Maps with HQ pin", false, "", ""],
    [83, "", "Add operating hours section", false, "", ""],
    [83, "", "Add social media links", false, "", ""],
    [83, "", "Add quick links to Branch/Agent Locator", false, "", ""],
    [83, "", "Mobile responsive layout", false, "", ""],

    // Task 84 - FAQs
    [84, "Build: FAQs Page", "Design FAQ layout with category tabs", false, "", ""],
    [84, "", "Create categories: General, Accounts, Digital, Loans, Cards, Wakala", false, "", ""],
    [84, "", "Build accordion components", false, "", ""],
    [84, "", "Write General FAQs", false, "", ""],
    [84, "", "Write Account FAQs", false, "", ""],
    [84, "", "Write Digital Banking FAQs", false, "", ""],
    [84, "", "Write Loans FAQs", false, "", ""],
    [84, "", "Write Cards FAQs", false, "", ""],
    [84, "", "Write Wakala FAQs", false, "", ""],
    [84, "", "Add search/filter functionality", false, "", ""],
    [84, "", "Add CTA to Contact Us", false, "", ""],
    [84, "", "SEO: FAQ schema markup (JSON-LD)", false, "", ""],
    [84, "", "Mobile responsive accordion", false, "", ""],

    // Task 85 - Blog
    [85, "Build: Blog / News Page", "Design blog listing with featured hero", false, "", ""],
    [85, "", "Build blog card grid", false, "", ""],
    [85, "", "Build individual blog post template", false, "", ""],
    [85, "", "Add category filter", false, "", ""],
    [85, "", "Add pagination or infinite scroll", false, "", ""],
    [85, "", "Add social sharing buttons", false, "", ""],
    [85, "", "Add related posts section", false, "", ""],
    [85, "", "Create 3-5 sample blog posts", false, "", ""],
    [85, "", "Add blog SEO metadata", false, "", ""],
    [85, "", "Mobile responsive layout", false, "", ""],

    // Task 86 - Privacy/Terms
    [86, "Build: Privacy & Terms Pages", "Request approved Privacy Policy from CBT legal", false, "Neema", "BLOCKED on client"],
    [86, "", "Request approved Terms of Service from CBT legal", false, "Neema", "BLOCKED on client"],
    [86, "", "Build Privacy Policy page with TOC", false, "", ""],
    [86, "", "Build Terms of Service page with TOC", false, "", ""],
    [86, "", "Add last updated date", false, "", ""],
    [86, "", "Add print-friendly styling", false, "", ""],
    [86, "", "Link from footer, cookie banner, forms", false, "", ""],
    [86, "", "Mobile readable typography", false, "", ""],

    // Task 87 - Cookie
    [87, "Build: Cookie Consent Banner", "Build banner component (bottom viewport)", false, "", ""],
    [87, "", "Add Accept/Reject/Customize buttons", false, "", ""],
    [87, "", "Build preferences modal", false, "", ""],
    [87, "", "Implement localStorage persistence", false, "", ""],
    [87, "", "Conditionally load GA4 based on consent", false, "", ""],
    [87, "", "Link to Privacy Policy", false, "", ""],
    [87, "", "Style to match brand", false, "", ""],
    [87, "", "Test on mobile", false, "", ""],
    [87, "", "Show on first visit, hide after choice", false, "", ""],

    // Awaiting items (key subtasks only)
    [112, "Awaiting: Product Master List", "Request official list from CBT marketing", false, "Neema", ""],
    [112, "", "Confirm Personal Banking Savings names", false, "", "Jasiri, Mafao, Msomi vs Wanafunzi"],
    [112, "", "Confirm Fixed Accounts names", false, "", ""],
    [112, "", "Confirm Group Accounts names", false, "", ""],
    [112, "", "Verify USD/EUR/GBP: real products or display?", false, "", ""],
    [112, "", "Update all product pages", false, "", "After confirmation"],
    [112, "", "Update mega menu with final categories", false, "", "After confirmation"],

    [113, "Awaiting: Email Domain", "Ask CBT which domain is official", false, "Neema", ""],
    [113, "", "Receive written confirmation", false, "", ""],
    [113, "", "Update Homepage footer email", false, "", ""],
    [113, "", "Update Contact Us page email", false, "", ""],
    [113, "", "Update all mailto: links", false, "", ""],
    [113, "", "Update careers email", false, "", ""],
    [113, "", "Update whistleblower email", false, "", ""],
    [113, "", "Full grep and replace all email refs", false, "", ""],

    [115, "Awaiting: About Us Content", "Request Our Story / History", false, "Neema", ""],
    [115, "", "Request Mission Statement", false, "", ""],
    [115, "", "Request Vision Statement", false, "", ""],
    [115, "", "Request Core Values with descriptions", false, "", ""],
    [115, "", "Request board of directors photos & bios", false, "", ""],
    [115, "", "Request management team photos & bios", false, "", ""],
    [115, "", "Build Our Story timeline section", false, "", "After content received"],
    [115, "", "Build Mission & Vision hero cards", false, "", "After content received"],
    [115, "", "Build Core Values grid with icons", false, "", "After content received"],
    [115, "", "Update photo gallery with real photos", false, "", "After content received"],
    [115, "", "Proofread and cross-check with client", false, "", ""],

    [116, "Awaiting: Account Opening CTAs", "Ask: external portal URL?", false, "Neema", ""],
    [116, "", "Ask: downloadable PDF form?", false, "", ""],
    [116, "", "Ask: email/phone process?", false, "", ""],
    [116, "", "Receive confirmed destination", false, "", ""],
    [116, "", "Update Homepage hero CTA", false, "", ""],
    [116, "", "Update Personal Banking CTAs", false, "", ""],
    [116, "", "Update Fixed Deposit CTA", false, "", ""],
    [116, "", "Update Group Accounts CTA", false, "", ""],
    [116, "", "Update Digital Banking CTA", false, "", ""],
    [116, "", "Update mobile app download links", false, "", ""],
    [116, "", "Test all CTAs desktop + mobile", false, "", ""],
    [116, "", "Verify no broken/placeholder links", false, "", ""],

    [118, "Awaiting: Agent Database", "Request from CBT ops (CSV/Excel)", false, "Neema", ""],
    [118, "", "Define format: Name | Location | Region | Contact | GPS", false, "", ""],
    [118, "", "Receive and validate data", false, "", ""],
    [118, "", "Clean and normalize (phone, spelling)", false, "", ""],
    [118, "", "Create agents JSON/API endpoint", false, "", ""],
    [118, "", "Build agent locator search UI", false, "", ""],
    [118, "", "Build agent card component", false, "", ""],
    [118, "", "Integrate Google Maps pins", false, "", ""],
    [118, "", "Add geolocation: Find Nearest Agent", false, "", ""],
    [118, "", "Add region filter dropdown", false, "", ""],
    [118, "", "Mobile responsive locator", false, "", ""],
    [118, "", "Test with sample data", false, "", ""],
    [118, "", "Populate with production data", false, "", ""],

    // Testing tasks
    [70, "Cross-Browser & Mobile Testing", "Chrome desktop + mobile", false, "", ""],
    [70, "", "Safari desktop + iOS", false, "", ""],
    [70, "", "Firefox desktop", false, "", ""],
    [70, "", "Edge desktop", false, "", ""],
    [70, "", "Samsung Internet Android", false, "", ""],
    [70, "", "Breakpoints: 320, 375, 414, 768, 1024, 1440", false, "", ""],
    [70, "", "Landscape orientation", false, "", ""],
    [70, "", "Fix overflow/truncation issues", false, "", ""],
    [70, "", "Test interactive elements", false, "", ""],
    [70, "", "Test mega menu all breakpoints", false, "", ""],
    [70, "", "Test Mshirika chatbot mobile", false, "", ""],
    [70, "", "Test forex ticker animation", false, "", ""],

    [74, "DNS Migration & Go-Live", "Get DNS credentials from CBT IT", false, "Neema", "BLOCKED on client"],
    [74, "", "Backup current coopbank.co.tz", false, "", ""],
    [74, "", "Configure production Cloud Run", false, "", ""],
    [74, "", "Set up domain + SSL", false, "", ""],
    [74, "", "Update DNS records", false, "", ""],
    [74, "", "Configure 301 redirects", false, "", ""],
    [74, "", "Verify DNS propagation", false, "", ""],
    [74, "", "E2E test production", false, "", ""],
    [74, "", "Submit sitemap to Search Console", false, "", ""],
    [74, "", "Verify GA4 on production", false, "", ""],
    [74, "", "Monitor first 24 hours", false, "", ""],
  ];

  sheet.getRange(3, 1, subtasks.length, headers.length).setValues(subtasks);

  // Checkbox for Done column
  sheet.getRange(3, 4, subtasks.length, 1).insertCheckboxes();

  // Conditional formatting - strikethrough when done
  const doneRange = sheet.getRange("C3:C500");
  const strikeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D3=TRUE')
    .setStrikethrough(true)
    .setFontColor("#94A3B8")
    .setRanges([sheet.getRange("A3:F500")])
    .build();
  sheet.setConditionalFormatRules([strikeRule]);

  sheet.setFrozenRows(2);
  sheet.setTabColor("#6366F1");
}

// ===== GANTT SHEET =====
function createGanttSheet(ss) {
  let sheet = ss.getSheetByName("Gantt");
  if (!sheet) sheet = ss.insertSheet("Gantt", 3);
  sheet.clear();

  const navy = "#0D3875";
  sheet.getRange(1, 1).setValue("Project Timeline (Gantt View)").setFontSize(14).setFontWeight("bold").setFontColor(navy);

  // Headers
  sheet.getRange(2, 1).setValue("Task").setFontWeight("bold");
  sheet.getRange(2, 2).setValue("Status").setFontWeight("bold");
  sheet.setColumnWidth(1, 350);
  sheet.setColumnWidth(2, 120);

  // Generate date columns from Mar 6 to May 19
  const startDate = new Date(2026, 2, 2); // Mar 2
  const endDate = new Date(2026, 4, 25);  // May 25
  let col = 3;
  const dateMap = {};

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = Utilities.formatDate(d, "Africa/Dar_es_Salaam", "MMM d");
    const dayName = Utilities.formatDate(d, "Africa/Dar_es_Salaam", "EEE");
    sheet.getRange(2, col).setValue(dateStr).setFontSize(8).setTextRotation(90).setFontWeight("bold");
    sheet.setColumnWidth(col, 22);

    // Weekend shading
    if (dayName === "Sat" || dayName === "Sun") {
      sheet.getRange(2, col, 80, 1).setBackground("#F1F5F9");
    }

    dateMap[Utilities.formatDate(d, "Africa/Dar_es_Salaam", "yyyy-MM-dd")] = col;
    col++;
  }

  // Key milestones as task rows
  const ganttTasks = [
    { name: "--- DISCOVERY & PLANNING ---", status: "Complete", start: "2026-03-06", end: "2026-03-14", color: "#DCFCE7" },
    { name: "Discovery & Requirements", status: "Complete", start: "2026-03-06", end: "2026-03-08", color: "#86EFAC" },
    { name: "Competitor Analysis", status: "Complete", start: "2026-03-07", end: "2026-03-09", color: "#86EFAC" },
    { name: "Sitemap & IA", status: "Complete", start: "2026-03-08", end: "2026-03-10", color: "#86EFAC" },
    { name: "Content Audit", status: "Complete", start: "2026-03-09", end: "2026-03-14", color: "#86EFAC" },
    { name: "--- DESIGN & BUILD ---", status: "Complete", start: "2026-03-12", end: "2026-03-18", color: "#DCFCE7" },
    { name: "Project Setup", status: "Complete", start: "2026-03-12", end: "2026-03-13", color: "#86EFAC" },
    { name: "Homepage Build", status: "Complete", start: "2026-03-13", end: "2026-03-15", color: "#86EFAC" },
    { name: "Personal/Loan Pages", status: "Complete", start: "2026-03-15", end: "2026-03-16", color: "#86EFAC" },
    { name: "Digital Banking Pages", status: "Complete", start: "2026-03-16", end: "2026-03-17", color: "#86EFAC" },
    { name: "About/Careers/Tenders", status: "Complete", start: "2026-03-17", end: "2026-03-18", color: "#86EFAC" },
    { name: "Navbar, Footer, Components", status: "Complete", start: "2026-03-14", end: "2026-03-18", color: "#86EFAC" },
    { name: "Mshirika Chatbot + GA4", status: "Complete", start: "2026-03-17", end: "2026-03-18", color: "#86EFAC" },
    { name: "--- CLIENT REVIEW ---", status: "Active", start: "2026-03-18", end: "2026-04-03", color: "#FEF3C7" },
    { name: "First Draft Submitted", status: "Complete", start: "2026-03-18", end: "2026-03-18", color: "#86EFAC" },
    { name: "Feedback Round 1", status: "Complete", start: "2026-03-18", end: "2026-03-26", color: "#86EFAC" },
    { name: "Implement Revisions R1", status: "Complete", start: "2026-03-25", end: "2026-03-26", color: "#86EFAC" },
    { name: "Business Banking Page", status: "Not Started", start: "2026-03-27", end: "2026-03-29", color: "#BFDBFE" },
    { name: "Contact Us Page", status: "Not Started", start: "2026-03-27", end: "2026-03-28", color: "#BFDBFE" },
    { name: "FAQs Page", status: "Not Started", start: "2026-03-28", end: "2026-03-29", color: "#BFDBFE" },
    { name: "Blog/News Page", status: "Not Started", start: "2026-03-29", end: "2026-03-31", color: "#BFDBFE" },
    { name: "Privacy/Terms + Cookie", status: "Not Started", start: "2026-03-29", end: "2026-03-30", color: "#BFDBFE" },
    { name: "AWAITING: Client Data (13 items)", status: "Blocked", start: "2026-03-26", end: "2026-04-10", color: "#FECACA" },
    { name: "Feedback Round 2", status: "Not Started", start: "2026-04-01", end: "2026-04-03", color: "#FEF3C7" },
    { name: "Feedback Round 3 (Final)", status: "Not Started", start: "2026-04-05", end: "2026-04-08", color: "#FEF3C7" },
    { name: "--- CONTENT & LOCALIZATION ---", status: "Pending", start: "2026-04-01", end: "2026-04-09", color: "#E0E7FF" },
    { name: "Swahili Translation", status: "Not Started", start: "2026-04-01", end: "2026-04-07", color: "#C7D2FE" },
    { name: "Branch Directory + Maps", status: "Not Started", start: "2026-04-03", end: "2026-04-06", color: "#C7D2FE" },
    { name: "API Integrations (Forex, Loans, etc.)", status: "Not Started", start: "2026-04-01", end: "2026-04-09", color: "#C7D2FE" },
    { name: "Final Content & Media", status: "Not Started", start: "2026-04-05", end: "2026-04-08", color: "#C7D2FE" },
    { name: "--- TESTING & QA ---", status: "Pending", start: "2026-04-10", end: "2026-04-17", color: "#F3E8FF" },
    { name: "Cross-Browser Testing", status: "Not Started", start: "2026-04-10", end: "2026-04-12", color: "#DDD6FE" },
    { name: "SEO & Performance", status: "Not Started", start: "2026-04-10", end: "2026-04-13", color: "#DDD6FE" },
    { name: "Security & BOT Compliance", status: "Not Started", start: "2026-04-13", end: "2026-04-15", color: "#DDD6FE" },
    { name: "UAT with CoopBank", status: "Not Started", start: "2026-04-15", end: "2026-04-17", color: "#DDD6FE" },
    { name: "--- GO-LIVE ---", status: "Pending", start: "2026-04-17", end: "2026-05-19", color: "#FEE2E2" },
    { name: "DNS Migration & Launch", status: "Not Started", start: "2026-04-17", end: "2026-04-19", color: "#FCA5A5" },
    { name: "Staff Training", status: "Not Started", start: "2026-04-19", end: "2026-04-21", color: "#FCA5A5" },
    { name: "Post-Launch Monitoring (30d)", status: "Not Started", start: "2026-04-21", end: "2026-05-19", color: "#FCA5A5" },
  ];

  let row = 3;
  ganttTasks.forEach(task => {
    const isSection = task.name.startsWith("---");
    sheet.getRange(row, 1).setValue(task.name.replace(/---/g, "").trim())
      .setFontWeight(isSection ? "bold" : "normal")
      .setFontSize(isSection ? 10 : 9);
    sheet.getRange(row, 2).setValue(task.status).setFontSize(9);

    if (isSection) {
      sheet.getRange(row, 1, 1, 2).setBackground("#E2E8F0").setFontColor("#0F172A");
    }

    // Paint the Gantt bars
    const startCol = dateMap[task.start];
    const endCol = dateMap[task.end];
    if (startCol && endCol) {
      sheet.getRange(row, startCol, 1, endCol - startCol + 1).setBackground(task.color);
    }

    row++;
  });

  // Today marker
  const today = Utilities.formatDate(new Date(), "Africa/Dar_es_Salaam", "yyyy-MM-dd");
  if (dateMap[today]) {
    sheet.getRange(2, dateMap[today], row - 2, 1).setBorder(null, true, null, true, null, null, "#DC2626", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(2);
  sheet.setTabColor("#F59E0B");
}

// ===== ACTIVITY LOG =====
function createActivityLog(ss) {
  let sheet = ss.getSheetByName("Activity Log");
  if (!sheet) sheet = ss.insertSheet("Activity Log", 4);
  sheet.clear();

  const navy = "#0D3875";
  sheet.getRange(1, 1).setValue("Activity Log — Auto-tracked status changes").setFontSize(14).setFontWeight("bold").setFontColor(navy);

  const headers = ["Timestamp", "Task ID", "Task Name", "Field Changed", "Old Value", "New Value", "Changed By"];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground(navy).setFontColor("white");

  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 60);
  sheet.setColumnWidth(3, 300);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 140);

  // Seed with initial entry
  sheet.getRange(3, 1, 1, 7).setValues([[
    new Date(), "-", "Project Tracker Created", "Setup", "-", "All tasks imported from CRM", "System"
  ]]);

  sheet.setFrozenRows(2);
  sheet.setTabColor("#8B5CF6");
}

// ===== STAKEHOLDERS =====
function createStakeholders(ss) {
  let sheet = ss.getSheetByName("Stakeholders");
  if (!sheet) sheet = ss.insertSheet("Stakeholders", 5);
  sheet.clear();

  const navy = "#0D3875";
  sheet.getRange(1, 1).setValue("Project Stakeholders").setFontSize(14).setFontWeight("bold").setFontColor(navy);

  const headers = ["Name", "Email", "Role", "Organization", "Key Responsibility"];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground(navy).setFontColor("white");

  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 300);

  const stakeholders = [
    ["Jumbe Seleman", "jumbenylon@gmail.com", "Lead Developer", "Saccura Group", "Full-stack development, architecture, deployment"],
    ["Mwana Neema Semboja", "neema.semboja@sakuragroup.co.tz", "Project Manager", "Saccura Group", "Client liaison, content coordination, PM"],
    ["Oscar Rubasha", "Oscar.Ruhasha@cbtbank.co.tz", "Main Feedback Contact", "CBT Bank", "Primary reviewer — all feedback goes through Oscar"],
    ["Moses Mpakasi", "Moses.Mpakasi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Yahya Kinabo", "Yahya.Kiyabo@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Martin Malopa", "Martin.Malopa@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Geoffrey Nangai", "Geoffrey.Nangai@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Tecla Muchunguzi", "Tecla.Muchunguzi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Samson Msangi", "Samson.Msangi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Hemed Nassor", "Hemed.Nassor@cbtbank.co.tz", "Primary Contact", "CBT Bank", ""],
    ["Robin Makwabe", "Robin.Makwabe@cbtbank.co.tz", "Stakeholder (CC)", "CBT Bank", ""],
  ];

  sheet.getRange(3, 1, stakeholders.length, headers.length).setValues(stakeholders);
  sheet.getRange(3, 1, stakeholders.length, headers.length).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  sheet.setFrozenRows(2);
  sheet.setTabColor("#EC4899");
}

// ===== AUTO-TRACKING TRIGGER =====
function installTrigger() {
  // Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "onEditTracker") ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger("onEditTracker")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
}

function onEditTracker(e) {
  if (!e) return;

  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Only track Tasks sheet, status column (E) and priority column (G)
  if (sheet.getName() !== "Tasks") return;
  if (range.getRow() < 3) return;

  const col = range.getColumn();
  const trackedCols = { 5: "Status", 7: "Priority", 4: "Owner" };
  if (!trackedCols[col]) return;

  const taskId = sheet.getRange(range.getRow(), 1).getValue();
  const taskName = sheet.getRange(range.getRow(), 2).getValue();
  const oldValue = e.oldValue || "(empty)";
  const newValue = range.getValue();
  const user = Session.getActiveUser().getEmail() || "Unknown";

  // Log to Activity Log
  const logSheet = e.source.getSheetByName("Activity Log");
  if (!logSheet) return;

  const lastRow = logSheet.getLastRow() + 1;
  logSheet.getRange(lastRow, 1, 1, 7).setValues([[
    new Date(), taskId, taskName, trackedCols[col], oldValue, newValue, user
  ]]);

  // Auto-update subtask progress on Tasks sheet when Subtasks checkboxes change
  if (sheet.getName() === "Subtasks" && col === 4) {
    updateSubtaskCount(e.source, sheet.getRange(range.getRow(), 1).getValue());
  }
}

// Helper: Update subtask count on Tasks sheet
function updateSubtaskCount(ss, taskId) {
  if (!taskId) return;

  const subtaskSheet = ss.getSheetByName("Subtasks");
  const taskSheet = ss.getSheetByName("Tasks");
  if (!subtaskSheet || !taskSheet) return;

  const subtaskData = subtaskSheet.getDataRange().getValues();
  let total = 0, done = 0;

  subtaskData.forEach(row => {
    if (row[0] == taskId) {
      total++;
      if (row[3] === true) done++;
    }
  });

  // Find the task row in Tasks sheet and update Subtasks column (J)
  const taskData = taskSheet.getDataRange().getValues();
  for (let i = 2; i < taskData.length; i++) {
    if (taskData[i][0] == taskId) {
      taskSheet.getRange(i + 1, 10).setValue(`${done}/${total}`);
      break;
    }
  }
}

// ===== UTILITY: Refresh subtask counts =====
function refreshAllSubtaskCounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const taskSheet = ss.getSheetByName("Tasks");
  const subtaskSheet = ss.getSheetByName("Subtasks");
  if (!taskSheet || !subtaskSheet) return;

  const subtaskData = subtaskSheet.getDataRange().getValues();
  const taskData = taskSheet.getDataRange().getValues();

  // Count per task
  const counts = {};
  subtaskData.forEach(row => {
    const id = row[0];
    if (!id || isNaN(id)) return;
    if (!counts[id]) counts[id] = { total: 0, done: 0 };
    counts[id].total++;
    if (row[3] === true) counts[id].done++;
  });

  // Update Tasks sheet
  for (let i = 2; i < taskData.length; i++) {
    const id = taskData[i][0];
    if (counts[id]) {
      taskSheet.getRange(i + 1, 10).setValue(`${counts[id].done}/${counts[id].total}`);
    }
  }

  SpreadsheetApp.getUi().alert("Subtask counts refreshed!");
}

// ===== CUSTOM MENU =====
function onOpen() {
  SpreadsheetApp.getUi().createMenu("CoopBank Tracker")
    .addItem("Refresh Subtask Counts", "refreshAllSubtaskCounts")
    .addItem("Rebuild Gantt Chart", "rebuildGantt")
    .addSeparator()
    .addItem("Setup Project Tracker", "setupProjectTracker")
    .addToUi();
}

function rebuildGantt() {
  createGanttSheet(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert("Gantt chart rebuilt!");
}
