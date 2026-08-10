# Existing Website UX Audit

**Product:** Automated Timetable Generator

---

## 1. Audit Overview

**Why we're doing this:** to find the usability, interaction, navigation, and interface problems in the live product before we redesign it. The current workflows have real usability issues — some unclear, some inconsistent, some just hard to get through — and they run deep enough that we're redesigning the whole site rather than patching individual screens.

**Scope:** navigation and IA, data-entry flows, faculty/subject/classroom/timetable management, timetable generation, conflict detection, review and editing, system feedback and errors, visual design, accessibility, and responsiveness.

**Where we're auditing from:** this is a live, deployed product, not a prototype — so the findings reflect real, working screens.

**Approach:** agile-style, going section by section and prioritizing what we find. We're looking at flow efficiency, interaction design, usability fundamentals, consistency, error handling, accessibility, feedback clarity, and how well the product matches what users actually need to do.

**Limits:** this only covers what exists today. Future features or expansion plans aren't part of it — recommendations are scoped to improving what's already live.

---

## 2. Product and Business Context

### 2.1 What it's for
The Timetable Generator exists to cut down the time and effort of building academic timetables by hand. It automates scheduling so administrators aren't planning everything manually.

### 2.2 Problem it solves
Manual timetabling tends to produce faculty overlaps, classroom conflicts, double-booked slots, uneven teaching loads, and endless rounds of correction. Coordinating subjects, faculty, rooms, and sections by hand is just hard to get right. The product's job is to generate a clean, non-overlapping timetable without all that back-and-forth.

### 2.3 How it schedules today
It uses a greedy algorithm — at each step it picks the best available faculty member, subject, classroom, and time slot given the constraints it's been given. This audit isn't judging whether the algorithm itself is technically sound; we're looking at how clearly it communicates its results, conflicts, limits, and decisions to the people using it.

### 2.4 What it's meant to deliver
- Faster timetable creation, less manual workload
- Fewer faculty/classroom overlaps
- Quicker conflict detection
- Better use of time slots and resources
- Fewer repeated corrections, more consistency
- Easier management of faculty, subjects, sections, and classrooms

### 2.5 Business goal
Eventually this should work for any college or school. Right now, though, it's built for a single institution — the goal is just to make that one institution's timetabling faster and less painful.

### 2.6 Constraints
- **Single institution only** — no multi-campus or multi-org support yet.
- **Garbage in, garbage out** — output quality depends entirely on the accuracy of faculty availability, subjects, rooms, sections, working days, and teaching-hour data entered.
- **The algorithm isn't always optimal** — it produces a workable timetable, but won't necessarily find the best one when constraints compete.
- **Not everything resolves automatically** — some conflicts still need a human to step in.
- **Resource-bound** — if there aren't enough rooms, labs, or faculty hours, no algorithm fixes that.
- **Has to actually save time** — automation that requires excessive configuration defeats the purpose.
- **UX matters as much as the algorithm** — a technically correct schedule is only useful if people can enter data, generate it, spot problems, and fix them without a fight.
- **Scoped to what's live today**, not planned features.

---

## 3. Target Users and Stakeholders

### 3.1 Timetable Administrator (primary user)
The administrator is the one actually running this system — entering data, generating timetables, catching conflicts, fixing them, and publishing the result. They need a full timetable out before each semester starts, conflict-free faculty/room/lab schedules, and the ability to handle changes as departments request them. Day to day that means collecting info from faculty, maintaining records, configuring days and time slots, generating and reviewing timetables, and updating them after publication.

They're moderately tech-comfortable — fine with forms and tables, but shouldn't need to understand the scheduling algorithm. Usage spikes hard at the start of each semester and tapers off to occasional edits after.

**Needs:** accurate faculty/course/room/lab data, clear constraints, conflict visibility, easy editing, export/sharing.

**Pain points:**
- Pulling complete, accurate info from multiple departments
- Re-entering large volumes of data
- Not knowing the right setup order
- Outdated faculty availability
- Generation failing with no clear reason
- Hunting down the source of a conflict
- Manually checking every timetable for overlaps
- Fixing one conflict and creating another
- Last-minute faculty requests
- Re-running the whole process for a tiny change
- No easy way to compare new and old timetables
- No autosave, so accidental loss costs real time
- Vague feedback during generation
- Things getting unwieldy at scale

### 3.2 Faculty Members
Faculty mostly consume the timetable rather than build it. They want a correct, non-overlapping schedule with the right subjects and sections, a manageable workload, and a simple way to flag when they're unavailable. Their part is providing availability, confirming assignments, reviewing drafts, and flagging conflicts.

Tech comfort varies — some are fine with digital tools, others would rather have a PDF or printed copy. Mostly active at the start of a semester and whenever something changes.

**Needs:** their own timetable, clear subject/room/lab info, workload visibility, change notifications, a simple way to flag issues, downloadable/printable formats.

**Pain points:**
- Being double-booked
- Wrong subject or section assigned
- Too many back-to-back periods, uneven weekly workload
- Classes landing in slots marked unavailable
- Updates arriving too late
- Can't tell what changed between versions
- Multiple versions circulating, causing confusion
- No easy way to request a change
- Hard to read on a phone
- Wrong room or lab listed
- Change requests getting missed

### 3.3 Head of Department
The HoD signs off on the department's slice of the timetable — every subject covered, workload fair, no conflicts across sections and semesters. Day to day: confirming faculty-to-subject allocation, checking workload, reviewing and approving (or sending back) the timetable, resolving disagreements between faculty preferences and department needs.

Moderately tech-comfortable but doesn't live in the full admin interface — needs a clean review-and-approve experience, not a configuration screen.

**Needs:** a department-level view, workload summaries, conflict reports, missing-subject warnings, approval controls, version comparison.

**Pain points:**
- Too much data to review at once, no department filter
- Can't quickly spot a missing subject
- Limited workload visibility
- Conflicts with no explanation attached
- No real approval workflow
- Hard to track what's been requested vs. actioned
- Changes slipping through without sign-off
- Manual version comparison
- Faculty preferences clashing with requirements, no clear tiebreaker

### 3.4 Lab Coordinator
Makes sure labs are booked correctly — right lab, right duration, right equipment, no double-booking. Job includes providing lab details and availability, matching subjects to suitable labs, defining capacity limits, and flagging conflicts or maintenance windows.

Moderately tech-comfortable. Mostly active before each semester and whenever lab availability changes.

**Needs:** a lab list with capacities, practical session requirements, availability, required session length, batch info, a lab-specific timetable view.

**Pain points:**
- Two sections booked into the same lab
- A subject assigned to an unsuitable lab
- Not enough capacity
- Practical sessions split awkwardly
- Required consecutive periods not respected
- Maintenance windows ignored
- No batch-level scheduling
- Wrong coordinator listed
- No single view of all bookings
- Last-minute changes causing resource clashes

### 3.5 Institution Management
Principals, deans, and academic coordinators — mostly reviewing and approving rather than configuring. They want timetables ready on time, less admin overhead, and confidence everything's accurate before it goes out. Their part is setting policy, reviewing readiness, approving big decisions, and checking departments hit deadlines.

Basic-to-moderate tech comfort — they want summaries and status, not configuration screens.

**Needs:** overall status, department completion tracking, unresolved conflict counts, workload/utilization summaries, clean reports.

**Pain points:**
- No visibility into overall progress
- Can't tell which departments are behind
- No high-level summary of open issues
- Dashboards too technical to be useful
- Unclear who's responsible for approval
- Inconsistent data across departments
- Delays from repeated corrections
- No reliable way to confirm every department has signed off

### 3.6 Students
Students just need to see their timetable — right subject, faculty, room, time — and know it's current. Generally comfortable with digital tools, especially mobile, but the timetable still needs to be understandable without explanation.

**Needs:** a semester/section-specific timetable, clear subject and faculty names, room/lab info, mobile-friendly access, a clear "latest version" signal.

**Pain points:**
- Looking at an outdated timetable without realizing it
- Trouble finding the right semester/section
- Poor mobile readability
- Cryptic subject abbreviations
- Missing room/lab info
- Changes not communicated
- Multiple versions circulating through different channels
- Hard to tell theory from lab sessions
- Dense, cluttered layout
- Wrong class or faculty info

### 3.7 Technical Support / System Administrator
A different role from the timetable administrator — keeps the system itself running: accounts, access, backups, uptime. Job includes managing accounts and permissions, fixing access issues, investigating errors, maintaining backups, and protecting sensitive data.

High technical confidence, comfortable with system config and deployment.

**Needs:** user/role management, error logs, access controls, backup and recovery tools, audit history, secure authentication.

**Pain points:**
- Incorrect permissions
- Poor error visibility, thin logs
- Hard to reproduce generation failures
- No backup, so data loss actually sticks
- Can't tell user error from system error
- Shared accounts creating security risk
- No audit trail of who changed what
- Manual account management

### 3.8 Academic / Course Coordinator
Manages course structure and makes sure the timetable reflects the curriculum. Overlaps with the HoD role at smaller institutions. Job includes supplying course data, confirming subject codes and hour requirements, classifying theory/lab/elective subjects, and reviewing coverage after generation.

Moderately tech-comfortable, familiar with spreadsheets and curriculum docs.

**Needs:** course/subject management, hour requirements, elective grouping, theory/lab classification, missing-subject warnings.

**Pain points:**
- Wrong subject codes or names
- Missing subjects in the final timetable
- Wrong number of periods assigned
- Overlapping electives
- Theory and practical requirements getting mixed up
- Outdated curriculum data
- Duplicate course entries
- No easy way to check subject coverage
- No validation on required teaching hours
- Curriculum changes not reflected in the generated timetable

### 3.9 Who matters most
- **Primary:** Timetable administrator
- **Secondary:** Faculty, HoDs, lab coordinators, academic coordinators, technical support
- **Indirect / decision-makers:** Students, institution management

The redesign should center on the administrator's end-to-end workflow while keeping the output clear and useful for everyone else downstream.

---

## 4. Existing User Problems

### 4.1 Manual timetabling takes too long
Before scheduling can even start, administrators have to chase down info from every department — availability, subject assignments, room and lab allocation, required hours per section. Done by hand, a full timetable can take days and several review rounds before it's ready to publish.
*Impact:* heavier workload, delayed publication, more manual verification, less time for anything else during semester planning.

### 4.2 Faculty schedule conflicts
Hand-built schedules are prone to double-booking a faculty member or overloading their teaching hours. These often don't surface until review, meaning more revisions before anything's final.
*Impact:* overlapping schedules, more time hunting conflicts, repeated revisions, less trust in the final timetable.

### 4.3 Sudden changes are hard to absorb
Leave, room unavailability, new electives, department requests — schedules change constantly. Manually, even a small edit means re-checking related schedules to make sure nothing new broke.
*Impact:* slow updates, higher risk of new conflicts, inconsistent timetables, delayed communication.

### 4.4 Communication breaks down between people
Getting a timetable right depends on constant back-and-forth between administrators, faculty, HoDs, lab coordinators, and academic coordinators. Over email, spreadsheets, and calls, things get missed or delayed — and outdated info ends up baked into the schedule.
*Impact:* slow approvals, stale data, more coordination effort, repeated clarification, more errors.

### 4.5 Manual data entry causes errors
Typing in faculty details, subjects, rooms, labs, semesters, sections, and constraints by hand is error-prone — wrong faculty member, wrong room, invalid slot, missed subject. All of it needs extra verification before publishing.
*Impact:* incorrect timetables, more verification work, repeated corrections, less trust, more admin load.

### The big picture
Manual scheduling is slow, error-prone, and gets harder to manage as an institution grows — which is the core case for automating it: less manual effort, fewer conflicts, better coordination, more accurate output.

---

## 5. Information Architecture

### 5.1 Getting in
No public landing page — straight to a login screen, with role-based entry for Administrator, Faculty, and Student. No nav bar before login, which makes sense for an internal tool rather than a public site.

### 5.2 What each role sees
**Administrators** get a sidebar with Dashboard, Faculty Management, Course Management, Lab Management, Elective Management, Faculty-to-Subject Mapping, Timetable Generation, and viewing/editing timetables — by far the deepest interaction of any role.

**Faculty** mostly just view timetables for their semesters and sections — a much lighter workflow.

**Students** get the simplest experience of all: view their own timetable, nothing else.

### 5.3 How content is grouped
Academic data is split into Semesters, Sections, Faculty, Courses, Laboratories, and Electives — a reasonable split, though some modules could use tighter connections so users aren't bouncing between screens as much.

### 5.4 Navigation pattern
The admin side runs on a persistent sidebar, which makes sense given how often admins jump between modules while setting things up — no need to keep returning to a dashboard.

### 5.5 How info is presented
Mostly sidebar nav, data tables, and management screens. Tables make sense for this much institutional data, but table-heavy screens need strong visual hierarchy or they get overwhelming fast.

### 5.6 Can people find things?
Most core features are one click from the sidebar, and naming is generally clear. What's missing is guidance on the *order* to do things in — first-time users won't get that from the interface alone.

### 5.7 Hierarchy
The structure follows the real workflow: set up faculty, courses, labs, electives, semesters, and sections first, then generate and edit the timetable. That mirrors how scheduling actually works in practice.

### 5.8 Orientation
Once someone knows the system, they can move around without much trouble. Right now it assumes people already understand the scheduling workflow — a real learning curve for someone new.

### 5.9 Consistency
Navigation patterns, layouts, and module behavior aren't fully consistent across the app. Tightening this up would make the whole thing feel more predictable.

### 5.10 Overall
The role-based structure is a solid foundation, and the sidebar plus modular layout handles complex academic data reasonably well. The biggest opportunities are consistency, better onboarding, and clearer relationships between modules — especially for first-time administrators.

---

## 6. Primary User Flows

The administrator is the one actually configuring data and generating timetables. Right now, the product covers the core of that workflow but leaves out a lot of the supporting pieces.

### 6.1 What exists
- Adding faculty members
- Adding courses and subjects
- Adding classrooms and labs
- Assigning faculty to subjects
- Generating a timetable
- Exporting/sharing it

That's the essential path to producing a timetable.

### 6.2 What's missing
- Creating academic years, semesters, and sections
- Managing elective groups
- Configuring working days and time slots
- Defining scheduling constraints
- Reviewing conflicts before publishing
- A structured editing workflow
- Reviewing past versions
- Approval before publication
- Drafts
- Version history and restore

Without these, a lot still falls back on manual work, and the overall experience is less flexible than it should be.

### 6.3 Is the flow clear?
The steps that exist follow a logical order and make sense once you're used to them — but the product doesn't tell you what order to do things in. That comes from experience, not the interface.

### 6.4 Catching mistakes before they happen
Required info isn't consistently validated up front, incomplete configuration isn't clearly flagged, and blockers aren't well communicated. It's easy to move forward with bad or missing data without realizing it.

### 6.5 Knowing when something worked
After adding records, generating a timetable, or exporting, there's not much confirmation it actually went through — which chips away at confidence, especially for something as important as generation.

### 6.6 Getting out of trouble
No undo/redo, no drafts, no recovery after accidental navigation, no "are you sure" warning, no version restore. If something goes wrong, you're often redoing work.

### 6.7 Overall
The core generation workflow works. What's missing is everything around it — supporting flows, error prevention, completion feedback, and recovery — all of which would make real-world timetable management a lot less painful.

---

## 7. Timetable Setup Experience

Since the output is only as good as the setup, this part of the product carries a lot of weight. Right now it works, but it's fairly bare-bones.

### 7.1 Overall process
The required modules are all there, but nothing guides you from one step to the next — functional, not structured.

### 7.2 Order of operations
Nothing tells you the right sequence to enter information in. It gets easier with experience, which isn't great for new users.

### 7.3 Required vs. optional
Required fields are marked; optional ones generally aren't — so it's not always obvious what you actually need to fill in.

### 7.4 Progress visibility
No indicator of how much setup is done, what's left, or how close you are to being ready to generate — makes the process feel less structured than it should, especially early on.

### 7.5 Completion signals
Individual modules don't clearly confirm when they're done, so people end up re-checking modules just to be sure.

### 7.6 Missing-data warnings
Some validation exists, but it doesn't comprehensively catch incomplete setup before generation. More thorough checks here would cut down on failed or bad generations.

### 7.7 Save and come back later
No way to save a partial setup and pick it up later — a real gap given how much data goes into this.

### 7.8 Import and bulk entry
Data import exists, but bulk entry hasn't gotten much attention. For institutions with a lot of faculty, courses, and sections, this matters more than it currently gets credit for.

### 7.9 Editing existing data
You can edit previously entered records, which helps with ongoing maintenance as things change.

### 7.10 Guidance for first-timers
No onboarding, no contextual help, nothing to walk a new administrator through the recommended flow — they're learning by trial and error.

### 7.11 Overall
The essentials are there, but the experience is basic. Structured progression, real validation, progress tracking, completion signals, and onboarding would all go a long way — especially for first-time users.

---

## 8. Constraint Management

Constraint handling is arguably the most important piece of an automated scheduler — it decides whether the output actually respects academic, faculty, room, and scheduling rules. The current system handles this well.

### 8.1 Constraint coverage
It accounts for faculty allocation, subject allocation, room/lab allocation, faculty-to-subject mapping, semester/section allocation, overlap prevention, and resource availability — a solid foundation for conflict-free schedules.

### 8.2 Configuring constraints
Setup is straightforward and doesn't overcomplicate things for what the product currently needs to do.

### 8.3 Validation
The system reliably applies configured constraints during generation, which meaningfully cuts down on the conflicts that plague manual scheduling.

### 8.4 Visibility
What's missing is transparency — users can't easily see which constraints were applied, how they shaped the outcome, or whether any got dropped due to conflicts. That's a UX gap, not a functional one.

### 8.5 Where this could go
- Clearer presentation of active constraints
- Visibility into constraint priority
- Better validation before generation
- Clearer messaging when not everything can be satisfied
- More transparency into how decisions get made

### 8.6 Overall
One of the stronger parts of the product. The opportunity isn't more constraints — it's making the existing ones easier to see, understand, and review.

---

## 10. Timetable Generation Experience

Generation is the core feature — and it needs to make users feel confident the system has what it needs and is doing the right thing with it. Right now, it works, but doesn't communicate much along the way.

### 10.1 Are you ready to generate?
No real checklist confirming faculty, courses, labs, and other data are correctly set up — users have to verify that themselves, which makes incomplete-data generation attempts more likely.

### 10.2 Starting generation
Kicking off generation is simple enough, but there's little context about what to expect or what needs to be in place first.

### 10.3 Progress while it runs
Almost no feedback while generation is happening — no status, no progress, no estimate. It's easy to wonder if the system's actually doing anything.

### 10.4 Catching missing data
Validation exists but doesn't consistently catch incomplete configuration before generation starts.

### 10.5 Did it work?
After generation finishes, there's little indication of whether it fully succeeded, whether any tradeoffs were made, whether a manual review is a good idea, or whether conflicts remain.

### 10.6 When it fails
If generation can't complete, users get very little explanation of what went wrong or how to fix it — which makes troubleshooting slower than it needs to be.

### 10.7 Regenerating
It's unclear whether running generation again replaces, modifies, or preserves the previous result. More clarity here would help people make an informed call before hitting generate a second time.

### 10.8 Overall
The feature does its job, but the experience around it needs work. Pre-generation checks, progress feedback, clear completion status, error explanations, and regeneration clarity are the biggest gaps between "it works" and "it's trustworthy."

---

## 11. Conflict Detection and Resolution

Conflict handling exists mostly behind the scenes, baked into generation logic through predefined edge cases — functional, but not very visible.

### 11.1 What gets caught
Faculty allocation, subject allocation, room/lab allocation, overlaps, and resource availability — the core scheduling conflicts are covered.

### 11.2 How conflicts surface
No dedicated review process — conflicts get handled internally, so users don't really see what was caught or how it got resolved.

### 11.3 Communicating conflicts
When conflicts do surface, there's not much detail: type, affected resource, cause, or severity are all thin.

### 11.4 Resolving them
Resolution happens automatically during generation, leaving little room for administrators to review, analyze, or step in manually.

### 11.5 Edge cases
Several edge cases are already handled before generation, a good sign the system was designed with conflict prevention in mind — though there's room for more.

### 11.6 Where this could improve
- More visibility into what conflicts were detected
- Clearer descriptions
- Better communication of affected resources
- More transparency into scheduling decisions
- A real manual review/resolution workflow
- Better overall reporting

### 11.7 Overall
The system catches the conflicts that matter and handles common edge cases well. What's missing is transparency — helping administrators actually see, understand, and, when needed, intervene in how conflicts get resolved.

---

## 12. Timetable Review and Editing

Review lets administrators check the generated schedule before it goes out. Right now, the product is much stronger on viewing than on editing.

### 12.1 Views available
Weekly, daily, faculty, section, classroom, lab, and subject views — a good range that lets people check things from whichever angle matters to them.

### 12.2 Review experience
You can inspect faculty, room, lab, subject, and section schedules without leaving the app or juggling external documents — a solid foundation for validating a generated timetable.

### 12.3 Editing
Editing directly from the review screen isn't really supported yet — this is built for checking, not for actively managing the timetable.

### 12.4 What's not there yet
Drag-and-drop editing, swapping classes, moving sessions, undo/redo, save confirmations, conflict prevention during manual edits, version comparison, highlighting recent changes, drafts, and an approval workflow for changes.

### 12.5 Overall
The review side is solid — multiple useful views, good coverage. Editing is the part that needs to grow, with more interactive tools and stronger change management as the product matures.

---

## 14. Dashboard and Data Visibility

The dashboard should be the at-a-glance view of where things stand. Right now, it's more of a launchpad into other modules than an actual operational overview.

### 14.1 Setup completion
No indication of how much configuration is done — administrators can't tell if they're ready to generate without checking manually.

### 14.2 Timetable status
No visibility into active, draft, or published timetables from the dashboard — you have to dig into individual modules to find out.

### 14.3 Conflicts
Unresolved conflicts don't show up here either, so there's no early warning before publishing.

### 14.4 Resources
No quick view of faculty workload or room availability, meaning another trip to other modules just to get a sense of things.

### 14.5 Activity
No record of recently modified timetables, upcoming changes, or pending approvals — hard to stay on top of what's changing.

### 14.6 Alerts
Missing configuration, system alerts, and pending actions aren't surfaced anywhere — issues have to be found manually rather than flagged.

### 14.7 Quick actions
No shortcuts to common tasks — everything routes back through the sidebar.

### 14.8 Overall
The dashboard works as an entry point, not as an operational view. Adding status, progress, conflict, and resource visibility here would meaningfully cut down on navigation and give administrators a much better sense of what needs their attention.

---

## 15. Interaction Design

The product's core interactions are functional, but they don't yet feel refined.

### 15.1 What's there
Buttons, forms, tables, sidebar nav, inputs, dropdowns — the standard toolkit, but with fairly basic interaction patterns.

### 15.2 Behavior
Buttons, forms, dropdowns, tables, search, modals, and cross-module navigation would all benefit from more thought — functional, but not consistently responsive or informative.

### 15.3 Feedback
Saving, updating, deleting, processing, navigating — most of these give minimal confirmation that anything happened.

### 15.4 Consistency
Similar actions don't always behave the same way across modules, forcing users to keep re-learning small differences.

### 15.5 Preventing and recovering from mistakes
Not much guidance when something goes wrong or more info is needed — the system doesn't do much to catch mistakes before they happen.

### 15.6 Efficiency
Some workflows involve more clicking and navigating than they need to, especially for repetitive admin tasks.

### 15.7 Overall
The essentials work, but behavior, consistency, feedback, and efficiency all need refinement to make the product feel intuitive rather than merely functional.

---

## 16. Forms and Data Entry

Forms are how administrators do most of their work here. The basics are covered; the polish isn't quite there yet.

### 16.1 Labels
Clear and understandable — no real issues here.

### 16.2 Placeholder text
Used where it helps, though not consistently across every form.

### 16.3 Required vs optional
Required fields are marked; optional ones aren't clearly flagged, especially in longer forms.

### 16.4 Input types
Appropriate formats for the fields that exist — no complaints here.

### 16.5 Defaults
Sensible defaults are in place where it makes sense, cutting down on repetitive entry.

### 16.6 Inline validation
Basic validation catches issues as you go, though it could go further.

### 16.7 Error messages
They show up, but could be clearer and more specific about what to actually do next.

### 16.8 Submission confirmation
Present, and reassures users their entry went through.

### 16.9 Overall
The fundamentals are all there — labels, formats, defaults, validation, confirmation. The gaps are in polish: more consistent optional-field indicators, more descriptive errors, and tighter consistency across forms.

---

## 17. Search, Filtering and Sorting

### 17.1 What's searchable
Faculty, subjects, departments, semesters, sections, classrooms, labs, time slots, and timetables — a decent spread that cuts down on manual browsing.

### 17.2 Visibility
Search exists but isn't always easy to find — it should be consistently accessible across every data screen.

### 17.3 Result quality
Fairly basic — no relevance ranking, result highlighting, or contextual feedback yet.

### 17.4 Filtering
Not really there yet — no multi-filter support, no active-filter display, no clear-all, no persistence. Search and manual browsing are doing all the work.

### 17.5 Sorting
Not available on admin tables currently.

### 17.6 Search support
No suggestions, no search history, no helpful empty states when a search comes up empty.

### 17.7 Overall
Search covers the right modules, but the surrounding experience — filtering, sorting, search assistance — is thin. As data grows, this will matter more.

---

## 18. Feedback, Status and Notifications

This is one of the weakest areas of the product right now — most actions happen with little to no communication back to the user.

### 18.1 Action feedback
Saving, updating, deleting, importing, exporting, generating — confirmation after any of these is minimal.

### 18.2 System status
No processing indicators, no generation progress, no loading states, no visibility into background tasks — genuinely hard to tell if the system's working or stuck.

### 18.3 Notifications
No dedicated success, warning, info, or critical alerts — just basic, inconsistent messaging.

### 18.4 Protecting unsaved work
No warnings about unsaved changes, potential data loss, or leaving an incomplete form.

### 18.5 Admin-specific notifications
Nothing for generation completion, publishing, pending approvals, updates, or conflicts needing attention.

### 18.6 Overall
This needs the most attention of any area covered so far. More consistent feedback — before, during, and after actions — would go a long way toward making the product feel trustworthy.

---

## 19. Content and UX Writing

The product leans hard on functionality and light on communication — the writing needs work.

### 19.1 Navigation labels
Understandable, but terminology isn't always consistent across the app.

### 19.2 Titles and headings
Only give basic context — more descriptive titles would help, especially for first-time users trying to orient themselves.

### 19.3 Form guidance
Labels exist, but there's little supporting instruction — users are expected to just know what's needed.

### 19.4 Errors and validation
Present, but could explain the problem and the fix more clearly.

### 19.5 Success messages
Limited — clearer confirmation after key actions (saving, generating, updating) would build more confidence.

### 19.6 Empty states
Barely there — when there's no data to show, users get little explanation of why or what to do next.

### 19.7 Terminology
Academic terms (faculty, subjects, semesters, sections, labs, classrooms) need to stay consistent across every screen and message.

### 19.8 Overall
The basics are covered, but titles, labels, instructions, errors, confirmations, and empty states all have room to improve. Better writing here would make the product feel a lot more approachable.

---

## 20. Error Prevention and Recovery

This is another area that hasn't gotten much attention yet.

### 20.1 Prevention
Basic validation exists, but there's no pre-generation validation, duplicate prevention, confirmation before critical actions, or protection against invalid scheduling operations. Users are largely on their own to catch mistakes.

### 20.2 Recovery
No undo/redo, no recovery from accidental changes, no restore, no session recovery. Once something's done, it's done.

### 20.3 Data loss protection
No autosave, no draft recovery, no unsaved-change warnings, no recovery after an interruption — a real risk during long setup sessions.

### 20.4 Version management
No version history, no restoring a previous timetable, no comparing versions.

### 20.5 Guidance during errors
The system tells you something went wrong, but rarely why or what to do about it.

### 20.6 Overall
Error prevention and recovery are among the least developed parts of the product. Strengthening this would reduce risk and make the whole system feel a lot more forgiving, especially around generation and large data changes.

---

## 21. Visual Hierarchy and UI Consistency

The interface prioritizes function over visual structure, and it shows.

### 21.1 Typography
No clear hierarchy — headings, labels, and body text don't consistently signal importance.

### 21.2 Layout and spacing
Inconsistent across screens, making some parts feel unstructured.

### 21.3 Components
Buttons, forms, tables, cards, and inputs don't always look or behave the same way from one screen to the next.

### 21.4 Color
Mostly functional, but doesn't clearly separate primary actions from secondary ones, or flag warnings and critical states.

### 21.5 Tables
Heavily used, and could use better hierarchy, spacing, and readability given how much data they carry.

### 21.6 Interactive states
Hover, focus, selected, disabled, loading, success, warning, error — inconsistent or missing across the app.

### 21.7 Overall consistency
No real unified visual language yet — layout, type, spacing, and components all vary.

### 21.8 Overall
Functionally solid, visually underdeveloped. A stronger design system — typography, spacing, components, color, and states — would noticeably raise the overall quality.

---

## 22. Accessibility

Accessibility hasn't been a priority yet.

### 22.1 Color contrast
Not evaluated against standard guidelines — likely a readability issue for low-vision users or long sessions.

### 22.2 Keyboard navigation
Not really supported — most tasks assume a mouse.

### 22.3 Focus indicators
Limited or inconsistent, making keyboard navigation hard to follow.

### 22.4 Forms
Functional, but label-input associations, guidance, and accessible validation need work.

### 22.5 Error identification
Basic, and not built with accessibility in mind.

### 22.6 Responsive interaction
Touch targets, zoom, and responsive patterns haven't been fully addressed.

### 22.7 Tables
Heavily used for timetable data, but not built with accessible structure or navigation in mind.

### 22.8 Overall
One of the least developed areas. Contrast, keyboard access, focus visibility, accessible forms and errors, responsive interaction, and accessible tables all need attention to make this genuinely usable for everyone.

---

## 23. Responsive and Device Experience

Built primarily for desktop, with limited thought given to other devices.

### 23.1 Desktop
Functional, but layout consistency and use of screen space could improve across resolutions.

### 23.2 Laptop
Usable, but not specifically optimized for smaller viewports.

### 23.3 Tablet
Limited attention here — nav, tables, and admin screens would need work for a comfortable tablet experience.

### 23.4 Mobile
Basic at best — data-heavy admin workflows aren't built for small screens. Better suited to viewing than to actual admin work.

### 23.5 Responsive components
Nav, tables, forms, and timetable views all follow a desktop-first approach with little adaptation for smaller screens.

### 23.6 Overall
Solid on desktop, thin everywhere else. Better layout adaptability, responsive nav and tables, and mobile usability would broaden who can actually use this comfortably.

---

## 24. Performance and Perceived Performance

Performance is generally good where it's been tested; a few areas need more evaluation.

### 24.1 Dashboard and timetable rendering
Loads and renders within acceptable time — no issues observed during normal use.

### 24.2 Search and filtering
Search works but could be faster; filtering is too limited right now to properly evaluate.

### 24.3 Generation
Performs well within the current single-institution scope — no noticeable delays.

### 24.4 Data import
Bulk import wasn't available to test, so no read on performance here yet.

### 24.5 Perceived performance
Loading states and skeleton screens weren't specifically assessed — worth a closer look for longer operations.

### 24.6 Network conditions
Not tested under slow or unstable connections yet.

### 24.7 Scope note
Multi-institution performance is out of scope for this audit — the product is currently single-institution only.

### 24.8 Overall
Performance is solid where it's been checked — dashboard, rendering, and generation all hold up. Search responsiveness, perceived performance, and behavior on weaker networks or larger datasets are the areas worth testing further.

---

## 25. Security, Permissions and Privacy

Role-based login gives this a decent foundation; permissions and privacy need more work.

### 25.1 Authentication
Separate logins for Administrator, Faculty, and Student — a solid base for keeping roles separated.

### 25.2 Permissions
Roles exist, but there's no granular control over who can view, create, edit, delete, export, or manage what. This needs to mature as the product grows.

### 25.3 Privacy
Limited attention so far — protecting faculty and student info, and controlling who can see what, both need more thought.

### 25.4 Session management
Timeout, secure logout, and unauthorized-access protection weren't comprehensively evaluated — worth a closer look.

### 25.5 Audit trail
No change history or activity logs currently — makes it hard to trace who did what.

### 25.6 Overall
Role-based login is a good starting point, but permissions, privacy, session handling, and audit logging all need to mature to properly protect institutional data.
