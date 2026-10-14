// English messages. Keys mirror the original site's next-intl message tree (CLONE_SPEC_partners_ua_legal.md §C.8,
// §E.2, §E.3). Copy for the home / pricing / migration pages is exactly what those components rendered before
// the i18n refactor (CLONE_SPEC.md, CLONE_SPEC_pricing_migration.md).
// Rich text: `<br></br>` is a line break, `<link>…</link>` / `<contact>…</contact>` are rendered by the caller (rich()).
// Plural/ICU messages of the original are stored pre-resolved for the fixed numbers the pages show.

const SOON = 'Soon'

export default {
  locale: 'en',
  numberLocale: 'en-US',

  meta: {
    home: {
      title: 'Vault AI | Finance management app | FP&A Software',
      description:
        'AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs.',
      ogTitle: 'Vault AI | Finance management app',
      twitterTitle: 'Vault AI',
    },
    notFound: {
      title: 'Page not found | Vault AI',
      description: 'The page you are looking for does not exist.',
    },
  },

  nav: {
    homeAriaLabel: 'Vault AI home',
    cta: 'Get started',
    items: { product: 'Product', automation: 'Automation', reports: 'Reports', security: 'Security', pricing: 'Pricing' },
  },
  languageSwitcher: { ariaLabel: 'Language' },
  mobileNav: { openMenu: 'Open menu', closeMenu: 'Close menu' },

  hero: {
    badge: 'Financial management platform',
    headline: 'Control your Business Finances in\u00a0One Place', // NBSP as on the original (CLONE_SPEC.md §2)
    subheadline:
      'AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs.',
    cta: 'Get started',
    imageAlt: 'Vault AI dashboard showing the total balance, a balance chart and recent transactions',
    image: '/assets/img/hero-en-q75.webp',
  },

  scrollColoringText: {
    paragraph:
      'Vault gives you a complete system to track, understand, and automate your business finances bringing transactions, reports, and workflows together in one place',
  },

  productHighlights: {
    soon: SOON,
    cards: {
      'global-financial-ledger': {
        title: 'Global Financial Ledger',
        description: 'A unified system that brings all your financial data into one reliable source of truth.',
        ariaLabel: 'Global Financial Ledger animation',
      },
      'web3-integrations': {
        title: 'Secure Bank & Web3 Integrations',
        description: 'Connect your bank accounts and Web3 wallets through trusted providers like Plaid.',
        ariaLabel: 'Secure Bank and Web3 Integrations animation',
      },
      'custom-financial-reports': {
        title: 'Custom Financial Reports',
        description: 'Go beyond standard P&L - build reports around the metrics that matter to your business.',
        ariaLabel: 'Custom Financial Reports animation',
      },
      'user-management': {
        title: 'User Management',
        description: 'Control access with configurable roles and permissions for your team.',
        ariaLabel: 'User Management animation',
      },
      'workflow-automations': {
        title: 'Workflow Automations',
        description:
          'Automate routine financial tasks with customizable workflows and AI-powered transaction enrichment.',
        ariaLabel: 'Workflow Automations animation',
      },
      'invoice-builder': {
        title: 'Invoice Builder',
        description: 'Create and manage invoices instantly. Keep revenue tracking in one place.',
        ariaLabel: 'Invoice Builder animation',
      },
    },
  },

  featureShowcase: {
    cta: 'Try it free',
    previousAriaLabel: 'Previous feature',
    nextAriaLabel: 'Next feature',
    sections: {
      automation: {
        title: 'Automate financial tasks that used to require manual work',
        description:
          'Set up smart automations and let Vault categorize transactions, enrich financial data, send reports and alerts, and run financial workflows automatically. Save hours of repetitive work every week.',
        tabs: ['Enrich Financial Data', 'Alert on Unusual Expenses', 'Automate Recurring Reports'],
      },
      reports: {
        title: 'Understand your business finances in real time',
        description:
          'Vault transforms transactions into real-time reports that help you understand revenue, expenses, cash flow, and profitability. Go beyond standard P&L - visualize any financial data to make better business decisions.',
        tabs: ['Profit & Loss Overview', 'Expense Breakdown', 'Custom Financial Reports'],
      },
      security: {
        title: 'Built on secure financial infrastructure',
        description:
          'Vault is designed with a reliable financial data architecture, secure integrations, and role-based access control to ensure your data stays accurate and protected.',
        tabs: ['Centralized Financial Ledger', 'Secure Accounts Integrations', 'Role-Based Access Control'],
      },
    },
  },

  processSteps: {
    heading: 'Gain Clarity<br></br>on your Finances',
    cta: 'Get started',
    playStepAriaLabel: 'Play step {step}',
    steps: [
      { header: 'Connect your accounts', description: 'Sign up and securely connect your bank\n accounts and Web3 wallets.' },
      {
        header: 'Structure your data',
        description: 'Set up automations, define revenue and expense\n categories, and create reports tailored to your business.',
      },
      {
        header: 'Turn data into decisions',
        description:
          "Vault transforms raw data into insights that reveal\n what's working, what's changing, and where to focus\n next - so you can act with confidence.",
      },
    ],
  },

  footer: {
    linkedinAriaLabel: 'LinkedIn',
    telegramAriaLabel: 'Vault AI on Telegram',
    email: 'hello@usevault.ai',
    copyright: '© {year} VAULT AI. All rights reserved.',
    builtBy: 'Built by',
    overcodeAriaLabel: 'Overcode (opens in a new tab)',
    legal: { terms: 'Terms of Service', privacy: 'Privacy Policy', dpa: 'DPA' },
    helpCenter: 'Help Center',
    helpCenterUrl: 'https://help.usevault.ai/en/',
    status: 'Status',
    migrationOffer: 'Migration offer',
    partnerProgram: 'Partner program',
    groups: { platform: 'Platform', resources: 'Resources', legal: 'Legal' },
  },

  // ---------------------------------------------------------------- /pricing (CLONE_SPEC_pricing_migration.md §1)
  pricing: {
    meta: {
      title: 'Pricing | Vault AI',
      description:
        'Vault AI plans and pricing: Free, Basic, Pro and Enterprise. Every new workspace starts with a 1-month Pro trial, no credit card required.',
    },
    hero: {
      eyebrow: 'Pricing',
      headline: 'Start free. Upgrade when you need more.',
      subheadline: {
        trial: 'Every new workspace starts with a 1-month Pro trial.',
        noCard: 'No credit card required\u00a0· Cancel anytime.',
      },
    },
    billing: { ariaLabel: 'Billing period', monthly: 'Monthly', annual: 'Annual', annualBadge: '2 months free' },
    price: {
      perSeatMonth: 'per seat / month',
      perSeatMonthAnnual: 'per seat / month, billed annually',
      custom: 'Custom',
    },
    recommended: 'Recommended',
    plans: {
      free: {
        name: 'Free',
        tagline: 'For individuals',
        featuresHeader: null,
        features: ['200 transactions per month', 'Manual entry and CSV import', 'Up to 3 seats'],
      },
      basic: {
        name: 'Basic',
        tagline: 'For small teams',
        featuresHeader: 'Everything in Free, plus:',
        features: [
          '800 transactions per month',
          '2 bank connections',
          'No seat limit',
          'Flexible user access settings',
          'Payment calendar and Cashflow reports',
        ],
      },
      pro: {
        name: 'Pro',
        tagline: 'For growing teams',
        featuresHeader: 'Everything in Basic, plus:',
        features: [
          '1,500 transactions per month',
          '10 bank connections',
          'Crypto wallets',
          'P&L and custom reports',
          'Priority support',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        tagline: 'For larger companies',
        featuresHeader: 'Everything in Pro, plus:',
        features: [
          'Custom transaction volume',
          'Custom number of bank connections',
          'More frequent balance refresh on integrations',
        ],
      },
    },
    cta: { getStarted: 'Get started', startTrial: 'Start free trial', contact: 'Contact us' },
    compare: {
      heading: 'Compare plans',
      caption: 'Compare plans',
      planSelectorAriaLabel: 'Plan to compare',
      featureColumn: 'Feature',
      included: 'Included',
      notIncluded: 'Not included',
      groups: { usage: 'Usage', integrations: 'Integrations', reports: 'Reports', team: 'Team & access', support: 'Support' },
      rows: {
        transactions: 'Transactions per month',
        manualCsv: 'Manual entry & CSV import',
        bankConnections: 'Bank connections',
        cryptoWallets: 'Crypto wallets',
        balanceRefresh: 'Balance refresh',
        paymentCalendar: 'Payment calendar',
        cashflow: 'Cashflow',
        pnl: 'P&L',
        customReports: 'Custom reports',
        seats: 'Seats',
        flexibleAccess: 'Flexible user access settings',
        prioritySupport: 'Priority support',
      },
      values: { custom: 'Custom', standard: 'Standard', moreFrequent: 'More frequent', noLimit: 'No limit', upTo3: 'Up to 3' },
    },
    faq: {
      heading: 'Frequently asked questions',
      items: {
        trial: {
          question: 'What happens after the free trial?',
          answer: 'After one month, you choose Free or Basic, or keep Pro. We ask for card details at that point.',
        },
        noBank: {
          question: 'Can I use Vault without connecting a bank?',
          answer:
            'Yes. On every plan you can add transactions manually or import them from CSV. Bank connections are available from Basic, crypto wallets from Pro.',
        },
        annual: {
          question: 'How does annual billing work?',
          answer: 'You pay for 12 months upfront at a lower monthly rate, about 2 months free.',
        },
        switching: {
          question: 'Switching from another finance tool?',
          answer:
            'Choose an annual plan, and we deduct the cost of the months left on your current subscription from your first invoice. See the <link>migration offer</link>.',
        },
        customPlans: {
          question: 'Do you offer custom plans?',
          answer:
            'Yes. Enterprise plans can have custom transaction volumes and bank connection limits. <contact>Contact us</contact>.',
        },
      },
    },
  },

  // ------------------------------------------------------- /migration-offer (CLONE_SPEC_pricing_migration.md §2)
  migrationOffer: {
    meta: {
      title: 'Migration offer | Vault AI',
      description:
        'Switching from another finance tool? Choose an annual Vault plan, and we deduct the cost of the months left on your current subscription, up to six, from your first invoice.',
    },
    hero: {
      eyebrow: 'Migration offer',
      headline: { start: 'Switch to Vault', end: 'without paying twice' },
      subheadline: {
        question: 'Already paying for a similar finance tool?',
        offer:
          "Choose an annual Vault plan, and we'll deduct the cost of the months left on your current subscription from your first invoice.",
      },
      cta: 'Talk to us',
    },
    mock: {
      currentSubscription: 'Current subscription',
      perMonth: '$45 / month',
      monthsLeft: '4 months left',
      calculation: '4 × $45 = $180',
      costDeducted: 'Cost deducted',
      vaultPro: 'Vault Pro',
      annual: 'Annual',
      firstInvoice: 'First invoice',
      annualPlan: 'Annual plan',
      monthsDeducted: 'Cost of 4 months deducted',
      totalDue: 'Total due',
    },
    offer: {
      heading: { start: "You don't pay for", end: 'two tools at once' },
      paragraphs: {
        overlap:
          "Companies often put off switching not because of the product, but because they're still paying for another tool. So we take the cost of that overlap off your first year.",
        deduction:
          "You choose an annual Vault plan, and the cost of the months left on your current subscription, up to six, is deducted from your first invoice. You start working in Vault right away, and the money you've already paid isn't wasted.",
      },
      chart: {
        caption: 'Example: 4 months left on your current subscription',
        currentTool: 'Current tool',
        vaultPlan: 'Vault, annual plan',
        legend: { current: 'Your current subscription', deducted: 'Cost deducted', paid: 'Paid as usual' },
        note: 'The cost of the overlapping months comes off your first invoice.',
        ariaLabel:
          'Current tool paid for months 1 to 4. Vault annual plan: the cost of months 1 to 4 is deducted, months 5 to 12 are paid as usual.',
      },
    },
    conditions: {
      heading: 'The offer applies if',
      items: {
        newCustomer: { title: 'New customers', description: "You're new to Vault." },
        annualPlan: { title: 'Annual Basic or Pro', description: 'You choose Basic or Pro with annual billing.' },
        activeSubscription: {
          title: 'Active subscription',
          description:
            'You have an active paid subscription to a similar finance tool and can show an invoice or receipt.',
        },
        upToSixMonths: {
          title: 'Up to six months',
          description:
            'We deduct the cost of up to six remaining months, and no more than the cost of six months of your Vault plan.',
        },
        deadline: { title: 'Until 31 December 2026', description: 'You sign your annual plan by 31 December 2026.' },
      },
    },
    faq: {
      heading: 'Frequently asked questions',
      items: {
        tools: {
          question: 'Which tools count?',
          answer:
            "Paid finance management, accounting and reporting tools similar to Vault. If you're not sure, <contact>ask us in the chat</contact>.",
        },
        amount: {
          question: 'How is the amount calculated?',
          answer: [
            'We multiply the monthly price of your current subscription by the months left on it, up to six. For example, with Vault Pro on annual billing ($504 per user):',
            '$45 a month, 4 months left: we deduct $180, and your first invoice is $324.',
            "$100 a month, 6 months left: that's $600, but we deduct no more than the cost of six months of Vault Pro, $252, so your first invoice is $252.",
          ],
        },
        costsMore: {
          question: 'What if my current subscription costs more than Vault?',
          answer:
            'We deduct up to the cost of six months of your Vault plan, so your first invoice is never less than half of the annual price.',
        },
        moreThanSix: { question: 'What if more than six months are left?', answer: 'We deduct the cost of six of them.' },
        trial: {
          question: 'Can I try Vault first?',
          answer: 'Yes. Every new workspace gets a one-month Pro trial. Use the offer when you move to an annual plan.',
        },
        monthlyBilling: { question: 'Does it work with monthly billing?', answer: 'No, the offer is for annual plans only.' },
        moveData: {
          question: 'How do I move my data?',
          answer:
            "Export your transactions as CSV and import them into Vault. You match columns, categories and attributes on one screen, so nothing is retyped by hand. If you need help, we'll go through it with you on a call, so you won't be left to figure it out alone.",
        },
      },
    },
    steps: {
      heading: 'How it works',
      cta: 'Talk to us',
      items: [
        { title: 'Write to us', description: 'Tell us in the chat which tool you use, what it costs and when your subscription ends.' },
        {
          title: 'Show your subscription',
          description: 'Send the invoice or receipt for your current subscription. We review every request individually.',
        },
        {
          title: 'Get your annual invoice',
          description:
            'Choose Basic or Pro with annual billing. The confirmed amount is already deducted from your first invoice.',
        },
        {
          title: 'Move your data',
          description:
            "Import your transaction history and match fields, categories and attributes on the import screen. We'll help on a call if you need it.",
        },
      ],
      visuals: {
        chat: {
          title: 'Vault team',
          online: 'Online',
          userMessage: 'We use another finance tool, and our subscription ends in four months.',
          vaultMessage: "Thanks! Send us the invoice, and we'll deduct the cost of those months from your first annual invoice.",
        },
        upload: { meta: 'Subscription invoice', attached: 'Attached', reviewed: 'Reviewed' },
        import: {
          title: 'Import transactions',
          columnInFile: 'Column in file',
          fieldInVault: 'Field in Vault',
          rows: [
            ['Date', 'Date'],
            ['Description', 'Counterparty'],
            ['Amount', 'Amount'],
            ['Type', 'Category'],
            ['Project', 'Attribute · Project'],
          ],
          matched: '5 of 5 matched',
          action: 'Import',
        },
      },
    },
  },

  // ------------------------------------------------------ /partners (CLONE_SPEC_partners_ua_legal.md §B, §E.2)
  partners: {
    meta: {
      title: 'Partner program | Vault AI',
      description:
        "For accounting firms, CFOs, consultants and teams serving SMBs: refer businesses to Vault, track sign-ups through your invite link and work in your clients' workspaces from one account.",
    },
    hero: {
      eyebrow: 'Partner program',
      headline: { start: 'Bring your clients', end: 'to Vault' },
      subheadline: {
        audience: 'For accounting firms, CFOs, consultants and teams serving SMBs.',
        reward: 'Your clients get clarity on their finances in real time, and you earn a reward for the businesses you bring.',
      },
      cta: 'Become a partner',
    },
    mock: {
      inviteLink: 'Your invite link',
      tracked: 'Sign-ups through it are tracked',
      copy: 'Copy',
      copied: 'Copied',
      viaYourLink: 'Via your link',
      workspaces: 'Workspaces',
      yourWorkspace: 'Your workspace',
      accountant: 'Accountant',
      admin: 'Admin',
      newInvite: 'Accountant · new invite',
      partner: 'Partner',
      paysForVault: 'Pays for Vault',
    },
    audience: {
      heading: "Who it's for",
      items: {
        accountingFirms: {
          title: 'Accounting and fractional CFO firms',
          description: 'Give your clients a live view of their cash and expenses, and work from the same numbers they see.',
        },
        freelanceCfos: {
          title: 'Freelance CFOs',
          description: "Run several clients' finances from one account, with reports built around how each business works.",
        },
        consulting: {
          title: 'Consulting companies',
          description: 'Recommend Vault to clients who need clear finance reporting, and earn a reward for it.',
        },
        saas: {
          title: 'SaaS products',
          description: 'Serve the same small and mid-sized businesses? Refer your users to Vault and add value for them.',
        },
        services: {
          title: 'Service companies',
          description: 'Agencies and service firms whose clients need a clearer view of their finances.',
        },
      },
    },
    statement:
      'The Vault partner program is how we grow together with the people businesses already trust with their finances.',
    value: {
      heading: 'What you and your clients get',
      client: 'Your client',
      company: 'Your company',
      benefits: {
        rewards: {
          title: 'Referral rewards',
          description:
            'Earn a reward when the businesses you bring pay for Vault. We agree the terms with each partner individually.',
        },
        inviteLink: {
          title: 'Personal invite link',
          description: 'Share your own invite link. We see who signed up through you, so every referral counts.',
        },
        workspaces: {
          title: "Your clients' workspaces",
          description:
            "Join your clients' workspaces with the role you need and work with each client's finances from one account.",
        },
      },
      switching: {
        title: 'Already uses a similar tool',
        description:
          'Our migration offer: the cost of the months left on their current subscription comes off their first annual Vault invoice.',
      },
      learnMore: 'Learn more',
      or: 'Or',
      fresh: { title: 'Starting fresh', description: 'An extended free trial and free personal onboarding.' },
      contact:
        "Contact us to discuss the current terms. We'll explain how rewards work and tailor the partnership to your company.",
      cta: 'Become a partner',
    },
    faq: {
      heading: 'Frequently asked questions',
      items: {
        earnings: {
          question: 'How much do partners earn?',
          answer: 'Terms depend on your company and your clients. We agree them individually on an intro call.',
        },
        tracking: {
          question: 'How do you track my referrals?',
          answer:
            'Every partner gets a personal invite link. When a business signs up through it, we see that it came from you and let you know.',
        },
        workspaces: {
          question: "Can I work in my clients' workspaces?",
          answer: 'Yes. Your clients invite you with the role you need, and you work with each of them from one account.',
        },
        clients: {
          question: 'What do my clients get?',
          answer:
            'If they already use a similar tool, our <link>migration offer</link>. If not, an extended free trial and free personal onboarding.',
        },
      },
    },
    steps: {
      heading: 'How to become a partner',
      cta: 'Become a partner',
      items: [
        { title: 'Leave a request', description: 'Tell us about your company and your clients in a short form.' },
        { title: 'Intro call', description: "We discuss your clients, referral terms and how we'll work together." },
        {
          title: 'Get your invite link',
          description: "You get a personal invite link, and you can join your clients' workspaces.",
        },
        { title: 'Earn rewards', description: 'We track sign-ups from your link and pay rewards on the agreed schedule.' },
      ],
      visuals: {
        application: {
          title: 'Partner application',
          ready: 'Ready to send',
          company: 'Company',
          clients: 'Your clients',
          clientsValue: 'Small and mid-sized businesses',
          role: 'You are',
          roleValue: 'Accounting firm',
          send: 'Send',
        },
        introCall: { title: 'Intro call', videoCall: 'Video call', partnerTeam: 'Partner team' },
        referrals: { title: 'Your referrals', scheduled: 'Scheduled' },
      },
    },
  },

  leadForm: {
    fields: { firstName: 'First name', lastName: 'Last name', email: 'Work email', phone: 'Phone' },
    errors: {
      firstName: 'Please enter your First name',
      lastName: 'Please enter your Last name',
      email: 'Please enter your email',
      emailInvalid: 'Email address is invalid',
      phoneRequired: 'Please enter your phone number',
      phoneInvalid: 'Phone number is invalid',
    },
    countrySelectorAriaLabel: 'Country selector',
    contexts: {
      partnerProgram: {
        heading: 'Become a Vault partner',
        description: "Tell us about yourself, and we'll get in touch to discuss the terms.",
        submit: 'Send request',
      },
    },
  },

  popup: {
    success: { title: 'You are in!', body: "Thank you for contacting us.<br></br>We'll be in touch soon with next steps." },
    error: { title: 'Ooops!', body: 'Something went wrong.<br></br>Please try again' },
    close: 'Close',
    loading: 'Loading…',
  },

  // --------------------------------------------------------------------- legal (CLONE_SPEC_partners_ua_legal.md §D)
  legal: {
    terms: {
      title: 'Terms of Service | Vault AI',
      description:
        'The terms governing use of Vault AI, the financial management and planning platform operated by Overcode Limited.',
    },
    privacy: {
      title: 'Privacy Policy | Vault AI',
      description: 'How Vault AI handles personal data, as controller and as processor, and the rights available to you.',
    },
    dpa: {
      title: 'Data Processing Agreement | Vault AI',
      description:
        'The data processing terms between Overcode Limited and Vault AI customers, including sub-processors and international transfers.',
    },
    subprocessors: {
      title: 'Sub-processors | Vault AI',
      description:
        'The third-party providers Vault AI uses to process customer data, their purpose and their location.',
    },
    effectiveDate: 'Effective date: 12 October 2026',
    // CLONE-ONLY placeholder body copy (spec §D: the original legal text is intentionally not reproduced).
    placeholder: {
      paragraph:
        'Placeholder legal text — replace with your own terms. This paragraph only exists so the template’s body style can be reviewed.',
      clause: 'Placeholder clause.',
      clauseText: 'Replace this sentence with the real clause before publishing.',
      emphasis: 'Placeholder emphasis',
      seeSection: 'Placeholder cross-reference: see <link>section {section}</link> on this page.',
      seeAnnex: 'Placeholder cross-reference: see <link>Annex 1</link> on this page.',
      seePage: 'Placeholder link to another document: <link>{label}</link>.',
      listItem: 'Placeholder list item {n} — replace with your own text.',
      cell: 'Placeholder',
      contactLines: ['Placeholder company name', 'Placeholder street address', 'Placeholder city, postcode, country'],
      contactEmail: 'Placeholder contact: <link>hello@usevault.ai</link>',
    },
  },
}
