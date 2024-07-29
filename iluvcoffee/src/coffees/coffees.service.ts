import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavour } from './entities/flavour.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';
 

@Injectable({ scope: Scope.REQUEST })
export class CoffeesService {
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavour)
        private readonly flavourRepository: Repository<Flavour>,
        private readonly dataSource: DataSource,
        @Inject(COFFEE_BRANDS) coffeeBrands: string[],
        @Inject(coffeesConfig.KEY)
        private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    ) {
        //const coffeesConfig = this.configService.get('coffees');
        console.log(`Cofffees config: ${coffeesConfiguration.foo}`) // logs on request.
    }
    

    findAll(paginationQuery: PaginationQueryDto) {
        return this.coffeeRepository.find({
            relations: {
                flavours: true,
            },
            skip: paginationQuery.offset,
            take: paginationQuery.limit
        });
    }
    
    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({
            where: {
                id: +id
            },
            relations: {
                flavours: true,
            }
        });
        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
        console.log(createCoffeeDto instanceof CreateCoffeeDto)
        const flavours = await Promise.all(
            createCoffeeDto.flavours.map(name => this.preloadFlavourByName(name)),
        );
        const coffee = this.coffeeRepository.create({
            ...createCoffeeDto,
            flavours
        });
        return this.coffeeRepository.save(coffee);
    }

   async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const flavours = updateCoffeeDto.flavours &&
        (await Promise.all(
            updateCoffeeDto.flavours.map(name => this.preloadFlavourByName(name)),
        ));
        const coffee = await this.coffeeRepository.preload({
            id: +id,
            ...updateCoffeeDto,
            flavours
        });
        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.save(coffee);
    }

    async remove(id: string) {
        const coffee = await this.findOne(id);
        return this.coffeeRepository.remove(coffee);
    }

    async reccomendCoffee(coffee: Coffee) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        coffee.recommendations++;

        const recommendedEvent = new Event();
        
        recommendedEvent.name = 'recommend_coffee';
        recommendedEvent.type = 'coffee';
        recommendedEvent.payload = { coffeeId: coffee.id };

        await queryRunner.manager.save(coffee);
        await queryRunner.manager.save(recommendedEvent);

        try {
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release()
        }
    }

    private async preloadFlavourByName(name: string): Promise<Flavour> {
        const exsitingFlavour = await this.flavourRepository.findOne({
            where: { name },
        });
        if (exsitingFlavour) {
            return exsitingFlavour;
        }
        return this.flavourRepository.create({ name });
    }
}
