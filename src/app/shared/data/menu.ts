import { BehaviorSubject } from "rxjs";
import { Menu } from "../interface/menu";


export const menuItems: Menu[] = [
  {
    main_title: 'pages'
  },
  {
    path: '/sample-page',
    id: 'sample-page',
    title: 'sample_page',
    icon: 'sample-page',
    type: 'link',
    bookmark: true,
    level: 1,
  },
  {
    id: 'sample-pages',
    title: 'sample_pages',
    icon: 'sample-page',
    type: 'sub',
    level: 1,
    children: [
      {
        path: '/pages/sample-page-1',
        id: 'sample-page1',
        title: 'sample_page_1',
        icon: 'sample-page',
        type: 'link',
        level: 2,
      },
      {
        path: '/pages/sample-page-2',
        id: 'sample-page2',
        title: 'sample_page_2',
        icon: 'sample-page',
        type: 'link',
        level: 2,
      },
    ]
  },
  // ========================================
  // MÓDULO DE CLIENTES
  // ========================================
  {
    main_title: 'management'
  },
  {
    path: '/clientes',
    id: 'clientes',
    title: 'Clientes',
    icon: 'user',
    type: 'link',
    bookmark: true,
    level: 1,
  },
  // ========================================
  // MÓDULO DE SOLICITUD DE PRÉSTAMOS
  // ========================================
  {
    path: '/solicitud-prestamos',
    id: 'solicitud-prestamos',
    title: 'Solicitud de Préstamos',
    icon: 'file', 
    type: 'link',
    bookmark: true,
    level: 1,
  }
]

// Array
export const items = new BehaviorSubject<Menu[]>(menuItems);
