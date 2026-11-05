/* Strykon projects, shown on projects.html (all) and the home page (latest three).

   The easy way to add projects is the "Add a project" Google Form (see docs/google-setup.md):
   no code and no re-upload. Projects written here show alongside those from the form.

   TO ADD A PROJECT HERE
   1. Put its photos in a new folder, e.g. assets/projects/gachibowli-box-cricket/ (JPG or WebP, about 1600 px wide).
   2. Copy one of the blocks below (from { to },), paste it at the top of the list and change the values.
   3. Save, check projects.html in your browser, then upload the site again (see README.md).

   category: sports | residential | commercial | civil | solar | railway
   court:    for sports projects without photos, the drawing to show:
             football | boxcricket | pickleball | padel | tennis | badminton | basketball | track | play
   sample:   true marks an example entry. Samples never appear on the live site; delete them once you add real projects.
*/
window.STRYKON_PROJECTS = [
  {
    id: 'sample-box-cricket-arena',
    sample: true,
    title: 'Box cricket arena (sample)',
    category: 'sports',
    court: 'boxcricket',
    location: 'Hyderabad',
    year: 2026,
    client: 'Pay-and-play turf business',
    size: '100 × 60 ft',
    scope: ['Base and drainage', 'Synthetic turf', 'Roof netting', 'LED floodlights'],
    summary: 'Sample entry showing how a sports project appears. Replace it with your own project.',
    description: 'This is a sample entry. Describe the site, what you built and anything notable, such as the timeline, the surface used or how the client uses the venue now.',
    photos: [],
  },
  {
    id: 'sample-rooftop-solar',
    sample: true,
    title: 'Rooftop solar power plant (sample)',
    category: 'solar',
    location: 'Hyderabad',
    year: 2026,
    client: 'School campus',
    size: 'Add the plant capacity, e.g. 50 kW',
    scope: ['Design and structure', 'Panels and inverters', 'Cabling and earthing', 'Commissioning'],
    summary: 'Sample entry showing how a solar project appears. Replace it with your own project.',
    description: 'This is a sample entry. Add the capacity, roof or land type, expected generation and what the client saves.',
    photos: [],
  },
  {
    id: 'sample-independent-house',
    sample: true,
    title: 'G+1 independent house (sample)',
    category: 'residential',
    location: 'Hyderabad',
    year: 2025,
    client: 'Homeowner',
    size: 'Add the built-up area, e.g. 3,200 sq ft',
    scope: ['Structure', 'Plumbing and electrical', 'Finishing', 'Compound wall'],
    summary: 'Sample entry showing how a residential project appears. Replace it with your own project.',
    description: 'This is a sample entry. Describe the plot, the design, the build stages and the handover.',
    photos: [],
  },
  {
    id: 'sample-pickleball-courts',
    sample: true,
    title: 'Twin pickleball courts (sample)',
    category: 'sports',
    court: 'pickleball',
    location: 'Hyderabad',
    year: 2025,
    client: 'Gated community',
    size: '2 courts, 60 × 60 ft',
    scope: ['Concrete base', 'Cushioned acrylic', 'Line marking', 'Fencing'],
    summary: 'Sample entry. Replace it with your own project.',
    description: 'This is a sample entry. Mention the number of courts, the surface system and any lighting or fencing.',
    photos: [],
  },
  {
    id: 'sample-railway-works',
    sample: true,
    title: 'Railway civil works (sample)',
    category: 'railway',
    location: 'Telangana',
    year: 2025,
    client: 'Railway project',
    size: 'Add the length or scope of work',
    scope: ['Earthwork', 'Drainage', 'Associated civil works'],
    summary: 'Sample entry showing how a railway project appears. Replace it with your own project.',
    description: 'This is a sample entry. Describe the railway project, the works you delivered and the timeline.',
    photos: [],
  },
  {
    id: 'sample-campus-roads',
    sample: true,
    title: 'Campus roads and compound wall (sample)',
    category: 'civil',
    location: 'Telangana',
    year: 2025,
    client: 'Educational institution',
    size: 'Add the length or area',
    scope: ['Site levelling', 'Internal roads', 'Storm-water drains', 'Compound wall'],
    summary: 'Sample entry. Replace it with your own project.',
    description: 'This is a sample entry. Describe the site work, materials and timeline.',
    photos: [],
  },
];
