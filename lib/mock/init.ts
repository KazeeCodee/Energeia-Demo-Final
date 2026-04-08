// Mock data initialization utility
// This can be called during app startup to ensure mock data is available

import { seedMockData, getMockData } from './data/seeds';
import { SimulationManager } from './simulators/delays';

export function initializeMockData() {
  console.log('Initializing mock data...');
  
  // Set up simulation configuration
  SimulationManager.setNetworkCondition('fast');
  
  // Ensure mock data exists
  const data = getMockData();
  
  if (data) {
    console.log('Mock data initialized successfully:', {
      companies: data.companies.length,
      users: data.users.length,
      reports: data.reports.length,
      sharedLinks: data.sharedLinks.length,
      processingJobs: data.processingJobs.length,
    });
  } else {
    console.error('Failed to initialize mock data');
  }
  
  return data;
}

export function resetMockData() {
  console.log('Resetting mock data...');
  return seedMockData();
}

// Development utilities
export function logMockDataStats() {
  const data = getMockData();
  if (!data) {
    console.log('No mock data available');
    return;
  }
  
  console.group('Mock Data Statistics');
  
  console.log('Companies:', data.companies.length);
  data.companies.forEach(company => {
    console.log(`  - ${company.name} (${company.status})`);
  });
  
  console.log('\nUsers by Role:');
  const usersByRole = data.users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(usersByRole).forEach(([role, count]) => {
    console.log(`  - ${role}: ${count}`);
  });
  
  console.log('\nReports by Company:');
  const reportsByCompany = data.reports.reduce((acc, report) => {
    const company = data.companies.find(c => c.id === report.companyId);
    const companyName = company?.name || 'Unknown';
    acc[companyName] = (acc[companyName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(reportsByCompany).forEach(([company, count]) => {
    console.log(`  - ${company}: ${count} reports`);
  });
  
  console.log(`\nShared Links: ${data.sharedLinks.length}`);
  console.log(`Processing Jobs: ${data.processingJobs.length}`);
  console.log(`Generated At: ${data.generatedAt}`);
  
  console.groupEnd();
}