# site-shell Delta

## ADDED Requirements

### Requirement: Footer contact column comes from a menu

The footer's contact column SHALL render the `footer_contact` menu's items as links (with `mailto:` and `tel:` URLs) instead of hardcoded contact details, so the client can edit it from the admin and unconfirmed details can be removed without a code change.

#### Scenario: Contact details edited in the admin

- **WHEN** an editor changes an item label or URL in the `footer_contact` menu
- **THEN** the footer's contact column reflects the change on the next render

#### Scenario: Unconfirmed phone removed

- **WHEN** the `footer_contact` menu contains no `tel:` item
- **THEN** the footer renders no phone link
