import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LayoutService {

  public closeSidebar: boolean = true;
  public fullScreen: boolean = false;
  public isLanguage: boolean = false; // Indica si el idioma está activo
  public isSearchOpen: boolean = false;
  public margin: number = 0;
  public scrollMargin: number = -4500;

  public config  = {
    settings: {
      layout_type: 'ltr',
      layout_version: 'light-only',
      sidebar_type: 'compact-wrapper',
      icon: "stroke-svg",
      layout: ''
    },
    color: {
      primary: '#7366ff',//purple
      secondary: '#838383',//gray
    },
  };
}
