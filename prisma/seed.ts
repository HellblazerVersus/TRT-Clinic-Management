import { PrismaClient, ProtocolStatus, RenewalStatus, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays, subMonths, addMonths } from 'date-fns';

const prisma = new PrismaClient();

const TODAY = new Date();

// ─── Reference ranges ────────────────────────────────────────────────────────
const REF = {
  total_T:     { min: 400,  max: 1000, unit: 'ng/dL',  label: 'Total Testosterone' },
  free_T:      { min: 9,    max: 30,   unit: 'pg/mL',  label: 'Free Testosterone' },
  hematocrit:  { min: 38.5, max: 50,   unit: '%',      label: 'Hematocrit' },
  estradiol:   { min: 10,   max: 40,   unit: 'pg/mL',  label: 'Estradiol' },
  psa:         { min: 0,    max: 4,    unit: 'ng/mL',  label: 'PSA' },
  igf1:        { min: 100,  max: 300,  unit: 'ng/mL',  label: 'IGF-1' },
  lh:          { min: 1.5,  max: 9.3,  unit: 'mIU/mL', label: 'LH' },
  fsh:         { min: 1.5,  max: 12.4, unit: 'mIU/mL', label: 'FSH' },
};

function flagged(marker: keyof typeof REF, value: number) {
  const { min, max } = REF[marker];
  return value < min || value > max;
}

// ─── Compounds ────────────────────────────────────────────────────────────────
const COMPOUNDS = [
  { compound: 'testosterone_cypionate', label: 'Testosterone Cypionate 200mg/mL', dose: '100mg', freq: 'twice_weekly', route: 'IM injection', schedClass: 'III' },
  { compound: 'testosterone_enanthate', label: 'Testosterone Enanthate 200mg/mL', dose: '150mg', freq: 'weekly', route: 'IM injection', schedClass: 'III' },
  { compound: 'sermorelin',             label: 'Sermorelin 2mg/vial',             dose: '300mcg', freq: 'nightly', route: 'subcutaneous', schedClass: 'N/A' },
  { compound: 'pt141',                  label: 'PT-141 (Bremelanotide) 10mg',     dose: '1.75mg', freq: 'as_needed', route: 'subcutaneous', schedClass: 'N/A' },
  { compound: 'anastrozole',            label: 'Anastrozole 1mg',                 dose: '0.5mg', freq: 'twice_weekly', route: 'oral', schedClass: 'N/A' },
  { compound: 'hcg',                    label: 'HCG 10,000 IU/vial',              dose: '500 IU', freq: 'twice_weekly', route: 'subcutaneous', schedClass: 'III' },
];

const PRESCRIBERS = ['Dr. Sarah Mitchell, MD', 'Dr. James Ortega, DO', 'Dr. Priya Nair, MD'];

interface PatientDef {
  name: string;
  phone: string;
  email: string;
  dob: Date;
  intakeDaysAgo: number;
  consentSigned: boolean;
  subscriptionStatus: SubscriptionStatus;
  protocols: { compoundIdx: number; startDaysAgo: number; nextDoseDaysFromNow: number; status: ProtocolStatus }[];
  labs: { marker: keyof typeof REF; value: number; daysAgo: number }[];
  renewals: { compoundIdx: number; renewalDaysFromNow: number; status: RenewalStatus; dispensed?: boolean }[];
  scenario: string; // for our own docs
}

const PATIENTS: PatientDef[] = [
  // ── 5 overdue-dose patients ────────────────────────────────────────────────
  {
    name: 'Marcus Webb', phone: '+15551001001', email: 'marcus.webb@email.com',
    dob: new Date('1978-03-15'), intakeDaysAgo: 180, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'overdue dose',
    protocols: [{ compoundIdx: 0, startDaysAgo: 180, nextDoseDaysFromNow: -5, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 850, daysAgo: 90 },
      { marker: 'free_T', value: 18, daysAgo: 90 },
      { marker: 'hematocrit', value: 46, daysAgo: 90 },
      { marker: 'estradiol', value: 28, daysAgo: 90 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 25, status: 'PENDING', dispensed: false }],
  },
  {
    name: 'Derek Holman', phone: '+15551001002', email: 'derek.holman@email.com',
    dob: new Date('1985-07-22'), intakeDaysAgo: 90, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'overdue dose + renewal soon',
    protocols: [{ compoundIdx: 1, startDaysAgo: 90, nextDoseDaysFromNow: -3, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 720, daysAgo: 45 },
      { marker: 'free_T', value: 15, daysAgo: 45 },
      { marker: 'hematocrit', value: 48, daysAgo: 45 },
    ],
    renewals: [{ compoundIdx: 1, renewalDaysFromNow: 2, status: 'PENDING' }],
  },
  {
    name: 'Anthony Reyes', phone: '+15551001003', email: 'anthony.reyes@email.com',
    dob: new Date('1972-11-08'), intakeDaysAgo: 365, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'overdue dose, also on sermorelin',
    protocols: [
      { compoundIdx: 0, startDaysAgo: 365, nextDoseDaysFromNow: -7, status: 'ACTIVE' },
      { compoundIdx: 2, startDaysAgo: 200, nextDoseDaysFromNow: -1, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 900, daysAgo: 120 },
      { marker: 'igf1', value: 220, daysAgo: 120 },
      { marker: 'free_T', value: 22, daysAgo: 120 },
      { marker: 'estradiol', value: 35, daysAgo: 120 },
    ],
    renewals: [
      { compoundIdx: 0, renewalDaysFromNow: 10, status: 'PENDING' },
      { compoundIdx: 2, renewalDaysFromNow: 30, status: 'PENDING' },
    ],
  },
  {
    name: 'Brian Kowalski', phone: '+15551001004', email: 'brian.k@email.com',
    dob: new Date('1969-05-30'), intakeDaysAgo: 500, consentSigned: true,
    subscriptionStatus: 'PAST_DUE',
    scenario: 'overdue dose + past due billing',
    protocols: [{ compoundIdx: 0, startDaysAgo: 500, nextDoseDaysFromNow: -2, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 780, daysAgo: 60 },
      { marker: 'hematocrit', value: 51.5, daysAgo: 60 }, // flagged
      { marker: 'psa', value: 1.2, daysAgo: 60 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: -5, status: 'OVERDUE' }],
  },
  {
    name: 'Gerald Frost', phone: '+15551001005', email: 'g.frost@email.com',
    dob: new Date('1963-09-14'), intakeDaysAgo: 730, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'long-term patient, dose 1 day overdue',
    protocols: [
      { compoundIdx: 5, startDaysAgo: 730, nextDoseDaysFromNow: -1, status: 'ACTIVE' },
      { compoundIdx: 4, startDaysAgo: 730, nextDoseDaysFromNow: -1, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 950, daysAgo: 30 },
      { marker: 'free_T', value: 25, daysAgo: 30 },
      { marker: 'estradiol', value: 22, daysAgo: 30 },
      { marker: 'lh', value: 0.2, daysAgo: 30 }, // suppressed, expected on TRT
    ],
    renewals: [{ compoundIdx: 5, renewalDaysFromNow: 15, status: 'PENDING' }],
  },

  // ── 4 renewals due very soon ───────────────────────────────────────────────
  {
    name: 'Jason Mercer', phone: '+15551002001', email: 'jason.mercer@email.com',
    dob: new Date('1982-01-19'), intakeDaysAgo: 240, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'renewal due tomorrow',
    protocols: [{ compoundIdx: 0, startDaysAgo: 240, nextDoseDaysFromNow: 3, status: 'ACTIVE' }],
    labs: [{ marker: 'total_T', value: 830, daysAgo: 75 }, { marker: 'free_T', value: 19, daysAgo: 75 }],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 1, status: 'PENDING' }],
  },
  {
    name: 'Carlos Mendez', phone: '+15551002002', email: 'c.mendez@email.com',
    dob: new Date('1977-04-03'), intakeDaysAgo: 150, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'renewal due in 2 days',
    protocols: [
      { compoundIdx: 1, startDaysAgo: 150, nextDoseDaysFromNow: 5, status: 'ACTIVE' },
      { compoundIdx: 2, startDaysAgo: 60, nextDoseDaysFromNow: 0, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 690, daysAgo: 60 },
      { marker: 'igf1', value: 195, daysAgo: 60 },
    ],
    renewals: [{ compoundIdx: 1, renewalDaysFromNow: 2, status: 'PENDING' }],
  },
  {
    name: 'Nathaniel Brooks', phone: '+15551002003', email: 'n.brooks@email.com',
    dob: new Date('1990-08-27'), intakeDaysAgo: 60, consentSigned: true,
    subscriptionStatus: 'TRIALING',
    scenario: 'new patient, renewal due in 3 days',
    protocols: [{ compoundIdx: 0, startDaysAgo: 60, nextDoseDaysFromNow: 2, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 280, daysAgo: 65 }, // was low, now on TRT
      { marker: 'free_T', value: 6.5, daysAgo: 65 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 3, status: 'PENDING' }],
  },
  {
    name: 'Victor Osei', phone: '+15551002004', email: 'v.osei@email.com',
    dob: new Date('1975-12-05'), intakeDaysAgo: 400, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'renewal today (due = 0 days)',
    protocols: [{ compoundIdx: 0, startDaysAgo: 400, nextDoseDaysFromNow: 1, status: 'ACTIVE' }],
    labs: [{ marker: 'total_T', value: 760, daysAgo: 50 }, { marker: 'hematocrit', value: 47.2, daysAgo: 50 }],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 0, status: 'PENDING' }],
  },

  // ── 3 flagged labs ────────────────────────────────────────────────────────
  {
    name: 'Raymond Chu', phone: '+15551003001', email: 'r.chu@email.com',
    dob: new Date('1967-02-28'), intakeDaysAgo: 600, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'supra-physiologic T + high hematocrit',
    protocols: [{ compoundIdx: 0, startDaysAgo: 600, nextDoseDaysFromNow: 4, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 1350, daysAgo: 15 }, // flagged
      { marker: 'hematocrit', value: 53.2, daysAgo: 15 }, // flagged
      { marker: 'estradiol', value: 58, daysAgo: 15 }, // flagged
      { marker: 'psa', value: 1.8, daysAgo: 15 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 20, status: 'PENDING' }],
  },
  {
    name: 'Daniel Whitmore', phone: '+15551003002', email: 'd.whitmore@email.com',
    dob: new Date('1984-06-11'), intakeDaysAgo: 120, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'low T on current protocol, dose adjustment needed',
    protocols: [{ compoundIdx: 0, startDaysAgo: 120, nextDoseDaysFromNow: 5, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 310, daysAgo: 10 }, // flagged low
      { marker: 'free_T', value: 7.2, daysAgo: 10 }, // flagged low
      { marker: 'estradiol', value: 18, daysAgo: 10 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 45, status: 'PENDING' }],
  },
  {
    name: 'Frank Ingram', phone: '+15551003003', email: 'f.ingram@email.com',
    dob: new Date('1960-10-17'), intakeDaysAgo: 900, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'elevated PSA, needs follow-up',
    protocols: [{ compoundIdx: 0, startDaysAgo: 900, nextDoseDaysFromNow: 6, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 820, daysAgo: 20 },
      { marker: 'psa', value: 5.8, daysAgo: 20 }, // flagged
      { marker: 'hematocrit', value: 47.5, daysAgo: 20 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 30, status: 'PENDING' }],
  },

  // ── 3 lapsed billing ─────────────────────────────────────────────────────
  {
    name: 'Steven Park', phone: '+15551004001', email: 's.park@email.com',
    dob: new Date('1988-04-22'), intakeDaysAgo: 200, consentSigned: true,
    subscriptionStatus: 'CANCELED',
    scenario: 'canceled subscription, protocol paused',
    protocols: [{ compoundIdx: 0, startDaysAgo: 200, nextDoseDaysFromNow: 0, status: 'PAUSED' }],
    labs: [{ marker: 'total_T', value: 650, daysAgo: 100 }],
    renewals: [],
  },
  {
    name: 'Timothy Grant', phone: '+15551004002', email: 't.grant@email.com',
    dob: new Date('1973-08-09'), intakeDaysAgo: 300, consentSigned: true,
    subscriptionStatus: 'PAST_DUE',
    scenario: 'past due billing, renewal overdue',
    protocols: [{ compoundIdx: 1, startDaysAgo: 300, nextDoseDaysFromNow: 2, status: 'ACTIVE' }],
    labs: [{ marker: 'total_T', value: 710, daysAgo: 80 }],
    renewals: [{ compoundIdx: 1, renewalDaysFromNow: -10, status: 'OVERDUE' }],
  },
  {
    name: 'Harold Simmons', phone: '+15551004003', email: 'h.simmons@email.com',
    dob: new Date('1956-01-30'), intakeDaysAgo: 800, consentSigned: false,
    subscriptionStatus: 'UNPAID',
    scenario: 'unpaid, consent not signed',
    protocols: [{ compoundIdx: 0, startDaysAgo: 800, nextDoseDaysFromNow: 10, status: 'ACTIVE' }],
    labs: [{ marker: 'total_T', value: 900, daysAgo: 45 }],
    renewals: [],
  },

  // ── 5 fully up-to-date / healthy ─────────────────────────────────────────
  {
    name: 'Michael Torres', phone: '+15551005001', email: 'm.torres@email.com',
    dob: new Date('1986-03-12'), intakeDaysAgo: 270, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'all green, model patient',
    protocols: [
      { compoundIdx: 0, startDaysAgo: 270, nextDoseDaysFromNow: 3, status: 'ACTIVE' },
      { compoundIdx: 4, startDaysAgo: 270, nextDoseDaysFromNow: 3, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 760, daysAgo: 30 },
      { marker: 'free_T', value: 17, daysAgo: 30 },
      { marker: 'estradiol', value: 25, daysAgo: 30 },
      { marker: 'hematocrit', value: 44.5, daysAgo: 30 },
      { marker: 'psa', value: 0.8, daysAgo: 30 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 30, status: 'PENDING' }],
  },
  {
    name: 'Kevin Walsh', phone: '+15551005002', email: 'k.walsh@email.com',
    dob: new Date('1980-07-04'), intakeDaysAgo: 450, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'all green, multiple compounds',
    protocols: [
      { compoundIdx: 0, startDaysAgo: 450, nextDoseDaysFromNow: 5, status: 'ACTIVE' },
      { compoundIdx: 2, startDaysAgo: 300, nextDoseDaysFromNow: 1, status: 'ACTIVE' },
      { compoundIdx: 3, startDaysAgo: 200, nextDoseDaysFromNow: 14, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 880, daysAgo: 45 },
      { marker: 'igf1', value: 255, daysAgo: 45 },
      { marker: 'free_T', value: 21, daysAgo: 45 },
      { marker: 'estradiol', value: 30, daysAgo: 45 },
    ],
    renewals: [
      { compoundIdx: 0, renewalDaysFromNow: 45, status: 'PENDING' },
      { compoundIdx: 2, renewalDaysFromNow: 60, status: 'PENDING' },
    ],
  },
  {
    name: 'David Nguyen', phone: '+15551005003', email: 'd.nguyen@email.com',
    dob: new Date('1992-11-25'), intakeDaysAgo: 30, consentSigned: true,
    subscriptionStatus: 'TRIALING',
    scenario: 'brand new patient, trial period, all good',
    protocols: [{ compoundIdx: 0, startDaysAgo: 30, nextDoseDaysFromNow: 7, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 230, daysAgo: 35 }, // pre-TRT baseline (flagged)
      { marker: 'free_T', value: 5.1, daysAgo: 35 }, // flagged baseline
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 60, status: 'PENDING' }],
  },
  {
    name: 'Eric Chandler', phone: '+15551005004', email: 'e.chandler@email.com',
    dob: new Date('1970-09-18'), intakeDaysAgo: 550, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'stable long-term, great labs',
    protocols: [
      { compoundIdx: 1, startDaysAgo: 550, nextDoseDaysFromNow: 6, status: 'ACTIVE' },
      { compoundIdx: 5, startDaysAgo: 400, nextDoseDaysFromNow: 4, status: 'ACTIVE' },
    ],
    labs: [
      { marker: 'total_T', value: 810, daysAgo: 25 },
      { marker: 'free_T', value: 20, daysAgo: 25 },
      { marker: 'hematocrit', value: 45.8, daysAgo: 25 },
      { marker: 'estradiol', value: 27, daysAgo: 25 },
      { marker: 'lh', value: 0.3, daysAgo: 25 },
    ],
    renewals: [{ compoundIdx: 1, renewalDaysFromNow: 40, status: 'PENDING' }],
  },
  {
    name: 'Robert Fleming', phone: '+15551005005', email: 'r.fleming@email.com',
    dob: new Date('1965-06-07'), intakeDaysAgo: 1000, consentSigned: true,
    subscriptionStatus: 'ACTIVE',
    scenario: 'longest-standing patient, annual history of labs',
    protocols: [{ compoundIdx: 0, startDaysAgo: 1000, nextDoseDaysFromNow: 3, status: 'ACTIVE' }],
    labs: [
      { marker: 'total_T', value: 920, daysAgo: 14 },
      { marker: 'total_T', value: 870, daysAgo: 120 },
      { marker: 'total_T', value: 730, daysAgo: 240 },
      { marker: 'total_T', value: 610, daysAgo: 360 },
      { marker: 'free_T', value: 23, daysAgo: 14 },
      { marker: 'hematocrit', value: 46.1, daysAgo: 14 },
      { marker: 'psa', value: 1.4, daysAgo: 14 },
    ],
    renewals: [{ compoundIdx: 0, renewalDaysFromNow: 20, status: 'PENDING' }],
  },
];

async function main() {
  console.log('🌱 Seeding TRT clinic database...');

  // ── Create admin user ──────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: {},
    create: {
      email: 'admin@clinic.com',
      hashedPassword,
      name: 'Clinic Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@clinic.com / admin123');

  // ── Seed patients ──────────────────────────────────────────────────────────
  let count = 0;
  for (const def of PATIENTS) {
    const patient = await prisma.patient.create({
      data: {
        name: def.name,
        phone: def.phone,
        email: def.email,
        dateOfBirth: def.dob,
        intakeDate: subDays(TODAY, def.intakeDaysAgo),
        consentSigned: def.consentSigned,
        consentSignedAt: def.consentSigned ? subDays(TODAY, def.intakeDaysAgo) : null,
        subscriptionStatus: def.subscriptionStatus,
        stripeCustomerId: `cus_demo_${def.phone.slice(-7)}`,
        stripeSubscriptionId: def.subscriptionStatus !== 'NONE' ? `sub_demo_${def.phone.slice(-7)}` : null,
        nextBillingDate: def.subscriptionStatus === 'ACTIVE' || def.subscriptionStatus === 'TRIALING'
          ? addMonths(TODAY, 1) : null,
        labDueDate: addDays(subDays(TODAY, def.intakeDaysAgo), 90), // every 90 days
        baselineLabs: { note: 'Baseline drawn at intake' },
      },
    });

    // Protocols
    for (const p of def.protocols) {
      const comp = COMPOUNDS[p.compoundIdx];
      const prescriber = PRESCRIBERS[count % PRESCRIBERS.length];
      await prisma.protocol.create({
        data: {
          patientId: patient.id,
          compound: comp.compound,
          compoundLabel: comp.label,
          dose: comp.dose,
          frequency: comp.freq,
          route: comp.route,
          startDate: subDays(TODAY, p.startDaysAgo),
          nextDoseDate: addDays(TODAY, p.nextDoseDaysFromNow),
          status: p.status,
          prescriber,
        },
      });
    }

    // Lab results (oldest to newest)
    const sortedLabs = [...def.labs].sort((a, b) => b.daysAgo - a.daysAgo);
    for (const lab of sortedLabs) {
      const ref = REF[lab.marker];
      await prisma.labResult.create({
        data: {
          patientId: patient.id,
          marker: lab.marker,
          markerLabel: ref.label,
          value: lab.value,
          unit: ref.unit,
          date: subDays(TODAY, lab.daysAgo),
          flagged: flagged(lab.marker, lab.value),
          referenceMin: ref.min,
          referenceMax: ref.max,
          labName: count % 2 === 0 ? 'LabCorp' : 'Quest Diagnostics',
        },
      });
    }

    // Rx Renewals
    for (const r of def.renewals) {
      const comp = COMPOUNDS[r.compoundIdx];
      const prescriber = PRESCRIBERS[count % PRESCRIBERS.length];
      const dispensedDate = r.dispensed !== false
        ? subDays(addDays(TODAY, r.renewalDaysFromNow), 90)
        : null;
      await prisma.rxRenewal.create({
        data: {
          patientId: patient.id,
          compound: comp.compound,
          compoundLabel: comp.label,
          quantity: '10mL vial',
          prescriber,
          scheduleClass: comp.schedClass,
          renewalDueDate: addDays(TODAY, r.renewalDaysFromNow),
          status: r.status,
          dispenseDate: dispensedDate,
          deaLotNumber: r.status === 'DISPENSED' ? `LOT-${Math.floor(Math.random() * 90000) + 10000}` : null,
          pharmacyName: 'Empower Pharmacy',
        },
      });
    }

    count++;
    console.log(`  ✓ ${def.name} [${def.scenario}]`);
  }

  console.log(`\n🎉 Seeded ${PATIENTS.length} patients successfully!`);
  console.log('   Login: admin@clinic.com / admin123');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
