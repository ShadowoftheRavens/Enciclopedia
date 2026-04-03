// =====================================================
//  CONFIG
// =====================================================
const API_URL  = "https://api.open5e.com/v1/monsters/";
const PAGE_SIZE = 5;

let currentPage = 1;
let totalPages  = 1;
let monsterList = [];

// =====================================================
//  FETCH
// =====================================================
async function fetchMonsters(page = 1, search = "") {
  const loadingBar = document.getElementById("loading-bar");
  const errorDiv   = document.getElementById("error");

  loadingBar.style.display = "block";
  errorDiv.innerHTML = "";

  try {
    const response = await fetch(
      `${API_URL}?page=${page}&search=${encodeURIComponent(search)}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data  = await response.json();
    monsterList = data.results;
    totalPages  = Math.ceil(data.count / data.results.length);
    currentPage = page;

    updatePageInfo();
    loadingBar.style.display = "none";
    renderMonsters();
  } catch (error) {
    loadingBar.style.display = "none";
    document.getElementById("error").innerHTML =
      `<strong>Error:</strong> ${error.message}`;
  }
}

// =====================================================
//  RENDER
// =====================================================
function renderMonsters() {
  const parent = document.getElementById("parentID");
  parent.innerHTML = "";

  monsterList.slice(0, PAGE_SIZE).forEach((m) => {
    parent.innerHTML += buildStatBlock(m);
  });
}

// =====================================================
//  BUILD STAT BLOCK HTML
// =====================================================
function buildStatBlock(m) {
  const skillsText = formatSkills(m.skills);
  const savesText  = formatSaves(m);
  const senses     = m.senses    || "—";
  const languages  = m.languages || "—";
  const cr         = m.challenge_rating || "—";
  const xp         = m.xp ? `(${m.xp.toLocaleString()} XP)` : "";
  const speed      = m.speed     || "—";
  const damageImm  = m.damage_immunities        || "";
  const damageRes  = m.damage_resistances       || "";
  const damageVuln = m.damage_vulnerabilities   || "";
  const condImm    = m.condition_immunities     || "";
  const ac         = m.armor_class_text || m.armor_class || "—";
  const uid        = slugify(m.name) + "-" + (m.document__slug || "");

  return `
<div class="monster_stats" id="block-${uid}">
  <div class="stat-block">

    <span class="orange-border"></span>

    <div class="creature-heading collapse-toggle" onclick="toggleBlock('${uid}')">
      <div>
        <h1>${m.name}</h1>
        <h2>${capitalize(m.size)} ${m.type}${m.subtype ? ` (${m.subtype})` : ""}, ${m.alignment}</h2>
      </div>
      <span class="collapse-icon">▼</span>
    </div>

    <div class="stat-block-body" id="body-${uid}">

      <svg class="tapered-rule" height="5" viewBox="0 0 400 4">
        <polyline points="0,0 400,2 0,4" fill="#922610"/>
      </svg>

      <div class="property-line first"><h4>Armor Class</h4><p>${ac}</p></div>
      <div class="property-line"><h4>Hit Points</h4><p>${m.hit_points} ${m.hit_dice ? `(${m.hit_dice})` : ""}</p></div>
      <div class="property-line last"><h4>Speed</h4><p>${formatSpeed(speed)}</p></div>

      <svg class="tapered-rule" height="5" viewBox="0 0 400 4">
        <polyline points="0,0 400,2 0,4" fill="#922610"/>
      </svg>

      <div class="abilities">
        ${abilityBlock("STR", m.strength)}
        ${abilityBlock("DEX", m.dexterity)}
        ${abilityBlock("CON", m.constitution)}
        ${abilityBlock("INT", m.intelligence)}
        ${abilityBlock("WIS", m.wisdom)}
        ${abilityBlock("CHA", m.charisma)}
      </div>

      <svg class="tapered-rule" height="5" viewBox="0 0 400 4">
        <polyline points="0,0 400,2 0,4" fill="#922610"/>
      </svg>

      ${savesText  ? `<div class="property-line first"><h4>Saving Throws</h4><p>${savesText}</p></div>` : ""}
      ${skillsText ? `<div class="property-line"><h4>Skills</h4><p>${skillsText}</p></div>` : ""}
      ${damageVuln ? `<div class="property-line"><h4>Damage Vulnerabilities</h4><p>${damageVuln}</p></div>` : ""}
      ${damageRes  ? `<div class="property-line"><h4>Damage Resistances</h4><p>${damageRes}</p></div>` : ""}
      ${damageImm  ? `<div class="property-line"><h4>Damage Immunities</h4><p>${damageImm}</p></div>` : ""}
      ${condImm    ? `<div class="property-line"><h4>Condition Immunities</h4><p>${condImm}</p></div>` : ""}
      <div class="property-line"><h4>Senses</h4><p>${senses}</p></div>
      <div class="property-line"><h4>Languages</h4><p>${languages}</p></div>
      <div class="property-line last"><h4>Challenge</h4><p>${cr} ${xp}</p></div>

      ${buildSection(m.special_abilities, null)}
      ${buildSection(m.actions, "Actions")}
      ${buildSection(m.bonus_actions, "Bonus Actions")}
      ${buildSection(m.reactions, "Reactions")}
      ${buildLegendarySection(m)}

    </div>

    <span class="orange-border bottom"></span>
  </div>
</div>`;
}

// =====================================================
//  COLLAPSE / EXPAND
// =====================================================
function toggleBlock(uid) {
  const body  = document.getElementById(`body-${uid}`);
  const block = document.getElementById(`block-${uid}`);
  const isCollapsed = body.classList.toggle("collapsed");
  block.classList.toggle("collapsed-state", isCollapsed);
}

function collapseAll() {
  document.querySelectorAll(".stat-block-body").forEach(b => {
    b.classList.add("collapsed");
    b.closest(".monster_stats").classList.add("collapsed-state");
  });
}

function expandAll() {
  document.querySelectorAll(".stat-block-body").forEach(b => {
    b.classList.remove("collapsed");
    b.closest(".monster_stats").classList.remove("collapsed-state");
  });
}

// =====================================================
//  SECTION BUILDERS
// =====================================================
function buildSection(items, title) {
  if (!items || items.length === 0) return "";
  const header = title
    ? `<div class="actions"><h3>${title}</h3>`
    : `<div class="actions">`;
  const body = items.map(item => `
    <div class="property-block">
      <h4>${item.name}. </h4><p>${item.desc}</p>
    </div>`).join("");
  return header + body + `</div>`;
}

function buildLegendarySection(m) {
  if (!m.legendary_actions || m.legendary_actions.length === 0) return "";
  const intro   = m.legendary_desc ? `<p>${m.legendary_desc}</p>` : "";
  const actions = m.legendary_actions.map(item => `
    <div class="property-block">
      <h4>${item.name}. </h4><p>${item.desc}</p>
    </div>`).join("");
  return `<div class="actions"><h3>Legendary Actions</h3>${intro}${actions}</div>`;
}

// =====================================================
//  HELPERS
// =====================================================
function abilityBlock(label, value) {
  const score = value ?? 10;
  return `<div><h4>${label}</h4><p>${score} ${modifier(score)}</p></div>`;
}
function modifier(score) {
  const mod = Math.floor(score / 2) - 5;
  return mod >= 0 ? `(+${mod})` : `(${mod})`;
}
function formatSkills(skills) {
  if (!skills || typeof skills !== "object") return "";
  return Object.entries(skills)
    .map(([k, v]) => `${capitalize(k)} ${v >= 0 ? "+" : ""}${v}`)
    .join(", ");
}
function formatSaves(m) {
  const saves = [];
  const map = { strength_save:"Str", dexterity_save:"Dex", constitution_save:"Con",
                intelligence_save:"Int", wisdom_save:"Wis", charisma_save:"Cha" };
  for (const [key, label] of Object.entries(map)) {
    if (m[key] != null) saves.push(`${label} +${m[key]}`);
  }
  return saves.join(", ");
}
function formatSpeed(speed) {
  if (typeof speed === "string") return speed;
  if (typeof speed === "object") {
    return Object.entries(speed)
      .filter(([, v]) => v)
      .map(([k, v]) => k === "walk" ? `${v} ft.` : `${k} ${v} ft.`)
      .join(", ");
  }
  return speed;
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function updatePageInfo() {
  const text = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("page-info").innerText        = text;
  document.getElementById("page-info-bottom").innerText = text;
}

// =====================================================
//  PAGINATION
// =====================================================
function nextPage() {
  if (currentPage < totalPages) {
    fetchMonsters(currentPage + 1, document.getElementById("search").value);
    scrollToTop();
  }
}
function prevPage() {
  if (currentPage > 1) {
    fetchMonsters(currentPage - 1, document.getElementById("search").value);
    scrollToTop();
  }
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =====================================================
//  SEARCH (debounced) + INIT
// =====================================================
let searchTimer;
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchMonsters(1, e.target.value.trim()), 350);
  });

  fetchMonsters(1);
});
