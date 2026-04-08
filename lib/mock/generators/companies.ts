import { Company, User } from '../../types';

// Mock company data
const MOCK_COMPANIES: Omit<Company, 'id' | 'createdAt'>[] = [
  {
    name: 'Industrias Metalúrgicas SA',
    slug: 'industrias-metalurgicas',
    logo: '/logos/metalurgicas.png',
    contactEmail: 'contacto@metalurgicas.com.ar',
    contactPhone: '+54 11 4567-8900',
    status: 'active',
  },
  {
    name: 'Textil del Norte SRL',
    slug: 'textil-del-norte',
    logo: '/logos/textil-norte.png',
    contactEmail: 'info@textilnorte.com.ar',
    contactPhone: '+54 381 456-7890',
    status: 'active',
  },
  {
    name: 'Alimentos Patagónicos SA',
    slug: 'alimentos-patagonicos',
    logo: '/logos/alimentos-patagonicos.png',
    contactEmail: 'gerencia@alimentospatagonicos.com.ar',
    contactPhone: '+54 299 567-8901',
    status: 'active',
  },
  {
    name: 'Química Industrial Córdoba',
    slug: 'quimica-industrial-cordoba',
    logo: '/logos/quimica-cordoba.png',
    contactEmail: 'administracion@quimicacordoba.com.ar',
    contactPhone: '+54 351 678-9012',
    status: 'active',
  },
  {
    name: 'Minera Andina SAIC',
    slug: 'minera-andina',
    logo: '/logos/minera-andina.png',
    contactEmail: 'contacto@mineraandina.com.ar',
    contactPhone: '+54 264 789-0123',
    status: 'inactive',
  },
];

export function generateCompanies(): Company[] {
  return MOCK_COMPANIES.map((company, index) => ({
    ...company,
    id: `company-${index + 1}`,
    createdAt: new Date(2022, index * 2, 15 + index),
  }));
}

export function generateCompanyUsers(companies: Company[]): User[] {
  const users: User[] = [];
  
  companies.forEach((company, companyIndex) => {
    // Generate admin user for each company
    users.push({
      id: `user-${company.id}-admin`,
      email: `admin@${company.slug.replace('-', '')}.com.ar`,
      firstName: getRandomFirstName(),
      lastName: getRandomLastName(),
      role: 'client_admin',
      companyId: company.id,
      phone: generatePhoneNumber(),
      position: 'Gerente de Energía',
      status: 'active',
      createdAt: new Date(2022, companyIndex * 2, 20 + companyIndex),
      lastLogin: new Date(2024, 11, Math.floor(Math.random() * 30) + 1),
    });

    // Generate 1-3 regular users per company
    const userCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < userCount; i++) {
      users.push({
        id: `user-${company.id}-${i + 1}`,
        email: `usuario${i + 1}@${company.slug.replace('-', '')}.com.ar`,
        firstName: getRandomFirstName(),
        lastName: getRandomLastName(),
        role: 'client_user',
        companyId: company.id,
        phone: Math.random() > 0.3 ? generatePhoneNumber() : undefined,
        position: getRandomPosition(),
        status: Math.random() > 0.1 ? 'active' : 'paused',
        createdAt: new Date(2022, companyIndex * 2 + 1, 10 + i * 5),
        lastLogin: Math.random() > 0.2 ? new Date(2024, 11, Math.floor(Math.random() * 30) + 1) : undefined,
      });
    }
  });

  return users;
}

export function generateBackofficeUsers(): User[] {
  return [
    {
      id: 'user-backoffice-1',
      email: 'admin@energeia.com.ar',
      firstName: 'María',
      lastName: 'González',
      role: 'backoffice',
      phone: '+54 11 5555-0001',
      position: 'Administradora del Sistema',
      status: 'active',
      createdAt: new Date(2022, 0, 1),
      lastLogin: new Date(2024, 11, 15),
    },
    {
      id: 'user-backoffice-2',
      email: 'operaciones@energeia.com.ar',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'backoffice',
      phone: '+54 11 5555-0002',
      position: 'Analista de Operaciones',
      status: 'active',
      createdAt: new Date(2022, 0, 15),
      lastLogin: new Date(2024, 11, 14),
    },
  ];
}

// Helper functions
function getRandomFirstName(): string {
  const names = [
    'Ana', 'Carlos', 'María', 'Juan', 'Laura', 'Diego', 'Sofía', 'Miguel',
    'Valentina', 'Alejandro', 'Camila', 'Sebastián', 'Martina', 'Nicolás',
    'Florencia', 'Matías', 'Agustina', 'Facundo', 'Lucía', 'Tomás'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomLastName(): string {
  const surnames = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez',
    'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández',
    'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez'
  ];
  return surnames[Math.floor(Math.random() * surnames.length)];
}

function getRandomPosition(): string {
  const positions = [
    'Analista de Energía',
    'Coordinador de Operaciones',
    'Especialista en Costos',
    'Supervisor de Planta',
    'Técnico Eléctrico',
    'Ingeniero de Procesos',
    'Analista Financiero',
    'Jefe de Mantenimiento'
  ];
  return positions[Math.floor(Math.random() * positions.length)];
}

function generatePhoneNumber(): string {
  const areaCodes = ['11', '221', '223', '261', '299', '341', '351', '381', '387'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+54 ${areaCode} ${number.toString().slice(0, 4)}-${number.toString().slice(4)}`;
}