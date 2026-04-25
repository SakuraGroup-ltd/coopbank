#!/usr/bin/env python3
"""
CoopBank Project Tracker — Excel Generator
Produces a fully formatted .xlsx with 6 tabs ready to use.
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, NamedStyle
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.chart import BarChart, Reference
from openpyxl.worksheet.datavalidation import DataValidation
from datetime import date, timedelta

wb = openpyxl.Workbook()

# ── Colors ──
NAVY = "0D3875"
GREEN = "1A8A3A"
WHITE = "FFFFFF"
LIGHT_BG = "F8FAFC"
HEADER_BG = "E2E8F0"

# Status colors
STATUS_COLORS = {
    "Complete":         ("DCFCE7", "166534"),
    "In Progress":      ("DBEAFE", "1E40AF"),
    "Not Started":      ("F1F5F9", "475569"),
    "Awaiting Client":  ("FEF3C7", "92400E"),
    "Awaiting Feedback":("FEF9C3", "854D0E"),
    "Blocked":          ("FEE2E2", "991B1B"),
    "Testing":          ("F3E8FF", "6B21A8"),
    "On Hold":          ("F1F5F9", "64748B"),
}

PRIORITY_COLORS = {
    "Critical": ("FEE2E2", "991B1B"),
    "High":     ("FEF3C7", "92400E"),
    "Medium":   ("F1F5F9", "475569"),
    "Low":      ("F8FAFC", "94A3B8"),
}

navy_fill = PatternFill("solid", fgColor=NAVY)
white_font = Font(color=WHITE, bold=True, size=10)
header_font = Font(color=WHITE, bold=True, size=10)
title_font = Font(color=NAVY, bold=True, size=16)
subtitle_font = Font(color="64748B", size=11)
bold = Font(bold=True)
thin_border = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0'),
)

def style_header(ws, row, cols):
    for c in range(1, cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thin_border

def style_row(ws, row, cols, bg=None):
    for c in range(1, cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.border = thin_border
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        if bg:
            cell.fill = PatternFill("solid", fgColor=bg)

def add_status_formatting(ws, col_letter, min_row, max_row):
    for status, (bg, fg) in STATUS_COLORS.items():
        ws.conditional_formatting.add(
            f'{col_letter}{min_row}:{col_letter}{max_row}',
            CellIsRule(operator='equal', formula=[f'"{status}"'],
                       fill=PatternFill("solid", fgColor=bg),
                       font=Font(color=fg, bold=True))
        )

def add_priority_formatting(ws, col_letter, min_row, max_row):
    for pri, (bg, fg) in PRIORITY_COLORS.items():
        ws.conditional_formatting.add(
            f'{col_letter}{min_row}:{col_letter}{max_row}',
            CellIsRule(operator='equal', formula=[f'"{pri}"'],
                       fill=PatternFill("solid", fgColor=bg),
                       font=Font(color=fg, bold=True))
        )

# ================================================================
# SHEET 1: DASHBOARD
# ================================================================
ws = wb.active
ws.title = "Dashboard"
ws.sheet_properties.tabColor = NAVY

ws.column_dimensions['A'].width = 4
ws.column_dimensions['B'].width = 32
ws.column_dimensions['C'].width = 14
ws.column_dimensions['D'].width = 14
ws.column_dimensions['E'].width = 14
ws.column_dimensions['F'].width = 14
ws.column_dimensions['G'].width = 14
ws.column_dimensions['H'].width = 25

ws['B1'] = "CoopBank Website Redesign"
ws['B1'].font = title_font
ws['B2'] = "SG-2026-0101 | Cooperative Bank Tanzania Plc."
ws['B2'].font = subtitle_font

# Summary cards
cards = ["Total Tasks", "Completed", "In Progress", "Blocked/Awaiting", "Completion %"]
formulas = [
    '=COUNTA(Tasks!A4:A200)',
    '=COUNTIF(Tasks!E4:E200,"Complete")',
    '=COUNTIF(Tasks!E4:E200,"In Progress")',
    '=COUNTIF(Tasks!E4:E200,"Blocked")+COUNTIF(Tasks!E4:E200,"Awaiting Client")',
    '=IFERROR(ROUND(COUNTIF(Tasks!E4:E200,"Complete")/COUNTA(Tasks!E4:E200)*100,1)&"%","0%")'
]

for i, (label, formula) in enumerate(zip(cards, formulas)):
    col = i + 2
    ws.cell(row=4, column=col, value=label).font = Font(color="64748B", bold=True, size=9)
    ws.cell(row=5, column=col, value="").font = Font(color=NAVY, bold=True, size=20)
    ws.cell(row=5, column=col).value = formula
    ws.cell(row=4, column=col).fill = PatternFill("solid", fgColor=LIGHT_BG)
    ws.cell(row=5, column=col).fill = PatternFill("solid", fgColor=LIGHT_BG)

# Milestone Progress
ws['B7'] = "Milestone Progress"
ws['B7'].font = Font(color=NAVY, bold=True, size=14)

ms_headers = ["Milestone", "Total", "Done", "In Progress", "Blocked", "Progress", "Status"]
for i, h in enumerate(ms_headers):
    ws.cell(row=8, column=i+2, value=h)
style_header(ws, 8, len(ms_headers) + 1)

milestones = [
    "PM & Admin", "Discovery & Planning", "Design & Build",
    "Client Review & Revisions", "Content & Localization",
    "Testing & QA", "Go-Live & Handover"
]

for i, ms in enumerate(milestones):
    r = 9 + i
    ws.cell(row=r, column=2, value=ms).font = Font(bold=True, size=10)
    ws.cell(row=r, column=3).value = f'=COUNTIF(Tasks!C4:C200,B{r})'
    ws.cell(row=r, column=4).value = f'=COUNTIFS(Tasks!C4:C200,B{r},Tasks!E4:E200,"Complete")'
    ws.cell(row=r, column=5).value = f'=COUNTIFS(Tasks!C4:C200,B{r},Tasks!E4:E200,"In Progress")'
    ws.cell(row=r, column=6).value = f'=COUNTIFS(Tasks!C4:C200,B{r},Tasks!E4:E200,"Blocked")+COUNTIFS(Tasks!C4:C200,B{r},Tasks!E4:E200,"Awaiting Client")'
    ws.cell(row=r, column=7).value = f'=IFERROR(ROUND(D{r}/C{r}*100,0)&"%","0%")'
    ws.cell(row=r, column=8).value = f'=IF(G{r}="100%","Done",IF(E{r}>0,"Active",IF(F{r}>0,"Blocked","Pending")))'
    bg = LIGHT_BG if i % 2 == 0 else WHITE
    style_row(ws, r, 8, bg)

# Blockers summary
br = 9 + len(milestones) + 2
ws.cell(row=br, column=2, value="Items Blocked on Client").font = Font(color="DC2626", bold=True, size=14)
bl_headers = ["Task", "Tags", "Status", "Blocker Description"]
for i, h in enumerate(bl_headers):
    c = ws.cell(row=br+1, column=i+2, value=h)
    c.fill = PatternFill("solid", fgColor="FEE2E2")
    c.font = Font(color="991B1B", bold=True)

ws.cell(row=br+2, column=2).value = '=IFERROR(FILTER(Tasks!B4:B200, Tasks!E4:E200="Awaiting Client"), "No items awaiting client")'
ws.cell(row=br+2, column=3).value = '=IFERROR(FILTER(Tasks!F4:F200, Tasks!E4:E200="Awaiting Client"), "")'

# ================================================================
# SHEET 2: TASKS (Main Tracker)
# ================================================================
ws2 = wb.create_sheet("Tasks")
ws2.sheet_properties.tabColor = GREEN

headers = ["ID", "Task Name", "Milestone", "Owner", "Status", "Tags",
           "Priority", "Start Date", "Due Date", "Subtasks", "Dependencies / Notes"]
widths = [7, 48, 28, 24, 17, 22, 11, 13, 13, 12, 48]

for i, (h, w) in enumerate(zip(headers, widths)):
    ws2.column_dimensions[get_column_letter(i+1)].width = w

# Title row
ws2.merge_cells('A1:K1')
ws2['A1'] = "SG-2026-0101 — CoopBank Task Tracker"
ws2['A1'].font = title_font

# Instruction row
ws2.merge_cells('A2:K2')
ws2['A2'] = "Use Status dropdown to update. Changes auto-color. Tags are comma-separated. Subtasks link to Subtasks tab."
ws2['A2'].font = Font(color="94A3B8", italic=True, size=9)

# Headers
for i, h in enumerate(headers):
    ws2.cell(row=3, column=i+1, value=h)
style_header(ws2, 3, len(headers))

# Task data
tasks = [
    # PM & Admin
    [77, "Weekly Client Status Update (CoopBank)", "PM & Admin", "Neema", "Awaiting Feedback", "Recurring", "High", "2026-03-18", "2026-04-25", "", "Weekly cadence"],
    [78, "Invoice Preparation & Payment Follow-up", "PM & Admin", "Neema", "Not Started", "Finance", "High", "2026-03-20", "2026-04-25", "", "40% commencement due"],
    [79, "Project Timeline & Risk Management", "PM & Admin", "Neema", "Awaiting Feedback", "PM", "High", "2026-03-18", "2026-04-25", "", ""],
    [80, "Client Communication & Meeting Coordination", "PM & Admin", "Neema", "Awaiting Feedback", "PM", "High", "2026-03-18", "2026-04-25", "", ""],
    [81, "Contract & Scope Documentation", "PM & Admin", "Neema", "Awaiting Feedback", "Legal", "High", "2026-03-20", "2026-03-22", "", ""],
    # Discovery
    [48, "Discovery & Stakeholder Requirements", "Discovery & Planning", "Jumbe + Neema", "Complete", "Research", "Medium", "2026-03-06", "2026-03-08", "", ""],
    [49, "Competitor Analysis (NMB, CRDB, NBC, Stanbic)", "Discovery & Planning", "Jumbe + Neema", "Complete", "Research", "Medium", "2026-03-07", "2026-03-09", "", ""],
    [50, "Sitemap & Information Architecture", "Discovery & Planning", "Jumbe + Neema", "Complete", "UX", "Medium", "2026-03-08", "2026-03-10", "", ""],
    [51, "Brand Asset Collection", "Discovery & Planning", "Neema", "Complete", "Design", "Medium", "2026-03-08", "2026-03-11", "", ""],
    [52, "Content Audit & Copywriting", "Discovery & Planning", "Jumbe + Neema", "Complete", "Content", "Medium", "2026-03-09", "2026-03-14", "", ""],
    # Design & Build
    [53, "Next.js Project Setup & Architecture", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-12", "2026-03-13", "", ""],
    [54, "Homepage Build (Hero, Forex, Products, Stats)", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-13", "2026-03-15", "", ""],
    [55, "Personal Banking & Loan Products Pages", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-15", "2026-03-16", "", ""],
    [56, "Digital Banking Pages (CoopNet, Wakala, USSD, QR)", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-16", "2026-03-17", "", ""],
    [57, "About Us, Board & Management Pages", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-17", "2026-03-18", "", ""],
    [58, "Tenders, Whistleblower, Careers Pages", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-17", "2026-03-17", "", ""],
    [59, "Navbar, Footer & Shared Components", "Design & Build", "Jumbe", "Complete", "Dev", "Medium", "2026-03-14", "2026-03-18", "", ""],
    [60, "Mshirika AI Chatbot Integration", "Design & Build", "Jumbe", "Complete", "AI", "Medium", "2026-03-18", "2026-03-18", "", ""],
    [61, "GA4 Analytics & Staging Deployment", "Design & Build", "Jumbe", "Complete", "DevOps", "Medium", "2026-03-17", "2026-03-18", "", ""],
    # Client Review
    [62, "Submit First Draft to CoopBank Marketing", "Client Review & Revisions", "Jumbe + Neema", "Complete", "Milestone", "Medium", "2026-03-18", "2026-03-18", "", "Sent to Oscar Rubasha"],
    [63, "Collect Client Feedback (Round 1)", "Client Review & Revisions", "Neema", "Complete", "Client", "High", "2026-03-18", "2026-03-25", "", "Received 2026-03-26"],
    [64, "Implement Design Revisions (Round 1)", "Client Review & Revisions", "Jumbe", "Complete", "Dev", "Medium", "2026-03-25", "2026-03-29", "", "Colors, forex, products, cards, content"],
    [65, "Collect Client Feedback (Round 2)", "Client Review & Revisions", "Neema", "Not Started", "Client", "Medium", "2026-03-29", "2026-04-01", "", "After pending builds complete"],
    [109, "Implement Design Revisions (Round 2)", "Client Review & Revisions", "", "Not Started", "Dev", "Medium", "", "", "", "Depends on: Round 2 feedback"],
    [110, "Collect Client Feedback (Round 3 - Final)", "Client Review & Revisions", "", "Not Started", "Client", "Medium", "", "", "", "Final review before QA"],
    [111, "Implement Final Revisions (Round 3)", "Client Review & Revisions", "", "Not Started", "Dev", "Medium", "", "", "", "Last changes before testing"],
    # Builds
    [82, "Build: Business Banking Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-27", "2026-03-29", "0/10", ""],
    [83, "Build: Contact Us Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-27", "2026-03-28", "0/10", "Needs: email domain (#113)"],
    [84, "Build: FAQs Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-28", "2026-03-29", "0/13", ""],
    [85, "Build: Blog / News & Updates Page", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-29", "2026-03-31", "0/10", ""],
    [86, "Build: Privacy Policy & Terms Pages", "Client Review & Revisions", "Neema", "Not Started", "Build, Legal", "Medium", "2026-03-29", "2026-03-30", "0/8", "Needs: approved legal content"],
    [87, "Build: Cookie Consent Banner", "Client Review & Revisions", "Jumbe", "Not Started", "Build", "Medium", "2026-03-30", "2026-03-30", "0/9", ""],
    [89, "Figma Design System: Complete & Deliver", "Client Review & Revisions", "Jumbe", "Not Started", "Design", "Low", "2026-03-29", "2026-04-03", "", "Deliverable to client"],
    [90, "Figma: Component Library & Style Guide", "Client Review & Revisions", "Jumbe", "Not Started", "Design", "Medium", "2026-04-01", "2026-04-03", "", ""],
    # Awaiting Client - Review
    [112, "Awaiting: Official Product Master List", "Client Review & Revisions", "Oscar (CBT)", "Awaiting Client", "Blocker, Products", "Critical", "", "", "0/7", "Msomi vs Wanafunzi, Mafao etc."],
    [113, "Awaiting: Email Domain Confirmation", "Client Review & Revisions", "CBT IT", "Awaiting Client", "Blocker, Config", "Critical", "", "", "0/8", "@coopbank vs @cbtbank"],
    [114, "Awaiting: Brand Guide / Visual Reference", "Client Review & Revisions", "CBT Marketing", "Awaiting Client", "Blocker, Design", "High", "", "", "0/9", "Dashed white unclear"],
    [115, "Awaiting: About Us Content (Bank-Approved)", "Client Review & Revisions", "Oscar (CBT)", "Awaiting Client", "Blocker, Content", "Critical", "", "", "0/11", "Mission, Vision, Values, Story"],
    [116, "Awaiting: Account Opening CTAs", "Client Review & Revisions", "CBT Ops", "Awaiting Client", "Blocker, UX", "Critical", "", "", "0/12", "Where do buttons link?"],
    [117, "Awaiting: Agent Application Form", "Client Review & Revisions", "CBT Ops", "Awaiting Client", "Blocker, UX", "High", "", "", "0/7", "Destination unknown"],
    # Content & Localization
    [66, "Swahili Translation - All Pages", "Content & Localization", "Neema", "Not Started", "i18n", "Medium", "2026-04-01", "2026-04-07", "0/15", ""],
    [67, "Branch Directory with Google Maps", "Content & Localization", "Jumbe", "Not Started", "Build, Maps", "Medium", "2026-04-03", "2026-04-06", "0/10", "Needs: branch data from CBT"],
    [68, "Final Content Population & Media", "Content & Localization", "Neema", "Not Started", "Content", "Medium", "2026-04-05", "2026-04-08", "0/10", ""],
    [69, "Blog/News Section Setup", "Content & Localization", "Jumbe", "Not Started", "Build", "Medium", "2026-04-07", "2026-04-09", "", ""],
    [88, "Branch Locator: Google Maps Integration", "Content & Localization", "Jumbe", "Not Started", "Build, Maps", "Medium", "2026-04-03", "2026-04-06", "", "Depends: #67 + branch data"],
    [91, "API Discovery: Map CoopBank Endpoints", "Content & Localization", "Jumbe", "Not Started", "API", "High", "2026-04-01", "2026-04-05", "", "Unblocks all API work"],
    [92, "API Integration: Forex Rates", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-05", "2026-04-07", "", "Depends: #91 + #120"],
    [93, "API Integration: Loan Calculator", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-05", "2026-04-07", "", "Depends: #91"],
    [94, "API Integration: Careers & Tenders", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-07", "2026-04-09", "", "Depends: #91"],
    [95, "API Integration: Branch Data", "Content & Localization", "Jumbe", "Not Started", "API", "Medium", "2026-04-06", "2026-04-08", "", "Depends: #91 + #118"],
    # Awaiting Client - Content
    [118, "Awaiting: Agent Database for Wakala", "Content & Localization", "CBT Ops", "Awaiting Client", "Blocker, Data", "Critical", "", "", "0/13", "Name | Location | Contact"],
    [119, "Awaiting: POS Services List", "Content & Localization", "CBT Digital", "Awaiting Client", "Blocker, Content", "Critical", "", "", "0/9", "Wakala POS services"],
    [120, "Awaiting: Forex Rate Data Source", "Content & Localization", "CBT Treasury", "Awaiting Client", "Blocker, API", "High", "", "", "0/11", "API or manual?"],
    [121, "Awaiting: Cards & Payments Specs", "Content & Localization", "CBT Marketing", "Awaiting Client", "Blocker, Content", "High", "", "", "0/10", "Visa Prepaid specs"],
    [122, "Awaiting: Treasury/FX Page Decision", "Content & Localization", "CBT Mgmt", "Awaiting Client", "Blocker, Scope", "Medium", "", "", "0/7", "Separate page needed?"],
    [123, "Awaiting: Investors/Corp Governance", "Content & Localization", "CBT Mgmt", "Awaiting Client", "Blocker, Scope", "Medium", "", "", "0/11", "Ready for launch?"],
    # Testing
    [70, "Cross-Browser & Mobile Testing", "Testing & QA", "Jumbe + Neema", "Not Started", "QA", "Medium", "2026-04-10", "2026-04-12", "0/12", ""],
    [71, "SEO & Performance Optimization", "Testing & QA", "Jumbe", "Not Started", "SEO", "Medium", "2026-04-10", "2026-04-13", "0/12", "Lighthouse 90+"],
    [72, "Security Hardening & BOT Compliance", "Testing & QA", "Jumbe", "Not Started", "Security", "High", "2026-04-13", "2026-04-15", "0/10", "OWASP + Bank of Tanzania"],
    [73, "UAT with CoopBank IT & Marketing", "Testing & QA", "Jumbe + Neema", "Not Started", "UAT, Client", "High", "2026-04-15", "2026-04-17", "0/10", "Needs sign-off"],
    # Go-Live
    [74, "DNS Migration & Production Go-Live", "Go-Live & Handover", "Jumbe", "Not Started", "DevOps", "Critical", "2026-04-17", "2026-04-19", "0/11", "Needs DNS access"],
    [75, "Staff Training Session", "Go-Live & Handover", "Jumbe + Neema", "Not Started", "Training", "Medium", "2026-04-19", "2026-04-21", "0/10", ""],
    [76, "Post-Launch Monitoring (30 Days)", "Go-Live & Handover", "Jumbe", "Not Started", "Support", "Medium", "2026-04-21", "2026-05-19", "0/11", ""],
]

for i, row in enumerate(tasks):
    r = i + 4
    for j, val in enumerate(row):
        cell = ws2.cell(row=r, column=j+1, value=val)
        cell.border = thin_border
        cell.alignment = Alignment(vertical='center', wrap_text=(j in [1, 10]))
    bg = LIGHT_BG if i % 2 == 0 else WHITE
    style_row(ws2, r, len(headers), bg)
    # Apply status color directly
    status = row[4]
    if status in STATUS_COLORS:
        sc = STATUS_COLORS[status]
        ws2.cell(row=r, column=5).fill = PatternFill("solid", fgColor=sc[0])
        ws2.cell(row=r, column=5).font = Font(color=sc[1], bold=True)
    # Apply priority color
    pri = row[6]
    if pri in PRIORITY_COLORS:
        pc = PRIORITY_COLORS[pri]
        ws2.cell(row=r, column=7).fill = PatternFill("solid", fgColor=pc[0])
        ws2.cell(row=r, column=7).font = Font(color=pc[1], bold=True)

# Data validations
status_dv = DataValidation(type="list", formula1='"Not Started,In Progress,Complete,Awaiting Client,Awaiting Feedback,Blocked,Testing,On Hold"')
status_dv.error = "Pick a valid status"
status_dv.errorTitle = "Invalid Status"
ws2.add_data_validation(status_dv)
status_dv.add(f'E4:E200')

priority_dv = DataValidation(type="list", formula1='"Critical,High,Medium,Low"')
ws2.add_data_validation(priority_dv)
priority_dv.add(f'G4:G200')

milestone_dv = DataValidation(type="list", formula1='"PM & Admin,Discovery & Planning,Design & Build,Client Review & Revisions,Content & Localization,Testing & QA,Go-Live & Handover"')
ws2.add_data_validation(milestone_dv)
milestone_dv.add(f'C4:C200')

# Conditional formatting for future edits
add_status_formatting(ws2, 'E', 4, 200)
add_priority_formatting(ws2, 'G', 4, 200)

ws2.freeze_panes = 'C4'
ws2.auto_filter.ref = f'A3:K{3 + len(tasks)}'

# ================================================================
# SHEET 3: SUBTASKS
# ================================================================
ws3 = wb.create_sheet("Subtasks")
ws3.sheet_properties.tabColor = "6366F1"

sub_headers = ["Task ID", "Task Name", "Subtask", "Done", "Assigned To", "Notes"]
sub_widths = [9, 38, 60, 8, 18, 35]
for i, (h, w) in enumerate(zip(sub_headers, sub_widths)):
    ws3.column_dimensions[get_column_letter(i+1)].width = w

ws3.merge_cells('A1:F1')
ws3['A1'] = "Subtask Details — Check Done when complete"
ws3['A1'].font = title_font

for i, h in enumerate(sub_headers):
    ws3.cell(row=2, column=i+1, value=h)
style_header(ws3, 2, len(sub_headers))

subtask_data = {
    82: ("Build: Business Banking Page", [
        "Design hero section with glassmorphism panel",
        "Build Business Current Account section (TZS, USD, EUR, GBP)",
        "Build Business Savings Account section",
        "Build Trade Finance section (LCs, guarantees, bills)",
        "Build Cash Management section",
        "Build Payroll Services section",
        "Build Business Loans overview with CTA",
        "Add product comparison table",
        "Add Open Business Account CTA (pending destination)",
        "Mobile responsive layout and testing",
    ]),
    83: ("Build: Contact Us Page", [
        "Build hero with contact information cards",
        "Add phone: +255 27 275 4470",
        "Add email (pending domain confirmation)",
        "Build contact form (name, email, phone, subject, message)",
        "Add form validation and submission handler",
        "Embed Google Maps with HQ pin",
        "Add operating hours section",
        "Add social media links",
        "Add quick links to Branch/Agent Locator",
        "Mobile responsive layout",
    ]),
    84: ("Build: FAQs Page", [
        "Design FAQ layout with category tabs",
        "Create categories: General, Accounts, Digital, Loans, Cards, Wakala",
        "Build accordion components",
        "Write General FAQs", "Write Account FAQs", "Write Digital Banking FAQs",
        "Write Loans FAQs", "Write Cards FAQs", "Write Wakala FAQs",
        "Add search/filter functionality",
        "Add CTA to Contact Us",
        "SEO: FAQ schema markup (JSON-LD)",
        "Mobile responsive accordion",
    ]),
    85: ("Build: Blog / News Page", [
        "Design blog listing with featured hero",
        "Build blog card grid",
        "Build individual post template",
        "Add category filter",
        "Add pagination",
        "Add social sharing buttons",
        "Add related posts section",
        "Create 3-5 sample posts",
        "Add blog SEO metadata",
        "Mobile responsive layout",
    ]),
    86: ("Build: Privacy & Terms", [
        "Request approved Privacy Policy from CBT legal",
        "Request approved Terms of Service from CBT legal",
        "Build Privacy Policy page with TOC",
        "Build Terms page with TOC",
        "Add last updated date",
        "Add print-friendly styling",
        "Link from footer, cookie banner, forms",
        "Mobile readable typography",
    ]),
    87: ("Build: Cookie Consent", [
        "Build banner component (bottom viewport)",
        "Add Accept/Reject/Customize buttons",
        "Build preferences modal (Essential, Analytics, Marketing)",
        "Implement localStorage persistence",
        "Conditionally load GA4 based on consent",
        "Link to Privacy Policy",
        "Style to match brand (blue-green gradient)",
        "Test on mobile (must not block content)",
        "Show on first visit, hide after choice",
    ]),
    112: ("Awaiting: Product Master List", [
        "Request official list from CBT marketing",
        "Confirm Personal Banking Savings names",
        "Confirm Fixed Accounts names",
        "Confirm Group Accounts names",
        "Verify USD/EUR/GBP: real products or display?",
        "Update all product pages",
        "Update mega menu with final categories",
    ]),
    113: ("Awaiting: Email Domain", [
        "Ask CBT: @coopbank.co.tz or @cbtbank.co.tz?",
        "Receive written confirmation",
        "Update Homepage footer email",
        "Update Contact Us page email",
        "Update all mailto: links",
        "Update careers email",
        "Update whistleblower email",
        "Full grep and replace all refs",
    ]),
    115: ("Awaiting: About Us Content", [
        "Request Our Story / History", "Request Mission Statement",
        "Request Vision Statement", "Request Core Values + descriptions",
        "Request board photos & bios", "Request management photos & bios",
        "Build Our Story timeline", "Build Mission & Vision cards",
        "Build Core Values grid", "Update photo gallery", "Final proofread",
    ]),
    116: ("Awaiting: Account Opening CTAs", [
        "Ask: external portal URL?", "Ask: downloadable PDF?", "Ask: email/phone process?",
        "Receive confirmed destination",
        "Update Homepage hero CTA", "Update Personal Banking CTAs",
        "Update Fixed Deposit CTA", "Update Group Accounts CTA",
        "Update Digital Banking CTA", "Update mobile app links",
        "Test all CTAs desktop + mobile", "Verify no broken links",
    ]),
    118: ("Awaiting: Agent Database", [
        "Request from CBT ops (CSV/Excel)",
        "Define format: Name | Location | Region | Contact | GPS",
        "Receive and validate data",
        "Clean and normalize data",
        "Create agents JSON/API endpoint",
        "Build agent locator search UI",
        "Build agent card component",
        "Integrate Google Maps pins",
        "Add geolocation: Find Nearest Agent",
        "Add region filter dropdown",
        "Mobile responsive locator",
        "Test with sample data",
        "Populate production data",
    ]),
    66: ("Swahili Translation", [
        "Set up i18n framework", "Translate Homepage", "Translate Personal Banking",
        "Translate Digital Banking", "Translate Loan Products", "Translate About Us",
        "Translate Business Banking", "Translate Contact/FAQs/Blog",
        "Translate Careers/Tenders/Whistleblower", "Translate Privacy/Terms",
        "Build EN/SW toggle in navbar", "Persist language in localStorage",
        "Test Swahili layouts", "Native speaker review", "QA all Swahili pages",
    ]),
    70: ("Cross-Browser Testing", [
        "Chrome desktop + mobile", "Safari desktop + iOS", "Firefox desktop",
        "Edge desktop", "Samsung Internet Android",
        "Breakpoints: 320, 375, 414, 768, 1024, 1440",
        "Landscape orientation", "Fix overflow issues",
        "Test interactive elements", "Test mega menu", "Test chatbot mobile", "Test forex ticker",
    ]),
    74: ("DNS Migration & Go-Live", [
        "Get DNS credentials from CBT IT", "Backup current coopbank.co.tz",
        "Configure production Cloud Run", "Set up domain + SSL",
        "Update DNS records", "Configure 301 redirects",
        "Verify DNS propagation", "E2E test production",
        "Submit sitemap to Search Console", "Verify GA4 on production",
        "Monitor first 24 hours",
    ]),
    76: ("Post-Launch Monitoring", [
        "Set up uptime monitoring", "Configure error alerting",
        "Week 1: Daily performance check", "Week 1: Search Console monitoring",
        "Week 2: Review GA4 analytics", "Week 2: Fix reported issues",
        "Week 3-4: Weekly review", "Week 3-4: Remaining bugs",
        "Day 30: Final performance report", "Day 30: Credential handover",
        "Day 30: Discuss maintenance contract",
    ]),
}

row = 3
for task_id, (task_name, items) in subtask_data.items():
    for i, item in enumerate(items):
        ws3.cell(row=row, column=1, value=task_id)
        ws3.cell(row=row, column=2, value=task_name if i == 0 else "")
        ws3.cell(row=row, column=3, value=item)
        ws3.cell(row=row, column=4, value="")  # Done checkbox placeholder
        ws3.cell(row=row, column=5, value="")
        ws3.cell(row=row, column=6, value="")
        bg = LIGHT_BG if i % 2 == 0 else WHITE
        style_row(ws3, row, 6, bg)
        if i == 0:
            ws3.cell(row=row, column=2).font = Font(bold=True, size=10, color=NAVY)
        row += 1

# Done dropdown
done_dv = DataValidation(type="list", formula1='"Yes,No"')
ws3.add_data_validation(done_dv)
done_dv.add(f'D3:D{row}')

# Strikethrough formatting when Done = Yes
ws3.conditional_formatting.add(
    f'C3:C{row}',
    FormulaRule(formula=['$D3="Yes"'], font=Font(strikethrough=True, color="94A3B8"))
)
# Green background when done
ws3.conditional_formatting.add(
    f'D3:D{row}',
    CellIsRule(operator='equal', formula=['"Yes"'],
              fill=PatternFill("solid", fgColor="DCFCE7"),
              font=Font(color="166534", bold=True))
)

ws3.freeze_panes = 'A3'
ws3.auto_filter.ref = f'A2:F{row}'

# ================================================================
# SHEET 4: GANTT
# ================================================================
ws4 = wb.create_sheet("Gantt")
ws4.sheet_properties.tabColor = "F59E0B"

ws4.column_dimensions['A'].width = 45
ws4.column_dimensions['B'].width = 15

ws4['A1'] = "Project Timeline (Gantt)"
ws4['A1'].font = title_font
ws4['A2'] = "Task"
ws4['A2'].font = header_font
ws4['A2'].fill = navy_fill
ws4['B2'] = "Status"
ws4['B2'].font = header_font
ws4['B2'].fill = navy_fill

# Date columns: Mar 2 to May 25
start_d = date(2026, 3, 2)
end_d = date(2026, 5, 25)
col = 3
date_cols = {}
d = start_d
while d <= end_d:
    letter = get_column_letter(col)
    ws4.column_dimensions[letter].width = 3
    cell = ws4.cell(row=2, column=col, value=d.day)
    cell.font = Font(size=7, bold=True, color=WHITE)
    cell.fill = navy_fill
    cell.alignment = Alignment(horizontal='center')
    # Month label on 1st
    if d.day == 1:
        ws4.cell(row=1, column=col, value=d.strftime("%B")).font = Font(bold=True, color=NAVY, size=9)
    # Weekend shading
    if d.weekday() >= 5:
        ws4.cell(row=2, column=col).fill = PatternFill("solid", fgColor="1E3A5F")
    date_cols[d.isoformat()] = col
    col += 1
    d += timedelta(days=1)

# Gantt rows
gantt_tasks = [
    ("DISCOVERY & PLANNING", "", None, None, None, True),
    ("Discovery & Requirements", "Complete", "2026-03-06", "2026-03-08", "86EFAC", False),
    ("Competitor Analysis", "Complete", "2026-03-07", "2026-03-09", "86EFAC", False),
    ("Sitemap & IA", "Complete", "2026-03-08", "2026-03-10", "86EFAC", False),
    ("Content Audit", "Complete", "2026-03-09", "2026-03-14", "86EFAC", False),
    ("DESIGN & BUILD", "", None, None, None, True),
    ("Project Setup", "Complete", "2026-03-12", "2026-03-13", "86EFAC", False),
    ("Homepage Build", "Complete", "2026-03-13", "2026-03-15", "86EFAC", False),
    ("Personal/Loan Pages", "Complete", "2026-03-15", "2026-03-16", "86EFAC", False),
    ("Digital Banking Pages", "Complete", "2026-03-16", "2026-03-17", "86EFAC", False),
    ("About/Careers/Tenders", "Complete", "2026-03-17", "2026-03-18", "86EFAC", False),
    ("Navbar, Footer, Components", "Complete", "2026-03-14", "2026-03-18", "86EFAC", False),
    ("Chatbot + GA4", "Complete", "2026-03-17", "2026-03-18", "86EFAC", False),
    ("CLIENT REVIEW & REVISIONS", "", None, None, None, True),
    ("First Draft Submitted", "Complete", "2026-03-18", "2026-03-18", "86EFAC", False),
    ("Feedback Round 1", "Complete", "2026-03-18", "2026-03-26", "BBF7D0", False),
    ("Revisions Round 1", "Complete", "2026-03-25", "2026-03-26", "86EFAC", False),
    ("Business Banking Page", "Not Started", "2026-03-27", "2026-03-29", "BFDBFE", False),
    ("Contact Us + FAQs", "Not Started", "2026-03-27", "2026-03-29", "BFDBFE", False),
    ("Blog + Privacy/Terms + Cookie", "Not Started", "2026-03-29", "2026-03-31", "BFDBFE", False),
    ("Figma Design System", "Not Started", "2026-03-29", "2026-04-03", "C7D2FE", False),
    ("AWAITING CLIENT (13 items)", "Blocked", "2026-03-26", "2026-04-10", "FECACA", False),
    ("Feedback Round 2", "Not Started", "2026-04-01", "2026-04-03", "FEF3C7", False),
    ("Feedback Round 3 (Final)", "Not Started", "2026-04-05", "2026-04-08", "FEF3C7", False),
    ("CONTENT & LOCALIZATION", "", None, None, None, True),
    ("Swahili Translation", "Not Started", "2026-04-01", "2026-04-07", "C7D2FE", False),
    ("Branch Directory + Maps", "Not Started", "2026-04-03", "2026-04-06", "C7D2FE", False),
    ("API Integrations", "Not Started", "2026-04-01", "2026-04-09", "C7D2FE", False),
    ("Final Content & Media", "Not Started", "2026-04-05", "2026-04-08", "C7D2FE", False),
    ("TESTING & QA", "", None, None, None, True),
    ("Cross-Browser Testing", "Not Started", "2026-04-10", "2026-04-12", "DDD6FE", False),
    ("SEO & Performance", "Not Started", "2026-04-10", "2026-04-13", "DDD6FE", False),
    ("Security & BOT Compliance", "Not Started", "2026-04-13", "2026-04-15", "DDD6FE", False),
    ("UAT with CoopBank", "Not Started", "2026-04-15", "2026-04-17", "DDD6FE", False),
    ("GO-LIVE & HANDOVER", "", None, None, None, True),
    ("DNS Migration & Launch", "Not Started", "2026-04-17", "2026-04-19", "FCA5A5", False),
    ("Staff Training", "Not Started", "2026-04-19", "2026-04-21", "FCA5A5", False),
    ("Post-Launch Monitoring (30d)", "Not Started", "2026-04-21", "2026-05-19", "FCA5A5", False),
]

for i, (name, status, start, end, color, is_section) in enumerate(gantt_tasks):
    r = i + 3
    cell_a = ws4.cell(row=r, column=1, value=name)
    cell_b = ws4.cell(row=r, column=2, value=status)

    if is_section:
        cell_a.font = Font(bold=True, size=10, color=WHITE)
        cell_a.fill = PatternFill("solid", fgColor=NAVY)
        cell_b.fill = PatternFill("solid", fgColor=NAVY)
        cell_b.font = Font(color=WHITE)
    else:
        cell_a.font = Font(size=9)
        cell_b.font = Font(size=8)
        if status in STATUS_COLORS:
            sc = STATUS_COLORS[status]
            cell_b.fill = PatternFill("solid", fgColor=sc[0])
            cell_b.font = Font(color=sc[1], size=8, bold=True)

    # Paint Gantt bar
    if start and end and color:
        s_col = date_cols.get(start)
        e_col = date_cols.get(end)
        if s_col and e_col:
            for c in range(s_col, e_col + 1):
                ws4.cell(row=r, column=c).fill = PatternFill("solid", fgColor=color)

# Today marker
today = date.today().isoformat()
if today in date_cols:
    tc = date_cols[today]
    for r in range(2, 3 + len(gantt_tasks)):
        cell = ws4.cell(row=r, column=tc)
        cell.border = Border(
            left=Side(style='medium', color='DC2626'),
            right=Side(style='medium', color='DC2626')
        )

ws4.freeze_panes = 'C3'

# ================================================================
# SHEET 5: ACTIVITY LOG
# ================================================================
ws5 = wb.create_sheet("Activity Log")
ws5.sheet_properties.tabColor = "8B5CF6"

ws5.merge_cells('A1:G1')
ws5['A1'] = "Activity Log — Track status changes here"
ws5['A1'].font = title_font

log_headers = ["Date", "Task ID", "Task Name", "Field", "Old Value", "New Value", "Changed By"]
log_widths = [22, 8, 42, 15, 20, 20, 18]
for i, (h, w) in enumerate(zip(log_headers, log_widths)):
    ws5.cell(row=2, column=i+1, value=h)
    ws5.column_dimensions[get_column_letter(i+1)].width = w
style_header(ws5, 2, len(log_headers))

# Seed entry
seed = ["2026-03-26", "-", "Project Tracker Created", "Setup", "-", "All tasks imported from CRM", "System"]
for i, v in enumerate(seed):
    ws5.cell(row=3, column=i+1, value=v)
style_row(ws5, 3, len(log_headers), LIGHT_BG)

ws5.freeze_panes = 'A3'

# ================================================================
# SHEET 6: STAKEHOLDERS
# ================================================================
ws6 = wb.create_sheet("Stakeholders")
ws6.sheet_properties.tabColor = "EC4899"

ws6.merge_cells('A1:E1')
ws6['A1'] = "Project Stakeholders"
ws6['A1'].font = title_font

sh_headers = ["Name", "Email", "Role", "Organization", "Key Responsibility"]
sh_widths = [24, 36, 25, 20, 42]
for i, (h, w) in enumerate(zip(sh_headers, sh_widths)):
    ws6.cell(row=2, column=i+1, value=h)
    ws6.column_dimensions[get_column_letter(i+1)].width = w
style_header(ws6, 2, len(sh_headers))

stakeholders = [
    ["Jumbe Seleman", "jumbenylon@gmail.com", "Lead Developer", "Saccura Group", "Full-stack dev, architecture, deployment"],
    ["Mwana Neema Semboja", "neema.semboja@sakuragroup.co.tz", "Project Manager", "Saccura Group", "Client liaison, content, PM"],
    ["Oscar Rubasha", "Oscar.Ruhasha@cbtbank.co.tz", "Main Feedback Contact", "CBT Bank", "Primary reviewer — all feedback through Oscar"],
    ["Moses Mpakasi", "Moses.Mpakasi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Yahya Kinabo", "Yahya.Kiyabo@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Martin Malopa", "Martin.Malopa@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Geoffrey Nangai", "Geoffrey.Nangai@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Tecla Muchunguzi", "Tecla.Muchunguzi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Samson Msangi", "Samson.Msangi@cbtbank.co.tz", "Key Stakeholder", "CBT Bank", ""],
    ["Hemed Nassor", "Hemed.Nassor@cbtbank.co.tz", "Primary Contact", "CBT Bank", ""],
    ["Robin Makwabe", "Robin.Makwabe@cbtbank.co.tz", "Stakeholder (CC)", "CBT Bank", ""],
]

for i, row in enumerate(stakeholders):
    r = i + 3
    for j, v in enumerate(row):
        ws6.cell(row=r, column=j+1, value=v)
    bg = LIGHT_BG if i % 2 == 0 else WHITE
    style_row(ws6, r, len(sh_headers), bg)
    if "Saccura" in row[3]:
        ws6.cell(row=r, column=1).font = Font(bold=True, color=NAVY)
    elif "Main Feedback" in row[2]:
        ws6.cell(row=r, column=1).font = Font(bold=True, color="DC2626")

ws6.freeze_panes = 'A3'

# ================================================================
# SAVE
# ================================================================
output_path = "/Users/jumbenylon/Documents/GitHub/Cooperative Bank/SG-2026-0101_CoopBank_Project_Tracker.xlsx"
wb.save(output_path)
print(f"Saved: {output_path}")
print(f"Tasks: {len(tasks)}")
print(f"Subtasks: {row - 3}")
print(f"Gantt rows: {len(gantt_tasks)}")
print(f"Stakeholders: {len(stakeholders)}")
