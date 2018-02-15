import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundCommandItemComponent } from './sound-command-item.component';

describe('SoundCommandItemComponent', () => {
  let component: SoundCommandItemComponent;
  let fixture: ComponentFixture<SoundCommandItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoundCommandItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundCommandItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
