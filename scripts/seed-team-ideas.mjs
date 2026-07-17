import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEAM_EMAIL = "team@ideacentre.xyz";
const TEAM_NAME = "ideaCentre Team";
const TEAM_USERNAME = "ideacentre-team";

const COLORS = [
  "#000000",
  "#0A0A0A",
  "#101010",
  "#141414",
  "#181818",
  "#1D1D1D",
  "#222222",
  "#282828",
];

const MUSIC = [
  "/music/music1.mp3",
  "/music/music2.mp3",
  "/music/music3.mp3",
  "/music/music4.mp3",
  "/music/music5.mp3",
  "/music/music6.mp3",
  "/music/music7.mp3",
  "/music/music8.mp3",
  null,
];

const IDEAS = [
  {
    category: "AI / Health",
    title: "Symptom Journal that Speaks",
    idea: "A voice-first health journal that turns daily symptoms into doctor-ready summaries.",
    description:
      "People forget details between appointments. Record short voice notes, get structured timelines, and share a clean PDF with your clinician.",
  },
  {
    category: "AI / Health",
    title: "Medication Buddy",
    idea: "Smart reminders that adapt when you miss doses and explain interactions in plain language.",
    description:
      "Combine pharmacy labels with gentle coaching. If you skip a dose, the app suggests the safest next step and notifies a caregiver only when you opt in.",
  },
  {
    category: "AI / Health",
    title: "Mental Load Check-In",
    idea: "A two-minute daily check-in that spots burnout patterns before they crash you.",
    description:
      "Answer a few mood and energy prompts. Trends surface early warning signs and suggest micro-habits tailored to your week.",
  },
  {
    category: "AI / Health",
    title: "Clinic Wait Whisperer",
    idea: "Predict clinic wait times using anonymized check-in data from nearby patients.",
    description:
      "Patients opt in to share arrival and start times. Others see live estimates so they plan travel and childcare better.",
  },
  {
    category: "AI / Health",
    title: "Post-Op Recovery Coach",
    idea: "Day-by-day recovery plans with photo progress and red-flag alerts after surgery.",
    description:
      "Surgeons publish protocol templates. Patients track swelling, pain, and mobility; the app flags when something looks off.",
  },
  {
    category: "AI / Health",
    title: "Allergy Menu Translator",
    idea: "Scan any restaurant menu and highlight dishes safe for your allergen profile.",
    description:
      "Upload allergies once. Point your camera at a menu or QR code and get clear safe / ask / avoid labels in your language.",
  },
  {
    category: "Community",
    title: "Neighbor Skill Swap",
    idea: "Trade hours of skills with people on your block — tutoring, repairs, language practice.",
    description:
      "Earn credits by helping neighbors, spend them on help you need. Verified local profiles keep it grounded and safe.",
  },
  {
    category: "Community",
    title: "Lost Pet Radar",
    idea: "Hyperlocal alerts when a pet goes missing, with sighting pins from the community.",
    description:
      "Post a lost pet with a photo. Nearby users get a push; sightings update a live map for the search radius.",
  },
  {
    category: "Community",
    title: "Block Cleanup Crew",
    idea: "Organize micro cleanups with tools, timeslots, and before/after proof for sponsors.",
    description:
      "Residents claim a street segment, invite friends, and unlock small rewards from local businesses that care.",
  },
  {
    category: "Community",
    title: "Newcomer Welcome Kit",
    idea: "A city-specific welcome path for people who just moved — documents, food, friends.",
    description:
      "Pick your city and goals. Get a curated checklist plus intros to volunteer buddies who already live there.",
  },
  {
    category: "Community",
    title: "Quiet Hours Map",
    idea: "Crowd-sourced noise map of cafes, libraries, and parks ranked by focus friendliness.",
    description:
      "Log a short visit rating. Remote workers discover places that match their preferred vibe and peak quiet hours.",
  },
  {
    category: "Community",
    title: "Mutual Aid Board",
    idea: "A trusted board for requests and offers — groceries, rides, childcare — within your ZIP.",
    description:
      "Posts expire fast to stay relevant. Reputation scores from completed helps reduce spam without heavy moderation.",
  },
  {
    category: "SaaS",
    title: "Invoice Chaser Lite",
    idea: "Friendly automated follow-ups for freelancers who hate chasing unpaid invoices.",
    description:
      "Connect your billing tool, set tone presets, and let polite reminders go out until the invoice is paid or paused.",
  },
  {
    category: "SaaS",
    title: "Meeting Notes to Tasks",
    idea: "Turn messy meeting transcripts into owners, deadlines, and Slack-ready summaries.",
    description:
      "Paste a transcript or connect Zoom. Extract decisions, risks, and action items with one click to your task board.",
  },
  {
    category: "SaaS",
    title: "Customer Quote Vault",
    idea: "Store winning sales quotes and regenerate tailored proposals in your brand voice.",
    description:
      "Sales teams tag quotes by industry and deal size. New reps draft proposals that already sound like your best closers.",
  },
  {
    category: "SaaS",
    title: "Churn Radar",
    idea: "Surface accounts that look quiet before they cancel, with playbooks for CSMs.",
    description:
      "Combine product usage, support tickets, and NPS. Alert when engagement drops and suggest the next outreach move.",
  },
  {
    category: "SaaS",
    title: "API Status Story",
    idea: "Beautiful public status pages that explain incidents in human language, not jargon.",
    description:
      "Pull from monitoring tools, auto-draft customer updates, and keep a history customers actually trust.",
  },
  {
    category: "SaaS",
    title: "Permission Diff Tool",
    idea: "See who gained or lost access across SaaS apps after every role change.",
    description:
      "Connect Okta or Google Workspace. Review permission diffs before merges so least-privilege stays real.",
  },
  {
    category: "SaaS",
    title: "Onboarding Checklist OS",
    idea: "Reusable onboarding checklists for B2B customers with progress shared to both sides.",
    description:
      "Implementation managers assign steps; customers see clear next actions. Reduce time-to-value without endless email.",
  },
  {
    category: "Education",
    title: "Flashcards from Lectures",
    idea: "Upload lecture audio and get spaced-repetition cards in minutes.",
    description:
      "Students focus in class while the app turns recordings into decks they can review on the commute home.",
  },
  {
    category: "Education",
    title: "Study Pair Finder",
    idea: "Match classmates by exam date, topic gaps, and preferred study style.",
    description:
      "Opt in with your course code. Get suggested pairs for problem sets, not random group chats that go silent.",
  },
  {
    category: "Education",
    title: "Parent Progress Plain",
    idea: "Translate school portals into a weekly plain-language brief for busy parents.",
    description:
      "Pull grades and assignments, highlight what needs attention, and suggest one conversation starter for the weekend.",
  },
  {
    category: "Education",
    title: "Skill Proof Portfolio",
    idea: "A portfolio that proves skills with short challenges instead of inflated resumes.",
    description:
      "Complete timed challenges in writing, data, or design. Share verified badges with recruiters who want signal.",
  },
  {
    category: "Education",
    title: "Campus Lost Notes",
    idea: "Share and find handwritten or scanned notes by course and lecture date.",
    description:
      "Missed a class? Search your campus feed. Contributors earn reputation; quality notes rise to the top.",
  },
  {
    category: "Education",
    title: "Language Café Rooms",
    idea: "Timed voice rooms where learners practice a target language with structured prompts.",
    description:
      "Join a 15-minute room, get a topic card, and swap feedback. Better than silent Duolingo streaks alone.",
  },
  {
    category: "Finance",
    title: "Subscription Autopsy",
    idea: "Find forgotten subscriptions and negotiate or cancel with one guided flow.",
    description:
      "Connect banking read-only, spot recurring charges, and walk through cancel or keep decisions without shame.",
  },
  {
    category: "Finance",
    title: "Split Fairly",
    idea: "Group expenses that respect income differences, not just equal splits.",
    description:
      "Roommates set fairness rules once. Trips and dinners settle faster with fewer awkward money talks.",
  },
  {
    category: "Finance",
    title: "Side Hustle Ledger",
    idea: "A simple ledger for creators that tracks income, taxes set-aside, and quarterly estimates.",
    description:
      "Import payouts from platforms, auto-tag expenses, and see how much to leave untouched for tax day.",
  },
  {
    category: "Finance",
    title: "First Home Timeline",
    idea: "A personalized home-buying timeline with savings goals and document checklists.",
    description:
      "Enter city and budget. Get milestones for credit, deposits, and viewings so the process feels less opaque.",
  },
  {
    category: "Finance",
    title: "Invoice for Creators",
    idea: "Beautiful invoices and contracts tuned for photographers, designers, and coaches.",
    description:
      "Templates, late fees, and deposit rules in plain English. Clients pay online; you stay focused on the craft.",
  },
  {
    category: "Finance",
    title: "Gift Budget Circles",
    idea: "Family gift planning with shared budgets so holidays stop becoming surprise debt.",
    description:
      "Set a circle budget, claim gift ideas, and track spending together without spoiling surprises.",
  },
  {
    category: "Sustainability",
    title: "Fridge Rescue",
    idea: "Scan fridge contents and get recipes that use what expires first.",
    description:
      "Reduce food waste with meal ideas ranked by urgency. Optional grocery list fills only the gaps.",
  },
  {
    category: "Sustainability",
    title: "Repair Before Replace",
    idea: "Find local repair shops and DIY guides for appliances before buying new ones.",
    description:
      "Search by product and symptom. See nearby technicians, parts availability, and estimated cost vs replacement.",
  },
  {
    category: "Sustainability",
    title: "Commute Carbon Buddy",
    idea: "Track your weekly commute emissions and suggest realistic swaps you might actually keep.",
    description:
      "Log trips or sync calendar. Celebrate small wins like one WFH day or a bike segment without perfectionism.",
  },
  {
    category: "Sustainability",
    title: "Closet Second Life",
    idea: "Turn unused clothes into local swaps and micro thrift events with friends.",
    description:
      "Photograph items, invite a circle, and host a living-room swap. Leftovers get routed to donation partners.",
  },
  {
    category: "Sustainability",
    title: "Green Lease Score",
    idea: "Rate rentals on energy efficiency, transit, and green spaces before you sign.",
    description:
      "Combine public data with tenant reviews so renters can compare apartments beyond photos and rent.",
  },
  {
    category: "Sustainability",
    title: "Office Energy Sprint",
    idea: "Gamify reducing office energy use with weekly challenges teams can win together.",
    description:
      "Facilities share meter data. Teams compete on lights-off habits and device sleep policies with visible progress.",
  },
  {
    category: "Entertainment",
    title: "Watch Party Queue",
    idea: "Sync friends’ streaming wishlists and schedule watch parties that actually happen.",
    description:
      "Everyone adds titles. The app finds overlap and proposes times that work across time zones.",
  },
  {
    category: "Entertainment",
    title: "Micro Concert Finder",
    idea: "Discover tiny live shows within walking distance tonight — open mics, jazz, poetry.",
    description:
      "Venues post last-minute slots. Locals get a short curated list instead of endless ticket feeds.",
  },
  {
    category: "Entertainment",
    title: "Story Prompt Duels",
    idea: "Two writers get the same prompt and race to a short story readers vote on.",
    description:
      "Timed rounds, anonymous drafts, and community feedback that celebrates craft over clout.",
  },
  {
    category: "Entertainment",
    title: "Board Game Match",
    idea: "Find nearby players for the games you own — complexity, length, and vibe matched.",
    description:
      "List your shelf. Get invites for nights that fit your free time and preferred player count.",
  },
  {
    category: "Entertainment",
    title: "Podcast Clip Club",
    idea: "Share 60-second podcast moments with friends and discuss without spoiling full episodes.",
    description:
      "Clip timestamps, add a question, and keep conversations bite-sized for busy listeners.",
  },
  {
    category: "Entertainment",
    title: "City Photo Walks",
    idea: "Guided photo walks with themes, meetup points, and a shared album at the end.",
    description:
      "Hosts publish routes. Participants shoot on theme, then vote on favorites without toxic ranking.",
  },
  {
    category: "Other",
    title: "Decision Timer",
    idea: "A structured timer for tough personal decisions with pros, cons, and a cool-down vote.",
    description:
      "Capture the dilemma, sleep on it, then revisit with a forced calm review so impulse choices slow down.",
  },
  {
    category: "Other",
    title: "Moving Day OS",
    idea: "Checklists, box labels, and helper schedules that make moving feel less chaotic.",
    description:
      "Room-by-room packing lists, QR labels for boxes, and shared timelines for friends helping you move.",
  },
  {
    category: "Other",
    title: "Pet Sitter Passport",
    idea: "A portable care guide for pets when friends or sitters step in.",
    description:
      "Feeding, meds, quirks, and vet contacts in one shareable link. Sitters stop guessing under stress.",
  },
  {
    category: "Other",
    title: "Gift Memory Bank",
    idea: "Remember what you already gave friends and family so you never repeat a gift.",
    description:
      "Log gifts by person and occasion. Next holiday, see history and fresh ideas that still feel personal.",
  },
  {
    category: "Other",
    title: "Tiny Habit Chains",
    idea: "Stack two-minute habits into chains that survive messy weeks.",
    description:
      "Design chains like stretch → water → inbox triage. Miss one link without breaking the whole streak story.",
  },
  {
    category: "Other",
    title: "Travel Document Vault",
    idea: "Offline-ready copies of IDs, tickets, and bookings with emergency share links.",
    description:
      "Encrypt sensitive trips docs. Share temporary access with a travel buddy if your phone dies abroad.",
  },
  {
    category: "SaaS",
    title: "Feedback Loop Inbox",
    idea: "Collect product feedback from Slack, email, and forms into one prioritized backlog.",
    description:
      "Tag themes automatically, detect duplicates, and show product teams what customers repeat most.",
  },
];

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureTeamUser() {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email: TEAM_EMAIL,
        name: TEAM_NAME,
        username: TEAM_USERNAME,
        image: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id,name,email")
    .single();

  if (error) throw new Error(`Failed to upsert team user: ${error.message}`);
  return data;
}

async function ensureCategory(name) {
  const slug = slugify(name);
  const { error: upsertError } = await supabase.from("categories").upsert(
    { slug, name },
    { onConflict: "slug" },
  );
  if (upsertError) {
    throw new Error(`Failed to upsert category ${name}: ${upsertError.message}`);
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(`Failed to load category ${name}: ${error.message}`);
  return data.id;
}

async function main() {
  console.log(`Seeding ${IDEAS.length} ideas as ${TEAM_NAME}…`);

  const team = await ensureTeamUser();
  console.log(`Team user ready: ${team.name} <${team.email}> (${team.id})`);

  const categoryIds = new Map();
  for (const name of [...new Set(IDEAS.map((i) => i.category))]) {
    categoryIds.set(name, await ensureCategory(name));
  }

  // Skip titles already posted by the team user (idempotent re-runs).
  const { data: existing, error: existingError } = await supabase
    .from("ideas")
    .select("title")
    .eq("author_id", team.id)
    .eq("status", "published");

  if (existingError) {
    throw new Error(`Failed to list existing ideas: ${existingError.message}`);
  }

  const existingTitles = new Set((existing ?? []).map((row) => row.title));
  const toInsert = IDEAS.filter((idea) => !existingTitles.has(idea.title));

  if (toInsert.length === 0) {
    console.log("All seed ideas already exist for the team user. Nothing to insert.");
    return;
  }

  const rows = toInsert.map((idea, index) => ({
    author_id: team.id,
    category_id: categoryIds.get(idea.category),
    title: idea.title,
    idea: idea.idea,
    description: idea.description,
    background_color: COLORS[index % COLORS.length],
    music_track: MUSIC[index % MUSIC.length],
    status: "published",
    like_count: 0,
    comment_count: 0,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("ideas")
    .insert(rows)
    .select("id,title");

  if (insertError) {
    // Retry without music_track if the column is missing.
    if (insertError.message?.toLowerCase().includes("music_track")) {
      const withoutMusic = rows.map(({ music_track: _m, ...rest }) => rest);
      const retry = await supabase.from("ideas").insert(withoutMusic).select("id,title");
      if (retry.error) {
        throw new Error(`Failed to insert ideas: ${retry.error.message}`);
      }
      console.log(`Inserted ${retry.data.length} ideas (without music_track column).`);
      return;
    }
    throw new Error(`Failed to insert ideas: ${insertError.message}`);
  }

  console.log(`Inserted ${inserted.length} ideas.`);
  for (const row of inserted) {
    console.log(`  • ${row.title}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
