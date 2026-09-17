/**
 * Hackberries - image registry.
 *
 * Every entry maps to a real client photograph in Assets/Images. Derivatives in
 * site/media are produced by tools/build-images.mjs; originals are untouched.
 *
 * `alt` describes what is genuinely visible, and `title` is a few words for
 * places where the full description would be read twice (gallery buttons).
 * Where a photograph matches a named
 * menu item with confidence, `dish` records it; where it does not, `dish` is
 * null and the copy stays descriptive rather than inventing a product name.
 *
 * Every photograph is of Hackberries' own food, drinks or room. No stock
 * photography is used anywhere on this site. Some were retouched before
 * they were supplied; which ones, and what the client still has to approve,
 * is tracked in content-needed.md (not deployed).
 */
import { BUSINESS } from './business.mjs';

export const PHOTOS = {
  'dessert-french-toast': {
    source: 'Dessert 1.png',
    dish: 'French toast',
    title: 'French toast',
    alt:
      'Two thick slices of French toast dusted with icing sugar, piled with ' +
      'banana, strawberries, blueberries, redcurrants, cream and wafer rolls, ' +
      'drizzled with syrup on a blue glazed plate.',
    placeholder: '#8e5e37',
  },
  'food-menemen': {
    source: 'Food 1.png',
    dish: 'Homemade menemen',
    title: 'Menemen',
    alt:
      'A cast-iron pan of eggs cooked in tomato and pepper sauce, scattered ' +
      'with chives, served on a wooden board with toasted bread, in front of ' +
      'the café’s foliage and white-flower wall.',
    placeholder: '#948153',
  },
  'food-avocado-eggs': {
    source: 'Food 3.png',
    dish: 'Egg and avocado toast',
    title: 'Egg and avocado toast',
    alt:
      'Two poached eggs dusted with paprika on crushed avocado toast, with a ' +
      'dressed side salad, on a deep blue glazed oval plate set on marble.',
    placeholder: '#908a70',
  },
  'food-omelette': {
    source: 'Food 2.png',
    dish: 'Omelette',
    title: 'Omelette',
    alt:
      'A folded omelette scattered with chives and paprika on a long white ' +
      'plate, with toasted bread and a dressed side salad, on a marble table.',
    placeholder: '#bdb477',
  },
  'drink-iced-latte': {
    source: 'Drink 4.png',
    dish: 'Iced latte',
    title: 'Iced lattes',
    alt:
      'Three iced lattes in handled glass jars, the espresso layered over ' +
      'milk, on a dark marble counter.',
    placeholder: '#7f5229',
  },
  'drink-coffee-smoothie': {
    source: 'Coffe & Smoothie.png',
    dish: null,
    title: 'Iced coffee and a green smoothie',
    alt:
      'An iced coffee and a green smoothie in handled glass jars with red ' +
      'striped straws, in front of the café’s foliage wall and orange neon ' +
      'Hackberries sign.',
    placeholder: '#766d51',
  },
  'drink-smoothies': {
    source: 'Drink 2.png',
    dish: null,
    title: 'Two smoothies',
    alt:
      'A berry smoothie topped with a blackberry and raspberry beside a green ' +
      'smoothie garnished with orange and mint, both in handled glass jars on ' +
      'a marble table dressed with fresh flowers.',
    placeholder: '#7f7a52',
  },
  'drink-coolers': {
    source: 'Drink 1.png',
    dish: null,
    title: 'Three iced drinks',
    alt:
      'Three tall iced drinks side by side - a dark berry one topped with ' +
      'blackberries, a red one, and a bright blue one with lime and a sour ' +
      'sweet garnish - against the café’s white-flower wall.',
    placeholder: '#7e887f',
  },
  'drink-strawberry': {
    source: 'Drink 3.png',
    dish: null,
    title: 'Frozen strawberry drink',
    alt:
      'A frozen strawberry drink served in a martini glass with mint, lime ' +
      'and a paper parasol, with the café’s teal banquettes behind it.',
    placeholder: '#815139',
  },
  'food-lamb-chops': {
    source: 'Lamb Chops.png',
    dish: 'Lamb chops',
    title: 'Lamb chops',
    alt:
      'Grilled lamb chops with roast potatoes, red pepper, a lemon wedge, ' +
      'salad and a pot of chilli sauce on a long white plate.',
    placeholder: '#a5774d',
  },
  'food-burger': {
    source: 'Burger.png',
    dish: 'Burger',
    title: 'Burger',
    alt:
      'A cheeseburger with bacon, topped with a whole pickle, beside seasoned ' +
      'chips and a wire basket of fries on a blue glazed plate, on marble.',
    placeholder: '#906130',
  },
  'venue-hero': {
    source: 'Hero background image.png',
    dish: null,
    title: 'Inside Hackberries',
    // Short on purpose: it is read immediately before the page's h1.
    alt:
      'Inside Hackberries: rattan pendant lights over marble tables, velvet ' +
      'chairs, and a foliage wall hung with white flowers beside exposed brick.',
    placeholder: '#3a3226',
  },
  'venue-room': {
    source: 'Venue.png',
    dish: null,
    title: 'Inside Hackberries',
    alt:
      'Inside Hackberries: marble-topped tables with green and blue velvet ' +
      'chairs and banquettes, rattan pendant lights, an exposed brick wall and ' +
      'a foliage wall hung with white flowers.',
    placeholder: '#796e5b',
  },
};

/**
 * "Find your favourite" - four selectable moments.
 * Each is a real photograph paired with a dish that genuinely appears on the
 * archived Hackberries menu. Descriptions quote the printed menu wording.
 * Each dish's category label is the course its `href` points into, read from
 * data/menu.mjs, so the showcase, the panels and the menu page share one name.
 *
 * `label` is the CATEGORY the visitor chooses - a way of grouping the menu for
 * browsing, not a claim that the printed menu has a section with that name.
 * `menuName` is the dish exactly as printed, and is what appears in the
 * readout, so the honest name is always the one on screen beside the picture.
 */
export const SHOWCASE = [
  {
    id: 'menemen',
    href: 'menu.html#brunch-plates--homemade-menemen',
    photo: 'food-menemen',
    title: 'Homemade menemen',
    menuName: 'HOMEMADE MENEMEN (V)',
    text:
      'Two eggs folded through a fresh tomato sauce with mozzarella, served ' +
      'with caramelised Turkish bread. The one to order if you want breakfast ' +
      'to taste of somewhere.',
    group: 'breakfast',
  },
  {
    id: 'avocado',
    href: 'menu.html#brunch-plates--egg-and-avocado-toast',
    photo: 'food-avocado-eggs',
    title: 'Egg & avocado toast',
    menuName: 'EGG & AVOCADO TOAST (V)',
    text:
      'Two poached eggs on sourdough with mashed avocado and a mixed salad. ' +
      'The lighter way to start, here on a deep blue glazed plate.',
    group: 'breakfast',
  },
  {
    id: 'french-toast',
    href: 'menu.html#sweet-breakfast',
    photo: 'dessert-french-toast',
    title: 'French toast',
    menuName: 'FRENCH TOAST',
    text:
      'Brioche dipped in cinnamon-vanilla batter, stacked with fresh fruit, ' +
      'cream, butter and maple syrup or Nutella. Order it for the table and ' +
      'pretend you are sharing.',
    group: 'sweet',
  },
  {
    id: 'iced-latte',
    href: 'menu.html#iced-coffee',
    photo: 'drink-iced-latte',
    title: 'Iced latte',
    menuName: 'ICED LATTE',
    text:
      'Espresso poured long over milk and ice. There is a full coffee list ' +
      'behind it — flat white, cortado, Turkish coffee, matcha — plus frappés ' +
      'and shakes when it is warm.',
    group: 'drinks',
  },
];

/**
 * "What we serve" - the four parts of the menu. Each `id` is also a course id
 * in data/menu.mjs, which is where the dish counts and the list links on each
 * card are read from, so they cannot drift from the menu page. `hoverPhoto` is
 * the second photograph behind the card's swap thumbnail. `countNoun` names
 * what is counted (default 'dishes'). Each card's name is its course label in
 * data/menu.mjs.
 */
const allDay = BUSINESS.breakfastAllDay.confirmed;

export const MENU_PANELS = [
  {
    id: 'breakfast',
    // Deliberately not the menemen: that photograph leads the showcase
    // immediately above this section.
    photo: 'food-omelette',
    hoverPhoto: 'food-avocado-eggs',
    text:
      `${allDay ? 'Served until close. ' : ''}Turkish, full English, American, ` +
      'veggie and vegan breakfasts, benedicts, omelettes, set breakfasts and ' +
      'things on toast.',
    href: 'menu.html#breakfast',
  },
  {
    id: 'sweet',
    photo: 'dessert-french-toast',
    hoverPhoto: 'drink-smoothies',
    text:
      'Pancakes, waffles, French toast and granola in the morning; sponge, ' +
      'carrot cake, red velvet, cheesecake and ice cream for the afternoon.',
    href: 'menu.html#sweet-breakfast',
  },
  {
    id: 'drinks',
    photo: 'drink-coolers',
    hoverPhoto: 'drink-strawberry',
    text:
      'A full coffee list, Turkish coffee and tea, herbal teas, frappés, ' +
      'milkshakes, protein shakes, fresh juice and smoothies — plus a bar list.',
    countNoun: 'drinks',
    href: 'menu.html#hot-drinks',
  },
  {
    id: 'lunch',
    photo: 'food-lamb-chops',
    hoverPhoto: 'food-burger',
    text:
      'Lamb chops, shish, köfte, seabass and salmon from the grill. Burgers, ' +
      'panini, wraps, jacket potatoes, homemade pasta, soups and salad bowls.',
    href: 'menu.html#grills',
  },
];

/**
 * Atmosphere - three labels, three real photographs.
 * Nothing here implies a terrace, garden or private room: the copy describes
 * only what the supplied photograph actually shows.
 */
export const ATMOSPHERE = [
  {
    id: 'inside',
    label: 'Inside Hackberries',
    photo: 'venue-room',
    text:
      'Marble tables, velvet chairs in green and blue, rattan pendants and a ' +
      'wall of foliage and white flowers against exposed brick. Bright enough ' +
      'to work in, soft enough to stay in.',
  },
  {
    id: 'coffee',
    label: 'The coffee',
    photo: 'drink-coffee-smoothie',
    text:
      'Iced, hot, Turkish or blended, from flat whites and cortados to ' +
      'frappés and smoothies. Here in front of the foliage wall and the ' +
      'orange neon sign.',
  },
  {
    id: 'table',
    label: 'At the table',
    photo: 'food-omelette',
    text:
      'A folded omelette on the marble, with toasted bread and a dressed side ' +
      'salad. On the menu you choose your own toppings.',
  },
];

/* Read from business.mjs, so a change to the hours or address reaches this
   copy too. "190 Windmill Lane" -> "Windmill Lane"; "07:00" -> "7am". */
const streetName = BUSINESS.address.street.replace(/^\d+\s*/, '');
const weekdays = BUSINESS.hours.groups.find((g) => g.dow.includes(1)) || BUSINESS.hours.groups[0];
const ampm = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
};

/** Editorial rows. Each preview thumbnail is a real photograph. */
export const EDITORIAL_ROWS = [
  {
    id: 'menu',
    title: 'Explore the menu',
    text: `${allDay ? 'Breakfast until close' : 'Breakfasts and brunch plates'}, a grill, and a drinks list that runs long.`,
    href: 'menu.html',
    cta: 'See the full menu',
    photo: 'food-menemen',
  },
  {
    id: 'look',
    title: 'Take a look around',
    text: 'Plates, glasses and the green wall, photographed at the café.',
    href: '#gallery',
    cta: 'See the photos',
    photo: 'drink-strawberry',
  },
  {
    id: 'find',
    title: 'Find your way here',
    text: `${streetName}, ${BUSINESS.locality}. Open from ${ampm(weekdays.opens)} on weekdays.`,
    href: '#visit',
    cta: 'See how to find us',
    photo: 'venue-room',
  },
];

/**
 * "Life at Hackberries" gallery - all ten client photographs.
 *
 * The desktop collage is an EXACT tiling, not auto-placement: each row's
 * column spans add up to 6, and the aspect ratios within a row are chosen so
 * every item in that row resolves to the same height. That leaves no holes,
 * keeps visual order identical to DOM order (so tab order still makes sense),
 * and stays deterministic at every breakpoint.
 *
 *   row 1 (height 3u):  4 + 2
 *   row 2 (height 2u):  2 + 2 + 2
 *   row 3 (height 3u):  2 + 2 + 2
 *   row 4 (height 2u):  3 + 3
 *
 * `role` picks the nearest built derivative; `tilt` is the resting rotation,
 * inside the brief's restrained range.
 */
export const GALLERY = [
  // Row 1
  { photo: 'venue-room',            cols: 4, ar: '4 / 3', role: 'landscape', tilt: -1.4 },
  { photo: 'dessert-french-toast',  cols: 2, ar: '2 / 3', role: 'portrait',  tilt: 1.8 },
  // Row 2
  { photo: 'food-menemen',          cols: 2, ar: '1 / 1', role: 'square',    tilt: -2.2 },
  { photo: 'drink-coolers',         cols: 2, ar: '1 / 1', role: 'square',    tilt: 1.2 },
  { photo: 'food-avocado-eggs',     cols: 2, ar: '1 / 1', role: 'square',    tilt: 2.4 },
  // Row 3
  { photo: 'drink-coffee-smoothie', cols: 2, ar: '2 / 3', role: 'portrait',  tilt: -1.6 },
  { photo: 'drink-smoothies',       cols: 2, ar: '2 / 3', role: 'portrait',  tilt: 2 },
  { photo: 'food-omelette',         cols: 2, ar: '2 / 3', role: 'portrait',  tilt: -1.8 },
  // Row 4
  { photo: 'drink-strawberry',      cols: 3, ar: '3 / 2', role: 'landscape', tilt: 1.5 },
  { photo: 'drink-iced-latte',      cols: 3, ar: '3 / 2', role: 'landscape', tilt: -2.4 },
];
