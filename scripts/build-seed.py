#!/usr/bin/env python3
"""Generates seed/seed.json for the KAT Arabia EmDash site.

Run:  python3 scripts/build-seed.py
The seed defines block types, collections, menus and all launch content.
Edit copy here (or later in the admin) and re-run before a fresh install.
"""
import json
import re
import sys
from pathlib import Path

URL_RE = "^(?:$|(?:https?://|mailto:|tel:|/(?!/)|#).+)$"
ANCHOR_RE = "^(?:$|[a-z][a-z0-9_-]*)$"

# The EmDash seed engine cannot write SEO records (they live in _emdash_seo,
# a table applySeed never touches), so deck meta is collected here and applied
# by scripts/apply-seo.mjs after seeding.
SEO_ROWS = []


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


# Keys of DEFAULT_IMAGES in src/lib/media.ts (the shipped stills in public/images).
IMAGES = ["hero-dusk", "gc-facade", "civil-interchange", "steel-erection", "plant-night", "mep", "equipment", "workforce",
          "ksa-vision", "engineers-site", "hse-site",
          "svc-building", "svc-civil", "svc-industrial", "svc-oil-gas", "svc-mep", "svc-energy", "svc-plant", "svc-facility",
          "ind-infrastructure", "ind-oil-gas", "ind-petrochemicals", "ind-manufacturing", "ind-mining", "ind-commercial",
          "ind-government", "ind-healthcare", "ind-hospitality", "ind-logistics", "ind-marine", "ind-renewables", "ind-smart-cities"]


def default_image(default):
    return f("default_image", "Built-in image when none is chosen", "select",
             options=["none"] + IMAGES if default == "none" else IMAGES,
             defaultValue=default)


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
        default_image("hero-dusk"),
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
        f("layout", "Layout", "select", options=["tabs", "grid", "cards"], defaultValue="tabs"),
        f("cta_label", "Button text"), link("cta_url", "Button link"),
        ANCHOR,
    ]),
    block("kat_workforce", "Workforce", "Workforce photo, copy, source countries, globe and buttons", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("caption", "Caption over the photo"),
        f("body", "Body", "text"),
        f("image", "Photo", "image"),
        default_image("workforce"),
        f("countries", "Source countries (comma separated)", "text"),
        f("show_globe", "Show 3D globe", "boolean", defaultValue=True),
        f("primary_cta_label", "Primary button text"), link("primary_cta_url", "Primary button link"),
        f("secondary_cta_label", "Secondary button text"), link("secondary_cta_url", "Secondary button link"),
        ANCHOR,
    ]),
    block("kat_industries", "Industries", "Photo tiles of the industries served", [
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
    block("kat_steps", "Numbered steps", "Numbered or icon points: process, strengths or next steps", [
        LABEL, HEADLINE, HIGHLIGHT,
        rep("steps", "Steps", [
            f("title", "Title", required=True), f("text", "Text", "text"),
            # Repeater sub-fields take select options at the top level, not under validation.
            {"slug": "icon", "label": "Icon (icon style only)", "type": "select",
             "options": ["layers", "flow", "globe", "bolt", "compass", "crane", "shield", "handshake"]},
        ], min_items=1, max_items=9),
        f("columns", "Columns", "select", options=["3", "4"], defaultValue="4"),
        f("style", "Style", "select", options=["numbers", "icons"], defaultValue="numbers"),
        TONE, ANCHOR,
    ]),
    block("kat_split", "Image + text", "Half-width image beside copy and facts", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("body", "Body", "text"),
        f("image", "Image", "image"),
        default_image("steel-erection"),
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
    block("kat_clients", "Clients", "Logo wall or scrolling logo strip", [
        LABEL, HEADLINE,
        rep("logos", "Logos (leave the logo empty to use the built-in brochure logo for that name)",
            [f("name", "Client name", required=True), f("logo", "Logo", "image")], max_items=30),
        f("layout", "Layout", "select", options=["grid", "marquee"], defaultValue="grid"),
        ANCHOR,
    ]),
    block("kat_cta", "Call to action", "Maroon band, or a photo band, with a headline and buttons", [
        HEADLINE,
        f("image", "Background photo (optional)", "image"),
        default_image("none"),
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
    block("kat_projects", "Projects", "Listing of published project profiles", [
        LABEL, HEADLINE, HIGHLIGHT,
        f("intro", "Intro", "text"),
        f("cta_label", "Button text"), link("cta_url", "Button link"),
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
            default_image("none"),
            rep("scope", "Typical scope", [f("item", "Item", required=True)], max_items=14),
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
            default_image("none"),
            f("order", "Sort order", "integer", defaultValue=0),
        ],
    },
    {
        "slug": "projects", "label": "Projects", "labelSingular": "Project",
        "supports": ["drafts", "revisions"],
        "fields": [
            f("title", "Title", required=True),
            f("summary", "Summary (one sentence)", "text", required=True),
            f("image", "Image", "image"),
            f("description", "Description (leave a blank line between paragraphs)", "text"),
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
    {
        "slug": "general-contracting", "number": "01",
        "title": "General Contracting & Building Construction",
        "image": "svc-building",
        "summary": "Commercial, residential, government, healthcare, education, hospitality and industrial buildings delivered by KAT Arabia in the UAE and Saudi Arabia.",
        "description": "KAT Arabia delivers integrated general contracting solutions across the commercial, residential, institutional, industrial, healthcare, hospitality and government sectors. Our project execution model emphasizes strict timeline adherence, cost management and consistent quality outcomes.\n\nBuilding works are supported by our MEP, civil, equipment and workforce capabilities, giving clients a single point of responsibility. Our teams work to specification, quality standards and applicable building regulations in each market.",
        "scope": ["Commercial developments", "Residential communities", "Government buildings", "Healthcare facilities",
                  "Educational institutions", "Hospitality projects", "Industrial buildings", "Warehouses and logistics facilities",
                  "Structural works", "Interior fit-out", "Building finishing", "Turnkey construction"],
        "industries": ["Commercial developments", "Government projects", "Healthcare", "Hospitality"],
    },
    {
        "slug": "civil-infrastructure", "number": "02",
        "title": "Civil Infrastructure & Heavy Engineering",
        "image": "svc-civil",
        "summary": "Roads, bridges, utility networks, water transmission, pipelines, marine works and structural engineering by KAT Arabia in the UAE and Saudi Arabia.",
        "description": "KAT Arabia delivers integrated civil engineering and heavy infrastructure solutions that support transportation networks, utilities, industrial expansion and urban development.\n\nOur infrastructure teams are supported by modern plant and equipment and certified operators, with engineering supervision and quality control throughout each project.",
        "scope": ["Roads and highways", "Bridges and flyovers", "Utility networks", "Water transmission systems",
                  "Drainage infrastructure", "Pipeline installation", "Earthworks and excavation", "Marine infrastructure",
                  "Site development", "Industrial infrastructure", "Concrete structures", "Structural engineering works"],
        "industries": ["Infrastructure and transportation", "Smart cities", "Logistics", "Marine"],
    },
    {
        "slug": "industrial-construction", "number": "03",
        "title": "Industrial Construction & Plant Services",
        "image": "svc-industrial",
        "summary": "Construction, installation, commissioning, shutdown and maintenance services for manufacturing, petrochemical, mining, power and process facilities.",
        "description": "KAT Arabia supports industrial growth through specialized engineering, construction and technical solutions for manufacturing, petrochemical, mining, power generation and industrial facilities.\n\nWe combine construction, mechanical installation, equipment and skilled workforce in one organization, enabling rapid mobilization for new construction, expansion and shutdown work.",
        "scope": ["Manufacturing facilities", "Petrochemical plants", "Power plants", "Process industries",
                  "Plant expansion", "Structural steel works", "Mechanical installation", "Equipment installation",
                  "Commissioning support", "Shutdown services", "Industrial maintenance", "Turnkey EPC solutions"],
        "industries": ["Manufacturing", "Petrochemicals", "Mining and metals"],
    },
    {
        "slug": "oil-gas-engineering", "number": "04",
        "title": "Oil & Gas Engineering Services",
        "image": "svc-oil-gas",
        "summary": "Engineering, construction, maintenance and technical support across upstream, midstream and downstream oil and gas, onshore and offshore.",
        "description": "KAT Arabia provides engineering, construction, maintenance and technical support services across upstream, midstream and downstream oil and gas operations, both onshore and offshore.\n\nAll operations comply with international safety standards and local regulations, supporting reliability and operational excellence.",
        "scope": ["Pipeline construction", "Plant construction", "Mechanical works", "Piping fabrication and installation",
                  "Tank and pressure vessel services", "Structural steel works", "Equipment installation", "Commissioning support",
                  "Shutdown and turnaround services", "Asset integrity support", "Industrial maintenance",
                  "Facility maintenance and upgrades", "Field support services", "Technical and engineering workforce support"],
        "industries": ["Oil and gas", "Petrochemicals", "Energy and utilities"],
    },
    {
        "slug": "mep", "number": "05",
        "title": "Mechanical, Electrical & Plumbing (MEP) and Electro-Mechanical Solutions",
        "seo_title": "MEP & Electro-Mechanical Solutions | KAT Arabia",
        "image": "svc-mep",
        "summary": "HVAC, electrical, plumbing, fire fighting, fire alarm, ELV, building automation, instrumentation, testing and commissioning by KAT Arabia.",
        "description": "KAT Arabia delivers complete MEP and electro-mechanical solutions that enhance building performance, operational efficiency and sustainability, from installation through testing, commissioning and maintenance.\n\nMechanical, electrical and plumbing disciplines are coordinated within a single team and delivered either as part of a building project or as a standalone package.",
        "scope": ["HVAC systems", "Electrical installations", "Power distribution", "Plumbing systems",
                  "Fire fighting systems", "Fire alarm systems", "ELV systems", "Building automation",
                  "Instrumentation and control services", "Electro-mechanical integration", "Testing and commissioning",
                  "Preventive maintenance", "HSE and compliance support"],
        "industries": ["Commercial developments", "Healthcare", "Hospitality", "Government projects"],
    },
    {
        "slug": "energy-electrical-solar", "number": "06",
        "title": "Energy, Electrical & Solar Solutions",
        "image": "svc-energy",
        "summary": "Electrical installation, solar system design and implementation, power distribution and energy efficiency solutions for infrastructure and industrial projects.",
        "description": "KAT Arabia delivers modern energy solutions for infrastructure and industrial projects, helping clients optimize energy usage while integrating sustainable practices into their facilities.\n\nOur electrical and engineering teams support projects from design through installation and ongoing maintenance.",
        "scope": ["Electrical installation and maintenance", "Solar system design and implementation",
                  "Power distribution systems", "Energy efficiency solutions"],
        "industries": ["Energy and utilities", "Infrastructure and transportation", "Renewable energy"],
    },
    {
        "slug": "engineering-contracting-project-management", "number": "07",
        "title": "Engineering, Contracting & Project Management",
        "image": "engineers-site",
        "summary": "Civil, mechanical and electrical contracting, design and engineering, project management and site supervision by KAT Arabia.",
        "description": "Our engineering division is equipped to handle technically demanding projects across multiple disciplines. Experienced engineers and technical supervisors ensure that every phase of a project is executed according to strict specifications, quality standards and best practice.\n\nOur integrated project execution model combines planning, technical supervision and on-site delivery, supporting seamless execution from engineering and construction through commissioning and maintenance.",
        "scope": ["Civil, mechanical and electrical contracting", "Civil engineering and structural works",
                  "Mechanical installation and maintenance", "Electrical systems and power distribution",
                  "Electro-mechanical integration", "Design and engineering", "Project management and site supervision",
                  "Turnkey contracting solutions"],
        "industries": ["Commercial developments", "Infrastructure and transportation", "Government projects"],
    },
    {
        "slug": "plant-equipment", "number": "08",
        "title": "Plant & Equipment Solutions",
        "image": "svc-plant",
        "summary": "Cranes, excavators, loaders, forklifts, generators and material handling equipment supplied with certified operators.",
        "description": "KAT Arabia provides modern construction equipment and certified operators that support productivity, safety and operational efficiency at every stage of project delivery.\n\nEquipment is supplied with certified operators and supported by experienced professionals, and is coordinated with our construction and workforce teams.",
        "scope": ["Mobile cranes", "Crawler cranes", "Excavators", "Bulldozers", "Wheel loaders", "Backhoe loaders",
                  "Rollers", "Forklifts", "Telehandlers", "Boom lifts", "Material handling equipment", "Generators"],
        "industries": ["Infrastructure and transportation", "Mining and metals", "Oil and gas"],
    },
    {
        "slug": "integrated-facility-management", "number": "09",
        "title": "Integrated Facility Management",
        "image": "svc-facility",
        "summary": "Hard and soft facility management, building, MEP and civil maintenance, asset and energy management by KAT Arabia.",
        "description": "KAT Arabia delivers integrated facility management and technical maintenance solutions that preserve asset value and ensure long-term operational reliability.\n\nTechnical and operational services are delivered under one contract, with maintenance planned to protect asset performance across the full lifecycle.",
        "scope": ["Hard facility management", "Soft facility management", "Building maintenance", "MEP maintenance",
                  "Civil maintenance", "Preventive maintenance", "Corrective maintenance", "Asset management",
                  "Energy management", "Industrial cleaning", "Technical support", "Landscaping and grounds maintenance"],
        "industries": ["Government projects", "Healthcare", "Commercial developments", "Hospitality"],
    },
    {
        "slug": "camp-construction-maintenance", "number": "10",
        "title": "Camp Construction & Maintenance",
        "image": "steel-erection",
        "summary": "Labor camp construction, modular camp setup, utility infrastructure and camp maintenance services by KAT Arabia.",
        "description": "KAT Arabia provides complete solutions for workforce accommodation and site infrastructure. Our designs prioritize functionality, compliance, safety and comfort, supporting smooth operations for project teams.\n\nCamp construction, utilities and ongoing maintenance are delivered by one contractor, supported by our workforce and facility management teams.",
        "scope": ["Labor camp construction", "Modular camp setup", "Utility infrastructure", "Camp maintenance services"],
        "industries": ["Infrastructure and transportation", "Mining and metals", "Oil and gas"],
    },
    {
        "slug": "integrated-project-workforce", "number": "11",
        "title": "Project Workforce Solutions",
        "image": "workforce",
        "summary": "Project workforce supply, global talent acquisition, executive search, trade testing and large-scale mobilization from KAT Group's in-house recruitment division.",
        "description": "Backed by KAT Group's dedicated in-house international recruitment division, KAT Arabia provides integrated workforce solutions that enable clients to mobilize skilled professionals quickly, efficiently and confidently. Our network supports engineering, infrastructure, industrial, oil and gas, and maintenance projects by sourcing, assessing, mobilizing and managing qualified professionals.\n\nWe support clients across every stage of project execution, with flexible deployment aligned to project requirements and rapid mobilization to meet project timelines.",
        "scope": ["Project workforce supply", "Global talent acquisition", "Executive search",
                  "Engineering and technical recruitment", "Trade testing and competency assessment",
                  "Large-scale workforce mobilization", "Shutdown and turnaround teams", "Workforce management"],
        "industries": ["All 14 industries"],
    },
]

# Short labels for the footer's Services column (full titles wrap badly there)
FOOTER_SERVICE_LABELS = {
    "general-contracting": "General Contracting",
    "civil-infrastructure": "Civil Infrastructure",
    "industrial-construction": "Industrial Construction",
    "oil-gas-engineering": "Oil & Gas Engineering",
    "mep": "MEP & Electro-Mechanical",
    "energy-electrical-solar": "Energy, Electrical & Solar",
    "engineering-contracting-project-management": "Engineering & Project Management",
    "plant-equipment": "Plant & Equipment",
    "integrated-facility-management": "Facility Management",
    "camp-construction-maintenance": "Camp Construction",
    "integrated-project-workforce": "Project Workforce",
}

INDUSTRIES = ["Infrastructure and transportation", "Oil and gas", "Petrochemicals", "Energy and utilities", "Manufacturing",
              "Mining and metals", "Commercial developments", "Government projects", "Healthcare", "Hospitality",
              "Logistics", "Marine", "Renewable energy", "Smart cities"]
IND_IMG = {"Infrastructure and transportation": "ind-infrastructure", "Oil and gas": "ind-oil-gas",
           "Petrochemicals": "ind-petrochemicals", "Energy and utilities": "plant-night", "Manufacturing": "ind-manufacturing",
           "Mining and metals": "ind-mining", "Commercial developments": "ind-commercial", "Government projects": "ind-government",
           "Healthcare": "ind-healthcare", "Hospitality": "ind-hospitality", "Logistics": "ind-logistics", "Marine": "ind-marine",
           "Renewable energy": "ind-renewables", "Smart cities": "ind-smart-cities"}

COUNTRIES = "India, Nepal, Pakistan, Sri Lanka, Bangladesh, Philippines, Ghana, Kenya, Uganda, Sierra Leone, Cameroon, Burundi"

CHAPTERS = [
    {"title": "Ground", "description": "The plot is staked out on bare desert, pegs marking every line before a single column is poured.", "services": "Civil & heavy engineering · Plant & equipment · Workforce"},
    {"title": "Frame", "description": "A concrete frame climbs floor by floor under a single tower crane.", "services": "General contracting · Civil · Plant & equipment · Workforce"},
    {"title": "Climb", "description": "The structure keeps rising as a second crane joins, with glazing closing in from the base.", "services": "General contracting · Civil · Plant & equipment · Workforce"},
    {"title": "Skin", "description": "The glass façade wraps the tower from base to crown as the cranes finish the top floors.", "services": "General contracting · MEP · Plant & equipment · Workforce"},
    {"title": "Skyline", "description": "Cranes gone, plaza landscaped: the tower stands finished and operating against the skyline.", "services": "General contracting · MEP · Facility management · Workforce"},
]

FACTS = [{"value": "11", "label": "Service lines"}, {"value": "14", "label": "Industries served"},
         {"value": "12", "label": "Workforce source countries"}, {"value": "4", "label": "Offices in the UAE & KSA"}]

KSA_PHONE = "+966 53 181 4451"

OFFICES = [
    {"city": "Abu Dhabi", "country": "United Arab Emirates", "role": "Corporate headquarters",
     "address": "Foodco Building, Salam Street, Abu Dhabi", "primary": True},
    {"city": "Dubai", "country": "United Arab Emirates", "role": "Regional office",
     "address": "55, BIN Dasmal Building 1, Al Quoz Industrial Area 1, Dubai", "primary": False},
    {"city": "Sharjah", "country": "United Arab Emirates", "role": "Regional office",
     "address": "1201, Crystal Tower, Corniche Street, Al Majaz 1, Sharjah", "primary": False},
    {"city": "Al Jubail", "country": "Saudi Arabia", "role": "KSA office",
     "address": "Abu Al Hassan Ibn Al Jawzi St, Tebah District, Al Jubail, P.O. 35513", "phone": KSA_PHONE, "primary": False},
]

CONTACT = dict(email="info@katarabia.com", phone=KSA_PHONE,
               ksa_address="KAT Arabia General Contracting Co.\nAbu Al Hassan Ibn Al Jawzi St, Tebah District, Al Jubail, P.O. 35513",
               uae_address="Abu Dhabi: Foodco Building, Salam Street, Abu Dhabi\nDubai: 55, BIN Dasmal Building 1, Al Quoz Industrial Area 1, Dubai\nSharjah: 1201, Crystal Tower, Corniche Street, Al Majaz 1, Sharjah",
               hours=None,  # add once the client confirms office hours
               reply_note=None)

CLIENT_NAMES = ["Saudi Aramco", "SABIC", "Eagle Marine", "Zamil Group", "Concord Stars Contracting", "GazMin Motors", "APCC",
                "Sobha Constructions", "Azizi", "Torri Contracting", "Aroma International Building Contracting",
                "Cylingas Engineering & Construction", "General Construction Co.", "Shapoorji Pallonji", "Bahri & Mazroei",
                "ACE Contracting", "Larsen & Toubro", "Ma'aden", "The Deep Seafood Company", "noon", "Khansaheb Group",
                "Oasis Hills Landscape Services", "Pacific Marine Engineering", "Sierra Contracting", "Plante", "GPTC",
                "Sinopec", "Petroserve International", "SsangYong"]
CLIENT_LOGOS = [{"name": n} for n in CLIENT_NAMES]

WHY = [
    {"icon": "layers", "title": "Integrated engineering & contracting", "text": "Engineering, construction, plant and people under one organization."},
    {"icon": "flow", "title": "End-to-end delivery", "text": "One partner accountable from planning to handover."},
    {"icon": "globe", "title": "In-house global recruitment", "text": "KAT Group's own division sources and tests every crew."},
    {"icon": "bolt", "title": "Rapid mobilization", "text": "Skilled teams on site when the programme needs them."},
    {"icon": "compass", "title": "Engineering-led execution", "text": "Civil, mechanical and electrical engineers lead every job."},
    {"icon": "crane", "title": "Modern plant & equipment", "text": "Our own fleet, run by certified operators."},
    {"icon": "shield", "title": "Safety-driven culture", "text": "One integrated HSE and quality system on every site."},
    {"icon": "handshake", "title": "Long-term partnerships", "text": "Clients who come back, project after project."},
]

HOME = [
    k("hero", "kat_hero", variant="home", eyebrow="Saudi Arabia · United Arab Emirates",
      headline="Engineering and Contracting Solutions", highlight="Across Industries",
      subheadline="Construction, infrastructure, industrial and energy projects across the UAE and Saudi Arabia, backed by our own equipment and workforce.",
      primary_cta_label="Our Services", primary_cta_url="/services",
      secondary_cta_label="Contact Us", secondary_cta_url="/contact", default_image="hero-dusk"),
    k("clients", "kat_clients", label="Our clients", headline="Trusted by the region's leading operators.",
      logos=CLIENT_LOGOS, layout="marquee", anchor_id="clients"),
    k("capabilities", "kat_capabilities", label="Services", headline="Construction to commissioning,", highlight="one partner.",
      intro="Eleven service lines under one contract and one HSE system, from building and civil works to MEP, plant and project workforce.",
      layout="cards", cta_label="All services", cta_url="/services", anchor_id="services"),
    k("film", "kat_film", label="From bare ground to skyline", headline="One partner. Every stage.",
      intro="Scroll to watch a project rise, delivered by one contractor.",
      chapters=[{key: v for key, v in c.items() if key != "services"} for c in CHAPTERS], anchor_id="film"),
    k("why", "kat_steps", label="Why KAT Arabia", headline="One partner.", highlight="Multiple capabilities.",
      columns="4", style="icons", tone="night", steps=WHY, anchor_id="why"),
    k("workforce", "kat_workforce", label="Workforce", headline="The people behind", highlight="every project.",
      caption="Skilled crews, sourced and tested in-house",
      body="KAT Group's in-house recruitment division sources, tests and mobilizes engineers, supervisors and trades from twelve countries for engineering, industrial, oil and gas and maintenance projects.",
      default_image="hse-site", countries=COUNTRIES, show_globe=True,
      primary_cta_label="Request manpower", primary_cta_url="/contact?type=manpower",
      secondary_cta_label="Workforce services", secondary_cta_url="/services/integrated-project-workforce",
      anchor_id="workforce"),
    k("industries", "kat_industries", label="Industries", headline="The sectors driving", highlight="the region's growth.",
      intro="From energy and petrochemicals to healthcare and smart cities.",
      anchor_id="industries"),
    k("presence", "kat_footprint", label="Our presence", headline="Four bases.", highlight="One network.",
      intro="Abu Dhabi, Dubai and Sharjah in the UAE, and Al Jubail in Saudi Arabia.",
      offices=OFFICES, show_cards=True, anchor_id="presence"),
    k("cta", "kat_cta", headline="Let's build the future together.", default_image="ksa-vision",
      primary_cta_label="Discuss your project", primary_cta_url="/contact",
      secondary_cta_label="Request manpower", secondary_cta_url="/contact?type=manpower"),
]

ABOUT = [
    k("hero", "kat_hero", variant="page", eyebrow="About", headline="Your vision,", highlight="our execution.",
      subheadline="Integrated contracting for seamless project excellence worldwide, built on KAT Group experience.",
      default_image="gc-facade", breadcrumb=True),
    k("overview", "kat_intro", label="01 — Company Overview", headline="Part of KAT Group,", highlight="delivering worldwide.",
      body="KAT Arabia General Contracting is an engineering and contracting company serving government entities, EPC contractors, industrial operators and private sector clients.\n\nWe are part of KAT Group, a diversified multinational business group headquartered in the United Arab Emirates. Our teams combine international standards with local execution to deliver reliable, sustainable and value-driven projects across the region.",
      tone="paper"),
    k("whatwedo", "kat_split", label="02 — What We Do", headline="From contracting to workforce,", highlight="one organization.",
      body="Our capabilities cover general contracting, civil infrastructure, industrial construction, oil and gas services, MEP, energy solutions, plant and equipment, facility management, camp construction and workforce solutions.\n\nBy combining engineering expertise, experienced teams and in-house resources, KAT Arabia delivers integrated project execution with consistency, efficiency and accountability.",
      default_image="steel-erection", image_right=True, facts=FACTS),
    k("approach", "kat_steps", label="03 — Our Approach", headline="How we", highlight="work.", columns="3", tone="sand",
      steps=[{"title": "Integrated engineering and contracting.", "text": "One organization accountable from planning to completion."},
             {"title": "Advanced engineering expertise.", "text": "Civil, mechanical and electrical disciplines working to strict specifications and quality standards."},
             {"title": "In-house workforce capability.", "text": "A dedicated international recruitment division supporting rapid mobilization of skilled professionals."},
             {"title": "Modern plant and equipment.", "text": "Certified operators and experienced professionals supporting productivity and safety."},
             {"title": "Client-focused execution.", "text": "Timelines, quality and regulatory compliance treated as non-negotiable."}]),
    k("presence", "kat_intro", label="04 — Our Presence", headline="Four bases.", highlight="One network.",
      body="With offices in Abu Dhabi, Dubai and Sharjah in the United Arab Emirates, and in Al Jubail in the Kingdom of Saudi Arabia, we combine regional presence with global capability.",
      tone="paper"),
]

SERVICES_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="Services", headline="Our Services",
      subheadline="KAT Arabia provides a comprehensive range of engineering, construction, infrastructure and support services designed to meet the evolving needs of clients in the UAE and Saudi Arabia. From general contracting and civil infrastructure to industrial construction, oil and gas services, MEP, energy solutions, facility management, camp construction and workforce solutions, we deliver integrated capabilities under one accountable organization.",
      default_image="equipment", breadcrumb=True),
    k("lines", "kat_capabilities", label="Service portfolio", headline="Eleven service lines.", highlight="One accountable contractor.",
      layout="grid"),
    k("cta", "kat_cta", headline="Discuss Your Project", primary_cta_label="Contact Us", primary_cta_url="/contact"),
]

INDUSTRIES_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="Industries", headline="The industries", highlight="we serve.",
      subheadline="KAT Arabia supports the industries driving growth in the UAE and Saudi Arabia, delivering integrated solutions across the region’s most vital sectors.",
      default_image="plant-night", breadcrumb=True),
    k("list", "kat_industries", label="01 — Industries", headline="Fourteen sectors.", highlight="One contractor.",
      intro="Integrated solutions delivered under one contract and one HSE system.", anchor_id="industries"),
    k("cta", "kat_cta", headline="Discuss Your Project", primary_cta_label="Contact Us", primary_cta_url="/contact"),
]

PROJECTS_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="Projects", headline="Selected project", highlight="profiles.",
      subheadline="Our project portfolio includes building construction, civil infrastructure, industrial plant works, oil and gas facilities, MEP installations, camp construction and facility management projects.",
      default_image="steel-erection", breadcrumb=True),
    k("list", "kat_projects", label="01 — Portfolio", headline="Our project work", highlight="includes.",
      intro="Building construction · Civil infrastructure · Industrial plant works · Oil and gas facilities · MEP installations · Camp construction · Facility management\n\nRepresentative project profiles are being prepared for publication.",
      cta_label="Send an enquiry", cta_url="/contact", anchor_id="projects"),
    k("cta", "kat_cta", headline="Discuss Your Project", primary_cta_label="Contact Us", primary_cta_url="/contact"),
]

HSE_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="HSE & Quality", headline="Safety is our culture.", highlight="Quality is our commitment.",
      subheadline="KAT Arabia applies these principles across every project, site and service.",
      default_image="plant-night", breadcrumb=True),
    k("body", "kat_hse", label="01 — Commitment", headline="Health, safety, environment,", highlight="quality assurance.",
      body="KAT Arabia is committed to protecting people, the environment and the assets entrusted to us. Health and safety, environmental responsibility and quality assurance are integrated into every stage of our engineering and contracting operations.\n\nAreas of focus: health, safety and environment · quality assurance and quality control · regulatory compliance · incident prevention and risk management · workplace health and monitoring · contractor and supplier HSE management · environmental protection and sustainability · emergency preparedness and response · continuous improvement · training and competency · client and stakeholder confidence · legal and industry alignment.",
      certs=[]),
]

CLIENTS_PAGE = [
    k("hero", "kat_hero", variant="page", eyebrow="Clients", headline="Success built on", highlight="long-term partnerships.",
      subheadline="KAT Arabia serves government entities, EPC contractors, industrial operators, developers and private sector clients across the UAE and Saudi Arabia.",
      default_image="gc-facade", breadcrumb=True),
    k("logos", "kat_clients", label="Clients", headline="Trusted across sectors.",
      logos=CLIENT_LOGOS, layout="grid", anchor_id="clients"),
    k("cta", "kat_cta", headline="Discuss Your Project", primary_cta_label="Contact Us", primary_cta_url="/contact"),
]

CONTACT_PAGE = [
    k("contact", "kat_contact", label="Contact Us", headline="Get in touch", highlight="with KAT Arabia.",
      intro="Whether you are developing critical infrastructure, expanding industrial operations or delivering complex engineering projects, KAT Arabia is ready to be your engineering and contracting partner.",
      dark=False, **CONTACT),
]


def page(slug, title, content, seo=None):
    if seo:
        SEO_ROWS.append({"collection": "pages", "slug": slug,
                         "title": seo.get("title"), "description": seo.get("description")})
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
            menu_item("About", "/about"), menu_item("Services", "/services"), menu_item("Industries", "/industries"),
            menu_item("Projects", "/projects"), menu_item("HSE & Quality", "/hse-quality"), menu_item("Clients", "/clients"),
            menu_item("Contact", "/contact"), menu_item("Get in touch", "/contact", "button")]},
        {"name": "footer_company", "label": "Company", "items": [
            menu_item("About", "/about"), menu_item("Industries", "/industries"), menu_item("Projects", "/projects"),
            menu_item("HSE & Quality", "/hse-quality"), menu_item("Clients", "/clients"),
            menu_item("Careers", "/contact?type=careers"), menu_item("Prequalification", "/contact?type=prequalification")]},
        {"name": "footer_services", "label": "Services", "items": [
            menu_item(FOOTER_SERVICE_LABELS.get(s["slug"], s["title"]), f"/services/{s['slug']}") for s in SERVICES]},
        {"name": "footer_contact", "label": "Contact", "items": [
            menu_item("info@katarabia.com", "mailto:info@katarabia.com"),
            menu_item("Abu Dhabi, United Arab Emirates", "/contact"), menu_item("Al Jubail, Saudi Arabia", "/contact"),
            menu_item("Get in touch", "/contact")]},
    ],
    "content": {
        "pages": [
            page("home", "Home", HOME,
                 {"title": "KAT Arabia General Contracting | Engineering and Contracting in the UAE and Saudi Arabia",
                  "description": "KAT Arabia delivers construction, infrastructure, industrial, oil and gas, and building services projects across the UAE and Saudi Arabia."}),
            page("about", "About", ABOUT,
                 {"title": "About Us | KAT Arabia General Contracting"}),
            page("services", "Services", SERVICES_PAGE,
                 {"title": "Our Services | KAT Arabia General Contracting",
                  "description": "General contracting, civil infrastructure, industrial construction, oil and gas, MEP, energy, facility management, equipment, camps and workforce solutions across the UAE and Saudi Arabia."}),
            page("industries", "Industries", INDUSTRIES_PAGE,
                 {"title": "Industries We Serve | KAT Arabia"}),
            page("projects", "Projects", PROJECTS_PAGE,
                 {"title": "Our Projects | KAT Arabia"}),
            page("hse-quality", "HSE & Quality", HSE_PAGE,
                 {"title": "HSE & Quality | KAT Arabia"}),
            page("clients", "Clients", CLIENTS_PAGE,
                 {"title": "Our Clients | KAT Arabia"}),
            page("contact", "Contact", CONTACT_PAGE,
                 {"title": "Contact Us | KAT Arabia General Contracting"}),
        ],
        "services": [
            {"id": f"svc-{s['slug']}", "slug": s["slug"], "status": "published", "data": {
                "title": s["title"], "number": s["number"], "summary": s["summary"], "description": s["description"],
                "default_image": s["image"],
                "scope": [{"item": x} for x in s["scope"]], "industries": [{"item": x} for x in s["industries"]],
                "order": i + 1}}
            for i, s in enumerate(SERVICES)],
        "industries": [
            {"id": f"ind-{i+1:02d}", "slug": name.lower().replace(" & ", "-").replace(" ", "-"), "status": "published", "data": {
                "title": name, "number": f"{i+1:02d}", "default_image": IND_IMG.get(name, "none"), "order": i + 1}}
            for i, name in enumerate(INDUSTRIES)],
    },
}

# ---------- checks ----------

def _strings(node, path=""):
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, dict):
        for key, val in node.items():
            yield from _strings(val, f"{path}.{key}")
    elif isinstance(node, list):
        for i, val in enumerate(node):
            yield from _strings(val, f"{path}[{i}]")


_problems = [f"placeholder token in {where}: {text!r}" for where, text in _strings(seed["content"])
             if re.search(r"\[[^\]]*\]", text)]
_svc_imgs = [s["image"] for s in SERVICES if s["image"] != "none"]
_ind_imgs = [v for v in IND_IMG.values()]
if len(set(_svc_imgs + _ind_imgs)) != len(_svc_imgs + _ind_imgs):
    _problems.append("services and industries must each map to a different built-in image")
if any(img not in IMAGES for img in _svc_imgs + _ind_imgs):
    _problems.append("a service or industry maps to an unknown image key")
if len({n.lower() for n in INDUSTRIES}) != len(INDUSTRIES):
    _problems.append("duplicate industry titles")
if _problems:
    sys.exit("seed checks failed:\n  " + "\n  ".join(_problems))

out = Path(__file__).resolve().parent.parent / "seed" / "seed.json"
out.write_text(json.dumps(seed, indent="\t", ensure_ascii=False) + "\n")
print(f"wrote {out}")

for s in SERVICES:
    SEO_ROWS.append({"collection": "services", "slug": s["slug"],
                     "title": s.get("seo_title") or f"{s['title']} | KAT Arabia",
                     "description": s["summary"]})
seo_out = out.parent / "seo.json"
seo_out.write_text(json.dumps(SEO_ROWS, indent="\t", ensure_ascii=False) + "\n")
print(f"wrote {seo_out} ({len(SEO_ROWS)} SEO records)")
