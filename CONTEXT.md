# Impact Career Tutorials

The public site and staff operations platform for Impact Career Tutorials (ICT), a competitive-exam coaching institute in North Lakhimpur, Assam. It helps a candidate judge whether ICT is right for them, converts that interest into a traceable enquiry or order, and lets staff work the result without a developer.

## Language

### Teaching and catalogue

**Exam**:
An examination a candidate sits for. Used to tag Resources and to group public content.
_Avoid_: test, paper

**Track**:
One of ICT's teaching streams, preparing candidates for one or more Exams. A Track has many Courses, one of which is its flagship. "Banking / SSC / Railway" is a single Track spanning several Exams.
_Avoid_: category, stream, course

**Course**:
A sellable product in ICT's Classplus catalogue, identified by its Classplus id. Carries price, list price, learner count and features. Courses are bought on Classplus, never on this site.
_Avoid_: batch, programme, product

**Batch**:
A dated intake of a Course, with a start date and timings.
_Avoid_: session, cohort

### People and demand

**Person**:
Someone ICT knows, keyed by their Indian mobile number. One record covers the whole relationship: an anonymous enquirer, a verified account holder, and a book buyer are the same Person if the phone matches.
_Avoid_: user, contact, customer, student, account

**Verification**:
Proof that a Person controls their mobile number, established by a one-time code delivered over WhatsApp. A Person is either verified or not; there is no partial state.
_Avoid_: sign-up, registration, login

**Enquiry**:
A Person asking ICT a question, through a form or a WhatsApp handoff. Does not require Verification.
_Avoid_: lead form submission, contact request

**Lead status**:
Where a Person sits in ICT's follow-up pipeline: New, Contacted, Interested, Enrolled or Lost. A field on the Person, not a separate record.
_Avoid_: stage, pipeline position

**Lead**:
A Person who has entered the follow-up pipeline, and the validated payload that puts them there. Sanctioned as a code-level name (`Lead`, `LeadSink`, `parseLead`) because the pipeline is the thing being named; it is never a table, and it never substitutes for **Person**.
_Avoid_: prospect, contact

**Contact channel**:
A way of reaching ICT — WhatsApp or a phone call. "Contact" is listed under _Avoid_ for **Person** as a noun for a human, and that still holds; it is sanctioned only as a channel word (`contactHref`, `lib/contact.ts`), never as a name for a Person.

**Role value**:
`student`, `staff` and `owner` are field _values_ on a Person, not type names, so they are exempt from the words listed under _Avoid_ for **Person**.

### Materials and commerce

**Resource**:
A free study document ICT publishes — notes, current affairs, MCQs or previous-year questions — tagged by Exam, subject and year. Read in the Reader; never served as a public file URL.
_Avoid_: material, PDF, download, free material

**Reader**:
The in-browser viewer for a Resource. Serves pre-rasterized page images rather than the source document.
_Avoid_: viewer, PDF viewer

**Book**:
A physical book ICT maintains and sells independently of Classplus, for shipping or collection at ICT. Bought on this site, unlike a Course. Availability is enabled or disabled; it is not a stock count.
_Avoid_: product, item

**Order**:
A Person's purchase of Books, with its own immutable totals and a payment state proven by server-verified evidence.
_Avoid_: purchase, transaction, sale

**Enrolment handoff**:
Sending a Person to ICT's Classplus storefront to buy a Course. The site records that the handoff happened; it never takes course payments.
_Avoid_: enrol, checkout, course purchase

**Library application**:
A Person applying for a seat in ICT's physical study library. Reviewed by staff; no payment at launch.
_Avoid_: booking, reservation

**Promotion**:
A scheduled, staff-authored message placed on the site — an announcement bar, an inline panel or a dialog.
_Avoid_: banner, popup, campaign

### Editorial and recruitment

**Blog post**:
An ICT-authored article, including student career or Exam guidance, published in the Blog. It is not a gated Resource or a recruitment listing.
_Avoid_: resource, vacancy

**Vacancy**:
A job opening to work at ICT, listed in Careers. A closed Vacancy no longer accepts applications.
_Avoid_: career guidance, course, admission
