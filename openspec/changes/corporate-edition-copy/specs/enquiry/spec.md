# Spec Delta

## ADDED Requirements

### Requirement: Tender documents can be attached

The endpoint SHALL accept an optional tender-document attachment on an enquiry, allow PDF, DOC, DOCX, XLS, and XLSX files up to 10 MB, and reject a submission whose file is another type or larger with `422` (JSON) or a `sent=0` redirect, writing neither row nor file.

#### Scenario: Oversized attachment

- **WHEN** a visitor attaches a 12 MB document
- **THEN** the submission is rejected with a validation error and no enquiry is stored

#### Scenario: No attachment

- **WHEN** a submission arrives without a file
- **THEN** the enquiry is stored normally, the attachment being optional

### Requirement: Attachments are stored outside the database

An accepted attachment SHALL be stored in R2 under a key derived from the saved enquiry, and the `kat_enquiries` row SHALL record that key rather than the file contents.

#### Scenario: Attachment saved

- **WHEN** a valid submission includes a tender PDF
- **THEN** the file lands in R2 and its key is stored with the enquiry row

### Requirement: Enquiries with attachments are downloadable by admins only

The `/enquiries` inbox SHALL show an attachment link for enquiries that have one, and fetching that file SHALL require a logged-in EmDash session, returning not-found to everyone else.

#### Scenario: Logged-out download attempt

- **WHEN** a visitor requests an attachment URL without an admin session
- **THEN** the file is not served

## MODIFIED Requirements

### Requirement: Submissions are validated server-side

The endpoint SHALL trim and length-clip every field (type 40, name 120, email 160, message 4000, company 160, phone 40, country 80, project type 80, location 120, detail 300, page 200) and SHALL require a known enquiry type, a non-empty name, a syntactically valid email, a non-empty country and location, and a non-empty message — answering `422` (JSON) or a `sent=0` redirect otherwise.

#### Scenario: Missing email

- **WHEN** a submission has no email address
- **THEN** the server rejects it with a validation error and stores nothing

#### Scenario: Unknown enquiry type

- **WHEN** the `type` field is not one of the four known types
- **THEN** the submission is rejected as invalid

#### Scenario: Missing country

- **WHEN** a submission has no country
- **THEN** the server rejects it with a validation error

### Requirement: Valid enquiries are stored in D1

Every valid submission SHALL insert a row into the `kat_enquiries` D1 table (created on first use) holding type, name, company, email, phone, country, project type, location, detail, message, referring page, the attachment key when present, and the Cloudflare client IP; existing tables SHALL gain the new columns automatically.

#### Scenario: Visitor submits the form

- **WHEN** all required fields are valid
- **THEN** a row is written to `kat_enquiries` with the submitted values and the request's `cf-connecting-ip`

#### Scenario: Database write fails

- **WHEN** the insert throws
- **THEN** the endpoint responds `500` with a failure message and the visitor's data is not reported as received

#### Scenario: Upgrade from the old table

- **WHEN** the endpoint runs against a `kat_enquiries` table created before this change
- **THEN** the missing columns are added and submissions using the new fields save successfully
