import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { OrderDetailsProduct } from '../interface/order';
import { orderDetails } from '../data/order';

@Injectable({
  providedIn: 'root'
})

export class CartService {

  public cartItems: OrderDetailsProduct[] = orderDetails.products;

  constructor(private toast: ToastrService) {

    const items = localStorage.getItem('cart');
    if (items && items !== 'null' && items !== '' && JSON.parse(items).length > 0) {
      this.cartItems = JSON.parse(items);
    } else {
      this.cartItems = orderDetails.products;
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }

  updateQuantity(value: number, item: OrderDetailsProduct) {
    if(value == -1) {
      item.quantity -= 1;
      if(item.quantity < 1) {
        this.deleteCartItem(item)
      }
    } else if(value == 1) {
      if(item.quantity < item.total_quantity) {
        item.quantity += 1;
      } else {
        this.toast.error(`Cannot add more than ${item.total_quantity} items`,'',{
          timeOut: 3000
        });
      }
    }
  }

  deleteCartItem(item: OrderDetailsProduct) {
    this.cartItems = this.cartItems.filter((product) => product.id !== item.id);
    localStorage.setItem('cart', JSON.stringify(this.cartItems))
  }

  clearCart() {
    this.cartItems = [];
    localStorage.setItem('cart', JSON.stringify(this.cartItems))
  }

  getSubTotal() {
    if(this.cartItems) {
      const subTotal = this.cartItems.reduce((acc, item) => {
        const price = item.discount_price ? item.discount_price : item.price || 0;
        const quantity = item.quantity || 0;
        return acc + (price * quantity);
      }, 0)

      return `$${subTotal.toFixed(2)}`
    }
  }
}
