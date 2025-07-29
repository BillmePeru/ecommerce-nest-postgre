import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating product inventory
 */
export class UpdateInventoryDto {
  @ApiProperty({
    description: 'The new inventory quantity for the product',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}
