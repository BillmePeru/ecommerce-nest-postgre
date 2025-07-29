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
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with optional filters' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Filter by order status',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders retrieved successfully',
    type: [Order],
  })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Order[]> {
    if (status) {
      return this.orderService.findByStatus(status);
    }

    if (customerId) {
      return this.orderService.findByCustomerId(+customerId);
    }

    if (startDate && endDate) {
      return this.orderService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
    }

    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ description: 'Order data', type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    description: 'New order status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OrderStatus) },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ): Promise<Order | null> {
    return this.orderService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Order | null> {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const result = await this.orderService.delete(id);
    return { success: result };
  }

  @Patch(':id/confirm-payment')
  @ApiOperation({ summary: 'Confirm payment for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmPayment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Order | null> {
    return this.orderService.confirmPayment(id);
  }
}
