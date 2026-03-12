from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Alon Iter - CV.pdf"
PHOTO = ROOT / "images" / "Alon photo.JPG"


PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 36
TOP_Y = PAGE_HEIGHT - 34
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_X * 2)

TEXT = colors.HexColor("#1a2433")
MUTED = colors.HexColor("#5a6b80")
ACCENT = colors.HexColor("#0d786a")
BORDER = colors.HexColor("#d7dee8")
LIGHT = colors.HexColor("#f4f7fa")


def draw_wrapped_text(c, text, x, y, width, font_name="Helvetica", font_size=10, leading=14, color=TEXT):
    lines = simpleSplit(text, font_name, font_size, width)
    c.setFont(font_name, font_size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_bullets(c, items, x, y, width, font_name="Helvetica", font_size=9.6, leading=13.5):
    bullet_indent = 10
    text_width = width - bullet_indent - 6
    for item in items:
        lines = simpleSplit(item, font_name, font_size, text_width)
        c.setFillColor(TEXT)
        c.setFont(font_name, font_size)
        c.drawString(x, y, "•")
        for idx, line in enumerate(lines):
            c.drawString(x + bullet_indent, y - (idx * leading), line)
        y -= len(lines) * leading + 3
    return y


def section_heading(c, title, x, y, width):
    c.setFont("Helvetica-Bold", 11.2)
    c.setFillColor(TEXT)
    c.drawString(x, y, title.upper())
    c.setStrokeColor(BORDER)
    c.setLineWidth(1)
    c.line(x, y - 6, x + width, y - 6)
    return y - 20


def draw_link_row(c, y):
    segments = [
        ("054-4288272", None),
        ("aloniter99@gmail.com", "mailto:aloniter99@gmail.com"),
        ("Tel Aviv, Israel", None),
        ("LinkedIn", "https://www.linkedin.com/in/aloniter/"),
        ("GitHub", "https://github.com/aloniter"),
        ("Portfolio", "https://aloniter.github.io/portfolio/"),
    ]

    font_name = "Helvetica"
    font_size = 9.2
    sep = " | "
    total_width = 0
    for idx, (label, _) in enumerate(segments):
        total_width += stringWidth(label, font_name, font_size)
        if idx < len(segments) - 1:
            total_width += stringWidth(sep, font_name, font_size)

    x = (PAGE_WIDTH - total_width) / 2
    c.setFont(font_name, font_size)
    c.setFillColor(MUTED)

    for idx, (label, url) in enumerate(segments):
        label_width = stringWidth(label, font_name, font_size)
        c.drawString(x, y, label)
        if url:
            c.linkURL(url, (x, y - 2, x + label_width, y + 10), relative=0)
        x += label_width
        if idx < len(segments) - 1:
            c.drawString(x, y, sep)
            x += stringWidth(sep, font_name, font_size)


def generate_pdf(output_path: Path):
    c = canvas.Canvas(str(output_path), pagesize=A4)
    c.setTitle("Alon Iter - CV")
    c.setAuthor("Alon Iter")

    header_y = TOP_Y
    photo_size = 70
    if PHOTO.exists():
        c.drawImage(ImageReader(str(PHOTO)), MARGIN_X, header_y - photo_size + 4, width=photo_size, height=photo_size, mask="auto")
        c.setStrokeColor(BORDER)
        c.rect(MARGIN_X, header_y - photo_size + 4, photo_size, photo_size, stroke=1, fill=0)

    text_center_x = PAGE_WIDTH / 2 + 30
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(text_center_x, header_y - 4, "Alon Iter")

    c.setFont("Helvetica-Bold", 10.2)
    c.setFillColor(ACCENT)
    c.drawCentredString(text_center_x, header_y - 24, "Technical Operations Manager | Mobile Game Product & Delivery")
    draw_link_row(c, header_y - 42)

    y = header_y - 70

    y = section_heading(c, "Professional Summary", MARGIN_X, y, CONTENT_WIDTH)
    summary = (
        "Technical Operations Manager in live mobile gaming, experienced in coordinating feature delivery across "
        "Product, Monetization, QA, and R&D. Strong fit for Product Owner roles that require structured specs, "
        "cross-functional execution, KPI follow-up, and fast product iteration."
    )
    y = draw_wrapped_text(c, summary, MARGIN_X, y, CONTENT_WIDTH, font_size=10.4, leading=14.4)

    y -= 8
    y = section_heading(c, "Professional Experience", MARGIN_X, y, CONTENT_WIDTH)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(TEXT)
    c.drawString(MARGIN_X, y, "SuperPlay - Dice Dreams")
    c.setFont("Helvetica", 9.6)
    c.setFillColor(MUTED)
    c.drawRightString(MARGIN_X + CONTENT_WIDTH, y, "October 2024 - Present")
    y -= 14

    c.setFont("Helvetica-BoldOblique", 10)
    c.setFillColor(TEXT)
    c.drawString(MARGIN_X, y, "Technical Operations Manager")
    y -= 16

    experience_bullets = [
        "Coordinate live-game feature delivery across Product, Monetization, QA, and R&D teams.",
        "Turn priorities into structured deliverables, validation steps, and release-ready handoff materials.",
        "Support QA readiness through clearer checks, launch communication, and fast blocker handling.",
        "Track post-release KPIs, flag anomalies early, and drive follow-up actions with stakeholders.",
        "Improve recurring workflows to reduce friction and make execution more reliable.",
    ]
    y = draw_bullets(c, experience_bullets, MARGIN_X, y, CONTENT_WIDTH, font_size=9.7, leading=13.6)

    y -= 6
    column_top = y
    column_gap = 20
    left_width = 305
    right_width = CONTENT_WIDTH - left_width - column_gap
    left_x = MARGIN_X
    right_x = MARGIN_X + left_width + column_gap

    c.setStrokeColor(BORDER)
    c.line(right_x - 10, column_top + 8, right_x - 10, 40)

    left_y = section_heading(c, "Selected Projects", left_x, column_top, left_width)
    project_bullets = [
        "Lucky Tower - Designed a retention event concept with reward logic, KPI plan, and playable prototype.",
        "Merge Lab - Built a merge prototype with a live level editor and insights view for faster balancing.",
        "Draft21 - Built a snake-draft PWA that turns 21-player football team creation into a fast, fair flow.",
        "Inspector Pro - Shipped a workflow app used by a real company to replace a manual reporting flow.",
    ]
    left_y = draw_bullets(c, project_bullets, left_x, left_y, left_width, font_size=9.25, leading=13)

    left_y -= 4
    left_y = section_heading(c, "Education", left_x, left_y, left_width)
    left_y = draw_wrapped_text(
        c,
        "B.Sc. in Information Systems\nThe Academic College of Tel Aviv-Yaffo\nGraduated July 2024",
        left_x,
        left_y,
        left_width,
        font_size=9.5,
        leading=13.2,
    )

    left_y -= 6
    left_y = section_heading(c, "Languages", left_x, left_y, left_width)
    left_y = draw_wrapped_text(
        c,
        "Hebrew - Native\nEnglish - Fluent",
        left_x,
        left_y,
        left_width,
        font_size=9.5,
        leading=13.2,
    )

    right_y = section_heading(c, "Skills", right_x, column_top, right_width)
    skill_sections = [
        ("Product & Delivery", "Feature coordination, delivery planning, QA readiness, release notes, stakeholder alignment"),
        ("Game / Data Analysis", "KPI tracking, SQL, dashboards, spreadsheets, anomaly review"),
        ("Tools", "Jira, Confluence, Notion, Google Sheets, Slack, Monday"),
        ("Prototyping", "JavaScript, web app prototyping, Unity (basic), workflow automation"),
    ]

    for title, body in skill_sections:
        c.setFillColor(ACCENT)
        c.setFont("Helvetica-Bold", 9.6)
        c.drawString(right_x, right_y, title)
        right_y -= 12
        right_y = draw_wrapped_text(c, body, right_x, right_y, right_width, font_size=9.2, leading=12.5, color=TEXT)
        right_y -= 8

    c.save()


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    generate_pdf(OUTPUT)
