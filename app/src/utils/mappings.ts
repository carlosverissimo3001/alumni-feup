import { RoleAnalyticsControllerGetSeniorityLevelsSeniorityLevelEnum as SeniorityLevel } from "@/sdk";


export const mapSeniorityLevel = (seniorityLevel: SeniorityLevel) => {
    const mapping = {
        [SeniorityLevel.Intern]: 'Intern',
        [SeniorityLevel.EntryLevel]: 'Entry Level',
        [SeniorityLevel.Associate]: 'Associate',
        [SeniorityLevel.MidSeniorLevel]: 'Mid-Senior Level',
        [SeniorityLevel.Director]: 'Director',
        [SeniorityLevel.Executive]: 'Executive',
        [SeniorityLevel.CLevel]: 'C-Level',
    }

    return mapping[seniorityLevel];
}
