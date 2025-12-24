import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LogoComponent } from "../header/widgets/logo/logo.component";
import { FeatherIconComponent } from "../ui/feather-icon/feather-icon.component";
import { SvgIconComponent } from "../ui/svg-icon/svg-icon.component";
import { Menu } from '../../interface/menu';
import { LayoutService } from '../../services/layout.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule,  TranslatePipe,
            LogoComponent, FeatherIconComponent, SvgIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent implements OnInit, OnDestroy {

  public menuItems: Menu[] = [];
  public leftArrow: boolean = false;
  public rightArrow: boolean = true;
  public pinedItem: Menu[] = [];
  
  private menuSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router, 
    public layoutService: LayoutService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Suscribirse al menú dinámico filtrado por permisos
    this.menuSubscription = this.menuService.menu$.subscribe(menuItems => {
      this.menuItems = menuItems;
      this.setupRouterEvents();
    });
  }

  ngOnDestroy(): void {
    this.menuSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private setupRouterEvents(): void {
    // Limpiar suscripción anterior si existe
    this.routerSubscription?.unsubscribe();
    
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const urlTree = this.router.parseUrl(event.url);
        const cleanPath = '/' + urlTree.root.children['primary']?.segments.map(segment => segment.path).join('/');

        this.menuItems.filter(items => {
          if (items.path === cleanPath) {
            this.setNavActive(items);
          }
          if (!items.children) { return false; }
          items.children.filter(subItems => {
            if (subItems.path === cleanPath) {
              this.setNavActive(subItems);
            }
            if (!subItems.children) { return false; }
            subItems.children.filter(subSubItems => {
              if (subSubItems.path === cleanPath) {
                this.setNavActive(subSubItems);
              }
            });
          });
        });
      }
    });
  }  

  setNavActive(items: Menu) {
    this.menuItems.filter(menuItem => {
      if (menuItem !== items) {
        menuItem.active = false;
      } else {
        menuItem.active = true;
        setTimeout(() => {
          this.scroll(items)
        }, 2000);
      }
      
      
      if (menuItem.children && menuItem.children.includes(items)) {
        menuItem.active = true;
        setTimeout(() => {
          this.scroll(menuItem)
        }, 2000);
      }

      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(items)) {
            menuItem.active = true;
            submenuItems.active = true;
            setTimeout(() => {
              this.scroll(menuItem)
            }, 2000);
          }
        });
      }
    });
  }

  toggleMenu(item: Menu) {
    if (!item.active) {
      this.menuItems.forEach((menu) => {
        if (this.menuItems.includes(item)) {
          menu.active = false
        }
        if (!menu.children) {
          return false;
        }

        menu.children.forEach((subMenu) => {
          if (menu.children?.includes(item)) {
            subMenu.active = false
          }

          if (subMenu.children) {
            subMenu.children.forEach((details) => {
              if (subMenu.children?.includes(item)) {
                details.active = false;
              }
            })
          }
        })
      })
    }
    item.active =! item.active;
  }

  scrollLeft() {
    this.rightArrow = true;
    if (this.layoutService.margin != 0) {
      this.layoutService.margin = this.layoutService.margin + 500;
    }

    if (this.layoutService.margin == 0) {
      this.leftArrow = false;
    }
  }

  scrollRight() {
    this.leftArrow = true;
    if (this.layoutService.margin != this.layoutService.scrollMargin) {
      this.layoutService.margin = this.layoutService.margin - 500;
    }
    if (this.layoutService.margin == this.layoutService.scrollMargin) {
      this.rightArrow = false;
    }
  }

  closeSidebar() {
    this.layoutService.closeSidebar = true;
  }

  pined(item: Menu) {
    if (!item.pined) {
      this.menuItems.filter((details) => {
        if (details.title) {
          if (this.menuItems.includes(item)) {
            item.pined = true;
            if (!this.pinedItem.includes(item)) {
              this.pinedItem.push(item);
            }
          }
        }
      })
    } else {
      item.pined = false;
      this.pinedItem.splice(this.pinedItem.indexOf(item), 1)
    }

    this.scroll(item)
  }

  scroll(item: Menu) {
    if(item && item.id) {
      const scrollDiv = document.getElementById(item.id);
      if(scrollDiv) {
        setTimeout(() => {
          scrollDiv.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100);
      }
    }
  }

}
