import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products or filter by category' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter products by category',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
    type: [Product],
  })
  async findAll(@Query('category') category?: string): Promise<Product[]> {
    if (category) {
      return this.productService.findByCategory(category);
    }
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ description: 'Product data', type: Product })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Invalid product data' })
  async create(@Body() productData: Partial<Product>): Promise<Product> {
    return this.productService.create(productData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ description: 'Product data to update', type: Product })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Partial<Product>,
  ): Promise<Product | null> {
    return this.productService.update(id, productData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.productService.delete(id);
    return { success: result };
  }

  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update product inventory' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ description: 'Inventory update data', type: UpdateInventoryDto })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<Product | null> {
    return this.productService.updateInventory(id, updateInventoryDto.quantity);
  }
}
