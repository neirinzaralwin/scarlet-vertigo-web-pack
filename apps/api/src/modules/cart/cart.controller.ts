import { Controller, Post, Body, Request, Query, Get, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtPayload } from '../auth/interfaces/jwtPayload.interface';
import { GetCartDto } from './dto/get-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('carts')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post()
    addToCart(@Request() req: { user: JwtPayload }, @Body() addToCartDto: AddToCartDto) {
        const userId = req.user.sub;
        return this.cartService.addToCart(userId, addToCartDto);
    }

    @Get('/me')
    find(@Request() req: { user: JwtPayload }, @Query() getCartDto: GetCartDto) {
        const userId = req.user.sub;
        return this.cartService.findOne(userId, getCartDto);
    }

    @Delete('/remove-all')
    removeAll(@Request() req: { user: JwtPayload }) {
        const userId = req.user.sub;
        return this.cartService.removeAll(userId);
    }

    @Delete('/')
    remove(@Request() req: { user: JwtPayload }, @Query('cartProductId') cartProductId: string) {
        const userId = req.user.sub;
        return this.cartService.remove(userId, cartProductId);
    }
}
