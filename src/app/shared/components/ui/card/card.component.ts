import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

  @Input() cardClass: string;
  @Input() cardBodyClass: string;
  @Input() headerTitle: string | number;
  @Input() padding: boolean = true;
  @Input() headerClass: string = '';
  @Input() header: string = '';
  @Input() border: boolean = false;

}
