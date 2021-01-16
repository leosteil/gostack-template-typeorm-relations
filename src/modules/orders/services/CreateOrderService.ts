import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
    id: string;
    quantity: number;
}

interface IRequest {
    customer_id: string;
    products: IProduct[];
}

@injectable()
class CreateOrderService {
    constructor(
        @inject('OrdersRepository')
        private ordersRepository: IOrdersRepository,

        @inject('ProductsRepository')
        private productsRepository: IProductsRepository,

        @inject('CustomersRepository')
        private customersRepository: ICustomersRepository,
    ) {}

    public async execute({ customer_id, products }: IRequest): Promise<Order> {
        const existCustomer = await this.customersRepository.findById(
            customer_id,
        );

        if (!existCustomer) {
            throw new AppError('Cliente inexistente');
        }

        const existProducts = await this.productsRepository.findAllById(
            products,
        );

        if (!existProducts.length) {
            throw new AppError('Não existem produtos com estes ids');
        }

        const existProductsIds = existProducts.map(product => product.id);

        const checkInexistentProducts = products.filter(
            product => !existProductsIds.includes(product.id),
        );

        if (checkInexistentProducts.length) {
            throw new AppError(`Não foram encontrados todos os produtos`);
        }

        const findProductsWithNoQuantityAvailable = products.filter(
            product =>
                existProducts.filter(p => p.id === product.id)[0].quantity <
                product.quantity,
        );

        if (findProductsWithNoQuantityAvailable.length) {
            throw new AppError('Existem produtos que não tem estoque');
        }

        const serializedProducts = products.map(product => ({
            product_id: product.id,
            quantity: product.quantity,
            price: existProducts.filter(p => p.id === product.id)[0].price,
        }));

        const order = await this.ordersRepository.create({
            customer: existCustomer,
            products: serializedProducts,
        });

        const orderPoductsQuantity = products.map(product => ({
            id: product.id,
            quantity:
                existProducts.filter(p => p.id === product.id)[0].quantity -
                product.quantity,
        }));

        await this.productsRepository.updateQuantity(orderPoductsQuantity);

        return order;
    }
}

export default CreateOrderService;
