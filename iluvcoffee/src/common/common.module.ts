import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Our guard uses the config service so we need to import the ConfigModule.
  providers: [
  {
    provide: APP_GUARD,
    useClass: ApiKeyGuard
  }
]
})
export class CommonModule {}
