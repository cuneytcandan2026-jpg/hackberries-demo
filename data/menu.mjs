/**
 * Hackberries - menu data.
 *
 * PROVENANCE, READ BEFORE PUBLISHING
 * ----------------------------------
 * Transcribed from three photographs of the printed Hackberries menu supplied
 * with this brief. Those photographs are Google image-search screenshots
 * captioned "Hackberries - a year ago", so:
 *
 *   - the dish names and descriptions are genuinely Hackberries', but
 *   - the PRICES ARE ARCHIVED and are almost certainly out of date, and
 *   - availability of any individual item is unconfirmed.
 *
 * `PRICE_POLICY` below controls how prices render. It ships as 'archived',
 * which shows the figures with a visible "archived, to be confirmed" notice.
 * Set it to 'confirmed' once the client supplies a current menu, or to 'hidden'
 * if you would rather show no prices at all during review.
 *
 * ALLERGENS: never inferred. (V) marks are transcribed exactly as printed and
 * nothing else is added. See content-needed.md.
 *
 * STRUCTURE (menu page redesign)
 * ------------------------------
 * Item names, prices, descriptions and (V) marks are exactly as printed. What
 * the redesign changed is grouping and presentation only:
 *
 *   - Sections are ordered by course, and some are renamed so the name says
 *     what is in them. `printed` records the name on the printed menu; every
 *     rename is listed in content-needed.md for the café to approve.
 *   - The printed "Benedict select" note (two poached eggs, English muffin,
 *     hollandaise) sat over four dishes it cannot describe, so those four are
 *     split out as "Brunch plates" (`split: true`), also to be confirmed.
 *   - A section's printed note is broken into `includes` (what every dish
 *     comes with, shown as ticks), `options` (a list to choose from),
 *     `upgrades` (paid add-ons) and `note` (anything left over).
 *
 * `layout` picks how a section is set on the menu page:
 *   'dishes' - name, price and description rows (the default)
 *   'build'  - build your own: a price ladder plus the list to choose from.
 *              Ladder rows carry `short`; the "add a topping" row is `extra`.
 *   'group'  - one price for the whole section, shown once; an item that
 *              costs something different still shows its own price
 *   'list'   - short names in columns with a dotted leader
 *   'addons' - a list inside a panel that opens (still readable without JS)
 *
 * Every section `id` is a stable anchor: the homepage links to #breakfast,
 * #sweet-breakfast, #grills, #hot-drinks and #iced-coffee.
 */

/** 'archived' | 'confirmed' | 'hidden' */
export const PRICE_POLICY = 'archived';

export const PRICE_NOTE =
  'Prices are transcribed from a photograph of a printed menu dated about a ' +
  'year ago. They are shown so the layout can be reviewed and must be ' +
  'replaced with current prices before this site goes live.';

export const MENU_META = {
  sourceNote:
    'Transcribed from the printed in-café menu. Dishes marked (V) are marked ' +
    'vegetarian on the printed menu; no other dietary or allergen information ' +
    'has been added.',
  allergenNote:
    'Allergen information is not published here. Please ask a member of the ' +
    'team about ingredients and allergens before ordering.',
};

export const COURSES = [
  { id: 'breakfast', label: 'Breakfast', short: 'Breakfast', photo: 'food-menemen' },
  { id: 'sweet', label: 'Sweet', short: 'Sweet', photo: 'dessert-french-toast' },
  { id: 'lunch', label: 'Lunch & grills', short: 'Lunch', photo: null },
  { id: 'drinks', label: 'Drinks', short: 'Drinks', photo: 'drink-iced-latte' },
  { id: 'bar', label: 'Bar', short: 'Bar', photo: null },
];

export const MENU = [
  /* ---------------------------------------------------------------- BREAKFAST */
  {
    id: 'breakfast',
    course: 'breakfast',
    name: 'Full breakfasts',
    printed: 'Breakfast',
    includes: ['1 slice of toast', 'A cup of tea'],
    note: 'Coffee +£2.',
    items: [
      {
        name: 'Turkish breakfast', price: 12.5,
        desc: '2 eggs, olives, feta cheese, sucuk, halloumi, fresh courgette, aubergine, sweet pepper, cheese pastry, grilled mushrooms — served with jam, honey, toasted Turkish bread and mixed salad.',
      },
      {
        name: 'Full English', price: 11.4,
        desc: '2 eggs, baked beans, sausage, bacon, grilled tomatoes, grilled mushrooms, 2 hash browns — served with toasted sourdough bread & black pudding.',
      },
      {
        name: 'American breakfast', price: 11.4,
        desc: '2 eggs, 2 pancakes (with fruit and syrup), sausage, bacon, grilled mushrooms, tomatoes, 2 hash browns — served with toasted sourdough bread.',
      },
      {
        name: 'Veggie breakfast', price: 10.9, tags: ['V'],
        desc: '2 eggs, vegan sausage, hash browns, halloumi, grilled mushrooms and avocado — served with baked beans, toasted sourdough bread and mixed salad.',
      },
      {
        name: 'Vegan breakfast', price: 10.9, tags: ['V'],
        desc: 'Courgette, aubergine, red and green sweet peppers, grilled mushrooms, 2 falafels, hash browns, avocado, vegan sausage, and jam — served with toasted sourdough bread and mixed salad.',
      },
    ],
  },
  {
    id: 'benedict-select',
    course: 'breakfast',
    name: 'Benedicts',
    printed: 'Benedict select',
    includes: ['Two poached eggs', 'English muffin', 'Fresh hollandaise sauce', 'Mixed salad'],
    items: [
      { name: 'Eggs benedict (bacon)', price: 9.9 },
      { name: 'Eggs royale (smoked salmon)', price: 10.9 },
      { name: 'Eggs florentine (spinach)', price: 9.0, tags: ['V'] },
    ],
  },
  {
    id: 'brunch-plates',
    course: 'breakfast',
    name: 'Brunch plates',
    printed: 'Benedict select',
    split: true,
    items: [
      {
        name: 'Egg & avocado toast', price: 9.0, tags: ['V'],
        desc: '2 poached eggs with sourdough bread, mashed avocado and mixed salad.',
      },
      {
        name: 'Salmon toast', price: 10.9,
        desc: 'Scrambled eggs with smoked salmon — served with mixed salad.',
      },
      {
        name: 'Homemade gözleme', price: 7.0, tags: ['V'],
        desc: 'Cheese and spinach pastry — served with salad.',
      },
      {
        name: 'Homemade menemen', price: 9.9, tags: ['V'],
        desc: '2 eggs with fresh tomato sauce and mozzarella cheese — served with caramelised Turkish bread.',
      },
    ],
  },
  {
    id: 'set-breakfast',
    course: 'breakfast',
    name: 'Set breakfasts',
    printed: 'Set breakfast',
    layout: 'group',
    includes: ['1 slice of toast', 'A cup of tea'],
    note: 'Coffee +£2.',
    items: [
      { name: 'Set 1', price: 9.0, desc: 'Egg, bacon, sausage & beans.' },
      { name: 'Set 2', price: 9.0, desc: 'Egg, bacon, mushrooms & hash brown.' },
      { name: 'Set 3', price: 9.0, desc: 'Egg, mushrooms, hash brown & tomatoes.' },
      { name: 'Set 4', price: 9.0, desc: 'Avocado, mushrooms, tomatoes & hash brown.' },
      { name: 'Set 5', price: 9.0, desc: 'Egg, bacon, sausage & chips.' },
      { name: 'Set 6', price: 9.0, desc: 'Ham, egg, chips & beans.' },
    ],
  },
  {
    id: 'omelettes',
    course: 'breakfast',
    name: 'Omelettes',
    layout: 'build',
    includes: ['Chips', 'Salad'],
    options: {
      label: 'Toppings',
      list: ['Ham', 'Cheddar cheese', 'Spinach', 'Mushroom', 'Sweet red pepper', 'Onion',
        'Feta cheese', 'Peas', 'Sucuk', 'Halloumi', 'Sun-dried tomato'],
    },
    items: [
      { name: 'Plain omelette', short: 'Plain', price: 7.0 },
      { name: '1 topping', price: 8.0 },
      { name: '2 toppings', price: 9.0 },
      { name: '3 toppings', price: 10.0 },
      { name: 'Add topping', price: 1.5, extra: true },
    ],
  },
  {
    id: 'on-toast',
    course: 'breakfast',
    name: 'On toast',
    layout: 'list',
    items: [
      { name: 'Toast (2) with jam or marmalade', price: 5.0 },
      { name: 'Toast (2) with baked beans', price: 5.0 },
      { name: 'Toast (2) with scrambled egg', price: 7.0 },
      { name: 'Toast (2) with mushroom', price: 7.0 },
    ],
  },
  {
    id: 'extras',
    course: 'breakfast',
    name: 'Sides & extras',
    printed: 'Extras',
    layout: 'addons',
    items: [
      { name: 'Ham', price: 2.0 }, { name: 'Halloumi', price: 2.5 },
      { name: 'Turkish sucuk', price: 2.5 }, { name: 'Smoked salmon', price: 4.0 },
      { name: 'Egg', price: 1.5 }, { name: 'Turkish pastry', price: 1.5 },
      { name: 'Veggie sausage', price: 2.0 }, { name: '1 toast', price: 1.2 },
      { name: 'Baked beans', price: 1.5 }, { name: 'Feta cheese', price: 2.0 },
      { name: 'Avocado', price: 3.0 }, { name: 'Hollandaise sauce', price: 2.5 },
      { name: 'Grilled onion', price: 1.5 }, { name: 'Hummus', price: 3.0 },
      { name: 'Tomato', price: 1.5 }, { name: 'Olives', price: 3.0 },
      { name: 'Chips', price: 3.0 }, { name: 'Cacık', price: 3.0 },
      { name: 'Hash brown', price: 2.5 }, { name: 'Jam / Nutella', price: 1.5 },
      { name: 'Bacon', price: 2.5 }, { name: 'Black pudding', price: 1.7 },
      { name: 'Sausage', price: 2.0 },
    ],
  },

  /* ------------------------------------------------------------------- SWEET */
  {
    id: 'sweet-breakfast',
    course: 'sweet',
    name: 'Sweet breakfast',
    layout: 'group',
    items: [
      {
        name: 'Homemade fruit pancake', price: 9.9,
        desc: 'Three pancakes served with fresh fruits, fresh cream and maple syrup or Nutella.',
      },
      {
        name: 'Waffle', price: 9.9,
        desc: 'Waffle served with fresh fruits, fresh cream and maple syrup or Nutella.',
      },
      {
        name: 'French toast', price: 9.9,
        desc: 'Brioche bread dipped in cinnamon-vanilla batter, served with fresh fruits, fresh cream, butter and maple syrup or Nutella.',
      },
      {
        name: 'Granola protein', price: 9.9,
        desc: "Homemade yogurt with season's fruits and honey.",
      },
    ],
  },
  {
    id: 'desserts',
    course: 'sweet',
    name: 'Cakes & desserts',
    printed: 'Desserts',
    layout: 'list',
    items: [
      { name: 'Victoria sponge cake', price: 4.5 },
      { name: 'Carrot cake', price: 4.5 },
      { name: 'Red velvet', price: 4.5 },
      { name: 'Cheese cake', price: 4.5 },
      { name: 'Chocolate cake', price: 5.0 },
      { name: 'Apple pie & custard', price: 4.0 },
      { name: 'Ice cream', price: null },
    ],
  },

  /* -------------------------------------------------------------------- LUNCH */
  {
    id: 'grills',
    course: 'lunch',
    name: 'Grills',
    items: [
      {
        name: 'Lamb chops', price: 15.0,
        desc: 'Served with marinated baby potatoes, onion, tomatoes, and bell pepper — drizzled with pomegranate sauce.',
      },
      { name: 'Chicken shish', price: 13.5, desc: 'Served with chips or rice & mixed salad.' },
      { name: 'Lamb shish', price: 15.0, desc: 'Served with chips or rice & mixed salad.' },
      { name: 'Seabass fillet', price: 14.0, desc: 'Served with mixed salad.' },
      {
        name: 'Salmon', price: 14.5,
        desc: 'Served with baby potatoes, broccoli, carrot, peas & bell pepper.',
      },
      {
        name: 'Lamb köfte', price: 13.0,
        desc: 'Homemade köfte served with house salad, rice or chips.',
      },
    ],
  },
  {
    id: 'burgers',
    course: 'lunch',
    name: 'Burgers',
    includes: ['Chips'],
    items: [
      {
        name: 'Hackberries burger', price: 12.9,
        desc: 'High quality beef, bacon, cheese, grilled onion served with Parmesan cheese, chips, salad & gherkins.',
      },
      {
        name: 'Cheese burger', price: 9.9,
        desc: 'High quality beef with chips, salad & gherkins.',
      },
      { name: 'Fried chicken burger', price: 9.9, desc: 'Served with chips and salad.' },
      { name: 'Veggie burger', price: 9.9, tags: ['V'], desc: 'Served with chips and salad.' },
    ],
  },
  {
    id: 'pasta',
    course: 'lunch',
    name: 'Homemade pasta',
    items: [
      {
        name: 'Penne', price: 10.0,
        desc: 'With a choice of homemade tomato sauce or homemade creamy mushroom sauce. Add chicken, bacon or mushroom +£2.00.',
      },
      { name: 'Spaghetti bolognese & Parmesan cheese', price: 11.0 },
      { name: 'Pasta with meatballs & cheese', price: 9.9 },
      { name: 'Turkish mantı with yogurt & butter sauce', price: 14.0 },
    ],
  },
  {
    id: 'wraps',
    course: 'lunch',
    name: 'Wraps',
    items: [
      {
        name: "Chef's special", price: 11.0,
        desc: 'Grilled chicken served with grilled tomatoes, red onion, spicy sauce, cheese, bell peppers & fries.',
      },
      {
        name: 'Tuna melt', price: 8.5,
        desc: 'Tuna, mayonnaise and cheddar cheese served with mixed salad.',
      },
      {
        name: 'Halloumi veggie', price: 9.5, tags: ['V'],
        desc: 'Halloumi served with spinach, mashed avocado, hummus, falafel & mixed salad.',
      },
      {
        name: 'Homemade lamb köfte wrap', price: 10.0,
        desc: 'Served in tortilla with parsley, red onion, tomatoes & fries.',
      },
      {
        name: 'Breakfast wrap', price: 10.9,
        desc: 'Bacon, hash brown, eggs, avocado & cheddar cheese. Served with chips.',
      },
      {
        name: 'Veggie wrap', price: 9.0, tags: ['V'],
        desc: 'Spinach, eggs, sweet pepper & cheddar cheese. Served with chips or salad.',
      },
    ],
  },
  {
    id: 'panini',
    course: 'lunch',
    name: 'Panini',
    layout: 'group',
    note: 'Served with chips or salad.',
    items: [
      { name: 'Tuna & cheese', price: 8.0 },
      { name: 'Sucuk & halloumi', price: 8.0 },
      { name: 'Sun-dried tomatoes, pesto & mozzarella', price: 8.0 },
      { name: 'Chicken & bacon', price: 9.0 },
      { name: 'Ham & cheese', price: 8.0 },
    ],
  },
  {
    id: 'salad-bowls',
    course: 'lunch',
    name: 'Salad bowls',
    items: [
      {
        name: 'Grilled cajun chicken', price: 9.9,
        desc: 'Mixed salad, crispy tortilla strips, topped with sliced avocado and creamy cajun dressing.',
      },
      {
        name: 'Grilled halloumi', price: 9.9, tags: ['V'],
        desc: 'Mixed salad, Kalamata olives, and avocado, topped with garlic dressing.',
      },
      {
        name: 'Grilled chicken caesar', price: 9.9,
        desc: 'Mixed salad, topped with caesar dressing.',
      },
      {
        name: 'Smoked salmon', price: 11.9,
        desc: 'Mixed salad, pomegranate, topped with sliced avocado and pomegranate dressing.',
      },
      { name: 'Greek salad', price: 9.0 },
      { name: 'Tuna salad', price: 9.9 },
      { name: 'Cheese salad', price: 9.0 },
    ],
  },
  {
    id: 'soup',
    course: 'lunch',
    name: 'Homemade soup',
    layout: 'group',
    includes: ['Bread'],
    items: [
      { name: 'Tomato soup with cheese', price: 5.5 },
      { name: 'Lentil soup', price: 5.5 },
      { name: 'Chicken & mushroom soup', price: 5.5 },
    ],
  },
  {
    id: 'dinner',
    course: 'lunch',
    name: 'Roasts & pie',
    printed: 'Homemade dinner',
    items: [
      { name: 'Roast chicken', price: 9.9, desc: 'Served with potatoes, mix vegetables and gravy.' },
      { name: 'Roast beef', price: 15.0, desc: 'Served with potatoes, mix vegetables and gravy.' },
      { name: 'Shepherd pie', price: 15.0, desc: 'Served with potatoes, mix vegetables and gravy.' },
    ],
  },
  {
    id: 'sandwiches',
    course: 'lunch',
    name: 'Baguette, rolls & sandwiches',
    layout: 'build',
    options: {
      label: 'Choose from',
      list: ['Avocado', 'Halloumi', 'Spinach', 'Ham', 'Chicken', 'Bacon', 'Sausage', 'Tuna',
        'Cheese', 'Onion', 'Sun-dried tomato', 'Sweetcorn', 'Sucuk', 'Tomato pesto', 'Egg',
        'Hash brown', 'Feta cheese', 'Salad'],
    },
    note: '50p extra for baguette / panini.',
    items: [
      { name: '1 topping', price: 4.0 },
      { name: '2 toppings', price: 5.5 },
      { name: '3 toppings', price: 7.0 },
      { name: 'Add topping', price: 1.5, extra: true },
    ],
  },
  {
    id: 'jacket-potato',
    course: 'lunch',
    name: 'Jacket potato',
    layout: 'build',
    includes: ['Mixed salad'],
    options: {
      label: 'Toppings',
      list: ['Ham', 'Cheddar cheese', 'Peas', 'Tuna', 'Beans', 'Bacon', 'Sweetcorn', 'Sucuk',
        'Halloumi', 'Coleslaw', 'Chilli con carne'],
    },
    items: [
      { name: '1 topping', price: 7.4 },
      { name: '2 toppings', price: 8.4 },
      { name: '3 toppings', price: 9.4 },
    ],
  },
  {
    id: 'appetisers',
    course: 'lunch',
    name: 'Starters',
    printed: 'Appetisers',
    items: [
      {
        name: 'Dirty fries', price: 6.5,
        desc: 'Chips topped with crispy Southern fried chicken & mixture of sauces.',
      },
      {
        name: 'Hummus cacık olives', price: 6.5, tags: ['V'],
        desc: 'Served with Turkish bread.',
      },
      {
        name: 'Halloumi (3 pcs)', price: 4.8, tags: ['V'],
        desc: 'Served with special sauce and lettuce.',
      },
    ],
  },
  {
    id: 'kids',
    course: 'lunch',
    name: 'Kids',
    items: [
      { name: 'Bacon, sausage and chips', price: 7.0 },
      { name: 'Chicken nuggets and chips', price: 6.9 },
      { name: 'Fish fingers and chips', price: 6.5 },
      { name: 'Pancake, egg & sausage with fruits', price: 6.5 },
      { name: 'Egg, hash brown and sausage', price: 6.5 },
    ],
  },

  /* ------------------------------------------------------------------- DRINKS */
  {
    id: 'hot-drinks',
    course: 'drinks',
    name: 'Coffee & tea',
    printed: 'Hot drinks',
    layout: 'list',
    upgrades: [
      { name: 'Oat, soya or coconut milk · decaf coffee · extra shot', price: 0.4 },
      { name: 'Syrup: vanilla, caramel or hazelnut', price: 0.6 },
    ],
    items: [
      { name: 'Espresso single', price: 2.0 }, { name: 'Double espresso', price: 2.5 },
      { name: 'Americano black', price: 2.8 }, { name: 'Macchiato', price: 3.0 },
      { name: 'Cappuccino', price: 3.0 }, { name: 'Babyccino', price: 3.0 },
      { name: 'Flat white', price: 3.0 }, { name: 'Cortado', price: 3.0 },
      { name: 'Latte', price: 3.0 }, { name: 'Mocha', price: 3.4 },
      { name: 'Hot chocolate', price: 3.4 }, { name: 'Chai latte', price: 3.4 },
      { name: 'Matcha latte', price: 4.0 }, { name: 'Turkish coffee', price: 3.0 },
      { name: 'Turkish tea', price: 2.2 }, { name: 'Tea', price: 2.2 },
    ],
  },
  {
    id: 'herbal-tea',
    course: 'drinks',
    name: 'Herbal tea',
    layout: 'group',
    items: [
      { name: 'Earl grey', price: 2.2 }, { name: 'Green', price: 2.2 },
      { name: 'Mint', price: 2.2 }, { name: 'Chamomile', price: 2.2 },
      { name: 'Lemon & ginger', price: 2.2 },
    ],
  },
  {
    id: 'iced-coffee',
    course: 'drinks',
    name: 'Iced coffee',
    layout: 'list',
    items: [
      { name: 'Iced latte', price: 3.6 }, { name: 'Iced black', price: 3.0 },
      { name: 'Iced chai latte', price: 3.8 }, { name: 'Iced matcha latte', price: 4.5 },
    ],
  },
  {
    id: 'frappe',
    course: 'drinks',
    name: 'Frappé',
    layout: 'group',
    note: 'With coffee and cream.',
    items: [
      { name: 'Vanilla frappé', price: 5.5 }, { name: 'Chocolate frappé', price: 5.5 },
      { name: 'Biscoff frappé', price: 5.5 }, { name: 'Pistachio frappé', price: 5.5 },
      { name: 'Caramel frappé', price: 5.5 },
    ],
  },
  {
    id: 'milkshakes',
    course: 'drinks',
    name: 'Milkshakes',
    layout: 'group',
    items: [
      { name: 'Oreo', price: 5.0 }, { name: 'Snickers', price: 5.0 },
      { name: 'Vanilla', price: 5.0 }, { name: 'Twix', price: 5.0 },
      { name: 'Kinder Bueno', price: 5.0 }, { name: 'Strawberry', price: 5.0 },
      { name: 'Banana', price: 5.0 },
    ],
  },
  {
    id: 'smoothies',
    course: 'drinks',
    name: 'Smoothies',
    layout: 'group',
    items: [
      { name: 'Berry Go Ozkan', price: 5.0, desc: 'Strawberry, blackberry & raspberry.' },
      { name: 'Strawberry Split', price: 5.0, desc: 'Strawberry & banana.' },
      { name: "Pash 'n' Shoot", price: 5.0, desc: 'Mango, pineapple & passion fruit.' },
      { name: 'Avo Go Go Deren', price: 5.0, desc: 'Avocado, mango, spinach, ginger & lime.' },
    ],
  },
  {
    id: 'protein-shakes',
    course: 'drinks',
    name: 'Protein shakes',
    layout: 'group',
    items: [
      {
        name: 'Strawberry delight protein shake', price: 5.5,
        desc: 'One scoop of strawberry protein with semi-skimmed milk, strawberry & banana.',
      },
      {
        name: 'Banana chocolate protein shake', price: 5.5,
        desc: 'One scoop of chocolate protein, banana, and semi-skimmed milk.',
      },
    ],
  },
  {
    id: 'juice',
    course: 'drinks',
    name: 'Fresh juice',
    layout: 'list',
    items: [
      { name: 'Orange (medium)', price: 4.0 },
      { name: 'Orange (large)', price: 5.0 },
    ],
  },
  {
    id: 'soft-drinks',
    course: 'drinks',
    name: 'Soft drinks',
    layout: 'list',
    items: [
      { name: 'Coke (Original, Diet, Zero)', price: 2.5 }, { name: 'Sprite', price: 2.5 },
      { name: 'Fanta', price: 2.5 }, { name: 'Red Bull', price: 3.0 },
      { name: 'J20', price: 2.2 }, { name: 'Iced peach tea', price: 2.5 },
      { name: 'Cranberry juice', price: 2.5 }, { name: 'Orange juice', price: 2.3 },
      { name: 'Apple juice', price: 2.3 }, { name: 'Still water', price: 2.2 },
      { name: 'Sparkling water', price: 2.2 }, { name: 'Lucozade', price: 2.5 },
      { name: 'Fruit Shoot', price: 1.8 },
    ],
  },

  /* ---------------------------------------------------------------------- BAR */
  {
    id: 'cocktails',
    course: 'bar',
    name: 'Cocktails',
    layout: 'group',
    items: [
      { name: 'Piña colada', price: 10.0 }, { name: 'Porn star martini', price: 10.0 },
      { name: 'Mojito', price: 10.0 }, { name: 'Strawberry mojito', price: 10.0 },
      { name: 'Aperol spritz', price: 12.0 },
    ],
  },
  {
    id: 'mocktails',
    course: 'bar',
    name: 'Mocktails',
    layout: 'group',
    items: [
      { name: 'Virgin piña colada', price: 6.0 },
      { name: 'Virgin mojito', price: 6.0 },
      { name: 'Virgin strawberry mojito', price: 6.0 },
    ],
  },
  {
    id: 'wines',
    course: 'bar',
    name: 'Wine',
    printed: 'Wines',
    layout: 'list',
    note: '175ml.',
    items: [
      { name: 'Chardonnay', price: 6.0 }, { name: 'Sauvignon blanc', price: 7.5 },
      { name: 'Pinot grigio', price: 6.5 }, { name: 'Merlot', price: 6.5 },
      { name: 'Shiraz', price: 6.0 }, { name: 'Malbec merlot', price: 6.5 },
    ],
  },
  {
    id: 'beers',
    course: 'bar',
    name: 'Beer',
    printed: 'Beers',
    layout: 'list',
    note: '330ml unless stated.',
    items: [
      { name: 'Non-alcoholic Peroni', price: 4.9 }, { name: 'Peroni', price: 4.4 },
      { name: 'Corona', price: 4.4 }, { name: 'Budweiser', price: 4.4 },
      { name: 'Efes draft (500ml)', price: 4.9 },
    ],
  },
  {
    id: 'spirits',
    course: 'bar',
    name: 'Spirits',
    layout: 'list',
    note: 'Large glass.',
    items: [
      { name: 'Bacardi Blanche', price: 5.0 }, { name: "Gordon's", price: 5.0 },
      { name: "Hendrick's", price: 7.0 }, { name: 'Jack Daniels No7', price: 5.0 },
      { name: 'Courvoisier', price: 6.1 }, { name: 'Bacardi Blanca', price: 4.0 },
      { name: 'Absolut', price: 6.0 }, { name: 'Grey Goose', price: 7.0 },
      { name: 'Smirnoff', price: 5.0 }, { name: 'Tekirdağ Gold', price: 7.0 },
    ],
  },
];

/**
 * House favourites: the photo row at the top of the menu page. Only real café
 * photographs are used here: on a menu a photo reads as "this is what
 * arrives", so the generated lamb chops and burger images stay off this page.
 * `dish` names a single item (its price is shown); without it the card stands
 * for its whole section ("from" the lowest price).
 */
export const MENU_FAVOURITES = [
  { photo: 'food-menemen', section: 'brunch-plates', dish: 'Homemade menemen' },
  { photo: 'food-avocado-eggs', section: 'brunch-plates', dish: 'Egg & avocado toast' },
  { photo: 'dessert-french-toast', section: 'sweet-breakfast', dish: 'French toast' },
  { photo: 'food-omelette', section: 'omelettes', label: 'Omelette, your way' },
  { photo: 'drink-smoothies', section: 'smoothies', label: 'Smoothies' },
  { photo: 'drink-iced-latte', section: 'iced-coffee', dish: 'Iced latte' },
];

/** Dishes from the Turkish side of the kitchen, wherever they sit on the menu. */
export const TURKISH_KITCHEN = [
  { section: 'breakfast', dish: 'Turkish breakfast' },
  { section: 'brunch-plates', dish: 'Homemade menemen' },
  { section: 'brunch-plates', dish: 'Homemade gözleme' },
  { section: 'grills', dish: 'Lamb shish' },
  { section: 'grills', dish: 'Lamb köfte' },
  { section: 'wraps', dish: 'Homemade lamb köfte wrap' },
  { section: 'pasta', dish: 'Turkish mantı with yogurt & butter sauce' },
  { section: 'hot-drinks', dish: 'Turkish coffee' },
  { section: 'hot-drinks', dish: 'Turkish tea' },
];
