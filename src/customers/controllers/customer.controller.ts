import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { CustomerService } from '../services/customer.service';
import { Customer } from '../entities/customer.entity';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with optional filters' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (true/false)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by customer name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers retrieved successfully',
    type: [Customer],
  })
  async findAll(
    @Query('active') active?: string,
    @Query('name') name?: string,
  ): Promise<Customer[]> {
    if (active === 'true') {
      return this.customerService.findActiveCustomers();
    }

    if (name) {
      return this.customerService.findByName(name);
    }

    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.customerService.findById(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a customer by email' })
  @ApiParam({ name: 'email', description: 'Customer email address' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findByEmail(@Param('email') email: string): Promise<Customer> {
    return this.customerService.findByEmail(email);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({ description: 'Customer data', type: Customer })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: Customer,
  })
  @ApiResponse({ status: 400, description: 'Invalid customer data' })
  async create(@Body() customerData: Partial<Customer>): Promise<Customer> {
    return this.customerService.create(customerData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiBody({ description: 'Customer data to update', type: Customer })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: Partial<Customer>,
  ): Promise<Customer | null> {
    return this.customerService.update(id, customerData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.customerService.delete(id);
    return { success: result };
  }
}
