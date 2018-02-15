import {Component, OnInit} from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import * as electron from 'electron';
import {HttpService} from './services/http.service';
const store = electron.remote.require('electron-settings');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  authChecked = false;
  authenticated = false;



  updating = false;
  progress = {};



  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    private httpService: HttpService) {

    translate.setDefaultLang('en');

    if (electronService.isElectron()) {
      console.log('Mode electron');
      // Check if electron is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.ipcRenderer);
      // Check if nodeJs childProcess is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit(): void {

    this.httpService.verifyToken(authenticated => {
      this.authenticated = authenticated;
      this.authChecked = true;
    });

    this.electronService.ipcRenderer.on('logout', () => {
      console.log('logout');
      this.authenticated = false;
    });

    this.electronService.ipcRenderer.on('update', (event, data) => {
      if (data && data.message) {
        if (data.message === 'update') {
          this.updating = true;
        } else if (data.message === 'progress') {
          this.progress = data.progress;
        }
      }
    });
  }
}
