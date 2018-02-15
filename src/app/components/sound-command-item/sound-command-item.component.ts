import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {ElectronService} from '../../providers/electron.service';
import {RecorderService} from '../../services/recorder.service';
import * as electron from 'electron';
const store = electron.remote.require('electron-settings');

@Component({
  selector: 'app-sound-command-item',
  template: `
    <div class="row">
      <div class="col m2 command">
        {{command.command}}
      </div>
      <div class="col s4 description">
        {{command.description}}
      </div>
      <div class="col s1 play-button-container">
        <a
          class="btn-floating waves-effect btn-small"
          (click)="play()"
          matTooltip="Play command"
          matTooltipPosition="after"
        ><i class="material-icons left">play_arrow</i></a>
      </div>
      <div class="col s3 hotkey-display"><strong>{{ hotkey }}</strong></div>
      <div class="col s1 record-hotkey-container">
        <a
          class="btn-floating waves-effect btn-small white"
          (click)="recordHotkey()"
          matTooltip="Record Hotkey"
          matTooltipPosition="before"
        ><i class="material-icons left icon-red">fiber_manual_record</i></a>
      </div>
      <div class="col s1 delete-hotkey-container">
        <a
          [ngClass]="{'disabled': !hotkey}"
          (click)="deleteHotkey()"
          matTooltip="Remove Hotkey"
          matTooltipPosition="before"
          class="btn-floating wave-effect btn-small"
        ><i class="material-icons left">delete_forever</i></a>
      </div>
    </div>
  `,
  styles: [`
    .row {
      margin:0;
    }
    .btn-small {
      width: 30px;
      height: 30px;
    }
    .material-icons {
      font-size: 18px;
      line-height: 30px;
    }
    .icon-red {
      color: red;
    }
  `],
  providers: [
    HttpService,
    ElectronService,
    RecorderService
  ]
})
export class SoundCommandItemComponent implements OnInit, OnDestroy {
  @Input() command: any;
  @Input() guild: any;

  @Output() toastEvent = new EventEmitter<object>();
  @Output() recordEvent = new EventEmitter<object>();
  hotkey; string;
  data;

  constructor(private httpService: HttpService,
              private electronService: ElectronService,
              private recorder: RecorderService) { }

  ngOnInit() {
    this.electronService.ipcRenderer.on('register-hotkey-response-' + this.command.command, (event, data) => {
      if (data.error) {
        this.showToast(data.error, 4000, 'red');
        return;
      }
      this.data = data;
      const names = this.recorder.getNamesFromKeys(data.keys, 'de');
      this.hotkey = names ? names.join(' + ') : '';
    });

    this.electronService.ipcRenderer.on('shortcut-called-' + this.command.command, (event, data) => {
      this.play();
    });

    this.electronService.ipcRenderer.on('unregister-hotkey-response-' + this.command.command, (event, data) => {
      if (data.error) {
        this.showToast(data.error, 4000, 'red');
        return;
      }
      this.hotkey = null;
      this.showToast('Unregistered hotkey for ' + data.command, 4000, 'red');
    });


    this.electronService.ipcRenderer.send('register-hotkey', {
      command: this.command.command,
      automated: true
    });

  }

  ngOnDestroy(): void {
    this.electronService.ipcRenderer.removeAllListeners('register-hotkey-response-' + this.command.command);
    this.electronService.ipcRenderer.removeAllListeners('unregister-hotkey-response-' + this.command.command);
    this.electronService.ipcRenderer.removeAllListeners('shortcut-called-' + this.command.command);
  }

  recordHotkey() {
    // this.hotkey = 'Test+Baum';
    this.recordEvent.emit((result: any) => {
      this.electronService.ipcRenderer.send('register-hotkey', {
        command: this.command.command,
        keys: result,
        names: this.recorder.getNamesFromKeys(result, 'electron_us'),
      });
    });
  }

  deleteHotkey() {
    this.electronService.ipcRenderer.send('unregister-hotkey', this.data)
  }

  play() {
    const name = encodeURIComponent(this.command.command);
    this.httpService.call('POST',
      `http://bot.glowtrap.de:3232/guilds/soundcommands/play?guildId=${this.guild.id}&soundcommand=${name}`,
      {})
      .subscribe(
        data => {
          this.showToast(data['message'], 4000, 'green');
        },
        error => {
          this.showToast(error.error, 4000, 'red');
        });
  }

  showToast(message: string, delay: number, style: string = null) {
    this.toastEvent.emit({message: message, delay: delay, style: style});
  }

}
