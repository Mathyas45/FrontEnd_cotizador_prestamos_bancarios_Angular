import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from "../../header/header.component";
import { FooterComponent } from "../../footer/footer.component";
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../ui/breadcrumb/breadcrumb.component';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, BreadcrumbComponent, FooterComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})

export class ContentComponent {

  public layout: string;

  constructor(public layoutService: LayoutService, private route: ActivatedRoute, private router: Router) {

    if(window.innerWidth < 1200){
      this.layoutService.closeSidebar = true;
    }else {
      this.layoutService.closeSidebar = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if(window.innerWidth < 1200){
      this.layoutService.closeSidebar = true;
    }else {
      this.layoutService.closeSidebar = false;
    }
  }
}
