
'use server';

import type { User } from './users';
import { getUsers } from './users';
import type { Task } from './tasks';
import { getTasks } from './tasks';
import { getCustomerSalesDataBySalesperson } from './customers';

export type TeamMemberPerformance = {
  user: User;
  loginTime: string; // e.g., "08:12"
  avgResponseTime: number; // in minutes
  attendances: number;
  tasksCompleted: number;
  metaPercentage: number;
  slaMet: boolean;
  avgRating: number;
  orderVolume: number;
  customerRevenue: number;
};

// This function simulates combining data from various sources to build the performance metric for each user.
const generateMockPerformanceData = async (): Promise<TeamMemberPerformance[]> => {
    const users = await getUsers();
    const tasks = await getTasks();

    const salesUsers = users.filter(u => u.role === 'vendedor');

    const performanceDataPromises = salesUsers.map(async (user) => {
        const userTasks = tasks.filter(t => t.assigneeId === user.id);
        const completedTasks = userTasks.filter(t => t.status === 'concluida').length;
        const totalInteractions = userTasks.reduce((sum, t) => sum + (t.interactions || 0), 0);
        
        const tasksWithResponseTime = userTasks.filter(t => t.responseTimeMinutes);
        const totalResponseTime = tasksWithResponseTime.reduce((sum, t) => sum + t.responseTimeMinutes!, 0);
        const avgResponseTime = tasksWithResponseTime.length > 0 ? totalResponseTime / tasksWithResponseTime.length : 0;
        
        // Fetch customer data for this salesperson
        const customerSales = await getCustomerSalesDataBySalesperson(user.id);
        const customerRevenue = customerSales.reduce((sum, customer) => sum + customer.value, 0);

        // Mocking other data for demonstration
        const loginHour = Math.floor(Math.random() * 2) + 8; // 8 or 9
        const loginMinute = Math.floor(Math.random() * 60);

        return {
            user,
            loginTime: `${String(loginHour).padStart(2, '0')}:${String(loginMinute).padStart(2, '0')}`,
            avgResponseTime: Math.round(avgResponseTime),
            attendances: totalInteractions,
            tasksCompleted: completedTasks,
            metaPercentage: Math.floor(Math.random() * 51) + 50, // 50 to 100
            slaMet: Math.random() > 0.2, // 80% chance to meet SLA
            avgRating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)), // 3.8 to 5.0
            orderVolume: customerSales.length, // Order volume is the number of customers
            customerRevenue,
        };
    });
    
    return Promise.all(performanceDataPromises);
};


export const getTeamPerformanceData = async (): Promise<TeamMemberPerformance[]> => {
    // In a real app, you would fetch and join data from different database collections.
    // For now, we use our mock generator.
    return await generateMockPerformanceData();
};
