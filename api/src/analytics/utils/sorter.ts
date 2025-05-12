import {
  CompanyListItemExtendedDto,
  IndustryListItemDto,
  RoleListItemDto,
  CountryListItemDto,
  CityListItemDto,
} from '@/analytics/dto';
import { SortBy } from './types';

type SortableData =
  | CompanyListItemExtendedDto
  | IndustryListItemDto
  | RoleListItemDto
  | CountryListItemDto
  | CityListItemDto;

export const sortData = <T extends SortableData>(
  data: T[],
  order: {
    sortBy: SortBy;
    direction: 'asc' | 'desc';
  },
): T[] => {
  if (typeof data === 'undefined' || data === null || data.length === 0) {
    return [];
  }
  return [...data].sort((a, b) => {
    let comparison = 0;

    switch (order.sortBy) {
      case SortBy.NAME:
        comparison = a.name.localeCompare(b.name);
        break;
      case SortBy.COUNT:
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
