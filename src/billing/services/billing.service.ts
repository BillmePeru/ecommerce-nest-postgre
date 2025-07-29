/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { BillingRepository } from '../repositories/billing.repository';
import { Order } from 'src/orders/entities/order.entity';
import { IBillingBillme, IBillmeResponse } from 'src/common/interfaces/billme';
import { TypeDocument } from 'src/customers/entities/customer.entity';
import * as dayjs from 'dayjs';
import {
  CodeTypeBilling,
  Currency,
  PaymentMethod,
} from 'src/common/interfaces/billing';
import { getIgv, getPriceWithIgv } from 'src/shared/functions';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly billingRepository: BillingRepository) {}

  getCodeTypeDocument(typeDocument: TypeDocument) {
    switch (typeDocument) {
      case 'RUC':
        return '6';
      case 'DNI':
        return '1';
      case 'CE':
        return '4';
      default:
        return '6';
    }
  }

  sendBilling(order: Order) {
    try {
      const payload: IBillingBillme = {
        cliente: {
          codigoTipoDocumento: this.getCodeTypeDocument(
            order.customer.typeDocument,
          ),
          numDocumento: order.customer.numberDocument,
          razonSocial: order.customer.fullName,
          ciudad: order.billingAddress.city,
          distrito: order.billingAddress.state,
          provincia: order.billingAddress.state,
          direccion: order.billingAddress.street,
          ubigeo: order.billingAddress.postalCode,
        },
        emisor: {
          razonSocial: process.env.COMPANY_NAME!,
          nombreComercial: process.env.COMPANY_NAME_COMERCIAL!,
          codigoTipoDocumento: '6',
          numDocumento: process.env.COMPANY_DOCUMENT_NUMBER!,
          ciudad: process.env.COMPANY_CITY!,
          distrito: process.env.COMPANY_STATE!,
          provincia: process.env.COMPANY_STATE!,
          direccion: process.env.COMPANY_ADDRESS!,
          ubigeo: process.env.COMPANY_UBIGEO!,
          sucursal: process.env.COMPANY_BRANCH ?? '000',
        },
        tipoOperacion: '010',
        serie: 'F001',
        correlativo: '0001',
        fechaEmision: dayjs(new Date()).format('YYYY-MM-DD'),
        horaEmision: dayjs(new Date()).format('HH:mm:ss'),
        fechaVencimiento: dayjs(new Date()).format('YYYY-MM-DD'),
        codigoTipoOperacion: '0101',
        codigoTipoDocumento: CodeTypeBilling.FACTURA,
        moneda: Currency.SOLES,
        montoCredito: 0,
        formaPago: PaymentMethod.CONTADO,
        igv: order.tax,
        icbper: 0,
        cuotas: [],
        productos: order.items.map((item) => {
          return {
            id: item.product.sku,
            codigoUnidad: 'NIU',
            nombre: item.product.name,
            unidades: item.quantity,
            moneda: Currency.SOLES,
            precioUnitario: item.price,
            precioLista: getPriceWithIgv(item.price),
            montoSinImpuesto: item.price,
            montoImpuestos: getIgv(item.price),
            montoTotal: item.price * item.quantity,
            montoIcbper: 0,
            factorIcbper: 0.5,
            montoDescuento: 0,
            codigoTipoPrecio: '01',
            impuestos: [
              {
                monto: getIgv(item.price),
                idCategoria: 'S',
                porcentaje: 18,
                codigoAfectacionIgv: '10',
                codigoTributo: '1000',
                nombreTributo: 'IGV',
                codigoInterTributo: 'VAT',
              },
            ],
            codigoClasificacion: '10123123',
          };
        }),
        totales: {
          totalOpExoneradas: 0,
          totalOpInafectas: 0,
          totalOpGravadas: order.items.reduce(
            (acc, item) => Number(acc) + Number(item.price),
            0,
          ),
          totalImpuestos: order.tax,
          totalSinImpuestos: order.total - order.tax,
          totalConImpuestos: order.total,
          totalPagar: order.total,
          totalDescuentoGlobal: 0,
          totalDescuentoProductos: order.items.reduce(
            (acc, item) => Number(acc) + Number(item.discount),
            0,
          ),
        },
      };

      const urlBillme = process.env.BILLME_API_URL!;
      const tokenBillme = process.env.BILLME_API_KEY!;

      fetch(urlBillme + '/EnviarBoletaFactura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: tokenBillme,
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          const result = await response.json();
          const { data } = result;
          const dataResponse: IBillmeResponse = data;

          if (response.status === 400) {
            // Handle 400 status - save error data to database
            this.logger.warn(
              `Billing API returned 400 status: ${JSON.stringify(result)}`,
            );

            await this.billingRepository.create({
              orderId: order.id,
              payload: JSON.stringify(payload),
              description:
                dataResponse.description || 'Error: Bad Request (400)',
              cdrResult: dataResponse.cdrBase64 || '',
              xmlResult: dataResponse.xmlBase64 || '',
              xmlDocument: dataResponse.xmlDocument,
            });

            return;
          }

          if (!response.ok) {
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${JSON.stringify(result)}`,
            );
          }

          // Handle successful response
          this.logger.log(
            `Billing sent successfully: ${JSON.stringify(dataResponse.description)}`,
          );

          await this.billingRepository.create({
            orderId: order.id,
            payload: JSON.stringify(payload),
            description:
              dataResponse.description ?? 'Billing processed successfully',
            cdrResult: dataResponse.cdrBase64 ?? '',
            xmlResult: dataResponse.xmlBase64 ?? '',
            xmlDocument: dataResponse.xmlDocument ?? '',
          });
        })
        .catch(async (error) => {
          this.logger.error(
            `Failed to send billing: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof Error ? error.stack : undefined,
          );

          // Save error information to database for debugging
          try {
            await this.billingRepository.create({
              orderId: order.id,
              payload: JSON.stringify(payload),
              description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              cdrResult: '',
              xmlResult: '',
              xmlDocument: '',
            });
          } catch (dbError) {
            this.logger.error(
              `Failed to save billing error to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
            );
          }
        });
    } catch (error) {
      this.logger.error(
        `Failed to create billing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
