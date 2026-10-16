// Legal page outlines (CLONE_SPEC_partners_ua_legal.md §D.5): the real h1/h2/h3 headings and ids, plus where the
// original has a table / list / contact block. The BODY is placeholder copy (spec §D: the original legal text is
// intentionally not reproduced); see LegalPage.jsx and legal.placeholder in src/i18n.
//
// Block types: h2 {id, text, body?: [...]}, h3 {id, text, body?}. Body entries: 'p' (placeholder clause),
// 'em' (paragraph with <em>), {table: [columns], rows}, 'ul', {link: 'section'|'annex'|'page', ...}, 'contact'.
// Headings are English on /ua too: the spec records only the EN outline (gap flagged in the handoff).

const sec = (n, text, body = ['p']) => ({ type: 'h2', id: String(n), text: `${n}. ${text}`, body })
const sub = (id, text, body = ['p']) => ({ type: 'h3', id, text: `${id} ${text}`, body })

export const LEGAL_DOCS = {
  terms: {
    h1: { id: 'terms-of-service', text: 'Terms of Service' },
    blocks: [
      sec(1, 'About these Terms', ['p', { link: 'page', to: '/privacy', label: 'privacy' }]),
      sec(2, 'Definitions'),
      sec(3, 'Eligibility'),
      sec(4, 'Accounts and Workspaces', ['p', 'em']),
      sec(5, 'Plans, Seats and Payment', ['p', { table: ['Plan', 'Price', 'Transactions / month', 'Bank accounts'], rows: 4 }]),
      sec(6, 'What the Service Is, and What It Is Not'),
      sec(7, 'Bank Connections, Wallets and Third-Party Data'),
      sec(8, 'Your Obligations and Acceptable Use', ['p', 'ul']),
      sec(9, 'Data Protection', ['p', { link: 'page', to: '/dpa', label: 'dpa' }]),
      sec(10, 'Availability and Support'),
      sec(11, 'Intellectual Property'),
      sec(12, 'Suspension, Termination, Export and Deletion', ['p', 'ul', { link: 'section', section: '8' }]),
      sec(13, 'Warranties and Disclaimers'),
      sec(14, 'Limitation of Liability', ['p', 'ul']),
      sec(15, 'Changes to These Terms'),
      sec(16, 'General'),
      sec(17, 'Governing Law and Jurisdiction'),
      sec(18, 'Contact', ['contact']),
    ],
  },
  privacy: {
    h1: { id: 'privacy-policy', text: 'Privacy Policy' },
    blocks: [
      sec(1, 'Who we are'),
      sec(2, 'Two different roles', ['p', { link: 'page', to: '/dpa', label: 'dpa' }]),
      sec(3, 'Data we process as controller', []),
      sub('3.1', 'Account data', ['p', { table: ['What', 'Why', 'Lawful basis'], rows: 2 }]),
      sub('3.2', 'Billing data', ['p', { table: ['What', 'Why', 'Lawful basis'], rows: 2 }]),
      sub('3.3', 'Usage and technical data', ['p', { table: ['What', 'Why', 'Lawful basis'], rows: 2 }]),
      sub('3.4', 'Marketing', ['p', 'em']),
      sec(4, 'Data we process as processor'),
      sec(5, 'Bank and wallet connections'),
      sec(6, 'Who we share data with', ['p', { table: ['Provider', 'Purpose', 'Location'], rows: 3 }]),
      sec(7, 'International transfers'),
      sec(8, 'How long we keep data', ['p', { table: ['Data', 'Retention'], rows: 3 }]),
      sec(9, 'Security'),
      sec(10, 'Your rights', ['p', 'ul', { link: 'section', section: '15' }]),
      sec(11, 'Automated decision-making'),
      sec(12, 'Cookies'),
      sec(13, 'Children'),
      sec(14, 'Changes to this policy'),
      sec(15, 'Contact', ['contact']),
    ],
  },
  dpa: {
    h1: { id: 'data-processing-agreement', text: 'Data Processing Agreement' },
    // dpa: a preamble paragraph (mt-10) directly after the first hr, before section 1 (spec §D.2).
    preamble: [{ link: 'page', to: '/subprocessors', label: 'subprocessors' }],
    blocks: [
      sec(1, 'Definitions'),
      sec(2, 'Roles of the parties'),
      sec(3, 'Scope of processing', []),
      sub('3.1', 'Subject matter and duration'),
      sub('3.2', 'Nature and purpose'),
      sub('3.3', 'Types of Personal Data', ['p', 'ul']),
      sub('3.4', 'Categories of Data Subjects'),
      sec(4, 'Our obligations', ['p', { link: 'annex' }]),
      sec(5, 'Sub-processors', ['p', { link: 'page', to: '/subprocessors', label: 'subprocessors' }]),
      sec(6, 'Data Subject requests'),
      sec(7, 'Audit and compliance'),
      sec(8, 'International transfers'),
      sec(9, 'Retention and deletion'),
      sec(10, 'Liability'),
      sec(11, 'General'),
      { type: 'h2', id: 'annex-1', text: 'Annex 1 — Technical and organisational measures', body: ['p', 'ul'] },
      {
        type: 'h2',
        id: 'annex-2',
        text: 'Annex 2 — Sub-processors',
        body: ['p', { table: ['Sub-processor', 'Purpose', 'Location'], rows: 3 }],
      },
      { type: 'h2', id: 'contact', text: 'Contact', body: ['contact'] },
    ],
  },
  // Not specced (§E: "/subprocessors was not specced"); linked from the DPA, so it gets a placeholder page on the
  // same template: h1 from the meta title, one placeholder paragraph and the DPA Annex 2 table columns.
  subprocessors: {
    h1: { id: 'sub-processors', text: 'Sub-processors' },
    intro: ['p', { table: ['Sub-processor', 'Purpose', 'Location'], rows: 3 }, { link: 'page', to: '/dpa', label: 'dpa' }],
    blocks: [],
  },
}

