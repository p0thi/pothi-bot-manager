import {Injectable, Renderer2} from '@angular/core';
import * as keycodemap from 'keycodemap';

@Injectable()
export class RecorderService {
  recording = false;
  pressedKeys = [];
  lastCalled = [];
  callback;

  constructor(private renderer: Renderer2) { }

  record(callback) {
    if (this.recording) {
      return;
    }
    this.recording = true;
    this.pressedKeys = [];
    this.lastCalled = [];
    this.callback = callback;

    const keydown = this.renderer.listen('window', 'keydown', event => {
      event.preventDefault();

      let alreadyPresent = false;
      for (let i = 0; i < this.pressedKeys.length; i++) {
        if (this.pressedKeys[i] === event.which) {
          alreadyPresent = true;
          break;
        }
      }
      if (!alreadyPresent) {
        this.pressedKeys.push(event.which);
      }
      if (!(this.pressedKeys.length === this.lastCalled.length)) {
        this.lastCalled = this.pressedKeys.slice();
        this.callback(this.pressedKeys, false);
      }
    });

    const keyup = this.renderer.listen('window', 'keyup', event => {
      keydown();
      keyup();
      this.recording = false;
      this.callback(this.pressedKeys, true);
    });
  }

  getNamesFromKeys(keys, location) {
    console.log('keys:');
    if (location) {
      keycodemap.setMap(location);
    }
    const names = new Set();
    for (let i = 0; i < keys.length; i++) {
      const name = keycodemap.map(keys[i]);
      if (name === '' || name === undefined) {
        keys.splice(i, 1);
        i--;
      } else {
        names.add(name);
      }
    }
    return Array.from(names);
  }

}
