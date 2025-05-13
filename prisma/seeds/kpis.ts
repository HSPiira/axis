import { PrismaClient } from '@/generated/prisma';
import { KpiCategory, Unit } from '@/generated/prisma';

const kpis = [
    // 1. Utilization KPIs
    {
        name: 'Utilization Rate',
        description: 'Percentage of employees who have used the EAP',
        type: KpiCategory.UTILIZATION,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Session Count',
        description: 'Total number of sessions conducted',
        type: KpiCategory.UTILIZATION,
        unit: 'sessions',
        unitType: Unit.COUNT
    },
    {
        name: 'Average Sessions per User',
        description: 'Average number of sessions per user',
        type: KpiCategory.UTILIZATION,
        unit: 'sessions/user',
        unitType: Unit.COUNT
    },
    {
        name: 'Repeat Usage Rate',
        description: 'Percentage of users with more than one session',
        type: KpiCategory.UTILIZATION,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Peak Usage Periods',
        description: 'Identification of high-usage periods',
        type: KpiCategory.UTILIZATION,
        unit: 'periods',
        unitType: Unit.COUNT
    },

    // 2. Service Delivery KPIs
    {
        name: 'Time to First Appointment',
        description: 'Average time between request and first session',
        type: KpiCategory.SERVICE_DELIVERY,
        unit: 'days',
        unitType: Unit.TIME
    },
    {
        name: 'No-show Rate',
        description: 'Percentage of missed appointments',
        type: KpiCategory.SERVICE_DELIVERY,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Dropout Rate',
        description: 'Percentage of users who don\'t complete a planned program',
        type: KpiCategory.SERVICE_DELIVERY,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Session Duration Average',
        description: 'Average duration of sessions',
        type: KpiCategory.SERVICE_DELIVERY,
        unit: 'minutes',
        unitType: Unit.TIME
    },
    {
        name: 'Referral Rate',
        description: 'Percentage of cases referred to external providers',
        type: KpiCategory.SERVICE_DELIVERY,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },

    // 3. Satisfaction & Outcome KPIs
    {
        name: 'Client Satisfaction Score',
        description: 'Client satisfaction rating (CSAT)',
        type: KpiCategory.SATISFACTION,
        unit: 'score',
        unitType: Unit.SCORE
    },
    {
        name: 'Net Promoter Score',
        description: 'Net Promoter Score (NPS)',
        type: KpiCategory.SATISFACTION,
        unit: 'score',
        unitType: Unit.SCORE
    },
    {
        name: 'Improvement Score',
        description: 'Self-reported improvement after sessions',
        type: KpiCategory.SATISFACTION,
        unit: 'score',
        unitType: Unit.SCORE
    },
    {
        name: 'Issue Resolution Rate',
        description: 'Percentage of issues resolved',
        type: KpiCategory.SATISFACTION,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Survey Response Rate',
        description: 'Percentage of surveys completed',
        type: KpiCategory.SATISFACTION,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },

    // 4. Compliance & SLA KPIs
    {
        name: 'SLA Adherence Rate',
        description: 'Percentage of SLAs met',
        type: KpiCategory.COMPLIANCE,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Data Privacy Compliance',
        description: 'Number of data privacy compliance checks passed',
        type: KpiCategory.COMPLIANCE,
        unit: 'checks',
        unitType: Unit.COUNT
    },
    {
        name: 'Timely Case Closure',
        description: 'Percentage of cases closed within target timeframe',
        type: KpiCategory.COMPLIANCE,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Response Time to Inquiries',
        description: 'Average time to respond to inquiries',
        type: KpiCategory.COMPLIANCE,
        unit: 'hours',
        unitType: Unit.TIME
    },

    // 5. Engagement & Awareness KPIs
    {
        name: 'Training Attendance Rate',
        description: 'Percentage of employees attending training/workshops',
        type: KpiCategory.ENGAGEMENT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Newsletter Open Rate',
        description: 'Percentage of newsletters opened',
        type: KpiCategory.ENGAGEMENT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Awareness Campaign Reach',
        description: 'Number of employees reached by awareness campaigns',
        type: KpiCategory.ENGAGEMENT,
        unit: 'employees',
        unitType: Unit.COUNT
    },
    {
        name: 'Manager Referrals',
        description: 'Number of referrals from managers',
        type: KpiCategory.ENGAGEMENT,
        unit: 'referrals',
        unitType: Unit.COUNT
    },

    // 6. Organizational Impact KPIs
    {
        name: 'Absenteeism Rate Change',
        description: 'Change in absenteeism rate after EAP usage',
        type: KpiCategory.IMPACT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Productivity Improvement',
        description: 'Self-reported or HRMS-measured productivity improvement',
        type: KpiCategory.IMPACT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Grievance Reduction',
        description: 'Reduction in grievances/complaints',
        type: KpiCategory.IMPACT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    },
    {
        name: 'Return on Investment',
        description: 'ROI of the EAP program',
        type: KpiCategory.IMPACT,
        unit: Unit.PERCENTAGE,
        unitType: Unit.PERCENTAGE
    }
];

export async function seedKPIs(prisma: PrismaClient) {
    try {
        console.log('🌱 Starting KPI seeding...');

        for (const kpiData of kpis) {
            console.log(`Creating KPI: ${kpiData.name}`);
            const existingKpi = await prisma.kPI.findFirst({
                where: {
                    name: kpiData.name
                }
            });

            if (existingKpi) {
                await prisma.kPI.update({
                    where: { id: existingKpi.id },
                    data: kpiData
                });
            } else {
                await prisma.kPI.create({
                    data: kpiData
                });
            }
        }

        console.log('✅ KPIs seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding KPIs:', error);
        throw error;
    }
} 