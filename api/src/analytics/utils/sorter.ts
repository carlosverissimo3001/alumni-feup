import { CompanyListItemDto } from '../dto/company-list.dto';
import { IndustryListItemDto } from '../dto/industry-list.dto';
import { SortBy } from './types';

type SortableData = CompanyListItemDto | IndustryListItemDto;

export const sortData = (
  data: SortableData[],
  order: {
    sortBy: SortBy;
    direction: 'asc' | 'desc';
  },
) => {
  return data.sort((a, b) => {
    let comparison = 0;

    switch (order.sortBy) {
      case SortBy.ALUMNI_COUNT:
        comparison = a.alumniCount - b.alumniCount;
        break;
      case SortBy.NAME:
        comparison = a.name.localeCompare(b.name);
        break;
      case SortBy.COMPANY_COUNT:
        if ('companyCount' in a && 'companyCount' in b) {
          comparison = a.companyCount - b.companyCount;
        }
        break;
      default:
        comparison = a.alumniCount - b.alumniCount;
    }

    if (order.direction === 'desc') {
      comparison = -comparison;
    }

    return comparison;
  });
};
