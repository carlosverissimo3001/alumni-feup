import { CompanyService } from '@/company/services/company.service';
import { LocationService } from '@/location/location.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MergeCompaniesDto, MergeLocationsDto } from '../dto';

type ProxyCurlBalanceResponse = {
  // This is an interger value
  credit_balance: number;
};

type BrightDataBalanceResponse = {
  // These are floats, actual money amounts
  balance: number;
  credit: number;
  prepayment: number;
  pending_costs: number;
};

@Injectable()
export class AdminService {
  private readonly proxycurlBaseUrl: string;
  private readonly proxycurlApiKey: string;
  private readonly brightdataBaseUrl: string;
  private readonly brightdataApiKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly companyService: CompanyService,
    private readonly locationService: LocationService,
  ) {
    this.proxycurlBaseUrl = this.config.get<string>('PROXYCURL_BASE_URL') || '';
    this.proxycurlApiKey = this.config.get<string>('PROXYCURL_API_KEY') || '';
    this.brightdataBaseUrl =
      this.config.get<string>('BRIGHTDATA_BASE_URL') || '';
    this.brightdataApiKey = this.config.get<string>('BRIGHTDATA_API_KEY') || '';
  }

  async getProxyCurlBalance(): Promise<number> {
    if (!this.proxycurlBaseUrl || !this.proxycurlApiKey) {
      throw new Error('ProxyCurl base URL or API key is not set');
    }

    const response = await fetch(`${this.proxycurlBaseUrl}/credit-balance`, {
      headers: {
        Authorization: `Bearer ${this.proxycurlApiKey}`,
      },
    });
    let balance = 0;

    try {
      const data = (await response.json()) as ProxyCurlBalanceResponse;
      balance = data.credit_balance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error fetching ProxyCurl balance: ${errorMessage}`);
    }

    return balance;
  }

  async getBrightDataBalance(): Promise<number> {
    if (!this.brightdataBaseUrl || !this.brightdataApiKey) {
      throw new Error('BrightData base URL or API key is not set');
    }

    const response = await fetch(`${this.brightdataBaseUrl}/customer/balance`, {
      headers: {
        Authorization: `Bearer ${this.brightdataApiKey}`,
      },
    });
    let balance = 0;

    try {
      const data = (await response.json()) as BrightDataBalanceResponse;
      balance = data.balance - data.pending_costs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error fetching BrightData balance: ${errorMessage}`);
    }

    return balance;
  }

  async mergeCompanies(mergeCompaniesDto: MergeCompaniesDto) {
    const { companyIds, mergeIntoCompanyId } = mergeCompaniesDto;

    // Move the roles from the companies to the new company
    await Promise.all(
      companyIds.map((companyId) =>
        this.companyService.moveRoles(companyId, mergeIntoCompanyId),
      ),
    );

    // Delete the companies
    await Promise.all(
      companyIds.map((companyId) => this.companyService.delete(companyId)),
    );

    return;
  }

  async mergeLocations(mergeLocationsDto: MergeLocationsDto) {
    const { locationIds, mergeIntoLocationId } = mergeLocationsDto;

    // Move the roles from the locations to the new location
    await Promise.all(
      locationIds.map((locationId) =>
        this.locationService.moveRoles(locationId, mergeIntoLocationId),
      ),
    );

    // Delete the locations
    await Promise.all(
      locationIds.map((locationId) => this.locationService.delete(locationId)),
    );

    return;
  }
}
