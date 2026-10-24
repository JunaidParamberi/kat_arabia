# Enquiry handling

## Purpose

Define how website contact-form submissions are validated, stored, and surfaced to the client, including spam handling and the response contract.

## Requirements

### Requirement: The endpoint accepts only POST submissions

`POST /api/enquiry` SHALL be the sole submission route, and other methods SHALL respond `405` with an `Allow: POST` header.

#### Scenario: GET on the endpoint

- **WHEN** a client sends `GET /api/enquiry`
- **THEN** the response is `405 Method Not Allowed`

### Requirement: Submissions are validated server-side

The endpoint SHALL trim and length-clip every field (type 40, name 120, email 160, message 4000, company 160, phone 40, detail 300, page 200) and SHALL require a known enquiry type, a non-empty name, a syntactically valid email, and a non-empty message — answering `422` (JSON) or a `sent=0` redirect otherwise.

#### Scenario: Missing email

- **WHEN** a submission has no email address
- **THEN** the server rejects it with a validation error and stores nothing

#### Scenario: Unknown enquiry type

- **WHEN** the `type` field is not one of the four known types
- **THEN** the submission is rejected as invalid

### Requirement: The honeypot silently defeats bots

If the hidden `website` field is filled in, the endpoint SHALL pretend success — responding as if the enquiry were saved — without writing anything.

#### Scenario: Bot fills the hidden field

- **WHEN** a scripted submitter populates `website`
- **THEN** the response reports success and no row is created

### Requirement: Valid enquiries are stored in D1

Every valid submission SHALL insert a row into the `kat_enquiries` D1 table (created on first use) holding type, name, company, email, phone, detail, message, referring page, and the Cloudflare client IP.

#### Scenario: Visitor submits the form

- **WHEN** all required fields are valid
- **THEN** a row is written to `kat_enquiries` with the submitted values and the request's `cf-connecting-ip`

#### Scenario: Database write fails

- **WHEN** the insert throws
- **THEN** the endpoint responds `500` with a failure message and the visitor's data is not reported as received

### Requirement: The redirect never leaves the site

For browser form posts the endpoint SHALL answer `303` to the submitted `page` target — a site-relative path only — with `sent=1` or `sent=0` and a `#contact` fragment, and SHALL fall back to `/contact` whenever the resolved target's origin differs from the request origin.

#### Scenario: Cross-origin redirect attempt

- **WHEN** the form's `page` field contains `https://evil.example/`
- **THEN** the redirect targets `/contact` instead of the external origin

#### Scenario: JSON client

- **WHEN** the request sends `Accept: application/json`
- **THEN** the endpoint answers with a JSON `{ ok, error }` body instead of a redirect

### Requirement: Enquiries are viewable by admins only

`/enquiries` SHALL list the latest 200 submissions for a logged-in EmDash user only, SHALL send `noindex, nofollow` with `Cache-Control: private, no-store`, and SHALL redirect logged-out visitors to the admin login.

#### Scenario: Logged-out visitor

- **WHEN** a visitor without an EmDash session opens `/enquiries`
- **THEN** they are redirected to the admin login, and the inbox content never renders
