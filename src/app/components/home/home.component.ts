import {Component, EventEmitter, OnInit} from '@angular/core';
import {MaterializeAction} from 'angular2-materialize';
import {HttpService} from '../../services/http.service';
import {RecorderService} from '../../services/recorder.service';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    HttpService,
    RecorderService,
    ElectronService
  ]
})
export class HomeComponent implements OnInit {
  dummyGuildData: any;
  materializeAction = new EventEmitter<string|MaterializeAction>();
  activeGuild: object;

  soundCommands: object[];

  toastText: string;
  toastDelay: number;
  toastStyle: string;

  constructor(private httpService: HttpService, private recorder: RecorderService, private electronService: ElectronService) { }

  ngOnInit() {

    this.httpService.call('GET', 'http://bot.glowtrap.de:3232/guilds', {})
      .subscribe(data => {
        this.dummyGuildData = data;
        },
        error => console.error(error));
  }

  showToast(message, delay = 4000, style = null) {
    if (typeof message === 'string') {
      this.toastText = message;
      this.toastDelay = delay;
      this.toastStyle = style;
    } else {
      this.toastText = message['message'];
      this.toastDelay = message['delay'];
      this.toastStyle = message['style'];
    }
    this.materializeAction.emit('toast');
  }

  recordHotkey(finalCallback) {
    this.recorder.record((keys, finished) => {
      const names = this.recorder.getNamesFromKeys(keys, 'de');

      if (finished) {
        finalCallback(keys);
      } else {
        console.log(names.join(' + '));
      }
    });
  }

  guildIconClicked(guild) {
    console.log(guild);
    this.activeGuild = guild;
    this.httpService.call('GET', 'http://bot.glowtrap.de:3232/guilds/soundcommands?guildId=' + guild.id, {})
      .subscribe(
        (data: object[]) => {
          console.log(data);
          this.soundCommands = data;
        }
      );
  }

  logout() {
    this.electronService.ipcRenderer.send('logout');
  }

}
