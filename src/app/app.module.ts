import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import 'materialize-css';


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { MaterializeModule } from 'angular2-materialize';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from 'app/directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { GuildIconComponent } from './components/guild-icon/guild-icon.component';
import { SoundCommandItemComponent } from './components/sound-command-item/sound-command-item.component';
import { LoginComponent } from './components/login/login.component';
import {HttpService} from './services/http.service';
import { GuildPipe } from './pipes/guild.pipe';
import {RecorderService} from './services/recorder.service';
import { SoundCommandPipe } from './pipes/sound-command.pipe';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    GuildIconComponent,
    SoundCommandItemComponent,
    LoginComponent,
    GuildPipe,
    SoundCommandPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    MaterializeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    HttpService,
    RecorderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
