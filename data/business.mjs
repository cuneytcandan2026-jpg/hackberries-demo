/**
 * Hackberries - business facts.
 *
 * SINGLE SOURCE OF TRUTH. Editing this file updates the header, visit section,
 * footer, menu page and structured data together.
 *
 * `confirmed: false` means the value came from a public listing and has NOT
 * been approved by the owner. Anything unconfirmed is rendered with a visible
 * preview qualifier and is excluded from JSON-LD structured data.
 */

export const STATUS = {
  /** Flip to false only when the client has signed off and the site goes live. */
  isPreview: true,
  previewNote:
    'Concept by Laara Digital. Details and prices are unconfirmed.',
};

export const BUSINESS = {
  name: 'Hackberries',
  // Do not conflate with "Huckleberry", a different business.
  tagline: 'A little more local. A lot more character.',
  locality: 'Cheshunt',

  address: {
    confirmed: false,
    street: '190 Windmill Lane',
    locality: 'Cheshunt',
    region: 'Waltham Cross',
    postcode: 'EN8 9AF',
    country: 'GB',
    get oneLine() {
      return `${this.street}, ${this.locality}, ${this.region} ${this.postcode}`;
    },
  },

  phone: {
    confirmed: false,
    display: '01992 910057',
    href: 'tel:+441992910057',
  },

  /** Search-based directions link: no embed, no API key, no geolocation prompt. */
  directions: {
    confirmed: false,
    label: 'Open in Maps',
    href:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('Hackberries, 190 Windmill Lane, Cheshunt, Waltham Cross EN8 9AF'),
  },

  social: [
    {
      label: 'Instagram',
      handle: '@_hackberries',
      href: 'https://www.instagram.com/_hackberries/',
      confirmed: false,
    },
  ],

  /**
   * From a public profile listing, not owner-approved launch data.
   * `liveStatus` stays false so the site never claims "Open now" from
   * unconfirmed hours. See tools note in content-needed.md.
   */
  hours: {
    confirmed: false,
    liveStatus: false,
    timezone: 'Europe/London',
    groups: [
      // `dow`: JavaScript day numbers (0 = Sunday), so the header can show
      // today's listed hours. It shows the SCHEDULE for today, never a live
      // open/closed status - see liveStatus above.
      { days: 'Monday to Friday', dow: [1, 2, 3, 4, 5], opens: '07:00', closes: '17:00' },
      { days: 'Saturday and Sunday', dow: [6, 0], opens: '08:00', closes: '17:00' },
    ],
  },

  /**
   * The public profile advertises free customer parking, but the conditions
   * are unknown. Rendered as a qualified note, never as a promise.
   */
  parking: {
    confirmed: false,
    note: 'A public listing mentions free customer parking.',
    qualifier: 'Conditions not yet confirmed - please check on arrival.',
  },

  /**
   * No ordering or booking provider has been confirmed. The Uber Eats listing
   * reviewed on 15 September 2026 reported the store as unavailable; that is a
   * platform status, NOT evidence the cafe has closed. Nothing links to it.
   */
  ordering: { available: false },
  booking: { available: false, fallbackLabel: 'Call to enquire' },

  /**
   * Contact forms (contact.html and the pop-up on every page).
   *
   * Submissions go through Web3Forms, which emails them to the café. Create a
   * free account at web3forms.com, verify the café's inbox as the
   * destination, and paste the Access Key it gives you below (it is meant to
   * be public - it only says where mail gets delivered, not who can send).
   * While it is empty the forms still validate, but say plainly that nothing
   * was sent.
   *
   * A table request is exactly that - a REQUEST. There is no booking system,
   * so the copy never says "booked" and the café confirms by phone or email.
   */
  contact: {
    accessKey: '',
    /** Party size at which a table request becomes a private-hire enquiry. Unconfirmed. */
    privateHireFrom: 12,
    /** Minutes before closing that the last table request slot is offered. */
    lastSlotBeforeClose: 60,
    messageTopics: [
      'General question',
      'Allergens and dietary needs',
      'Feedback',
      'Lost property',
      'Something else',
    ],
    hireOccasions: [
      'Birthday',
      'Baby shower',
      'Christening or family gathering',
      'Work breakfast or lunch',
      'Something else',
    ],
    hireTimes: ['Morning', 'Lunchtime', 'Afternoon', 'Flexible'],
  },
};

/** Primary actions, per the brief. No ordering or booking CTA. */
export const ACTIONS = {
  primary: { label: 'View menu', href: 'menu.html' },
  secondary: { label: 'Visit us', href: '#visit' },
};

export const NAV = [
  { label: 'Menu', href: 'menu.html', section: null },
  { label: 'The café', href: '#the-cafe', section: 'the-cafe' },
  { label: 'Gallery', href: '#gallery', section: 'gallery' },
  { label: 'Contact us', href: '#contact-us', section: 'contact-us' },
  { label: 'Visit us', href: '#visit', section: 'visit' },
];
