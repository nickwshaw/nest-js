import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { REQUEST } from '@nestjs/core';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('coffees')
export class CoffeesController {
    constructor(
      private readonly coffeeService: CoffeesService,
      @Inject(REQUEST) private readonly request: Request,
    ) {
      console.log('Controller constructed');
    }

    @Public()
    @Get()
    // Example using underlying (Express) response object
    // findAll(@Res() response) {
    //     response.status(200).send('This acion returns all coffees');
    // }
    async findAll(@Query() paginationQuery: PaginationQueryDto) {
      //const { limit, offset } = paginationQuery;
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.coffeeService.findAll(paginationQuery);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
      const coffee = this.coffeeService.findOne(id);
      if (!coffee) {
        throw new NotFoundException(`Coffee #${id} not found`);
      }
      return coffee;
    }

    @Post()
    create(@Body() createCoffeeDto: CreateCoffeeDto) {
      console.log(createCoffeeDto instanceof CreateCoffeeDto);
      console.log(createCoffeeDto);
      return this.coffeeService.create(createCoffeeDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
      return this.coffeeService.update(id, updateCoffeeDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
      return this.coffeeService.remove(id);
    }
}
