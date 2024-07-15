import { Injectable, Module, Scope } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavour } from './entities/flavour.entity';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { Connection } from 'typeorm';

class ConfigService {}
class DevelopmentConfigService {} // is a ConfigService
class ProducitionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
    create() {
        /** do something here */
        return ['buddy brew', 'nescafe', 'shaws beans'];
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Coffee, Flavour, Event])],
    controllers: [CoffeesController],
    //providers: [CoffeesService], // regular injection
    providers: [ 
        CoffeesService,
        CoffeeBrandsFactory,
        // useValue example
        // { 
        //     provide: COFFEE_BRANDS,
        //     useValue: ['buddy brew', 'nescafe']
        // },
        {
            provide: COFFEE_BRANDS,
            useFactory: async (connection: Connection): Promise<string[]> => {
                const coffeeBrands = await Promise.resolve(['buds brew', 'Nicks coffee']);
                console.log('Async factory!');
                return coffeeBrands;
            },
            scope: Scope.TRANSIENT
        },
        // { 
        //     provide: COFFEE_BRANDS,
        //     useFactory: (brandsFactory: CoffeeBrandsFactory) => brandsFactory.create(),
        //     inject: [CoffeeBrandsFactory],
        // },
        {
            provide: ConfigService,
            useClass: process.env.NODE_ENV === 'development' ? DevelopmentConfigService : ProducitionConfigService
        },
    ],
    exports: [CoffeesService] // exposes 'public' service
})
export class CoffeesModule {}
