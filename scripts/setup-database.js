const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSqlFile(filename) {
  const filePath = path.join(__dirname, filename)

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File ${filename} not found, skipping...`)
    return
  }

  const sql = fs.readFileSync(filePath, "utf8")

  console.log(`🔄 Running ${filename}...`)

  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

  if (error) {
    console.error(`❌ Error running ${filename}:`, error)
  } else {
    console.log(`✅ Successfully ran ${filename}`)
  }
}

async function setupDatabase() {
  console.log("🚀 Setting up EVEREADY ICEP Platform database...")

  try {
    // Run SQL files in order
    await runSqlFile("create-tables.sql")
    await runSqlFile("create-product-tables.sql")
    await runSqlFile("create-orders-tables.sql")
    await runSqlFile("create-storage-bucket.sql")
    await runSqlFile("fix-rls-policies.sql")
    await runSqlFile("add-inventory-functions.sql")
    await runSqlFile("add-mpesa-columns.sql")
    await runSqlFile("create-reviews-table.sql")
    await runSqlFile("create-inventory-adjustments-table.sql")
    await runSqlFile("create-vendor-profiles-table.sql")

    console.log("🎉 Database setup completed successfully!")
    console.log("📝 Next steps:")
    console.log("   1. Run: npm run dev")
    console.log("   2. Visit: http://localhost:3000")
    console.log("   3. Register as admin, vendor, or customer")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
