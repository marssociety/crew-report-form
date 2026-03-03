# MDRS Crew Report Form: Definitive Field Specifications

## Based on Official 2025-2026 MDRS Report Templates from the MDRS Director

This document provides the exact field-by-field specifications for each report type in the crew-report-form app, derived directly from the official MDRS report templates provided by the MDRS Director for the 2025-2026 field season. These are the canonical field definitions that the form app should implement.

---

## Shared Header Fields (All Report Types)

Every report shares this common header. The form should collect these once per session or auto-populate from previous submissions within the same crew/sol.

| Field | Type | Format / Notes |
|-------|------|---------------|
| Report title | string | Auto-generated: "[Report Type]" (matches the email subject pattern) |
| Crew # | integer | The crew number |
| Position | string | The filer's crew position (Commander, Crew Engineer, GreenHab Officer, etc.) |
| Report prepared by | string | Full legal name |
| Date | date | dd-MM-yyyy format |
| Sol | integer | Current sol number |

**Email subject pattern** (for reference, not a form field): `Crew NNN [Report Type] dd-MM-YYYY`

---

## 1. Sol Summary Report

**Filed by:** Commander (or designated crew member)
**Frequency:** Daily

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Summary Title | string | text input | Short descriptive title for the sol |
| Mission Status | string | text input | Brief status (often "nominal" or description of issues) |
| Sol Activity Summary | text | textarea (long) | Narrative description of the day's activities |
| Look Ahead Plan | text | textarea | What's planned for the next sol |
| Anomalies in work | text | textarea | Description of any anomalies, or "None" |
| Weather | text | textarea | Temperature, sky conditions, wind (free text per template) |
| Crew Physical Status | text | textarea | General crew health status |
| EVA | text | textarea | Summary of EVA activities for the sol |
| Reports to be filed | text | textarea | List of reports being submitted this sol |
| Support Requested | text | textarea | Any requests to Mission Support |

**Attached pictures:** optional

**Notes:** The official template keeps Weather as a single free-text field rather than breaking it into discrete temperature/wind/sky sub-fields. The form should match this. Crews format weather data inconsistently, and forcing structured sub-fields would conflict with the template.

---

## 2. Operations Report

**Filed by:** Crew Engineer / Operations Officer
**Frequency:** Daily

This is the most data-dense report. The official template has clear structured sections.

### Top-Level Fields

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Non-nominal systems | text | textarea | List of systems not operating normally |
| Notes on non-nominal systems | text | textarea | Details on non-nominal systems |

### Rovers Block

Repeated for each of the four named rovers. The form should present this as a fixed set of four rover sections (not a dynamic array, since the rover names are fixed).

**For each rover (Spirit, Opportunity, Curiosity, Perseverance):**

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| [Rover name] used | boolean/text | text input | Whether the rover was used |
| Hours | number | number input | Hours reading (before EVA) |
| Beginning charge | percentage | number input | Charge level before EVA |
| Ending charge | percentage | number input | Charge on return, before recharging |
| Currently charging | boolean/text | text input | Whether rover is on charger |

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| General notes on rovers | text | textarea | Any additional rover notes |

### Hab Operations Block

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Summary of Hab operations | text | textarea | General Hab status |
| Water use | text | text input | See template notes: measured from Dashboard |
| Main tank level (remaining gallons) | text | text input | Remaining gallons, from Dashboard or formula |
| Main water tank pipe heater | enum | select: ON / OFF | |
| Main water tank heater | enum | select: ON / OFF | |
| Toilet tank emptied | enum | select: NO / YES | |

### Communications Block

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Summary of internet | text | textarea | Internet/WiFi status |
| Summary of suits and radios | text | textarea | EVA suit and radio status |

### GreenHab Operations Block

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Summary of GreenHab operations | text | textarea | Use info from GreenHab report |
| Water use (gallons) | number | number input | GreenHab water usage |
| Heater | enum | select: ON / OFF | |
| Supplemental light (hours of operation) | text | text input | Hours or "Disabled" |
| Harvest (name, weight in grams) | text | textarea | Crop name and weight |

### Facility Summaries Block

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Summary of ScienceDome operations | text | textarea | |
| Dual split | text | text input | Heat or AC, On or Off or Automatic |
| Summary of RAM operations | text | textarea | Tools used, work done |
| Summary of any observatory issues | text | textarea | Use info from Astronomy report |
| Summary of health and safety issues | text | textarea | No personal information |
| Questions, concerns and requests to Mission Support | text | textarea | |

**Attached pictures:** optional

**Implementation note:** The template includes detailed instructions for measuring water use and tank levels using the Hab iMac Dashboard. These instructions should be displayed as help text or info tooltips next to the relevant fields, not included in the submitted report. The template explicitly states "The next section shall not be included in the report" for the measurement instructions.

---

## 3. GreenHab Report

**Filed by:** GreenHab Officer
**Frequency:** Daily

**Already partially implemented in the crew-report-form app.** Below are the exact fields from the official 2025-2026 template.

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Environmental control (fan & heater) | text | text input | Status of fan and heater systems |
| Average temperatures (last 24h) | number | number input | Degrees, from Dashboard |
| Maximum temperature (last 24h) | number | number input | From Dashboard |
| Minimum temperature (last 24h) | number | number input | From Dashboard |
| Hours of supplemental light | text | text input | Hours or "Disabled" |
| Daily water usage for crops | text | text input | In gallons |
| Daily water usage for research and/or other purposes | text | textarea | |
| Water in the Tank (160 gal useful capacity) | text | text input | Gallons remaining |
| Time(s) of watering for crops | text | text input | Time(s), can be multiple |
| Changes to crops | text | textarea | |
| Narrative | text | textarea (long) | Main narrative section |
| Harvest | text | textarea | Crop name and mass in grams |
| Support/supplies needed | text | textarea | |

**Attached pictures:** optional

**Differences from current form implementation:** The official template specifies 160 gallon useful capacity for the GreenHab tank (the current form app may reference 200 gallons). Verify and update to match the director's template. The measurement instructions (Dashboard steps) should appear as contextual help, not in the submitted data.

---

## 4. EVA Report

**Filed by:** EVA lead
**Frequency:** Per-EVA (may be multiple per sol)

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| EVA # | integer | number input | Sequential EVA number per approved request |
| Purpose of EVA | text | textarea | Must match the approved EVA request |
| Start time | time | time input | Actual EVA start |
| End time | time | time input | Actual EVA end |
| Narrative | text | textarea (long) | Description of what happened during EVA |
| Destination per MDRS Map | text | text input | Named destination |
| Destination Coordinates (UTM WGS 84) | text | text input | UTM coordinates (Easting, Northing) |
| EVA Participants | text | textarea | Names and roles of participants |
| Road(s) and routes per MDRS Map | text | textarea | Directions and route taken |
| Mode of travel | text | text input | Walking, driving, or combination |

**Attached pictures:** optional

**Note on coordinates:** The template specifies "UTM WGS 84" format. The form could offer separate Easting and Northing fields, or a single text field. Separate fields would be better for structured data storage and Qdrant indexing, but the template presents it as a single field. Recommend two sub-fields (Easting, Northing) with the label "Destination Coordinates (UTM WGS 84)".

---

## 5. EVA Request

**Filed by:** EVA lead (typically Commander or designated EVA coordinator)
**Frequency:** Filed in advance of each planned EVA

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| EVA # | integer | number input | Next sequential EVA number |
| Today's Date | date | date input | dd-MM-yyyy, the date of the request |
| Requested EVA Date | date | date input | dd-MM-yyyy |
| Requested start time for EVA | time | time input | |
| Requested end time for EVA | time | time input | |
| Does the weather report support EVA at this time? | text | text input | Yes/No with explanation |
| Purpose of EVA | text | textarea (long) | Detailed justification. Template emphasizes: "Please clearly and in detail identify why you are going and doing what you are planning. You would not plan an EVA on Mars without a reason that outweighs the risk." |
| Destination per MDRS Map | text | text input | |
| Destination Coordinates (UTM WGS 84) | text | text input | |
| EVA Participants | text | textarea | Names and roles |
| Road(s) and routes per MDRS Map | text | textarea | |
| Mode of travel | enum/text | select or text | Walking or driving |
| Vehicles you will be using (if applicable) | text | multi-select or text | Spirit, Perseverance, Opportunity, Curiosity |

**Attached pictures:** optional

---

## 6. Journalist Report

**Filed by:** Crew Journalist
**Frequency:** Daily

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Journalist Report Title (if applicable) | string | text input | Optional title for the day's report |
| Report body | text | textarea (long) | The full journalist narrative. Template says: "include your report here" |

**Attached pictures:** optional

**Notes:** This is intentionally the most free-form report type. The journalist's role is narrative documentation. The form should provide a large, comfortable text area. No additional structured fields beyond the shared header and the optional title.

---

## 7. Photos of the Day

**Filed by:** Crew Journalist
**Frequency:** Daily

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| (no additional fields) | | | Template specifies only the shared header |

**Attached pictures:** required. Template states: "Attached pictures (follow Handbook requirements, page 31)."

**Notes:** This report type is primarily a photo delivery mechanism. The form should focus on image upload functionality with optional captions per photo. The template references Handbook page 31 for photo requirements; this should be linked or summarized in the form's help text.

---

## 8. Astronomy Report

**Filed by:** Astronomy Officer (or designated crew member)
**Frequency:** When observatory operations are conducted (not every sol)

The template has two distinct observatory sections:

### Robotic Observatory Section

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Robotic Telescope Requested | enum | select: MDRS-14 / MDRS-WF | Choose one |
| Objects to be Imaged this Evening | text | textarea | List of target objects |
| Images submitted with this report | text | text input | Yes/No or count |
| Problems Encountered | text | textarea | |

### Musk Observatory Section

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Solar Features Observed | text | textarea | |
| Images submitted with this report | text | text input | Yes/No or count |
| Problems Encountered | text | textarea | |

**Attached pictures:** optional

**Notes:** The two observatory sections are independent. A crew might use one, both, or neither on a given sol. The form should present both sections but allow either to be left empty.

---

## 9. HSO Beginning of Mission Checklist

**Filed by:** Health and Safety Officer
**Frequency:** Once per mission (within first 24 hours)

This is distinct from a daily report. It's a one-time safety audit performed at the start of each crew's mission.

### Part 1: Emergency Escape Routes

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Stairs (between lower and upper deck) | text | text input | Confirm functional and clear |
| Emergency window (upper deck, east side) | text | text input | Confirm functional and clear |
| Commander's window (crew quarter) | text | text input | Confirm functional and clear |

### Part 2: First Aid

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| First Aid kit inventory and refill needs | text | textarea | Inventory results |

### Part 3: Issues

| Field | Type | Input Widget | Notes |
|-------|------|-------------|-------|
| Safety issues noted | text | textarea | |
| Health/environmental issues noted | text | textarea | |
| Missing or recommended health and safety supplies | text | textarea | |

### Part 4: Safety Equipment Inventory

A matrix/checklist covering the following equipment across five locations (HAB Upper Deck, HAB Lower Deck, RAM, GreenHab, Science Dome):

| Equipment | Expected Locations |
|-----------|-------------------|
| Escape ladder | HAB Upper Deck |
| Eyewash | Science Dome |
| Fire blanket | HAB Upper Deck, RAM, Science Dome |
| Fire extinguisher | HAB Upper Deck, HAB Lower Deck, RAM, GreenHab, Science Dome |
| First Aid | HAB Lower Deck, Science Dome |
| Intercom | HAB Upper Deck, RAM, GreenHab, Science Dome |
| Radios (Channels 10 and 22) | HAB Upper Deck, HAB Lower Deck, RAM, GreenHab, Science Dome |
| Nightlight | HAB Upper Deck, HAB Lower Deck, RAM, Science Dome |
| Carbon Monoxide alarm | HAB Upper Deck, HAB Lower Deck, RAM, GreenHab, Science Dome |
| Smoke alarm | HAB Upper Deck, HAB Lower Deck, RAM, GreenHab, Science Dome |
| Propane alarm | HAB Upper Deck, HAB Lower Deck |
| EVA Safety Kit | HAB Lower Deck |

**Form implementation:** Present this as a grid/matrix with checkboxes at each intersection where equipment is expected (marked X in the template). Include a text area for listing any equipment not found or missing. The template includes detailed location descriptions and photos for each item; these should be available as help/reference content in the form but not submitted as report data.

**Attached pictures:** optional

---

## 10. Checkout Checklist

**Filed by:** Crew (collaborative, typically led by Commander)
**Frequency:** Once per mission (at end of mission)

This is a spreadsheet-based checklist, not a narrative report. Each line item has columns for Crew confirmation, Staff confirmation, and Notes.

### Sections and Line Items:

**Science Dome:**
Equipment cleaned, organized and operational | Inventory cleaned, organized | All surfaces cleaned | Window cleaned | All benches washed | Floor vacuumed and mopped (no mud) | Vacuum emptied | Greywater emptied | All personal items removed | If applicable: samples autoclaved | Trash removed and new bags installed | Radios/intercom operational | No damage/damage

**GreenHab:**
Inventory cleaned, organized | All surfaces cleaned | Floor swept | Plants in good condition | All dead plants removed | All personal items removed | Equipment cleaned, organized and operational | Trash removed and new bags installed | Radios/intercom operational | No damage/damage

**Front Airlock:**
Floor vacuumed and mopped (no mud) | Front porch swept

**Lower Deck:**
Equipment cleaned, organized and operational | Inventory cleaned, organized | All surfaces cleaned | Floor vacuumed and mopped (no mud) | Vacuum emptied | Mop clean and stowed | Trash removed and new bags installed | All personal items removed | Stairs clean | First aid supplies in order | EVA Radios and earbuds clean and organized | EVA suits charging and operational | EVA suits cleaned and undamaged | Radios/intercom operational

**Shower Room/Toilet:**
All personal items removed | Shower all surfaces cleaned | Toilet all surfaces cleaned | Sink clean | Floor vacuumed and mopped | Trash removed and new bags installed | Toilet emptied (if not full, fill with water before emptying)

**Rear Airlock:**
Floor vacuumed and mopped (no mud) | Cement pad and step swept | Tunnel cleared of debris, inspected and fixed (if applicable) | If applicable: Solar Observatory cleaned and locked

**Upper Deck:**
Remove all not applicable items from the loft | Stove cleaned | Oven cleaned | Refrigerator cleared of food and cleaned | All dishes washed and put away | All appliances clean and stowed | All appliances operational | Remaining food organized | Food inventory sent to Mission Support | Table clean and correct number of chairs | Floors vacuumed | Crew's quarters cleaned, vacuumed and mopped | Mattresses sprayed with Lysol and wiped | Trash removed and new bag installed | All personal items removed | All surfaces cleaned | No damage/damage | Radios/intercom in place and operational | Vacuum emptied if needed

**Outside:**
Rovers checked for damage/dirt, cleaned of dirt | All rovers charging (if applicable) | HabCar checked (if applicable) | Debris/trash removed from campus | All burnable trash burned | All vehicles in their proper places

**RAM:**
Tools and supplies returned to proper place and organized | All surfaces cleaned | Floor vacuumed and mopped (no mud) | Trash removed

**Footer Items:**
Damages: List any damages (if applicable) | Estimate for replacement/repair | Cleaning fee: Estimate / Actual

**Form implementation:** Present as a checklist with checkbox for each item, a "Staff" checkbox column (for on-site manager use), and a Notes text field per item. Group by section with clear headers.

---

## 11. Food Inventory

**Filed by:** Operations Officer or Commander
**Frequency:** At end of mission (sent to Mission Support)

A spreadsheet tracking remaining food quantities. The inventory is organized by food category with columns for item name, starting amount, unit, weight, and remaining quantity in fractions.

**Categories observed in template:** Baking, Freeze dried, Cereal, Cheese, Milk, Cook (condiments/sauces), and likely additional categories (canned goods, grains, proteins, snacks, beverages, etc.).

**Form implementation:** This is best handled as a spreadsheet-like data entry grid rather than a traditional form. Each row represents a food item with the remaining quantity as the primary field to fill in. The starting inventory should be pre-populated. Consider using the existing xlsx template as-is and providing an upload mechanism, or building an interactive table in the form.

---

## Summary of All Report Types and Implementation Priority

| # | Report Type | Filed By | Frequency | Complexity | Priority |
|---|------------|----------|-----------|------------|----------|
| 1 | Operations Report | Crew Engineer | Daily | High (rovers, water, facilities) | **P1** |
| 2 | Sol Summary | Commander | Daily | Medium (structured + narrative) | **P1** |
| 3 | GreenHab Report | GreenHab Officer | Daily | Medium (temps, water, harvest) | **Done** (refine) |
| 4 | EVA Report | EVA Lead | Per-EVA | Medium (coordinates, participants) | **P2** |
| 5 | EVA Request | EVA Lead | Per-EVA | Medium (planning data) | **P2** |
| 6 | Journalist Report | Journalist | Daily | Low (mostly narrative) | **P3** |
| 7 | Photos of the Day | Journalist | Daily | Low (photo upload) | **P3** |
| 8 | Astronomy Report | Astronomy Officer | Periodic | Low-Medium (two observatory sections) | **P3** |
| 9 | HSO Checklist | HSO | Once/mission | Medium (safety matrix) | **P4** |
| 10 | Checkout Checklist | Crew/Staff | Once/mission | Medium (large checklist) | **P4** |
| 11 | Food Inventory | Ops/Commander | Once/mission | Medium (spreadsheet grid) | **P4** |

---

## Adjustments to Previous Architecture Recommendations

Based on the official templates, the following changes should be made to the earlier analysis:

### 1. Simplify Where the Template is Simple

Several fields that the earlier analysis proposed as structured sub-fields should remain as free text to match the official template. Specifically:

- **Weather** in Sol Summary: keep as a single textarea, not temperature/wind/sky sub-fields
- **EVA Participants**: keep as textarea, not a structured array
- **Crew Physical Status**: keep as textarea
- **Mode of travel** in EVA reports: keep as text, not a strict enum

The philosophy should be: **match the director's template exactly.** If Sergii's template uses free text for a field, the form uses free text. Structured sub-fields can be added later as optional enhancements, but the baseline form must not require more structure than the official template demands.

### 2. Add the Supplemental Report Types

The earlier analysis missed three important non-daily report types that are part of the official MDRS workflow:

- **HSO Beginning of Mission Checklist** (safety equipment audit)
- **Checkout Checklist** (end-of-mission facility inspection)
- **Food Inventory** (end-of-mission food tracking)

These should be implemented as distinct form types, separate from the daily reporting workflow.

### 3. Operations Report Rover Section is Fixed, Not Dynamic

The template specifies exactly four rovers by name: Spirit, Opportunity, Curiosity, Perseverance. There is no "Sojourner" in this template version (it appeared in supplemental reports filed by the Director between seasons). The form should present four fixed rover blocks, not a dynamic "add rover" interface. If the rover fleet changes, update the form rather than making it dynamic.

### 4. Operations Report Water Measurement Notes

The template includes extensive instructions for measuring water using the Hab iMac Dashboard, including screenshots and a manual formula (`V = 550 - 13.07*H - 134`) for when the Dashboard is unavailable. These instructions should be built into the form as contextual help (expandable info panels, tooltips, or a "How to measure" link), not as form fields.

### 5. GreenHab Tank Capacity

The official template specifies "160 gal useful capacity" for the GreenHab water tank. The existing form implementation should be verified and updated to match this figure.

### 6. JSON Schema Extensions

The `report_type` enum in the crew-report-template JSON schema needs these values:

```
sol_summary
operations_report
greenhab_report
eva_report
eva_request
journalist_report
photos_of_the_day
astronomy_report
hso_checklist
checkout_checklist
food_inventory
```

The `report_type_specific` section should contain typed field definitions matching the exact fields documented above for each type.

### 7. Qdrant Ingestion Benefits

Reports submitted through the structured form will produce cleaner data for Qdrant indexing than reports scraped from WordPress. Specifically:

- **Rover data** becomes queryable: "Show me all sols where Curiosity ended below 50% charge"
- **Water levels** become trackable: trend analysis across a season
- **EVA coordinates** are stored as structured UTM data, enabling geographic search and mapping
- **GreenHab temperatures** enable environmental trend analysis
- **HSO safety audits** create a searchable safety baseline for each crew

The form effectively solves the chunking problem for new reports by producing pre-chunked, pre-categorized, metadata-rich content at the point of entry.
