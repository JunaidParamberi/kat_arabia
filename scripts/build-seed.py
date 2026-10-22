#!/usr/bin/env python3
"""Generates seed/seed.json for the KAT Arabia EmDash site.

Run:  python3 scripts/build-seed.py
The seed defines block types, collections, menus and all launch content.
Edit copy here (or later in the admin) and re-run before a fresh install.
"""
import json
from pathlib import Path

URL_RE = "^(?:$|(?:https?://|mailto:|tel:|/(?!/)|#).+)$"
ANCHOR_RE = "^(?:$|[a-z][a-z0-9_-]*)$"


def f(slug, label, type_="string", **kw):
    d = {"slug": slug, "label": label, "type": type_}
    if type_ == "select" and "options" in kw:
        d.setdefault("validation", {})["options"] = kw.pop("options")
    d.update(kw)
    return d


def link(slug, label):
    return f(slug, label, "string", validation={"pattern": URL_RE})


def rep(slug, label, sub, min_items=0, max_items=20):
    v = {"subFields": sub, "maxItems": max_items}
    if min_items:
        v["minItems"] = min_items
    return f(slug, label, "repeater", validation=v)


ANCHOR = f("anchor_id", "Section ID (lowercase, for links like /#workforce)", validation={"pattern": ANCHOR_RE})
LABEL = f("label", "Section label (small text above the headline, e.g. 02 — About)")
HEADLINE = f("headline", "Headline", required=True)
HIGHLIGHT = f("highlight", "Highlighted end of headline (shown in accent colour)")
TONE = f("tone", "Background", "select", options=["paper", "sand", "night"], defaultValue="paper")


def block(slug, label, desc, fields):
    return {
        "slug": slug,
        "label": label,
        "description": desc,
        "category": "KAT Arabia",
        "currentVersion": 1,
        "versions": [{"version": 1, "fields": fields}],
    }


BLOCKS = [
    block("kat_hero", "Hero", "Full-bleed image hero with headline and buttons", [
        f("variant", "Size", "select", options=["home", "page"], defaultValue="page"),
        f("eyebrow", "Small text above the headline"),
        HEADLINE, HIGHLIGHT,
        f("subheadline", "Subheadline", "text"),
        f("primary_cta_label", "Primary button text"), link("primary_cta_url", "Primary button link"),
        f("secondary_cta_label", "Secondary button text"), link("secondary_cta_url", "Secondary button link"),
        f("image", "Background image", "image"),
        f("default_image", "Built-in image when none is chosen", "select",
          options=["hero-dusk", "gc-facade", "civil-interchange", "steel-erection", "plant-night", "mep", "equipment", "workforce"],
          defaultValue="hero-dusk"),
        f("breadcrumb", "Show breadcrumb", "boolean", defaultValue=False),
        ANCHOR,
    ]),
    block("kat_film", "Scroll film", "Pinned section where scrolling plays the construction film", [
        LABEL, HEADLINE,
        f("intro", "Intro", "text"),
        f("video", "Film (MP4, encoded with a keyframe on every frame)", "file"),
        f("poster", "Poster image (shown before the film loads)", "image"),
        rep("chapters", "Chapters", [
            f("title", "Chapter title", required=True),
            f("description", "Description", "text"),
            f("services", "Service lines involved"),
        ], min_items=1, max_items=8),
        ANCHOR,
    ]),
    block("kat_intro", "Intro + facts", "Section label, headline, body copy and an optional row of facts", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("body", "Body (leave a blank line between paragraphs)", "text"),
        rep("facts", "Facts", [f("value", "Value", required=True), f("label", "Label", required=True)], max_items=6),
        TONE, ANCHOR,
    ]),
    block("kat_capabilities", "Capabilities", "The service lines, as interactive tabs or a full grid", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("intro", "Intro", "text"),
        f("layout", "Layout", "select", options=["tabs", "grid"], defaultValue="tabs"),
        f("cta_label", "Button text"), link("cta_url", "Button link"),
        ANCHOR,
    ]),
    block("kat_workforce", "Workforce", "Workforce photo, copy, source countries, globe and buttons", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("caption", "Caption over the photo"),
        f("body", "Body", "text"),
        f("image", "Photo", "image"),
        f("countries", "Source countries (comma separated)", "text"),
        f("show_globe", "Show 3D globe", "boolean", defaultValue=True),
        f("primary_cta_label", "Primary button text"), link("primary_cta_url", "Primary button link"),
        f("secondary_cta_label", "Secondary button text"), link("secondary_cta_url", "Secondary button link"),
        ANCHOR,
    ]),
    block("kat_industries", "Industries", "Index of industries served, with hover image", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("intro", "Intro", "text"),
        ANCHOR,
    ]),
    block("kat_footprint", "Footprint", "Map with offices", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("intro", "Intro", "text"),
        rep("offices", "Offices", [
            f("city", "City", required=True),
            f("country", "Country"),
            f("role", "Role (e.g. Regional office)"),
            f("address", "Address", "text"),
            f("phone", "Phone"),
            f("primary", "Highlight on map", "boolean"),
        ], max_items=8),
        f("show_cards", "Show office cards", "boolean", defaultValue=False),
        ANCHOR,
    ]),
    block("kat_steps", "Numbered steps", "Numbered points: process, strengths or next steps", [
        LABEL, HEADLINE, HIGHLIGHT,
        rep("steps", "Steps", [f("title", "Title", required=True), f("text", "Text", "text")], min_items=1, max_items=9),
        f("columns", "Columns", "select", options=["3", "4"], defaultValue="4"),
        TONE, ANCHOR,
    ]),
    block("kat_split", "Image + text", "Half-width image beside copy and facts", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("body", "Body", "text"),
        f("image", "Image", "image"),
        f("default_image", "Built-in image when none is chosen", "select",
          options=["steel-erection", "workforce", "gc-facade", "plant-night", "mep", "equipment", "civil-interchange", "hero-dusk"],
          defaultValue="steel-erection"),
        f("image_right", "Image on the right", "boolean", defaultValue=False),
        rep("facts", "Facts", [f("value", "Value", required=True), f("label", "Label", required=True)], max_items=4),
        f("cta_label", "Button text"), link("cta_url", "Button link"),
        ANCHOR,
    ]),
    block("kat_hse", "HSE & Quality", "Safety statement and certifications", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("body", "Body", "text"),
        rep("certs", "Certifications", [f("code", "Standard (e.g. ISO 9001)", required=True), f("title", "Title"), f("note", "Note")], max_items=6),
        ANCHOR,
    ]),
    block("kat_clients", "Clients", "Logo wall", [
        LABEL, HEADLINE,
        rep("logos", "Logos", [f("name", "Client name", required=True), f("logo", "Logo", "image")], max_items=24),
        ANCHOR,
    ]),
    block("kat_cta", "Call to action", "Maroon band with a headline and buttons", [
        HEADLINE,
        f("primary_cta_label", "Primary button text"), link("primary_cta_url", "Primary button link"),
        f("secondary_cta_label", "Secondary button text"), link("secondary_cta_url", "Secondary button link"),
        ANCHOR,
    ]),
    block("kat_contact", "Contact + form", "Enquiry form with contact details", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("intro", "Intro", "text"),
        f("phone", "Phone"), f("email", "Email"),
        f("ksa_address", "KSA office address", "text"),
        f("uae_address", "UAE address", "text"),
        f("hours", "Working hours"),
        f("reply_note", "Reply-time note under the form"),
        f("dark", "Dark background", "boolean", defaultValue=False),
        ANCHOR,
    ]),
]

ALL_BLOCKS = [b["slug"] for b in BLOCKS]

COLLECTIONS = [
    {
        "slug": "pages", "label": "Pages", "labelSingular": "Page",
        "urlPattern": "/{slug}", "supports": ["drafts", "revisions", "preview", "seo"],
        "fields": [
            f("title", "Title", required=True),
            f("content", "Content", "blocks", validation={"allowedTypes": ALL_BLOCKS, "maxItems": 30}),
        ],
    },
    {
        "slug": "services", "label": "Services", "labelSingular": "Service",
        "urlPattern": "/services/{slug}", "supports": ["drafts", "revisions", "preview", "seo"],
        "fields": [
            f("title", "Title", required=True),
            f("number", "Number (01–99)", required=True),
            f("summary", "Summary (one sentence)", "text", required=True),
            f("description", "Description (leave a blank line between paragraphs)", "text"),
            f("image", "Image", "image"),
            f("default_image", "Built-in image when none is chosen", "select",
              options=["none", "gc-facade", "civil-interchange", "steel-erection", "plant-night", "mep", "equipment", "workforce", "hero-dusk"],
              defaultValue="none"),
            rep("scope", "Typical scope", [f("item", "Item", required=True)], max_items=12),
            rep("industries", "Industries served", [f("item", "Industry", required=True)], max_items=14),
            f("order", "Sort order", "integer", defaultValue=0),
        ],
    },
    {
        "slug": "industries", "label": "Industries", "labelSingular": "Industry",
        "supports": ["drafts", "revisions"],
        "fields": [
            f("title", "Title", required=True),
            f("number", "Number", required=True),
            f("image", "Image", "image"),
            f("default_image", "Built-in image when none is chosen", "select",
              options=["none", "plant-night", "steel-erection", "civil-interchange", "gc-facade", "mep", "equipment", "workforce", "hero-dusk"],
              defaultValue="none"),
            f("order", "Sort order", "integer", defaultValue=0),
        ],
    },
]

# ---------- content ----------

def k(i, t, **data):
    d = {"_type": t, "_version": 1, "_key": i}
    d.update({key: v for key, v in data.items() if v is not None})
    return d


SERVICES = [
    ("general-contracting", "01", "General Contracting", "gc-facade",
     "Design-and-build and build-only delivery of residential, commercial, government and industrial buildings under one contract.",
     ["Design & build", "Building works", "Fit-out", "Turnkey delivery"], ["Commercial", "Government", "Healthcare", "Hospitality"]),
    ("civil-infrastructure", "02", "Civil Infrastructure & Heavy Engineering", "civil-interchange",
     "Earthworks, roads, utilities, foundations and heavy civil structures for industrial cities and public infrastructure.",
     ["Earthworks & grading", "Roads & paving", "Utilities & networks", "Foundations"], ["Infrastructure", "Smart cities", "Logistics", "Marine"]),
    ("industrial-construction", "03", "Industrial Construction & Plant Services", "steel-erection",
     "New-build plant works, shutdowns, turnarounds and maintenance campaigns for process and manufacturing facilities.",
     ["Steel erection", "Shutdowns & turnarounds", "Plant maintenance", "Equipment setting"], ["Manufacturing", "Petrochemicals", "Mining"]),
    ("oil-gas-engineering", "04", "Oil & Gas Engineering", "plant-night",
     "Onshore and offshore field support, piping, mechanical and structural works, shutdowns and facility maintenance.",
     ["Piping", "Mechanical works", "Tie-ins", "Shutdown support"], ["Oil & gas", "Petrochemicals", "Energy"]),
    ("mep", "05", "MEP", "mep",
     "Mechanical, electrical and plumbing installation, testing and commissioning, with integrated electro-mechanical design.",
     ["HVAC", "Power & lighting", "Plumbing & drainage", "Fire & life safety"], ["Commercial", "Healthcare", "Hospitality", "Government"]),
    ("plant-equipment", "06", "Plant & Equipment", "equipment",
     "Heavy plant, cranes and equipment, supplied with operators to keep packages moving.",
     ["Cranes & lifting", "Earthmoving fleet", "Operators", "Fleet maintenance"], ["Infrastructure", "Mining", "Oil & gas"]),
    ("integrated-project-workforce", "07", "Integrated Project Workforce", "workforce",
     "Recruitment and rapid mobilisation of skilled and semi-skilled crews from twelve source countries.",
     ["Recruitment", "Trade testing", "Mobilisation", "Deployment"], ["All 14 industries"]),
    ("integrated-facility-management", "08", "Integrated Facility Management", "none",
     "Facility and building maintenance that keeps completed assets safe, compliant and operating after handover.",
     ["Hard FM", "Soft FM", "Operations & maintenance", "Asset care"], ["Government", "Healthcare", "Commercial", "Hospitality"]),
]

INDUSTRIES = ["Infrastructure", "Oil & gas", "Petrochemicals", "Energy", "Manufacturing", "Mining", "Commercial",
              "Government", "Healthcare", "Hospitality", "Logistics", "Marine", "Renewables", "Smart cities"]
IND_IMG = {"Oil & gas": "plant-night", "Petrochemicals": "steel-erection", "Infrastructure": "civil-interchange",
           "Commercial": "gc-facade", "Energy": "hero-dusk", "Manufacturing": "mep"}

COUNTRIES = "India, Nepal, Pakistan, Sri Lanka, Bangladesh, Philippines, Ghana, Kenya, Uganda, Sierra Leone, Cameroon, Burundi"

CHAPTERS = [
    {"title": "Ground", "description": "The plot is staked out on bare desert, pegs marking every line before a single column is poured.", "services": "Civil & heavy engineering · Plant & equipment · Workforce"},
    {"title": "Frame", "description": "A concrete frame climbs floor by floor under a single tower crane.", "services": "General contracting · Civil · Plant & equipment · Workforce"},
    {"title": "Climb", "description": "The structure keeps rising as a second crane joins, with glazing closing in from the base.", "services": "General contracting · Civil · Plant & equipment · Workforce"},
    {"title": "Skin", "description": "The glass façade wraps the tower from base to crown as the cranes finish the top floors.", "services": "General contracting · MEP · Plant & equipment · Workforce"},
    {"title": "Skyline", "description": "Cranes gone, plaza landscaped: the tower stands finished and operating against the skyline.", "services": "General contracting · MEP · Facility management · Workforce"},
]

FACTS = [{"value": "8", "label": "Service lines"}, {"value": "14", "label": "Industries served"},
         {"value": "12", "label": "Workforce source countries"}, {"value": "2026", "label": "Global operations from"}]

OFFICES = [
    {"city": "Al Jubail", "country": "Saudi Arabia", "role": "Regional office", "address": "KAT Arabia General Contracting\nEastern Province\n[Street, building, P.O. box]", "phone": "+966 53 181 4451", "primary": True},
    {"city": "Abu Dhabi", "country": "United Arab Emirates", "role": "KAT Group HQ", "address": "KAT Group\n[Street, building, P.O. box]", "phone": "[Phone]", "primary": False},
    {"city": "Dubai", "country": "United Arab Emirates", "role": "Regional office", "address": "KAT Group\n[Street, building, P.O. box]", "phone": "[Phone]", "primary": False},
    {"city": "Sharjah", "country": "United Arab Emirates", "role": "Regional office", "address": "KAT Group FZC LLC\n[Street, building, P.O. box]", "phone": "[Phone]", "primary": False},
]

CERTS = [{"code": "ISO 9001", "title": "Quality management", "note": "Certificate placeholder"},
         {"code": "ISO 14001", "title": "Environmental management", "note": "Certificate placeholder"},
         {"code": "ISO 45001", "title": "Occupational health & safety", "note": "Certificate placeholder"}]

CONTACT = dict(phone="+966 53 181 4451", email="info@katarabia.com",
               ksa_address="KAT Arabia General Contracting\nAl Jubail, Eastern Province\n[Street, building, P.O. box]",
               uae_address="KAT Group · Abu Dhabi, Dubai, Sharjah\n[Head office address]",
               hours="Sunday – Thursday · [08:00 – 17:00], local time per office",
               reply_note="We reply within [X] working days.")

HOME = [
    k("hero", "kat_hero", variant="home", eyebrow="KAT Arabia General Contracting · Global engineering & contracting",
      headline="Shaping possibilities, worldwide.",
      subheadline="Engineering, construction and workforce solutions for industrial, energy and infrastructure projects around the world.",
      primary_cta_label="Explore capabilities", primary_cta_url="/#capabilities",
      secondary_cta_label="Request prequalification", secondary_cta_url="/contact", default_image="hero-dusk"),
    k("film", "kat_film", label="01 — The film · From bare ground to skyline", headline="One partner. Every stage.",
      intro="Scroll and watch a project come to life — from survey pegs in the ground to an operating skyline, delivered by one contractor.",
      chapters=CHAPTERS, anchor_id="film"),
    k("capabilities", "kat_capabilities", label="03 — Capabilities", headline="Every discipline a project needs.", highlight="One contractor.",
      intro="Delivered under one contract, one HSE system and one point of accountability.", layout="tabs",
      cta_label="Discuss a package", cta_url="/contact", anchor_id="capabilities"),
    k("contact", "kat_contact", label="09 — Contact", headline="Let’s build the future", highlight="together.",
      intro="Project enquiries, vendor prequalification, manpower requests and careers.", dark=True, anchor_id="contact", **CONTACT),
]

ABOUT = [
    k("hero", "kat_hero", variant="page", eyebrow="About", headline="Your vision,", highlight="our execution.",
      subheadline="Integrated contracting for seamless project excellence worldwide, built on KAT Group experience.",
      default_image="gc-facade", breadcrumb=True),
    k("who", "kat_intro", label="01 — Who we are", headline="Building the future", highlight="since 2024.",
      body="KAT Arabia General Contracting, established in 2024, is a forward-looking contracting company delivering high-quality engineering, construction and infrastructure solutions to clients worldwide.\n\nOur integrated approach combines technical excellence, operational efficiency and structured project management, so execution stays seamless from design and engineering through construction, commissioning and maintenance.\n\nWe are committed to delivering sustainable, high-quality projects on time and within budget.",
      tone="paper"),
    k("how", "kat_steps", label="02 — How we deliver", headline="One partner across the whole project life.", columns="4", tone="paper",
      steps=[{"title": "Design & engineering", "text": "Buildability, value engineering and coordinated discipline design before the first peg goes in."},
             {"title": "Construction", "text": "Civil, structural, mechanical and electrical works under one site organisation."},
             {"title": "Commissioning", "text": "Testing, start-up and handover documentation, ready for the owner’s operations team."},
             {"title": "Maintenance", "text": "Facility and building maintenance that keeps completed assets performing."}]),
    k("group", "kat_split", label="03 — Part of KAT Group", headline="Group experience.", highlight="Global focus.",
      body="KAT Arabia brings KAT Group’s contracting and workforce capability to projects worldwide, with operations expanding from 2026 across a growing network of regional offices.",
      default_image="steel-erection", image_right=False, facts=FACTS),
    k("commitments", "kat_steps", label="04 — Our commitments", headline="Four promises on every project.", columns="4", tone="sand",
      steps=[{"title": "Safety", "text": "Zero-harm planning on every site, for every crew."},
             {"title": "Quality", "text": "Work delivered to specification and inspected before handover."},
             {"title": "Time & budget", "text": "Structured project controls that keep schedules and costs honest."},
             {"title": "Sustainability", "text": "Responsible methods, materials and energy use across our work."}]),
    k("cta", "kat_cta", headline="Registering KAT Arabia as a vendor?", primary_cta_label="Request prequalification pack",
      primary_cta_url="/contact?type=prequalification", secondary_cta_label="Contact us", secondary_cta_url="/contact"),
]

SERVICES_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="Services", headline="One partner for", highlight="complete project execution.",
      subheadline="Eight service lines, from design to commissioning and beyond, delivered under one contract and one HSE system.",
      default_image="equipment", breadcrumb=True),
    k("lines", "kat_capabilities", label="Service portfolio", headline="Eight service lines.", highlight="One accountable contractor.",
      layout="grid"),
    k("also", "kat_steps", label="Also delivered", headline="Specialist packages alongside the core lines.", columns="3", tone="sand",
      steps=[{"title": "Solar & energy solutions", "text": "Solar design, power distribution and energy-efficiency solutions."},
             {"title": "Camp construction & development", "text": "Workforce camps, modular set-ups, utility infrastructure and maintenance."},
             {"title": "Specialised personnel", "text": "Skilled crews deployed into client packages under our HSE system."}]),
    k("cta", "kat_cta", headline="Have a package to tender?", primary_cta_label="Send an enquiry", primary_cta_url="/contact",
      secondary_cta_label="Request prequalification", secondary_cta_url="/contact?type=prequalification"),
]

STRENGTHS = [
    k("hero", "kat_hero", variant="page", eyebrow="Strengths", headline="Why owners choose", highlight="KAT Arabia.",
      subheadline="Engineering depth, integrated execution and a workforce we mobilise ourselves.", default_image="plant-night", breadcrumb=True),
    k("key", "kat_steps", label="01 — Key strengths", headline="Six reasons we can be", highlight="trusted with your project.", columns="3", tone="paper",
      steps=[{"title": "Advanced engineering expertise", "text": "Civil, mechanical and electrical disciplines working from one coordinated design."},
             {"title": "Integrated project execution", "text": "From planning to on-site delivery, one team owns the outcome."},
             {"title": "Specialised personnel deployment", "text": "Skilled crews recruited and deployed from our own twelve-country pipeline."},
             {"title": "Rapid mobilisation", "text": "Scalable people, plant and equipment, ready to move across the region."},
             {"title": "Client-focused delivery", "text": "Timelines and regulatory compliance treated as non-negotiable."},
             {"title": "Safety, quality, sustainability", "text": "A single integrated management system across every site and service line."}]),
    k("workforce", "kat_split", label="02 — Workforce", headline="Crews we recruit, test", highlight="and mobilise ourselves.",
      body="Skilled and semi-skilled workers sourced from twelve countries — " + COUNTRIES + " — and deployed into projects worldwide, for our own packages or as manpower supply to clients.",
      default_image="workforce", image_right=True, cta_label="Request manpower", cta_url="/contact?type=manpower"),
    k("hse", "kat_hse", label="03 — HSE & Quality", headline="Safety is our culture.", highlight="Quality is our commitment.",
      body="One integrated management system for quality, environment and occupational health & safety.", certs=CERTS),
    k("cta", "kat_cta", headline="Need a contractor you can prequalify fast?", primary_cta_label="Request prequalification pack",
      primary_cta_url="/contact?type=prequalification"),
]

LOCATIONS = [
    k("hero", "kat_hero", variant="page", eyebrow="Locations", headline="Positioned for", highlight="rapid deployment.",
      subheadline="A growing global presence for efficient execution, streamlined logistics and fast mobilisation.",
      default_image="civil-interchange", breadcrumb=True),
    k("map", "kat_footprint", label="01 — Geographic presence", headline="Four bases.", highlight="One network.",
      intro="Our regional offices sit across key industrial corridors, positioned for fast mobilisation to projects worldwide.",
      offices=OFFICES, show_cards=True),
    k("cta", "kat_cta", headline="Need a team on site fast?", primary_cta_label="Talk to our team", primary_cta_url="/contact"),
]

CONTACT_PAGE = [
    k("contact", "kat_contact", label="Contact", headline="Let’s build", highlight="together.",
      intro="Delivering capability. Building long-term value. Tell us what you need and the right team will respond.", dark=False, **CONTACT),
    k("next", "kat_steps", label="What happens next", headline="Three steps from enquiry to mobilisation.", columns="3", tone="paper",
      steps=[{"title": "We review", "text": "Your enquiry goes to the right team: projects, procurement or workforce."},
             {"title": "We respond", "text": "A named contact follows up with documents, a meeting or a proposal."},
             {"title": "We mobilise", "text": "People, plant and equipment move to site on an agreed plan."}]),
]


def page(slug, title, content):
    return {"id": slug, "slug": slug, "status": "published", "data": {"title": title, "content": content}}


def menu_item(label, url, css=None):
    d = {"type": "custom", "label": label, "url": url}
    if css:
        d["cssClasses"] = css
    return d


seed = {
    "$schema": "https://emdashcms.com/seed.schema.json",
    "version": "1",
    "meta": {"name": "KAT Arabia", "description": "KAT Arabia General Contracting — global engineering & contracting", "author": "Moonframe Studio"},
    "settings": {"title": "KAT Arabia", "tagline": "Shaping possibilities, worldwide.", "seo": {"titleSeparator": "—"}},
    "blockTypes": BLOCKS,
    "collections": COLLECTIONS,
    "menus": [
        {"name": "primary", "label": "Primary Navigation", "items": [
            menu_item("About", "/about"), menu_item("Services", "/services"), menu_item("Strengths", "/strengths"),
            menu_item("Locations", "/locations"), menu_item("Contact", "/contact"), menu_item("Get in touch", "/contact", "button")]},
        {"name": "footer_company", "label": "Company", "items": [
            menu_item("About", "/about"), menu_item("Strengths", "/strengths"), menu_item("Locations", "/locations"),
            menu_item("Careers", "/contact?type=careers"), menu_item("Prequalification", "/contact?type=prequalification")]},
        {"name": "footer_services", "label": "Services", "items": [
            menu_item(s[2], f"/services/{s[0]}") for s in SERVICES]},
    ],
    "content": {
        "pages": [page("home", "Home", HOME), page("about", "About", ABOUT), page("services", "Services", SERVICES_PAGE),
                  page("strengths", "Strengths", STRENGTHS), page("locations", "Locations", LOCATIONS), page("contact", "Contact", CONTACT_PAGE)],
        "services": [
            {"id": f"svc-{s[0]}", "slug": s[0], "status": "published", "data": {
                "title": s[2], "number": s[1], "summary": s[4], "description": s[4], "default_image": s[3],
                "scope": [{"item": x} for x in s[5]], "industries": [{"item": x} for x in s[6]], "order": i + 1}}
            for i, s in enumerate(SERVICES)],
        "industries": [
            {"id": f"ind-{i+1:02d}", "slug": name.lower().replace(" & ", "-").replace(" ", "-"), "status": "published", "data": {
                "title": name, "number": f"{i+1:02d}", "default_image": IND_IMG.get(name, "none"), "order": i + 1}}
            for i, name in enumerate(INDUSTRIES)],
    },
}

out = Path(__file__).resolve().parent.parent / "seed" / "seed.json"
out.write_text(json.dumps(seed, indent="\t", ensure_ascii=False) + "\n")
print(f"wrote {out}")
