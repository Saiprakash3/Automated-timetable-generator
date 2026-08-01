# Timetable Generation — Weekly Load-Balancing & Day Distribution Fix

## 📌 Problem Summary

When generating a new timetable, all subject sessions and lab assignments were getting placed **exclusively on Monday**, leaving Tuesday, Wednesday, Thursday, and Friday completely empty.

---

## 🔍 Root Cause Analysis

In `Frontend/src/lib/generateTimetable.ts`, the greedy placement algorithm iterated through `DAYS` starting from index 0 (`"Monday"`) for every single subject mapping row:

```typescript
// ❌ Previous Implementation: Always started with DAYS[0] ("Monday")
for (const day of DAYS) {
  if (slotIsFree(day, period)) {
    placeSession(day, period);
    break; // <--- Broke the day loop immediately on Monday!
  }
}
```

Since Monday has 6 available period slots (P1–P6) and sufficient room capacity, every subject mapping row found its first free slot on **Monday**, placed the entry, and executed `break`. As a result:
- No subject ever reached Tuesday, Wednesday, Thursday, or Friday.
- A single section's entire weekly schedule was crammed onto Monday.

---

## ✨ Solution & Implementation

We introduced a dynamic **load-balanced day selector** function `getSortedDays(sectionId)` in [generateTimetable.ts](file:///e:/prakash/Automated-timetable-generator/Frontend/src/lib/generateTimetable.ts):

```typescript
function getSortedDays(sectionId?: string) {
  if (!sectionId) return DAYS;
  return [...DAYS].sort((a, b) => {
    let countA = 0;
    let countB = 0;
    for (let p = 1; p <= 6; p++) {
      if (isBusy(sectionBusy, sectionId, slotKey(a, p))) countA++;
      if (isBusy(sectionBusy, sectionId, slotKey(b, p))) countB++;
    }
    return countA - countB; // Sorts days by least-busy first
  });
}
```

### How It Works:
1. Before placing an elective, lab, or regular subject session for a section, the algorithm queries the current count of assigned sessions for that section across all 5 days (`Monday` to `Friday`).
2. Candidate days are sorted in **ascending order of section load** (days with the fewest placed sessions come first).
3. Session 1 is placed on **Monday** (load becomes 1).
4. Session 2 is placed on **Tuesday** (load becomes 1).
5. Session 3 is placed on **Wednesday**, Session 4 on **Thursday**, Session 5 on **Friday**.
6. Session 6 rotates back to the next available day.

---

## 📂 Files Modified

- **[Frontend/src/lib/generateTimetable.ts](file:///e:/prakash/Automated-timetable-generator/Frontend/src/lib/generateTimetable.ts)**: Replaced static `DAYS` loop iterations with `getSortedDays(sectionId)` for electives, labs, and regular sessions.

---

## ✅ Verification

1. **TypeScript & Build Verification:**
   ```powershell
   cd Frontend
   npm run build
   ```
   *Result:* Passed cleanly with `0 errors` (`built in 342ms`).

2. **Generated Timetable Inspection:**
   - Click **Generate Timetable** in the Admin panel.
   - Switch between **Monday**, **Tuesday**, **Wednesday**, **Thursday**, and **Friday** in the View Controls or select **Week View**.
   - Sessions are now evenly distributed across all 5 days of the week.
