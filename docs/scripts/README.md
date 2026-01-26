# Migration Scripts

## migrate-plan-day-field.ts

This script backfills the `day` field in the `PlanDay` table based on the `order` value.

### What it does:
- Updates all existing `PlanDay` records to set the `day` field based on their `order`:
  - order 0 = "Sunday"
  - order 1 = "Monday"
  - order 2 = "Tuesday"
  - order 3 = "Wednesday"
  - order 4 = "Thursday"
  - order 5 = "Friday"
  - order 6 = "Saturday"
  - order 7 = "Saturday" (treated as Saturday)
  - order > 7 = null

### Prerequisites:
1. Run the database migration first:
   ```bash
   npx prisma migrate dev
   ```

2. Regenerate Prisma client (types):
   ```bash
   npx prisma generate
   ```

### Usage:

**Option 1: Using npm script (recommended)**
```bash
npm run db:migrate:plan-day
```

**Option 2: Using npx directly**
```bash
npx tsx scripts/migrate-plan-day-field.ts
```

### Output:
The script will display:
- Progress for each PlanDay updated
- Summary with counts of:
  - Updated records
  - Skipped records (already have correct day value)
  - Errors (if any)
  - Total records processed

### Example Output:
```
🚀 Starting PlanDay migration...

📊 Found 21 PlanDay records to process

✅ Updated PlanDay abc123 (order: 0, title: "Day 2 - Full Body") -> day: Sunday
✅ Updated PlanDay def456 (order: 1, title: "Tuesday Workout") -> day: Monday
...

==================================================
📈 Migration Summary:
   ✅ Updated: 18
   ⏭️  Skipped (already set): 3
   ❌ Errors: 0
   📊 Total: 21
==================================================

🎉 Migration completed successfully!
```

