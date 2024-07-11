import { Coffee } from "src/coffees/entities/coffee.entity";
import { Flavour } from "src/coffees/entities/flavour.entity";
import { CoffeeRefactor1720453515723 } from "src/migrations/1720453515723-CoffeeRefactor";
import { SchemaSync1720455348113 } from "src/migrations/1720455348113-SchemaSync";
import { RevertCoffeeTitle1720456078441 } from "src/migrations/1720456078441-RevertCoffeeTitle";
import { DataSource } from "typeorm";

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'pass123',
    database: 'postgres',
    entities: [Coffee, Flavour],
    migrations: [
        CoffeeRefactor1720453515723,
        SchemaSync1720455348113,
        RevertCoffeeTitle1720456078441
    ]
});