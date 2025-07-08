import { CompanyService } from '@/company/services/company.service';
import { LocationService } from '@/location/location.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InviteUserDto, MergeCompaniesDto, MergeLocationsDto } from '../dto';
import { UserService } from '@/user/services/user.service';
import { InviteEntity } from '@/user/entities/invite.entity';

type AlumniExtractBalanceResponse = {
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
  // URLs & API Keys from the scraping services
  private readonly alumniExtractBaseUrl: string;
  private readonly alumniExtractApiKey: string;
  private readonly brightdataBaseUrl: string;
  private readonly brightdataApiKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly companyService: CompanyService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
  ) {
    this.alumniExtractBaseUrl =
      this.config.get<string>('ALUMNI_EXTRACT_BASE_URL') || '';
    this.alumniExtractApiKey =
      this.config.get<string>('ALUMNI_EXTRACT_API_KEY') || '';
    this.brightdataBaseUrl =
      this.config.get<string>('BRIGHTDATA_BASE_URL') || '';
    this.brightdataApiKey = this.config.get<string>('BRIGHTDATA_API_KEY') || '';
  }

  async getAlumniExtractBalance(): Promise<number> {
    if (!this.alumniExtractBaseUrl || !this.alumniExtractApiKey) {
      throw new Error('Alumni Extract base URL or API key is not set');
    }

    const response = await fetch(
      `${this.alumniExtractBaseUrl}/credit-balance`,
      {
        headers: {
          Authorization: `Bearer ${this.alumniExtractApiKey}`,
        },
      },
    );
    let balance = 0;

    try {
      const data = (await response.json()) as AlumniExtractBalanceResponse;
      balance = data.credit_balance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error fetching Alumni Extract balance: ${errorMessage}`);
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

  async inviteUser(inviteUserDto: InviteUserDto): Promise<InviteEntity> {
    const { email } = inviteUserDto;

    // Create a new invite
    const invite = await this.userService.inviteUser(email);

    return invite;
  }
}
