import { Component, OnInit } from '@angular/core';
import * as electron from 'electron';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="row">
        <div class="col s8 offset-s2">
          <div class="card">
            <div class="card-image">
              <img src="assets/img/discordpromo.jpg">
              <a
                class="btn btn-floating btn-large halfway-fab waves-effect waves-light"
                (click)="login()"
              ><i class="material-icons">play_arrow</i></a>
            </div>
            <div class="card-content">
              <p>You have to login with discord.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  login() {
    electron.ipcRenderer.send('discord-oauth');
  }
}
