import {Component, HostListener, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-guild-icon',
  template: `
    <div matTooltip="{{guildName || 'Baum'}}" matTooltipPosition="below" class="guild-icon z-depth-2 waves-effect waves-circle waves-light">
      <img
        *ngIf="guildIconImage"
        class="guild-icon-image"
        src="{{guildIconImage}}"
        alt="guild icon"
      >
      <div *ngIf="!guildIconImage"
           class="guild-icon-image"
      >
        {{ guildName.charAt(0).toUpperCase() }}
      </div>
    </div>
  `,
  styles: [`
    .guild-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #e2eaf1;
    }

    .guild-icon-image {
      display: block;
      height: 50px;
      width: 50px;
      margin: auto;
      color: grey;
      font-size: large;
      border-radius: 50%;
      background: #2f3136;
    }
  `]
})
export class GuildIconComponent implements OnInit {
  @Input() guildIconImage: string;
  @Input() guildName: string;
  @Input() guildId: string;

  constructor() { }

  ngOnInit() {
  }

}
