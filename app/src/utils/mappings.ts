import { CurrentRoleDtoSeniorityLevelEnum } from "@/sdk";


export const mapSeniorityLevel = (seniorityLevel: CurrentRoleDtoSeniorityLevelEnum) => {
    const mapping = {
        [CurrentRoleDtoSeniorityLevelEnum.Intern]: 'Intern',
        [CurrentRoleDtoSeniorityLevelEnum.EntryLevel]: 'Entry Level',
        [CurrentRoleDtoSeniorityLevelEnum.Associate]: 'Associate',
        [CurrentRoleDtoSeniorityLevelEnum.MidSeniorLevel]: 'Mid-Senior Level',
        [CurrentRoleDtoSeniorityLevelEnum.Director]: 'Director',
        [CurrentRoleDtoSeniorityLevelEnum.Executive]: 'Executive',
        [CurrentRoleDtoSeniorityLevelEnum.CLevel]: 'C-Level',
    }

    return mapping[seniorityLevel];
}