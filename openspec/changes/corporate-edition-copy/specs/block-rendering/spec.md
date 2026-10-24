# Spec Delta

## MODIFIED Requirements

### Requirement: Contact block renders the enquiry form

`kat_contact` SHALL render the enquiry form with its category select (Project / Prequalification / Manpower / Careers), name, company, email, phone, country, project type, location, message, and tender-document attachment control, plus contact details, addresses, hours, and reply note, posting to `/api/enquiry`; `dark` SHALL switch the section to the night background.

#### Scenario: Form submission

- **WHEN** a visitor submits the form with valid fields
- **THEN** it posts to `/api/enquiry` and lands back on the contact section with a sent status

#### Scenario: Attachment control

- **WHEN** a visitor opens the form
- **THEN** a file input accepting PDF and Office documents is available alongside the message field

#### Scenario: Validation failure

- **WHEN** a required field such as country is left empty
- **THEN** the visitor lands back on the form with `sent=0` and nothing is stored
