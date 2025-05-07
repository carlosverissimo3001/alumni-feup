import { LocationGeoFromJSON, type LocationGeo } from './LocationGeo';
import { CompanyDto } from './CompanyDto';

export interface ExtendedCompanyDto extends CompanyDto {
    /**
     * @type {LocationGeo}
     * @memberof ExtendedCompanyDto
     */
    location?: LocationGeo;
}


export function ExtendedCompanyDtoFromJSON(json: any): ExtendedCompanyDto {
    return ExtendedCompanyDtoFromJSONTyped(json, false);
}

export function ExtendedCompanyDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExtendedCompanyDto {
    if (json == null) {
        return json;
    }
    return {
        'id': json['id'],
        'name': json['name'],
        'industry': json['industry'],
        'website': json['website'] == null ? undefined : json['website'],
        'linkedinUrl': json['linkedinUrl'] == null ? undefined : json['linkedinUrl'],
        'logo': json['logo'] == null ? undefined : json['logo'],
        'location': json['location'] == null ? undefined : LocationGeoFromJSON(json['location']),
    };
}