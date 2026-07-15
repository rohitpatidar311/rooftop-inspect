import type { TechJob } from '../api/types'

const sharedServices = [
  { id: 'filter', label: 'Filter replacement', doneLabel: 'Done' as const },
  { id: 'coil', label: 'Coil cleaning', doneLabel: 'Done' as const },
  { id: 'belt', label: 'Belt inspection', doneLabel: 'OK' as const },
]

const sharedRoofChecks = [
  {
    id: 'hatch',
    group: 'Access & Safety',
    label: 'Roof hatch functioning properly',
  },
  {
    id: 'ladder',
    group: 'Access & Safety',
    label: 'Ladder access secured',
  },
  {
    id: 'trip',
    group: 'Access & Safety',
    label: 'No tripping hazards',
  },
  {
    id: 'loose',
    group: 'Housekeeping',
    label: 'No loose materials or abandoned equipment',
  },
  {
    id: 'ponding',
    group: 'Drainage',
    label: 'No standing / ponding water',
  },
  {
    id: 'gutters',
    group: 'Drainage',
    label: 'Gutters / drains not clogged',
  },
  {
    id: 'membrane',
    group: 'Membrane',
    label: 'No surface deterioration or membrane slippage',
  },
  {
    id: 'punctures',
    group: 'Membrane',
    label: 'No punctures, tears, or cuts',
  },
]

const sharedExceptions = [
  { id: 'electrical', category: 'Electrical', label: 'Electrical issue observed' },
  { id: 'icing', category: 'Refrigeration', label: 'Unit frozen over / icing' },
  {
    id: 'recharge',
    category: 'Refrigeration',
    label: 'Refrigerant recharge may be needed',
  },
  {
    id: 'enclosure',
    category: 'Enclosure',
    label: 'Damaged door / cover / panel',
  },
]

export const mockTechJobs: TechJob[] = [
  {
    id: 'job-101',
    siteName: 'Sunoco Maple Avenue',
    address: 'Maple Ave',
    status: 'scheduled',
    serviceTags: ['filter', 'belt'],
    latitude: 40.7484,
    longitude: -73.9857,
    units: [
      {
        id: 'unit-1',
        model: 'Carrier 48TCDD06A2M6',
        consensusPercent: 94,
        confirmed: false,
      },
      {
        id: 'unit-2',
        model: 'Trane YSC060A3RHA0',
        consensusPercent: 88,
        confirmed: false,
      },
      {
        id: 'unit-3',
        model: 'Lennox LGH060H4BS1',
        consensusPercent: 91,
        confirmed: false,
      },
    ],
    services: sharedServices,
    roofChecks: sharedRoofChecks,
    exceptions: sharedExceptions,
    aiSuggestions: [
      {
        id: 'ai-1',
        title: 'Ponding near drain #2',
        detail: 'Photo match suggests drainage blockage — confirm severity.',
      },
      {
        id: 'ai-2',
        title: 'Filter due for replacement',
        detail: 'Unit-1 runtime exceeds filter interval.',
      },
    ],
  },
  {
    id: 'job-102',
    siteName: 'Chevron Broad Street',
    address: 'Broad St',
    status: 'in_progress',
    serviceTags: ['filter', 'coil', 'belt'],
    latitude: 40.7492,
    longitude: -73.9868,
    units: [
      {
        id: 'unit-1',
        model: 'Carrier 48TCDD06A2M6',
        consensusPercent: 92,
        confirmed: false,
      },
      {
        id: 'unit-2',
        model: 'York ZF150',
        consensusPercent: 85,
        confirmed: false,
      },
    ],
    services: sharedServices,
    roofChecks: sharedRoofChecks,
    exceptions: sharedExceptions,
    aiSuggestions: [
      {
        id: 'ai-1',
        title: 'Membrane wear at SE corner',
        detail: 'Edge wear detected — mark Pass/Fail and attach photo if Fail.',
      },
    ],
  },
  {
    id: 'job-103',
    siteName: 'Kroger Distribution',
    address: 'Industrial Pkwy',
    status: 'scheduled',
    serviceTags: ['filter', 'coil'],
    latitude: 40.7478,
    longitude: -73.9845,
    units: [
      {
        id: 'unit-1',
        model: 'Carrier 48TCDD06A2M6',
        consensusPercent: 90,
        confirmed: false,
      },
      {
        id: 'unit-2',
        model: 'Rheem RKNL-B060',
        consensusPercent: 87,
        confirmed: false,
      },
      {
        id: 'unit-3',
        model: 'Aaon RN-007',
        consensusPercent: 93,
        confirmed: false,
      },
    ],
    services: sharedServices,
    roofChecks: sharedRoofChecks,
    exceptions: sharedExceptions,
    aiSuggestions: [
      {
        id: 'ai-1',
        title: 'Icing risk on Unit-2',
        detail: 'Low suction indicators — check refrigeration exceptions.',
      },
    ],
  },
]
