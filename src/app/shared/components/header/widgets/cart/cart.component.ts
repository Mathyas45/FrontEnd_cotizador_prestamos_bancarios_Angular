import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { CartService } from '../../../../services/cart.service';
import { FeatherIconComponent } from "../../../ui/feather-icon/feather-icon.component";
import { SvgIconComponent } from "../../../ui/svg-icon/svg-icon.component";

@Component({
  selector: 'app-header-cart',
  imports: [CommonModule, SvgIconComponent, FeatherIconComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})

export class CartComponent {

  constructor(public cartService: CartService) {}

}
