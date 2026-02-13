import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-album-panel',
  imports: [],
  templateUrl: './album-panel.component.html',
  styleUrl: './album-panel.component.css'
})
export class AlbumPanelComponent {
@Input() albumSelected : any;
}
