import { Module } from '@nestjs/common';
import { AlumniModule } from './alumni/alumni.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { BrightdataModule } from './brightdata/brighdata.module';
import { BullModule } from '@nestjs/bull';
import { ExtractionsModule } from './extractions/extractions.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AlumniModule,
    CompanyModule,
    UserModule,
    BrightdataModule,
    ExtractionsModule,
    GeolocationModule,
  ],
})
export class AppModule {}
