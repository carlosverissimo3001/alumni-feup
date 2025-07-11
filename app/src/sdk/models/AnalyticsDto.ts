/* tslint:disable */
/* eslint-disable */
/**
 * API
 * API description
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { SeniorityListResponseDto } from './SeniorityListResponseDto';
import {
    SeniorityListResponseDtoFromJSON,
    SeniorityListResponseDtoFromJSONTyped,
    SeniorityListResponseDtoToJSON,
    SeniorityListResponseDtoToJSONTyped,
} from './SeniorityListResponseDto';
import type { CityListResponseDto } from './CityListResponseDto';
import {
    CityListResponseDtoFromJSON,
    CityListResponseDtoFromJSONTyped,
    CityListResponseDtoToJSON,
    CityListResponseDtoToJSONTyped,
} from './CityListResponseDto';
import type { RoleListResponseDto } from './RoleListResponseDto';
import {
    RoleListResponseDtoFromJSON,
    RoleListResponseDtoFromJSONTyped,
    RoleListResponseDtoToJSON,
    RoleListResponseDtoToJSONTyped,
} from './RoleListResponseDto';
import type { GraduationListDto } from './GraduationListDto';
import {
    GraduationListDtoFromJSON,
    GraduationListDtoFromJSONTyped,
    GraduationListDtoToJSON,
    GraduationListDtoToJSONTyped,
} from './GraduationListDto';
import type { CountryListResponseDto } from './CountryListResponseDto';
import {
    CountryListResponseDtoFromJSON,
    CountryListResponseDtoFromJSONTyped,
    CountryListResponseDtoToJSON,
    CountryListResponseDtoToJSONTyped,
} from './CountryListResponseDto';
import type { CompanyListResponseDto } from './CompanyListResponseDto';
import {
    CompanyListResponseDtoFromJSON,
    CompanyListResponseDtoFromJSONTyped,
    CompanyListResponseDtoToJSON,
    CompanyListResponseDtoToJSONTyped,
} from './CompanyListResponseDto';
import type { IndustryListResponseDto } from './IndustryListResponseDto';
import {
    IndustryListResponseDtoFromJSON,
    IndustryListResponseDtoFromJSONTyped,
    IndustryListResponseDtoToJSON,
    IndustryListResponseDtoToJSONTyped,
} from './IndustryListResponseDto';
import type { AlumniListResponseDto } from './AlumniListResponseDto';
import {
    AlumniListResponseDtoFromJSON,
    AlumniListResponseDtoFromJSONTyped,
    AlumniListResponseDtoToJSON,
    AlumniListResponseDtoToJSONTyped,
} from './AlumniListResponseDto';
import type { MajorListDto } from './MajorListDto';
import {
    MajorListDtoFromJSON,
    MajorListDtoFromJSONTyped,
    MajorListDtoToJSON,
    MajorListDtoToJSONTyped,
} from './MajorListDto';
import type { FacultyListDto } from './FacultyListDto';
import {
    FacultyListDtoFromJSON,
    FacultyListDtoFromJSONTyped,
    FacultyListDtoToJSON,
    FacultyListDtoToJSONTyped,
} from './FacultyListDto';

/**
 * 
 * @export
 * @interface AnalyticsDto
 */
export interface AnalyticsDto {
    /**
     * The alumni analytics data
     * @type {AlumniListResponseDto}
     * @memberof AnalyticsDto
     */
    alumniData?: AlumniListResponseDto;
    /**
     * The company analytics data
     * @type {CompanyListResponseDto}
     * @memberof AnalyticsDto
     */
    companyData?: CompanyListResponseDto;
    /**
     * The country analytics data
     * @type {CountryListResponseDto}
     * @memberof AnalyticsDto
     */
    countryData?: CountryListResponseDto;
    /**
     * The city analytics data
     * @type {CityListResponseDto}
     * @memberof AnalyticsDto
     */
    cityData?: CityListResponseDto;
    /**
     * The role analytics data
     * @type {RoleListResponseDto}
     * @memberof AnalyticsDto
     */
    roleData?: RoleListResponseDto;
    /**
     * The seniority analytics data
     * @type {SeniorityListResponseDto}
     * @memberof AnalyticsDto
     */
    seniorityData?: SeniorityListResponseDto;
    /**
     * The industry analytics data
     * @type {IndustryListResponseDto}
     * @memberof AnalyticsDto
     */
    industryData?: IndustryListResponseDto;
    /**
     * The faculty analytics data
     * @type {FacultyListDto}
     * @memberof AnalyticsDto
     */
    facultyData?: FacultyListDto;
    /**
     * The major analytics data
     * @type {MajorListDto}
     * @memberof AnalyticsDto
     */
    majorData?: MajorListDto;
    /**
     * The graduation analytics data
     * @type {GraduationListDto}
     * @memberof AnalyticsDto
     */
    graduationData?: GraduationListDto;
}

/**
 * Check if a given object implements the AnalyticsDto interface.
 */
export function instanceOfAnalyticsDto(value: object): value is AnalyticsDto {
    return true;
}

export function AnalyticsDtoFromJSON(json: any): AnalyticsDto {
    return AnalyticsDtoFromJSONTyped(json, false);
}

export function AnalyticsDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): AnalyticsDto {
    if (json == null) {
        return json;
    }
    return {
        
        'alumniData': json['alumniData'] == null ? undefined : AlumniListResponseDtoFromJSON(json['alumniData']),
        'companyData': json['companyData'] == null ? undefined : CompanyListResponseDtoFromJSON(json['companyData']),
        'countryData': json['countryData'] == null ? undefined : CountryListResponseDtoFromJSON(json['countryData']),
        'cityData': json['cityData'] == null ? undefined : CityListResponseDtoFromJSON(json['cityData']),
        'roleData': json['roleData'] == null ? undefined : RoleListResponseDtoFromJSON(json['roleData']),
        'seniorityData': json['seniorityData'] == null ? undefined : SeniorityListResponseDtoFromJSON(json['seniorityData']),
        'industryData': json['industryData'] == null ? undefined : IndustryListResponseDtoFromJSON(json['industryData']),
        'facultyData': json['facultyData'] == null ? undefined : FacultyListDtoFromJSON(json['facultyData']),
        'majorData': json['majorData'] == null ? undefined : MajorListDtoFromJSON(json['majorData']),
        'graduationData': json['graduationData'] == null ? undefined : GraduationListDtoFromJSON(json['graduationData']),
    };
}

export function AnalyticsDtoToJSON(json: any): AnalyticsDto {
    return AnalyticsDtoToJSONTyped(json, false);
}

export function AnalyticsDtoToJSONTyped(value?: AnalyticsDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'alumniData': AlumniListResponseDtoToJSON(value['alumniData']),
        'companyData': CompanyListResponseDtoToJSON(value['companyData']),
        'countryData': CountryListResponseDtoToJSON(value['countryData']),
        'cityData': CityListResponseDtoToJSON(value['cityData']),
        'roleData': RoleListResponseDtoToJSON(value['roleData']),
        'seniorityData': SeniorityListResponseDtoToJSON(value['seniorityData']),
        'industryData': IndustryListResponseDtoToJSON(value['industryData']),
        'facultyData': FacultyListDtoToJSON(value['facultyData']),
        'majorData': MajorListDtoToJSON(value['majorData']),
        'graduationData': GraduationListDtoToJSON(value['graduationData']),
    };
}

