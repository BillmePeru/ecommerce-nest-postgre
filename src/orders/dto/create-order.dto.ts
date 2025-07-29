export class OrderItemDto {
  productId: number;
  quantity: number;
  discount?: number;
  notes?: string;
}

export class AddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class CreateOrderDto {
  customerId: number;
  items: OrderItemDto[];
  shippingAddress: AddressDto;
  billingAddress?: AddressDto;
  shipping?: number;
  discount?: number;
  notes?: string;
}
