const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Delete in reverse dependency order
  await prisma.notification.deleteMany({});
  await prisma.requestComment.deleteMany({});
  await prisma.requestActivity.deleteMany({});
  await prisma.requestImage.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.technician.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  // Create password hashes
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);
  const techPasswordHash = await bcrypt.hash('tech123', 10);
  const requesterPasswordHash = await bcrypt.hash('tenant123', 10);
  const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@facilityfix.com',
      passwordHash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const orgAdmin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@facilityfix.com',
      passwordHash: adminPasswordHash,
      role: 'ORG_ADMIN',
    },
  });

  const facilityManager = await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@facilityfix.com',
      passwordHash: managerPasswordHash,
      role: 'FACILITY_MANAGER',
    },
  });

  const technicianUser = await prisma.user.create({
    data: {
      name: 'Tech User',
      email: 'tech@facilityfix.com',
      passwordHash: techPasswordHash,
      role: 'TECHNICIAN',
    },
  });

  const requesterUser = await prisma.user.create({
    data: {
      name: 'Tenant User',
      email: 'tenant@facilityfix.com',
      passwordHash: requesterPasswordHash,
      role: 'REQUESTER',
    },
  });

  console.log('Seeding organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'Metro Heights Facility',
      slug: 'metro-heights',
      industry: 'Property Management',
      address: '100 Skyline Boulevard, Suite 500',
      phone: '+1 (555) 123-4567',
      email: 'info@metroheights.com',
    },
  });

  console.log('Creating organization memberships...');
  await prisma.organizationMember.createMany({
    data: [
      { userId: orgAdmin.id, organizationId: org.id, role: 'ORG_ADMIN' },
      { userId: facilityManager.id, organizationId: org.id, role: 'FACILITY_MANAGER' },
      { userId: technicianUser.id, organizationId: org.id, role: 'TECHNICIAN' },
      { userId: requesterUser.id, organizationId: org.id, role: 'REQUESTER' },
    ],
  });

  console.log('Seeding buildings...');
  const towerA = await prisma.building.create({
    data: {
      organizationId: org.id,
      name: 'Tower A',
      address: '100 Skyline Boulevard - East Wing',
      description: 'Residential suites and ground floor retail',
    },
  });

  const towerB = await prisma.building.create({
    data: {
      organizationId: org.id,
      name: 'Tower B',
      address: '102 Skyline Boulevard - West Wing',
      description: 'Residential suites and amenities center',
    },
  });

  const adminBlock = await prisma.building.create({
    data: {
      organizationId: org.id,
      name: 'Admin Block',
      address: '98 Skyline Boulevard',
      description: 'Management offices, conference rooms, and server infrastructure',
    },
  });

  const warehouse1 = await prisma.building.create({
    data: {
      organizationId: org.id,
      name: 'Warehouse 1',
      address: '50 Industrial Parkway',
      description: 'Storage facility and spare parts inventory',
    },
  });

  console.log('Seeding locations...');
  const unit4B = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: towerA.id,
      name: 'Unit 4B',
      floor: '4th Floor',
      roomOrUnit: 'Suite 4B',
      description: 'Two-bedroom residential apartment',
    },
  });

  const lobbyA = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: towerA.id,
      name: 'Main Lobby (Tower A)',
      floor: 'Ground Floor',
      roomOrUnit: 'Lobby',
      description: 'Entrance lobby and security desk for Tower A',
    },
  });

  const lobbyB = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: towerB.id,
      name: 'Main Lobby (Tower B)',
      floor: 'Ground Floor',
      roomOrUnit: 'Lobby',
      description: 'Entrance lobby and lounge for Tower B',
    },
  });

  const basementB = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: towerB.id,
      name: 'Basement Parking',
      floor: 'Basement B1',
      roomOrUnit: 'B1 Parking',
      description: 'Resident parking area and storage lockers',
    },
  });

  const serverRoom = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: adminBlock.id,
      name: 'Server Room 101',
      floor: '1st Floor',
      roomOrUnit: 'Room 101',
      description: 'Main telecom and server racks',
    },
  });

  const cafeteria = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: adminBlock.id,
      name: 'Cafeteria',
      floor: '2nd Floor',
      roomOrUnit: 'Suite 250',
      description: 'Staff dining area and kitchen',
    },
  });

  const hallway3 = await prisma.location.create({
    data: {
      organizationId: org.id,
      buildingId: towerA.id,
      name: 'Floor 3 Hallway',
      floor: '3rd Floor',
      roomOrUnit: 'Common Hallway',
      description: 'Common walkway connecting residential units',
    },
  });

  console.log('Seeding categories...');
  const catPlumbing = await prisma.category.create({
    data: { organizationId: org.id, name: 'Plumbing', description: 'Leaking, piping, drains, water supply', color: 'blue' },
  });
  const catElectrical = await prisma.category.create({
    data: { organizationId: org.id, name: 'Electrical', description: 'Lights, switches, power outages, wiring', color: 'orange' },
  });
  const catHVAC = await prisma.category.create({
    data: { organizationId: org.id, name: 'HVAC', description: 'Air conditioning, heating, ventilation', color: 'amber' },
  });
  const catCleaning = await prisma.category.create({
    data: { organizationId: org.id, name: 'Cleaning', description: 'Spills, waste removal, regular janitorial', color: 'teal' },
  });
  const catSecurity = await prisma.category.create({
    data: { organizationId: org.id, name: 'Security', description: 'Locks, access cards, CCTV, gates', color: 'red' },
  });
  const catIT = await prisma.category.create({
    data: { organizationId: org.id, name: 'IT/Internet', description: 'Wi-Fi, routers, ethernet connections', color: 'indigo' },
  });
  const catFurniture = await prisma.category.create({
    data: { organizationId: org.id, name: 'Furniture', description: 'Desks, chairs, blinds, fixtures', color: 'emerald' },
  });
  const catElevator = await prisma.category.create({
    data: { organizationId: org.id, name: 'Elevator', description: 'Elevator maintenance, breakdowns, inspections', color: 'purple' },
  });
  const catGeneral = await prisma.category.create({
    data: { organizationId: org.id, name: 'General Repairs', description: 'Drywall, painting, doors, miscellaneous', color: 'slate' },
  });

  console.log('Seeding technicians...');
  const techAlex = await prisma.technician.create({
    data: { organizationId: org.id, name: 'Alex Morgan', email: 'alex.morgan@facilityfix.com', phone: '+1 (555) 987-0001', specialty: 'Plumbing' },
  });
  const techSarah = await prisma.technician.create({
    data: { organizationId: org.id, name: 'Sarah Lee', email: 'sarah.lee@facilityfix.com', phone: '+1 (555) 987-0002', specialty: 'Electrical' },
  });
  const techDaniel = await prisma.technician.create({
    data: { organizationId: org.id, name: 'Daniel Kim', email: 'daniel.kim@facilityfix.com', phone: '+1 (555) 987-0003', specialty: 'HVAC' },
  });
  const techPriya = await prisma.technician.create({
    data: { organizationId: org.id, name: 'Priya Shah', email: 'priya.shah@facilityfix.com', phone: '+1 (555) 987-0004', specialty: 'General Maintenance' },
  });

  console.log('Seeding sample maintenance requests...');
  
  const now = new Date();
  
  // Helper to calculate SLA due date based on priority
  const getSlaDueAt = (priority, fromDate = now) => {
    const date = new Date(fromDate);
    if (priority === 'LOW') date.setDate(date.getDate() + 7);
    else if (priority === 'MEDIUM') date.setDate(date.getDate() + 3);
    else if (priority === 'HIGH') date.setDate(date.getDate() + 1); // 24 hours
    else if (priority === 'URGENT') date.setHours(date.getHours() + 4);
    return date;
  };

  // 1. Water leakage in Unit 4B - OPEN, HIGH priority
  const req1 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Water leakage in Unit 4B',
      description: 'There is a steady water leak dripping from the master bathroom ceiling. It seems to be coming from the apartment above.',
      categoryId: catPlumbing.id,
      buildingId: towerA.id,
      locationId: unit4B.id,
      requesterId: requesterUser.id,
      requesterName: 'Tenant User',
      requesterEmail: 'tenant@facilityfix.com',
      requesterPhone: '+1 (555) 777-8888',
      priority: 'HIGH',
      status: 'OPEN',
      slaDueAt: getSlaDueAt('HIGH'),
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req1.id,
      actorName: 'Tenant User',
      action: 'CREATED',
      metadata: 'Maintenance request created via tenant portal',
    },
  });

  // 2. AC not cooling in Server Room - ASSIGNED, URGENT priority
  const req2 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'AC not cooling in Admin Block Server Room',
      description: 'The primary AC unit in Server Room 101 has stopped cooling. Temperature is rising and currently reads 28°C. Threat of server thermal shutdown.',
      categoryId: catHVAC.id,
      buildingId: adminBlock.id,
      locationId: serverRoom.id,
      requesterName: 'System Monitor',
      requesterEmail: 'sysadmin@metroheights.com',
      assignedTechnicianId: techDaniel.id,
      priority: 'URGENT',
      status: 'ASSIGNED',
      slaDueAt: getSlaDueAt('URGENT'),
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req2.id,
      actorName: 'Admin User',
      action: 'CREATED',
      metadata: 'Emergency maintenance request submitted',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req2.id,
      actorName: 'Admin User',
      action: 'ASSIGNED',
      metadata: `Assigned to AC specialist ${techDaniel.name}`,
    },
  });

  // 3. Broken light in hallway - IN_PROGRESS, MEDIUM priority
  const req3 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Broken light in hallway',
      description: 'Two fluorescent tube lights are flickering and three are completely out on the 3rd floor hallway of Tower A, near Unit 312.',
      categoryId: catElectrical.id,
      buildingId: towerA.id,
      locationId: hallway3.id,
      requesterName: 'Resident Jane',
      requesterEmail: 'jane.smith@example.com',
      assignedTechnicianId: techSarah.id,
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      slaDueAt: getSlaDueAt('MEDIUM'),
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req3.id,
      actorName: 'Manager User',
      action: 'CREATED',
      metadata: 'Submitted on behalf of tenant Jane Smith',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req3.id,
      actorName: 'Manager User',
      action: 'ASSIGNED',
      metadata: `Assigned to electrician ${techSarah.name}`,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req3.id,
      actorName: 'Sarah Lee',
      action: 'STATUS_UPDATED',
      metadata: 'Status changed to IN_PROGRESS. Notes: "Retrieved replacement ballast and LED tubes from warehouse."',
    },
  });

  await prisma.requestComment.create({
    data: {
      requestId: req3.id,
      userId: technicianUser.id,
      authorName: 'Sarah Lee',
      body: 'I am on site now. Replacing the ballasts first to see if that resolves the flickering.',
    },
  });

  // 4. Elevator making scraping noise - ON_HOLD, HIGH priority
  const req4 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Elevator making scraping noise',
      description: 'The elevator in Tower B makes a loud metallic scraping sound when moving between floors 4 and 6. It is still operational but sounds unsafe.',
      categoryId: catElevator.id,
      buildingId: towerB.id,
      locationId: lobbyB.id,
      requesterName: 'John Doe',
      requesterEmail: 'johndoe@example.com',
      assignedTechnicianId: techPriya.id,
      priority: 'HIGH',
      status: 'ON_HOLD',
      slaDueAt: getSlaDueAt('HIGH'),
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req4.id,
      actorName: 'John Doe',
      action: 'CREATED',
      metadata: 'Created via public portal',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req4.id,
      actorName: 'Manager User',
      action: 'ASSIGNED',
      metadata: `Assigned to ${techPriya.name} for inspection`,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req4.id,
      actorName: 'Priya Shah',
      action: 'STATUS_UPDATED',
      metadata: 'Status changed to ON_HOLD. Notes: "Requires specialized Otis OEM parts. Subcontractor contacted."',
    },
  });

  await prisma.requestComment.create({
    data: {
      requestId: req4.id,
      userId: technicianUser.id,
      authorName: 'Priya Shah',
      body: 'Inspected the elevator shaft. The guide shoe liner is severely worn. I have put the request on hold while we wait for Otis technicians to supply the OEM part. Expected Wednesday.',
    },
  });

  // 5. WiFi router offline in server room - OPEN, URGENT priority (Overdue / SLA breached)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2); // 2 days ago
  const req5 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'WiFi router offline in server room',
      description: 'The administration office WiFi network has gone completely offline. None of the office staff can connect, disrupting work.',
      categoryId: catIT.id,
      buildingId: adminBlock.id,
      locationId: serverRoom.id,
      requesterName: 'Office Admin',
      requesterEmail: 'office@metroheights.com',
      priority: 'URGENT',
      status: 'OPEN',
      slaDueAt: getSlaDueAt('URGENT', pastDate),
      createdAt: pastDate,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req5.id,
      actorName: 'Office Admin',
      action: 'CREATED',
      metadata: 'Request submitted.',
      createdAt: pastDate,
    },
  });

  // 6. Cleaning required in lobby - RESOLVED, LOW priority
  const resolveDate = new Date();
  resolveDate.setHours(resolveDate.getHours() - 3);
  const req6 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Cleaning required in lobby',
      description: 'Someone spilled coffee on the main entrance rug in the lobby of Tower B. It is a slipping hazard and looks unprofessional.',
      categoryId: catCleaning.id,
      buildingId: towerB.id,
      locationId: lobbyB.id,
      requesterName: 'Receptionist Mary',
      requesterEmail: 'mary@metroheights.com',
      assignedTechnicianId: techPriya.id,
      priority: 'LOW',
      status: 'RESOLVED',
      slaDueAt: getSlaDueAt('LOW'),
      resolvedAt: resolveDate,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req6.id,
      actorName: 'Mary',
      action: 'CREATED',
      metadata: 'Request submitted.',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req6.id,
      actorName: 'Manager User',
      action: 'ASSIGNED',
      metadata: `Assigned to ${techPriya.name}`,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req6.id,
      actorName: 'Priya Shah',
      action: 'STATUS_UPDATED',
      metadata: 'Status changed to RESOLVED. Notes: "Spill cleaned up and dry-vacuumed. Rug is now clean and safe."',
    },
  });

  // 7. Faulty door lock - CONFIRMED, MEDIUM priority
  const confirmDate = new Date();
  confirmDate.setHours(confirmDate.getHours() - 1);
  const req7 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Faulty door lock',
      description: 'The smart lock on Unit 4B is failing to lock automatically. It works when using the physical key but the keypad is unresponsive.',
      categoryId: catSecurity.id,
      buildingId: towerA.id,
      locationId: unit4B.id,
      requesterId: requesterUser.id,
      requesterName: 'Tenant User',
      requesterEmail: 'tenant@facilityfix.com',
      assignedTechnicianId: techPriya.id,
      priority: 'MEDIUM',
      status: 'CONFIRMED',
      slaDueAt: getSlaDueAt('MEDIUM'),
      resolvedAt: confirmDate,
      confirmedAt: confirmDate,
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req7.id,
      actorName: 'Tenant User',
      action: 'CREATED',
      metadata: 'Created request.',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req7.id,
      actorName: 'Priya Shah',
      action: 'RESOLVED',
      metadata: 'Lock assembly replaced and batteries changed. Tested and works perfectly.',
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req7.id,
      actorName: 'Tenant User',
      action: 'STATUS_UPDATED',
      metadata: 'Status changed to CONFIRMED. "Tenant confirmed lock is working properly now."',
    },
  });

  // 8. Cafeteria sink blocked - CANCELLED, LOW priority
  const req8 = await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      title: 'Cafeteria sink blocked',
      description: 'The main sink in the cafeteria is draining very slowly and backing up during peak hours.',
      categoryId: catPlumbing.id,
      buildingId: adminBlock.id,
      locationId: cafeteria.id,
      requesterName: 'Kitchen Staff Chef',
      requesterEmail: 'chef@metroheights.com',
      priority: 'LOW',
      status: 'CANCELLED',
      slaDueAt: getSlaDueAt('LOW'),
    },
  });

  await prisma.requestActivity.create({
    data: {
      requestId: req8.id,
      actorName: 'Manager User',
      action: 'STATUS_UPDATED',
      metadata: 'Status changed to CANCELLED. Notes: "Duplicated request, combined with general kitchen renovation ticket."',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
