import {
  CompanyListItemExtendedDto,
  IndustryListItemDto,
  RoleListItemDto,
  CountryListItemDto,
  CityListItemDto,
  MajorListItemDto,
  FacultyListItemDto,
} from '@/analytics/dto';
import { SORT_BY } from '../consts';

type SortableData =
  | CompanyListItemExtendedDto
  | IndustryListItemDto
  | RoleListItemDto
  | CountryListItemDto
  | CityListItemDto
  | MajorListItemDto
  | FacultyListItemDto;

export const sortData = <T extends SortableData>(
  data: T[],
  order: {
    sortBy: SORT_BY;
    direction: 'asc' | 'desc';
  },
): T[] => {
  if (typeof data === 'undefined' || data === null || data.length === 0) {
    return [];
  }
  return [...data].sort((a, b) => {
    let comparison = 0;

    switch (order.sortBy) {
      case SORT_BY.NAME:
        comparison = a.name.localeCompare(b.name);
        break;
      case SORT_BY.COUNT:
        comparison = a.count - b.count;
        break;
      default:
        // Default fallback - use name
        comparison = a.name.localeCompare(b.name);
    }

    if (order.direction === 'desc') {
      comparison = -comparison;
    }

    return comparison;
  });
};
