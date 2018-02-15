import { Injectable } from '@angular/core';
import * as electron from 'electron';
import {HttpClient} from '@angular/common/http';
import {ElectronService} from '../providers/electron.service';
const store = electron.remote.require('electron-settings');

@Injectable()
export class HttpService {

  constructor(private httpClient: HttpClient, private electronService: ElectronService) { }

  verifyToken(callback) {
    this.httpClient.request('GET', 'http://bot.glowtrap.de:3232/verify_token', {
      headers: {
        Authorization: 'Basic ' + store.get('token')
      }
    }).subscribe(
      data => {
        console.log(data);
        if (!data || !data['status'] || !(data['status'] === 'ok')) {
          callback(false);
        } else {
          callback(true);
        }
      },
      error => {
        console.error(error);
        callback(false);
      });
  }

  call(method: string = 'GET', url: string, options: object) {
    if (!options) {
      options = {};
    }
    if (!options['headers']) {
      options['headers'] = {};
    }
    options['headers']['Authorization'] = 'Basic ' + store.get('token');
    return this.httpClient.request(method, url, options);
  }

  handleUnauthorized() {
    this.electronService.ipcRenderer.send('logout');
  }
}
