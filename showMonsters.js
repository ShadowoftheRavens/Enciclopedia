async function showMonsters() {
  const url = "https://api.open5e.com/v1/monsters/";

  try {
    if (!window.monstersData) {
      document.getElementById("searchbar").style.display = "none";
      // Display loading bar
      const loadingBar = document.getElementById("loading-bar");
      loadingBar.style.display = "block";

      const response = await fetch(url);
      const data = await response.json();
      const totalPages = Math.ceil(data.count / data.results.length);

      const fetchPromises = [];
      for (let index = 1; index <= totalPages; index++) {
        try {
          const response = await fetch(`${url}?page=${index}`);
          if (response.status === 200) {
            fetchPromises.push(response);
          }
        } catch (error) {
          loadingBar.style.display = "none";
          const errorMessage = `An error occurred: ${error.message} Please refresh the page or try again.`;
          document.getElementById("error").innerHTML = errorMessage;
          setTimeout(5000);
          location.reload();
        }
      }

      const responses = await Promise.all(fetchPromises);
      const jsonData = await Promise.all(
        responses.map((response) => response.json())
      );

      monsterList = jsonData.flatMap((data) => data.results);
      console.log(monsterList.length, "=>", monsterList);
      window.monstersData = monsterList;

      // Hide loading bar
      loadingBar.style.display = "none";

      document.getElementById("searchbar").style.display = "inline";
      document.getElementById("search").style.display = "inline";
    }
  } catch (error) {
    loadingBar.style.display = "none";
    const errorMessage = `An error occurred: ${error.message} Please refresh the page or try again.`;
    document.getElementById("error").innerHTML = errorMessage;
    setTimeout(5000);
    location.reload();
  }

  document.getElementById("parentID").innerHTML = "";
  var counter = 0;
  var search = document.getElementById("search").value;

  if (monsterList.length !== 2847) {
    document.getElementById(
      "parentID"
    ).innerHTML += `<h3>Monster availability is limited: available monsters: ${monsterList.length}</h3>`;
  }

  monsterList.forEach((value) => {
    if (
      value.name.toLowerCase().includes(search.toLowerCase()) &&
      counter <= 4
    ) {
      console.log(value.slug);
      let skillString = " ";
      console.log(counter);

      const skillEntries = Object.entries(value.skills);
      skillString = skillEntries
        .map(([skill, value]) => `${skill}: ${value}`)
        .join(", ");

      let actionsString = "";
      value.actions.forEach((action, index) => {
        actionsString += `${action.name}:<br>${action.desc}<br>`;
        if (index < value.actions.length - 1) {
          actionsString += "<br>"; // Add double line break if it's not the last action
        }
      });

      let legendaryActionsString = "";
      if (value.legendary_actions && value.legendary_actions.length > 0) {
        if (actionsString !== "") {
          legendaryActionsString += "<br>";
        }
        value.legendary_actions.forEach((action, index) => {
          legendaryActionsString += `${action.name}:<br>${action.desc}`;
          if (index < value.legendary_actions.length - 1) {
            legendaryActionsString += "<br><br>"; // Add double line break if it's not the last legendary action
          }
        });
      }

      let specialAbilitiesString = "";
      if (value.special_abilities && value.special_abilities.length > 0) {
        if (actionsString !== "") {
          specialAbilitiesString += "<br>";
        }
        value.special_abilities.forEach((ability, index) => {
          specialAbilitiesString += `${ability.name}:<br>${ability.desc}`;
          if (index < value.special_abilities.length - 1) {
            specialAbilitiesString += "<br><br>"; // Add double line break if it's not the last special ability
          }
        });
      }

      document.getElementById("parentID").innerHTML += `
         <div class="monster_stats">
        <div class="stat-block wide">
          <hr class="orange-border" />
          <div class="section-left">
        <div class="creature-heading">
          <h1> ${value.name}</h1>
          
          <h2>${value.size} ${value.type}${
        value.subtype ? " " + value.subtype : ""
      } ,${value.alignment}</h2>
        </div>
        <!-- creature heading -->
        <svg height="5" width="100%" class="tapered-rule">
          <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
        <div class="top-stats">
          <div class="property-line first">
        <h4>Armor Class</h4>
        <p>${value.armor_class} ${
        value.armor_desc ? "(" + value.armor_desc + ")" : ""
      }</p>
          </div>
          <!-- property line -->
          <div class="property-line">
        <h4>Hit Points</h4>
        <p>${value.hit_points} ${
        value.hit_dice ? "(" + value.hit_dice + ")" : ""
      }</p>
          </div>
          <!-- property line -->
          <div class="property-line last">
        <h4>Speed</h4>
        <p><br>Walk: ${value.speed.walk} ft <br> Swim :${
        value.speed.swim ? value.speed.swim + " ft" : ""
      } <br>Fly :${value.speed.fly ? value.speed.fly + " ft" : ""}</p>
          </div>
          <!-- property line -->
          <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
          </svg>
          <div class="abilities">
        <div class="ability-strength">
          <h4>STR</h4>
          <p>${value.strength} ${abilityScore(value.strength)}</p>
        </div>
        <!-- ability strength -->
        <div class="ability-dexterity">
          <h4>DEX</h4>
          <p>${value.dexterity} ${abilityScore(value.dexterity)}</p>
        </div>
        <!-- ability dexterity -->
        <div class="ability-constitution">
          <h4>CON</h4>
          <p>${value.constitution} ${abilityScore(value.constitution)}</p>
        </div>
        <!-- ability constitution -->
        <div class="ability-intelligence">
          <h4>INT</h4>
          <p>${value.intelligence} ${abilityScore(value.intelligence)}</p>
        </div>
        <!-- ability intelligence -->
        <div class="ability-wisdom">
          <h4>WIS</h4>
          <p>${value.wisdom} ${abilityScore(value.wisdom)}</p>
        </div>
        <!-- ability wisdom -->
        <div class="ability-charisma">
          <h4>CHA</h4>
          <p>${value.charisma} ${abilityScore(value.charisma)}</p>
        </div>
        <!-- ability charisma -->
          </div>
          <!-- abilities -->
          <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
          </svg>
          <div class="property-line first">
        <h4>Saving Throws</h4>
        <p> <br>Strength: ${value.strength_save || 0} 
        
        <br>Dexterity: ${value.dexterity_save || 0}
        <br>Constitution: ${value.constitution_save || 0}<br>Intelligence: ${
        value.intelligence_save || 0
      }
        <br>Wisdom: ${value.wisdom_save || 0} <br>Charisma: ${
        value.charisma_save || 0
      }</p>
          </div>
          <!-- property line -->
          <div class="property-line last">
        <h4>Damage Resistances</h4>
        <p>${value.damage_resistances || ""}</p>
          </div>
          <!-- property line -->
          <div class="property-line last">
        <h4>Damage Immunities</h4>
        <p>${value.damage_immunities || ""}</p>
          </div>
          <!-- property line -->
          <div class="property-line last">
        <h4>Condition Immunities</h4>
        <p>${value.condition_immunities || ""}</p>
          </div>
          <!-- property line -->
          <div class="property-line">
        <h4>Skills</h4>
        <p>${skillString || ""}</p>
          </div>
          <!-- property line -->
          <div class="property-line">
        <h4>Senses</h4>
        <p>${value.senses || ""}</p>
          </div>
          
          <!-- property line -->
          <div class="property-line">
        <h4>Languages</h4>
        <p>${value.languages || ""}</p>
          </div>
          <!-- property line -->
          <div class="property-line last">
        <h4>Challenge</h4>
        <p>${value.challenge_rating || ""}</p>
          </div>
          <!-- property line -->
        </div>
        <!-- top stats -->
        <svg height="5" width="100%" class="tapered-rule">
          <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
        <div class="property-block">
          <h4>Traits.</h4>
          <p>${specialAbilitiesString || ""}</i></p>
        </div>        
        <!-- property block -->
          </div>
          <!-- section left -->
          <div class="section-right">
        <div class="actions">
          <h3>Actions</h3>
          <div class="property-block">
        
        <p>${actionsString || ""}<br></p>
          </div>
         
          
           
          <!-- property block -->
        </div>
        <!-- actions -->
        <div class="actions">
          <h3>Legendary Actions</h3>
          <div class="property-block">
        <h4>Legendary Actions </h4>
        <br> <br>
        <p>${value.legendary_desc || ""} </p>
        <br> <br>
        <p>
        ${legendaryActionsString || ""}
        </p>
          </div>
          
        </div>
        <!-- actions -->
        <div class="actions">
          <h3>Loot</h3>
          <div class="property-block">
        <h4>Common (1-10) </h4>
        <p>
        ${value.Common || ""}
        </p>
        </div>
          <div class="property-block">                
        <h4>Rare (11-15)</h4>
        <p>
        ${value.Rare || ""}
        </p>                
          </div>
          <div class="property-block">                           
        <h4>Epic (16-18)</h4>
        <p>
        ${value.Epic || ""}
        </p>               
          </div>
          <div class="property-block">
           <h4>Legendary (19-20)</h4>
        <p>
        ${value.Legendary || ""}
        </p>
          </div>
          
          </div>
          <!-- actions -->
          <div class="actions">
        <h3>Source</h3>
        <div class="property-block">
          <h4>Book and Page </h4>
          <p> <br>
          Book: ${value.document__title || ""} <br>
          Page: ${value.page_no || ""}
          </p>
          </div>
           
          
          <!-- property block -->
        </div>
        <!-- actions -->
          </div>
          <!-- section right -->
          <hr class="orange-border bottom" />
        </div>
        <!-- stat block -->
      </div>
      
      `;
      counter++;

      function abilityScore(value) {
        let sign = value >= 12 ? "+" : "";
        return `(${sign}${Math.ceil(Math.floor(value / 2)) - 5})`;
      }

      "ALINGMENT: " + value.meta + "  NAME" + value.name;
    }
  });
}
