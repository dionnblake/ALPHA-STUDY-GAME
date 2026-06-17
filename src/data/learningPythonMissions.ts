export type LearningWorldId =
  | "world_variables"
  | "world_lists_dicts"
  | "world_control_flow"
  | "world_loops"
  | "world_functions"
  | "world_boss";

export type LearningPythonMissionType =
  | "what_prints"
  | "whats_the_value"
  | "does_it_crash"
  | "boss_gauntlet";

export type LearningPythonMission = {
  id: string;
  world: LearningWorldId;
  missionNumber: number; // 1-15 for normal, 0 for boss
  type: LearningPythonMissionType;
  title: string;
  code: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  characterLine: string;
  isBoss: boolean;
  tags: string[];
};

export type WorldConfigItem = {
  name: string;
  color: string;
  icon: string;
  description: string;
};

export const WORLD_CONFIG: Record<LearningWorldId, WorldConfigItem> = {
  world_variables: {
    name: "Variables & Types",
    color: "#1cd4ff",
    icon: "📦",
    description: "How Python stores data in named boxes"
  },
  world_lists_dicts: {
    name: "Lists & Dicts",
    color: "#ff4db1",
    icon: "📚",
    description: "Collections of data — ordered lists and labeled dicts"
  },
  world_control_flow: {
    name: "Control Flow",
    color: "#ffd338",
    icon: "🔀",
    description: "Making decisions with if/elif/else"
  },
  world_loops: {
    name: "Loops",
    color: "#48f57e",
    icon: "🔄",
    description: "Repeat code without copying it"
  },
  world_functions: {
    name: "Functions",
    color: "#9047ff",
    icon: "⚙️",
    description: "Name a block of code and reuse it anywhere"
  },
  world_boss: {
    name: "BOSS GAUNTLET",
    color: "#ff4444",
    icon: "👑",
    description: "Everything combined — prove you can read Python!"
  }
};

// ============= WORLD 1: VARIABLES & TYPES =============
const world1Missions: LearningPythonMission[] = [
  {
    id: "var-01",
    world: "world_variables",
    missionNumber: 1,
    type: "what_prints",
    title: "Your first variable",
    code: `name = "Maya"
print(name)`,
    question: "What prints?",
    options: ["Maya", "name", '"Maya"', "Error"],
    correctAnswer: "Maya",
    explanation: "`name` holds the string 'Maya'. `print(name)` prints the value inside the variable, not the variable name.",
    characterLine: "NICE! The variable name is just a label — print looks at what's INSIDE the box.",
    isBoss: false,
    tags: ["variables", "print", "beginner"]
  },
  {
    id: "var-02",
    world: "world_variables",
    missionNumber: 2,
    type: "whats_the_value",
    title: "Numbers vs text",
    code: `age = 28
age_as_text = "28"
print(age + 2)`,
    question: "What prints?",
    options: ["30", '"28"', "282", "Error"],
    correctAnswer: "30",
    explanation: "`age` is a number (int). `age + 2 = 30`. No quotes = math. Quotes = text.",
    characterLine: "BOOM! Numbers without quotes do math. With quotes = just text you can't add.",
    isBoss: false,
    tags: ["numbers", "strings", "types", "beginner"]
  },
  {
    id: "var-03",
    world: "world_variables",
    missionNumber: 3,
    type: "what_prints",
    title: "Boolean basics",
    code: `is_active = True
is_admin = False
print(is_admin)`,
    question: "What prints?",
    options: ["False", "True", "is_admin", "Error"],
    correctAnswer: "False",
    explanation: "`is_admin` holds the value `False`. `print(is_admin)` prints the boolean value, not the word 'is_admin'.",
    characterLine: "CORRECT! `True` and `False` are special values — no quotes, they're Python's yes/no.",
    isBoss: false,
    tags: ["booleans", "variables", "beginner"]
  },
  {
    id: "var-04",
    world: "world_variables",
    missionNumber: 4,
    type: "whats_the_value",
    title: "None means nothing",
    code: `result = None
print(result)`,
    question: "What prints?",
    options: ["None", "result", "0", '""'],
    correctAnswer: "None",
    explanation: "`None` is Python's way of saying 'no value'. It's not 0, not empty string — it's the absence of a value.",
    characterLine: "RIGHT! `None` is the empty box — not zero, not empty text, just... nothing.",
    isBoss: false,
    tags: ["None", "variables", "beginner"]
  },
  {
    id: "var-05",
    world: "world_variables",
    missionNumber: 5,
    type: "what_prints",
    title: "f-strings do math",
    code: `score = 75
bonus = 10
total = score + bonus
print(f"Total: {total}")`,
    question: "What prints?",
    options: ["Total: 85", "Total: 7510", "Total: score + bonus", "Error"],
    correctAnswer: "Total: 85",
    explanation: "f-strings insert variable VALUES into the string. `{total}` is replaced with `85`, not the text 'score + bonus'.",
    characterLine: "YES! f-strings are like magic portals — they swap `{variable}` with the actual value inside.",
    isBoss: false,
    tags: ["f-strings", "strings", "beginner"]
  }

  ,{
    id: "var-06",
    world: "world_variables",
    missionNumber: 6,
    type: "what_prints",
    title: "Coin counter update",
    code: `coins = 10
coins = coins + 5
print(coins)`,
    question: "What prints?",
    options: ["15", "10", "coins + 5", "Error"],
    correctAnswer: "15",
    explanation: "`coins = coins + 5` reads the old value 10, adds 5, then stores 15 back into `coins`.",
    characterLine: "POWER-UP! Same variable, brand-new value.",
    isBoss: false,
    tags: ["variables", "assignment", "numbers", "medium"]
  },
  {
    id: "var-07",
    world: "world_variables",
    missionNumber: 7,
    type: "whats_the_value",
    title: "Shield swap",
    code: `shield = 20
old_shield = shield
shield = 50`,
    question: "What is the final value of old_shield?",
    options: ["20", "50", "70", "Error"],
    correctAnswer: "20",
    explanation: "`old_shield = shield` copies the current value, 20. Later changing `shield` to 50 does not change `old_shield`.",
    characterLine: "Nice save! Variables copy values, not secret live links.",
    isBoss: false,
    tags: ["variables", "assignment", "medium"]
  },
  {
    id: "var-08",
    world: "world_variables",
    missionNumber: 8,
    type: "does_it_crash",
    title: "Quoted coins",
    code: `coins = "12"
bonus = 3
print(coins + bonus)`,
    question: "Does this code crash?",
    options: ["Yes, text plus number crashes", "No, it prints 15", "No, it prints 123", "Yes, print cannot show variables"],
    correctAnswer: "Yes, text plus number crashes",
    explanation: "`coins` is a string because it has quotes. Python cannot use `+` to combine a string and an integer.",
    characterLine: "Careful! Quoted numbers are text in disguise.",
    isBoss: false,
    tags: ["strings", "numbers", "types", "does_it_crash", "medium"]
  },
  {
    id: "var-09",
    world: "world_variables",
    missionNumber: 9,
    type: "what_prints",
    title: "Robot mood check",
    code: `battery = 80
is_ready = battery > 50
print(is_ready)`,
    question: "What prints?",
    options: ["True", "False", "battery > 50", "Error"],
    correctAnswer: "True",
    explanation: "`80 > 50` is true, so `is_ready` stores the boolean value `True`.",
    characterLine: "SYSTEM ONLINE! Comparisons create boolean yes/no values.",
    isBoss: false,
    tags: ["booleans", "comparison", "variables", "medium"]
  },
  {
    id: "var-10",
    world: "world_variables",
    missionNumber: 10,
    type: "whats_the_value",
    title: "Quest reward branch",
    code: `level = 4
reward = "small"
if level >= 5:
    reward = "big"`,
    question: "What is the final value of reward?",
    options: ["small", "big", "level", "Error"],
    correctAnswer: "small",
    explanation: "`level >= 5` is false because level is 4, so the indented update does not run. `reward` stays `small`.",
    characterLine: "Good eye! A branch only changes values when its condition is true.",
    isBoss: false,
    tags: ["variables", "booleans", "conditionals", "medium"]
  },
  {
    id: "var-11",
    world: "world_variables",
    missionNumber: 11,
    type: "what_prints",
    title: "Score as text",
    code: `score = 90
score = "90"
print(score + " points")`,
    question: "What prints?",
    options: ["90 points", "90points", "180 points", "Error"],
    correctAnswer: "90 points",
    explanation: "The second assignment replaces number 90 with string `\"90\"`. Adding two strings joins them together.",
    characterLine: "Data type switch detected! Latest assignment wins.",
    isBoss: false,
    tags: ["strings", "assignment", "types", "hard"]
  },
  {
    id: "var-12",
    world: "world_variables",
    missionNumber: 12,
    type: "whats_the_value",
    title: "Lives after damage",
    code: `lives = 3
damage = 1
lives = lives - damage
damage = 5`,
    question: "What is the final value of lives?",
    options: ["2", "-2", "3", "5"],
    correctAnswer: "2",
    explanation: "`lives = lives - damage` happens while `damage` is 1, so lives becomes 2. Changing `damage` later does not redo the math.",
    characterLine: "Locked in! Python runs lines in order, one moment at a time.",
    isBoss: false,
    tags: ["variables", "assignment", "order", "hard"]
  },
  {
    id: "var-13",
    world: "world_variables",
    missionNumber: 13,
    type: "does_it_crash",
    title: "Missing robot name",
    code: `robot = "Bolt"
print(roboot)`,
    question: "Does this code crash?",
    options: ["Yes, roboot was never created", "No, it prints Bolt", "No, it prints robot", "Yes, strings cannot be printed"],
    correctAnswer: "Yes, roboot was never created",
    explanation: "`robot` and `roboot` are different names. Python needs the exact variable name that was assigned.",
    characterLine: "Typo trap! Variable names must match exactly.",
    isBoss: false,
    tags: ["variables", "names", "does_it_crash", "hard"]
  },
  {
    id: "var-14",
    world: "world_variables",
    missionNumber: 14,
    type: "what_prints",
    title: "Potion math inside an f-string",
    code: `potions = 2
coins = 5
print(f"Buy {potions + 1} for {coins * 2}")`,
    question: "What prints?",
    options: ["Buy 3 for 10", "Buy potions + 1 for coins * 2", "Buy 21 for 52", "Error"],
    correctAnswer: "Buy 3 for 10",
    explanation: "Inside an f-string, expressions in `{}` are evaluated. `potions + 1` is 3 and `coins * 2` is 10.",
    characterLine: "Combo move! f-strings can calculate before they print.",
    isBoss: false,
    tags: ["f-strings", "numbers", "expressions", "hard"]
  },
  {
    id: "var-15",
    world: "world_variables",
    missionNumber: 15,
    type: "whats_the_value",
    title: "Which update survives?",
    code: `rank = "rookie"
points = 120
if points > 100:
    rank = "pro"
rank = rank + " pilot"`,
    question: "What is the final value of rank?",
    options: ["pro pilot", "rookie pilot", "pro", "Error"],
    correctAnswer: "pro pilot",
    explanation: "The condition is true, so `rank` becomes `pro`. Then the last line adds ` pilot`, making `pro pilot`.",
    characterLine: "Elite read! Follow every update to find the final value.",
    isBoss: false,
    tags: ["variables", "strings", "conditionals", "hard"]
  }

];

// ============= WORLD 2: LISTS & DICTS =============
const world2Missions: LearningPythonMission[] = [
  {
    id: "list-01",
    world: "world_lists_dicts",
    missionNumber: 1,
    type: "whats_the_value",
    title: "What's in a list?",
    code: `team = ["Alice", "Bob", "Carmen"]
print(team[1])`,
    question: "What prints?",
    options: ["Bob", "Alice", "Carmen", '["Alice", "Bob", "Carmen"]'],
    correctAnswer: "Bob",
    explanation: "Lists are 0-indexed. `team[0]` is 'Alice', `team[1]` is 'Bob'. Index 1 = second item.",
    characterLine: "BOOM! `[1]` means the SECOND item — Python starts counting at 0, not 1!",
    isBoss: false,
    tags: ["lists", "indexing", "beginner"]
  },
  {
    id: "list-02",
    world: "world_lists_dicts",
    missionNumber: 2,
    type: "whats_the_value",
    title: "Dict by key name",
    code: `contact = {
    "name": "Jordan",
    "email": "jordan@co.com",
    "score": 82
}
print(contact["email"])`,
    question: "What prints?",
    options: ["jordan@co.com", "Jordan", "82", "email"],
    correctAnswer: "jordan@co.com",
    explanation: "Dictionaries store values by named keys, not by position. `contact[\"email\"]` pulls the value for the 'email' key.",
    characterLine: "NAILED IT! Dicts use NAMES as labels — way easier than remembering position numbers!",
    isBoss: false,
    tags: ["dict", "keys", "beginner"]
  },
  {
    id: "list-03",
    world: "world_lists_dicts",
    missionNumber: 3,
    type: "what_prints",
    title: "Nested access",
    code: `config = {
    "database": {
        "host": "localhost",
        "port": 5432
    }
}
print(config["database"]["port"])`,
    question: "What prints?",
    options: ["5432", "localhost", "port", "Error"],
    correctAnswer: "5432",
    explanation: "Chain brackets to go deeper: first `[\"database\"]` gets the inner dict, then `[\"port\"]` gets the number.",
    characterLine: "WOO! Nested dicts are like Russian dolls — open one, find another inside!",
    isBoss: false,
    tags: ["dict", "nested", "beginner"]
  },
  {
    id: "list-04",
    world: "world_lists_dicts",
    missionNumber: 4,
    type: "what_prints",
    title: "Appending to a list",
    code: `items = ["a", "b"]
items.append("c")
print(len(items))`,
    question: "What prints?",
    options: ["3", "2", "c", '["a", "b", "c"]'],
    correctAnswer: "3",
    explanation: "`.append(\"c\")` adds one item to the end. The list now has 3 items. `len()` counts them.",
    characterLine: "SWEET! `.append()` grows the list by one. `len()` counts everything inside.",
    isBoss: false,
    tags: ["list", "append", "len", "beginner"]
  },
  {
    id: "list-05",
    world: "world_lists_dicts",
    missionNumber: 5,
    type: "whats_the_value",
    title: "Dict update in place",
    code: `user = {"name": "Blake", "plan": "free"}
user["plan"] = "pro"
print(user["plan"])`,
    question: "What prints?",
    options: ["pro", "free", "plan", '{"name": "Blake", "plan": "free"}'],
    correctAnswer: "pro",
    explanation: "Assigning to an existing key REPLACES the old value. `user[\"plan\"]` was 'free', now it's 'pro'.",
    characterLine: "YES! Dicts are editable — update a key and the old value is gone forever!",
    isBoss: false,
    tags: ["dict", "update", "mutation"]
  }

  ,{
    id: "list-06",
    world: "world_lists_dicts",
    missionNumber: 6,
    type: "what_prints",
    title: "First backpack slot",
    code: `inventory = ["key", "map", "snack"]
print(inventory[0])`,
    question: "What prints?",
    options: ["key", "map", "snack", "Error"],
    correctAnswer: "key",
    explanation: "Lists start counting at 0. Index 0 means the first item, which is `key`.",
    characterLine: "Zero-index win! Slot 0 is the first slot.",
    isBoss: false,
    tags: ["lists", "indexing", "medium"]
  },
  {
    id: "list-07",
    world: "world_lists_dicts",
    missionNumber: 7,
    type: "whats_the_value",
    title: "Quest list grows",
    code: `quests = ["train", "battle"]
quests.append("rescue")`,
    question: "What is the final length of quests?",
    options: ["3", "2", "1", "Error"],
    correctAnswer: "3",
    explanation: "The list starts with 2 items. `.append(\"rescue\")` adds one more, so final length is 3.",
    characterLine: "Quest added! Append tacks one item onto the end.",
    isBoss: false,
    tags: ["lists", "append", "len", "medium"]
  },
  {
    id: "list-08",
    world: "world_lists_dicts",
    missionNumber: 8,
    type: "what_prints",
    title: "Change a robot part",
    code: `parts = ["wheel", "arm", "sensor"]
parts[1] = "laser"
print(parts[1])`,
    question: "What prints?",
    options: ["laser", "arm", "wheel", "Error"],
    correctAnswer: "laser",
    explanation: "`parts[1]` is the second item. The assignment replaces `arm` with `laser`.",
    characterLine: "Upgrade installed! List slots can be changed.",
    isBoss: false,
    tags: ["lists", "indexing", "mutation", "medium"]
  },
  {
    id: "list-09",
    world: "world_lists_dicts",
    missionNumber: 9,
    type: "what_prints",
    title: "Hero stats key",
    code: `hero = {"name": "Nova", "lives": 3}
hero["lives"] = hero["lives"] + 1
print(hero["lives"])`,
    question: "What prints?",
    options: ["4", "3", "lives", "Error"],
    correctAnswer: "4",
    explanation: "The dict value for `lives` starts at 3. The update stores 3 + 1, so it becomes 4.",
    characterLine: "Extra life acquired! Dict keys can update their stored values.",
    isBoss: false,
    tags: ["dicts", "update", "numbers", "medium"]
  },
  {
    id: "list-10",
    world: "world_lists_dicts",
    missionNumber: 10,
    type: "does_it_crash",
    title: "Missing treasure key",
    code: `chest = {"coins": 25, "gem": "ruby"}
print(chest["map"])`,
    question: "Does this code crash?",
    options: ["Yes, the dict has no map key", "No, it prints map", "No, it prints None", "No, it prints ruby"],
    correctAnswer: "Yes, the dict has no map key",
    explanation: "Using brackets with a missing dictionary key causes a KeyError. This dict has `coins` and `gem`, but not `map`.",
    characterLine: "KeyError ambush! A dict only opens keys it actually has.",
    isBoss: false,
    tags: ["dicts", "keys", "does_it_crash", "medium"]
  },
  {
    id: "list-11",
    world: "world_lists_dicts",
    missionNumber: 11,
    type: "what_prints",
    title: "Last safe index",
    code: `robots = ["Zip", "Clank", "Byte"]
print(robots[2])`,
    question: "What prints?",
    options: ["Byte", "Clank", "Zip", "Error"],
    correctAnswer: "Byte",
    explanation: "A 3-item list has indexes 0, 1, and 2. Index 2 is the third item, `Byte`.",
    characterLine: "Index master! The last index is one less than the length.",
    isBoss: false,
    tags: ["lists", "indexing", "hard"]
  },
  {
    id: "list-12",
    world: "world_lists_dicts",
    missionNumber: 12,
    type: "does_it_crash",
    title: "Too far in the list",
    code: `shields = [10, 20, 30]
print(shields[3])`,
    question: "Does this code crash?",
    options: ["Yes, index 3 is past the end", "No, it prints 30", "No, it prints 20", "No, it prints None"],
    correctAnswer: "Yes, index 3 is past the end",
    explanation: "The list has 3 items, so valid indexes are 0, 1, and 2. Index 3 is out of range.",
    characterLine: "Boundary trap! Length 3 does not mean index 3.",
    isBoss: false,
    tags: ["lists", "indexing", "does_it_crash", "hard"]
  },
  {
    id: "list-13",
    world: "world_lists_dicts",
    missionNumber: 13,
    type: "what_prints",
    title: "Nested inventory count",
    code: `player = {
    "name": "Kai",
    "items": ["rope", "torch", "coin"]
}
print(player["items"][1])`,
    question: "What prints?",
    options: ["torch", "rope", "coin", "Error"],
    correctAnswer: "torch",
    explanation: "`player[\"items\"]` gets the list. Then `[1]` gets the second item in that list, `torch`.",
    characterLine: "Deep scan complete! Dict key first, list index second.",
    isBoss: false,
    tags: ["dicts", "lists", "nested", "hard"]
  },
  {
    id: "list-14",
    world: "world_lists_dicts",
    missionNumber: 14,
    type: "whats_the_value",
    title: "Loop over loot",
    code: `loot = ["coin", "gem", "key"]
count = 0
for item in loot:
    count = count + 1`,
    question: "How many times does the loop run?",
    options: ["3", "2", "1", "0"],
    correctAnswer: "3",
    explanation: "A `for` loop over a list runs once for each item. `loot` has 3 items, so the loop runs 3 times.",
    characterLine: "Loop counter locked! One list item means one loop turn.",
    isBoss: false,
    tags: ["lists", "loops", "counting", "hard"]
  },
  {
    id: "list-15",
    world: "world_lists_dicts",
    missionNumber: 15,
    type: "what_prints",
    title: "Dict choice branch",
    code: `bot = {"name": "Echo", "energy": 40}
if bot["energy"] < 50:
    bot["mode"] = "charge"
else:
    bot["mode"] = "explore"
print(bot["mode"])`,
    question: "Which mode prints?",
    options: ["charge", "explore", "energy", "Error"],
    correctAnswer: "charge",
    explanation: "`bot[\"energy\"]` is 40, and 40 < 50 is true. The if branch adds `mode` with value `charge`.",
    characterLine: "Smart routing! Dict values can decide which branch runs.",
    isBoss: false,
    tags: ["dicts", "conditionals", "update", "hard"]
  }

];

// ============= WORLD 3: CONTROL FLOW =============
const world3Missions: LearningPythonMission[] = [
  {
    id: "flow-01",
    world: "world_control_flow",
    missionNumber: 1,
    type: "what_prints",
    title: "Which branch runs?",
    code: `score = 74
if score >= 90:
    label = "elite"
elif score >= 70:
    label = "ready"
else:
    label = "needs practice"
print(label)`,
    question: "What prints?",
    options: ["ready", "elite", "needs practice", "74"],
    correctAnswer: "ready",
    explanation: "`score >= 90` is false (74 < 90). Then `score >= 70` is true. Python stops at the first matching branch.",
    characterLine: "NICE! Python checks each condition in order and stops at the first one that's TRUE.",
    isBoss: false,
    tags: ["if", "elif", "branch"]
  },
  {
    id: "flow-02",
    world: "world_control_flow",
    missionNumber: 2,
    type: "whats_the_value",
    title: "Check two things",
    code: `is_paid = True
has_discount = False
can_access = is_paid and has_discount
print(can_access)`,
    question: "What prints?",
    options: ["False", "True", "Error", "has_discount"],
    correctAnswer: "False",
    explanation: "`and` requires BOTH to be True. `is_paid` is True but `has_discount` is False. True AND False = False.",
    characterLine: "WHOOPS! `and` is greedy — BOTH sides must be true for the whole thing to be true!",
    isBoss: false,
    tags: ["boolean", "and", "logic"]
  },
  {
    id: "flow-04",
    world: "world_control_flow",
    missionNumber: 3,
    type: "what_prints",
    title: "The or operator",
    code: `is_member = False
is_vip = False
can_enter = is_member or is_vip
print(can_enter)`,
    question: "What prints?",
    options: ["False", "True", "Error", "is_vip"],
    correctAnswer: "False",
    explanation: "`or` needs at least one True. Both are False, so `can_enter` is False.",
    characterLine: "CORRECT! `or` needs ONE true side. Both were false, so the whole thing is false.",
    isBoss: false,
    tags: ["boolean", "or", "logic"]
  },
  {
    id: "flow-05",
    world: "world_control_flow",
    missionNumber: 4,
    type: "whats_the_value",
    title: "Not flips it",
    code: `is_locked = True
can_open = not is_locked
print(can_open)`,
    question: "What prints?",
    options: ["False", "True", "is_locked", "Error"],
    correctAnswer: "False",
    explanation: "`not` flips a boolean. `True` becomes `False`. If the door IS locked, you CANNOT open it.",
    characterLine: "BOOM! `not` is the flip switch — True becomes False, False becomes True!",
    isBoss: false,
    tags: ["boolean", "not", "logic"]
  },
  {
    id: "flow-06",
    world: "world_control_flow",
    missionNumber: 5,
    type: "whats_the_value",
    title: "Order matters",
    code: `x = 15
if x > 20:
    result = "big"
elif x > 10:
    result = "medium"
else:
    result = "small"
print(result)`,
    question: "What prints?",
    options: ["medium", "big", "small", "Error"],
    correctAnswer: "medium",
    explanation: "`x > 20` is false (15 <= 20). `x > 10` is true (15 > 10). Python takes the first true branch — 'medium'.",
    characterLine: "NAILED IT! Python checks top to bottom and grabs the FIRST condition that's true.",
    isBoss: false,
    tags: ["if", "elif", "order"]
  }

  ,{
    id: "flow-07", world: "world_control_flow", missionNumber: 6, type: "what_prints", title: "Shield gate", code: `shields = 2
if shields > 3:
    status = "safe"
else:
    status = "danger"
print(status)`, question: "What prints?", options: ["danger", "safe", "2", "Error"], correctAnswer: "danger", explanation: "`shields > 3` is false because 2 is not greater than 3, so the `else` branch runs.", characterLine: "Good dodge! Failed check means backup path.", isBoss: false, tags: ["if", "else", "comparison", "medium"]
  },
  { id: "flow-08", world: "world_control_flow", missionNumber: 7, type: "whats_the_value", title: "Coin bonus check", code: `coins = 12
has_key = False
bonus = coins >= 10 and has_key
print(bonus)`, question: "What prints?", options: ["False", "True", "12", "Error"], correctAnswer: "False", explanation: "`and` needs both sides true. `coins >= 10` is true, but `has_key` is false.", characterLine: "Locked chest! Enough coins is not enough without the key.", isBoss: false, tags: ["boolean", "and", "comparison", "medium"] },
  { id: "flow-09", world: "world_control_flow", missionNumber: 8, type: "what_prints", title: "Robot mode order", code: `battery = 80
if battery > 50:
    mode = "patrol"
elif battery > 20:
    mode = "charge soon"
else:
    mode = "sleep"
print(mode)`, question: "Which branch runs?", options: ["patrol", "charge soon", "sleep", "Error"], correctAnswer: "patrol", explanation: "`battery > 50` is true, so Python uses that first branch and skips the rest.", characterLine: "Top branch wins! First true condition stops the search.", isBoss: false, tags: ["if", "elif", "order", "medium"] },
  { id: "flow-10", world: "world_control_flow", missionNumber: 9, type: "whats_the_value", title: "Quest access", code: `level = 4
has_map = True
can_start = level >= 5 or has_map
print(can_start)`, question: "What prints?", options: ["True", "False", "level", "Error"], correctAnswer: "True", explanation: "`or` needs at least one true side. `level >= 5` is false, but `has_map` is true.", characterLine: "Map acquired! One true condition opens the gate.", isBoss: false, tags: ["boolean", "or", "comparison", "medium"] },
  { id: "flow-11", world: "world_control_flow", missionNumber: 10, type: "what_prints", title: "Inventory warning", code: `arrows = 0
if not arrows:
    message = "refill"
else:
    message = "ready"
print(message)`, question: "What prints?", options: ["refill", "ready", "0", "Error"], correctAnswer: "refill", explanation: "`0` is falsey in Python. `not arrows` becomes true, so the refill branch runs.", characterLine: "Empty quiver detected! `not 0` is a warning siren.", isBoss: false, tags: ["boolean", "not", "truthy-falsey", "medium"] },
  { id: "flow-12", world: "world_control_flow", missionNumber: 11, type: "what_prints", title: "Elite rank trap", code: `score = 95
if score >= 70:
    rank = "silver"
elif score >= 90:
    rank = "gold"
else:
    rank = "bronze"
print(rank)`, question: "What prints?", options: ["silver", "gold", "bronze", "Error"], correctAnswer: "silver", explanation: "`score >= 70` is checked first and is true. Python stops there, so gold never gets checked.", characterLine: "Sneaky order trap! Broad condition grabbed the score first.", isBoss: false, tags: ["if", "elif", "order", "hard"] },
  { id: "flow-13", world: "world_control_flow", missionNumber: 12, type: "whats_the_value", title: "Lives and shield combo", code: `lives = 1
shield = 0
safe = lives > 0 and not shield == 0
print(safe)`, question: "What prints?", options: ["False", "True", "0", "Error"], correctAnswer: "False", explanation: "`lives > 0` is true. `shield == 0` is true, so `not shield == 0` becomes false. True and false gives False.", characterLine: "Careful! `not` flips the shield check before `and` decides.", isBoss: false, tags: ["boolean", "not", "and", "hard"] },
  { id: "flow-14", world: "world_control_flow", missionNumber: 13, type: "does_it_crash", title: "Missing path", code: `coins = 3
if coins > 5:
    prize = "dragon"
print(prize)`, question: "What happens?", options: ["Error", "dragon", "None", "3"], correctAnswer: "Error", explanation: "`coins > 5` is false, so `prize` is never created. `print(prize)` crashes with a NameError.", characterLine: "Glitch alert! If no branch creates the variable, Python cannot print it later.", isBoss: false, tags: ["if", "NameError", "branch", "hard"] },
  { id: "flow-15", world: "world_control_flow", missionNumber: 14, type: "what_prints", title: "Nested robot check", code: `battery = 15
has_tool = True
if battery > 20:
    result = "move"
elif has_tool:
    result = "repair"
else:
    result = "wait"
print(result)`, question: "Which branch runs?", options: ["repair", "move", "wait", "Error"], correctAnswer: "repair", explanation: "`battery > 20` is false, then `elif has_tool` is true, so result becomes `repair`.", characterLine: "Repair bot online! Tool branch saved the mission.", isBoss: false, tags: ["if", "elif", "boolean", "hard"] },
  { id: "flow-16", world: "world_control_flow", missionNumber: 15, type: "whats_the_value", title: "Potion priority", code: `hp = 10
potion = "small"
if hp <= 10 and potion == "big":
    heal = 50
elif hp <= 10:
    heal = 20
else:
    heal = 0
print(heal)`, question: "What final value prints?", options: ["20", "50", "0", "Error"], correctAnswer: "20", explanation: "The first condition fails because potion is not `big`. The `elif hp <= 10` condition is true, so `heal` becomes 20.", characterLine: "Potion logic mastered! Both parts of an `and` must work.", isBoss: false, tags: ["if", "elif", "and", "hard"] }

];

// ============= WORLD 4: LOOPS =============
const world4Missions: LearningPythonMission[] = [
  {
    id: "loop-01",
    world: "world_loops",
    missionNumber: 1,
    type: "what_prints",
    title: "Loop once per item",
    code: `tasks = ["call", "email", "invoice"]
count = 0
for t in tasks:
    count = count + 1
print(count)`,
    question: "What prints?",
    options: ["3", "2", "1", "0"],
    correctAnswer: "3",
    explanation: "The loop runs 3 times (once per list item). Each time `count` goes up by 1. Final count = 3.",
    characterLine: "YES! The loop marches through every item in the list. 3 items = 3 iterations!",
    isBoss: false,
    tags: ["for-loop", "counter", "list"]
  },
  {
    id: "loop-02",
    world: "world_loops",
    missionNumber: 2,
    type: "what_prints",
    title: "Filter inside a loop",
    code: `numbers = [10, 15, 20, 25]
result = 0
for n in numbers:
    if n > 18:
        result = result + n
print(result)`,
    question: "What prints?",
    options: ["45", "70", "18", "25"],
    correctAnswer: "45",
    explanation: "Only numbers > 18 are added: 20 + 25 = 45. 10 and 15 are skipped by the if condition.",
    characterLine: "RAD! The `if` inside the loop acts like a bouncer — only lets certain values through!",
    isBoss: false,
    tags: ["for-loop", "filter", "accumulate"]
  },
  {
    id: "loop-03",
    world: "world_loops",
    missionNumber: 3,
    type: "what_prints",
    title: "While loop countdown",
    code: `count = 3
while count > 0:
    count = count - 1
print(count)`,
    question: "What prints?",
    options: ["0", "3", "1", "Error"],
    correctAnswer: "0",
    explanation: "count goes: 3 → 2 → 1 → 0. When count = 0, `0 > 0` is false, loop stops. Final value is 0.",
    characterLine: "WOO! The while loop runs as long as the condition is true. Once count hits 0, it stops!",
    isBoss: false,
    tags: ["while-loop", "condition"]
  },
  {
    id: "loop-04",
    world: "world_loops",
    missionNumber: 4,
    type: "what_prints",
    title: "Building a string in a loop",
    code: `letters = ["a", "b", "c"]
result = ""
for L in letters:
    result = result + L
print(result)`,
    question: "What prints?",
    options: ["abc", '["a", "b", "c"]', "a b c", "Error"],
    correctAnswer: "abc",
    explanation: "Each iteration appends one letter to `result`. `\"\" + \"a\" = \"a\"`, then `\"a\" + \"b\" = \"ab\"`, then `\"ab\" + \"c\" = \"abc\"`.",
    characterLine: "NICE! String building is like LEGO — each loop adds another block onto the end!",
    isBoss: false,
    tags: ["for-loop", "string", "concatenation"]
  },
  {
    id: "loop-05",
    world: "world_loops",
    missionNumber: 5,
    type: "does_it_crash",
    title: "Infinite loop trap",
    code: `x = 5
while x > 0:
    print(x)
    # x = x - 1
print("done")`,
    question: "What happens?",
    options: ["Runs forever (x never changes)", "Prints 5 then done", "Prints done immediately", "Error"],
    correctAnswer: "Runs forever (x never changes)",
    explanation: "`x = x - 1` is commented out. `x` stays 5 forever. `5 > 0` is always true. The loop never stops.",
    characterLine: "WHOOPS! Commenting out the update = infinite loop. The condition NEVER becomes false!",
    isBoss: false,
    tags: ["while-loop", "infinite", "bug"]
  }

  ,{
    id: "loop-06", world: "world_loops", missionNumber: 6, type: "what_prints", title: "Coin sweep", code: `coins = [1, 1, 5]
total = 0
for coin in coins:
    total = total + coin
print(total)`, question: "What prints?", options: ["7", "3", "5", "Error"], correctAnswer: "7", explanation: "The loop adds every coin: 1 + 1 + 5 = 7.", characterLine: "Loot counted! Accumulators keep running totals.", isBoss: false, tags: ["for-loop", "accumulator", "list", "medium"]
  },
  { id: "loop-07", world: "world_loops", missionNumber: 7, type: "whats_the_value", title: "Range patrol", code: `steps = 0
for n in range(4):
    steps = steps + 1
print(steps)`, question: "How many times does the loop run?", options: ["4", "3", "5", "0"], correctAnswer: "4", explanation: "`range(4)` gives 0, 1, 2, 3. That is 4 values.", characterLine: "Patrol complete! `range(4)` gives four turns.", isBoss: false, tags: ["for-loop", "range", "counting", "medium"] },
  { id: "loop-08", world: "world_loops", missionNumber: 8, type: "what_prints", title: "Skip broken robot", code: `robots = ["red", "broken", "blue"]
fixed = 0
for robot in robots:
    if robot == "broken":
        continue
    fixed = fixed + 1
print(fixed)`, question: "What prints?", options: ["2", "3", "1", "Error"], correctAnswer: "2", explanation: "`continue` skips the broken robot, so only red and blue are counted.", characterLine: "Skip move unlocked! `continue` jumps to the next robot.", isBoss: false, tags: ["for-loop", "continue", "counter", "medium"] },
  { id: "loop-09", world: "world_loops", missionNumber: 9, type: "what_prints", title: "Break at the trap", code: `rooms = ["hall", "shop", "trap", "boss"]
count = 0
for room in rooms:
    if room == "trap":
        break
    count = count + 1
print(count)`, question: "What prints?", options: ["2", "3", "4", "1"], correctAnswer: "2", explanation: "The loop counts hall and shop. At trap, `break` stops before counting trap.", characterLine: "Trap spotted! `break` ends the whole loop.", isBoss: false, tags: ["for-loop", "break", "counter", "medium"] },
  { id: "loop-10", world: "world_loops", missionNumber: 10, type: "whats_the_value", title: "While shield drain", code: `shield = 6
hits = 0
while shield > 0:
    shield = shield - 2
    hits = hits + 1
print(hits)`, question: "How many loop runs happen?", options: ["3", "2", "4", "6"], correctAnswer: "3", explanation: "Shield goes 6 to 4 to 2 to 0. That takes 3 loop runs.", characterLine: "Shield cracked! Track the update each turn.", isBoss: false, tags: ["while-loop", "update", "counter", "medium"] },
  { id: "loop-11", world: "world_loops", missionNumber: 11, type: "what_prints", title: "Range start stop", code: `total = 0
for n in range(2, 6):
    total = total + n
print(total)`, question: "What prints?", options: ["14", "20", "12", "Error"], correctAnswer: "14", explanation: "`range(2, 6)` includes 2, 3, 4, 5 but stops before 6. Sum is 14.", characterLine: "Range trap cleared! Stop number is not included.", isBoss: false, tags: ["for-loop", "range", "accumulator", "hard"] },
  { id: "loop-12", world: "world_loops", missionNumber: 12, type: "what_prints", title: "Continue before score", code: `score = 0
for n in range(5):
    if n == 2:
        continue
    score = score + n
print(score)`, question: "What final value prints?", options: ["8", "10", "7", "2"], correctAnswer: "8", explanation: "`range(5)` gives 0,1,2,3,4. `continue` skips adding 2, so total is 8.", characterLine: "Sneaky skip! The number 2 was never added.", isBoss: false, tags: ["for-loop", "continue", "range", "hard"] },
  { id: "loop-13", world: "world_loops", missionNumber: 13, type: "does_it_crash", title: "Changing the wrong value", code: `lives = 3
damage = 1
while lives > 0:
    damage = damage + 1
print("done")`, question: "What happens?", options: ["Runs forever", "Prints done", "Error", "Prints 3"], correctAnswer: "Runs forever", explanation: "`lives` controls the while loop, but only `damage` changes. `lives` stays 3 forever.", characterLine: "Infinite loop warning! Update the variable used in the condition.", isBoss: false, tags: ["while-loop", "infinite", "update", "hard"] },
  { id: "loop-14", world: "world_loops", missionNumber: 14, type: "what_prints", title: "Break before treasure", code: `items = ["coin", "gem", "key", "crown"]
bag = []
for item in items:
    if item == "key":
        break
    bag.append(item)
print(len(bag))`, question: "What prints?", options: ["2", "3", "4", "1"], correctAnswer: "2", explanation: "The loop appends coin and gem. When it sees key, `break` stops before key is appended.", characterLine: "Bag check! `break` fired before the key packed.", isBoss: false, tags: ["for-loop", "break", "list", "hard"] },
  { id: "loop-15", world: "world_loops", missionNumber: 15, type: "whats_the_value", title: "While with double update", code: `energy = 1
turns = 0
while energy < 10:
    energy = energy * 2
    turns = turns + 1
print(energy)`, question: "What final value prints?", options: ["16", "8", "10", "4"], correctAnswer: "16", explanation: "Energy changes 1 to 2 to 4 to 8 to 16. Then `energy < 10` is false.", characterLine: "Power surge! Loops can jump past the target.", isBoss: false, tags: ["while-loop", "update", "condition", "hard"] }

];

// ============= WORLD 5: FUNCTIONS =============
const world5Missions: LearningPythonMission[] = [
  {
    id: "func-01",
    world: "world_functions",
    missionNumber: 1,
    type: "what_prints",
    title: "def does NOT run",
    code: `def greet():
    print("Hello!")

print("Start")`,
    question: "What prints?",
    options: ["Start", "Hello!", "Start then Hello!", "Nothing"],
    correctAnswer: "Start",
    explanation: "`def greet():` only STORES the function — it doesn't run it. Only `print(\"Start\")` executes.",
    characterLine: "YEP! `def` is like writing a recipe — you don't cook it until you CALL it by name!",
    isBoss: false,
    tags: ["functions", "def", "execution"]
  },
  {
    id: "func-02",
    world: "world_functions",
    missionNumber: 2,
    type: "what_prints",
    title: "Calling a function",
    code: `def say_status():
    print("Processing...")
    print("Done.")

say_status()
print("All finished.")`,
    question: "What prints in order?",
    options: ["Processing... / Done. / All finished.", "All finished. / Processing... / Done.", "Processing... / All finished. / Done.", "Nothing"],
    correctAnswer: "Processing... / Done. / All finished.",
    explanation: "Python jumps INTO `say_status()`, runs both prints, then returns to the next line after the call.",
    characterLine: "BOOM! Python jumps into the function, runs everything inside, then comes back like nothing happened!",
    isBoss: false,
    tags: ["functions", "call", "order"]
  },
  {
    id: "func-03",
    world: "world_functions",
    missionNumber: 3,
    type: "what_prints",
    title: "Parameters = inputs",
    code: `def double(n):
    return n * 2

result = double(5)
print(result)`,
    question: "What prints?",
    options: ["10", "5", "double(5)", "Error"],
    correctAnswer: "10",
    explanation: "`double(5)` passes 5 into the function as `n`. `n * 2 = 10`. `return` sends 10 back to be stored in `result`.",
    characterLine: "SWEET! Parameters are the function's inbox. Drop a value in, get a result back via `return`!",
    isBoss: false,
    tags: ["functions", "parameters", "return"]
  },
  {
    id: "func-04",
    world: "world_functions",
    missionNumber: 4,
    type: "what_prints",
    title: "Return vs print",
    code: `def add(a, b):
    return a + b

output = add(3, 4)
print(output + 1)`,
    question: "What prints?",
    options: ["8", "7", "add(3, 4) + 1", "Error"],
    correctAnswer: "8",
    explanation: "`add(3, 4)` returns 7 (stored in `output`). Then `print(output + 1)` prints 7 + 1 = 8.",
    characterLine: "NICE! `return` hands a value BACK so you can use it. `print` just shows it — you can't use printed stuff!",
    isBoss: false,
    tags: ["functions", "return", "print"]
  },
  {
    id: "func-05",
    world: "world_functions",
    missionNumber: 5,
    type: "what_prints",
    title: "Default parameter",
    code: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Maya")
greet("Alex", "Hey")`,
    question: "What are the two printed lines?",
    options: ["Hello, Maya! / Hey, Alex!", "Hello, Maya! / Hello, Alex!", "Hey, Maya! / Hey, Alex!", "Error"],
    correctAnswer: "Hello, Maya! / Hey, Alex!",
    explanation: "First call uses the default `\"Hello\"`. Second call passes `\"Hey\"` which overrides the default. Both include the name.",
    characterLine: "YES! Defaults are fallbacks — provide a value to override, skip it to use the default!",
    isBoss: false,
    tags: ["functions", "defaults", "parameters"]
  }

  ,{
    id: "func-06", world: "world_functions", missionNumber: 6, type: "what_prints", title: "Print inside, return outside", code: `def charge(shield):
    print("Charging shield")
    return shield + 3

power = charge(5)
print(power)`, question: "What prints in order?", options: ["Charging shield / 8", "8 / Charging shield", "Charging shield / 5", "Error"], correctAnswer: "Charging shield / 8", explanation: "The function prints first, then returns 5 + 3 = 8. `print(power)` prints the returned value.", characterLine: "ZAP! `print` shows now, `return` sends back for later.", isBoss: false, tags: ["functions", "print", "return", "order"]
  },
  { id: "func-07", world: "world_functions", missionNumber: 7, type: "whats_the_value", title: "Parameter order matters", code: `def make_score(coins, bonus):
    return coins * 10 + bonus

score = make_score(4, 7)
print(score)`, question: "What is the final value of score?", options: ["47", "74", "40", "17"], correctAnswer: "47", explanation: "`coins` gets 4 and `bonus` gets 7. The function returns 4 * 10 + 7.", characterLine: "Nice aim! Arguments land left to right.", isBoss: false, tags: ["functions", "parameters", "order", "math"] },
  { id: "func-08", world: "world_functions", missionNumber: 8, type: "what_prints", title: "Local variables stay local", code: `coins = 10

def add_coins():
    coins = 99
    print(coins)

add_coins()
print(coins)`, question: "What prints in order?", options: ["99 / 10", "99 / 99", "10 / 99", "Error"], correctAnswer: "99 / 10", explanation: "The `coins = 99` inside the function is local. The outside `coins` stays 10.", characterLine: "Secret room unlocked! Function variables stay inside.", isBoss: false, tags: ["functions", "local-variable", "scope"] },
  { id: "func-09", world: "world_functions", missionNumber: 9, type: "what_prints", title: "Early return escape", code: `def quest_status(keys):
    if keys < 1:
        return "locked"
    return "open"

print(quest_status(0))`, question: "Which branch runs?", options: ["The keys < 1 branch returns locked", "The final return gives open", "Both returns run", "Error"], correctAnswer: "The keys < 1 branch returns locked", explanation: "`keys` is 0, so `keys < 1` is true. The function returns immediately and skips the later return.", characterLine: "FAST EXIT! Once `return` runs, function is done.", isBoss: false, tags: ["functions", "return", "if", "branch"] },
  { id: "func-10", world: "world_functions", missionNumber: 10, type: "what_prints", title: "Default robot mode", code: `def robot(name, mode="guard"):
    print(name + ":" + mode)

robot("Bolt")
robot("Zip", "scan")`, question: "What prints in order?", options: ["Bolt:guard / Zip:scan", "Bolt:scan / Zip:guard", "Bolt:guard / Zip:guard", "Error"], correctAnswer: "Bolt:guard / Zip:scan", explanation: "First call uses default `guard`. Second call passes `scan`, overriding the default.", characterLine: "Default settings engaged! Skip an argument to use backup value.", isBoss: false, tags: ["functions", "defaults", "parameters"] },
  { id: "func-11", world: "world_functions", missionNumber: 11, type: "whats_the_value", title: "Function call in a loop", code: `def add_bonus(score):
    return score + 2

total = 0
for base in [3, 5, 1]:
    total = total + add_bonus(base)
print(total)`, question: "What is the final value of total?", options: ["15", "9", "11", "6"], correctAnswer: "15", explanation: "The calls return 5, 7, and 3. Total is 15.", characterLine: "Combo loop! Each item goes through the function.", isBoss: false, tags: ["functions", "loops", "return", "accumulator"] },
  { id: "func-12", world: "world_functions", missionNumber: 12, type: "whats_the_value", title: "Which line changes score?", code: `def power_up(score):
    score = score + 5
    return score

score = 10
new_score = power_up(score)
print(score)`, question: "What prints?", options: ["10", "15", "new_score", "Error"], correctAnswer: "10", explanation: "Inside the function, `score = score + 5` changes a local parameter. Outside `score` stays 10.", characterLine: "Scope shield activated! Same name, different room.", isBoss: false, tags: ["functions", "scope", "parameters", "variables"] },
  { id: "func-13", world: "world_functions", missionNumber: 13, type: "does_it_crash", title: "Print is not return", code: `def show_lives(lives):
    print(lives)

result = show_lives(3)
total = result + 1
print(total)`, question: "What happens?", options: ["It prints 3, then crashes", "It prints 4", "It prints 3 / 4", "It prints None"], correctAnswer: "It prints 3, then crashes", explanation: "`show_lives(3)` prints 3 but returns `None`. Then `result + 1` crashes with TypeError.", characterLine: "Careful! Showing a number is not handing it back.", isBoss: false, tags: ["functions", "print", "return", "typeerror"] },
  { id: "func-14", world: "world_functions", missionNumber: 14, type: "what_prints", title: "Return stops the search", code: `def first_big(items):
    for item in items:
        if item > 5:
            return item
    return 0

print(first_big([2, 8, 9]))`, question: "How many loop runs happen before return?", options: ["2", "3", "1", "0"], correctAnswer: "2", explanation: "The loop checks 2, then 8. Since 8 is bigger than 5, it returns before checking 9.", characterLine: "Target found! `return` ends mission instantly.", isBoss: false, tags: ["functions", "loops", "return", "early-return"] },
  { id: "func-15", world: "world_functions", missionNumber: 15, type: "what_prints", title: "Nested function calls", code: `def double(n):
    return n * 2

def add_three(n):
    return n + 3

power = add_three(double(4))
print(power)`, question: "What prints?", options: ["11", "14", "8", "7"], correctAnswer: "11", explanation: "`double(4)` runs first and returns 8. Then `add_three(8)` returns 11.", characterLine: "Function combo cleared! Solve inside call first.", isBoss: false, tags: ["functions", "nested-calls", "return", "order"] }

];

// ============= PER-WORLD BOSSES =============
// One capstone boss attached to each normal world.
const worldBossMissions: LearningPythonMission[] = [
  {
    id: "boss-01",
    world: "world_variables",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Boss: Trace the data",
    code: `data = {"count": 3, "items": ["a", "b", "c"]}
result = data["items"][data["count"] - 1]
print(result)`,
    question: "What prints?",
    options: ["c", "a", "3", '["a", "b", "c"]'],
    correctAnswer: "c",
    explanation: "`data[\"count\"]` is 3. `3 - 1 = 2`. `data[\"items\"][2]` is 'c' (index 2 = third item).",
    characterLine: "AMAZING! You combined dict access, list indexing, AND math in one line! BOSS LEVEL UNLOCKED!",
    isBoss: true,
    tags: ["dict", "list", "index", "combined"]
  },
  {
    id: "boss-02",
    world: "world_lists_dicts",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Boss: Loop + condition",
    code: `scores = [88, 92, 71, 65]
passed = 0
for s in scores:
    if s >= 70:
        passed = passed + 1
print(passed)`,
    question: "What prints?",
    options: ["3", "4", "2", "1"],
    correctAnswer: "3",
    explanation: "Three scores (88, 92, 71) are >= 70. Score 65 is not. Counter ends at 3.",
    characterLine: "BEAST MODE! Loop through, check each one, count the winners — that's real code reading!",
    isBoss: true,
    tags: ["loop", "condition", "counter", "combined"]
  },
  {
    id: "boss-03",
    world: "world_control_flow",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Boss: Function chain",
    code: `def clean(text):
    return text.strip().lower()

def slugify(name):
    return clean(name).replace(" ", "-")

result = slugify("  Alpha Starts  ")
print(result)`,
    question: "What prints?",
    options: ["alpha-starts", "Alpha Starts", "  Alpha Starts  ", "alpha starts"],
    correctAnswer: "alpha-starts",
    explanation: "`clean()` strips spaces and lowercases → 'alpha starts'. Then `.replace(\" \", \"-\")` turns spaces to dashes → 'alpha-starts'.",
    characterLine: "LEGENDARY! Functions calling functions — you traced the whole chain like a PRO!",
    isBoss: true,
    tags: ["functions", "chain", "strings", "combined"]
  },
  {
    id: "boss-04",
    world: "world_loops",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Boss: Does it crash?",
    code: `contact = {"name": "Jordan"}
email = contact["email"]
print(email)`,
    question: "What happens?",
    options: ["KeyError — 'email' key doesn't exist", "Prints None", "Prints 'email'", "Prints Jordan"],
    correctAnswer: "KeyError — 'email' key doesn't exist",
    explanation: "The dictionary only has a 'name' key. Accessing 'email' with brackets raises a KeyError crash.",
    characterLine: "WHOOPS! Square bracket access assumes the key exists. Missing key = crash! Use .get() instead!",
    isBoss: true,
    tags: ["dict", "error", "keyerror", "combined"]
  },
  {
    id: "boss-05",
    world: "world_functions",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Boss: The gauntlet",
    code: `def is_eligible(user):
    return user["age"] >= 18 and user["plan"] != "free"

users = [
    {"age": 22, "plan": "pro"},
    {"age": 17, "plan": "pro"},
    {"age": 30, "plan": "free"}
]
for u in users:
    print(is_eligible(u))`,
    question: "What three values print?",
    options: ["True / False / False", "True / True / False", "False / False / False", "True / False / True"],
    correctAnswer: "True / False / False",
    explanation: "User 1: 22>=18 AND 'pro'!='free' → True. User 2: 17>=18 false → False. User 3: 'free'!='free' false → False.",
    characterLine: "YOU DID IT! Dicts, lists, AND/OR logic, loops, functions — all in one boss! YOU WIN! 🏆",
    isBoss: true,
    tags: ["all", "combined", "boss"]
  }

  ,{
    id: "gauntlet-06", world: "world_boss", missionNumber: 6, type: "boss_gauntlet", title: "Gauntlet: Inventory total", code: `inventory = {"coins": 5, "gems": 2}
score = inventory["coins"] * 10
score = score + inventory["gems"] * 50
print(score)`, question: "What prints?", options: ["150", "70", "100", "57"], correctAnswer: "150", explanation: "Coins give 50. Gems give 100. Total score is 150.", characterLine: "Loot math mastered! Dict values power the score.", isBoss: false, tags: ["dict", "variables", "math", "combined"]
  },
  { id: "gauntlet-07", world: "world_boss", missionNumber: 7, type: "what_prints", title: "Gauntlet: Shield branch", code: `shield = 4
lives = 2
if shield >= 5 or lives > 2:
    print("safe")
else:
    print("danger")`, question: "Which branch runs?", options: ["else branch prints danger", "if branch prints safe", "Both branches print", "Error"], correctAnswer: "else branch prints danger", explanation: "Both sides of the `or` are false, so the else branch runs.", characterLine: "Branch scan complete! False OR false means danger.", isBoss: false, tags: ["conditionals", "or", "branch", "combined"] },
  { id: "gauntlet-08", world: "world_boss", missionNumber: 8, type: "whats_the_value", title: "Gauntlet: Count the robots", code: `robots = ["red", "blue", "red", "green"]
red_count = 0
for robot in robots:
    if robot == "red":
        red_count = red_count + 1
print(red_count)`, question: "How many loop runs happen?", options: ["4", "2", "3", "1"], correctAnswer: "4", explanation: "The loop runs once per list item. There are 4 robots, even though only 2 are red.", characterLine: "Loop radar says four passes!", isBoss: false, tags: ["list", "loop", "counter", "conditionals"] },
  { id: "gauntlet-09", world: "world_boss", missionNumber: 9, type: "does_it_crash", title: "Gauntlet: List index trap", code: `quests = ["forest", "cave"]
choice = 2
place = quests[choice]
print(place)`, question: "What happens?", options: ["IndexError — index 2 is out of range", "Prints cave", "Prints forest", "Prints 2"], correctAnswer: "IndexError — index 2 is out of range", explanation: "The list has indexes 0 and 1 only. Index 2 would be the third item, but there is none.", characterLine: "Trap spotted! Two items means indexes 0 and 1.", isBoss: false, tags: ["list", "index", "error", "indexerror"] },
  { id: "gauntlet-10", world: "world_boss", missionNumber: 10, type: "boss_gauntlet", title: "Gauntlet: Function bonus", code: `def bonus(level):
    if level >= 3:
        return 5
    return 1

score = 10 + bonus(3)
print(score)`, question: "What prints?", options: ["15", "11", "10", "5"], correctAnswer: "15", explanation: "`level` is 3, so bonus returns 5. Then 10 + 5 prints 15.", characterLine: "Bonus unlocked! Function branch chooses the power-up.", isBoss: false, tags: ["functions", "conditionals", "return", "combined"] },
  { id: "gauntlet-11", world: "world_boss", missionNumber: 11, type: "boss_gauntlet", title: "Gauntlet: Repair the shields", code: `shields = [3, 0, 2]
total = 0
for shield in shields:
    if shield == 0:
        total = total + 1
    else:
        total = total + shield
print(total)`, question: "What is the final value of total?", options: ["6", "5", "3", "1"], correctAnswer: "6", explanation: "The loop adds 3, then 1 for broken shield 0, then 2. Total is 6.", characterLine: "Repair logic online! Special cases change the total.", isBoss: false, tags: ["list", "loop", "if", "accumulator"] },
  { id: "gauntlet-12", world: "world_boss", missionNumber: 12, type: "boss_gauntlet", title: "Gauntlet: Robot dictionary loop", code: `robots = [
    {"name": "Bolt", "power": 4},
    {"name": "Zip", "power": 7}
]
for bot in robots:
    if bot["power"] > 5:
        print(bot["name"])`, question: "What prints?", options: ["Zip", "Bolt", "Bolt / Zip", "Nothing"], correctAnswer: "Zip", explanation: "Bolt power 4 fails. Zip power 7 passes, so Zip prints.", characterLine: "Scanner locked on! Dicts inside lists are boss-level data.", isBoss: false, tags: ["list", "dict", "loop", "conditionals"] },
  { id: "gauntlet-13", world: "world_boss", missionNumber: 13, type: "does_it_crash", title: "Gauntlet: Missing return", code: `def spend(coins):
    coins = coins - 2

wallet = 5
wallet = spend(wallet)
print(wallet + 1)`, question: "What happens?", options: ["TypeError — spend returns None", "Prints 4", "Prints 6", "Prints None"], correctAnswer: "TypeError — spend returns None", explanation: "`spend` does not return anything, so it returns `None`. Then `wallet + 1` crashes.", characterLine: "Return missing! Functions must return values you want to use.", isBoss: false, tags: ["functions", "return", "none", "typeerror"] },
  { id: "gauntlet-14", world: "world_boss", missionNumber: 14, type: "boss_gauntlet", title: "Gauntlet: Quest rewards", code: `def reward(quest):
    if quest["done"]:
        return quest["coins"]
    return 0

quests = [{"done": True, "coins": 4}, {"done": False, "coins": 9}]
total = 0
for quest in quests:
    total = total + reward(quest)
print(total)`, question: "What prints?", options: ["4", "13", "9", "0"], correctAnswer: "4", explanation: "First quest returns 4. Second quest returns 0. Total is 4.", characterLine: "Quest log decoded! Functions can read dicts in loops.", isBoss: false, tags: ["functions", "dict", "loop", "conditionals"] },
  { id: "gauntlet-15", world: "world_boss", missionNumber: 15, type: "boss_gauntlet", title: "Gauntlet: Final training combo", code: `def rank(player):
    if player["score"] >= 10 and player["lives"] > 0:
        return "hero"
    return "rookie"

team = [{"score": 12, "lives": 1}, {"score": 10, "lives": 0}]
for player in team:
    print(rank(player))`, question: "What prints in order?", options: ["hero / rookie", "hero / hero", "rookie / hero", "rookie / rookie"], correctAnswer: "hero / rookie", explanation: "Player 1 passes both checks. Player 2 has lives 0, so `lives > 0` fails.", characterLine: "Final combo cleared! Dicts, booleans, loops, and returns together.", isBoss: false, tags: ["functions", "dict", "loop", "and", "combined"] }

];

// ============= WORLD 6: BOSS GAUNTLET =============
// Five mixed review missions plus a final boss. This keeps the final world playable.
const finalGauntletMissions: LearningPythonMission[] = [
  {
    id: "gauntlet-01",
    world: "world_boss",
    missionNumber: 1,
    type: "boss_gauntlet",
    title: "Gauntlet: Trace the data",
    code: `data = {"count": 3, "items": ["a", "b", "c"]}
result = data["items"][data["count"] - 1]
print(result)`,
    question: "What prints?",
    options: ["c", "a", "3", '["a", "b", "c"]'],
    correctAnswer: "c",
    explanation: "`data[\"count\"]` is 3. `3 - 1 = 2`. `data[\"items\"][2]` is 'c' (index 2 = third item).",
    characterLine: "AMAZING! You combined dict access, list indexing, AND math in one line!",
    isBoss: false,
    tags: ["dict", "list", "index", "combined"]
  },
  {
    id: "gauntlet-02",
    world: "world_boss",
    missionNumber: 2,
    type: "boss_gauntlet",
    title: "Gauntlet: Loop + condition",
    code: `scores = [88, 92, 71, 65]
passed = 0
for s in scores:
    if s >= 70:
        passed = passed + 1
print(passed)`,
    question: "What prints?",
    options: ["3", "4", "2", "1"],
    correctAnswer: "3",
    explanation: "Three scores (88, 92, 71) are >= 70. Score 65 is not. Counter ends at 3.",
    characterLine: "BEAST MODE! Loop through, check each one, count the winners.",
    isBoss: false,
    tags: ["loop", "condition", "counter", "combined"]
  },
  {
    id: "gauntlet-03",
    world: "world_boss",
    missionNumber: 3,
    type: "boss_gauntlet",
    title: "Gauntlet: Function chain",
    code: `def clean(text):
    return text.strip().lower()

def slugify(name):
    return clean(name).replace(" ", "-")

result = slugify("  Alpha Starts  ")
print(result)`,
    question: "What prints?",
    options: ["alpha-starts", "Alpha Starts", "  Alpha Starts  ", "alpha starts"],
    correctAnswer: "alpha-starts",
    explanation: "`clean()` strips spaces and lowercases → 'alpha starts'. Then `.replace(\" \", \"-\")` turns spaces to dashes → 'alpha-starts'.",
    characterLine: "LEGENDARY! Functions calling functions — you traced the whole chain.",
    isBoss: false,
    tags: ["functions", "chain", "strings", "combined"]
  },
  {
    id: "gauntlet-04",
    world: "world_boss",
    missionNumber: 4,
    type: "does_it_crash",
    title: "Gauntlet: Does it crash?",
    code: `contact = {"name": "Jordan"}
email = contact["email"]
print(email)`,
    question: "What happens?",
    options: ["KeyError — 'email' key doesn't exist", "Prints None", "Prints 'email'", "Prints Jordan"],
    correctAnswer: "KeyError — 'email' key doesn't exist",
    explanation: "The dictionary only has a 'name' key. Accessing 'email' with brackets raises a KeyError crash.",
    characterLine: "Good catch! Missing dict keys crash when you use square brackets.",
    isBoss: false,
    tags: ["dict", "error", "keyerror", "combined"]
  },
  {
    id: "gauntlet-05",
    world: "world_boss",
    missionNumber: 5,
    type: "boss_gauntlet",
    title: "Gauntlet: Eligibility check",
    code: `def is_eligible(user):
    return user["age"] >= 18 and user["plan"] != "free"

users = [
    {"age": 22, "plan": "pro"},
    {"age": 17, "plan": "pro"},
    {"age": 30, "plan": "free"}
]
for u in users:
    print(is_eligible(u))`,
    question: "What three values print?",
    options: ["True / False / False", "True / True / False", "False / False / False", "True / False / True"],
    correctAnswer: "True / False / False",
    explanation: "User 1 passes both checks. User 2 fails age. User 3 fails plan. So the outputs are True, False, False.",
    characterLine: "YOU DID IT! Dicts, lists, logic, loops, functions — all together.",
    isBoss: false,
    tags: ["all", "combined", "boss"]
  },
  {
    id: "gauntlet-boss-01",
    world: "world_boss",
    missionNumber: 0,
    type: "boss_gauntlet",
    title: "Final Boss: Read the whole program",
    code: `def bonus(score):
    if score >= 90:
        return 10
    return 0

players = [
    {"name": "Maya", "score": 95},
    {"name": "Leo", "score": 72}
]
for player in players:
    total = player["score"] + bonus(player["score"])
    print(f"{player['name']}: {total}")`,
    question: "What prints in order?",
    options: ["Maya: 105 / Leo: 72", "Maya: 95 / Leo: 72", "Maya: 105 / Leo: 82", "Error"],
    correctAnswer: "Maya: 105 / Leo: 72",
    explanation: "Maya's score is 95, so bonus returns 10 and total is 105. Leo's score is 72, so bonus returns 0 and total is 72.",
    characterLine: "FINAL BOSS DOWN! You read variables, dicts, loops, functions, and if logic together.",
    isBoss: true,
    tags: ["final-boss", "combined", "functions", "loops", "dict"]
  }
];

export const learningPythonMissions: LearningPythonMission[] = [
  ...world1Missions,
  ...world2Missions,
  ...world3Missions,
  ...world4Missions,
  ...world5Missions,
  ...worldBossMissions,
  ...finalGauntletMissions
];

export const WORLDS: LearningWorldId[] = [
  "world_variables",
  "world_lists_dicts",
  "world_control_flow",
  "world_loops",
  "world_functions",
  "world_boss"
];

export function getMissionsForWorld(world: LearningWorldId): LearningPythonMission[] {
  return learningPythonMissions.filter(m => m.world === world).sort((a, b) => a.missionNumber - b.missionNumber);
}

export function getBossForWorld(world: LearningWorldId): LearningPythonMission | undefined {
  return learningPythonMissions.find(m => m.world === world && m.isBoss);
}