import { ExtendedCompanyDto, ExtendedCompanyDtoFromJSON } from "./ExtendedCompanyDto";
import { LocationGeo, LocationGeoFromJSON } from "./LocationGeo";

export class AlumniPastLocationsAndCompaniesDto {
    /**
     * @type {Array<ExtendedCompanyDto>}
     * @memberof AlumniPastLocationsAndCompaniesDto
     */
    Companies?: ExtendedCompanyDto[];
    
    /**
     * @type {Array<LocationGeo>}
     * @memberof AlumniPastLocationsAndCompaniesDto
     */
    Locations?: LocationGeo[];
  }

  export function AlumniPastLocationsAndCompaniesDtoFromJSON(json: any): AlumniPastLocationsAndCompaniesDto {
    return AlumniPastLocationsAndCompaniesDtoFromJSONTyped(json, false);
}

export function AlumniPastLocationsAndCompaniesDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): AlumniPastLocationsAndCompaniesDto {
    if (json == null) {
        return json;
    }
    return {
        'Companies': json['Companies'] == null ? undefined : ((json['Companies'] as Array<any>).map(ExtendedCompanyDtoFromJSON)),
        'Locations': json['Locations'] == null ? undefined : ((json['Locations'] as Array<any>).map(LocationGeoFromJSON)),
    };
}