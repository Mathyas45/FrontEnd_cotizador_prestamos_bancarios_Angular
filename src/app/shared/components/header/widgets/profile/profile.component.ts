import { Component } from '@angular/core';

import { profile } from '../../../../data/header';
import { FeatherIconComponent } from "../../../ui/feather-icon/feather-icon.component";

@Component({
  selector: 'app-profile',
  imports: [FeatherIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

export class ProfileComponent {

  public profile = profile;

}
